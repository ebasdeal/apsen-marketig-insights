import type { Fonte } from '@domain/fontes/Fonte';
import { CAMPOS_PADRAO, MAP_PADRAO } from '@domain/fontes/vocabulario';
import type { FonteApiDto } from './fonteSchema';

export function toFonte(dto: FonteApiDto): Fonte {
  return {
    id: dto.id,
    nome: dto.nome,
    icon: dto.icon,
    desc: dto.desc,
    modo: dto.modo,
    url: dto.url,
    auth: dto.auth,
    cache: dto.cache,
    campos: dto.campos ?? CAMPOS_PADRAO,
    mapValor: dto.mapValor ?? MAP_PADRAO.valor,
    mapLabel: dto.mapLabel ?? MAP_PADRAO.label,
    custom: dto._custom ?? false,
  };
}

export function toFonteDto(fonte: Fonte): FonteApiDto {
  return {
    id: fonte.id,
    nome: fonte.nome,
    icon: fonte.icon,
    desc: fonte.desc,
    modo: fonte.modo,
    url: fonte.url,
    auth: fonte.auth,
    cache: fonte.cache,
    mapValor: fonte.mapValor,
    mapLabel: fonte.mapLabel,
    campos: fonte.campos,
    _custom: fonte.custom,
  };
}
