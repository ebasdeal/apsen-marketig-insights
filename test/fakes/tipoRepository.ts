import { NotFoundError } from '@domain/shared/DomainError';
import type { IdGenerator } from '@domain/shared/IdGenerator';
import type { CamposTipo, Categoria, Tipo } from '@domain/tipos/Tipo';
import type { TipoRepository } from '@domain/tipos/TipoRepository';
import { CAMPOS_TIPO, CATEGORIAS, TIPOS } from '../fixtures/tipos';

type Mocked<T> = { [K in keyof T]: ReturnType<typeof vi.fn> & T[K] };

export interface FakeTipoRepository extends Mocked<TipoRepository> {
  tipos: Tipo[];
  campos: CamposTipo[];
  categorias: Categoria[];
  escritas: string[];
}

export function createFakeTipoRepository(): FakeTipoRepository {
  const state = {
    tipos: structuredClone(TIPOS),
    campos: structuredClone(CAMPOS_TIPO),
    categorias: structuredClone(CATEGORIAS),
    escritas: [] as string[],
  };
  const tipoOu404 = (id: string) => {
    const tipo = state.tipos.find((candidato) => candidato.id === id);
    if (tipo === undefined) {
      throw new NotFoundError('Tipo', id);
    }
    return tipo;
  };
  const repository: TipoRepository = {
    listPage: async ({ page, size, cat }) => {
      const filtrados = state.tipos.filter((tipo) => cat === undefined || tipo.cat === cat);
      const items = filtrados.slice((page - 1) * size, page * size);
      return { items, total: filtrados.length, page, limit: size };
    },
    count: async (filtro = {}) =>
      state.tipos.filter((tipo) => filtro.ativo === undefined || tipo.ativo === filtro.ativo)
        .length,
    get: async (id) => structuredClone(tipoOu404(id)),
    findBySlug: async (slug) => state.tipos.find((tipo) => tipo.slug === slug) ?? null,
    create: async (tipo) => {
      state.escritas.push(`POST /tipos ${tipo.slug}`);
      state.tipos.push(tipo);
    },
    update: async (id, patch) => {
      state.escritas.push(`PATCH /tipos/${id}`);
      Object.assign(tipoOu404(id), patch);
    },
    delete: async (id) => {
      state.escritas.push(`DELETE /tipos/${id}`);
      tipoOu404(id);
      state.tipos = state.tipos.filter((tipo) => tipo.id !== id);
    },
    getCampos: async (id) => state.campos.find((campos) => campos.id === id) ?? null,
    saveCampos: async (campos, existe) => {
      state.escritas.push(`${existe ? 'PUT' : 'POST'} /camposTipo ${campos.id}`);
      state.campos = [...state.campos.filter((c) => c.id !== campos.id), campos];
    },
    deleteCampos: async (id) => {
      state.escritas.push(`DELETE /camposTipo/${id}`);
      state.campos = state.campos.filter((campos) => campos.id !== id);
    },
    listCategorias: async () => structuredClone(state.categorias),
    updateCategoriaTipos: async (id, tipos) => {
      state.escritas.push(`PATCH /categorias/${id}`);
      state.categorias = state.categorias.map((c) => (c.id === id ? { ...c, tipos } : c));
    },
  };
  const mocked = Object.fromEntries(
    Object.entries(repository).map(([nome, fn]) => [nome, vi.fn(fn)]),
  ) as Mocked<TipoRepository>;
  return Object.defineProperties(mocked, {
    tipos: { get: () => state.tipos },
    campos: { get: () => state.campos },
    categorias: { get: () => state.categorias },
    escritas: { get: () => state.escritas },
  }) as FakeTipoRepository;
}

export function sequentialIds(prefix = 'uuid'): IdGenerator {
  let n = 0;
  return {
    next: () => {
      n += 1;
      return `${prefix}-${n}`;
    },
  };
}
