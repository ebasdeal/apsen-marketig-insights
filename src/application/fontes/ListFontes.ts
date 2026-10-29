import type { Fonte } from '@domain/fontes/Fonte';
import type { FontePageQuery, FonteRepository } from '@domain/fontes/FonteRepository';
import { apiLine, isApi, statusLabel } from '@domain/fontes/fonteRules';
import type { FonteCardDto, FontesPageDto } from './dto';

export function toFonteCardDto(fonte: Fonte): FonteCardDto {
  return {
    id: fonte.id,
    nome: fonte.nome,
    icon: fonte.icon,
    desc: fonte.desc,
    isApi: isApi(fonte),
    statusLabel: statusLabel(fonte),
    apiLine: isApi(fonte) ? apiLine(fonte) : null,
    removivel: fonte.custom,
    config: {
      modo: fonte.modo,
      url: fonte.url,
      auth: fonte.auth,
      cache: fonte.cache,
      mapValor: fonte.mapValor,
      mapLabel: fonte.mapLabel,
    },
  };
}

export class ListFontes {
  constructor(private readonly repository: FonteRepository) {}

  async execute(query: FontePageQuery): Promise<FontesPageDto> {
    const { items, total } = await this.repository.listPage(query);
    return {
      items: items.map(toFonteCardDto),
      total,
      totalPages: Math.ceil(total / query.size),
    };
  }
}
