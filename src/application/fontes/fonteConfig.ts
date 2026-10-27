import type { FonteConfig, FonteConfigDraft } from '@domain/fontes/Fonte';
import { parseCache } from '@domain/fontes/fonteRules';
import { MAP_PADRAO } from '@domain/fontes/vocabulario';

export function toFonteConfig(draft: FonteConfigDraft): FonteConfig {
  return {
    modo: draft.modo,
    url: draft.url.trim(),
    auth: draft.auth,
    cache: parseCache(draft.cache),
    mapValor: draft.mapValor.trim() || MAP_PADRAO.valor,
    mapLabel: draft.mapLabel.trim() || MAP_PADRAO.label,
  };
}
