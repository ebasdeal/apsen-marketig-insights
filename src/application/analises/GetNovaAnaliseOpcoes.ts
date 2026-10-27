import type { AnaliseApoioRepository, CicloFonte } from '@domain/analises/AnaliseApoioRepository';
import { cicloAtivo, rotuloCiclo } from '@domain/analises/analiseRules';
import type { NovaAnaliseOpcoesOutput } from './dto';

export class GetNovaAnaliseOpcoes {
  constructor(
    private readonly ciclos: CicloFonte,
    private readonly apoio: AnaliseApoioRepository,
  ) {}

  async execute(): Promise<NovaAnaliseOpcoesOutput> {
    const [ciclos, modelosGuiados] = await Promise.all([
      this.ciclos.listCiclos(),
      this.apoio.modelosGuiados(),
    ]);
    const ativoId = cicloAtivo(ciclos)?.id ?? null;
    return {
      ciclos: ciclos.map((ciclo) => ({ value: ciclo.id, label: rotuloCiclo(ciclo, ativoId) })),
      cicloAtivoId: ativoId,
      modelosGuiados: modelosGuiados.map((modelo) => ({ ...modelo })),
    };
  }
}
