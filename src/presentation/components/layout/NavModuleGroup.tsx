'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useId, useState } from 'react';
import { isActiveRoute } from './isActiveRoute';
import { NavBadge } from './NavBadge';
import { useNav } from './NavContext';
import type { NavModule } from './navItems';

const HEADER_CLASS =
  'relative mt-[6px] flex w-full cursor-pointer select-none items-center gap-[8px] border-l-[3px] border-transparent pt-[10px] pr-[18px] pb-[6px] pl-[18px] text-left text-[10px] font-bold uppercase tracking-[.12em] text-apsen-muted-2 transition-all focus-ring';
const ITEM_CLASS =
  'flex select-none items-center gap-[8px] border-l-[3px] py-[8px] pr-[18px] pl-[44px] text-[13px] transition-all focus-ring';
const ITEM_ACTIVE = 'border-apsen-blue bg-apsen-blue-bg font-medium text-apsen-blue';
const ITEM_INACTIVE =
  'border-transparent text-apsen-muted hover:bg-apsen-hover hover:text-apsen-slate';

interface NavModuleGroupProps {
  module: NavModule;
}

export function NavModuleGroup({ module }: NavModuleGroupProps) {
  const pathname = usePathname();
  const { closeOnMobile } = useNav();
  const listId = useId();
  const [open, setOpen] = useState(() =>
    module.items.some((item) => isActiveRoute(pathname, item.href)),
  );
  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((value) => !value)}
        className={HEADER_CLASS}
      >
        {module.label}
        <span
          aria-hidden
          className={`ml-auto text-[9px] text-apsen-muted-2 transition-transform duration-[180ms] ${open ? 'rotate-180' : ''}`}
        >
          ▼
        </span>
      </button>
      {open ? (
        <ul id={listId}>
          {module.items.map((item) => {
            const active = isActiveRoute(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={closeOnMobile}
                  aria-current={active ? 'page' : undefined}
                  className={`${ITEM_CLASS} ${active ? ITEM_ACTIVE : ITEM_INACTIVE}`}
                >
                  {item.label}
                  {item.badge ? <NavBadge value={item.badge.value} tone={item.badge.tone} /> : null}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
