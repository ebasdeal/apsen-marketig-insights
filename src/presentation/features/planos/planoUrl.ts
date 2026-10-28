import {
  PLANO_FAMILIAS,
  PLANO_STATUS,
  TAMANHO_PADRAO,
  TAMANHOS_PAGINA,
} from '@domain/planos/planoConstants';
import type { PlanoFiltro, PlanoOrdem, PlanoStatus, TamanhoPagina } from '@domain/planos/PlanoItem';
import {
  buildUrlSearch,
  parseUrlState,
  type UrlStateSpec,
  type UrlValues,
} from '../../navigation/urlState';

const ORDENS = ['codigo-asc', 'codigo-desc', 'qtd-asc', 'qtd-desc'] as const;

export const PLANO_URL_SPEC = {
  busca: { kind: 'string', default: '' },
  familia: { kind: 'enum', default: '', values: ['', ...PLANO_FAMILIAS] },
  status: { kind: 'enum', default: '', values: ['', ...PLANO_STATUS] },
  ordem: { kind: 'enum', default: '', values: ['', ...ORDENS] },
  pagina: { kind: 'int', default: 1, min: 1 },
  tamanho: {
    kind: 'enum',
    default: String(TAMANHO_PADRAO),
    values: TAMANHOS_PAGINA.map(String),
  },
} satisfies UrlStateSpec;

export type PlanoUrlValues = UrlValues<typeof PLANO_URL_SPEC>;

export function ordemDeTexto(texto: string): PlanoOrdem {
  const [campo, direcao] = texto.split('-');
  if ((campo === 'codigo' || campo === 'qtd') && (direcao === 'asc' || direcao === 'desc')) {
    return { campo, direcao };
  }
  return null;
}

export function textoDeOrdem(ordem: PlanoOrdem): string {
  return ordem === null ? '' : `${ordem.campo}-${ordem.direcao}`;
}

export function filtroDaUrl(values: PlanoUrlValues): PlanoFiltro {
  return {
    busca: values.busca,
    familia: values.familia,
    status: values.status as PlanoStatus | '',
    ordem: ordemDeTexto(values.ordem),
    pagina: values.pagina,
    tamanho: Number(values.tamanho) as TamanhoPagina,
  };
}

export function lerFiltroPlano(params: URLSearchParams): PlanoFiltro {
  return filtroDaUrl(parseUrlState(params, PLANO_URL_SPEC));
}

export function urlDoFiltro(filtro: PlanoFiltro): PlanoUrlValues {
  return {
    busca: filtro.busca,
    familia: filtro.familia,
    status: filtro.status,
    ordem: textoDeOrdem(filtro.ordem),
    pagina: filtro.pagina,
    tamanho: String(filtro.tamanho),
  };
}

export function escreverFiltroPlano(filtro: PlanoFiltro): string {
  return buildUrlSearch(new URLSearchParams(), PLANO_URL_SPEC, urlDoFiltro(filtro)).replace(
    /^\?/,
    '',
  );
}
