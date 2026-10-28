import type { PerfilId, UsuarioDraft, UsuarioFiltro } from '@domain/usuarios/Usuario';
import type { PerfilBadgeTone } from '@domain/usuarios/vocabulario';

export interface UsuarioRowDto {
  id: string;
  nome: string;
  email: string;
  perfil: PerfilId;
  perfilLabel: string;
  perfilTone: PerfilBadgeTone;
  area: string;
  podeRegistrar: boolean;
  podeValidar: boolean;
  admin: boolean;
  ultimoAcesso: string;
  ativo: boolean;
  removivel: boolean;
  alteracao: string | null;
}

export interface UsuariosPageDto {
  rows: UsuarioRowDto[];
  total: number;
  totalPages: number;
  resumo: string;
}

export interface ListUsuariosInput extends UsuarioFiltro {
  page: number;
  size?: number;
}

export interface UsuarioFormDto {
  draft: UsuarioDraft;
  areaExtra: string | null;
  alteracao: string | null;
}

export interface SaveUsuarioInput {
  id?: string;
  draft: UsuarioDraft;
  alteradoPor: string;
}

export interface ToggleUsuarioInput {
  id: string;
  ativo: boolean;
  alteradoPor: string;
}

export interface UsuarioToastDto {
  toast: string;
}

export const USUARIO_SALVO_TOAST = '✅ Usuário salvo!';

export const USUARIO_REMOVIDO_TOAST = '🗑 Usuário removido.';

export const USUARIO_FALHA_TOAST = '⚠️ Não foi possível salvar as alterações. Tente novamente.';
