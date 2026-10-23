'use client';

import { usePathname } from 'next/navigation';
import { crumbFor } from './crumbFor';
import { useNav } from './NavContext';
import { CrumbChevronIcon } from './NavIcons';
import { ThemeToggle } from './ThemeToggle';

export function Topbar() {
  const pathname = usePathname();
  const { open, toggle } = useNav();
  return (
    <header
      className={`fixed top-0 right-0 z-20 flex h-topbar items-center gap-[14px] border-b border-apsen-border bg-apsen-white px-[22px] transition-[left] duration-200 ${open ? 'left-sidebar max-[800px]:left-0' : 'left-0'}`}
    >
      <button
        type="button"
        aria-label="Alternar menu"
        aria-expanded={open}
        aria-controls="app-sidebar"
        onClick={toggle}
        className="cursor-pointer select-none rounded-[4px] p-[4px] text-[17px] leading-none text-apsen-muted transition-[background-color] hover:bg-apsen-bg hover:text-apsen-slate focus-ring"
      >
        ☰
      </button>
      <nav
        aria-label="Trilha"
        className="flex items-center gap-[5px] text-[12.5px] text-apsen-muted"
      >
        <span>Marketing Insights</span>
        <CrumbChevronIcon />
        <strong aria-current="page" className="font-medium text-apsen-slate">
          {crumbFor(pathname)}
        </strong>
      </nav>
      <div className="flex-1" />
      <ThemeToggle />
      <div
        aria-hidden
        className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-apsen-purple text-[11.5px] font-bold text-white"
      >
        A
      </div>
      <span className="text-[13px] font-semibold text-apsen-slate max-[560px]:hidden">
        Apsen Marketing
      </span>
    </header>
  );
}
