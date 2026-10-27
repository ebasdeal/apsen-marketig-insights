import type { NavBadgeKey } from '@domain/navegacao/NavBadges';
import type { ModuloId } from '@domain/perfis/acesso';
import type { ScreenId } from '@presentation/navigation/screens';

export type NavBadgeTone = 'blue' | 'teal' | 'red' | 'purple' | 'orange' | 'gray' | 'soon';

export type NavAccent = 'blue' | 'teal' | 'purple';

export interface NavLeaf {
  screenId: ScreenId;
  href: string;
  label: string;
  badge?: { key: NavBadgeKey | 'soon'; tone: NavBadgeTone };
}

export interface NavModule {
  id: ModuloId;
  label: string;
  accent?: NavAccent;
  items: readonly NavLeaf[];
}

export const SOON_BADGE_LABEL = 'em breve';

export const NAV_ROOT: NavLeaf = { screenId: 'dashboard', href: '/', label: 'Dashboard' };

export const NAV_MODULES: readonly NavModule[] = [
  {
    id: 'drivers',
    label: 'Drivers de Demanda',
    accent: 'blue',
    items: [
      { screenId: 'form', href: '/drivers/novo', label: 'Registrar Driver' },
      {
        screenId: 'lista',
        href: '/drivers',
        label: 'Meus Registros',
        badge: { key: 'lista', tone: 'blue' },
      },
      { screenId: 'catalogo', href: '/drivers/catalogo', label: 'Catálogo de Produtos' },
      { screenId: 'export', href: '/drivers/exportar', label: 'Exportar JSON' },
    ],
  },
  {
    id: 'admin',
    label: 'Administração DI',
    accent: 'teal',
    items: [
      {
        screenId: 'ciclos',
        href: '/admin/ciclos',
        label: 'Ciclos de Planejamento',
        badge: { key: 'ciclos', tone: 'orange' },
      },
      {
        screenId: 'tipos',
        href: '/admin/tipos',
        label: 'Catálogo de Tipos',
        badge: { key: 'tipos', tone: 'teal' },
      },
      {
        screenId: 'aprovacoes',
        href: '/admin/aprovacoes',
        label: 'Fila de Aprovação',
        badge: { key: 'aprovacoes', tone: 'red' },
      },
      { screenId: 'ingeridos', href: '/admin/ingeridos', label: 'Drivers Ingeridos' },
      { screenId: 'fontes', href: '/admin/fontes', label: 'Fontes de Dados / APIs' },
    ],
  },
  {
    id: 'acesso',
    label: 'Controle de Acesso',
    accent: 'purple',
    items: [
      {
        screenId: 'usuarios',
        href: '/acesso/usuarios',
        label: 'Usuários',
        badge: { key: 'usuarios', tone: 'purple' },
      },
      { screenId: 'perfis', href: '/acesso/perfis', label: 'Perfis de Acesso' },
      { screenId: 'user-form', href: '/acesso/usuarios/novo', label: 'Novo Usuário' },
    ],
  },
  {
    id: 'agentes',
    label: 'Agentes de IA',
    items: [
      {
        screenId: 'agentes',
        href: '/agentes',
        label: 'Agentes Cadastrados',
        badge: { key: 'agentes', tone: 'purple' },
      },
    ],
  },
  {
    id: 'analises',
    label: 'Análises',
    items: [
      {
        screenId: 'analises',
        href: '/analises',
        label: 'Minhas Análises',
        badge: { key: 'analises', tone: 'orange' },
      },
    ],
  },
  {
    id: 'restricoes',
    label: 'Restrições & Alertas',
    items: [
      {
        screenId: 'restricoes',
        href: '/restricoes',
        label: 'Restrições Ativas',
        badge: { key: 'restricoes', tone: 'red' },
      },
    ],
  },
  {
    id: 'planos',
    label: 'Planos de Produção',
    items: [
      {
        screenId: 'planos',
        href: '/planos',
        label: 'PLP Ativo',
        badge: { key: 'planos', tone: 'blue' },
      },
    ],
  },
  {
    id: 'relatorios',
    label: 'Relatórios',
    items: [
      {
        screenId: 'relatorios',
        href: '/relatorios',
        label: 'A definir',
        badge: { key: 'soon', tone: 'soon' },
      },
    ],
  },
];
