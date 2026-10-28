import { Suspense, type ReactNode } from 'react';
import { AuthGate } from '../../features/auth/AuthGate';
import { AccessGuard } from './AccessGuard';
import { NavProvider } from './NavContext';
import { ReadOnlyBanner } from './ReadOnlyBanner';
import { RouteProgress } from './RouteProgress';
import { ShellMain } from './ShellMain';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <NavProvider>
      <Suspense fallback={null}>
        <RouteProgress />
      </Suspense>
      <Sidebar />
      <Topbar />
      <ShellMain>
        <ReadOnlyBanner />
        <AuthGate>
          <AccessGuard>{children}</AccessGuard>
        </AuthGate>
      </ShellMain>
    </NavProvider>
  );
}
