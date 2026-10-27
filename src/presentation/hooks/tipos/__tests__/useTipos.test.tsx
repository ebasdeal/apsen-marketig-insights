import type { ListTiposResult } from '@application/tipos/dto';
import { NotFoundError } from '@domain/shared/DomainError';
import { listTiposResult, tipoFormFixture } from '@test/fakes/tipos';
import {
  createFakeUseCases,
  createTestQueryClient,
  createWrapper,
} from '@test/renderWithProviders';
import { renderHook, waitFor } from '@testing-library/react';
import { queryKeys } from '../../queryKeys';
import { tiposKeys } from '../tiposKeys';
import { useCategorias, useTipoForm, useTiposPage, useTiposResumo } from '../useTipos';

function setup(overrides: Parameters<typeof createFakeUseCases>[0] = {}) {
  const useCases = createFakeUseCases(overrides);
  const queryClient = createTestQueryClient();
  return { useCases, queryClient, wrapper: createWrapper(useCases, queryClient) };
}

describe('tiposKeys', () => {
  it('agrupa as chaves do módulo em queryKeys', () => {
    expect(queryKeys.tipos).toBe(tiposKeys);
    expect(tiposKeys.all).toEqual(['tipos']);
    expect(tiposKeys.page({ page: 2, size: 10, cat: 'midia' })).toEqual([
      'tipos',
      'page',
      { page: 2, size: 10, cat: 'midia' },
    ]);
    expect(tiposKeys.resumo(undefined)).toEqual(['tipos', 'resumo', 'all']);
    expect(tiposKeys.resumo('sazo')).toEqual(['tipos', 'resumo', 'sazo']);
    expect(tiposKeys.form('tv')).toEqual(['tipos', 'form', 'tv']);
    expect(tiposKeys.categorias()).toEqual(['tipos', 'categorias']);
  });
});

describe('useTiposPage', () => {
  it('carrega a página, faz prefetch da próxima e mantém dados ao trocar de página', async () => {
    const { useCases, queryClient, wrapper } = setup();
    const list = vi.mocked(useCases.tipos.list.execute);
    list.mockImplementation(async ({ page, size }) => listTiposResult(page, size));
    const { result, rerender } = renderHook(
      (props: { page: number }) => useTiposPage({ ...props, size: 10 }),
      {
        wrapper,
        initialProps: { page: 1 },
      },
    );
    await waitFor(() => expect(result.current.data?.rows).toHaveLength(10));
    await waitFor(() => expect(list).toHaveBeenCalledWith({ page: 2, size: 10 }));
    expect(queryClient.getQueryData(tiposKeys.page({ page: 2, size: 10 }))).toBeDefined();
    const query = queryClient
      .getQueryCache()
      .find({ queryKey: tiposKeys.page({ page: 1, size: 10 }) });
    expect(query?.options).toMatchObject({ staleTime: 30_000 });

    let resolver: (value: ListTiposResult) => void = () => undefined;
    list.mockImplementationOnce(() => new Promise((resolve) => (resolver = resolve)));
    rerender({ page: 3 });
    expect(result.current.isPlaceholderData).toBe(true);
    expect(result.current.data?.rows[0]?.id).toBe('tv');
    resolver(listTiposResult(3));
    await waitFor(() => expect(result.current.isPlaceholderData).toBe(false));
  });

  it('última página não faz prefetch; cat vai para o caso de uso', async () => {
    const { useCases, wrapper } = setup();
    const list = vi.mocked(useCases.tipos.list.execute);
    list.mockResolvedValue({ ...listTiposResult(), totalPages: 1 });
    const { result } = renderHook(() => useTiposPage({ page: 1, size: 10, cat: 'midia' }), {
      wrapper,
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(list).toHaveBeenCalledTimes(1);
    expect(list).toHaveBeenCalledWith({ page: 1, size: 10, cat: 'midia' });
  });
});

describe('useTiposResumo, useCategorias, useTipoForm', () => {
  it('resumo lê filtrados/total/ativos com uma consulta de 1 item', async () => {
    const { useCases, wrapper } = setup();
    const { result } = renderHook(() => useTiposResumo(), { wrapper });
    await waitFor(() =>
      expect(result.current.data).toEqual({ filtrados: 47, total: 47, ativos: 45 }),
    );
    expect(useCases.tipos.list.execute).toHaveBeenCalledWith({ page: 1, size: 1 });
    renderHook(() => useTiposResumo('sazo'), { wrapper });
    await waitFor(() =>
      expect(useCases.tipos.list.execute).toHaveBeenCalledWith({ page: 1, size: 1, cat: 'sazo' }),
    );
  });

  it('categorias com staleTime de catálogo', async () => {
    const { queryClient, wrapper } = setup();
    const { result } = renderHook(() => useCategorias(), { wrapper });
    await waitFor(() => expect(result.current.data).toHaveLength(10));
    const query = queryClient.getQueryCache().find({ queryKey: tiposKeys.categorias() });
    expect(query?.options).toMatchObject({ staleTime: 300_000 });
  });

  it('form não consulta sem id e não repete NotFoundError', async () => {
    const getForm = vi.fn().mockRejectedValue(new NotFoundError('Tipo', 'x'));
    const { wrapper } = setup({ tipos: { getForm: { execute: getForm } } });
    const vazio = renderHook(() => useTipoForm(undefined), { wrapper });
    expect(vazio.result.current.fetchStatus).toBe('idle');
    const { result } = renderHook(() => useTipoForm('x'), { wrapper });
    await waitFor(() => expect(result.current.error).toBeInstanceOf(NotFoundError));
    expect(getForm).toHaveBeenCalledTimes(1);
  });

  it('form repete uma vez erros transitórios e carrega o rascunho', async () => {
    const getForm = vi
      .fn()
      .mockRejectedValueOnce(new Error('rede'))
      .mockResolvedValue(tipoFormFixture('tv'));
    const { wrapper } = setup({ tipos: { getForm: { execute: getForm } } });
    const { result } = renderHook(() => useTipoForm('tv'), { wrapper });
    await waitFor(() => expect(result.current.data?.draft.slug).toBe('tv'));
    expect(getForm).toHaveBeenCalledTimes(2);
  });
});
