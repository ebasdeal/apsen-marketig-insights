import type { ReactNode } from 'react';
import { NavProvider } from './NavContext';
import { ShellMain } from './ShellMain';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <NavProvider>
      <Sidebar />
      <Topbar />
      <ShellMain>{children}</ShellMain>
    </NavProvider>
  );
}
