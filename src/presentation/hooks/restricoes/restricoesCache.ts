import type { ContagemRestricoesOutput, RestricoesPaginaOutput } from '@application/restricoes/dto';

export function paginaSemRestricao(
  pagina: RestricoesPaginaOutput,
  id: string,
): RestricoesPaginaOutput {
  const itens = pagina.itens.filter((item) => item.id !== id);
  const removidos = pagina.itens.length - itens.length;
  return { ...pagina, itens, total: Math.max(pagina.total - removidos, 0) };
}

export function contagemAposResolver(contagem: ContagemRestricoesOutput): ContagemRestricoesOutput {
  return { ativas: Math.max(contagem.ativas - 1, 0), resolvidas: contagem.resolvidas + 1 };
}
