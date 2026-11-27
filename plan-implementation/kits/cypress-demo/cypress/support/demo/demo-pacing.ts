import { DemoOverlay } from "./demo-overlay";
import { DemoPacedCommand, DemoTiming } from "./demo-timing";

interface Props {
  overlay: DemoOverlay;
}

interface PaceProps {
  subject: JQuery<HTMLElement>;
  action: () => Cypress.Chainable<JQuery<HTMLElement>>;
}

/**
 * Da ritmo humano a los comandos de interacción: el elemento se desplaza al
 * centro, el cursor viaja hasta él, hay una pausa antes y otra después, y la
 * escritura va letra por letra.
 *
 * Las firmas `(originalFn, subject, ...args)` las impone la API de Cypress
 * (`Cypress.Commands.overwrite`): es el desvío aprobado del plan
 * `plan-demo-videos`. Todo lo propio del kit recibe un objeto.
 */
export class DemoPacing {
  private readonly overlay: DemoOverlay;

  constructor({ overlay }: Props) {
    this.overlay = overlay;
  }

  register(): void {
    Cypress.Commands.overwrite<DemoPacedCommand.Click, "element">(
      DemoPacedCommand.Click,
      (originalFn, subject, ...args) => {
        return this.pace({
          subject,
          action: () => {
            return originalFn(subject, ...args);
          },
        });
      },
    );

    Cypress.Commands.overwrite<DemoPacedCommand.Dblclick, "element">(
      DemoPacedCommand.Dblclick,
      (originalFn, subject, ...args) => {
        return this.pace({
          subject,
          action: () => {
            return originalFn(subject, ...args);
          },
        });
      },
    );

    Cypress.Commands.overwrite<DemoPacedCommand.Rightclick, "element">(
      DemoPacedCommand.Rightclick,
      (originalFn, subject, ...args) => {
        return this.pace({
          subject,
          action: () => {
            return originalFn(subject, ...args);
          },
        });
      },
    );

    Cypress.Commands.overwrite<DemoPacedCommand.Type, "element">(
      DemoPacedCommand.Type,
      (originalFn, subject, text, options) => {
        return this.pace({
          subject,
          action: () => {
            return originalFn(subject, text, {
              ...options,
              delay: DemoTiming.TypeDelay,
            });
          },
        });
      },
    );

    Cypress.Commands.overwrite<DemoPacedCommand.Clear, "element">(
      DemoPacedCommand.Clear,
      (originalFn, subject, ...args) => {
        return this.pace({
          subject,
          action: () => {
            return originalFn(subject, ...args);
          },
        });
      },
    );

    Cypress.Commands.overwrite<DemoPacedCommand.Check, "element">(
      DemoPacedCommand.Check,
      (originalFn, subject, ...args) => {
        return this.pace({
          subject,
          action: () => {
            return originalFn(subject, ...args);
          },
        });
      },
    );

    Cypress.Commands.overwrite<DemoPacedCommand.Uncheck, "element">(
      DemoPacedCommand.Uncheck,
      (originalFn, subject, ...args) => {
        return this.pace({
          subject,
          action: () => {
            return originalFn(subject, ...args);
          },
        });
      },
    );

    Cypress.Commands.overwrite<DemoPacedCommand.Select, "element">(
      DemoPacedCommand.Select,
      (originalFn, subject, ...args) => {
        return this.pace({
          subject,
          action: () => {
            return originalFn(subject, ...args);
          },
        });
      },
    );

    Cypress.Commands.overwrite<DemoPacedCommand.SelectFile, "element">(
      DemoPacedCommand.SelectFile,
      (originalFn, subject, ...args) => {
        return this.pace({
          subject,
          action: () => {
            return originalFn(subject, ...args);
          },
        });
      },
    );
  }

  private pace({
    subject,
    action,
  }: PaceProps): Cypress.Chainable<JQuery<HTMLElement>> {
    if (subject.length === 0) {
      return action();
    }

    const element = subject[0];
    element.scrollIntoView({ block: "center", behavior: "smooth" });

    const paced = Cypress.Promise.delay(DemoTiming.Scroll)
      .then(() => {
        this.overlay.pointAt({ element });
      })
      .delay(DemoTiming.BeforeAction)
      .then(() => {
        this.overlay.press({ element });

        return action();
      })
      .then(() => {
        this.overlay.release({ element });
      })
      .delay(DemoTiming.AfterAction)
      .then(() => {
        return subject;
      });

    // Cypress exige que el comando sobrescrito devuelva él mismo la promesa:
    // `originalFn` usa `state("current")` y, dentro de un `cy.wrap`, el comando
    // actual es el `wrap` y la implementación se cuelga. Los tipos esperan un
    // `Chainable`, y TypeScript no acepta la promesa de Bluebird sin pasar por
    // `unknown`. Decisión (usuario, 2026-11-27): este es el único `unknown` del kit.
    return paced as unknown as Cypress.Chainable<JQuery<HTMLElement>>;
  }
}
