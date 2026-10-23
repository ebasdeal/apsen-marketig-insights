import { buttonClasses } from '@presentation/components/ui';
import { CAMPAIGNS_ROUTE } from '@presentation/navigation/routes';
import Link from 'next/link';

export function BackToCampaignsLink() {
  return (
    <Link href={CAMPAIGNS_ROUTE} className={buttonClasses('ghost', 'sm', 'mb-[16px] w-fit')}>
      <span aria-hidden="true">←</span> Voltar
    </Link>
  );
}
