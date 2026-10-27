import { buildUrlSearch, parseUrlState, type UrlStateSpec } from '../urlState';

const SPEC = {
  page: { kind: 'int', default: 1, min: 1 },
  limit: { kind: 'int', default: 10, min: 1 },
  q: { kind: 'string', default: '' },
  status: { kind: 'enum', default: 'todos', values: ['todos', 'ativa', 'pendente'] },
} satisfies UrlStateSpec;

describe('parseUrlState', () => {
  it('lê os valores válidos', () => {
    expect(parseUrlState(new URLSearchParams('page=3&limit=25&q=abc&status=ativa'), SPEC)).toEqual({
      page: 3,
      limit: 25,
      q: 'abc',
      status: 'ativa',
    });
  });

  it('inválido ou ausente vira padrão', () => {
    expect(parseUrlState(new URLSearchParams('page=abc&limit=0&status=x'), SPEC)).toEqual({
      page: 1,
      limit: 10,
      q: '',
      status: 'todos',
    });
    expect(parseUrlState(new URLSearchParams('page=2.5'), SPEC).page).toBe(1);
    expect(
      parseUrlState(new URLSearchParams('page=-2'), { page: { kind: 'int', default: 1 } }),
    ).toEqual({
      page: -2,
    });
  });
});

describe('buildUrlSearch', () => {
  it('omite padrões e preserva chaves alheias', () => {
    const current = new URLSearchParams('familia=X&page=2');
    expect(buildUrlSearch(current, SPEC, { page: 3 })).toBe('?familia=X&page=3');
    expect(buildUrlSearch(current, SPEC, { page: 1 })).toBe('?familia=X');
  });

  it('volta para a página 1 ao mudar busca, filtro ou tamanho', () => {
    const current = new URLSearchParams('page=4');
    expect(buildUrlSearch(current, SPEC, { q: 'x' })).toBe('?q=x');
    expect(buildUrlSearch(current, SPEC, { status: 'ativa' })).toBe('?status=ativa');
    expect(buildUrlSearch(current, SPEC, { limit: 25 })).toBe('?limit=25');
    expect(buildUrlSearch(current, SPEC, { q: 'y', page: 2 })).toBe('?page=2&q=y');
  });

  it('devolve string vazia sem parâmetros e funciona sem page na spec', () => {
    expect(buildUrlSearch(new URLSearchParams('q=a'), SPEC, { q: '' })).toBe('');
    const tabs = { aba: { kind: 'enum', default: 'ativas', values: ['ativas', 'todas'] } } as const;
    expect(buildUrlSearch(new URLSearchParams(), tabs, { aba: 'todas' })).toBe('?aba=todas');
  });
});
