import type { AnaliseStatus } from '@domain/analises/Analise';
import type { UrlStateSpec } from '../../navigation/urlState';

export const ANALISES_URL_SPEC = {
  busca: { kind: 'string', default: '' },
  status: { kind: 'enum', default: '', values: ['', 'rascunho', 'salva', 'relatorio'] },
  pagina: { kind: 'int', default: 1, min: 1 },
} as const satisfies UrlStateSpec;

export function statusDoFiltro(valor: string): AnaliseStatus | '' {
  return valor === 'rascunho' || valor === 'salva' || valor === 'relatorio' ? valor : '';
}

export function rotuloContagem(total: number): string {
  return total === 1 ? 'análise' : 'análises';
}
