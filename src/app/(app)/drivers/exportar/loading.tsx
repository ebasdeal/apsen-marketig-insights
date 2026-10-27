import { CardSkeleton } from '@presentation/components/ui';

export default function ExportarLoading() {
  return <CardSkeleton lines={8} label="Gerando JSON…" />;
}
