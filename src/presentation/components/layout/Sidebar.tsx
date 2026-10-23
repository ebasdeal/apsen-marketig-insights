'use client';

import Image from 'next/image';
import { useNav } from './NavContext';
import { NavLinks } from './NavLinks';

export function Sidebar() {
  const { open, close } = useNav();
  return (
    <>
      {open ? (
        <div
          aria-hidden
          data-testid="nav-backdrop"
          onClick={close}
          className="fixed inset-0 z-[25] hidden bg-apsen-overlay max-[800px]:block"
        />
      ) : null}
      <aside
        id="app-sidebar"
        aria-label="Menu lateral"
        inert={!open}
        className={`fixed top-0 left-0 z-30 flex h-screen w-sidebar flex-col overflow-y-auto border-r border-apsen-border bg-apsen-white transition-transform duration-200 ${open ? '' : '-translate-x-full'}`}
      >
        <div className="flex h-topbar shrink-0 items-center gap-[10px] border-b border-apsen-border px-[18px]">
          <Image
            src="/brand/apsen-logo.png"
            alt="Apsen"
            width={124}
            height={96}
            preload
            className="h-[34px] w-auto shrink-0 dark:brightness-0 dark:invert"
          />
          <div className="ml-[2px] border-l border-apsen-border pl-[10px]">
            <strong className="block text-[12px] font-bold leading-[1.2] text-apsen-slate">
              Marketing
            </strong>
            <span className="text-[10.5px] text-apsen-muted">Insights</span>
          </div>
        </div>
        <NavLinks />
        <div className="mt-auto shrink-0 border-t border-apsen-border px-[18px] py-[12px] text-[10px] leading-[1.8] text-apsen-muted-2">
          Apsen Farmacêutica
          <br />
          Marketing Insights · Campanhas
        </div>
      </aside>
    </>
  );
}
