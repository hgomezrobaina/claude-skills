/** Tarea de Node con la que el navegador deja una marca de tiempo en el video. */
export enum DemoTask {
  Mark = "demoMark",
}

export enum DemoMarkKind {
  Start = "start",
  End = "end",
  /** Primera carga real de la aplicación dentro del caso (no la página en blanco). */
  Ready = "ready",
}
