import { NotFoundError } from '@domain/shared/DomainError';
import { createFakeAgentesUseCases } from '@test/fakes/agentes';
import {
  AGENTE_FORM_FIXTURE,
  AGENTES_PAGE_FIXTURE,
  AGENTES_RESUMO_FIXTURE,
} from '@test/fixtures/agentes';
import {
  createFakeUseCases,
  createTestQueryClient,
  createWrapper,
} from '@test/renderWithProviders';
import { renderHook, waitFor } from '@testing-library/react';
import { queryKeys } from '../../queryKeys';
import { useAgenteForm, useAgentesPage, useAgentesResumo } from '../useAgentes';

describe('chaves de agentes', () => {
  it('ficam agrupadas no queryKeys', () => {
    expect(queryKeys.agentes.all).toEqual(['agentes']);
    expect(queryKeys.agentes.page(2)).toEqual(['agentes', 'page', 2]);
    expect(queryKeys.agentes.resumo()).toEqual(['agentes', 'resumo']);
    expect(queryKeys.agentes.form('AG-001')).toEqual(['agentes', 'form', 'AG-001']);
  });
});

describe('useAgentesPage', () => {
  it('carrega a página com staleTime 30 s e mantém a anterior ao trocar', async () => {
    const useCases = createFakeUseCases();
    const queryClient = createTestQueryClient();
    const { result, rerender } = renderHook(({ page }: { page: number }) => useAgentesPage(page), {
      wrapper: createWrapper(useCases, queryClient),
      initialProps: { page: 1 },
    });
    await waitFor(() => expect(result.current.data).toEqual(AGENTES_PAGE_FIXTURE));
    expect(useCases.agentes.list.execute).toHaveBeenCalledWith({ page: 1 });
    const query = queryClient.getQueryCache().find({ queryKey: queryKeys.agentes.page(1) });
    expect(query?.options).toMatchObject({ staleTime: 30_000 });
    vi.mocked(useCases.agentes.list.execute).mockReturnValueOnce(new Promise(() => undefined));
    rerender({ page: 2 });
    expect(result.current.isPlaceholderData).toBe(true);
  });
});

describe('useAgentesResumo e useAgenteForm', () => {
  it('carrega o resumo', async () => {
    const useCases = createFakeUseCases();
    const { result } = renderHook(() => useAgentesResumo(), { wrapper: createWrapper(useCases) });
    await waitFor(() => expect(result.current.data).toEqual(AGENTES_RESUMO_FIXTURE));
  });

  it('carrega o formulário e não repete em 404', async () => {
    const useCases = createFakeUseCases();
    const { result } = renderHook(() => useAgenteForm('AG-005'), {
      wrapper: createWrapper(useCases),
    });
    await waitFor(() => expect(result.current.data).toEqual(AGENTE_FORM_FIXTURE));
    expect(useCases.agentes.getForm.execute).toHaveBeenCalledWith('AG-005');

    const getForm = { execute: vi.fn().mockRejectedValue(new NotFoundError('Agente', 'X')) };
    const semAgente = createFakeUseCases({ agentes: createFakeAgentesUseCases({ getForm }) });
    const ausente = renderHook(() => useAgenteForm('X'), { wrapper: createWrapper(semAgente) });
    await waitFor(() => expect(ausente.result.current.error).toBeInstanceOf(NotFoundError));
    expect(getForm.execute).toHaveBeenCalledTimes(1);
  });
});
