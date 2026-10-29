import { ApsenLoader } from './ApsenLoader';

interface FullScreenLoaderProps {
  label: string;
}

export function FullScreenLoader({ label }: FullScreenLoaderProps) {
  return <ApsenLoader variant="fullscreen" label={label} />;
}
