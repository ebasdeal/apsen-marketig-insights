import db from '../../../../mock-api/db.json';
import {
  PERFIL_BADGE_TONE,
  USUARIO_AREAS,
  USUARIO_FILTRO_PERFIS,
  USUARIO_PERFIS,
} from '../vocabulario';

describe('vocabulário de usuários (§5)', () => {
  const { opcoes } = db.config;

  it('dado o db.json, quando compara, então áreas, perfis e filtros batem', () => {
    expect(USUARIO_AREAS).toEqual(opcoes.usuarioAreas);
    expect(USUARIO_PERFIS).toEqual(opcoes.usuarioPerfis);
    expect(USUARIO_FILTRO_PERFIS.map((opcao) => opcao.label)).toEqual(opcoes.usuarioFiltroPerfis);
  });

  it('o filtro envia o id do perfil e "Todos" envia vazio', () => {
    expect(USUARIO_FILTRO_PERFIS.map((opcao) => opcao.value)).toEqual([
      '',
      'admin',
      'planejador',
      'area',
      'viewer',
    ]);
  });

  it('badge por perfil', () => {
    expect(PERFIL_BADGE_TONE).toEqual({
      admin: 'purple',
      planejador: 'blue',
      area: 'teal',
      viewer: 'gray',
    });
  });
});
