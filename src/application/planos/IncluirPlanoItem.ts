import type { InclusaoForm } from '@domain/planos/PlanoItem';
import type {
  CicloAtivoRepository,
  PlanoItemRepository,
  SkuMetaRepository,
} from '@domain/planos/PlanoItemRepository';
import {
  novoItem,
  prefixoDoCiclo,
  proximoCodigoPlano,
  validarInclusao,
} from '@domain/planos/planoRules';
import { NotFoundError } from '@domain/shared/DomainError';
import type { PlanoItemIncluidoOutput } from './dto';

export class IncluirPlanoItem {
  constructor(
    private readonly itens: PlanoItemRepository,
    private readonly skuMeta: SkuMetaRepository,
    private readonly ciclos: CicloAtivoRepository,
    private readonly gerarId: () => string,
  ) {}

  async execute(form: InclusaoForm): Promise<PlanoItemIncluidoOutput> {
    validarInclusao(form);
    const [metas, prefixo] = await Promise.all([
      this.skuMeta.listByIds([form.sku]),
      this.prefixo(),
    ]);
    const meta = metas.find((candidato) => candidato.id === form.sku);
    if (meta === undefined) {
      throw new NotFoundError('SKU', form.sku);
    }
    const codigo = proximoCodigoPlano(prefixo, await this.itens.maiorCodigo(prefixo));
    const criado = await this.itens.create(novoItem(form, meta, this.gerarId(), codigo));
    return { id: criado.id, codigo: criado.codigo };
  }

  private async prefixo(): Promise<string> {
    const ciclo = await this.ciclos.cicloAtivoId();
    return prefixoDoCiclo(ciclo, ciclo === null ? await this.itens.maiorCodigo() : null);
  }
}
