import type { PlanoItem } from '@domain/planos/PlanoItem';
import type { PlanoItemDto } from './planoSchemas';

export function toPlanoItem(dto: PlanoItemDto): PlanoItem {
  return {
    id: dto.id,
    codigo: dto.codigo ?? dto.id,
    sku: dto.sku,
    nome: dto.nome,
    apres: dto.apres,
    familia: dto.familia,
    qtd: dto.qtd,
    linha: dto.linha,
    semana: dto.semana,
    status: dto.status,
    resp: dto.resp,
    obs: dto.obs,
  };
}

export function toPlanoItemDto(item: PlanoItem): PlanoItemDto {
  return { ...item };
}
