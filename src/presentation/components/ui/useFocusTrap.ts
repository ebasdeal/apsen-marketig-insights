import { useEffect, type KeyboardEvent, type RefObject } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function focusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE));
}

export function useFocusTrap(
  ref: RefObject<HTMLElement | null>,
  onClose: () => void,
): (event: KeyboardEvent<HTMLElement>) => void {
  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (ref.current !== null) {
      focusableElements(ref.current)[0]?.focus();
    }
    return () => {
      if (previous?.isConnected === true) {
        previous.focus();
      }
    };
  }, [ref]);

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
