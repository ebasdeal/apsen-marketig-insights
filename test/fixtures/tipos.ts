import type { CamposTipo, Categoria, Tipo } from '@domain/tipos/Tipo';
import { toCamposTipo, toCategoria, toTipo } from '@infrastructure/tipos/tipoMapper';
import {
  camposTipoDtoSchema,
  categoriasResponseSchema,
  tiposResponseSchema,
  type CamposTipoApiDto,
  type CategoriaApiDto,
  type TipoApiDto,
} from '@infrastructure/tipos/tipoSchemas';
import { readMockDb } from './mockDb';

const db = readMockDb();

export const TIPOS_API: TipoApiDto[] = tiposResponseSchema.parse(db.tipos);

export const CAMPOS_TIPO_API: CamposTipoApiDto[] = camposTipoDtoSchema.array().parse(db.camposTipo);

export const CATEGORIAS_API: CategoriaApiDto[] = categoriasResponseSchema.parse(db.categorias);

export const TIPOS: Tipo[] = TIPOS_API.map(toTipo);

export const CAMPOS_TIPO: CamposTipo[] = CAMPOS_TIPO_API.map(toCamposTipo);

export const CATEGORIAS: Categoria[] = CATEGORIAS_API.map(toCategoria);

export function tipoFixture(id: string): Tipo {
  const tipo = TIPOS.find((candidato) => candidato.id === id);
  if (tipo === undefined) {
    throw new Error(`tipo ${id} ausente no db.json`);
  }
  return structuredClone(tipo);
}

export function camposFixture(id: string): CamposTipo {
  const campos = CAMPOS_TIPO.find((candidato) => candidato.id === id);
  if (campos === undefined) {
    throw new Error(`camposTipo ${id} ausente no db.json`);
  }
  return structuredClone(campos);
}

export function categoriasFixture(): Categoria[] {
  return structuredClone(CATEGORIAS);
}
