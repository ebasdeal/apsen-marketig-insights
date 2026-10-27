'use client';

import type { TipoValidation } from '@domain/tipos/errors';
import type { Categoria, CategoriaSlug, TipoDraft } from '@domain/tipos/Tipo';
import { DONOS_AREA } from '@domain/tipos/vocabulario';
import {
  Card,
  CardTitle,
  FormField,
  FormGrid,
  FormSelect,
  TextInput,
} from '@presentation/components/ui';
import type { DraftField } from './tipoFormReducer';
import { DescTip, DonoTip, LabelTip, SlugTip } from './tipoFormTips';

export interface DraftCardProps {
  draft: TipoDraft;
  set: <F extends DraftField>(field: F, value: TipoDraft[F]) => void;
  errors: TipoValidation['fields'];
}

interface TipoIdentificacaoCardProps extends DraftCardProps {
  editando: boolean;
  categorias: readonly Categoria[];
}

const DONOS = DONOS_AREA.map((dono) => ({ value: dono, label: dono }));

export function TipoIdentificacaoCard({
  draft,
  set,
  errors,
  editando,
  categorias,
}: TipoIdentificacaoCardProps) {
  return (
    <Card>
      <CardTitle>Identificação do Tipo</CardTitle>
      <FormGrid columns={2}>
        <FormField
          label="Chave interna (slug)"
          required
          tip={<SlugTip />}
          hint="Sem espaços, use underscore. Identifica o tipo no DriverRecord."
          error={errors.slug}
        >
          <TextInput
            value={draft.slug}
            onChange={(value) => set('slug', value)}
            placeholder="Ex: sazo_epi"
            readOnly={editando}
            className="font-mono"
          />
        </FormField>
        <FormField label="Label no Driver Form" required tip={<LabelTip />} error={errors.label}>
          <TextInput
            value={draft.label}
            onChange={(value) => set('label', value)}
            placeholder="Ex: 🌡️ Sazonal / Epidemiológico"
          />
        </FormField>
        <FormField label="Categoria" required error={errors.cat}>
          <FormSelect<CategoriaSlug>
            value={draft.cat}
            onChange={(value) => set('cat', value)}
            placeholder="Selecione..."
            options={categorias.map((categoria) => ({
              value: categoria.slug,
              label: categoria.labelTipoForm,
            }))}
          />
        </FormField>
        <FormField label="Dono de Área" required tip={<DonoTip />} error={errors.dono}>
          <FormSelect
            value={draft.dono}
            onChange={(value) => set('dono', value)}
            placeholder="Selecione..."
            options={DONOS}
          />
        </FormField>
        <FormField label="Descrição resumida" tip={<DescTip />} full>
          <TextInput
            value={draft.desc}
            onChange={(value) => set('desc', value)}
            placeholder="Ex: Eventos sazonais e epidemiológicos que afetam a demanda ciclicamente"
          />
        </FormField>
      </FormGrid>
    </Card>
  );
}
