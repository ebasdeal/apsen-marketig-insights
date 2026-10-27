import { FullScreenLoader } from '@presentation/components/ui';
import { AuthCallbackScreen } from '@presentation/features/auth/AuthCallbackScreen';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = { title: 'Entrando…' };

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<FullScreenLoader label="Entrando…" />}>
      <AuthCallbackScreen />
    </Suspense>
  );
}
