export function focusFirstInvalid(container: HTMLElement | null): boolean {
  const target = container?.querySelector<HTMLElement>('[aria-invalid="true"]');
  if (target === undefined || target === null) return false;
  target.focus();
  return true;
}
