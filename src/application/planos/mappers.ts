import { PLANO_STATUS_LABEL } from '@domain/planos/planoConstants';
import type { PlanoItem } from '@domain/planos/PlanoItem';
import { formularioDoItem, podeEditar, skuSemPrefixo } from '@domain/planos/planoRules';
import type { PlanoItemDetailOutput, PlanoItemRowOutput } from './dto';

export function toPlanoItemRow(item: PlanoItem): PlanoItemRowOutput {
  return {
    id: item.id,
    codigo: item.codigo,
    sku: item.sku,
    skuCurto: skuSemPrefixo(item.sku),
    nome: item.nome,
    apres: item.apres,
    familia: item.familia,
    qtd: item.qtd,
    linha: item.linha,
    semana: item.semana,
    status: item.status,
    statusLabel: PLANO_STATUS_LABEL[item.status],
    editavel: podeEditar(item),
  };
}

export function toPlanoItemDetail(item: PlanoItem): PlanoItemDetailOutput {
  return {
    ...toPlanoItemRow(item),
    resp: item.resp,
    obs: item.obs,
    produtoLabel: `${item.nome} · ${item.apres} · ${item.sku}`,
    somenteLeitura: !podeEditar(item),
    form: formularioDoItem(item),
  };
}
