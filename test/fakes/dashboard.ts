import type { DashboardUseCases } from '@application/dashboard/dashboardUseCases';
import { buildDashboardOutput } from '../fixtures/dashboard';

export function createFakeDashboardUseCases(
  overrides: Partial<DashboardUseCases> = {},
): DashboardUseCases {
  return {
    overview: { execute: vi.fn().mockResolvedValue(buildDashboardOutput()) },
    ...overrides,
  };
}
