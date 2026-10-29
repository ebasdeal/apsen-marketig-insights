'use client';

import type { NavBadges } from '@domain/navegacao/NavBadges';
import { itemVisivel } from '@domain/perfis/acesso';
import type { NivelAcesso } from '@domain/perfis/Perfil';
import type { ScreenId } from '@presentation/navigation/screens';
import type { Route } from 'next';
import Link from 'next/link';
import { useId } from 'react';
import { NavBadge } from './NavBadge';
import { useNav } from './NavContext';
import { SOON_BADGE_LABEL, type NavLeaf, type NavModule } from './navItems';

const HEADER_CLASS =
  'relative mt-[6px] flex w-full cursor-pointer select-none items-center gap-[8px] border-l-[3px] border-transparent pt-[10px] pr-[18px] pb-[6px] pl-[18px] text-left text-[10px] font-bold uppercase tracking-[.12em] text-apsen-muted-2 transition-all focus-ring';
const ITEM_CLASS =
  'flex select-none items-center gap-[8px] border-l-[3px] py-[8px] pr-[18px] pl-[44px] text-[13px] transition-all focus-ring';
const ITEM_ACTIVE = 'border-apsen-blue bg-apsen-blue-bg font-medium text-apsen-blue';
const ITEM_INACTIVE =
  'border-transparent text-apsen-muted hover:bg-apsen-hover hover:text-apsen-slate';

interface NavModuleGroupProps {
  module: NavModule;
  open: boolean;
  onToggle: () => void;
  activeScreenId: ScreenId | null;
  badges: NavBadges | undefined;
  nivel: NivelAcesso;
}

function badgeValue(item: NavLeaf, badges: NavBadges | undefined): number | string | null {
  if (item.badge === undefined) {
    return null;
  }
  if (item.badge.key === 'soon') {
    return SOON_BADGE_LABEL;
  }
  return badges?.[item.badge.key] ?? null;
}

export function NavModuleGroup({
  module,
  open,
  onToggle,
  activeScreenId,
  badges,
  nivel,
}: NavModuleGroupProps) {
  const { closeOnMobile } = useNav();
  const listId = useId();
  const items = module.items.filter((item) => itemVisivel(nivel, item.screenId));
  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={onToggle}
        className={HEADER_CLASS}
      >
        {module.label}
        <span
          aria-hidden
          className={`ml-auto text-[9px] text-apsen-muted-2 transition-transform duration-[180ms] motion-reduce:transition-none ${open ? 'rotate-180' : ''}`}
        >
          ▼
        </span>
      </button>
      <ul id={listId} hidden={!open}>
        {items.map((item) => {
          const active = item.screenId === activeScreenId;
          const value = badgeValue(item, badges);
          return (
            <li key={item.screenId}>
              <Link
                href={item.href as Route}
                onClick={closeOnMobile}
                aria-current={active ? 'page' : undefined}
                className={`${ITEM_CLASS} ${active ? ITEM_ACTIVE : ITEM_INACTIVE}`}
              >
                {item.label}
                {value === null || item.badge === undefined ? null : (
                  <NavBadge value={value} tone={item.badge.tone} />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
