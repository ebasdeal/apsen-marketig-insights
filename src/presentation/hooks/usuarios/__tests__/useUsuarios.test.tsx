import { NotFoundError } from '@domain/shared/DomainError';
import { createFakeUsuariosUseCases } from '@test/fakes/usuarios';
import {
  PERMISSOES_MATRIZ_FIXTURE,
  USUARIO_FORM_FIXTURE,
  USUARIOS_PAGE_FIXTURE,
} from '@test/fixtures/usuarios';
import {
  createFakeUseCases,
  createTestQueryClient,
  createWrapper,
} from '@test/renderWithProviders';
import { renderHook, waitFor } from '@testing-library/react';
import { queryKeys } from '../../queryKeys';
import { retryExcetoNotFound } from '../../retryExcetoNotFound';
import { useUsuarioForm, usePermissoes, useUsuariosPage } from '../useUsuarios';

describe('chaves de usuários e permissões', () => {
  it('ficam agrupadas no queryKeys', () => {
    expect(queryKeys.usuarios.all).toEqual(['usuarios']);
    expect(queryKeys.usuarios.page({ q: 'a' }, { page: 2, size: 10 })).toEqual([
      'usuarios',
      'page',
      { q: 'a' },
      { page: 2, size: 10 },
    ]);
    expect(queryKeys.usuarios.form('3')).toEqual(['usuarios', 'form', '3']);
    expect(queryKeys.permissoes.all).toEqual(['permissoes']);
    expect(queryKeys.permissoes.list()).toEqual(['permissoes', 'list']);
  });
});

describe('useUsuariosPage', () => {
  it('consulta com filtros, tamanho padrão 10, staleTime 30 s e mantém a página anterior', async () => {
    const useCases = createFakeUseCases();
    const queryClient = createTestQueryClient();
    const { result, rerender } = renderHook(
      ({ page }: { page: number }) => useUsuariosPage({ q: 'mkt', perfil: 'area' }, { page }),
      { wrapper: createWrapper(useCases, queryClient), initialProps: { page: 1 } },
    );
    await waitFor(() => expect(result.current.data).toEqual(USUARIOS_PAGE_FIXTURE));
    expect(useCases.usuarios.list.execute).toHaveBeenCalledWith({
      q: 'mkt',
      perfil: 'area',
      page: 1,
      size: 10,
    });
    const query = queryClient.getQueryCache().find({
      queryKey: queryKeys.usuarios.page({ q: 'mkt', perfil: 'area' }, { page: 1, size: 10 }),
    });
    expect(query?.options).toMatchObject({ staleTime: 30_000 });

    vi.mocked(useCases.usuarios.list.execute).mockReturnValueOnce(new Promise(() => undefined));
    rerender({ page: 2 });
    expect(result.current.isPlaceholderData).toBe(true);
    expect(result.current.data).toEqual(USUARIOS_PAGE_FIXTURE);
  });

  it('aceita size explícito (badge da sidebar)', async () => {
    const useCases = createFakeUseCases();
    renderHook(() => useUsuariosPage({}, { page: 1, size: 1 }), {
      wrapper: createWrapper(useCases),
    });
    await waitFor(() =>
      expect(useCases.usuarios.list.execute).toHaveBeenCalledWith({ page: 1, size: 1 }),
    );
  });
});

describe('useUsuarioForm', () => {
  it('carrega o formulário pelo id', async () => {
    const useCases = createFakeUseCases();
    const { result } = renderHook(() => useUsuarioForm('3'), {
      wrapper: createWrapper(useCases),
    });
    await waitFor(() => expect(result.current.data).toEqual(USUARIO_FORM_FIXTURE));
    expect(useCases.usuarios.getForm.execute).toHaveBeenCalledWith('3');
  });

  it('não repete a consulta em 404', async () => {
    const getForm = { execute: vi.fn().mockRejectedValue(new NotFoundError('Usuário', '9')) };
    const useCases = createFakeUseCases({ usuarios: createFakeUsuariosUseCases({ getForm }) });
    const { result } = renderHook(() => useUsuarioForm('9'), {
      wrapper: createWrapper(useCases),
    });
    await waitFor(() => expect(result.current.error).toBeInstanceOf(NotFoundError));
    expect(getForm.execute).toHaveBeenCalledTimes(1);
  });

  it('retryExcetoNotFound repete uma vez erros comuns', () => {
    expect(retryExcetoNotFound(0, new Error('x'))).toBe(true);
    expect(retryExcetoNotFound(1, new Error('x'))).toBe(false);
    expect(retryExcetoNotFound(0, new NotFoundError('Usuário', '9'))).toBe(false);
  });
});

describe('usePermissoes', () => {
  it('carrega a matriz com staleTime de 5 min', async () => {
    const useCases = createFakeUseCases();
    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => usePermissoes(), {
      wrapper: createWrapper(useCases, queryClient),
    });
    await waitFor(() => expect(result.current.data).toEqual(PERMISSOES_MATRIZ_FIXTURE));
    const query = queryClient.getQueryCache().find({ queryKey: queryKeys.permissoes.list() });
    expect(query?.options).toMatchObject({ staleTime: 300_000 });
  });
});
