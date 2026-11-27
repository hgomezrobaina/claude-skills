import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { DemoMarkKind, DemoTask } from "../support/demo/demo-task";

type AfterBrowserLaunchFn = (
  browser: Cypress.Browser,
  details: Cypress.AfterBrowserLaunchDetails,
) => void | Promise<void>;

type AfterRunFn = (
  results:
    | CypressCommandLine.CypressRunResult
    | CypressCommandLine.CypressFailedRunResult,
) => void | Promise<void>;

type AfterScreenshotFn = (
  details: Cypress.ScreenshotDetails,
) =>
  | void
  | Cypress.AfterScreenshotReturnObject
  | Promise<Cypress.AfterScreenshotReturnObject>;

type AfterSpecFn = (
  spec: Cypress.Spec,
  results: CypressCommandLine.RunResult,
) => void | Promise<void>;

type BeforeRunFn = (details: Cypress.BeforeRunDetails) => void | Promise<void>;

type BeforeSpecFn = (spec: Cypress.Spec) => void | Promise<void>;

type BeforeBrowserLaunchFn = (
  browser: Cypress.Browser,
  options: Cypress.BeforeBrowserLaunchOptions,
) =>
  | void
  | Promise<void>
  | Cypress.BeforeBrowserLaunchOptions
  | Promise<Cypress.BeforeBrowserLaunchOptions>;

type FilePreprocessorFn = (file: Cypress.FileObject) => string | Promise<string>;

type DevServerFn = (
  config: Cypress.DevServerConfig,
) => Promise<Cypress.ResolvedDevServerConfig>;

/**
 * Cada forma en que Cypress deja registrar un evento (`Cypress.PluginEvents`).
 * Los nombres son literales porque así los declara la API de Cypress.
 */
type OnArgs =
  | [action: "after:browser:launch", fn: AfterBrowserLaunchFn]
  | [action: "after:run", fn: AfterRunFn]
  | [action: "after:screenshot", fn: AfterScreenshotFn]
  | [action: "after:spec", fn: AfterSpecFn]
  | [action: "before:run", fn: BeforeRunFn]
  | [action: "before:spec", fn: BeforeSpecFn]
  | [action: "before:browser:launch", fn: BeforeBrowserLaunchFn]
  | [action: "file:preprocessor", fn: FilePreprocessorFn]
  | [action: "dev-server:start", fn: DevServerFn]
  | [action: "task", fn: Cypress.Tasks];

type SetupNodeEvents = Cypress.EndToEndConfigOptions["setupNodeEvents"];

interface Props {
  on: Cypress.PluginEvents;
  config: Cypress.PluginConfigOptions;
  projectSetup: SetupNodeEvents;
}

interface MarkInput {
  id: string;
  kind: DemoMarkKind;
  /** Instante (ms desde la época) de la primera carga real de la app en el caso. */
  readyAt: number | null;
}

interface Mark {
  id: string;
  kind: DemoMarkKind;
  t: number;
}

interface WriteMarksProps {
  demoOut: string;
  spec: Cypress.Spec;
  results: CypressCommandLine.RunResult;
  marks: Mark[];
}

/**
 * Compone los eventos de Node del proyecto con los del modo demo.
 *
 * En Cypress 15, si dos partes registran el mismo evento con `on`, solo corre
 * el último. Por eso el `setupNodeEvents` del proyecto recibe un `on` que
 * **captura** sus registros en vez de pasarlos a Cypress, y después se registra
 * un solo handler por evento que corre primero el del proyecto y luego el del
 * kit. Los eventos que el kit no compone se reenvían tal cual.
 *
 * Las firmas `(browser, options)` y `(spec, results)` las impone la API de
 * Cypress: es el desvío aprobado del plan `plan-demo-videos`.
 */
export class DemoNodeEvents {
  private readonly launchHandlers: BeforeBrowserLaunchFn[] = [];
  private readonly beforeSpecHandlers: BeforeSpecFn[] = [];
  private readonly afterSpecHandlers: AfterSpecFn[] = [];
  private tasks: Cypress.Tasks = {};
  private marks: Mark[] = [];
  private specStart = 0;

  async execute({
    on,
    config,
    projectSetup,
  }: Props): Promise<Cypress.PluginConfigOptions> {
    const demoOut: string | undefined = config.env.demoOut;

    if (demoOut === undefined) {
      throw new Error(
        "El modo demo necesita la variable CYPRESS_demoOut (o --env demoOut=…) con la carpeta absoluta de los videos crudos",
      );
    }

    const capturingOn: Cypress.PluginEvents = (...args: OnArgs) => {
      const [action, fn] = args;

      switch (action) {
        case "before:browser:launch":
          this.launchHandlers.push(fn);
          break;
        case "before:spec":
          this.beforeSpecHandlers.push(fn);
          break;
        case "after:spec":
          this.afterSpecHandlers.push(fn);
          break;
        case "task":
          this.tasks = { ...this.tasks, ...fn };
          break;
        case "after:browser:launch":
          on(action, fn);
          break;
        case "after:run":
          on(action, fn);
          break;
        case "after:screenshot":
          on(action, fn);
          break;
        case "before:run":
          on(action, fn);
          break;
        case "file:preprocessor":
          on(action, fn);
          break;
        case "dev-server:start":
          on(action, fn);
          break;
      }
    };

    const projectResult = projectSetup
      ? await projectSetup(capturingOn, config)
      : undefined;
    const resolved = projectResult || config;

    if (DemoTask.Mark in this.tasks) {
      throw new Error(
        `El proyecto ya define la tarea "${DemoTask.Mark}", que el modo demo usa para las marcas`,
      );
    }

    this.tasks = {
      ...this.tasks,
      [DemoTask.Mark]: (mark: MarkInput): null => {
        if (mark.readyAt !== null) {
          this.marks.push({
            id: mark.id,
            kind: DemoMarkKind.Ready,
            t: (mark.readyAt - this.specStart) / 1000,
          });
        }

        this.marks.push({
          id: mark.id,
          kind: mark.kind,
          t: (Date.now() - this.specStart) / 1000,
        });

        return null;
      },
    };

    on("before:browser:launch", async (browser, options) => {
      const initial = {
        width: options.preferences.width,
        height: options.preferences.height,
      };
      let current = options;

      for (const handler of this.launchHandlers) {
        const result = await handler(browser, current);

        if (result) {
          current = result;
        }
      }

      const projectSetSize =
        current.preferences.width !== initial.width ||
        current.preferences.height !== initial.height;

      if (browser.name === "electron" && !projectSetSize) {
        current.preferences.width = resolved.viewportWidth;
        current.preferences.height = resolved.viewportHeight;
      }

      return current;
    });

    on("before:spec", async (spec) => {
      for (const handler of this.beforeSpecHandlers) {
        await handler(spec);
      }

      this.marks = [];
      this.specStart = Date.now();
    });

    on("after:spec", async (spec, results) => {
      for (const handler of this.afterSpecHandlers) {
        await handler(spec, results);
      }

      await this.writeMarks({ demoOut, spec, results, marks: this.marks });
    });

    on("task", this.tasks);

    return { ...resolved, videosFolder: demoOut };
  }

  private async writeMarks({
    demoOut,
    spec,
    results,
    marks,
  }: WriteMarksProps): Promise<void> {
    const fileName = `${spec.relative.replaceAll("/", "__")}.marks.json`;
    const content = {
      video: results.video,
      marks,
      tests: results.tests.map((test) => {
        return { title: test.title.join(" "), state: test.state };
      }),
    };

    await mkdir(demoOut, { recursive: true });
    await writeFile(join(demoOut, fileName), JSON.stringify(content, null, 2));
  }
}
