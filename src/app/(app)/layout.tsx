import { AppShell } from '@presentation/components/layout/AppShell';
import type { ReactNode } from 'react';

// O quadro (sidebar + topbar) existe sempre; a sessão só é exigida dentro do AppShell, na área de conteúdo.
export default function AppLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
