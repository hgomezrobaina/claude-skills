import { DemoOverlay } from "./demo-overlay";
import { DemoMarkKind, DemoTask } from "./demo-task";
import { DemoTestId } from "./demo-test-id";
import { DemoTiming } from "./demo-timing";

interface DemoCaption {
  subtitle: string;
  actor: string;
  flow: string;
}

type DemoCaptionsFile = Record<string, DemoCaption>;

interface Props {
  overlay: DemoOverlay;
}

/**
 * Rotula cada caso: al empezar un test con `E2E-n` en el título deja la marca de
 * inicio y pinta su subtítulo (leído de `captions.json`); al terminar sostiene
 * el resultado en pantalla y deja la marca de fin. Un test sin ID no hace nada.
 */
export class DemoCaptions {
  private readonly overlay: DemoOverlay;
  private readonly testId = new DemoTestId();
  private captions: DemoCaptionsFile = {};

  constructor({ overlay }: Props) {
    this.overlay = overlay;
  }

  register(): void {
    before(() => {
      const path: string | undefined = Cypress.env("demoCaptions");

      if (path === undefined) {
        throw new Error(
          "El modo demo necesita la variable CYPRESS_demoCaptions (o --env demoCaptions=…) con la ruta absoluta del captions.json",
        );
      }

      cy.readFile<DemoCaptionsFile>(path, { log: false }).then((file) => {
        this.captions = file;
      });
    });

    beforeEach(() => {
      const id = this.testId.execute({ title: Cypress.currentTest.title });

      if (id === null) {
        return;
      }

      cy.task(DemoTask.Mark, { id, kind: DemoMarkKind.Start }, { log: false });

      const caption = this.captions[id];

      if (caption === undefined) {
        return;
      }

      cy.document({ log: false }).then((doc) => {
        this.overlay.showCaption({ doc, id, text: caption.subtitle });
      });
    });

    afterEach(() => {
      const id = this.testId.execute({ title: Cypress.currentTest.title });

      if (id === null) {
        return;
      }

      cy.wait(DemoTiming.Hold, { log: false });
      cy.task(DemoTask.Mark, { id, kind: DemoMarkKind.End }, { log: false });
      cy.document({ log: false }).then((doc) => {
        this.overlay.clearCaption({ doc });
      });
    });
  }
}
