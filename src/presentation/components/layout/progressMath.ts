export const PROGRESS_DELAY_MS = 120;

export const PROGRESS_STEP_MS = 200;

export const PROGRESS_DONE_MS = 200;

export const PROGRESS_CAP = 85;

export const PROGRESS_START = 10;

export function nextProgress(value: number): number {
  return Math.min(PROGRESS_CAP, Math.round(value + (PROGRESS_CAP - value) * 0.25));
}

export function isInternalNavigation(anchor: HTMLAnchorElement, current: URL): boolean {
  if (anchor.target !== '' && anchor.target !== '_self') {
    return false;
  }
  if (anchor.hasAttribute('download')) {
    return false;
  }
  const destino = new URL(anchor.href, current);
  return (
    destino.origin === current.origin &&
    `${destino.pathname}${destino.search}` !== `${current.pathname}${current.search}`
  );
}
