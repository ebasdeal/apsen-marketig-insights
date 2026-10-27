export function nextTabIndex(current: number, total: number, key: string): number | null {
  switch (key) {
    case 'ArrowRight':
      return (current + 1) % total;
    case 'ArrowLeft':
      return (current - 1 + total) % total;
    case 'Home':
      return 0;
    case 'End':
      return total - 1;
    default:
      return null;
  }
}
