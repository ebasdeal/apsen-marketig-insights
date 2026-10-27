import type { CicloAtivoDto, CicloRowDto, CiclosResumoDto } from '@application/ciclos/dto';
import type { CicloDraft } from '@domain/ciclos/Ciclo';
import { RESPONSAVEIS_CICLO } from '@domain/ciclos/cicloRules';

export type CicloModalMode = { modo: 'novo' } | { modo: 'editar'; ciclo: CicloRowDto };

export interface CicloFormState {
  codigo: string;
  descricao: string;
  inicio: string;
  fim: string;
  responsavel: string;
  ativar: boolean;
}

export function initialCicloForm(mode: CicloModalMode, resumo: CiclosResumoDto): CicloFormState {
  if (mode.modo === 'novo') {
    return {
      codigo: resumo.proximoCodigo,
      descricao: '',
      inicio: resumo.proximoPeriodo.inicio,
      fim: resumo.proximoPeriodo.fim,
      responsavel: RESPONSAVEIS_CICLO[0],
      ativar: false,
    };
  }
  const { ciclo } = mode;
  return {
    codigo: ciclo.codigo,
    descricao: ciclo.descricao,
    inicio: ciclo.inicio,
    fim: ciclo.fim,
    responsavel: ciclo.responsavel,
    ativar: ciclo.status === 'ativo',
  };
}

export function isCicloFormDirty(current: CicloFormState, initial: CicloFormState): boolean {
  return (Object.keys(initial) as (keyof CicloFormState)[]).some(
    (key) => current[key] !== initial[key],
  );
}

export function toCicloDraft(form: CicloFormState): CicloDraft {
  return {
    descricao: form.descricao,
    inicio: form.inicio,
    fim: form.fim,
    responsavel: form.responsavel,
    ativar: form.ativar,
  };
}

export function responsavelOptions(atual: string): { value: string; label: string }[] {
  const nomes: string[] = [...RESPONSAVEIS_CICLO];
  if (atual !== '' && !nomes.includes(atual)) {
    nomes.push(atual);
  }
  return nomes.map((nome) => ({ value: nome, label: nome }));
}

export function ativarDescription(ativo: CicloAtivoDto | null): string {
  return ativo === null
    ? 'Ativa este ciclo como ciclo corrente.'
    : `Encerra o ciclo ${ativo.codigo} e ativa este como ciclo corrente.`;
}

export function showsStatusField(mode: CicloModalMode): boolean {
  return mode.modo === 'novo' || mode.ciclo.status !== 'ativo';
}
