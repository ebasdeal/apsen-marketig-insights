import { InvalidValueError } from '@domain/shared/DomainError';
import { UsuarioValidationError } from '@domain/usuarios/errors';
import type { UsuarioDraft } from '@domain/usuarios/Usuario';
import {
  createFakePerfilRepository,
  createFakeUsuarioRepository,
} from '@test/fakes/acessoRepositories';
import type { SaveUsuarioInput } from '../dto';
import { SaveUsuario } from '../SaveUsuario';

const AUTOR = 'Ana Admin';
const AGORA = new Date('2026-10-27T17:05:00.000Z');
const UUID = 'c0a8-0000-4000-8000-000000000001';

const ANA_PAULA: UsuarioDraft = {
  nome: '  Ana Paula Ferreira ',
  email: ' Ana.Ferreira@apsen.com.br ',
  area: 'Marketing',
  perfil: 'area',
  categorias: ['midia', 'comercial'],
  ativo: true,
};

function setup() {
  const repository = createFakeUsuarioRepository();
  const perfis = createFakePerfilRepository();
  const useCase = new SaveUsuario(
    repository,
    perfis,
    () => UUID,
    () => AGORA,
  );
  const save = {
    execute: (input: Omit<SaveUsuarioInput, 'alteradoPor'>) =>
      useCase.execute({ ...input, alteradoPor: AUTOR }),
  };
  return { repository, perfis, save };
}

describe('SaveUsuario — novo (RN-04, CA-07)', () => {
  it('dado usuário de Área novo, quando executa, então POST com UUID e derivados', async () => {
    const { repository, save } = setup();
    await expect(save.execute({ draft: ANA_PAULA })).resolves.toEqual({
      toast: '✅ Usuário salvo!',
    });
    expect(repository.findByEmail).toHaveBeenCalledWith('ana.ferreira@apsen.com.br');
    expect(repository.create).toHaveBeenCalledWith({
      id: UUID,
      nome: 'Ana Paula Ferreira',
      email: 'ana.ferreira@apsen.com.br',
      perfil: 'area',
      perfilLabel: 'Área',
      area: 'Marketing',
      podeRegistrar: true,
      podeValidar: false,
      admin: false,
      ultimoAcesso: '—',
      ativo: true,
      removivel: true,
      categorias: ['midia', 'comercial'],
      alteradoPor: 'Ana Admin',
      alteradoEm: '2026-10-27T17:05:00.000Z',
    });
  });

  it('perfil admin grava categorias vazias e admin true', async () => {
    const { repository, save } = setup();
    await save.execute({ draft: { ...ANA_PAULA, perfil: 'admin' } });
    expect(repository.create.mock.calls[0]?.[0]).toMatchObject({
      perfilLabel: 'Admin',
      podeRegistrar: true,
      podeValidar: true,
      admin: true,
      categorias: [],
    });
  });

  it('e-mail repetido → UsuarioValidationError sem gravar', async () => {
    const { repository, save } = setup();
    const error = await save
      .execute({ draft: { ...ANA_PAULA, email: 'carlos.lima@apsen.com.br' } })
      .catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(UsuarioValidationError);
    expect((error as UsuarioValidationError).erros).toEqual({
      email: '⚠️ Já existe um usuário com este e-mail.',
    });
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('rascunho inválido não consulta e-mail nem grava', async () => {
    const { repository, save } = setup();
    await expect(
      save.execute({ draft: { ...ANA_PAULA, nome: '', email: 'a@b' } }),
    ).rejects.toMatchObject({ message: '⚠️ Informe o nome completo.' });
    expect(repository.findByEmail).not.toHaveBeenCalled();
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('perfil sem cadastro em /perfis falha sem gravar', async () => {
    const { repository, perfis, save } = setup();
    perfis.list.mockResolvedValueOnce([]);
    await expect(save.execute({ draft: ANA_PAULA })).rejects.toBeInstanceOf(InvalidValueError);
    expect(repository.create).not.toHaveBeenCalled();
  });
});

describe('SaveUsuario — edição (CA-08)', () => {
  it('dado edição, quando salva, então PATCH sem id/ultimoAcesso/removivel', async () => {
    const { repository, save } = setup();
    await save.execute({
      id: '3',
      draft: { ...ANA_PAULA, nome: 'Fernanda Marketing', email: 'fernanda.mkt@apsen.com.br' },
    });
    expect(repository.create).not.toHaveBeenCalled();
    const [id, patch] = repository.update.mock.calls[0] ?? [];
    expect(id).toBe('3');
    expect(Object.keys(patch).sort()).toEqual(
      [
        'admin',
        'alteradoEm',
        'alteradoPor',
        'area',
        'ativo',
        'categorias',
        'email',
        'nome',
        'perfil',
        'perfilLabel',
        'podeRegistrar',
        'podeValidar',
      ].sort(),
    );
  });

  it('e-mail do próprio usuário não conta como repetido', async () => {
    const { repository, save } = setup();
    await expect(
      save.execute({
        id: '2',
        draft: { ...ANA_PAULA, perfil: 'planejador', email: 'carlos.lima@apsen.com.br' },
      }),
    ).resolves.toEqual({ toast: '✅ Usuário salvo!' });
    expect(repository.update.mock.calls[0]?.[1]).toMatchObject({
      perfil: 'planejador',
      podeValidar: true,
      categorias: [],
    });
  });
});
