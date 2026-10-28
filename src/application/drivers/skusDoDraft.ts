import type { FamiliaSkus } from '@domain/catalogo/Produto';
import type { ProductCatalogRepository } from '@domain/catalogo/ProductCatalogRepository';

export async function skusDaFranquia(
  catalog: ProductCatalogRepository,
  franquia: string,
): Promise<FamiliaSkus[]> {
  const [franquias, familias] = await Promise.all([
    catalog.listFranquias(),
    catalog.listFamiliasDaFranquia(franquia),
  ]);
  const ordem = franquias.find((item) => item.id === franquia)?.familias ?? [];
  const posicao = (id: string) => {
    const indice = ordem.indexOf(id);
    return indice === -1 ? ordem.length : indice;
  };
  return [...familias]
    .sort((a, b) => posicao(a.id) - posicao(b.id))
    .map((familia) => ({ familia: familia.id, skus: familia.skus }));
}
