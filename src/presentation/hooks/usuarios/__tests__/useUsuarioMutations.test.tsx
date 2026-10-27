import type { UsuariosPageDto } from '@application/usuarios/dto';
import { createFakeUsuariosUseCases } from '@test/fakes/usuarios';
import { USUARIO_FORM_FIXTURE, USUARIOS_PAGE_FIXTURE } from '@test/fixtures/usuarios';
import {
  createFakeUseCases,
  createTestQueryClient,
  createWrapper,
} from '@test/renderWithProviders';
import { act, renderHook, screen, waitFor } from '@testing-library/react';
import { queryKeys } from '../../queryKeys';
import {
  removerLinha,
  useDeleteUsuarioMutation,
  useSaveUsuarioMutation,
  useToggleUsuarioMutation,
} from '../useUsuarioMutations';

const PAGE_KEY = queryKeys.usuarios.page({}, { page: 1, size: 10 });
const FALHA = /Não foi possível salvar as alterações\. Tente novamente\./;

function deferred<T>() {
  let resolve: (value: T) => void = () => undefined;
  let reject: (reason: unknown) => void = () => undefined;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function setup(usuarios = createFakeUsuariosUseCases()) {
  const useCases = createFakeUseCases({ usuarios });
  const queryClient = createTestQueryClient();
  queryClient.setQueryData(PAGE_KEY, USUARIOS_PAGE_FIXTURE);
  const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
  return { useCases, queryClient, invalidate, wrapper: createWrapper(useCases, queryClient) };
}

function page(queryClient: ReturnType<typeof createTestQueryClient>) {
  return queryClient.getQueryData<UsuariosPageDto>(PAGE_KEY);
}

function invalidatedKeys(invalidate: { mock: { calls: unknown[][] } }) {
  return invalidate.mock.calls.map((call) => (call[0] as { queryKey: unknown }).queryKey);
}

describe('useSaveUsuarioMutation', () => {
  it('salva e invalida usuarios.all e os badges da navegação', async () => {
    const { useCases, invalidate, wrapper } = setup();
    const { result } = renderHook(() => useSaveUsuarioMutation(), { wrapper });
    const draft = USUARIO_FORM_FIXTURE.draft;
    await act(() => result.current.mutateAsync({ draft }));
    expect(useCases.usuarios.save.execute).toHaveBeenCalledWith({ draft });
    expect(invalidatedKeys(invalidate)).toEqual([['usuarios'], ['navegacao', 'badges']]);
  });
});

describe('useToggleUsuarioMutation (CA-04)', () => {
  it('marca na hora e mantém após sucesso, invalidando as chaves', async () => {
    const { invalidate, queryClient, wrapper } = setup();
    const { result } = renderHook(() => useToggleUsuarioMutation(), { wrapper });
    await act(() => result.current.mutateAsync({ id: '4', ativo: true }));
    expect(page(queryClient)?.rows.find((row) => row.id === '4')?.ativo).toBe(true);
    expect(invalidatedKeys(invalidate)).toEqual([['usuarios'], ['navegacao', 'badges']]);
  });

  it('dado falha da API, então restaura e mostra o toast de falha', async () => {
    const pending = deferred<void>();
    const toggle = { execute: vi.fn(() => pending.promise) };
    const { queryClient, wrapper } = setup(createFakeUsuariosUseCases({ toggle }));
    const { result } = renderHook(() => useToggleUsuarioMutation(), { wrapper });
    act(() => result.current.mutate({ id: '4', ativo: true }));
    await waitFor(() =>
      expect(page(queryClient)?.rows.find((row) => row.id === '4')?.ativo).toBe(true),
    );
    await act(async () => pending.reject(new Error('500')));
    await waitFor(() =>
      expect(page(queryClient)?.rows.find((row) => row.id === '4')?.ativo).toBe(false),
    );
    expect(await screen.findByText(FALHA)).toBeInTheDocument();
  });
});

describe('atualização otimista sem dados', () => {
  it('ignora páginas que ainda não carregaram', async () => {
    const { queryClient, wrapper } = setup();
    const vazia = queryKeys.usuarios.page({ q: 'x' }, { page: 1, size: 10 });
    void queryClient.prefetchQuery({
      queryKey: vazia,
      queryFn: () => new Promise<never>(() => undefined),
    });
    const { result } = renderHook(() => useToggleUsuarioMutation(), { wrapper });
    await act(() => result.current.mutateAsync({ id: '4', ativo: true }));
    expect(queryClient.getQueryData(vazia)).toBeUndefined();
  });
});

describe('useDeleteUsuarioMutation (CA-05)', () => {
  it('remove a linha na hora e mostra "Usuário removido."', async () => {
    const pending = deferred<{ toast: string }>();
    const remove = { execute: vi.fn(() => pending.promise) };
    const { queryClient, wrapper } = setup(createFakeUsuariosUseCases({ remove }));
    const { result } = renderHook(() => useDeleteUsuarioMutation(), { wrapper });
    act(() => result.current.mutate('4'));
    await waitFor(() => expect(page(queryClient)?.rows).toHaveLength(3));
    expect(page(queryClient)).toMatchObject({ total: 3, resumo: '3 usuários' });
    await act(async () => pending.resolve({ toast: '🗑 Usuário removido.' }));
    expect(await screen.findByText('🗑 Usuário removido.')).toBeInTheDocument();
    expect(remove.execute).toHaveBeenCalledWith('4');
  });

  it('dado falha, então restaura a linha e mostra o toast de falha', async () => {
    const remove = { execute: vi.fn().mockRejectedValue(new Error('500')) };
    const { queryClient, wrapper } = setup(createFakeUsuariosUseCases({ remove }));
    const { result } = renderHook(() => useDeleteUsuarioMutation(), { wrapper });
    await act(() => result.current.mutateAsync('2').catch(() => undefined));
    expect(page(queryClient)).toEqual(USUARIOS_PAGE_FIXTURE);
    expect(await screen.findByText(FALHA)).toBeInTheDocument();
  });

  it('página sem a linha fica igual', () => {
    expect(removerLinha(USUARIOS_PAGE_FIXTURE, '99')).toBe(USUARIOS_PAGE_FIXTURE);
    const unico = {
      ...USUARIOS_PAGE_FIXTURE,
      rows: USUARIOS_PAGE_FIXTURE.rows.slice(0, 1),
      total: 2,
    };
    expect(removerLinha(unico, '1')).toMatchObject({ rows: [], total: 1, resumo: '1 usuário' });
  });
});
