import type {
  CicloRowDto,
  CiclosPageDto,
  CiclosResumoDto,
  ToggleCicloInput,
} from '@application/ciclos/dto';
import { mesAno } from '@domain/ciclos/cicloRules';

function toggledRow(row: CicloRowDto, { id, ativo }: ToggleCicloInput): CicloRowDto {
  if (row.id === id) {
    return { ...row, status: ativo ? 'ativo' : 'encerrado' };
  }
  if (ativo && row.status === 'ativo') {
    return { ...row, status: 'encerrado' };
  }
  return row;
}

export function applyToggleToPage(page: CiclosPageDto, input: ToggleCicloInput): CiclosPageDto {
  return { ...page, rows: page.rows.map((row) => toggledRow(row, input)) };
}

export function applyToggleToResumo(
  resumo: CiclosResumoDto,
  input: ToggleCicloInput,
  row: CicloRowDto | undefined,
): CiclosResumoDto {
  if (!input.ativo) {
    if (resumo.ativo?.id !== input.id) {
      return resumo;
    }
    return { ...resumo, ativo: null, ativos: Math.max(0, resumo.ativos - 1) };
  }
  if (row === undefined) {
    return resumo;
  }
  return {
    ...resumo,
    ativos: resumo.ativo === null ? resumo.ativos + 1 : resumo.ativos,
    ativo: { id: row.id, codigo: row.codigo, mesAno: mesAno(row.inicio) },
  };
}
