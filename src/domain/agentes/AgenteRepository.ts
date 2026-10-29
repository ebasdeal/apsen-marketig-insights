import type { Page } from '../shared/Page';
import type { Agente, AgentePatch } from './Agente';

export interface AgentePageRequest {
  page: number;
  size: number;
}

export interface AgenteRepository {
  listPage(page: AgentePageRequest): Promise<Page<Agente>>;
  listAtivos(): Promise<Page<Agente>>;
  listCodigos(): Promise<readonly string[]>;
  get(id: string): Promise<Agente>;
  create(agente: Agente): Promise<Agente>;
  update(id: string, patch: AgentePatch): Promise<Agente>;
}
