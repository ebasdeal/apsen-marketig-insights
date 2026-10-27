'use client';

import { RouteError } from '@presentation/components/layout/RouteError';

interface FontesErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function FontesError(props: FontesErrorProps) {
  return <RouteError {...props} />;
}
