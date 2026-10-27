import type { AprovacaoRepository } from '@domain/aprovacoes/AprovacaoRepository';
import type { ToastDto } from './dto';

export class AprovarAprovacao {
  constructor(private readonly repository: AprovacaoRepository) {}

  async execute(id: string): Promise<ToastDto> {
    await this.repository.update(id, { status: 'aprovado' });
    return { toast: `✅ ${id} aprovado e enviado para ingestão!` };
  }
}
