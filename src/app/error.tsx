'use client';

import { RouteError } from '@presentation/components/layout/RouteError';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage(props: ErrorPageProps) {
  return <RouteError {...props} />;
}
