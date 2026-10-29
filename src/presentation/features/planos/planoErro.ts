import type { PlanoCampo, PlanoInvalidoError } from '@domain/planos/PlanoErrors';

export interface PlanoCampoErro {
  campo: PlanoCampo;
  mensagem: string;
}

export function erroDoCampo(error: PlanoInvalidoError): PlanoCampoErro {
  return { campo: error.campo, mensagem: error.message.replace(/^⚠️\s*/, '') };
}

export function mensagemDoCampo(
  erro: PlanoCampoErro | null,
  campo: PlanoCampo,
): string | undefined {
  return erro?.campo === campo ? erro.mensagem : undefined;
}
