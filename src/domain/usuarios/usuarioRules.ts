import type { NivelAcesso, PerfilId } from '../perfis/Perfil';
import type { UsuarioDraft } from './Usuario';
import { USUARIO_AREAS } from './vocabulario';

export type UsuarioCampo = 'nome' | 'email' | 'area' | 'perfil';

export type UsuarioErros = Partial<Record<UsuarioCampo, string>>;

export interface Capacidades {
  podeRegistrar: boolean;
  podeValidar: boolean;
  admin: boolean;
}

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const USUARIO_MENSAGENS = {
  nome: '⚠️ Informe o nome completo.',
  email: '⚠️ Informe um e-mail corporativo válido.',
  emailEmUso: '⚠️ Já existe um usuário com este e-mail.',
  area: '⚠️ Selecione a área / departamento.',
  perfil: '⚠️ Selecione o perfil de acesso.',
} as const;

export function capacidades(level: NivelAcesso): Capacidades {
  return { podeRegistrar: level >= 2, podeValidar: level >= 3, admin: level === 4 };
}

export function normalizarEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function emailValido(email: string): boolean {
  return EMAIL_REGEX.test(normalizarEmail(email));
}

export function validateUsuarioDraft(
  draft: UsuarioDraft,
  { emailEmUso }: { emailEmUso: boolean },
): UsuarioErros {
  const erros: UsuarioErros = {};
  if (draft.nome.trim() === '') {
    erros.nome = USUARIO_MENSAGENS.nome;
  }
  if (!emailValido(draft.email)) {
    erros.email = USUARIO_MENSAGENS.email;
  } else if (emailEmUso) {
    erros.email = USUARIO_MENSAGENS.emailEmUso;
  }
  if (draft.area.trim() === '') {
    erros.area = USUARIO_MENSAGENS.area;
  }
  if (draft.perfil === '') {
    erros.perfil = USUARIO_MENSAGENS.perfil;
  }
  return erros;
}

export function categoriasDoPerfil(perfil: PerfilId, categorias: readonly string[]): string[] {
  return perfil === 'area' ? [...categorias] : [];
}

export function resumoUsuarios(n: number): string {
  return n === 1 ? '1 usuário' : `${n} usuários`;
}

function doisDigitos(n: number): string {
  return String(n).padStart(2, '0');
}

export function formatarDataHora(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  const dia = [date.getDate(), date.getMonth() + 1].map(doisDigitos).join('/');
  const hora = [date.getHours(), date.getMinutes()].map(doisDigitos).join(':');
  return `${dia}/${date.getFullYear()} ${hora}`;
}

export function descreverAlteracao(
  alteradoPor: string | null,
  alteradoEm: string | null,
): string | null {
  if (alteradoPor === null || alteradoEm === null) {
    return null;
  }
  return `Alterado por ${alteradoPor} em ${formatarDataHora(alteradoEm)}`;
}

export function areaOptions(atual: string): string[] {
  const areas = [...USUARIO_AREAS];
  return atual.trim() === '' || areas.includes(atual) ? areas : [...areas, atual];
}
