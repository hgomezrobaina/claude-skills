import { DemoTiming } from "./demo-timing";

enum DemoDom {
  Style = "demo-style",
  Cursor = "demo-cursor",
  Caption = "demo-caption",
  Ring = "demo-ring",
  Press = "press",
  Blank = "demo-blank",
}

const FONT_FAMILY = '"DejaVu Sans", Arial, sans-serif';

const OVERLAY_CSS = `
  #${DemoDom.Cursor} {
    position: fixed; z-index: 2147483647; width: 22px; height: 22px;
    margin: -11px 0 0 -11px; border-radius: 50%;
    background: rgba(124, 58, 237, 0.35); border: 2px solid #7c3aed;
    pointer-events: none; left: 50%; top: 50%;
    transition: left ${DemoTiming.CursorTravel}ms cubic-bezier(0.2, 0.8, 0.2, 1),
      top ${DemoTiming.CursorTravel}ms cubic-bezier(0.2, 0.8, 0.2, 1),
      transform 150ms ease-out;
  }
  #${DemoDom.Cursor}.${DemoDom.Press} { transform: scale(0.7); }
  #${DemoDom.Caption} {
    position: fixed; z-index: 2147483646; left: 50%; bottom: 28px;
    transform: translateX(-50%); max-width: 80%; padding: 12px 20px;
    border-radius: 10px; background: rgba(17, 17, 27, 0.88); color: #fff;
    font: 500 18px/1.4 ${FONT_FAMILY}; text-align: center;
    pointer-events: none; display: none;
  }
  #${DemoDom.Caption} b { color: #c4b5fd; margin-right: 8px; }
  .${DemoDom.Ring} { outline: 3px solid #7c3aed !important; outline-offset: 2px !important; }
  /* Entre tests, y mientras se siembra y se inicia sesión, la aplicación es la
     página en blanco de Cypress («Default blank page…»): se oculta su texto. */
  html.${DemoDom.Blank}, html.${DemoDom.Blank} body { background: #fff !important; }
  html.${DemoDom.Blank} body > :not(#${DemoDom.Cursor}):not(#${DemoDom.Caption}) { display: none !important; }
`;

interface CaptionState {
  id: string;
  text: string;
}

interface CursorPosition {
  x: number;
  y: number;
}

interface DocProps {
  doc: Document;
}

interface ElementProps {
  element: HTMLElement;
}

interface ShowCaptionProps {
  doc: Document;
  id: string;
  text: string;
}

/**
 * Capa visual del modo demo: cursor falso, anillo sobre el elemento y
 * subtítulo. Vive dentro del documento de la aplicación y se vuelve a montar
 * tras cada carga de página, recordando dónde estaba el cursor y qué decía el
 * subtítulo.
 */
export class DemoOverlay {
  private caption: CaptionState | null = null;
  private position: CursorPosition | null = null;

  register(): void {
    Cypress.on("window:load", (win) => {
      this.mount({ doc: win.document });
    });
  }

  mount({ doc }: DocProps): void {
    if (doc.getElementById(DemoDom.Cursor) !== null) {
      return;
    }

    if (doc.URL === "about:blank") {
      doc.documentElement.classList.add(DemoDom.Blank);
    }

    const style = doc.createElement("style");
    style.id = DemoDom.Style;
    style.textContent = OVERLAY_CSS;
    doc.head.appendChild(style);

    const cursor = doc.createElement("div");
    cursor.id = DemoDom.Cursor;

    if (this.position !== null) {
      cursor.style.left = `${this.position.x}px`;
      cursor.style.top = `${this.position.y}px`;
    }

    doc.body.appendChild(cursor);

    const caption = doc.createElement("div");
    caption.id = DemoDom.Caption;
    doc.body.appendChild(caption);
    this.paintCaption({ doc });
  }

  pointAt({ element }: ElementProps): void {
    const rect = element.getBoundingClientRect();

    if (rect.width === 0 && rect.height === 0) {
      return;
    }

    const doc = element.ownerDocument;
    this.mount({ doc });

    const cursor = doc.getElementById(DemoDom.Cursor);

    if (cursor === null) {
      return;
    }

    this.position = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    cursor.style.left = `${this.position.x}px`;
    cursor.style.top = `${this.position.y}px`;
    element.classList.add(DemoDom.Ring);
  }

  press({ element }: ElementProps): void {
    element.classList.remove(DemoDom.Ring);
    element.ownerDocument
      .getElementById(DemoDom.Cursor)
      ?.classList.add(DemoDom.Press);
  }

  release({ element }: ElementProps): void {
    element.classList.remove(DemoDom.Ring);
    element.ownerDocument
      .getElementById(DemoDom.Cursor)
      ?.classList.remove(DemoDom.Press);
  }

  showCaption({ doc, id, text }: ShowCaptionProps): void {
    this.caption = { id, text };
    this.mount({ doc });
    this.paintCaption({ doc });
  }

  clearCaption({ doc }: DocProps): void {
    this.caption = null;
    this.paintCaption({ doc });
  }

  private paintCaption({ doc }: DocProps): void {
    const element = doc.getElementById(DemoDom.Caption);

    if (element === null) {
      return;
    }

    if (this.caption === null) {
      element.style.display = "none";

      return;
    }

    const id = doc.createElement("b");
    id.textContent = this.caption.id;
    element.replaceChildren(id, doc.createTextNode(this.caption.text));
    element.style.display = "block";
  }
}
