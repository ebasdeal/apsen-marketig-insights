import type { FonteDraft } from '@domain/fontes/Fonte';
import { FonteValidationError } from '@domain/fontes/errors';
import { FONTES_FIXTURE } from '@test/fixtures/fontes';
import { FakeFonteRepository } from '@test/fakes/fonteRepository';
import { CreateFonte } from '../CreateFonte';

const UUID = '9b2f6a1e-1c2d-4e5f-8a9b-0c1d2e3f4a5b';

const DRAFT: FonteDraft = {
  nome: ' Distribuidores ',
  icon: '🚚',
  desc: '  ',
  modo: 'api',
  url: ' https://api.apsen.com.br/v1/distribuidores ',
  auth: 'bearer',
  cache: '',
  mapValor: '',
  mapLabel: '',
};

function setup() {
  const repository = new FakeFonteRepository(FONTES_FIXTURE);
  return { repository, useCase: new CreateFonte(repository, { next: () => UUID }) };
}

async function validationErrorOf(promise: Promise<unknown>): Promise<FonteValidationError> {
  const error = await promise.catch((reason: unknown) => reason);
  expect(error).toBeInstanceOf(FonteValidationError);
  return error as FonteValidationError;
}

describe('CreateFonte (RN-04, CA-06)', () => {
  it('POST com UUID, padrões e _custom, sem token', async () => {
    const { repository, useCase } = setup();
    const draft = { ...DRAFT, token: 'segredo-123' } as FonteDraft;
    await expect(useCase.execute(draft)).resolves.toEqual({
      toast: '✅ Nova fonte "Distribuidores" adicionada.',
    });
    const create = repository.calls.find(([method]) => method === 'create');
    expect(create?.[1]).toEqual({
      id: UUID,
      nome: 'Distribuidores',
      icon: '🚚',
      desc: 'Fonte de dados personalizada.',
      modo: 'api',
      url: 'https://api.apsen.com.br/v1/distribuidores',
      auth: 'bearer',
      cache: 60,
      mapValor: 'nome',
      mapLabel: 'razao_social',
      campos: '—',
      custom: true,
    });
    expect(JSON.stringify(create)).not.toContain('segredo-123');
    expect(repository.calls).toContainEqual(['existsNome', 'Distribuidores']);
  });

  it('usa ícone padrão e mantém desc, cache e paths informados', async () => {
    const { repository, useCase } = setup();
    await useCase.execute({
      ...DRAFT,
      icon: '',
      desc: ' Uso interno ',
      modo: 'mock',
      url: '',
      cache: '15',
      mapValor: 'data[].nome',
      mapLabel: 'data[].rs',
    });
    expect(repository.fontes.at(-1)).toMatchObject({
      icon: '🔌',
      desc: 'Uso interno',
      cache: 15,
      mapValor: 'data[].nome',
      mapLabel: 'data[].rs',
    });
  });

  it('RN-03 sem nome e API sem URL não consulta nem grava', async () => {
    const { repository, useCase } = setup();
    const error = await validationErrorOf(useCase.execute({ ...DRAFT, nome: ' ', url: '' }));
    expect(error.errors).toEqual({
      nome: '⚠️ Informe o nome da fonte.',
      url: '⚠️ Informe a URL do endpoint para o modo API.',
    });
    expect(error.message).toBe('⚠️ Informe o nome da fonte.');
    expect(repository.calls).toEqual([]);
  });

  it('RN-03 nome repetido por slug', async () => {
    const { repository, useCase } = setup();
    const error = await validationErrorOf(
      useCase.execute({ ...DRAFT, nome: 'concorrentes / MARCAS' }),
    );
    expect(error.errors).toEqual({ nome: '⚠️ Já existe uma fonte com este nome.' });
    expect(repository.calls.some(([method]) => method === 'create')).toBe(false);
  });
});
