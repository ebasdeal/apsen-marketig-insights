import { createFakeTipoRepository } from '@test/fakes/tipoRepository';
import { DeleteTipo } from '../DeleteTipo';
import { ToggleTipoAtivo } from '../ToggleTipoAtivo';

describe('ToggleTipoAtivo (RN-03, CA-04)', () => {
  it('grava só ativo e devolve o toast', async () => {
    const repository = createFakeTipoRepository();
    const toggle = new ToggleTipoAtivo(repository, () => new Date('2026-10-28T14:05:00.000Z'));
    await expect(
      toggle.execute({ id: 'tv', slug: 'tv', ativo: false, por: 'Ana P.' }),
    ).resolves.toEqual({
      toast: '⏸ "tv" desativado.',
    });
    expect(repository.update).toHaveBeenCalledWith('tv', {
      ativo: false,
      alteradoPor: 'Ana P.',
      alteradoEm: '2026-10-28T14:05:00.000Z',
    });
    await expect(
      toggle.execute({ id: 'tv', slug: 'tv', ativo: true, por: 'Ana P.' }),
    ).resolves.toEqual({
      toast: '✅ "tv" ativado.',
    });
  });
});

describe('DeleteTipo (CA-05)', () => {
  it('apaga tipo, campos e a entrada na categoria', async () => {
    const repository = createFakeTipoRepository();
    await expect(new DeleteTipo(repository).execute({ id: 'tv', slug: 'tv' })).resolves.toEqual({
      toast: '🗑 Tipo removido.',
    });
    expect(repository.escritas).toEqual([
      'DELETE /tipos/tv',
      'DELETE /camposTipo/tv',
      'PATCH /categorias/0',
    ]);
    expect(repository.categorias[0]?.tipos.some((tipo) => tipo.slug === 'tv')).toBe(false);
  });
});
