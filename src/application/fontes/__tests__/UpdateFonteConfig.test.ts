import type { FonteConfigDraft } from '@domain/fontes/Fonte';
import { FONTES_FIXTURE } from '@test/fixtures/fontes';
import { FakeFonteRepository } from '@test/fakes/fonteRepository';
import { UpdateFonteConfig } from '../UpdateFonteConfig';

const CONFIG: FonteConfigDraft = {
  modo: 'api',
  url: ' https://api.apsen.com.br/v1/concorrentes ',
  auth: 'apikey',
  cache: '30',
  mapValor: 'data[].nome',
  mapLabel: ' ',
};

describe('UpdateFonteConfig (RN-05)', () => {
  it('PATCH só da config e toast de API', async () => {
    const repository = new FakeFonteRepository(FONTES_FIXTURE);
    const config = { ...CONFIG, token: 'segredo', nome: 'Outro' } as FonteConfigDraft;
    await expect(
      new UpdateFonteConfig(repository).execute({ id: 'concorrentes', config }),
    ).resolves.toEqual({ toast: '✅ Fonte configurada para API externa.' });
    expect(repository.calls).toEqual([
      [
        'update',
        'concorrentes',
        {
          modo: 'api',
          url: 'https://api.apsen.com.br/v1/concorrentes',
          auth: 'apikey',
          cache: 30,
          mapValor: 'data[].nome',
          mapLabel: 'razao_social',
        },
      ],
    ]);
  });

  it('modo mock mostra o toast de lista interna e aceita URL vazia', async () => {
    const repository = new FakeFonteRepository(FONTES_FIXTURE);
    const result = await new UpdateFonteConfig(repository).execute({
      id: 'precos',
      config: { ...CONFIG, modo: 'mock', url: '', cache: '0' },
    });
    expect(result).toEqual({ toast: '✅ Fonte configurada para lista interna.' });
    expect(repository.calls[0]?.[2]).toMatchObject({ modo: 'mock', url: '', cache: 60 });
  });
});
