import { PERFIS_FIXTURE } from '@test/fixtures/perfis';
import { createFakeUseCases, createWrapper } from '@test/renderWithProviders';
import { act, renderHook, waitFor } from '@testing-library/react';
import { loginAs } from '@test/resetStores';
import { usePerfilAtual } from '../usePerfilAtual';

describe('usePerfilAtual', () => {
  it('começa carregando e depois devolve o perfil da store', async () => {
    const { result } = renderHook(() => usePerfilAtual(), {
      wrapper: createWrapper(createFakeUseCases()),
    });
    expect(result.current.status).toBe('loading');
    expect(result.current.perfil).toBeUndefined();
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.perfil?.usuario).toBe('Ana Admin');
    expect(result.current.perfis).toEqual(PERFIS_FIXTURE);
    act(() => loginAs('viewer'));
    expect(result.current.perfil?.usuario).toBe('Pedro Viewer');
  });

  it('fica missing quando a lista não tem o perfil da store', async () => {
    const useCases = createFakeUseCases({
      perfis: { list: { execute: vi.fn().mockResolvedValue(PERFIS_FIXTURE.slice(1)) } },
    });
    const { result } = renderHook(() => usePerfilAtual(), { wrapper: createWrapper(useCases) });
    await waitFor(() => expect(result.current.status).toBe('missing'));
    expect(result.current.perfil).toBeUndefined();
  });

  it('fica error quando a API falha e refaz a busca', async () => {
    const execute = vi
      .fn()
      .mockRejectedValueOnce(new Error('fora'))
      .mockResolvedValue(PERFIS_FIXTURE);
    const useCases = createFakeUseCases({ perfis: { list: { execute } } });
    const { result } = renderHook(() => usePerfilAtual(), { wrapper: createWrapper(useCases) });
    await waitFor(() => expect(result.current.status).toBe('error'));
    act(() => result.current.refetch());
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(execute).toHaveBeenCalledTimes(2);
  });
});
