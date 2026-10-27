'use client';

import type { CamposTipo } from '@domain/drivers/lookups';
import { Card, CardTitle, FormGrid } from '@presentation/components/ui';
import { DynamicField } from './DynamicField';
import type { CardProps } from './formTypes';

interface DynamicFieldsCardProps extends Omit<CardProps, 'lookups'> {
  config: CamposTipo;
}

export function DynamicFieldsCard({
  config,
  draft,
  update,
  errors,
  disabled,
}: DynamicFieldsCardProps) {
  return (
    <Card>
      <CardTitle step="03">Parâmetros: {config.title}</CardTitle>
      <FormGrid columns={config.layout === 'g2' ? 2 : 3}>
        {config.campos.map((campo) => (
          <DynamicField
            key={campo.id}
            campo={campo}
            draft={draft}
            update={update}
            disabled={disabled}
            error={errors[`param:${campo.param}`]}
          />
        ))}
      </FormGrid>
    </Card>
  );
}
