import type { FonteConfigDraft } from '@domain/fontes/Fonte';
import type { FonteRepository } from '@domain/fontes/FonteRepository';
import type { FonteToastResult } from './dto';
import { toFonteConfig } from './fonteConfig';

export const FONTE_CONFIG_API = '✅ Fonte configurada para API externa.';

export const FONTE_CONFIG_MOCK = '✅ Fonte configurada para lista interna.';

export interface UpdateFonteConfigInput {
  id: string;
  config: FonteConfigDraft;
}

export class UpdateFonteConfig {
  constructor(private readonly repository: FonteRepository) {}

  async execute({ id, config }: UpdateFonteConfigInput): Promise<FonteToastResult> {
    await this.repository.update(id, toFonteConfig(config));
    return { toast: config.modo === 'api' ? FONTE_CONFIG_API : FONTE_CONFIG_MOCK };
  }
}
