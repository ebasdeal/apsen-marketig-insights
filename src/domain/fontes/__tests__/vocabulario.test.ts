import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { FONTE_AUTH, FONTE_ICONES, MAP_PADRAO } from '../vocabulario';

interface DbConfig {
  config: { opcoes: { fonteIcones: unknown; fonteAuth: unknown } };
}

const db = JSON.parse(readFileSync(join(process.cwd(), 'mock-api', 'db.json'), 'utf8')) as DbConfig;

describe('vocabulário de fontes', () => {
  it('ícones e auth batem com config.opcoes do db.json', () => {
    expect(FONTE_ICONES).toHaveLength(9);
    expect(FONTE_ICONES).toEqual(db.config.opcoes.fonteIcones);
    expect(FONTE_AUTH).toEqual(db.config.opcoes.fonteAuth);
  });

  it('JSON paths padrão do protótipo', () => {
    expect(MAP_PADRAO).toEqual({ valor: 'nome', label: 'razao_social' });
  });
});
