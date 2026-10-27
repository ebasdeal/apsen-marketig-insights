import type { CampoOpcao, CampoTipo, Categoria, TipoDaCategoria, TipoStatus } from './lookups';

export const PARAM_LABORATORIO = 'lab_conc';

export const PARAM_MARCA = 'conc_nome';

export const PARAMS_PRECO = { anterior: 'preco_ant', novo: 'preco_novo', variacao: 'var_preco' };

export const PARAM_MOLECULA_HERDADA: Readonly<Record<string, string>> = {
  concorrente: 'mol_conc',
  conc_lanc: 'cl_molecula',
};

export interface DraftMolecula {
  modo: 'franquia' | 'familia' | 'sku';
  familia: string;
  sku: { familia: string } | null;
}

export interface GrupoOpcoes {
  grupo: string;
  opcoes: string[];
}

export interface OpcoesSelect {
  soltas: string[];
  grupos: GrupoOpcoes[];
}

export function valorDaOpcao(opcao: CampoOpcao): string {
  return typeof opcao === 'string' ? opcao : opcao.label;
}

export function valoresIniciais(campos: readonly CampoTipo[]): Record<string, string> {
  return Object.fromEntries(
    campos.map((campo) => {
      const primeira = campo.type === 'select' ? campo.options?.[0] : undefined;
      return [campo.param, primeira === undefined ? '' : valorDaOpcao(primeira)];
    }),
  );
}

export function moleculaHerdada(draft: DraftMolecula): string | null {
  const molecula =
    draft.modo === 'sku'
      ? (draft.sku?.familia ?? '')
      : draft.modo === 'familia'
        ? draft.familia
        : '';
  return molecula === '' ? null : molecula;
}

export function montarParametros(
  campos: readonly CampoTipo[],
  valores: Readonly<Record<string, string>>,
  preservar?: Readonly<Record<string, string>>,
): Record<string, string> {
  const params = new Set(campos.map((campo) => campo.param));
  const resultado: Record<string, string> = {};
  Object.entries(preservar ?? {}).forEach(([chave, valor]) => {
    if (!params.has(chave) && valor.trim() !== '') {
      resultado[chave] = valor;
    }
  });
  campos.forEach((campo) => {
    const valor = (valores[campo.param] ?? '').trim();
    if (valor !== '') {
      resultado[campo.param] = valor;
    }
  });
  return resultado;
}

export function slugsAtivos(
  categorias: readonly Categoria[],
  tipos: readonly TipoStatus[],
): string[] {
  const inativos = new Set(tipos.filter((tipo) => !tipo.ativo).map((tipo) => tipo.slug));
  const slugs = categorias.flatMap((categoria) => categoria.tipos.map((tipo) => tipo.slug));
  return [...new Set(slugs)].filter((slug) => !inativos.has(slug));
}

export function tiposDisponiveis(
  categoria: Categoria | undefined,
  ativos: readonly string[],
  tipoAtual = '',
): TipoDaCategoria[] {
  return (categoria?.tipos ?? []).filter(
    (tipo) => ativos.includes(tipo.slug) || tipo.slug === tipoAtual,
  );
}

export function opcoesDoSelect(campo: CampoTipo, valorAtual = ''): OpcoesSelect {
  const soltas: string[] = [];
  const grupos: GrupoOpcoes[] = [];
  (campo.options ?? []).forEach((opcao) => {
    if (typeof opcao === 'string') {
      soltas.push(opcao);
      return;
    }
    const grupo = grupos.find((candidato) => candidato.grupo === opcao.group);
    if (grupo === undefined) {
      grupos.push({ grupo: opcao.group, opcoes: [opcao.label] });
    } else {
      grupo.opcoes.push(opcao.label);
    }
  });
  const conhecidas = [...soltas, ...grupos.flatMap((grupo) => grupo.opcoes)];
  if (valorAtual !== '' && !conhecidas.includes(valorAtual)) {
    soltas.push(valorAtual);
  }
  return { soltas, grupos };
}
