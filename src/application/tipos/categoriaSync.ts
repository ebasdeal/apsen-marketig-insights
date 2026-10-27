import type { Categoria } from '@domain/tipos/Tipo';
import type { TipoRepository } from '@domain/tipos/TipoRepository';
import {
  aplicarCategoriaPatches,
  categoriaPatches,
  type CategoriaPatchInput,
} from '@domain/tipos/tipoRules';

export async function sincronizarCategorias(
  repository: TipoRepository,
  categorias: readonly Categoria[],
  input: CategoriaPatchInput,
): Promise<Categoria[]> {
  const patches = categoriaPatches(categorias, input);
  for (const patch of patches) {
    await repository.updateCategoriaTipos(patch.id, patch.tipos);
  }
  return aplicarCategoriaPatches(categorias, patches);
}
