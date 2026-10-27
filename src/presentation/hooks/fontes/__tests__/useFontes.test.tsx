import type { FontesPageDto } from '@application/fontes/dto';
import { FonteProtegidaError, FonteValidationError } from '@domain/fontes/errors';
import type { FonteDraft } from '@domain/fontes/Fonte';
import { HttpError } from '@infrastructure/http/HttpClient';
import { createFakeFontesUseCases } from '@test/fakes/fontes';
import { FONTE_CUSTOM, FONTE_OPTIONS_FIXTURE, FONTES_PAGE_FIXTURE } from '@test/fixtures/fontes';
import {
  createFakeUseCases,
  createTestQueryClient,
  createWrapper,
} from '@test/renderWithProviders';
import { act, renderHook, screen, waitFor } from '@testing-library/react';
import { queryKeys } from '../../queryKeys';
import { applyRemoveToPage } from '../fonteOptimistic';
import { fontesKeys } from '../fontesKeys';
import {
  useCreateFonteMutation,
  useDeleteFonteMutation,
  useUpdateFonteMutation,
} from '../useFonteMutations';
import { useFonteOptions, useFontesPage } from '../useFontes';

const FALHA = 'Não foi possível salvar as alterações. Tente novamente.';

const DRAFT: FonteDraft = {
  nome: 'Distribuidores',
  icon: '🚚',
  desc: '',
  modo: 'mock',
  url: '',
  auth: 'none',
  cache: '60',
  mapValor: '',
  mapLabel: '',
};

const CONFIG = {
  modo: 'api' as const,
  url: 'https://x',
  auth: 'none' as const,
  cache: '60',
  mapValor: '',
  mapLabel: '',
};

function setup(fontes = createFakeFontesUseCases()) {
  const useCases = createFakeUseCases({ fontes });
  const queryClient = createTestQueryClient();
  return { useCases, queryClient, wrapper: createWrapper(useCases, queryClient) };
}

function deferred<T>() {
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((_resolve, rej) => {
    reject = rej;
  });
  return { promise, reject };
}

describe('fontesKeys', () => {
  it('agrupa as chaves do módulo em queryKeys', () => {
    expect(queryKeys.fontes.all).toEqual(['fontes']);
    expect(queryKeys.fontes.page({ page: 1, size: 10 })).toEqual([
      'fontes',
      'page',
      { page: 1, size: 10 },
    ]);
    expect(queryKeys.fontes.options()).toEqual(['fontes', 'options']);
  });
});

describe('leitura', () => {
  it('useFontesPage pede a página com 30 s', async () => {
    const { useCases, queryClient, wrapper } = setup();
    const { result } = renderHook(() => useFontesPage({ page: 1, size: 10 }), { wrapper });
    await waitFor(() => expect(result.current.data).toEqual(FONTES_PAGE_FIXTURE));
    expect(useCases.fontes.list.execute).toHaveBeenCalledWith({ page: 1, size: 10 });
    const query = queryClient
      .getQueryCache()
      .find({ queryKey: fontesKeys.page({ page: 1, size: 10 }) });
    expect(query?.options).toMatchObject({ staleTime: 30_000 });
  });

  it('useFonteOptions usa staleTime de 5 min', async () => {
    const { queryClient, wrapper } = setup();
    const { result } = renderHook(() => useFonteOptions(), { wrapper });
    await waitFor(() => expect(result.current.data).toEqual(FONTE_OPTIONS_FIXTURE));
    const query = queryClient.getQueryCache().find({ queryKey: fontesKeys.options() });
    expect(query?.options).toMatchObject({ staleTime: 300_000 });
  });
});

describe('useCreateFonteMutation / useUpdateFonteMutation', () => {
  it('CA-06 criar mostra o toast e invalida fontes e badges', async () => {
    const { useCases, queryClient, wrapper } = setup();
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useCreateFonteMutation(), { wrapper });
    await act(() => result.current.mutateAsync(DRAFT));
    expect(useCases.fontes.create.execute).toHaveBeenCalledWith(DRAFT);
    expect(await screen.findByText('Nova fonte "X" adicionada.')).toBeInTheDocument();
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['fontes'] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.navegacao.badges() });
  });

  it('RN-03 validação mostra a mensagem do campo', async () => {
    const execute = vi
      .fn()
      .mockRejectedValue(new FonteValidationError({ nome: '⚠️ Informe o nome da fonte.' }));
    const { wrapper } = setup(createFakeFontesUseCases({ create: { execute } }));
    const { result } = renderHook(() => useCreateFonteMutation(), { wrapper });
    await act(() => result.current.mutateAsync(DRAFT).catch(() => undefined));
    expect(await screen.findByText('Informe o nome da fonte.')).toBeInTheDocument();
  });

  it('configurar mostra o toast; falha mostra o toast de falha', async () => {
    const { useCases, wrapper } = setup();
    const { result } = renderHook(() => useUpdateFonteMutation(), { wrapper });
    await act(() => result.current.mutateAsync({ id: 'precos', config: CONFIG }));
    expect(useCases.fontes.update.execute).toHaveBeenCalledWith({ id: 'precos', config: CONFIG });
    expect(await screen.findByText('Fonte configurada para lista interna.')).toBeInTheDocument();
    vi.mocked(useCases.fontes.update.execute).mockRejectedValueOnce(new HttpError(500, '/f', {}));
    await act(() =>
      result.current.mutateAsync({ id: 'precos', config: CONFIG }).catch(() => undefined),
    );
    expect(await screen.findByText(FALHA)).toBeInTheDocument();
  });
});

describe('useDeleteFonteMutation (CA-07)', () => {
  const KEY = fontesKeys.page({ page: 1, size: 10 });
  const ids = (data: FontesPageDto | undefined) => data?.items.map((item) => item.id);

  it('remove o card na hora e restaura quando a API falha', async () => {
    const pending = deferred<never>();
    const { queryClient, wrapper } = setup(
      createFakeFontesUseCases({ remove: { execute: vi.fn(() => pending.promise) } }),
    );
    queryClient.setQueryData(KEY, FONTES_PAGE_FIXTURE);
    const { result } = renderHook(() => useDeleteFonteMutation(), { wrapper });
    act(() => result.current.mutate({ id: FONTE_CUSTOM.id, removivel: true }));
    await waitFor(() => expect(ids(queryClient.getQueryData(KEY))).not.toContain(FONTE_CUSTOM.id));
    expect(queryClient.getQueryData<FontesPageDto>(KEY)?.total).toBe(4);
    await act(async () => pending.reject(new HttpError(500, '/fontes', {})));
    expect(await screen.findByText(FALHA)).toBeInTheDocument();
    expect(queryClient.getQueryData(KEY)).toEqual(FONTES_PAGE_FIXTURE);
  });

  it('sucesso mostra "Fonte removida." e invalida', async () => {
    const { queryClient, wrapper } = setup();
    queryClient.getQueryCache().build(queryClient, { queryKey: KEY });
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useDeleteFonteMutation(), { wrapper });
    await act(() => result.current.mutateAsync({ id: FONTE_CUSTOM.id, removivel: true }));
    expect(await screen.findByText('Fonte removida.')).toBeInTheDocument();
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['fontes'] });
  });

  it('fonte protegida mostra a mensagem do domínio', async () => {
    const execute = vi.fn().mockRejectedValue(new FonteProtegidaError('precos'));
    const { wrapper } = setup(createFakeFontesUseCases({ remove: { execute } }));
    const { result } = renderHook(() => useDeleteFonteMutation(), { wrapper });
    await act(() =>
      result.current.mutateAsync({ id: 'precos', removivel: false }).catch(() => undefined),
    );
    expect(await screen.findByText('Fonte do sistema não pode ser removida.')).toBeInTheDocument();
  });
});

describe('applyRemoveToPage', () => {
  it('sem o id devolve a mesma página', () => {
    expect(applyRemoveToPage(FONTES_PAGE_FIXTURE, 'nada')).toBe(FONTES_PAGE_FIXTURE);
    const vazia = { items: [{ ...FONTES_PAGE_FIXTURE.items[0]! }], total: 0, totalPages: 1 };
    expect(applyRemoveToPage(vazia, vazia.items[0]!.id).total).toBe(0);
  });
});
