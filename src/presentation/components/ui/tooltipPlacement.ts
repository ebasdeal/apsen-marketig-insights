const MARGIN = 10;
const GAP = 8;
const ARROW_HALF = 5;
const SIDEBAR_ID = 'app-sidebar';
const WIDE_MAX = 760;
const BOX_PADDING_Y = 22;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

/** Posiciona o balão (position: fixed) a partir do gatilho: abaixo e centralizado, vira para cima
 *  se faltar espaço e nunca sai da viewport nem fica sob a sidebar aberta. */
export function placeTooltip(
  trigger: HTMLElement,
  box: HTMLElement,
  content: HTMLElement,
  arrow: HTMLElement,
): void {
  const anchor = trigger.getBoundingClientRect();
  const viewportW = document.documentElement.clientWidth;
  const viewportH = document.documentElement.clientHeight;
  const sidebarRight = document.getElementById(SIDEBAR_ID)?.getBoundingClientRect().right ?? 0;
  const minLeft = Math.max(sidebarRight, 0) + MARGIN;
  const roomBelow = viewportH - anchor.bottom - GAP - MARGIN;
  const roomAbove = anchor.top - GAP - MARGIN;
  const room = Math.max(roomBelow, roomAbove);

  // Texto longo: primeiro alarga o balão; se ainda não couber nem acima nem abaixo do gatilho, ocupa
  // a altura da viewport (cobrindo o gatilho, sem seta) em vez de cortar o conteúdo.
  box.style.maxWidth = '';
  content.style.maxHeight = '';
  if (box.offsetHeight > room) {
    box.style.maxWidth = `${Math.min(WIDE_MAX, viewportW - minLeft - MARGIN)}px`;
  }
  if (box.offsetHeight > room) {
    content.style.maxHeight = `${Math.max(viewportH - 2 * MARGIN - BOX_PADDING_Y, 60)}px`;
  }
  const width = box.offsetWidth;
  const height = box.offsetHeight;
  const maxLeft = Math.max(viewportW - MARGIN - width, minLeft);
  const center = anchor.left + anchor.width / 2;
  const left = clamp(center - width / 2, minLeft, maxLeft);

  const below = roomBelow >= height || roomBelow >= roomAbove;
  const top = clamp(
    below ? anchor.bottom + GAP : anchor.top - GAP - height,
    MARGIN,
    Math.max(viewportH - MARGIN - height, MARGIN),
  );

  box.style.transform = `translate(${Math.round(left)}px, ${Math.round(top)}px)`;
  const overlaps = top < anchor.bottom + GAP && top + height > anchor.top - GAP;
  arrow.dataset.placement = overlaps ? 'none' : below ? 'below' : 'above';
  arrow.style.left = `${Math.round(clamp(center - left, 14, width - 14) - ARROW_HALF)}px`;
}
