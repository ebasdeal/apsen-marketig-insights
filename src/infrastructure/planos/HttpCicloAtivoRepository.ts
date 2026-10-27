import type { CicloAtivoRepository } from '@domain/planos/PlanoItemRepository';
import type { HttpClient } from '../http/HttpClient';
import { parseResponse } from './parseResponse';
import { cicloResumoListSchema } from './planoSchemas';

const PATH = 'ciclos';
const ATIVO = 'ativo';

export class HttpCicloAtivoRepository implements CicloAtivoRepository {
  constructor(private readonly http: HttpClient) {}

  async cicloAtivoId(): Promise<string | null> {
    const payload = await this.http.get(PATH, { query: { status: ATIVO } });
    const ciclos = parseResponse(cicloResumoListSchema, payload, PATH);
    return ciclos.find((ciclo) => ciclo.status === ATIVO)?.id ?? null;
  }
}
