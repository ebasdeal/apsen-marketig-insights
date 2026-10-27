import type { DriversPageDto } from '@application/drivers/dto';
import {
  makeDraft,
  makeDriver,
  makeDriverListItem,
  makeDriversPage,
  makeLookups,
} from '@test/factories/drivers';
import {
  createFakeUseCases,
  createTestQueryClient,
  createWrapper,
} from '@test/renderWithProviders';
import { act, renderHook, screen, waitFor } from '@testing-library/react';
import { queryKeys } from '../../queryKeys';
import { driversKeys } from '../driversKeys';
import { useLaboratorioSearch, useMarcaSearch } from '../useConcorrenteSearch';
import {
  MENSAGEM_FALHA_REMOVER,
  semDriver,
  useDeleteDriverMutation,
} from '../useDeleteDriverMutation';
import { useDriverFormLookups } from '../useDriverFormLookups';
import { useDriverForForm } from '../useDriverForForm';
import { useCreateDriverMutation, useUpdateDriverMutation } from '../useDriverMutations';
import { useDrivers } from '../useDrivers';
import { useDriversExport } from '../useDriversExport';

function setup() {
  const useCases = createFakeUseCases();
  const queryClient = createTestQueryClient();
  return { useCases, queryClient, wrapper: createWrapper(useCases, queryClient) };
}

function deferred<T>() {
  let resolve: (value: T) => void = () => undefined;
  let reject: (error: unknown) => void = () => undefined;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe('driversKeys', () => {
  it('chaves do módulo drivers expostas em queryKeys', () => {
    expect(queryKeys.drivers).toBe(driversKeys);
    expect(driversKeys.all).toEqual(['drivers']);
    expect(driversKeys.list(2, 10)).toEqual(['drivers', 'list', 2, 10]);
    expect(driversKeys.lists()).toEqual(['drivers', 'list']);
    expect(driversKeys.detail('3')).toEqual(['drivers', 'detail', '3']);
    expect(driversKeys.forForm('3')).toEqual(['drivers', 'form', '3']);
    expect(driversKeys.lookups()).toEqual(['drivers', 'lookups']);
    expect(driversKeys.export()).toEqual(['drivers', 'export']);
    expect(driversKeys.labs('em')).toEqual(['drivers', 'labs', 'em']);
    expect(driversKeys.marcas('EMS', 'g')).toEqual(['drivers', 'marcas', 'EMS', 'g']);
  });
});

describe('useDriverFormLookups / useDriverForForm', () => {
  it('lookups com staleTime de 5 min', async () => {
    const { useCases, queryClient, wrapper } = setup();
    const { result } = renderHook(() => useDriverFormLookups(), { wrapper });
    await waitFor(() => expect(result.current.data).toEqual(makeLookups()));
    expect(useCases.drivers.formLookups.execute).toHaveBeenCalledTimes(1);
    const query = queryClient.getQueryCache().find({ queryKey: driversKeys.lookups() });
    expect(query?.options).toMatchObject({ staleTime: 300_000 });
  });

  it('driver para o formulário só com id', async () => {
    const { useCases, wrapper } = setup();
    const vazio = renderHook(() => useDriverForForm(undefined), { wrapper });
    expect(vazio.result.current.fetchStatus).toBe('idle');
    const { result } = renderHook(() => useDriverForForm('3'), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(useCases.drivers.getForForm.execute).toHaveBeenCalledWith('3');
  });
});

describe('useCreateDriverMutation / useUpdateDriverMutation (CA-10, CA-13)', () => {
  it('chamam o caso de uso e invalidam drivers, catálogo e badges', async () => {
    const { useCases, queryClient, wrapper } = setup();
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    const create = renderHook(() => useCreateDriverMutation(), { wrapper });
    const input = { draft: makeDraft(), campos: [] };
    await act(() => create.result.current.mutateAsync(input));
    expect(useCases.drivers.create.execute).toHaveBeenCalledWith(input);
    expect(invalidate.mock.calls.map(([filters]) => filters?.queryKey)).toEqual([
      ['drivers'],
      ['catalogo'],
      ['navegacao', 'badges'],
    ]);
    const update = renderHook(() => useUpdateDriverMutation(), { wrapper });
    const updateInput = { ...input, id: '3', original: makeDriver() };
    await act(() => update.result.current.mutateAsync(updateInput));
    expect(useCases.drivers.update.execute).toHaveBeenCalledWith(updateInput);
    expect(invalidate).toHaveBeenCalledTimes(6);
  });
});

describe('useDrivers (CA-03, RN-01)', () => {
  it('pede a página, guarda 30 s e faz prefetch da próxima', async () => {
    const { useCases, queryClient, wrapper } = setup();
    vi.mocked(useCases.drivers.list.execute).mockImplementation(async ({ page, size }) =>
      makeDriversPage({ page, size, total: 60 }),
    );
    const { result } = renderHook(() => useDrivers({ page: 2, size: 10 }), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(useCases.drivers.list.execute).toHaveBeenCalledWith({ page: 2, size: 10 });
    await waitFor(() =>
      expect(useCases.drivers.list.execute).toHaveBeenCalledWith({ page: 3, size: 10 }),
    );
    const query = queryClient.getQueryCache().find({ queryKey: driversKeys.list(2, 10) });
    expect(query?.options).toMatchObject({ staleTime: 30_000 });
  });

  it('última página não faz prefetch e mantém os dados anteriores ao trocar', async () => {
    const { useCases, wrapper } = setup();
    const proxima = deferred<DriversPageDto>();
    vi.mocked(useCases.drivers.list.execute)
      .mockResolvedValueOnce(makeDriversPage({ total: 4 }))
      .mockReturnValueOnce(proxima.promise);
    const { result, rerender } = renderHook(({ page }) => useDrivers({ page, size: 10 }), {
      wrapper,
      initialProps: { page: 1 },
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(useCases.drivers.list.execute).toHaveBeenCalledTimes(1);
    rerender({ page: 2 });
    await waitFor(() => expect(result.current.isPlaceholderData).toBe(true));
    expect(result.current.data?.total).toBe(4);
    proxima.resolve(makeDriversPage({ items: [], total: 4, page: 2 }));
    await waitFor(() => expect(result.current.isPlaceholderData).toBe(false));
  });
});

describe('useDeleteDriverMutation (CA-04, RN-04)', () => {
  const ITEM_1 = makeDriverListItem({ id: '1' });
  const ITEM_2 = makeDriverListItem({ id: '2' });

  it('remove na hora de todas as páginas em cache e invalida ao final', async () => {
    const { useCases, queryClient, wrapper } = setup();
    const remocao = deferred<void>();
    vi.mocked(useCases.drivers.remove.execute).mockReturnValue(remocao.promise);
    queryClient.setQueryData(
      driversKeys.list(1, 10),
      makeDriversPage({ items: [ITEM_1, ITEM_2], total: 2 }),
    );
    queryClient.setQueryData(
      driversKeys.list(1, 25),
      makeDriversPage({ items: [ITEM_2], total: 2 }),
    );
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useDeleteDriverMutation(), { wrapper });
    act(() => result.current.mutate('1'));
    await waitFor(() =>
      expect(queryClient.getQueryData<DriversPageDto>(driversKeys.list(1, 10))?.items).toEqual([
        ITEM_2,
      ]),
    );
    expect(queryClient.getQueryData<DriversPageDto>(driversKeys.list(1, 10))?.total).toBe(1);
    expect(queryClient.getQueryData<DriversPageDto>(driversKeys.list(1, 25))?.total).toBe(2);
    expect(useCases.drivers.remove.execute).toHaveBeenCalledWith('1');
    expect(invalidate).not.toHaveBeenCalled();
    remocao.resolve();
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidate.mock.calls.map(([filters]) => filters?.queryKey)).toEqual([
      ['drivers'],
      ['catalogo'],
      ['navegacao', 'badges'],
    ]);
  });

  it('falha devolve o item e mostra o toast', async () => {
    const { useCases, queryClient, wrapper } = setup();
    vi.mocked(useCases.drivers.remove.execute).mockRejectedValue(new Error('500'));
    const pagina = makeDriversPage({ items: [ITEM_1, ITEM_2], total: 2 });
    queryClient.setQueryData(driversKeys.list(1, 10), pagina);
    const { result } = renderHook(() => useDeleteDriverMutation(), { wrapper });
    act(() => result.current.mutate('1'));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(queryClient.getQueryData(driversKeys.list(1, 10))).toEqual(pagina);
    expect(await screen.findByText('Não foi possível remover o registro.')).toBeInTheDocument();
    expect(MENSAGEM_FALHA_REMOVER).toBe('⚠️ Não foi possível remover o registro.');
  });

  it('semDriver ignora id ausente', () => {
    const pagina = makeDriversPage({ items: [ITEM_1], total: 0 });
    expect(semDriver(pagina, 'x')).toBe(pagina);
    expect(semDriver(pagina, '1')).toMatchObject({ items: [], total: 0 });
  });
});

describe('useDriversExport e buscas de concorrentes', () => {
  it('export com staleTime de lista', async () => {
    const { useCases, queryClient, wrapper } = setup();
    const { result } = renderHook(() => useDriversExport(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(useCases.drivers.export.execute).toHaveBeenCalledTimes(1);
    const query = queryClient.getQueryCache().find({ queryKey: driversKeys.export() });
    expect(query?.options).toMatchObject({ staleTime: 30_000 });
  });

  it('buscas usam fetchQuery com cache por termo', async () => {
    const { useCases, wrapper } = setup();
    const labs = renderHook(() => useLaboratorioSearch(), { wrapper });
    await expect(labs.result.current('em ')).resolves.toEqual(['EMS', 'Eurofarma']);
    await labs.result.current('em');
    expect(useCases.drivers.searchLaboratorios.execute).toHaveBeenCalledTimes(1);
    const marcas = renderHook(() => useMarcaSearch(), { wrapper });
    await expect(marcas.result.current('EMS', 'g')).resolves.toEqual(['Genérico EMS', 'Germed']);
    await marcas.result.current(' EMS', 'g ');
    expect(useCases.drivers.searchMarcas.execute).toHaveBeenCalledTimes(1);
    expect(useCases.drivers.searchMarcas.execute).toHaveBeenCalledWith({
      laboratorio: 'EMS',
      termo: 'g',
    });
  });
});
