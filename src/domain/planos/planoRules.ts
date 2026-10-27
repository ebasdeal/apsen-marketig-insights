import { LINHA_PADRAO, RESPONSAVEL_PADRAO_PLANO, SEMANA_PADRAO } from './planoConstants';
import { PlanoInvalidoError, PlanoSemCicloError } from './PlanoErrors';
import type {
  InclusaoForm,
  PlanoItem,
  PlanoItemForm,
  PlanoItemPatch,
  PlanoOrdem,
  PlanoOrdemCampo,
  SkuMeta,
} from './PlanoItem';

const INTEIRO_POSITIVO = /^\d+$/;
const PREFIXO_SKU = 'SKU-';
const SEM_SKU = '⚠️ Selecione o SKU.';
const SEM_QUANTIDADE = '⚠️ Informe a quantidade.';

export function padraoDoPrefixo(prefixo: string): string {
  return `^${prefixo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-`;
}

export function alternarOrdem(atual: PlanoOrdem, campo: PlanoOrdemCampo): PlanoOrdem {
  if (atual?.campo === campo) {
    return { campo, direcao: atual.direcao === 'asc' ? 'desc' : 'asc' };
  }
  return { campo, direcao: 'asc' };
}

export function proximoCodigoPlano(prefixo: string, maiorCodigo: string | null): string {
  const pattern = new RegExp(`${padraoDoPrefixo(prefixo)}(\\d+)$`);
  const match = maiorCodigo === null ? null : pattern.exec(maiorCodigo);
  const atual = match === null ? 0 : Number(match[1]);
  return `${prefixo}-${String(atual + 1).padStart(3, '0')}`;
}

export function prefixoDoCiclo(
  cicloAtivoId: string | null,
  maiorCodigoGeral: string | null,
): string {
  if (cicloAtivoId !== null) {
    return cicloAtivoId;
  }
  const codigo = maiorCodigoGeral ?? '';
  const corte = codigo.lastIndexOf('-');
  if (corte <= 0) {
    throw new PlanoSemCicloError();
  }
  return codigo.slice(0, corte);
}

export function podeEditar(item: Pick<PlanoItem, 'status'>): boolean {
  return item.status !== 'aprovado';
}

export function quantidadeValida(texto: string): number | null {
  const limpo = texto.trim();
  if (!INTEIRO_POSITIVO.test(limpo)) {
    return null;
  }
  const valor = Number(limpo);
  return valor > 0 && Number.isSafeInteger(valor) ? valor : null;
}

export function validarInclusao(form: InclusaoForm): number {
  if (form.sku.trim() === '') {
    throw new PlanoInvalidoError(SEM_SKU, 'sku');
  }
  return validarQuantidade(form.qtd);
}

export function validarEdicao(form: PlanoItemForm): number {
  return validarQuantidade(form.qtd);
}

function validarQuantidade(texto: string): number {
  const qtd = quantidadeValida(texto);
  if (qtd === null) {
    throw new PlanoInvalidoError(SEM_QUANTIDADE, 'qtd');
  }
  return qtd;
}

export function novoItem(form: InclusaoForm, meta: SkuMeta, id: string, codigo: string): PlanoItem {
  return {
    id,
    codigo,
    sku: meta.id,
    nome: meta.nome,
    apres: meta.apres,
    familia: meta.familia,
    qtd: validarInclusao(form),
    linha: form.linha,
    semana: form.semana,
    status: 'pendente',
    resp: form.resp,
    obs: form.obs.trim(),
  };
}

export function alteracoesDoItem(form: PlanoItemForm): PlanoItemPatch {
  return {
    qtd: validarEdicao(form),
    linha: form.linha,
    semana: form.semana,
    status: form.status,
    resp: form.resp,
    obs: form.obs.trim(),
  };
}

export function skuSemPrefixo(sku: string): string {
  return sku.startsWith(PREFIXO_SKU) ? sku.slice(PREFIXO_SKU.length) : sku;
}

export function formularioDoItem(item: PlanoItem): PlanoItemForm {
  return {
    qtd: String(item.qtd),
    linha: item.linha,
    semana: item.semana,
    status: item.status,
    resp: item.resp,
    obs: item.obs,
  };
}

export function formularioInclusaoVazio(): InclusaoForm {
  return {
    sku: '',
    qtd: '',
    linha: LINHA_PADRAO,
    semana: SEMANA_PADRAO,
    resp: RESPONSAVEL_PADRAO_PLANO,
    obs: '',
  };
}

export function formularioAlterado<T extends object>(a: T, b: T): boolean {
  return (Object.keys(a) as (keyof T)[]).some((campo) => a[campo] !== b[campo]);
}
