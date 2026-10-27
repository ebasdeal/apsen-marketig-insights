import { NotFoundError } from '@domain/shared/DomainError';
import { createFakeTipoRepository } from '@test/fakes/tipoRepository';
import { GetTipoForm } from '../GetTipoForm';

describe('GetTipoForm (CA-10)', () => {
  it('tipo legado vem com feature extra e as linhas dos campos', async () => {
    const repository = createFakeTipoRepository();
    const form = await new GetTipoForm(repository).execute('tv');
    expect(form.featureExtra).toBe('continua_grp');
    expect(form.campos?.layout).toBe('g3');
    expect(form.draft).toMatchObject({
      slug: 'tv',
      label: '📺 TV Aberta',
      cat: 'midia',
      dono: 'Marketing',
      lag: '1',
      feature: 'continua_grp',
      impacto: 'aumento',
      perm: 'temporario',
      desc: '',
      ativo: true,
    });
    expect(form.draft.rows).toHaveLength(6);
    expect(form.draft.rows[3]).toMatchObject({ nome: 'formato', tipo: 'select', origem: 'fixas' });
  });

  it('feature do vocabulário não gera extra; sem campos não gera linhas', async () => {
    const repository = createFakeTipoRepository();
    repository.getCampos.mockResolvedValueOnce(null);
    const form = await new GetTipoForm(repository).execute('sazo_epi');
    expect(form.featureExtra).toBeNull();
    expect(form.campos).toBeNull();
    expect(form.draft.rows).toEqual([]);
  });

  it('id inexistente lança NotFoundError', async () => {
    const repository = createFakeTipoRepository();
    await expect(new GetTipoForm(repository).execute('nada')).rejects.toBeInstanceOf(NotFoundError);
  });
});
