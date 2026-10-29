import type { Ciclo, CicloDraft, CicloPatch } from '@domain/ciclos/Ciclo';
import type { CicloRepository } from '@domain/ciclos/CicloRepository';
import { CicloValidationError } from '@domain/ciclos/CicloValidationError';
import {
  formatPeriodo,
  metaCriado,
  nextCicloCodigo,
  validateCicloDraft,
} from '@domain/ciclos/cicloRules';
import { InvalidValueError } from '@domain/shared/DomainError';
import type { IdGenerator } from '@domain/shared/IdGenerator';
import type { SaveCicloInput, ToastResult } from './dto';
import { encerrarAtivoExceto } from './encerrarAtivo';

export const CICLO_CRIADO = '✅ Ciclo criado!';

export const CICLO_ATUALIZADO = '✅ Ciclo atualizado!';

type CamposEditaveis = Pick<Ciclo, 'descricao' | 'inicio' | 'fim' | 'periodo' | 'responsavel'>;

function editaveis(draft: CicloDraft): CamposEditaveis {
  return {
    descricao: draft.descricao.trim(),
    inicio: draft.inicio,
    fim: draft.fim,
    periodo: formatPeriodo(draft.inicio, draft.fim),
    responsavel: draft.responsavel,
  };
}

export class SaveCiclo {
  constructor(
    private readonly repository: CicloRepository,
    private readonly ids: IdGenerator,
    private readonly now: () => Date,
  ) {}

  async execute(input: SaveCicloInput): Promise<ToastResult> {
    const errors = validateCicloDraft(input.draft);
    if (Object.keys(errors).length > 0) {
      throw new CicloValidationError(errors);
    }
    if (input.modo === 'novo') {
      await this.criar(input.draft);
      return { toast: CICLO_CRIADO };
    }
    if (input.id === undefined) {
      throw new InvalidValueError('Informe o ciclo a editar.');
    }
    await this.editar(input.id, input.draft);
    return { toast: CICLO_ATUALIZADO };
  }

  private async criar(draft: CicloDraft): Promise<void> {
    const today = this.now();
    const codigo = nextCicloCodigo(await this.repository.listCodigos(), today);
    if (draft.ativar) {
      const { ativo } = await this.repository.findAtivo();
      await encerrarAtivoExceto(this.repository, ativo, undefined, today);
    }
    await this.repository.create({
      ...editaveis(draft),
      id: this.ids.next(),
      codigo,
      meta: metaCriado(today, 1),
      drivers: 0,
      status: draft.ativar ? 'ativo' : 'rascunho',
      versao: 1,
    });
  }

  private async editar(id: string, draft: CicloDraft): Promise<void> {
    const patch: CicloPatch = editaveis(draft);
    const ativar = draft.ativar && (await this.substituirAtivo(id));
    await this.repository.update(id, ativar ? { ...patch, status: 'ativo' } : patch);
  }

  private async substituirAtivo(id: string): Promise<boolean> {
    const { ativo } = await this.repository.findAtivo();
    if (ativo?.id === id) {
      return false;
    }
    await encerrarAtivoExceto(this.repository, ativo, id, this.now());
    return true;
  }
}
