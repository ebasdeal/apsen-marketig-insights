import type { ContagemRepository } from '@domain/navegacao/ContagemRepository';
import { NAV_BADGES_FIXTURE } from '@test/fixtures/navBadges';
import { GetNavBadges } from '../GetNavBadges';

const TOTAIS: Record<string, number> = {
  drivers: 4,
  ciclos: 3,
  tipos: 47,
  'aprovacoes?status=pendente': 2,
  usuarios: 4,
  agentes: 5,
  analises: 2,
  'restricoes?status=ativa': 8,
  planoItens: 247,
};

function chave(colecao: string, filtro?: Readonly<Record<string, string>>): string {
  const query = new URLSearchParams(filtro).toString();
  return query === '' ? colecao : `${colecao}?${query}`;
}

describe('GetNavBadges', () => {
  it('conta as 9 coleções com os filtros de status', async () => {
    const contar = vi.fn(async (colecao: string, filtro?: Readonly<Record<string, string>>) => {
      const total = TOTAIS[chave(colecao, filtro)];
      if (total === undefined) {
        throw new Error(`inesperado ${chave(colecao, filtro)}`);
      }
      return total;
    });
    const badges = await new GetNavBadges({ contar }).execute();
    expect(badges).toEqual(NAV_BADGES_FIXTURE);
    expect(contar).toHaveBeenCalledTimes(9);
    expect(contar).toHaveBeenCalledWith('aprovacoes', { status: 'pendente' });
    expect(contar).toHaveBeenCalledWith('restricoes', { status: 'ativa' });
    expect(contar).toHaveBeenCalledWith('drivers');
  });

  it('marca como null só a contagem que falhou', async () => {
    const repository: ContagemRepository = {
      contar: async (colecao) => {
        if (colecao === 'tipos') {
          throw new Error('fora');
        }
        return colecao === 'ciclos' ? 0 : 1;
      },
    };
    const badges = await new GetNavBadges(repository).execute();
    expect(badges.tipos).toBeNull();
    expect(badges.ciclos).toBe(0);
    expect(badges.planos).toBe(1);
  });
});
