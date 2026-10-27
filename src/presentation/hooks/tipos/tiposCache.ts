import type { ListTiposResult, ToggleTipoInput } from '@application/tipos/dto';

export function aplicarToggle(
  result: ListTiposResult | undefined,
  { id, ativo }: ToggleTipoInput,
): ListTiposResult | undefined {
  if (result === undefined) {
    return undefined;
  }
  return {
    ...result,
    ativos: Math.max(0, result.ativos + (ativo ? 1 : -1)),
    rows: result.rows.map((row) => (row.id === id ? { ...row, ativo } : row)),
  };
}

export function aplicarRemocao(
  result: ListTiposResult | undefined,
  id: string,
  ativo: boolean | undefined,
): ListTiposResult | undefined {
  if (result === undefined) {
    return undefined;
  }
  const naPagina = result.rows.some((row) => row.id === id);
  return {
    ...result,
    rows: result.rows.filter((row) => row.id !== id),
    filtrados: naPagina ? Math.max(0, result.filtrados - 1) : result.filtrados,
    total: Math.max(0, result.total - 1),
    ativos: ativo === true ? Math.max(0, result.ativos - 1) : result.ativos,
  };
}

export function ativoEmCache(
  results: readonly (ListTiposResult | undefined)[],
  id: string,
): boolean | undefined {
  for (const result of results) {
    const row = result?.rows.find((candidato) => candidato.id === id);
    if (row !== undefined) {
      return row.ativo;
    }
  }
  return undefined;
}
