import type { ParamRow, TipoDraft } from '@domain/tipos/Tipo';
import { NOVA_ROW } from '@domain/tipos/vocabulario';

export type DraftField = Exclude<keyof TipoDraft, 'rows'>;

export type TipoFormAction =
  | { type: 'set'; field: DraftField; value: TipoDraft[DraftField] }
  | { type: 'addRow' }
  | { type: 'removeRow'; key: string }
  | { type: 'updateRow'; key: string; patch: Partial<Omit<ParamRow, 'key' | 'original'>> };

export function nextRowKey(rows: readonly ParamRow[]): string {
  const maior = rows.reduce((max, row) => {
    const numero = Number(/^row-(\d+)$/.exec(row.key)?.[1] ?? 0);
    return Math.max(max, numero);
  }, 0);
  return `row-${maior + 1}`;
}

export function tipoFormReducer(draft: TipoDraft, action: TipoFormAction): TipoDraft {
  switch (action.type) {
    case 'set':
      return { ...draft, [action.field]: action.value };
    case 'addRow':
      return { ...draft, rows: [...draft.rows, { ...NOVA_ROW, key: nextRowKey(draft.rows) }] };
    case 'removeRow':
      return { ...draft, rows: draft.rows.filter((row) => row.key !== action.key) };
    case 'updateRow':
      return {
        ...draft,
        rows: draft.rows.map((row) => (row.key === action.key ? { ...row, ...action.patch } : row)),
      };
  }
}

export function draftSujo(atual: TipoDraft, inicial: TipoDraft): boolean {
  return JSON.stringify(atual) !== JSON.stringify(inicial);
}
