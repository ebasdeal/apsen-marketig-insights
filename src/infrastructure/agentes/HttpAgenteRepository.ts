import type { Agente, AgentePatch } from '@domain/agentes/Agente';
import type { AgentePageRequest, AgenteRepository } from '@domain/agentes/AgenteRepository';
import { AGENTES_ATIVOS_LIMIT } from '@domain/agentes/vocabulario';
import { NotFoundError } from '@domain/shared/DomainError';
import type { Page } from '@domain/shared/Page';
import type { HttpClient, QueryParams } from '../http/HttpClient';
import { isNotFound, parseContract } from '../http/parseContract';
import { toAgente, toAgenteDto, toAgentePatchDto } from './agenteMapper';
import { agenteDtoSchema, agentesDtoSchema } from './agenteSchema';

const RECURSO = '/agentes';

export class HttpAgenteRepository implements AgenteRepository {
  constructor(private readonly http: HttpClient) {}

  listPage({ page, size }: AgentePageRequest): Promise<Page<Agente>> {
    return this.page({ _page: String(page), _limit: String(size) }, page, size);
  }

  listAtivos(): Promise<Page<Agente>> {
    const query = { ativo: 'true', _page: '1', _limit: String(AGENTES_ATIVOS_LIMIT) };
    return this.page(query, 1, AGENTES_ATIVOS_LIMIT);
  }

  async listCodigos(): Promise<readonly string[]> {
    const payload = await this.http.get(RECURSO);
    return parseContract(agentesDtoSchema, payload, RECURSO).map((dto) => toAgente(dto).codigo);
  }

  async get(id: string): Promise<Agente> {
    const payload = await this.http.get(this.path(id)).catch((error: unknown) => {
      throw isNotFound(error) ? new NotFoundError('Agente', id) : error;
    });
    return toAgente(parseContract(agenteDtoSchema, payload, RECURSO));
  }

  async create(agente: Agente): Promise<Agente> {
    const payload = await this.http.post(RECURSO, toAgenteDto(agente));
    return toAgente(parseContract(agenteDtoSchema, payload, RECURSO));
  }

  async update(id: string, patch: AgentePatch): Promise<Agente> {
    const payload = await this.http
      .patch(this.path(id), toAgentePatchDto(patch))
      .catch((error: unknown) => {
        throw isNotFound(error) ? new NotFoundError('Agente', id) : error;
      });
    return toAgente(parseContract(agenteDtoSchema, payload, RECURSO));
  }

  private async page(query: QueryParams, page: number, limit: number): Promise<Page<Agente>> {
    const result = await this.http.getPage(RECURSO, { query });
    const items = parseContract(agentesDtoSchema, result.data, RECURSO).map(toAgente);
    return { items, total: result.total, page, limit };
  }

  private path(id: string): string {
    return `${RECURSO}/${encodeURIComponent(id)}`;
  }
}
