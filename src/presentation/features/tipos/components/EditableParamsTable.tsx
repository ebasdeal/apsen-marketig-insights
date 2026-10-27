'use client';

import type { ParamRow } from '@domain/tipos/Tipo';
import type { SelectOption } from '@presentation/components/ui';
import { ParamRowEditor } from './ParamRowEditor';
import type { TipoFormAction } from './tipoFormReducer';

interface EditableParamsTableProps {
  rows: readonly ParamRow[];
  errors: Readonly<Record<string, string>>;
  fontes: readonly SelectOption<string>[];
  dispatch: (action: TipoFormAction) => void;
}

const TH =
  'border-b border-apsen-border bg-apsen-bg px-[11px] py-[7px] text-left text-[10.5px] font-bold uppercase tracking-[.04em] text-apsen-muted';

const HEADERS = ['Nome (slug)', 'Label exibido', 'Tipo', 'Obrigatório', 'Opções (select)'];

export function EditableParamsTable({ rows, errors, fontes, dispatch }: EditableParamsTableProps) {
  return (
    <div className="mb-[10px] overflow-x-auto rounded-apsen border border-apsen-border">
      <table className="w-full min-w-[640px] border-collapse text-[12.5px]">
        <caption className="sr-only">Parâmetros do formulário</caption>
        <thead>
          <tr>
            {HEADERS.map((header) => (
              <th key={header} scope="col" className={TH}>
                {header}
              </th>
            ))}
            <th scope="col" className={TH}>
              <span className="sr-only">Remover</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <ParamRowEditor
              key={row.key}
              row={row}
              numero={index + 1}
              erro={errors[row.key]}
              fontes={fontes}
              dispatch={dispatch}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
