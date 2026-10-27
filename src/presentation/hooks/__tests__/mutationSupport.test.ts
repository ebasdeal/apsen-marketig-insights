import { DomainError, NotFoundError } from '@domain/shared/DomainError';
import { createTestQueryClient } from '@test/renderWithProviders';
import { FALHA_SALVAR, mensagemDeFalha } from '../mutationFeedback';
import { restoreSnapshot, snapshotQueries } from '../optimistic';

describe('mensagemDeFalha', () => {
  it('erros de domínio mostram a própria mensagem; demais, o texto de falha', () => {
    expect(mensagemDeFalha(new DomainError('⚠️ Cole o JSON do catálogo.'))).toBe(
      '⚠️ Cole o JSON do catálogo.',
    );
    expect(mensagemDeFalha(new NotFoundError('Tipo', 'x'))).toBe(FALHA_SALVAR);
    expect(mensagemDeFalha(new Error('rede'))).toBe(FALHA_SALVAR);
    expect(FALHA_SALVAR).toBe('⚠️ Não foi possível salvar as alterações. Tente novamente.');
  });
});

describe('snapshotQueries / restoreSnapshot', () => {
  it('guarda e restaura os dados das chaves afetadas', async () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(['a', 1], 'um');
    queryClient.setQueryData(['b'], 'dois');
    const snapshot = await snapshotQueries(queryClient, [['a'], ['b']]);
    queryClient.setQueryData(['a', 1], 'mudou');
    queryClient.setQueryData(['b'], 'mudou');
    restoreSnapshot(queryClient, snapshot);
    expect(queryClient.getQueryData(['a', 1])).toBe('um');
    expect(queryClient.getQueryData(['b'])).toBe('dois');
    expect(() => restoreSnapshot(queryClient, undefined)).not.toThrow();
  });
});
