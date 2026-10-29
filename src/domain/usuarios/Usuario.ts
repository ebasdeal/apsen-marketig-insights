import type { PerfilId } from '../perfis/Perfil';

export type { PerfilId };

export type UsuarioIdBruto = string | number;

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: PerfilId;
  perfilLabel: string;
  area: string;
  podeRegistrar: boolean;
  podeValidar: boolean;
  admin: boolean;
  ultimoAcesso: string;
  ativo: boolean;
  removivel: boolean;
  categorias: string[];
  alteradoPor: string | null;
  alteradoEm: string | null;
}

export interface UsuarioDraft {
  nome: string;
  email: string;
  area: string;
  perfil: PerfilId | '';
  categorias: string[];
  ativo: boolean;
}

export interface UsuarioFiltro {
  q?: string;
  perfil?: PerfilId | '';
}

export type UsuarioPatch = Partial<Omit<Usuario, 'id' | 'ultimoAcesso' | 'removivel'>>;

export function normalizarUsuarioId(id: UsuarioIdBruto): string {
  return String(id);
}

export function novoUsuarioDraft(): UsuarioDraft {
  return { nome: '', email: '', area: '', perfil: '', categorias: [], ativo: true };
}
