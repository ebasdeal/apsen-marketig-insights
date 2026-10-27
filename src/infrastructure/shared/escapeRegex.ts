export function escapeRegex(termo: string): string {
  return termo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
