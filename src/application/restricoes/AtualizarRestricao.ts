import type { RestricaoForm } from '@domain/restricoes/Restricao';
import type { RestricaoRepository } from '@domain/restricoes/RestricaoRepository';
import { alteracoesDaEdicao, validarRestricao } from '@domain/restricoes/restricaoRules';
import type { RestricaoItemOutput } from './dto';

export class AtualizarRestricao {
  constructor(private readonly repository: RestricaoRepository) {}

  async execute(
    original: Pick<RestricaoItemOutput, 'id' | 'prazo'>,
    form: RestricaoForm,
  ): Promise<void> {
    validarRestricao(form);
    await this.repository.update(original.id, alteracoesDaEdicao(original, form));
  }
}
