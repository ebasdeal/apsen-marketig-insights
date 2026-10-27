import type { CampoTipo, CamposTipo, Categoria, Tipo } from '@domain/tipos/Tipo';
import type { CampoApiDto, CamposTipoApiDto, CategoriaApiDto, TipoApiDto } from './tipoSchemas';

export function toTipo(dto: TipoApiDto): Tipo {
  return {
    id: dto.id,
    slug: dto.slug,
    label: dto.label,
    cat: dto.cat,
    catL: dto.catL,
    dono: dto.dono,
    feature: dto.feature,
    lag: dto.lag,
    params: dto.params,
    ativo: dto.ativo,
    desc: dto.desc ?? '',
    impacto: dto.impacto ?? 'aumento',
    perm: dto.perm ?? 'temporario',
    nota: dto.nota ?? '',
  };
}

export function toCampo(dto: CampoApiDto): CampoTipo {
  return Object.fromEntries(
    Object.entries(dto).filter(([, valor]) => valor !== undefined),
  ) as CampoTipo;
}

export function toCamposTipo(dto: CamposTipoApiDto): CamposTipo {
  return { id: dto.id, title: dto.title, layout: dto.layout, campos: dto.campos.map(toCampo) };
}

export function toCategoria(dto: CategoriaApiDto): Categoria {
  return {
    id: dto.id,
    label: dto.label,
    slug: dto.slug,
    labelTipoForm: dto.labelTipoForm,
    tipos: dto.tipos.map((tipo) => ({ slug: tipo.slug, label: tipo.label })),
  };
}
