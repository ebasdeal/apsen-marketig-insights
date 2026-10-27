import type { Restricao, RestricaoForm, RestricaoPatch, RestricaoTipo } from './Restricao';
import { RESPONSAVEL_PADRAO, RESTRICAO_LABELS } from './restricaoConstants';
import { RestricaoInvalidaError } from './RestricaoInvalidaError';

const PREFIXO_CODIGO = 'RST-';
const CODIGO_PATTERN = /^RST-(\d+)$/;
const ISO_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const PRAZO_PATTERN = /^(\d{2})\/(\d{2})\/(\d{4})$/;
const SEM_PRAZO = '—';
const TAMANHO_RESUMO = 40;

function doisDigitos(valor: number): string {
  return String(valor).padStart(2, '0');
}

export function proximoCodigoRestricao(maiorCodigo: string | null): string {
  const match = maiorCodigo === null ? null : CODIGO_PATTERN.exec(maiorCodigo);
  const atual = match === null ? 0 : Number(match[1]);
  return `${PREFIXO_CODIGO}${String(atual + 1).padStart(3, '0')}`;
}

export function validarRestricao(form: RestricaoForm): asserts form is RestricaoForm & {
  tipo: RestricaoTipo;
} {
  if (form.tipo === '') {
    throw new RestricaoInvalidaError('⚠️ Selecione o tipo.', 'tipo');
  }
  if (form.desc.trim() === '') {
    throw new RestricaoInvalidaError('⚠️ Informe a descrição.', 'desc');
  }
}

export function prazoDeIso(iso: string): string {
  const match = ISO_PATTERN.exec(iso.trim());
  if (match === null) {
    return SEM_PRAZO;
  }
  const [, ano, mes, dia] = match;
  return `${dia}/${mes}/${ano}`;
}

export function isoDePrazo(prazo: string): string {
  const match = PRAZO_PATTERN.exec(prazo.trim());
  if (match === null) {
    return '';
  }
  const [, dia, mes, ano] = match;
  return `${ano}-${mes}-${dia}`;
}

export function novaRestricao(
  form: RestricaoForm & { tipo: RestricaoTipo },
  id: string,
  codigo: string,
): Restricao {
  return {
    id,
    codigo,
    tipo: form.tipo,
    label: RESTRICAO_LABELS[form.tipo],
    desc: form.desc.trim(),
    det: '',
    produto: form.produto,
    impacto: form.impacto,
    impCor: form.sev,
    prazo: prazoDeIso(form.prazoIso),
    resp: form.resp,
    sev: form.sev,
    status: 'ativa',
    obs: form.obs,
    resolucao: null,
  };
}

export function alteracoesDaEdicao(
  original: Pick<Restricao, 'prazo'>,
  form: RestricaoForm & { tipo: RestricaoTipo },
): RestricaoPatch {
  const preservaPrazo = form.prazoIso.trim() === '' && isoDePrazo(original.prazo) === '';
  return {
    tipo: form.tipo,
    label: RESTRICAO_LABELS[form.tipo],
    desc: form.desc.trim(),
    produto: form.produto,
    impacto: form.impacto,
    impCor: form.sev,
    prazo: preservaPrazo ? original.prazo : prazoDeIso(form.prazoIso),
    resp: form.resp,
    sev: form.sev,
    obs: form.obs,
  };
}

export function resolucaoEm(hoje: Date): string {
  const data = `${doisDigitos(hoje.getDate())}/${doisDigitos(hoje.getMonth() + 1)}/${hoje.getFullYear()}`;
  return `Resolvida em ${data}`;
}

export function formularioVazio(): RestricaoForm {
  return {
    tipo: '',
    sev: 'critica',
    desc: '',
    produto: '',
    impacto: '',
    prazoIso: '',
    resp: RESPONSAVEL_PADRAO,
    obs: '',
  };
}

export function formularioDe(restricao: Restricao): RestricaoForm {
  return {
    tipo: restricao.tipo,
    sev: restricao.sev,
    desc: restricao.desc,
    produto: restricao.produto,
    impacto: restricao.impacto,
    prazoIso: isoDePrazo(restricao.prazo),
    resp: restricao.resp,
    obs: restricao.obs,
  };
}

export function formularioAlterado(a: RestricaoForm, b: RestricaoForm): boolean {
  return (Object.keys(a) as (keyof RestricaoForm)[]).some((campo) => a[campo] !== b[campo]);
}

export function resumoResolucao(restricao: Pick<Restricao, 'resolucao'>): string {
  return (restricao.resolucao ?? '').slice(0, TAMANHO_RESUMO);
}
