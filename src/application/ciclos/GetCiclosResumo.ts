import type { CicloRepository } from '@domain/ciclos/CicloRepository';
import { defaultPeriodo, mesAno, nextCicloCodigo } from '@domain/ciclos/cicloRules';
import type { CiclosResumoDto } from './dto';

export class GetCiclosResumo {
  constructor(
    private readonly repository: CicloRepository,
    private readonly now: () => Date,
  ) {}

  async execute(): Promise<CiclosResumoDto> {
    const [pagina, { ativo, totalAtivos }, codigos] = await Promise.all([
      this.repository.listPage({ page: 1, size: 1 }),
      this.repository.findAtivo(),
      this.repository.listCodigos(),
    ]);
    const proximoCodigo = nextCicloCodigo(codigos, this.now());
    return {
      total: pagina.total,
      ativos: totalAtivos,
      ativo:
        ativo === null
          ? null
          : { id: ativo.id, codigo: ativo.codigo, mesAno: mesAno(ativo.inicio) },
      proximoCodigo,
      proximoPeriodo: defaultPeriodo(proximoCodigo),
    };
  }
}
