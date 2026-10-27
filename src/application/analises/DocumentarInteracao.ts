import type { InteracaoIa } from '@domain/analises/Analise';
import { dataHoraBr } from '@domain/analises/analiseDatas';
import type { AnaliseRepository } from '@domain/analises/AnaliseRepository';
import type { DocumentarInteracaoInput } from './dto';

export class DocumentarInteracao {
  constructor(
    private readonly repository: AnaliseRepository,
    private readonly now: () => Date,
  ) {}

  async execute(input: DocumentarInteracaoInput): Promise<InteracaoIa[]> {
    const atual = await this.repository.get(input.id);
    const historicoIa = [
      ...atual.historicoIa,
      { pergunta: input.pergunta, resposta: input.resposta, ts: dataHoraBr(this.now()) },
    ];
    await this.repository.update(input.id, { historicoIa });
    return historicoIa;
  }
}
