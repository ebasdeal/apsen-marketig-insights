import type { AprovacaoRepository } from '@domain/aprovacoes/AprovacaoRepository';
import { estadoDaDecisao, validateRejeicao } from '@domain/aprovacoes/aprovacaoRules';
import { RejeicaoValidationError } from '@domain/aprovacoes/errors';
import type { RejeitarInput, ToastDto } from './dto';

export class RejeitarAprovacao {
  constructor(private readonly repository: AprovacaoRepository) {}

  async execute({ id, motivo, justificativa }: RejeitarInput): Promise<ToastDto> {
    const errors = validateRejeicao({ motivo, justificativa });
    const mensagem = errors.motivo ?? errors.justificativa;
    if (mensagem !== undefined) {
      throw new RejeicaoValidationError(errors, mensagem);
    }
    await this.repository.update(id, estadoDaDecisao({ tipo: 'rejeitar', motivo, justificativa }));
    return { toast: `❌ ${id} rejeitado. Registrante notificado.` };
  }
}
