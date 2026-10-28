import db from '../../../../mock-api/db.json';
import type { NivelAcesso } from '../../perfis/Perfil';
import { UsuarioProtegidoError, UsuarioValidationError } from '../errors';
import { normalizarUsuarioId, novoUsuarioDraft, type UsuarioDraft } from '../Usuario';
import {
  areaOptions,
  capacidades,
  categoriasDoPerfil,
  descreverAlteracao,
  formatarDataHora,
  EMAIL_REGEX,
  emailValido,
  normalizarEmail,
  resumoUsuarios,
  USUARIO_MENSAGENS,
  validateUsuarioDraft,
} from '../usuarioRules';
import { USUARIO_AREAS } from '../vocabulario';

const VALIDO: UsuarioDraft = {
  nome: 'Ana Paula Ferreira',
  email: 'ana.ferreira@apsen.com.br',
  area: 'Marketing',
  perfil: 'area',
  categorias: ['midia'],
  ativo: true,
};

describe('capacidades (RN-04)', () => {
  it('dado níveis 1–4, quando calcula, então batem com os 4 usuários do db.json', () => {
    db.usuarios.forEach((usuario) => {
      const nivel = db.perfis.find((perfil) => perfil.id === usuario.perfil)?.level as NivelAcesso;
      expect(capacidades(nivel)).toEqual({
        podeRegistrar: usuario.podeRegistrar,
        podeValidar: usuario.podeValidar,
        admin: usuario.admin,
      });
    });
  });

  it('cobre as quatro combinações', () => {
    expect([1, 2, 3, 4].map((nivel) => capacidades(nivel as NivelAcesso))).toEqual([
      { podeRegistrar: false, podeValidar: false, admin: false },
      { podeRegistrar: true, podeValidar: false, admin: false },
      { podeRegistrar: true, podeValidar: true, admin: false },
      { podeRegistrar: true, podeValidar: true, admin: true },
    ]);
  });
});

describe('validateUsuarioDraft (RN-03)', () => {
  it('dado rascunho vazio, quando valida, então as mensagens saem na ordem dos campos', () => {
    const erros = validateUsuarioDraft(novoUsuarioDraft(), { emailEmUso: false });
    expect(Object.entries(erros)).toEqual([
      ['nome', '⚠️ Informe o nome completo.'],
      ['email', '⚠️ Informe um e-mail corporativo válido.'],
      ['area', '⚠️ Selecione a área / departamento.'],
      ['perfil', '⚠️ Selecione o perfil de acesso.'],
    ]);
  });

  it('e-mail "a@b" é inválido e espaços não contam como nome', () => {
    const erros = validateUsuarioDraft(
      { ...VALIDO, nome: '   ', email: 'a@b' },
      { emailEmUso: true },
    );
    expect(erros).toEqual({ nome: USUARIO_MENSAGENS.nome, email: USUARIO_MENSAGENS.email });
  });

  it('e-mail válido já usado por outro usuário mostra a quinta mensagem', () => {
    expect(validateUsuarioDraft(VALIDO, { emailEmUso: true })).toEqual({
      email: '⚠️ Já existe um usuário com este e-mail.',
    });
  });

  it('rascunho válido não tem erros; categorias não são obrigatórias', () => {
    expect(validateUsuarioDraft({ ...VALIDO, categorias: [] }, { emailEmUso: false })).toEqual({});
  });
});

describe('regras auxiliares', () => {
  it('normaliza e valida e-mail', () => {
    expect(normalizarEmail('  Ana.Ferreira@Apsen.com.BR ')).toBe('ana.ferreira@apsen.com.br');
    expect(emailValido(' x@apsen.com.br ')).toBe(true);
    expect(EMAIL_REGEX.test('a@b')).toBe(false);
  });

  it('resumo no singular e no plural', () => {
    expect(resumoUsuarios(1)).toBe('1 usuário');
    expect(resumoUsuarios(4)).toBe('4 usuários');
    expect(resumoUsuarios(0)).toBe('0 usuários');
  });

  it('área atual fora da lista entra como opção extra', () => {
    expect(areaOptions('Marketing')).toEqual([...USUARIO_AREAS]);
    expect(areaOptions('')).toEqual([...USUARIO_AREAS]);
    expect(areaOptions('S&OP')).toEqual([...USUARIO_AREAS, 'S&OP']);
  });

  it('categorias só para o perfil Área', () => {
    expect(categoriasDoPerfil('area', ['midia'])).toEqual(['midia']);
    expect(categoriasDoPerfil('admin', ['midia'])).toEqual([]);
  });

  it('ids legados numéricos e UUIDs viram string', () => {
    expect(normalizarUsuarioId(1)).toBe('1');
    expect(normalizarUsuarioId('c0a8-uuid')).toBe('c0a8-uuid');
  });

  it('rascunho novo começa ativo e vazio', () => {
    expect(novoUsuarioDraft()).toEqual({
      nome: '',
      email: '',
      area: '',
      perfil: '',
      categorias: [],
      ativo: true,
    });
  });
});

describe('erros de usuário', () => {
  it('UsuarioValidationError carrega os erros e usa o primeiro como mensagem', () => {
    const error = new UsuarioValidationError({ email: USUARIO_MENSAGENS.emailEmUso });
    expect(error.message).toBe(USUARIO_MENSAGENS.emailEmUso);
    expect(error.erros).toEqual({ email: USUARIO_MENSAGENS.emailEmUso });
    expect(new UsuarioValidationError({}).message).toBe('Usuário inválido.');
  });

  it('UsuarioProtegidoError tem a mensagem do domínio', () => {
    expect(new UsuarioProtegidoError().message).toBe('Este usuário não pode ser removido.');
  });
});

describe('auditoria de alterações (PRG-ACS-09)', () => {
  it('descreve quem alterou e quando', () => {
    const iso = new Date(2026, 9, 27, 14, 5).toISOString();
    expect(descreverAlteracao('Ana Admin', iso)).toBe('Alterado por Ana Admin em 27/10/2026 14:05');
    expect(descreverAlteracao(null, iso)).toBeNull();
    expect(descreverAlteracao('Ana Admin', null)).toBeNull();
    expect(formatarDataHora('inválida')).toBe('inválida');
  });
});
