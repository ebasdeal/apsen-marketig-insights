import type { GetDashboardOverview } from './GetDashboardOverview';

export interface DashboardUseCases {
  overview: Pick<GetDashboardOverview, 'execute'>;
}
