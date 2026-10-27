import { papelCurto } from '@domain/agentes/agenteRules';

export function toggleToast(papel: string, ativo: boolean): string {
  const curto = papelCurto(papel);
  return ativo ? `✅ ${curto} ativado.` : `⏸ ${curto} desativado.`;
}

export function testandoToast(papel: string): string {
  return `⟳ Testando ${papelCurto(papel)}...`;
}

export function conexaoOkToast(papel: string): string {
  return `✅ Conexão OK — ${papelCurto(papel)}`;
}

export function conexaoFalhaToast(papel: string): string {
  return `❌ Falha ao conectar — ${papelCurto(papel)}`;
}
