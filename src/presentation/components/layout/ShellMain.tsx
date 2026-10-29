'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, type ReactNode } from 'react';
import { useNav } from './NavContext';

export function ShellMain({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { open, settled } = useNav();
  const ref = useRef<HTMLElement>(null);

  const previousPath = useRef(pathname);

  useEffect(() => {
    if (previousPath.current === pathname) {
      return;
    }
    previousPath.current = pathname;
    if (ref.current) {
      ref.current.scrollTop = 0;
    }
  }, [pathname]);

  return (
    <main
      ref={ref}
      className={`mt-topbar h-[calc(100vh-var(--spacing-topbar))] overflow-y-auto px-[24px] py-[22px] ${settled ? 'transition-[margin-left] duration-200 motion-reduce:transition-none' : ''} ${open ? 'ml-sidebar max-[800px]:ml-0' : 'ml-0'}`}
    >
      {children}
    </main>
  );
}
