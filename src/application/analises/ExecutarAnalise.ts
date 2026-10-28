import type { NovaAnaliseForm } from '@domain/analises/Analise';
import type { AnaliseApoioRepository } from '@domain/analises/AnaliseApoioRepository';
import { ESPERA_EXECUCAO_MS } from '@domain/analises/analiseConstants';
import type { AnaliseRepository } from '@domain/analises/AnaliseRepository';
import {
  novaAnalise,
  proximoCodigoAnalise,
  validarNovaAnalise,
} from '@domain/analises/analiseRules';
import type { Esperar, ExecutarAnaliseOutput } from './dto';

export class ExecutarAnalise {
  constructor(
    private readonly repository: AnaliseRepository,
    private readonly apoio: AnaliseApoioRepository,
    private readonly now: () => Date,
    private readonly gerarId: () => string,
    private readonly esperar: Esperar,
  ) {}

  async execute(form: NovaAnaliseForm, criadoPor?: string): Promise<ExecutarAnaliseOutput> {
    validarNovaAnalise(form);
    const [configuracao, maiorCodigo] = await Promise.all([
      this.apoio.configuracao(),
      this.repository.maiorCodigo(),
      this.esperar(ESPERA_EXECUCAO_MS),
    ]);
    const analise = novaAnalise(
      form,
      configuracao.resultado,
      this.gerarId(),
      proximoCodigoAnalise(maiorCodigo),
      this.now(),
      criadoPor,
    );
    const criada = await this.repository.create(analise);
    return { id: criada.id };
  }
}
