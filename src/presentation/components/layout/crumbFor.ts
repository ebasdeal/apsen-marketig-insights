import { CAMPAIGNS_ROUTE } from '@presentation/navigation/routes';

const DETAIL_PATTERN = new RegExp(`^${CAMPAIGNS_ROUTE}/[^/]+/?$`);

export function crumbFor(pathname: string): string {
  if (pathname === '/') {
    return 'Dashboard';
  }
  if (pathname === CAMPAIGNS_ROUTE || pathname === `${CAMPAIGNS_ROUTE}/`) {
    return 'Campanhas';
  }
  if (DETAIL_PATTERN.test(pathname)) {
    return 'Detalhe da Campanha';
  }
  return 'Página não encontrada';
}
