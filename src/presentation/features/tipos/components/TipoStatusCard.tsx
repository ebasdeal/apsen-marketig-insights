'use client';

import { Button, Card, CardTitle, FormActions, StatusField } from '@presentation/components/ui';

interface TipoStatusCardProps {
  ativo: boolean;
  onAtivoChange: (ativo: boolean) => void;
  salvando: boolean;
  onCancelar: () => void;
  onSalvar: () => void;
}

export function TipoStatusCard({
  ativo,
  onAtivoChange,
  salvando,
  onCancelar,
  onSalvar,
}: TipoStatusCardProps) {
  return (
    <Card>
      <CardTitle>Status</CardTitle>
      <StatusField
        title="Ativo no Driver Form"
        description="Tipos inativos ficam ocultos no formulário das áreas mas preservam os registros históricos."
        checked={ativo}
        onChange={onAtivoChange}
      />
      <FormActions className="mt-[14px]">
        <Button variant="ghost" onClick={onCancelar} disabled={salvando}>
          Cancelar
        </Button>
        <Button escrita variant="teal" onClick={onSalvar} loading={salvando}>
          Salvar Tipo
        </Button>
      </FormActions>
    </Card>
  );
}
