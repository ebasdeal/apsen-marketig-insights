'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { isActiveRoute } from './isActiveRoute';
import { useNav } from './NavContext';
import { DashboardIcon } from './NavIcons';
import { NAV_MODULES, NAV_ROOT } from './navItems';
import { NavModuleGroup } from './NavModuleGroup';

const ROOT_CLASS =
  'mx-[8px] mt-[8px] mb-[4px] flex select-none items-center gap-[8px] rounded-apsen border-l-[3px] py-[8px] pr-[18px] pl-[13px] text-[13px] font-semibold transition-all focus-ring';
const ROOT_ACTIVE = 'border-apsen-blue bg-apsen-blue text-white';
const ROOT_INACTIVE =
  'border-transparent text-apsen-muted hover:bg-apsen-hover hover:text-apsen-slate';

export function NavLinks() {
  const pathname = usePathname();
  const { closeOnMobile } = useNav();
  const rootActive = isActiveRoute(pathname, NAV_ROOT.href);
  return (
    <nav aria-label="Navegação principal">
      <Link
        href={NAV_ROOT.href}
        onClick={closeOnMobile}
        aria-current={rootActive ? 'page' : undefined}
        className={`${ROOT_CLASS} ${rootActive ? ROOT_ACTIVE : ROOT_INACTIVE}`}
      >
        <DashboardIcon />
        {NAV_ROOT.label}
      </Link>
      {NAV_MODULES.map((module) => (
        <NavModuleGroup key={module.key} module={module} />
      ))}
    </nav>
  );
}
