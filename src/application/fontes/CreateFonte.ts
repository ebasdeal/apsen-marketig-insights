import type { FonteDraft } from '@domain/fontes/Fonte';
import type { FonteRepository } from '@domain/fontes/FonteRepository';
import { FonteValidationError } from '@domain/fontes/errors';
import { FONTE_MESSAGES, validateFonteDraft } from '@domain/fontes/fonteRules';
import { CAMPOS_PADRAO, DESC_PADRAO, ICONE_PADRAO } from '@domain/fontes/vocabulario';
import type { IdGenerator } from '@domain/shared/IdGenerator';
import type { FonteToastResult } from './dto';
import { toFonteConfig } from './fonteConfig';

export class CreateFonte {
  constructor(
    private readonly repository: FonteRepository,
    private readonly ids: IdGenerator,
  ) {}

  async execute(draft: FonteDraft): Promise<FonteToastResult> {
    const nome = draft.nome.trim();
    const errors = validateFonteDraft(draft, { nova: true, nomesExistentes: [] });
    if (errors.nome === undefined && (await this.repository.existsNome(nome))) {
      errors.nome = FONTE_MESSAGES.nomeRepetido;
    }
    if (Object.keys(errors).length > 0) {
      throw new FonteValidationError(errors);
    }
    await this.repository.create({
      ...toFonteConfig(draft),
      id: this.ids.next(),
      nome,
      icon: draft.icon || ICONE_PADRAO,
      desc: draft.desc.trim() || DESC_PADRAO,
      campos: CAMPOS_PADRAO,
      custom: true,
    });
    return { toast: `✅ Nova fonte "${nome}" adicionada.` };
  }
}
