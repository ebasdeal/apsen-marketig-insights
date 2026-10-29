'use client';

import { RouteError } from '@presentation/components/layout/RouteError';

interface CiclosErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function CiclosError(props: CiclosErrorProps) {
  return <RouteError {...props} />;
}
