import type { ModuloId } from '@domain/perfis/acesso';
import type { NivelAcesso } from '@domain/perfis/Perfil';

export type ScreenId =
  | 'dashboard'
  | 'form'
  | 'lista'
  | 'catalogo'
  | 'catalogo-drivers'
  | 'export'
  | 'ciclos'
  | 'tipos'
  | 'tipo-form'
  | 'aprovacoes'
  | 'ingeridos'
  | 'fontes'
  | 'usuarios'
  | 'user-form'
  | 'perfis'
  | 'agentes'
  | 'agente-form'
  | 'analises'
  | 'analise-form'
  | 'analise-view'
  | 'restricoes'
  | 'planos'
  | 'plano-item'
  | 'relatorios'
  | 'denied';

export interface ScreenDef {
  id: ScreenId;
  patterns: readonly string[];
  crumb: string;
  nivelMinimo: NivelAcesso | null;
  modulo: ModuloId | null;
}

function screen(
  id: ScreenId,
  patterns: readonly string[],
  crumb: string,
  nivelMinimo: NivelAcesso | null,
  modulo: ModuloId | null,
): ScreenDef {
  return { id, patterns, crumb, nivelMinimo, modulo };
}

export const SCREENS: readonly ScreenDef[] = [
  screen('dashboard', ['/'], 'Dashboard', 1, null),
  screen(
    'form',
    ['/drivers/novo', '/drivers/[id]', '/drivers/[id]/editar'],
    'Registrar Driver',
    2,
    'drivers',
  ),
  screen('lista', ['/drivers'], 'Meus Registros', 2, 'drivers'),
  screen('catalogo', ['/drivers/catalogo'], 'Catálogo de Produtos', 2, 'drivers'),
  screen('catalogo-drivers', ['/drivers/catalogo/[familia]'], 'Drivers da Família', 2, 'drivers'),
  screen('export', ['/drivers/exportar'], 'Exportar JSON', 3, 'drivers'),
  screen('ciclos', ['/admin/ciclos'], 'Ciclos de Planejamento', 3, 'admin'),
  screen('tipos', ['/admin/tipos'], 'Catálogo de Tipos', 3, 'admin'),
  screen('tipo-form', ['/admin/tipos/novo', '/admin/tipos/[slug]/editar'], 'Novo Tipo', 3, 'admin'),
  screen('aprovacoes', ['/admin/aprovacoes'], 'Fila de Aprovação', 3, 'admin'),
  screen('ingeridos', ['/admin/ingeridos'], 'Drivers Ingeridos', 3, 'admin'),
  screen('fontes', ['/admin/fontes'], 'Fontes de Dados / APIs', 3, 'admin'),
  screen('usuarios', ['/acesso/usuarios'], 'Usuários', 4, 'acesso'),
  screen(
    'user-form',
    ['/acesso/usuarios/novo', '/acesso/usuarios/[id]/editar'],
    'Novo Usuário',
    4,
    'acesso',
  ),
  screen('perfis', ['/acesso/perfis'], 'Perfis de Acesso', 3, 'acesso'),
  screen('agentes', ['/agentes'], 'Agentes de IA', 4, 'agentes'),
  screen('agente-form', ['/agentes/novo', '/agentes/[id]/editar'], 'Novo Agente', 4, 'agentes'),
  screen('analises', ['/analises'], 'Minhas Análises', 2, 'analises'),
  screen('analise-form', ['/analises/nova'], 'Nova Análise', 2, 'analises'),
  screen('analise-view', ['/analises/[id]'], 'Análise', 2, 'analises'),
  screen('restricoes', ['/restricoes'], 'Restrições & Alertas', 3, 'restricoes'),
  screen('planos', ['/planos'], 'Planos de Produção', 1, 'planos'),
  screen('plano-item', ['/planos/[id]'], 'Detalhe do Item', 1, 'planos'),
  screen('relatorios', ['/relatorios'], 'Relatórios', 1, 'relatorios'),
  screen('denied', ['/acesso-negado'], 'Acesso Negado', null, null),
];

interface Candidate {
  screen: ScreenDef;
  segments: readonly string[];
}

function segmentsOf(path: string): string[] {
  return path.split('/').filter((segment) => segment !== '');
}

function isParam(segment: string): boolean {
  return segment.startsWith('[') && segment.endsWith(']');
}

function normalize(pathname: string): string {
  return pathname.split(/[?#]/)[0] ?? '';
}

function fits(pattern: readonly string[], path: readonly string[]): boolean {
  return (
    pattern.length === path.length &&
    pattern.every((segment, index) => isParam(segment) || segment === path[index])
  );
}

function bySpecificity(a: Candidate, b: Candidate): number {
  const index = a.segments.findIndex(
    (segment, position) => isParam(segment) !== isParam(b.segments[position] ?? ''),
  );
  if (index === -1) {
    return 0;
  }
  return isParam(a.segments[index] ?? '') ? 1 : -1;
}

const CANDIDATES: readonly Candidate[] = SCREENS.flatMap((def) =>
  def.patterns.map((pattern) => ({ screen: def, segments: segmentsOf(pattern) })),
);

export function matchScreen(pathname: string): ScreenDef | null {
  const path = segmentsOf(normalize(pathname));
  const [best] = CANDIDATES.filter((candidate) => fits(candidate.segments, path)).sort(
    bySpecificity,
  );
  return best?.screen ?? null;
}

function paramNames(pattern: string): string[] {
  return segmentsOf(pattern)
    .filter(isParam)
    .map((segment) => segment.slice(1, -1));
}

export function screenHref(id: ScreenId, params: Record<string, string> = {}): string {
  const def = SCREENS.find((candidate) => candidate.id === id);
  const keys = Object.keys(params).sort();
  const pattern = def?.patterns.find(
    (candidate) => paramNames(candidate).sort().join() === keys.join(),
  );
  if (pattern === undefined) {
    throw new Error(`Rota da tela ${id} não aceita os parâmetros [${keys.join(', ')}]`);
  }
  return pattern.replace(/\[(\w+)\]/g, (_match, name: string) =>
    encodeURIComponent(params[name] ?? ''),
  );
}
