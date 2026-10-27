import { montarParametros } from './camposDinamicos';
import type { Driver } from './Driver';
import type { DriverDraft } from './draft';
import type { CampoTipo } from './lookups';

export interface ContextoDriver {
  campos: readonly CampoTipo[];
  skus: readonly string[];
  preservar?: Readonly<Record<string, string>>;
}

const CODIGO_FINAL = /\((\d+)\)\s*$/;

export function codigoSku(nome: string): string {
  return CODIGO_FINAL.exec(nome)?.[1] ?? nome.trim();
}

function numeroOuNulo(valor: string): number | null {
  if (valor.trim() === '') {
    return null;
  }
  const n = Number(valor);
  return Number.isFinite(n) ? n : null;
}

function produtoDoDraft(draft: DriverDraft, skus: readonly string[]) {
  if (draft.modo === 'franquia') {
    return {
      produto: `${draft.franquia} (Franquia)`,
      molecula: draft.franquia,
      codigo: '',
      skusAfetadosIa: skus.map(codigoSku),
    };
  }
  if (draft.modo === 'familia') {
    return {
      produto: `${draft.familia} (Família)`,
      molecula: draft.familia,
      codigo: '',
      skusAfetadosIa: skus.map(codigoSku),
    };
  }
  const label = draft.sku?.label ?? '';
  return {
    produto: label,
    molecula: draft.sku?.familia ?? '',
    codigo: label === '' ? '' : codigoSku(label),
    skusAfetadosIa: [],
  };
}

export function montarDriver(draft: DriverDraft, contexto: ContextoDriver, id: string): Driver {
  return {
    id,
    modo: draft.modo,
    ...produtoDoDraft(draft, contexto.skus),
    titulo: draft.titulo.trim(),
    periodo: { inicio: draft.inicio, fim: draft.fim },
    tipo: draft.tipo,
    cobertura: { regioes: [...draft.regioes], canais: [...draft.canais] },
    intensidadeEsperada: draft.intensidade,
    upliftPct: numeroOuNulo(draft.uplift),
    verbaRs: numeroOuNulo(draft.verba),
    observacoes: draft.observacoes.trim(),
    parametros: montarParametros(contexto.campos, draft.parametros, contexto.preservar),
  };
}
