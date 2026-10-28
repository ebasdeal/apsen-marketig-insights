import type { AprovacaoRepository } from '@domain/aprovacoes/AprovacaoRepository';
import {
  estadoDaDecisao,
  registrarDecisao,
  validateRejeicao,
} from '@domain/aprovacoes/aprovacaoRules';
import { RejeicaoValidationError } from '@domain/aprovacoes/errors';
import type { RejeitarInput, ToastDto } from './dto';

export class RejeitarAprovacao {
  constructor(
    private readonly repository: AprovacaoRepository,
    private readonly clock: () => Date = () => new Date(),
  ) {}

  async execute({ id, motivo, justificativa, por }: RejeitarInput): Promise<ToastDto> {
    const errors = validateRejeicao({ motivo, justificativa });
    const mensagem = errors.motivo ?? errors.justificativa;
    if (mensagem !== undefined) {
      throw new RejeicaoValidationError(errors, mensagem);
    }
    const decisao = { tipo: 'rejeitar', motivo, justificativa } as const;
    await this.repository.update(id, {
      ...estadoDaDecisao(decisao),
      decisao: registrarDecisao(decisao, por, this.clock()),
    });
    return { toast: `❌ ${id} rejeitado. Registrante notificado.` };
  }
}
