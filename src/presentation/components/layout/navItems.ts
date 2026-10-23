import { CAMPAIGNS_ROUTE } from '@presentation/navigation/routes';
import type { Route } from 'next';

export type NavBadgeTone = 'blue' | 'teal' | 'red' | 'purple' | 'orange' | 'gray' | 'soon';

export interface NavLeaf {
  href: Route;
  label: string;
  badge?: { value: number; tone: NavBadgeTone };
}

export interface NavModule {
  key: string;
  label: string;
  items: readonly NavLeaf[];
}

export const NAV_ROOT: NavLeaf = { href: '/', label: 'Dashboard' };

export const NAV_MODULES: readonly NavModule[] = [
  {
    key: 'campanhas',
    label: 'Campanhas',
    items: [{ href: CAMPAIGNS_ROUTE, label: 'Todas as Campanhas' }],
  },
];
