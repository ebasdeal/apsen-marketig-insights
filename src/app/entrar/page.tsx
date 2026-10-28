import { readLoginConfig } from '@main/loginConfig';
import { FullScreenLoader } from '@presentation/components/ui';
import { LoginScreen } from '@presentation/features/auth/LoginScreen';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = { title: 'Entrar' };
export const dynamic = 'force-dynamic';

export default function EntrarPage() {
  const { ambiente, suporteUrl } = readLoginConfig();
  return (
    <Suspense fallback={<FullScreenLoader label="Carregando…" />}>
      <LoginScreen ambiente={ambiente} suporteUrl={suporteUrl} />
    </Suspense>
  );
}
