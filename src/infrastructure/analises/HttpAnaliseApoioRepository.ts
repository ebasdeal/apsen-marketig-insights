import type { ModeloGuiado, SkuCiclo } from '@domain/analises/Analise';
import type {
  AnaliseApoioRepository,
  AnaliseConfiguracao,
} from '@domain/analises/AnaliseApoioRepository';
import { regraPadrao } from '@domain/analises/chatRules';
import { InvalidResponseError, type HttpClient } from '../http/HttpClient';
import { toResultadoMock } from './analiseMapper';
import {
  analiseConfigDtoSchema,
  modelosGuiadosDtoSchema,
  skusCicloDtoSchema,
} from './analiseSchemas';
import { isNotFound, parseResposta } from './parseResposta';

export class HttpAnaliseApoioRepository implements AnaliseApoioRepository {
  constructor(private readonly http: HttpClient) {}

  async skusDoCiclo(ciclo: string): Promise<SkuCiclo[]> {
    let data: unknown;
    try {
      data = await this.http.get(`/skusCiclo/${encodeURIComponent(ciclo)}`);
    } catch (error) {
      if (isNotFound(error)) {
        return [];
      }
      throw error;
    }
    return parseResposta(skusCicloDtoSchema, data, '/skusCiclo').skus.map((sku) => ({ ...sku }));
  }

  async modelosGuiados(): Promise<ModeloGuiado[]> {
    const data = await this.http.get('/modelosGuiados');
    return parseResposta(modelosGuiadosDtoSchema, data, '/modelosGuiados').map((modelo) => ({
      ...modelo,
    }));
  }

  async configuracao(): Promise<AnaliseConfiguracao> {
    const dto = parseResposta(analiseConfigDtoSchema, await this.http.get('/config'), '/config');
    const regrasChat = dto.chatRespostas.map((regra) => ({
      gatilhos: [...regra.gatilhos],
      resposta: regra.resposta,
    }));
    if (regraPadrao(regrasChat) === undefined) {
      throw new InvalidResponseError('Resposta de /config sem regra padrão do chat');
    }
    return { resultado: toResultadoMock(dto.analiseMockResultado), regrasChat };
  }
}
