import type { ListRestricoesInput, RestricoesAba } from '@application/restricoes/dto';
import { buildUrlSearch, parseUrlState, type UrlStateSpec } from '../../navigation/urlState';

export const RESTRICOES_ROUTE = '/restricoes';

export const RESTRICOES_URL_SPEC = {
  aba: { kind: 'enum', default: 'ativas', values: ['ativas', 'resolvidas'] },
  pagina: { kind: 'int', default: 1, min: 1 },
} satisfies UrlStateSpec;

export function lerFiltroRestricoes(params: URLSearchParams): ListRestricoesInput {
  const { aba, pagina } = parseUrlState(params, RESTRICOES_URL_SPEC);
  return { aba: aba as RestricoesAba, pagina };
}

export function escreverFiltroRestricoes(filtro: ListRestricoesInput): string {
  return buildUrlSearch(new URLSearchParams(), RESTRICOES_URL_SPEC, filtro).replace(/^\?/, '');
}
