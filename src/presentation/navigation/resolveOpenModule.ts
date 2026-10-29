import type { ModuloId } from '@domain/perfis/acesso';

export interface AccordionChoice {
  module: ModuloId | null;
  atPath: string;
}

export const DEFAULT_OPEN_MODULE: ModuloId = 'drivers';

export function resolveOpenModule(
  screenModule: ModuloId | null,
  pathname: string,
  accordion: AccordionChoice | null,
): ModuloId | null {
  if (accordion !== null && accordion.atPath === pathname) {
    return accordion.module;
  }
  return screenModule ?? accordion?.module ?? DEFAULT_OPEN_MODULE;
}

export function nextAccordion(current: ModuloId | null, clicked: ModuloId): ModuloId | null {
  return current === clicked ? null : clicked;
}
