import { USUARIO_REMOVIDO_TOAST, USUARIO_SALVO_TOAST } from '@application/usuarios/dto';
import type { UsuariosUseCases } from '@application/usuarios/usuariosUseCases';
import type { PermissoesUseCases } from '@application/permissoes/permissoesUseCases';
import {
  PERMISSOES_MATRIZ_FIXTURE,
  USUARIO_FORM_FIXTURE,
  USUARIOS_PAGE_FIXTURE,
} from '../fixtures/usuarios';

export function createFakeUsuariosUseCases(
  overrides: Partial<UsuariosUseCases> = {},
): UsuariosUseCases {
  return {
    list: { execute: vi.fn().mockResolvedValue(USUARIOS_PAGE_FIXTURE) },
    getForm: { execute: vi.fn().mockResolvedValue(USUARIO_FORM_FIXTURE) },
    save: { execute: vi.fn().mockResolvedValue({ toast: USUARIO_SALVO_TOAST }) },
    toggle: { execute: vi.fn().mockResolvedValue(undefined) },
    remove: { execute: vi.fn().mockResolvedValue({ toast: USUARIO_REMOVIDO_TOAST }) },
    ...overrides,
  };
}

export function createFakePermissoesUseCases(
  overrides: Partial<PermissoesUseCases> = {},
): PermissoesUseCases {
  return {
    list: { execute: vi.fn().mockResolvedValue(PERMISSOES_MATRIZ_FIXTURE) },
    ...overrides,
  };
}
