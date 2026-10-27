import type { Ciclo, CicloPatch } from '@domain/ciclos/Ciclo';
import type {
  CicloAtivoInfo,
  CicloPage,
  CicloPageQuery,
  CicloRepository,
} from '@domain/ciclos/CicloRepository';
import { NotFoundError } from '@domain/shared/DomainError';

export type CicloRepoCall =
  | ['listPage', CicloPageQuery]
  | ['findAtivo']
  | ['listCodigos']
  | ['create', Ciclo]
  | ['update', string, CicloPatch];

export class FakeCicloRepository implements CicloRepository {
  readonly calls: CicloRepoCall[] = [];
  ciclos: Ciclo[];

  constructor(ciclos: readonly Ciclo[] = []) {
    this.ciclos = [...ciclos];
  }

  get writes(): CicloRepoCall[] {
    return this.calls.filter(([method]) => method === 'create' || method === 'update');
  }

  async listPage(query: CicloPageQuery): Promise<CicloPage> {
    this.calls.push(['listPage', query]);
    const start = (query.page - 1) * query.size;
    return { items: this.ciclos.slice(start, start + query.size), total: this.ciclos.length };
  }

  async findAtivo(): Promise<CicloAtivoInfo> {
    this.calls.push(['findAtivo']);
    const ativos = this.ciclos.filter((ciclo) => ciclo.status === 'ativo');
    return { ativo: ativos[0] ?? null, totalAtivos: ativos.length };
  }

  async listCodigos(): Promise<string[]> {
    this.calls.push(['listCodigos']);
    return this.ciclos.map((ciclo) => ciclo.codigo);
  }

  async create(ciclo: Ciclo): Promise<Ciclo> {
    this.calls.push(['create', ciclo]);
    this.ciclos.push(ciclo);
    return ciclo;
  }

  async update(id: string, patch: CicloPatch): Promise<Ciclo> {
    this.calls.push(['update', id, patch]);
    const index = this.ciclos.findIndex((ciclo) => ciclo.id === id);
    const current = this.ciclos[index];
    if (current === undefined) {
      throw new NotFoundError('Ciclo', id);
    }
    const updated = { ...current, ...patch };
    this.ciclos[index] = updated;
    return updated;
  }
}
