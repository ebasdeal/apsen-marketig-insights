import { createTestQueryClient } from '@test/renderWithProviders';
import { restoreSnapshot, takeSnapshot } from '../cacheSnapshot';

describe('cacheSnapshot', () => {
  it('guarda e restaura os dados das chaves do grupo', () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(['m', 'page', 1], 'a');
    queryClient.setQueryData(['m', 'resumo'], 'b');
    queryClient.setQueryData(['outro'], 'c');
    const snapshot = takeSnapshot(queryClient, ['m']);
    expect(snapshot).toHaveLength(2);
    queryClient.setQueryData(['m', 'page', 1], 'x');
    queryClient.setQueryData(['m', 'resumo'], 'y');
    restoreSnapshot(queryClient, snapshot);
    expect(queryClient.getQueryData(['m', 'page', 1])).toBe('a');
    expect(queryClient.getQueryData(['m', 'resumo'])).toBe('b');
  });

  it('sem snapshot não faz nada', () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(['m'], 'a');
    restoreSnapshot(queryClient, undefined);
    expect(queryClient.getQueryData(['m'])).toBe('a');
  });
});
