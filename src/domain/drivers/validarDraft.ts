import type { DraftCampo, DriverDraft } from './draft';
import type { CampoTipo } from './lookups';
import { mensagemPeriodo, validarPeriodo } from './periodo';

export interface DraftErro {
  campo: DraftCampo;
  toast: string;
  mensagem: string;
}

const PERIODO_TOAST = '⚠️ Verifique a data fim (máximo 1 ano da data início).';

function erro(campo: DraftCampo, mensagem: string, toast = `⚠️ ${mensagem}`): DraftErro {
  return { campo, toast, mensagem };
}

function erroDoProduto(draft: DriverDraft): DraftErro | null {
  if (draft.modo === 'sku' && draft.sku === null) {
    return erro('sku', 'Selecione um Produto / SKU.');
  }
  if (draft.modo === 'familia' && draft.familia.trim() === '') {
    return erro('familia', 'Selecione a Família / Molécula.');
  }
  if (draft.modo === 'franquia' && draft.franquia.trim() === '') {
    return erro('franquia', 'Selecione a Franquia / Linha Terapêutica.');
  }
  return null;
}

function erroDoTipo(draft: DriverDraft): DraftErro | null {
  if (draft.tipo !== '') {
    return null;
  }
  return erro(draft.categoriaId === null ? 'categoria' : 'tipo', 'Selecione o tipo de driver.');
}

function erroDoPeriodo(draft: DriverDraft): DraftErro | null {
  if (draft.inicio === '') {
    return erro('inicio', 'Informe a data início.');
  }
  const mensagem = mensagemPeriodo(validarPeriodo(draft.inicio, draft.fim));
  return mensagem === null ? null : erro('fim', mensagem, PERIODO_TOAST);
}

function erroDosCampos(draft: DriverDraft, campos: readonly CampoTipo[]): DraftErro | null {
  const vazio = campos.find(
    (campo) => campo.required && (draft.parametros[campo.param] ?? '').trim() === '',
  );
  if (vazio === undefined) {
    return null;
  }
  return erro(
    `param:${vazio.param}`,
    'Preencha o campo obrigatório.',
    `⚠️ Preencha o campo obrigatório: ${vazio.label}.`,
  );
}

export function validarDraft(draft: DriverDraft, campos: readonly CampoTipo[]): DraftErro | null {
  return (
    erroDoProduto(draft) ??
    erroDoTipo(draft) ??
    erroDoPeriodo(draft) ??
    erroDosCampos(draft, campos)
  );
}
