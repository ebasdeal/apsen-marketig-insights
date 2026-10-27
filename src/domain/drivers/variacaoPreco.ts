function numero(valor: string): number | null {
  if (valor.trim() === '') {
    return null;
  }
  const n = Number(valor);
  return Number.isFinite(n) ? n : null;
}

export function variacaoPreco(anterior: string, novo: string): string | null {
  const a = numero(anterior);
  const n = numero(novo);
  if (a === null || n === null || a === 0) {
    return null;
  }
  return (((n - a) / a) * 100).toFixed(2);
}
