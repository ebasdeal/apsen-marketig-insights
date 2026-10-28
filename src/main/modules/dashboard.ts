import type { DashboardUseCases } from '@application/dashboard/dashboardUseCases';
import { GetDashboardOverview } from '@application/dashboard/GetDashboardOverview';
import { HttpDashboardRepository } from '@infrastructure/dashboard/HttpDashboardRepository';
import type { HttpClient } from '@infrastructure/http/HttpClient';

export function createDashboardModule(http: HttpClient): DashboardUseCases {
  return { overview: new GetDashboardOverview(new HttpDashboardRepository(http)) };
}
