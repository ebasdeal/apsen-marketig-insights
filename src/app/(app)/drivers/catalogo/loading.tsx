import { TableSkeleton } from '@presentation/components/ui';

export default function CatalogoLoading() {
  return <TableSkeleton columns={5} label="Carregando catálogo…" />;
}
