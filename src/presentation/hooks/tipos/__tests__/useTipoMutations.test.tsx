import type { ListTiposResult } from '@application/tipos/dto';
import { TipoValidationError } from '@domain/tipos/errors';
import { draftNovo } from '@domain/tipos/vocabulario';
import { NAV_BADGES_FIXTURE } from '@test/fixtures/navBadges';
import { listTiposResult } from '@test/fakes/tipos';
import {
  createFakeUseCases,
  createTestQueryClient,
  createWrapper,
} from '@test/renderWithProviders';
import { act, renderHook, screen, waitFor } from '@testing-library/react';
import { FALHA_SALVAR } from '../../mutationFeedback';
import { queryKeys } from '../../queryKeys';
import { aplicarRemocao, aplicarToggle, ativoEmCache } from '../tiposCache';
import { tiposKeys } from '../tiposKeys';
import {
  useDeleteTipoMutation,
  useImportCatalogoMutation,
  useSaveTipoMutation,
  useToggleTipoMutation,
} from '../useTipoMutations';

const PAGINA = { page: 1, size: 10 };

function deferred<T>() {
  let resolve: (value: T) => void = () => undefined;
  let reject: (error: unknown) => void = () => undefined;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function setup(overrides: Parameters<typeof createFakeUseCases>[0] = {}) {
  const useCases = createFakeUseCases(overrides);
  const queryClient = createTestQueryClient();
  queryClient.setQueryData(tiposKeys.page(PAGINA), listTiposResult());
  queryClient.setQueryData(tiposKeys.resumo(undefined), listTiposResult(1, 1));
  queryClient.setQueryData(queryKeys.navegacao.badges(), NAV_BADGES_FIXTURE);
  const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
  return { useCases, queryClient, invalidate, wrapper: createWrapper(useCases, queryClient) };
}

function pagina(queryClient: ReturnType<typeof createTestQueryClient>) {
  return queryClient.getQueryData<ListTiposResult>(tiposKeys.page(PAGINA));
}

describe('useToggleTipoMutation (CA-04)', () => {
  it('muda na hora, mostra o toast e invalida tipos e badges', async () => {
    const pendente = deferred<{ toast: string }>();
    const { queryClient, invalidate, wrapper } = setup({
      tipos: { toggle: { execute: () => pendente.promise } },
    });
    const { result } = renderHook(() => useToggleTipoMutation(), { wrapper });
    act(() => result.current.mutate({ id: 'tv', slug: 'tv', ativo: false }));
    await waitFor(() => expect(pagina(queryClient)?.rows[0]?.ativo).toBe(false));
    expect(pagina(queryClient)?.ativos).toBe(44);
    expect(queryClient.getQueryData<ListTiposResult>(tiposKeys.resumo(undefined))?.ativos).toBe(44);
    pendente.resolve({ toast: '⏸ "tv" desativado.' });
    expect(await screen.findByText('⏸ "tv" desativado.')).toBeInTheDocument();
    await waitFor(() => expect(invalidate).toHaveBeenCalledWith({ queryKey: tiposKeys.all }));
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.navegacao.badges() });
  });

  it('falha restaura e mostra o toast de falha', async () => {
    const { queryClient, wrapper } = setup({
      tipos: { toggle: { execute: vi.fn().mockRejectedValue(new Error('500')) } },
    });
    const { result } = renderHook(() => useToggleTipoMutation(), { wrapper });
    act(() => result.current.mutate({ id: 'tv', slug: 'tv', ativo: false }));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(pagina(queryClient)?.rows[0]?.ativo).toBe(true);
    expect(pagina(queryClient)?.ativos).toBe(45);
    expect(
      await screen.findByText(FALHA_SALVAR.replace('⚠️ ', ''), { exact: false }),
    ).toBeInTheDocument();
  });
});

describe('useDeleteTipoMutation (CA-05)', () => {
  it('remove a linha na hora e mostra o toast', async () => {
    const pendente = deferred<{ toast: string }>();
    const { queryClient, wrapper } = setup({
      tipos: { remove: { execute: () => pendente.promise } },
    });
    const { result } = renderHook(() => useDeleteTipoMutation(), { wrapper });
    act(() => result.current.mutate({ id: 'tv', slug: 'tv' }));
    await waitFor(() =>
      expect(pagina(queryClient)?.rows.some((row) => row.id === 'tv')).toBe(false),
    );
    expect(pagina(queryClient)).toMatchObject({ filtrados: 46, total: 46, ativos: 44 });
    pendente.resolve({ toast: '🗑 Tipo removido.' });
    expect(await screen.findByText('🗑 Tipo removido.', { exact: false })).toBeInTheDocument();
  });

  it('falha restaura a linha', async () => {
    const { queryClient, wrapper } = setup({
      tipos: { remove: { execute: vi.fn().mockRejectedValue(new Error('500')) } },
    });
    const { result } = renderHook(() => useDeleteTipoMutation(), { wrapper });
    act(() => result.current.mutate({ id: 'tv', slug: 'tv' }));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(pagina(queryClient)?.rows[0]?.id).toBe('tv');
    expect(pagina(queryClient)?.total).toBe(47);
  });
});

describe('useSaveTipoMutation e useImportCatalogoMutation (CA-06, CA-09)', () => {
  it('salvar mostra o toast e invalida', async () => {
    const { useCases, invalidate, wrapper } = setup();
    const { result } = renderHook(() => useSaveTipoMutation(), { wrapper });
    await act(() => result.current.mutateAsync({ modo: 'novo', draft: draftNovo() }));
    expect(useCases.tipos.save.execute).toHaveBeenCalledWith({
      modo: 'novo',
      draft: draftNovo(),
      por: expect.any(String),
    });
    expect(await screen.findByText('Tipo salvo!', { exact: false })).toBeInTheDocument();
    expect(invalidate).toHaveBeenCalledWith({ queryKey: tiposKeys.all });
  });

  it('erro de validação mostra a mensagem e expõe os campos', async () => {
    const erro = new TipoValidationError(
      { fields: { slug: '⚠️ Informe o slug.' }, rows: {} },
      '⚠️ Informe o slug.',
    );
    const { wrapper } = setup({ tipos: { save: { execute: vi.fn().mockRejectedValue(erro) } } });
    const { result } = renderHook(() => useSaveTipoMutation(), { wrapper });
    act(() => result.current.mutate({ modo: 'novo', draft: draftNovo() }));
    await waitFor(() => expect(result.current.error).toBe(erro));
    expect(await screen.findByText('Informe o slug.', { exact: false })).toBeInTheDocument();
  });

  it('importar mostra o toast; falha genérica mostra o toast de falha', async () => {
    const importar = vi
      .fn()
      .mockResolvedValueOnce({ toast: '✅ Catálogo importado!', inseridos: 1, atualizados: 0 })
      .mockRejectedValueOnce(new Error('500'));
    const { invalidate, wrapper } = setup({ tipos: { importar: { execute: importar } } });
    const { result } = renderHook(() => useImportCatalogoMutation(), { wrapper });
    await act(() => result.current.mutateAsync('{}'));
    expect(await screen.findByText('Catálogo importado!', { exact: false })).toBeInTheDocument();
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.navegacao.badges() });
    await act(() => result.current.mutateAsync('{}').catch(() => undefined));
    expect(
      await screen.findByText('Não foi possível salvar as alterações', { exact: false }),
    ).toBeInTheDocument();
  });
});

describe('tiposCache', () => {
  it('tolera cache vazio e linha fora da página', () => {
    expect(aplicarToggle(undefined, { id: 'tv', slug: 'tv', ativo: true })).toBeUndefined();
    expect(aplicarRemocao(undefined, 'tv', true)).toBeUndefined();
    const result = listTiposResult(2);
    expect(aplicarRemocao(result, 'tv', undefined)).toMatchObject({
      filtrados: 47,
      total: 46,
      ativos: 45,
    });
    expect(
      aplicarToggle({ ...result, ativos: 0 }, { id: 'x', slug: 'x', ativo: false })?.ativos,
    ).toBe(0);
    expect(aplicarToggle(result, { id: 'x', slug: 'x', ativo: true })?.ativos).toBe(46);
    expect(ativoEmCache([undefined, result], 'nada')).toBeUndefined();
    expect(ativoEmCache([listTiposResult()], 'tv')).toBe(true);
  });
});
