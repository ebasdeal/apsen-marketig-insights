import { PERMISSOES_FIXTURE, PERMISSOES_MATRIZ_FIXTURE } from '@test/fixtures/usuarios';
import { ListPermissoes } from '../ListPermissoes';

describe('ListPermissoes (RN-07)', () => {
  it('agrupa na ordem dos dados e classifica as células por perfil', async () => {
    const repository = { list: vi.fn().mockResolvedValue(PERMISSOES_FIXTURE) };
    const matriz = await new ListPermissoes(repository).execute();
    expect(matriz).toEqual(PERMISSOES_MATRIZ_FIXTURE);
    expect(matriz.grupos.map((g) => g.linhas.length)).toEqual([4, 5, 2]);
    expect(matriz.grupos[0]?.linhas[1]).toEqual({
      id: '2',
      funcionalidade: 'Registrar novo driver',
      celulas: {
        viewer: { kind: 'nao', texto: '—' },
        area: { kind: 'parcial', texto: '✓', detalhe: '(só suas cat.)' },
        planejador: { kind: 'sim', texto: '✓' },
        admin: { kind: 'sim', texto: '✓' },
      },
    });
  });

  it('sem permissões, sem grupos', async () => {
    const repository = { list: vi.fn().mockResolvedValue([]) };
    await expect(new ListPermissoes(repository).execute()).resolves.toEqual({ grupos: [] });
  });
});
