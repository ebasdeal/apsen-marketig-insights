import { AppShell } from '@presentation/components/layout/AppShell';
import { AuthGate } from '@presentation/features/auth/AuthGate';
import type { ReactNode } from 'react';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGate>
      <AppShell>{children}</AppShell>
    </AuthGate>
  );
}
