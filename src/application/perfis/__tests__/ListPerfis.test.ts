import type { Perfil } from '@domain/perfis/Perfil';
import type { PerfilRepository } from '@domain/perfis/PerfilRepository';
import { PERFIS_FIXTURE } from '@test/fixtures/perfis';
import { ListPerfis } from '../ListPerfis';

class FakePerfilRepository implements PerfilRepository {
  constructor(private readonly perfis: readonly Perfil[]) {}

  async list(): Promise<readonly Perfil[]> {
    return this.perfis;
  }
}

describe('ListPerfis', () => {
  it('devolve os perfis ordenados por nível decrescente como DTO', async () => {
    const [admin, planejador, area, viewer] = PERFIS_FIXTURE as [Perfil, Perfil, Perfil, Perfil];
    const useCase = new ListPerfis(
      new FakePerfilRepository([viewer, area, { ...admin, extra: 1 } as Perfil, planejador]),
    );
    const perfis = await useCase.execute();
    expect(perfis.map((perfil) => perfil.id)).toEqual(['admin', 'planejador', 'area', 'viewer']);
    expect(perfis[0]).toEqual(admin);
  });

  it('propaga falhas do repositório', async () => {
    const useCase = new ListPerfis({ list: () => Promise.reject(new Error('boom')) });
    await expect(useCase.execute()).rejects.toThrow('boom');
  });
});
