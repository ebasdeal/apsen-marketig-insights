export type NavBadgeKey =
  | 'lista'
  | 'ciclos'
  | 'tipos'
  | 'aprovacoes'
  | 'usuarios'
  | 'agentes'
  | 'analises'
  | 'restricoes'
  | 'planos';

export interface ContagemSpec {
  colecao: string;
  filtro?: Readonly<Record<string, string>>;
}

export const NAV_BADGE_CONTAGENS: Record<NavBadgeKey, ContagemSpec> = {
  lista: { colecao: 'drivers' },
  ciclos: { colecao: 'ciclos' },
  tipos: { colecao: 'tipos' },
  aprovacoes: { colecao: 'aprovacoes', filtro: { status: 'pendente' } },
  usuarios: { colecao: 'usuarios' },
  agentes: { colecao: 'agentes' },
  analises: { colecao: 'analises' },
  restricoes: { colecao: 'restricoes', filtro: { status: 'ativa' } },
  planos: { colecao: 'planoItens' },
};

export type NavBadges = Record<NavBadgeKey, number | null>;
