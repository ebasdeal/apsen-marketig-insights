import type { AgenteRepository } from '@domain/agentes/AgenteRepository';
import type { PerfilRepository } from '@domain/perfis/PerfilRepository';
import type { Perfil } from '@domain/perfis/Perfil';
import type { UsuarioRepository } from '@domain/usuarios/UsuarioRepository';
import { AGENTES_FIXTURE } from '../fixtures/agentes';
import { PERFIS_FIXTURE } from '../fixtures/perfis';
import { USUARIOS_FIXTURE } from '../fixtures/usuarios';

type Mocked<T> = { [K in keyof T]: ReturnType<typeof vi.fn> & T[K] };

export function createFakeUsuarioRepository(): Mocked<UsuarioRepository> {
  return {
    listPage: vi.fn(async (_filtro, { page, size }) => ({
      items: USUARIOS_FIXTURE,
      total: USUARIOS_FIXTURE.length,
      page,
      limit: size,
    })),
    get: vi.fn(async (id: string) => USUARIOS_FIXTURE.find((usuario) => usuario.id === id)!),
    findByEmail: vi.fn(async (email: string) =>
      USUARIOS_FIXTURE.filter((usuario) => usuario.email === email),
    ),
    create: vi.fn(async (usuario) => usuario),
    update: vi.fn(async (id: string, patch) => ({
      ...USUARIOS_FIXTURE.find((usuario) => usuario.id === id)!,
      ...patch,
    })),
    delete: vi.fn(async () => undefined),
  } as Mocked<UsuarioRepository>;
}

export function createFakePerfilRepository(): Mocked<PerfilRepository> {
  return { list: vi.fn(async () => PERFIS_FIXTURE as Perfil[]) } as Mocked<PerfilRepository>;
}

export function createFakeAgenteRepository(): Mocked<AgenteRepository> {
  return {
    listPage: vi.fn(async ({ page, size }) => ({
      items: AGENTES_FIXTURE.slice((page - 1) * size, page * size),
      total: AGENTES_FIXTURE.length,
      page,
      limit: size,
    })),
    listAtivos: vi.fn(async () => {
      const items = AGENTES_FIXTURE.filter((agente) => agente.ativo);
      return { items, total: items.length, page: 1, limit: 50 };
    }),
    listCodigos: vi.fn(async () => AGENTES_FIXTURE.map((agente) => agente.codigo)),
    get: vi.fn(async (id: string) => AGENTES_FIXTURE.find((agente) => agente.id === id)!),
    create: vi.fn(async (agente) => agente),
    update: vi.fn(async (id: string, patch) => ({
      ...AGENTES_FIXTURE.find((agente) => agente.id === id)!,
      ...patch,
    })),
  } as Mocked<AgenteRepository>;
}
