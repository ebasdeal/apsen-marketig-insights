import type { DriverAprovadoFonte } from '@domain/analises/AnaliseApoioRepository';
import { DRIVERS_SUGERIDOS_LIMITE } from '@domain/analises/analiseConstants';
import type { DriversSugeridosOutput } from './dto';

export class ListDriversSugeridos {
  constructor(private readonly drivers: DriverAprovadoFonte) {}

  async execute(): Promise<DriversSugeridosOutput> {
    const page = await this.drivers.listAprovados(DRIVERS_SUGERIDOS_LIMITE);
    return {
      itens: page.items.map((driver) => ({
        id: driver.id,
        tipo: driver.tipo,
        produto: driver.produto,
        params: driver.params,
        intensidade: driver.intensidade,
      })),
      total: page.total,
    };
  }
}
