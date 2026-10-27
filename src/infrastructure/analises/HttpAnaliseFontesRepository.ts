import type { CicloResumo, DriverAprovado } from '@domain/analises/Analise';
import type { CicloFonte, DriverAprovadoFonte } from '@domain/analises/AnaliseApoioRepository';
import type { Page } from '@domain/shared/Page';
import type { HttpClient } from '../http/HttpClient';
import { ciclosResumoDtoSchema, driversAprovadosDtoSchema } from './analiseSchemas';
import { parseResposta } from './parseResposta';

export class HttpAnaliseFontesRepository implements CicloFonte, DriverAprovadoFonte {
  constructor(private readonly http: HttpClient) {}

  async listCiclos(): Promise<CicloResumo[]> {
    const data = await this.http.get('/ciclos');
    return parseResposta(ciclosResumoDtoSchema, data, '/ciclos').map((ciclo) => ({ ...ciclo }));
  }

  async listAprovados(limite: number): Promise<Page<DriverAprovado>> {
    const { data, total } = await this.http.getPage('/aprovacoes', {
      query: { status: 'aprovado', _page: '1', _limit: String(limite) },
    });
    return {
      items: parseResposta(driversAprovadosDtoSchema, data, '/aprovacoes').map((driver) => ({
        ...driver,
      })),
      total,
      page: 1,
      limit: limite,
    };
  }
}
