'use client';

import { tiposDisponiveis } from '@domain/drivers/camposDinamicos';
import { trocarCategoria, trocarTipo } from '@domain/drivers/draft';
import { Card, CardTitle, FormField, FormSelect } from '@presentation/components/ui';
import { DriverTooltip } from './driverFormTooltips';
import type { CardProps } from './formTypes';

interface TipoDriverCardProps extends CardProps {
  tipoOriginal: string;
}

export function SelectedTipoBadge({ label }: { label: string }) {
  return (
    <span className="mt-[6px] inline-flex items-center gap-[6px] rounded-[20px] border border-apsen-blue-light bg-apsen-blue-bg px-[13px] py-[4px] text-[12.5px] font-semibold text-apsen-blue">
      <span aria-hidden="true" className="size-[6px] rounded-full bg-apsen-blue" />
      {label} selecionado
    </span>
  );
}

export function TipoDriverCard({
  draft,
  update,
  errors,
  disabled,
  lookups,
  tipoOriginal,
}: TipoDriverCardProps) {
  const categoria = lookups.categorias.find((item) => item.id === draft.categoriaId);
  const tipos = tiposDisponiveis(categoria, lookups.tiposAtivos, tipoOriginal);
  return (
    <Card>
      <CardTitle step="02">Tipo de Driver</CardTitle>
      <div className="mb-[6px] grid grid-cols-2 gap-[12px] max-[560px]:grid-cols-1">
        <FormField
          required
          label="Categoria"
          tip={<DriverTooltip tip="categoria" rotulo="Categoria" />}
          error={errors.categoria}
        >
          <FormSelect
            value={draft.categoriaId === null ? '' : String(draft.categoriaId)}
            placeholder="— Selecione a categoria —"
            disabled={disabled}
            options={lookups.categorias.map((item) => ({
              value: String(item.id),
              label: item.label,
            }))}
            onChange={(value) =>
              update((d) => trocarCategoria(d, value === '' ? null : Number(value)))
            }
          />
        </FormField>
        <FormField
          required
          label="Tipo específico"
          tip={<DriverTooltip tip="tipo" rotulo="Tipo específico" />}
          error={errors.tipo}
        >
          <FormSelect
            value={draft.tipo}
            placeholder="— Selecione o tipo —"
            disabled={disabled || categoria === undefined}
            options={tipos.map((tipo) => ({ value: tipo.slug, label: tipo.label }))}
            onChange={(tipo) =>
              update((d) =>
                tipo === ''
                  ? { ...d, tipo: '', parametros: {}, herdado: null }
                  : trocarTipo(d, tipo, lookups.camposPorTipo[tipo]?.campos ?? []),
              )
            }
          />
        </FormField>
      </div>
      {draft.tipo === '' ? null : (
        <SelectedTipoBadge label={lookups.config.labels[draft.tipo] ?? draft.tipo} />
      )}
    </Card>
  );
}
