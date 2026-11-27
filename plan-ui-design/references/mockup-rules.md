# Mockup HTML del plan (opcional)

Una maqueta estática que simula los estilos de la app para ver cómo quedaría una pantalla y pedir cambios **antes** de escribir `tasks.md`. **(Decisión del usuario, 2026-11-27.)**

## Cuándo se ofrece

- Solo si el plan **crea o rediseña** una pantalla, modal, formulario o tabla concreta. Un ajuste menor o un plan sin interfaz no lo ofrece.
- Con `design.md` ya **aprobado** y **antes** de `tasks.md`. Se pregunta con `AskUserQuestion` ("¿Genero un mockup HTML de las pantallas antes de escribir `tasks.md`?"); nunca se genera sin que el usuario diga que sí. Si dice que no, se sigue con `tasks.md`.

## Cómo se genera (barato y fiel)

1. **Hoja base por repo de interfaz**: `mockup/base.css` con los tokens reales (colores, tipografía, radios, espaciado, tema claro/oscuro) leídos del repo con `ui-evidence.md`. Si el perfil del proyecto ya registra una hoja base vigente, se reutiliza y solo se actualiza lo que cambió; no se reinventa por plan.
2. **Un `mockup/index.html` por plan**, autocontenido (CSS inline o `base.css` enlazado, JS mínimo solo para alternar estados). Reproduce la **pantalla equivalente** citada en `design.md` y usa las mismas clases/estructura visual de los componentes del árbol aprobado.
3. **Estados = los de la matriz de `design.md`** (normal, carga, vacío, error, sin permiso, extremos de contenido), con un selector arriba para alternar. Nada que `design.md` no declare.
4. Datos de ejemplo realistas, incluidos un extremo largo y uno vacío. Textos con los strings reales del diseño.
5. Lleva un aviso visible: «Aproximación visual, no el componente real». Sin llamadas a red ni lógica de negocio.

## Después

- La carpeta va en el spec (`docs/specs/<estado>/<slug>/mockup/`), se commitea con él y se mueve con él entre estados. No es un documento a aprobar.
- Se entrega al usuario (ruta absoluta del `index.html`) y se **itera con Edit** hasta que diga que está bien. Cada cambio visual que cambie lo decidido se refleja también en `design.md`, y cada ronda se commitea.
- Solo con el visto bueno del usuario se escribe `tasks.md`.
