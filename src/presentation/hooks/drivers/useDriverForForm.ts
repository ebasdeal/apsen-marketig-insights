'use client';

import { useQuery } from '@tanstack/react-query';
import { useUseCases } from '../../providers/UseCasesContext';
import { driversKeys } from './driversKeys';

export function useDriverForForm(id: string | undefined) {
  const useCases = useUseCases();
  const driverId = id ?? '';
  return useQuery({
    queryKey: driversKeys.forForm(driverId),
    queryFn: () => useCases.drivers.getForForm.execute(driverId),
    enabled: driverId !== '',
  });
}
