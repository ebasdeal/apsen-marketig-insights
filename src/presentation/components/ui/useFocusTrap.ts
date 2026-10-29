import { useEffect, type KeyboardEvent, type RefObject } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function focusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE));
}

let ultimoFoco: HTMLElement | null = null;

function acompanharFoco(): void {
  if (typeof document === 'undefined') {
    return;
  }
  document.addEventListener('focusin', (event) => {
    const alvo = event.target;
    if (alvo instanceof HTMLElement && alvo.closest('[role="dialog"]') === null) {
      ultimoFoco = alvo;
    }
  });
}
acompanharFoco();

export function useFocusTrap(
  ref: RefObject<HTMLElement | null>,
  onClose: () => void,
  initialFocus?: RefObject<HTMLElement | null>,
): (event: KeyboardEvent<HTMLElement>) => void {
  useEffect(() => {
    const ativo = document.activeElement;
    const previous = ativo instanceof HTMLElement && ativo !== document.body ? ativo : ultimoFoco;
    const rotulo = previous?.getAttribute('aria-label') ?? null;
    if (ref.current !== null) {
      (initialFocus?.current ?? focusableElements(ref.current)[0])?.focus();
    }
    return () => {
      if (previous?.isConnected === true) {
        previous.focus();
      } else if (rotulo !== null) {
        document.querySelector<HTMLElement>(`[aria-label="${CSS.escape(rotulo)}"]`)?.focus();
      }
    };
  }, [ref, initialFocus]);

  return (event) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== 'Tab' || ref.current === null) {
      return;
    }
    const items = focusableElements(ref.current);
    const first = items[0];
    const last = items[items.length - 1];
    if (first === undefined || last === undefined) {
      event.preventDefault();
      return;
    }
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };
}
