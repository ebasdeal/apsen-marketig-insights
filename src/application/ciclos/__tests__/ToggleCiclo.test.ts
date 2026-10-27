import { InvalidValueError } from '@domain/shared/DomainError';
import { CICLO_RASCUNHO, CICLOS_FIXTURE } from '@test/fixtures/ciclos';
import { FakeCicloRepository } from '@test/fakes/cicloRepository';
import { ToggleCiclo } from '../ToggleCiclo';

const now = () => new Date(2026, 9, 27);

function setup(ciclos = [...CICLOS_FIXTURE, CICLO_RASCUNHO]) {
  const repository = new FakeCicloRepository(ciclos);
  return { repository, useCase: new ToggleCiclo(repository, now) };
}

describe('ToggleCiclo', () => {
  it('RN-03 CA-05 desligar o ativo grava encerrado com a meta', async () => {
    const { repository, useCase } = setup();
    await expect(useCase.execute({ id: 'PLP-2026-07', ativo: false })).resolves.toEqual({
      toast: '⏸ Ciclo encerrado. Ative outro ciclo para continuar.',
      encerradoId: null,
    });
    expect(repository.writes).toEqual([
      ['update', 'PLP-2026-07', { status: 'encerrado', meta: 'Encerrado em 27/10/2026 · v1' }],
    ]);
  });

  it('recusa desligar um ciclo que não é o ativo', async () => {
    const { repository, useCase } = setup();
    await expect(useCase.execute({ id: CICLO_RASCUNHO.id, ativo: false })).rejects.toBeInstanceOf(
      InvalidValueError,
    );
    expect(repository.writes).toEqual([]);
  });

  it('RN-02 CA-06 ligar um rascunho encerra o ativo e ativa o rascunho', async () => {
    const { repository, useCase } = setup();
    await expect(useCase.execute({ id: CICLO_RASCUNHO.id, ativo: true })).resolves.toEqual({
      toast: '✅ Ciclo ativado como ciclo corrente.',
      encerradoId: 'PLP-2026-07',
    });
    expect(repository.writes).toEqual([
      ['update', 'PLP-2026-07', { status: 'encerrado', meta: 'Encerrado em 27/10/2026 · v1' }],
      ['update', CICLO_RASCUNHO.id, { status: 'ativo' }],
    ]);
    expect(repository.ciclos.filter((ciclo) => ciclo.status === 'ativo')).toHaveLength(1);
  });

  it('ligar sem ativo só ativa', async () => {
    const { repository, useCase } = setup([CICLO_RASCUNHO]);
    const result = await useCase.execute({ id: CICLO_RASCUNHO.id, ativo: true });
    expect(result.encerradoId).toBeNull();
    expect(repository.writes).toEqual([['update', CICLO_RASCUNHO.id, { status: 'ativo' }]]);
  });
});
