export type ToastTone = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: number;
  tone: ToastTone;
  message: string;
  version: number;
  leaving: boolean;
}

export const TOAST_DURATION_MS = 4000;

export const TOAST_ERROR_DURATION_MS = 6000;

export const TOAST_EXIT_MS = 200;

export const MAX_TOASTS = 3;

const PREFIXES: readonly [string, ToastTone][] = [
  ['✅', 'success'],
  ['❌', 'error'],
  ['⚠️', 'warning'],
  ['⚠', 'warning'],
];

export const TOAST_TITLES: Record<ToastTone, string> = {
  success: 'Tudo certo',
  error: 'Não foi possível concluir',
  warning: 'Atenção',
  info: 'Aviso',
};

export function parseToast(raw: string, tone?: ToastTone): { tone: ToastTone; message: string } {
  const text = raw.trim();
  const match = PREFIXES.find(([prefix]) => text.startsWith(prefix));
  if (match === undefined) {
    return { tone: tone ?? 'info', message: text };
  }
  return { tone: tone ?? match[1], message: text.slice(match[0].length).trim() };
}

export function durationOf(tone: ToastTone): number {
  return tone === 'error' ? TOAST_ERROR_DURATION_MS : TOAST_DURATION_MS;
}

export function pushToast(
  items: readonly ToastItem[],
  next: { tone: ToastTone; message: string },
  id: number,
): ToastItem[] {
  const existing = items.find(
    (item) => !item.leaving && item.tone === next.tone && item.message === next.message,
  );
  if (existing !== undefined) {
    return items.map((item) => (item === existing ? { ...item, version: item.version + 1 } : item));
  }
  const added: ToastItem = { id, ...next, version: 0, leaving: false };
  return [added, ...items].slice(0, MAX_TOASTS);
}
