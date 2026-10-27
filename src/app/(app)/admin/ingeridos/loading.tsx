import { TabelaPageSkeleton } from '@presentation/features/adminDi/AdminDiSkeletons';

export default function Loading() {
  return <TabelaPageSkeleton columns={8} rows={4} />;
}
