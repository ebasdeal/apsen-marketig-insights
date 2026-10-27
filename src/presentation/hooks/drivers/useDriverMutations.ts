'use client';

import type { CreateDriverInput, UpdateDriverInput } from '@application/drivers/dto';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUseCases } from '../../providers/UseCasesContext';
import { invalidarDrivers } from './invalidarDrivers';

export function useCreateDriverMutation() {
  const useCases = useUseCases();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateDriverInput) => useCases.drivers.create.execute(input),
    onSuccess: () => invalidarDrivers(queryClient),
  });
}

export function useUpdateDriverMutation() {
  const useCases = useUseCases();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateDriverInput) => useCases.drivers.update.execute(input),
    onSuccess: () => invalidarDrivers(queryClient),
  });
}
