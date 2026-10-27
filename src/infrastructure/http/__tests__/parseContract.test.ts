import { z } from 'zod';
import { HttpError, InvalidResponseError } from '../HttpClient';
import { isNotFound, parseContract } from '../parseContract';

describe('parseContract', () => {
  const schema = z.array(z.object({ id: z.string() }));

  it('devolve os dados válidos', () => {
    expect(parseContract(schema, [{ id: 'a' }], '/x')).toEqual([{ id: 'a' }]);
  });

  it('lista os caminhos inválidos sem expor valores, incluindo a raiz', () => {
    expect(() => parseContract(schema, [{ id: 1 }], '/x')).toThrow(
      new InvalidResponseError('Resposta de /x fora do contrato: 0.id'),
    );
    expect(() => parseContract(schema, { segredo: 'v' }, '/x')).toThrow(
      new InvalidResponseError('Resposta de /x fora do contrato: (raiz)'),
    );
  });
});

describe('isNotFound', () => {
  it('reconhece só HttpError 404', () => {
    expect(isNotFound(new HttpError(404, '/x', null))).toBe(true);
    expect(isNotFound(new HttpError(500, '/x', null))).toBe(false);
    expect(isNotFound(new Error('404'))).toBe(false);
  });
});
