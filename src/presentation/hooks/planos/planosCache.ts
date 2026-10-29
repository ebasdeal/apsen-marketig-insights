import type { PlanoListOutput } from '@application/planos/dto';
import { NotFoundError } from '@domain/shared/DomainError';

const MAX_TENTATIVAS = 1;

export function paginaSemItem(pagina: PlanoListOutput, id: string): PlanoListOutput {
  const itens = pagina.itens.filter((item) => item.id !== id);
  const removidos = pagina.itens.length - itens.length;
  return { ...pagina, itens, total: Math.max(pagina.total - removidos, 0) };
}

export function totalAposExcluir(total: number): number {
  return Math.max(total - 1, 0);
}

export function tentarDeNovo(falhas: number, error: unknown): boolean {
  return !(error instanceof NotFoundError) && falhas < MAX_TENTATIVAS;
}
