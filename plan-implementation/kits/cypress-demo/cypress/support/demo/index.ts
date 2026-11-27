import { DemoCaptions } from "./demo-captions";
import { DemoOverlay } from "./demo-overlay";
import { DemoPacing } from "./demo-pacing";

/**
 * Punto de entrada del modo demo. Sin `CYPRESS_demo=true` (o `--env demo=true`) no registra nada: la
 * suite corre igual que sin el kit.
 */
const demo: string | boolean | undefined = Cypress.env("demo");

if (demo === true || demo === "true") {
  const overlay = new DemoOverlay();
  overlay.register();

  const pacing = new DemoPacing({ overlay });
  pacing.register();

  const captions = new DemoCaptions({ overlay });
  captions.register();
}
