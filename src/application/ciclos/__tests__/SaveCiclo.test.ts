import type { CicloDraft } from '@domain/ciclos/Ciclo';
import { CicloValidationError } from '@domain/ciclos/CicloValidationError';
import { InvalidValueError } from '@domain/shared/DomainError';
import { CICLO_RASCUNHO, CICLOS_FIXTURE } from '@test/fixtures/ciclos';
import { FakeCicloRepository } from '@test/fakes/cicloRepository';
import { SaveCiclo } from '../SaveCiclo';

const UUID = '3f6c1e0a-6d2b-4c51-9a77-2b1f0d6c9e10';
const ids = { next: () => UUID };
const now = () => new Date(2026, 9, 27);

const DRAFT: CicloDraft = {
  descricao: '  Planejamento Agosto 2026 ',
  inicio: '2026-08-01',
  fim: '2026-08-31',
  responsavel: 'Ana Planejadora',
  ativar: true,
};

function setup(ciclos = CICLOS_FIXTURE) {
  const repository = new FakeCicloRepository(ciclos);
  return { repository, useCase: new SaveCiclo(repository, ids, now) };
}

describe('SaveCiclo — novo', () => {
  it('RN-02 CA-08 com "Ativar imediatamente" encerra o ativo antes e cria com UUID e código', async () => {
    const { repository, useCase } = setup();
    await expect(useCase.execute({ modo: 'novo', draft: DRAFT })).resolves.toEqual({
      toast: '✅ Ciclo criado!',
    });
    expect(repository.writes).toEqual([
      ['update', 'PLP-2026-07', { status: 'encerrado', meta: 'Encerrado em 27/10/2026 · v1' }],
      [
        'create',
        {
          id: UUID,
          codigo: 'PLP-2026-08',
          descricao: 'Planejamento Agosto 2026',
          meta: 'Criado em 27/10/2026 · v1',
          inicio: '2026-08-01',
          fim: '2026-08-31',
          periodo: '01/08 → 31/08/2026',
          drivers: 0,
          responsavel: 'Ana Planejadora',
          status: 'ativo',
          versao: 1,
        },
      ],
    ]);
  });

  it('RN-05 com ativar desligado grava rascunho sem encerrar', async () => {
    const { repository, useCase } = setup();
    await useCase.execute({ modo: 'novo', draft: { ...DRAFT, ativar: false } });
    expect(repository.writes).toHaveLength(1);
    expect(repository.writes[0]?.[0]).toBe('create');
    expect(repository.writes[0]?.[1]).toMatchObject({ status: 'rascunho' });
  });

  it('ativa sem encerrar quando não há ativo', async () => {
    const { repository, useCase } = setup([]);
    await useCase.execute({ modo: 'novo', draft: DRAFT });
    expect(repository.writes.map(([method]) => method)).toEqual(['create']);
    expect(repository.ciclos[0]).toMatchObject({ codigo: 'PLP-2026-10', status: 'ativo' });
  });
});

describe('SaveCiclo — editar', () => {
  it('RN-06 CA-09 faz PATCH só dos editáveis', async () => {
    const { repository, useCase } = setup();
    const result = await useCase.execute({
      modo: 'editar',
      id: 'PLP-2026-07',
      draft: { ...DRAFT, descricao: ' Julho revisado ', fim: '2026-08-15', ativar: false },
    });
    expect(result).toEqual({ toast: '✅ Ciclo atualizado!' });
    expect(repository.writes).toEqual([
      [
        'update',
        'PLP-2026-07',
        {
          descricao: 'Julho revisado',
          inicio: '2026-08-01',
          fim: '2026-08-15',
          periodo: '01/08 → 15/08/2026',
          responsavel: 'Ana Planejadora',
        },
      ],
    ]);
  });

  it('editar o próprio ativo com ativar não muda status', async () => {
    const { repository, useCase } = setup();
    await useCase.execute({ modo: 'editar', id: 'PLP-2026-07', draft: DRAFT });
    expect(repository.writes).toHaveLength(1);
    expect(repository.writes[0]?.[2]).not.toHaveProperty('status');
  });

  it('RN-02 rascunho com "Ativar imediatamente" encerra o ativo e grava ativo', async () => {
    const { repository, useCase } = setup([...CICLOS_FIXTURE, CICLO_RASCUNHO]);
    await useCase.execute({ modo: 'editar', id: CICLO_RASCUNHO.id, draft: DRAFT });
    expect(repository.writes.map((call) => call.slice(0, 2))).toEqual([
      ['update', 'PLP-2026-07'],
      ['update', CICLO_RASCUNHO.id],
    ]);
    expect(repository.writes[1]?.[2]).toMatchObject({ status: 'ativo' });
  });

  it('exige o id na edição', async () => {
    const { repository, useCase } = setup();
    await expect(useCase.execute({ modo: 'editar', draft: DRAFT })).rejects.toBeInstanceOf(
      InvalidValueError,
    );
    expect(repository.writes).toEqual([]);
  });
});

describe('SaveCiclo — validação (RN-04)', () => {
  it('lança CicloValidationError com os erros e não grava', async () => {
    const { repository, useCase } = setup();
    const error = await useCase
      .execute({ modo: 'novo', draft: { ...DRAFT, descricao: ' ' } })
      .catch((reason: unknown) => reason);
    expect(error).toBeInstanceOf(CicloValidationError);
    expect((error as CicloValidationError).errors.descricao).toBe('⚠️ Informe a descrição.');
    expect(repository.calls).toEqual([]);
  });
});
