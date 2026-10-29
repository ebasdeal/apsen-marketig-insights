import type { Permissao } from './Permissao';

export type CelulaKind = 'sim' | 'nao' | 'parcial';

export interface Celula {
  kind: CelulaKind;
  texto: string;
  detalhe?: string;
}

export interface GrupoPermissoes {
  grupo: string;
  permissoes: Permissao[];
}

const SIM = '✓';

export function agruparPermissoes(list: readonly Permissao[]): GrupoPermissoes[] {
  const grupos = new Map<string, Permissao[]>();
  list.forEach((permissao) => {
    const linhas = grupos.get(permissao.grupo) ?? [];
    linhas.push(permissao);
    grupos.set(permissao.grupo, linhas);
  });
  return Array.from(grupos, ([grupo, permissoes]) => ({ grupo, permissoes }));
}

export function celula(valor: string): Celula {
  const texto = valor.trim();
  if (texto === SIM) {
    return { kind: 'sim', texto };
  }
  if (texto.startsWith(SIM)) {
    return { kind: 'parcial', texto: SIM, detalhe: texto.slice(SIM.length).trim() };
  }
  return { kind: 'nao', texto };
}
