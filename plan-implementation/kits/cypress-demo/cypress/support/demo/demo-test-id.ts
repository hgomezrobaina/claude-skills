const TEST_ID_PATTERN = /\bE2E-\d+\b/;

interface Props {
  title: string;
}

/**
 * Saca el `E2E-n` del título de un test. Sin ID el test corre igual en modo
 * demo, pero no genera clip.
 */
export class DemoTestId {
  execute({ title }: Props): string | null {
    const match = TEST_ID_PATTERN.exec(title);

    if (match === null) {
      return null;
    }

    return match[0];
  }
}
