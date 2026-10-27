import type { AprovacaoRepository } from '@domain/aprovacoes/AprovacaoRepository';
import { estadoDaDecisao } from '@domain/aprovacoes/aprovacaoRules';
import { AprovacaoEmUsoError } from '@domain/aprovacoes/errors';
import type { ToastDto } from './dto';

export const DECISAO_REABERTA = '↩️ Decisão reaberta — driver voltou para pendente.';

export class ReabrirAprovacao {
  constructor(private readonly repository: AprovacaoRepository) {}

  async execute(id: string): Promise<ToastDto> {
    const emUso = await this.repository.listEmUso();
    if (emUso.includes(id)) {
      throw new AprovacaoEmUsoError();
    }
    await this.repository.update(id, estadoDaDecisao({ tipo: 'reabrir' }));
    return { toast: DECISAO_REABERTA };
  }
}
