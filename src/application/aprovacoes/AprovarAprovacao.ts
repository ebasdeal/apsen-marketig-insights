import type { AprovacaoRepository } from '@domain/aprovacoes/AprovacaoRepository';
import { registrarDecisao } from '@domain/aprovacoes/aprovacaoRules';
import type { DecidirInput, ToastDto } from './dto';

export class AprovarAprovacao {
  constructor(
    private readonly repository: AprovacaoRepository,
    private readonly clock: () => Date = () => new Date(),
  ) {}

  async execute({ id, por }: DecidirInput): Promise<ToastDto> {
    const decisao = registrarDecisao({ tipo: 'aprovar' }, por, this.clock());
    await this.repository.update(id, { status: 'aprovado', decisao });
    return { toast: `✅ ${id} aprovado e enviado para ingestão!` };
  }
}
