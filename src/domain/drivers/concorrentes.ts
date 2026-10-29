export const LIMITE_SUGESTOES_SEM_TERMO = 12;

export function filtrarSugestoes(lista: readonly string[], termo: string): string[] {
  const busca = termo.trim().toLowerCase();
  if (busca === '') {
    return lista.slice(0, LIMITE_SUGESTOES_SEM_TERMO);
  }
  return lista.filter((item) => item.toLowerCase().includes(busca));
}
