import type { IdGenerator } from '@domain/shared/IdGenerator';
import { parseCatalogoImport, type ImportTipo } from '@domain/tipos/catalogoImport';
import { CatalogoImportError } from '@domain/tipos/errors';
import type { Categoria, Tipo, TipoPatch } from '@domain/tipos/Tipo';
import type { TipoRepository } from '@domain/tipos/TipoRepository';
import { catLabelCurto } from '@domain/tipos/tipoRules';
import { sincronizarCategorias } from './categoriaSync';
import type { ImportCatalogoResult } from './dto';

export const CATALOGO_IMPORTADO = '✅ Catálogo importado!';

const OPCIONAIS = ['feature', 'lag', 'ativo', 'desc', 'impacto', 'perm', 'nota'] as const;

function patchDoItem(item: ImportTipo): TipoPatch {
  const patch: TipoPatch = {
    label: item.label,
    cat: item.cat,
    catL: catLabelCurto(item.cat),
    dono: item.dono,
  };
  OPCIONAIS.forEach((atributo) => {
    if (item[atributo] !== undefined) {
      Object.assign(patch, { [atributo]: item[atributo] });
    }
  });
  if (item.campos !== undefined) {
    patch.params = item.campos.length;
  }
  return patch;
}

function tipoNovo(id: string, item: ImportTipo): Tipo {
  return {
    id,
    slug: item.slug,
    label: item.label,
    cat: item.cat,
    catL: catLabelCurto(item.cat),
    dono: item.dono,
    feature: item.feature ?? 'dummy',
    lag: item.lag ?? 0,
    params: item.campos?.length ?? 0,
    ativo: item.ativo ?? true,
    desc: item.desc ?? '',
    impacto: item.impacto ?? 'aumento',
    perm: item.perm ?? 'temporario',
    nota: item.nota ?? '',
  };
}

export class ImportCatalogo {
  constructor(
    private readonly repository: TipoRepository,
    private readonly ids: IdGenerator,
  ) {}

  async execute(texto: string): Promise<ImportCatalogoResult> {
    const parsed = parseCatalogoImport(texto);
    if (!parsed.ok) {
      throw new CatalogoImportError(parsed.erro);
    }
    let categorias = await this.repository.listCategorias();
    let inseridos = 0;
    for (const item of parsed.tipos) {
      const existente = await this.repository.findBySlug(item.slug);
      if (existente === null) {
        await this.inserir(item);
        inseridos += 1;
      } else {
        await this.atualizar(existente, item);
      }
      categorias = await this.sincronizar(categorias, item, existente);
    }
    return {
      toast: CATALOGO_IMPORTADO,
      inseridos,
      atualizados: parsed.tipos.length - inseridos,
    };
  }

  private async inserir(item: ImportTipo): Promise<void> {
    const tipo = tipoNovo(this.ids.next(), item);
    await this.repository.create(tipo);
    await this.repository.saveCampos(
      { id: tipo.id, title: tipo.label, layout: 'g2', campos: item.campos ?? [] },
      false,
    );
  }

  private async atualizar(existente: Tipo, item: ImportTipo): Promise<void> {
    await this.repository.update(existente.id, patchDoItem(item));
    if (item.campos === undefined) {
      return;
    }
    const atuais = await this.repository.getCampos(existente.id);
    await this.repository.saveCampos(
      {
        id: existente.id,
        title: item.label,
        layout: atuais?.layout ?? 'g2',
        campos: item.campos,
      },
      atuais !== null,
    );
  }

  private sincronizar(
    categorias: readonly Categoria[],
    item: ImportTipo,
    existente: Tipo | null,
  ): Promise<Categoria[]> {
    return sincronizarCategorias(this.repository, categorias, {
      slug: item.slug,
      label: item.label,
      catAnterior: existente?.cat ?? null,
      catNova: item.cat,
    });
  }
}
