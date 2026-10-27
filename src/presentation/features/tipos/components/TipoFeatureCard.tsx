'use client';

import {
  FEATURE_TIPOS,
  IMPACTO_SERIE,
  LAG_MAX,
  LAG_MIN,
  PERMANENCIA,
} from '@domain/tipos/vocabulario';
import {
  Alert,
  Card,
  CardTitle,
  FormField,
  FormGrid,
  FormSelect,
  TextArea,
  TextInput,
} from '@presentation/components/ui';
import type { DraftCardProps } from './TipoIdentificacaoCard';
import { FeatureTip, ImpactoTip, LagTip, NotaTip, PermanenciaTip } from './tipoFormTips';

interface TipoFeatureCardProps extends DraftCardProps {
  featureExtra: string | null;
}

function featureOptions(extra: string | null) {
  return extra === null ? FEATURE_TIPOS : [...FEATURE_TIPOS, { value: extra, label: extra }];
}

export function TipoFeatureCard({ draft, set, errors, featureExtra }: TipoFeatureCardProps) {
  return (
    <Card>
      <CardTitle>Feature Engineering · ApsenPLPEngine</CardTitle>
      <Alert tone="warning">
        Estas configurações definem como o <strong>FeatureEngineer</strong> transforma este driver
        em variável exógena para o modelo. Impacta diretamente a qualidade do forecast.
      </Alert>
      <FormGrid columns={2}>
        <FormField label="Tipo de feature gerada" tip={<FeatureTip />}>
          <FormSelect
            value={draft.feature}
            onChange={(value) => set('feature', value)}
            options={featureOptions(featureExtra)}
          />
        </FormField>
        <FormField
          label="Lag padrão (meses)"
          tip={<LagTip />}
          hint="Negativo = lead. Ex: TV pode ter lag +1 mês. Ruptura logística = 0 (demanda censurada imediata)."
          error={errors.lag}
        >
          <TextInput
            type="number"
            min={LAG_MIN}
            max={LAG_MAX}
            step={1}
            value={draft.lag}
            onChange={(value) => set('lag', value)}
          />
        </FormField>
        <FormField label="Impacto esperado na série" tip={<ImpactoTip />}>
          <FormSelect
            value={draft.impacto}
            onChange={(value) => set('impacto', value)}
            options={IMPACTO_SERIE}
          />
        </FormField>
        <FormField label="Permanência do efeito" tip={<PermanenciaTip />}>
          <FormSelect
            value={draft.perm}
            onChange={(value) => set('perm', value)}
            options={PERMANENCIA}
          />
        </FormField>
        <FormField label="Nota metodológica para o analista" tip={<NotaTip />} full>
          <TextArea
            value={draft.nota}
            onChange={(value) => set('nota', value)}
            placeholder="Ex: Recall e ruptura logística = demanda censurada, não é queda real. Usar flag_censored() no FeatureEngineer antes de modelar..."
          />
        </FormField>
      </FormGrid>
    </Card>
  );
}
