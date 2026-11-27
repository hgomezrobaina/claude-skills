/**
 * Tiempos del modo demo, en milisegundos. Salen de la prueba de concepto del
 * plan `plan-demo-videos` (2026-11-27): lo bastante largos para seguir cada
 * acción en el video, lo bastante cortos para que un caso dure ~15 s.
 */
export enum DemoTiming {
  /** Espera tras desplazar el elemento al centro de la pantalla. */
  Scroll = 350,
  /** Duración del viaje del cursor (la transición CSS del overlay). */
  CursorTravel = 600,
  /** Pausa con el cursor ya sobre el elemento, antes de actuar. */
  BeforeAction = 700,
  /** Pausa tras actuar, para ver el efecto. */
  AfterAction = 650,
  /** Retardo entre letras al escribir. */
  TypeDelay = 70,
  /** Tiempo que el resultado final se queda en pantalla al cerrar un caso. */
  Hold = 2500,
}

/**
 * Comandos de interacción a los que el modo demo les da ritmo humano. `trigger`
 * queda fuera a propósito: los arrastres y los eventos sintéticos de bajo nivel
 * se rompen si se pausan.
 */
export enum DemoPacedCommand {
  Click = "click",
  Dblclick = "dblclick",
  Rightclick = "rightclick",
  Type = "type",
  Clear = "clear",
  Check = "check",
  Uncheck = "uncheck",
  Select = "select",
  SelectFile = "selectFile",
}
