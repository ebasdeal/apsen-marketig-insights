import type { AnaliseApoioRepository } from '@domain/analises/AnaliseApoioRepository';
import { ESPERA_CHAT_MS } from '@domain/analises/analiseConstants';
import { responderChat } from '@domain/analises/chatRules';
import type { Esperar, ResponderChatInput } from './dto';

export class ResponderChat {
  constructor(
    private readonly apoio: AnaliseApoioRepository,
    private readonly esperar: Esperar,
  ) {}

  async execute(input: ResponderChatInput): Promise<string> {
    const [configuracao] = await Promise.all([
      this.apoio.configuracao(),
      this.esperar(ESPERA_CHAT_MS),
    ]);
    return responderChat(input.pergunta, configuracao.regrasChat, {
      ciclo: input.ciclo,
      modelo: input.modelo,
    });
  }
}
