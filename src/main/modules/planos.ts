import { AtualizarPlanoItem } from '@application/planos/AtualizarPlanoItem';
import { ContarPlanoItens } from '@application/planos/ContarPlanoItens';
import { ExcluirPlanoItem } from '@application/planos/ExcluirPlanoItem';
import { GetPlanoItem } from '@application/planos/GetPlanoItem';
import { IncluirPlanoItem } from '@application/planos/IncluirPlanoItem';
import { ListPlanoItens } from '@application/planos/ListPlanoItens';
import { ListSkusInclusao } from '@application/planos/ListSkusInclusao';
import type { PlanosUseCases } from '@application/planos/planosUseCases';
import { ResumirPlano } from '@application/planos/ResumirPlano';
import type { HttpClient } from '@infrastructure/http/HttpClient';
import { HttpCicloAtivoRepository } from '@infrastructure/planos/HttpCicloAtivoRepository';
import { HttpPlanoItemRepository } from '@infrastructure/planos/HttpPlanoItemRepository';
import { HttpSkuMetaRepository } from '@infrastructure/planos/HttpSkuMetaRepository';

export interface PlanosModuleDeps {
  gerarId?: () => string;
}

export function createPlanosModule(
  http: HttpClient,
  { gerarId = () => crypto.randomUUID() }: PlanosModuleDeps = {},
): PlanosUseCases {
  const itens = new HttpPlanoItemRepository(http);
  const skuMeta = new HttpSkuMetaRepository(http);
  const ciclos = new HttpCicloAtivoRepository(http);
  return {
    list: new ListPlanoItens(itens, ciclos),
    contar: new ContarPlanoItens(itens),
    get: new GetPlanoItem(itens),
    skusInclusao: new ListSkusInclusao(skuMeta),
    incluir: new IncluirPlanoItem(itens, skuMeta, ciclos, gerarId),
    atualizar: new AtualizarPlanoItem(itens),
    excluir: new ExcluirPlanoItem(itens),
    resumo: new ResumirPlano(itens),
  };
}
