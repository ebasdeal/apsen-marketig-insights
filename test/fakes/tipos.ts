import { tipoToDraft } from '@application/tipos/GetTipoForm';
import { toTipoRowDto } from '@application/tipos/ListTipos';
import type { ListTiposResult, TipoFormDto } from '@application/tipos/dto';
import type { TiposUseCases } from '@application/tipos/tiposUseCases';
import { DEFAULT_PAGE_SIZE, pageCountOf } from '@domain/shared/Page';
import { camposFixture, CATEGORIAS, TIPOS, tipoFixture } from '../fixtures/tipos';

export function listTiposResult(page = 1, size = DEFAULT_PAGE_SIZE): ListTiposResult {
  return {
    rows: TIPOS.slice((page - 1) * size, page * size).map(toTipoRowDto),
    filtrados: TIPOS.length,
    total: TIPOS.length,
    ativos: TIPOS.filter((tipo) => tipo.ativo).length,
    totalPages: pageCountOf(TIPOS.length, size),
  };
}

export function tipoFormFixture(id = 'tv'): TipoFormDto {
  const campos = camposFixture(id);
  const tipo = tipoFixture(id);
  return { draft: tipoToDraft(tipo, campos), campos, featureExtra: tipo.feature, alteracao: null };
}

export function createFakeTiposUseCases(overrides: Partial<TiposUseCases> = {}): TiposUseCases {
  return {
    list: { execute: vi.fn().mockResolvedValue(listTiposResult()) },
    categorias: { execute: vi.fn().mockResolvedValue(structuredClone(CATEGORIAS)) },
    getForm: { execute: vi.fn().mockResolvedValue(tipoFormFixture()) },
    save: { execute: vi.fn().mockResolvedValue({ toast: '✅ Tipo salvo!' }) },
    toggle: { execute: vi.fn().mockResolvedValue({ toast: '⏸ "tv" desativado.' }) },
    remove: { execute: vi.fn().mockResolvedValue({ toast: '🗑 Tipo removido.' }) },
    importar: {
      execute: vi
        .fn()
        .mockResolvedValue({ toast: '✅ Catálogo importado!', inseridos: 1, atualizados: 0 }),
    },
    ...overrides,
  };
}
