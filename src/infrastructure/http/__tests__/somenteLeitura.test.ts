import { SomenteLeituraError } from '@domain/auth/AuthErrors';
import { fakeResponse } from '@test/fakeFetch';
import { FetchHttpClient } from '../FetchHttpClient';
import { HttpError } from '../HttpClient';

function clientFor(status: number, body: unknown) {
  const fetchFn = vi.fn().mockResolvedValue(fakeResponse({ status, body }));
  return new FetchHttpClient({ baseUrl: 'http://localhost:3001', fetchFn });
}

describe('FetchHttpClient — usuário inativo (somente leitura)', () => {
  it('403 somente_leitura vira SomenteLeituraError com a mensagem do toast', async () => {
    const error = await clientFor(403, { codigo: 'somente_leitura' })
      .patch('/usuarios/1', { ativo: false })
      .catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(SomenteLeituraError);
    expect((error as Error).message).toBe(
      '⚠️ Seu usuário está inativo: o acesso é somente para visualização.',
    );
  });

  it('outros 403 continuam HttpError', async () => {
    await expect(clientFor(403, { codigo: 'outro' }).post('/x', {})).rejects.toBeInstanceOf(
      HttpError,
    );
    await expect(clientFor(403, null).post('/x', {})).rejects.toBeInstanceOf(HttpError);
  });
});
