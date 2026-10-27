'use client';

import type { ParamRow } from '@domain/tipos/Tipo';
import { Button, Card, CardTitle, type SelectOption } from '@presentation/components/ui';
import { EditableParamsTable } from './EditableParamsTable';
import type { TipoFormAction } from './tipoFormReducer';

interface TipoParamsCardProps {
  rows: readonly ParamRow[];
  errors: Readonly<Record<string, string>>;
  fontes: readonly SelectOption<string>[];
  dispatch: (action: TipoFormAction) => void;
}

export function TipoParamsCard({ rows, errors, fontes, dispatch }: TipoParamsCardProps) {
  return (
    <Card>
      <CardTitle small="campos que aparecerão no Driver Form para este tipo">
        Parâmetros do Formulário
      </CardTitle>
      <p className="mb-[10px] text-[11px] text-apsen-muted-2">
        Estes campos compõem o objeto{' '}
        <code className="rounded-[3px] bg-apsen-bg px-[5px] py-[1px] font-mono text-[11px]">
          DriverRecord.parametros
        </code>
        .
      </p>
      <EditableParamsTable rows={rows} errors={errors} fontes={fontes} dispatch={dispatch} />
      <Button
        variant="ghost"
        size="sm"
        dashed
        className="w-full"
        onClick={() => dispatch({ type: 'addRow' })}
      >
        + Adicionar campo
      </Button>
    </Card>
  );
}
