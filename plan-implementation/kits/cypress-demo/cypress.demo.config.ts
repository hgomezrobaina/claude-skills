import { defineConfig } from "cypress";

import { DemoNodeEvents } from "./cypress/demo/demo-node-events";
import baseConfig from "./cypress.config";

/**
 * Configuración del modo demo: la del proyecto más lo que pide la grabación.
 * Se usa solo con `--config-file cypress.demo.config.ts`; la corrida normal ni
 * sabe que existe. Los videos crudos van a `--env demoOut=<carpeta>`.
 */
const demoNodeEvents = new DemoNodeEvents();

export default defineConfig({
  ...baseConfig,
  e2e: {
    ...baseConfig.e2e,
    video: true,
    // El corte final ya re-codifica: comprimir dos veces degrada el texto.
    videoCompression: false,
    // Un reintento duplicaría el caso dentro del mismo video.
    retries: 0,
    // Un caso que falla no genera clip, así que la captura sobra.
    screenshotOnRunFailure: false,
    setupNodeEvents(on, config) {
      return demoNodeEvents.execute({
        on,
        config,
        projectSetup: baseConfig.e2e?.setupNodeEvents,
      });
    },
  },
});
