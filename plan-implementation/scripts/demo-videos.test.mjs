// Pruebas unitarias del plan plan-demo-videos (UT-1..UT-4).
// Correr: node --test ~/.claude/skills/plan-implementation/scripts/demo-videos.test.mjs
import assert from "node:assert/strict";
import { before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const DEMO_TEST_ID_URL = new URL(
  "../kits/cypress-demo/cypress/support/demo/demo-test-id.ts",
  import.meta.url,
);

const CAPTION_MAX_LENGTH = 90;

// Cada grupo importa su módulo por separado: así un módulo que aún no existe
// pone en rojo solo a su grupo y no tumba el archivo entero.
function loadScript() {
  return import("./demo-videos.mjs");
}

function walkthrough({ lines }) {
  return ["# Guía de prueba", "", "## HU-2 — Proveedores de uso", "", ...lines].join("\n");
}

describe("UT-1 WalkthroughCaptions", () => {
  let parser;

  before(async () => {
    const { WalkthroughCaptions } = await loadScript();
    parser = new WalkthroughCaptions();
  });

  it("lee subtítulo, actor y flujo de una casilla con 🎬", () => {
    const markdown = walkthrough({
      lines: [
        '- [ ] E2E-3 — "Nuevo proveedor" → el campo **Código** muestra su ayuda. ▶ [video](./videos/E2E-3.mp4)',
        "  - 🎬 Abrir «Nuevo proveedor» → el campo Código muestra su ayuda · actor: backoffice-billing-admin",
      ],
    });

    const result = parser.execute({ markdown });

    assert.deepEqual(result.errors, []);
    assert.deepEqual(result.captions, {
      "E2E-3": {
        subtitle: "Abrir «Nuevo proveedor» → el campo Código muestra su ayuda",
        actor: "backoffice-billing-admin",
        flow: "HU-2 — Proveedores de uso",
      },
    });
  });

  it("ignora una casilla sin 🎬 y sin enlace de video", () => {
    const markdown = walkthrough({
      lines: ["- [ ] E2E-9 — Solo backend (sin video: se verifica en la suite HTTP)"],
    });

    const result = parser.execute({ markdown });

    assert.deepEqual(result.errors, []);
    assert.deepEqual(result.captions, {});
  });

  it("falla si una casilla con ▶ [video] no tiene 🎬", () => {
    const markdown = walkthrough({
      lines: ["- [ ] E2E-4 — Algo visible. ▶ [video](./videos/E2E-4.mp4)"],
    });

    const result = parser.execute({ markdown });

    assert.equal(result.errors.length, 1);
    assert.match(result.errors[0], /E2E-4/);
    assert.deepEqual(result.captions, {});
  });

  it("falla si el subtítulo pasa de 90 caracteres y acepta uno de exactamente 90", () => {
    const exact = "a".repeat(CAPTION_MAX_LENGTH);
    const tooLong = "a".repeat(CAPTION_MAX_LENGTH + 1);
    const markdown = walkthrough({
      lines: [
        "- [ ] E2E-5 — Largo.",
        `  - 🎬 ${tooLong} · actor: user-with-dealer`,
        "- [ ] E2E-6 — Justo.",
        `  - 🎬 ${exact} · actor: user-with-dealer`,
      ],
    });

    const result = parser.execute({ markdown });

    assert.equal(result.errors.length, 1);
    assert.match(result.errors[0], /E2E-5/);
    assert.deepEqual(Object.keys(result.captions), ["E2E-6"]);
  });

  it("falla si falta el actor", () => {
    const markdown = walkthrough({
      lines: ["- [ ] E2E-7 — Sin actor.", "  - 🎬 Abrir la lista → se ve la fila"],
    });

    const result = parser.execute({ markdown });

    assert.equal(result.errors.length, 1);
    assert.match(result.errors[0], /E2E-7/);
    assert.match(result.errors[0], /actor/);
  });

  it("falla si el subtítulo trae markdown", () => {
    const markdown = walkthrough({
      lines: [
        "- [ ] E2E-8 — Con markdown.",
        "  - 🎬 Abrir **Nuevo** → se ve `Código` · actor: user-with-dealer",
      ],
    });

    const result = parser.execute({ markdown });

    assert.equal(result.errors.length, 1);
    assert.match(result.errors[0], /E2E-8/);
    assert.match(result.errors[0], /markdown/);
  });

  it("falla si dos casillas usan el mismo ID", () => {
    const markdown = walkthrough({
      lines: [
        "- [ ] E2E-1 — Primera.",
        "  - 🎬 Primera acción → primer resultado · actor: a",
        "- [ ] E2E-1 — Repetida.",
        "  - 🎬 Segunda acción → segundo resultado · actor: b",
      ],
    });

    const result = parser.execute({ markdown });

    assert.equal(result.errors.length, 1);
    assert.match(result.errors[0], /E2E-1/);
    assert.match(result.errors[0], /repetid/);
    assert.equal(result.captions["E2E-1"].actor, "a");
  });
});

describe("UT-2 ClipPlan", () => {
  let plan;

  before(async () => {
    const { ClipPlan } = await loadScript();
    plan = new ClipPlan();
  });

  const captions = {
    "E2E-1": { subtitle: "Uno → resultado", actor: "a", flow: "HU-1" },
    "E2E-2": { subtitle: "Dos → resultado", actor: "a", flow: "HU-1" },
    "E2E-3": { subtitle: "Tres → resultado", actor: "a", flow: "HU-1" },
  };

  it("arma el tramo de un caso pasado con 0,3 s de margen a cada lado", () => {
    const result = plan.execute({
      marks: [
        { id: "E2E-1", kind: "start", t: 3.2 },
        { id: "E2E-1", kind: "end", t: 17.2 },
      ],
      tests: [{ title: "E2E-1 saves it", state: "passed" }],
      captions,
    });

    assert.deepEqual(result.clips, [{ id: "E2E-1", start: 2.9, end: 17.5 }]);
    assert.deepEqual(result.skipped, []);
  });

  it("no baja de 0 cuando el caso empieza antes de 0,3 s", () => {
    const result = plan.execute({
      marks: [
        { id: "E2E-1", kind: "start", t: 0.1 },
        { id: "E2E-1", kind: "end", t: 5 },
      ],
      tests: [{ title: "E2E-1 saves it", state: "passed" }],
      captions,
    });

    assert.equal(result.clips[0].start, 0);
  });

  it("no genera clip de un caso fallido y dice por qué", () => {
    const result = plan.execute({
      marks: [
        { id: "E2E-1", kind: "start", t: 1 },
        { id: "E2E-1", kind: "end", t: 4 },
        { id: "E2E-2", kind: "start", t: 5 },
        { id: "E2E-2", kind: "end", t: 9 },
      ],
      tests: [
        { title: "E2E-1 fails", state: "failed" },
        { title: "E2E-2 passes", state: "passed" },
      ],
      captions,
    });

    assert.deepEqual(
      result.clips.map((clip) => {
        return clip.id;
      }),
      ["E2E-2"],
    );
    assert.deepEqual(result.skipped, [{ id: "E2E-1", reason: "failed" }]);
  });

  it("explica un caso con inicio pero sin fin", () => {
    const result = plan.execute({
      marks: [{ id: "E2E-1", kind: "start", t: 1 }],
      tests: [{ title: "E2E-1 hangs", state: "passed" }],
      captions,
    });

    assert.deepEqual(result.clips, []);
    assert.deepEqual(result.skipped, [{ id: "E2E-1", reason: "sin marca de fin" }]);
  });

  it("lista un test sin E2E-n en el título como sin E2E-n", () => {
    const result = plan.execute({
      marks: [],
      tests: [{ title: "shows the login form", state: "passed" }],
      captions,
    });

    assert.deepEqual(result.clips, []);
    assert.deepEqual(result.skipped, [
      { id: null, title: "shows the login form", reason: "sin E2E-n" },
    ]);
  });

  it("explica un ID que no tiene entrada en captions.json como sin 🎬", () => {
    const result = plan.execute({
      marks: [
        { id: "E2E-77", kind: "start", t: 1 },
        { id: "E2E-77", kind: "end", t: 4 },
      ],
      tests: [{ title: "E2E-77 is not in the walkthrough", state: "passed" }],
      captions,
    });

    assert.deepEqual(result.clips, []);
    assert.deepEqual(result.skipped, [{ id: "E2E-77", reason: "sin 🎬" }]);
  });

  it("conserva el orden de los tests", () => {
    const result = plan.execute({
      marks: [
        { id: "E2E-3", kind: "start", t: 20 },
        { id: "E2E-3", kind: "end", t: 25 },
        { id: "E2E-2", kind: "start", t: 5 },
        { id: "E2E-2", kind: "end", t: 9 },
      ],
      tests: [
        { title: "E2E-2 second", state: "passed" },
        { title: "E2E-3 third", state: "passed" },
      ],
      captions,
    });

    assert.deepEqual(
      result.clips.map((clip) => {
        return clip.id;
      }),
      ["E2E-2", "E2E-3"],
    );
  });
});

describe("UT-3 ExpectedClips", () => {
  let expected;

  before(async () => {
    const { ExpectedClips } = await loadScript();
    expected = new ExpectedClips();
  });

  it("saca los IDs de las hojas, sin repetir y en orden numérico", () => {
    const ids = expected.execute({
      diagrams: [
        {
          name: "walkthrough-a.mmd",
          content: [
            "flowchart TD",
            "  A[Abrir] --> B[/Se ve la lista · E2E-10/]",
            "  A --> C[/Se ve el error · E2E-2/]",
          ].join("\n"),
        },
      ],
    });

    assert.deepEqual(ids, ["E2E-2", "E2E-10"]);
  });

  it("no cuenta una hoja marcada · excluido", () => {
    const ids = expected.execute({
      diagrams: [
        {
          name: "walkthrough-a.mmd",
          content: [
            "  B[/Se ve la lista · E2E-1/]",
            "  C[/Solo backend · E2E-7 · excluido/]",
          ].join("\n"),
        },
      ],
    });

    assert.deepEqual(ids, ["E2E-1"]);
  });

  it("junta los diagramas y cuenta una sola vez un ID repetido", () => {
    const ids = expected.execute({
      diagrams: [
        { name: "walkthrough-a.mmd", content: "  B[/x · E2E-1/]\n  C[/y · E2E-2/]" },
        { name: "walkthrough-b.mmd", content: "  D[/z · E2E-2/]\n  E[/w · E2E-3/]" },
      ],
    });

    assert.deepEqual(ids, ["E2E-1", "E2E-2", "E2E-3"]);
  });

  it("falla si no hay ningún diagrama walkthrough", () => {
    assert.throws(() => {
      expected.execute({ diagrams: [] });
    }, /walkthrough/);
  });
});

describe("UT-4 DemoTestId (kit)", () => {
  let demoTestId;

  before(async () => {
    const module = await import(fileURLToPath(DEMO_TEST_ID_URL));
    demoTestId = new module.DemoTestId();
  });

  it("extrae el ID del título", () => {
    assert.equal(demoTestId.execute({ title: "E2E-12 saves the draft" }), "E2E-12");
  });

  it("devuelve null si el título no lleva ID", () => {
    assert.equal(demoTestId.execute({ title: "shows the login form" }), null);
  });

  it("no toma un ID pegado a otra palabra", () => {
    assert.equal(demoTestId.execute({ title: "XE2E-1 is not an id" }), null);
    assert.equal(demoTestId.execute({ title: "E2E-1a is not an id" }), null);
  });

  it("con dos IDs devuelve el primero", () => {
    assert.equal(demoTestId.execute({ title: "E2E-3 and E2E-4 together" }), "E2E-3");
  });
});
