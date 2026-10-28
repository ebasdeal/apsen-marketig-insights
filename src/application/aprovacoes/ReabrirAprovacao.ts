import type { AprovacaoRepository } from '@domain/aprovacoes/AprovacaoRepository';
import { estadoDaDecisao, registrarDecisao } from '@domain/aprovacoes/aprovacaoRules';
import { AprovacaoEmUsoError } from '@domain/aprovacoes/errors';
import type { DecidirInput, ToastDto } from './dto';

export const DECISAO_REABERTA = '↩️ Decisão reaberta — driver voltou para pendente.';

export class ReabrirAprovacao {
  constructor(
    private readonly repository: AprovacaoRepository,
    private readonly clock: () => Date = () => new Date(),
  ) {}

  async execute({ id, por }: DecidirInput): Promise<ToastDto> {
    const emUso = await this.repository.listEmUso();
    if (emUso.includes(id)) {
      throw new AprovacaoEmUsoError();
    }
    const decisao = { tipo: 'reabrir' } as const;
    await this.repository.update(id, {
      ...estadoDaDecisao(decisao),
      decisao: registrarDecisao(decisao, por, this.clock()),
    });
    return { toast: DECISAO_REABERTA };
  }
}
