#!/usr/bin/env node
// Videos por caso E2E de un plan (plan `plan-demo-videos`).
//
//   demo-videos.mjs captions <spec>
//       test-walkthrough.md → <spec>/videos/.work/captions.json. Falla si una
//       casilla con `▶ [video]` no trae su línea 🎬, si un subtítulo pasa de 90
//       caracteres o lleva markdown, si falta el actor o si un ID se repite.
//   demo-videos.mjs cut <spec>
//       Marcas + videos crudos de <spec>/videos/.work/raw → un
//       <spec>/videos/E2E-n.mp4 por caso que pasó, con portada de 2 s, y enlaza
//       cada clip en su casilla de test-walkthrough.md (▶ [video](...)). Sale
//       con 1 si un caso esperado falló o quedó sin marcas.
//   demo-videos.mjs check <spec>
//       Compara los clips con las hojas de diagrams/walkthrough-*.mmd y comprueba
//       con ffprobe que cada clip se pueda reproducir.
//
// Necesita Node >= 22.18 (importa el DemoTestId del kit, escrito en TypeScript),
// ffmpeg y ffprobe. Sin dependencias de npm.

import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { basename, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

let DemoTestId;

try {
  ({ DemoTestId } = await import(
    new URL(
      "../kits/cypress-demo/cypress/support/demo/demo-test-id.ts",
      import.meta.url,
    )
  ));
} catch (error) {
  throw new Error(
    `demo-videos.mjs necesita Node >= 22.18 (importa el kit en TypeScript): ${error.message}`,
  );
}

const CAPTION_MAX_LENGTH = 90;
const CLIP_MARGIN_SECONDS = 0.3;
// Tras la primera carga de la app el navegador tarda ~0,3 s en pintarla (medido); hasta
// entonces se ve la pantalla de Cypress. Se espera un poco más por si la máquina va lenta.
const READY_PAINT_SECONDS = 0.5;
const COVER_SECONDS = 2;
const COVER_WRAP_WIDTH = 46;
const ACTOR_SEPARATOR = " · actor: ";
const FRAME_RATE = 25;
const SUBTITLE_LINE_HEIGHT = 54;

const MarkKind = Object.freeze({ Start: "start", End: "end", Ready: "ready" });

const SkipReason = Object.freeze({
  Failed: "failed",
  NoTestId: "sin E2E-n",
  NoCaption: "sin 🎬",
  NoStart: "sin marca de inicio",
  NoEnd: "sin marca de fin",
});

// Un caso con estos motivos debía tener clip y no lo tiene: el corte sale con 1.
const BLOCKING_REASONS = Object.freeze([
  SkipReason.Failed,
  SkipReason.NoStart,
  SkipReason.NoEnd,
]);

const HEADING_PATTERN = /^#{1,6}\s+(.*)$/;
const CHECKBOX_PATTERN = /^- \[[ xX]\] (E2E-\d+)\b/;
const CAPTION_LINE_PATTERN = /^\s+- 🎬 (.*)$/;
const INDENTED_PATTERN = /^\s+\S/;
const MARKDOWN_PATTERN = /(\*\*|__|`|\[[^\]]*\]\()/;
const VIDEO_LINK = "▶ [video]";
// Solo cuenta como enlace el real, con su destino: una casilla que explica la
// sintaxis en prosa («`▶ [video]` sin 🎬») no es un enlace.
const VIDEO_LINK_PATTERN = /▶ \[video\]\(/;
const TEST_ID_PATTERN = /\bE2E-\d+\b/g;

function roundToMillis(value) {
  return Math.round(value * 1000) / 1000;
}

function idNumber(id) {
  return Number(id.slice("E2E-".length));
}

/** Lee `{id → subtítulo, actor, flujo}` de las casillas de test-walkthrough.md. */
export class WalkthroughCaptions {
  execute({ markdown }) {
    const lines = markdown.split("\n");
    const captions = {};
    const errors = [];
    const seen = new Set();
    let flow = "";

    for (let index = 0; index < lines.length; index += 1) {
      const heading = HEADING_PATTERN.exec(lines[index]);

      if (heading !== null) {
        flow = heading[1].trim();
        continue;
      }

      const checkbox = CHECKBOX_PATTERN.exec(lines[index]);

      if (checkbox === null) {
        continue;
      }

      const id = checkbox[1];
      const content = this.findCaptionContent({ lines, from: index + 1 });

      if (content === null) {
        if (VIDEO_LINK_PATTERN.test(lines[index])) {
          errors.push(
            `${id}: la casilla tiene ${VIDEO_LINK} pero no tiene su línea «- 🎬 …»`,
          );
        }
        continue;
      }

      if (seen.has(id)) {
        errors.push(`${id}: ID repetido en el recorrido (línea ${index + 1})`);
        continue;
      }

      seen.add(id);

      const parsed = this.parseContent({ content });
      const problem = this.validate({ id, parsed });

      if (problem !== null) {
        errors.push(problem);
        continue;
      }

      captions[id] = { subtitle: parsed.subtitle, actor: parsed.actor, flow };
    }

    return { captions, errors };
  }

  findCaptionContent({ lines, from }) {
    for (let index = from; index < lines.length; index += 1) {
      if (!INDENTED_PATTERN.test(lines[index])) {
        return null;
      }

      const match = CAPTION_LINE_PATTERN.exec(lines[index]);

      if (match !== null) {
        return match[1];
      }
    }

    return null;
  }

  parseContent({ content }) {
    const separator = content.lastIndexOf(ACTOR_SEPARATOR);

    if (separator === -1) {
      return { subtitle: content.trim(), actor: "" };
    }

    return {
      subtitle: content.slice(0, separator).trim(),
      actor: content.slice(separator + ACTOR_SEPARATOR.length).trim(),
    };
  }

  validate({ id, parsed }) {
    const length = Array.from(parsed.subtitle).length;

    if (length > CAPTION_MAX_LENGTH) {
      return `${id}: el subtítulo tiene ${length} caracteres (máximo ${CAPTION_MAX_LENGTH})`;
    }

    if (MARKDOWN_PATTERN.test(parsed.subtitle)) {
      return `${id}: el subtítulo no puede llevar markdown (**, \`, [texto](url))`;
    }

    if (parsed.actor === "") {
      return `${id}: la línea 🎬 no trae «${ACTOR_SEPARATOR.trim()} <escenario>» (falta el actor)`;
    }

    return null;
  }
}

/** Convierte marcas y estados de test en los tramos del video que hay que cortar. */
export class ClipPlan {
  execute({ marks, tests, captions }) {
    const testId = new DemoTestId();
    const clips = [];
    const skipped = [];

    for (const test of tests) {
      const id = testId.execute({ title: test.title });

      if (id === null) {
        skipped.push({ id: null, title: test.title, reason: SkipReason.NoTestId });
        continue;
      }

      if (test.state !== "passed") {
        skipped.push({ id, reason: SkipReason.Failed });
        continue;
      }

      if (captions[id] === undefined) {
        skipped.push({ id, reason: SkipReason.NoCaption });
        continue;
      }

      const start = marks.find((mark) => {
        return mark.id === id && mark.kind === MarkKind.Start;
      });
      const end = marks.find((mark) => {
        return mark.id === id && mark.kind === MarkKind.End;
      });

      if (start === undefined) {
        skipped.push({ id, reason: SkipReason.NoStart });
        continue;
      }

      if (end === undefined) {
        skipped.push({ id, reason: SkipReason.NoEnd });
        continue;
      }

      // El margen no puede invadir a los casos vecinos: en un spec rápido el caso
      // anterior termina a décimas de segundo de que empiece este, y el clip
      // arrancaría mostrando su final y su subtítulo.
      const previousEnd = marks
        .filter((mark) => {
          return mark.kind === MarkKind.End && mark.id !== id && mark.t <= start.t;
        })
        .reduce((latest, mark) => {
          return Math.max(latest, mark.t);
        }, 0);
      const nextStart = marks
        .filter((mark) => {
          return mark.kind === MarkKind.Start && mark.id !== id && mark.t >= end.t;
        })
        .reduce((earliest, mark) => {
          return Math.min(earliest, mark.t);
        }, Infinity);

      // El clip arranca en la primera carga real de la aplicación (marca `ready`)
      // y no en el inicio del caso: antes el navegador muestra la pantalla de
      // Cypress mientras el test siembra datos e inicia sesión.
      const ready = marks.find((mark) => {
        return mark.id === id && mark.kind === MarkKind.Ready && mark.t > start.t;
      });
      // Con `ready` no hay margen previo (sería la pantalla de Cypress) y se espera a
      // que la app se pinte, sin pasar del final del caso.
      const begin =
        ready === undefined
          ? roundToMillis(start.t - CLIP_MARGIN_SECONDS)
          : Math.min(roundToMillis(ready.t + READY_PAINT_SECONDS), end.t);

      clips.push({
        id,
        start: Math.max(previousEnd, begin),
        end: Math.min(nextStart, roundToMillis(end.t + CLIP_MARGIN_SECONDS)),
      });
    }

    return { clips, skipped };
  }
}

/** Los IDs que deben tener clip: las hojas de los diagramas walkthrough. */
export class ExpectedClips {
  execute({ diagrams }) {
    if (diagrams.length === 0) {
      throw new Error("No hay diagramas diagrams/walkthrough-*.mmd en el spec");
    }

    const ids = new Set();

    for (const diagram of diagrams) {
      for (const line of diagram.content.split("\n")) {
        if (line.includes("excluido")) {
          continue;
        }

        for (const match of line.matchAll(TEST_ID_PATTERN)) {
          ids.add(match[0]);
        }
      }
    }

    return [...ids].sort((a, b) => {
      return idNumber(a) - idNumber(b);
    });
  }
}

function wrapText({ text, width }) {
  const lines = [];
  let current = "";

  for (const word of text.split(/\s+/)) {
    if (current !== "" && Array.from(`${current} ${word}`).length > width) {
      lines.push(current);
      current = word;
    } else {
      current = current === "" ? word : `${current} ${word}`;
    }
  }

  if (current !== "") {
    lines.push(current);
  }

  return lines.join("\n");
}

function escapeFilterValue(value) {
  return value.replace(/[\\':]/g, "\\$&");
}

function run({ file, args, cwd }) {
  return execFileSync(file, args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function probeVideo({ file }) {
  const output = run({
    file: "ffprobe",
    args: [
      "-v",
      "error",
      "-select_streams",
      "v:0",
      "-show_entries",
      "stream=width,height:format=duration",
      "-of",
      "json",
      file,
    ],
  });
  const data = JSON.parse(output);
  const stream = data.streams[0];

  if (stream === undefined) {
    throw new Error(`${file} no tiene stream de video`);
  }

  return {
    width: stream.width,
    height: stream.height,
    duration: Number(data.format.duration),
  };
}

class CaptionsCommand {
  execute({ specDir }) {
    const markdownPath = join(specDir, "test-walkthrough.md");

    if (!existsSync(markdownPath)) {
      console.error(`✗ Falta ${markdownPath}`);

      return 1;
    }

    const parser = new WalkthroughCaptions();
    const { captions, errors } = parser.execute({
      markdown: readFileSync(markdownPath, "utf8"),
    });

    if (errors.length > 0) {
      for (const error of errors) {
        console.error(`✗ ${error}`);
      }

      return 1;
    }

    const workDir = join(specDir, "videos", ".work");
    mkdirSync(workDir, { recursive: true });
    writeFileSync(
      join(workDir, "captions.json"),
      JSON.stringify(captions, null, 2),
    );
    console.log(`✓ ${Object.keys(captions).length} subtítulos en captions.json`);

    return 0;
  }
}

class CutCommand {
  execute({ specDir }) {
    const workDir = join(specDir, "videos", ".work");
    const rawDir = join(workDir, "raw");
    const captionsPath = join(workDir, "captions.json");

    if (!existsSync(captionsPath)) {
      console.error("✗ Falta captions.json: corre primero `captions`");

      return 1;
    }

    const markFiles = existsSync(rawDir)
      ? readdirSync(rawDir)
          .filter((name) => {
            return name.endsWith(".marks.json");
          })
          .sort()
      : [];

    if (markFiles.length === 0) {
      console.error(`✗ No hay archivos .marks.json en ${rawDir}`);

      return 1;
    }

    try {
      run({ file: "ffmpeg", args: ["-version"] });
    } catch {
      console.error("✗ Falta ffmpeg");

      return 1;
    }

    const captions = JSON.parse(readFileSync(captionsPath, "utf8"));
    const plan = new ClipPlan();
    const planName = basename(specDir);
    const madeIds = [];
    let blocking = false;

    for (const markFile of markFiles) {
      const data = JSON.parse(readFileSync(join(rawDir, markFile), "utf8"));

      if (typeof data.video !== "string" || !existsSync(data.video)) {
        console.error(`✗ ${markFile}: Cypress no dejó video crudo para este spec`);
        blocking = true;
        continue;
      }

      const result = plan.execute({
        marks: data.marks,
        tests: data.tests,
        captions,
      });

      for (const clip of result.clips) {
        this.cutClip({ specDir, workDir, planName, video: data.video, clip, captions });
        madeIds.push(clip.id);
        console.log(`✓ ${clip.id} → videos/${clip.id}.mp4`);
      }

      for (const skip of result.skipped) {
        const label = skip.id === null ? `«${skip.title}»` : skip.id;
        console.log(`· sin clip: ${label} (${skip.reason})`);

        if (BLOCKING_REASONS.includes(skip.reason)) {
          blocking = true;
        }
      }
    }

    this.linkClips({ specDir, ids: madeIds });

    if (madeIds.length === 0) {
      console.log("· no se generó ningún clip (¿los casos tienen su línea 🎬 y su E2E-n en el título del test?)");
    }

    if (blocking) {
      console.error("✗ Faltan clips de casos esperados; se conserva videos/.work para revisar");

      return 1;
    }

    rmSync(workDir, { recursive: true, force: true });

    return 0;
  }

  // Cada casilla con clip enlaza su video; si ya lo enlaza, no se toca.
  linkClips({ specDir, ids }) {
    const path = join(specDir, "test-walkthrough.md");

    if (ids.length === 0 || !existsSync(path)) {
      return;
    }

    const lines = readFileSync(path, "utf8").split("\n");
    const linked = lines.map((line) => {
      const checkbox = CHECKBOX_PATTERN.exec(line);

      if (checkbox === null || !ids.includes(checkbox[1]) || VIDEO_LINK_PATTERN.test(line)) {
        return line;
      }

      return `${line} ${VIDEO_LINK}(./videos/${checkbox[1]}.mp4)`;
    });

    writeFileSync(path, linked.join("\n"));
  }

  cutClip({ specDir, workDir, planName, video, clip, captions }) {
    const caption = captions[clip.id];
    const { width, height } = probeVideo({ file: video });
    const fontFile = run({
      file: "fc-match",
      args: ["-f", "%{file}", "DejaVu Sans:bold"],
    }).trim();
    const subtitleLines = wrapText({
      text: caption.subtitle,
      width: COVER_WRAP_WIDTH,
    }).split("\n");
    const texts = {
      "cover-id.txt": clip.id,
      "cover-actor.txt": `Actor: ${caption.actor}`,
      "cover-plan.txt": `${caption.flow} · ${planName}`,
    };

    subtitleLines.forEach((line, index) => {
      texts[`cover-subtitle-${index}.txt`] = line;
    });

    for (const [name, content] of Object.entries(texts)) {
      writeFileSync(join(workDir, name), content);
    }

    const font = escapeFilterValue(fontFile);
    const draw = ({ file, options }) => {
      // expansion=none: un subtítulo con %{…} o \ se dibuja literal, no se expande.
      return `drawtext=fontfile=${font}:textfile=${file}:expansion=none:x=(w-text_w)/2:${options}`;
    };
    // Una línea por drawtext: con `text_align=center` el salto de línea sale como
    // un cuadrito («▯») al final de cada línea.
    const subtitleDraws = subtitleLines.map((line, index) => {
      return draw({
        file: `cover-subtitle-${index}.txt`,
        options: `fontcolor=white:fontsize=38:y=h*0.40+${index * SUBTITLE_LINE_HEIGHT}`,
      });
    });
    const cover = [
      draw({ file: "cover-id.txt", options: "fontcolor=0xc4b5fd:fontsize=72:y=h*0.26" }),
      ...subtitleDraws,
      draw({ file: "cover-actor.txt", options: "fontcolor=0x9ca3af:fontsize=26:y=h*0.66" }),
      draw({ file: "cover-plan.txt", options: "fontcolor=0x6b7280:fontsize=22:y=h*0.88" }),
    ].join(",");

    mkdirSync(join(specDir, "videos"), { recursive: true });
    run({
      file: "ffmpeg",
      cwd: workDir,
      args: [
        "-v",
        "error",
        "-y",
        "-f",
        "lavfi",
        "-i",
        `color=c=0x11111b:s=${width}x${height}:d=${COVER_SECONDS}:r=${FRAME_RATE}`,
        "-ss",
        String(clip.start),
        "-to",
        String(clip.end),
        "-i",
        video,
        "-filter_complex",
        `[0:v]${cover},format=yuv420p[t];[1:v]fps=${FRAME_RATE},format=yuv420p,setpts=PTS-STARTPTS[v];[t][v]concat=n=2:v=1:a=0[o]`,
        "-map",
        "[o]",
        "-c:v",
        "libx264",
        "-crf",
        "20",
        "-preset",
        "medium",
        "-movflags",
        "+faststart",
        join(specDir, "videos", `${clip.id}.mp4`),
      ],
    });
  }
}

class CheckCommand {
  execute({ specDir }) {
    const diagramsDir = join(specDir, "diagrams");
    const diagramNames = existsSync(diagramsDir)
      ? readdirSync(diagramsDir).filter((name) => {
          return name.startsWith("walkthrough-") && name.endsWith(".mmd");
        })
      : [];
    const expectedClips = new ExpectedClips();
    let expected;

    try {
      expected = expectedClips.execute({
        diagrams: diagramNames.map((name) => {
          return {
            name,
            content: readFileSync(join(diagramsDir, name), "utf8"),
          };
        }),
      });
    } catch (error) {
      console.error(`✗ ${error.message}`);

      return 1;
    }

    const videosDir = join(specDir, "videos");
    const present = existsSync(videosDir)
      ? readdirSync(videosDir)
          .filter((name) => {
            return /^E2E-\d+\.mp4$/.test(name);
          })
          .map((name) => {
            return name.slice(0, -".mp4".length);
          })
      : [];
    let failed = false;

    for (const id of expected) {
      if (!present.includes(id)) {
        console.error(`✗ falta ${id}`);
        failed = true;
      }
    }

    for (const id of present) {
      if (!expected.includes(id)) {
        console.error(`✗ sobra ${id}`);
        failed = true;
        continue;
      }

      try {
        const info = probeVideo({ file: join(videosDir, `${id}.mp4`) });

        if (!(info.duration > 0)) {
          throw new Error("duración 0");
        }
      } catch {
        console.error(`✗ ${id} no se puede reproducir`);
        failed = true;
      }
    }

    if (failed) {
      return 1;
    }

    console.log(`✓ ${expected.length} clips al día y reproducibles`);

    return 0;
  }
}

const COMMANDS = Object.freeze({
  captions: CaptionsCommand,
  cut: CutCommand,
  check: CheckCommand,
});

function main({ argv }) {
  const [name, specArg] = argv;
  const Command = COMMANDS[name];

  if (Command === undefined || specArg === undefined) {
    console.error("Uso: demo-videos.mjs captions|cut|check <carpeta-del-spec>");

    return 1;
  }

  const specDir = resolve(specArg);

  if (!existsSync(specDir)) {
    console.error(`✗ No existe la carpeta ${specDir}`);

    return 1;
  }

  const command = new Command();

  return command.execute({ specDir });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = main({ argv: process.argv.slice(2) });
}
