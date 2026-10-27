'use client';

import { useCurrentScreen } from '@presentation/navigation/useCurrentScreen';
import { BURGER_ID, SIDEBAR_ID, useNav } from './NavContext';
import { CrumbChevronIcon } from './NavIcons';
import { ThemeToggle } from './ThemeToggle';
import { UserMenu } from './UserMenu';

export function Topbar() {
  const { open, toggle } = useNav();
  const { crumb } = useCurrentScreen();
  return (
    <header
      className={`fixed top-0 right-0 z-20 flex h-topbar items-center gap-[14px] border-b border-apsen-border bg-apsen-white px-[22px] transition-[left] duration-200 motion-reduce:transition-none ${open ? 'left-sidebar max-[800px]:left-0' : 'left-0'}`}
    >
      <button
        id={BURGER_ID}
        type="button"
        aria-label="Alternar menu"
        aria-expanded={open}
        aria-controls={SIDEBAR_ID}
        onClick={toggle}
        className="cursor-pointer select-none rounded-[4px] p-[4px] text-[17px] leading-none text-apsen-muted transition-[background-color] hover:bg-apsen-bg hover:text-apsen-slate focus-ring"
      >
        ☰
      </button>
      <nav
        aria-label="Trilha"
        className="flex items-center gap-[5px] text-[12.5px] text-apsen-muted"
      >
        <span>Demand Intelligence</span>
        <CrumbChevronIcon />
        <strong aria-current="page" className="font-medium text-apsen-slate">
          {crumb}
        </strong>
      </nav>
      <div className="flex-1" />
      <ThemeToggle />
      <UserMenu />
    </header>
  );
}
