'use client';

import { FormField, FormGrid, FormSelect } from '@presentation/components/ui';
import { useFranquiaSkus } from '@presentation/hooks/catalogo/useProdutoSkus';
import { GridIcon } from '../components/driverIcons';
import { DriverTooltip } from './driverFormTooltips';
import { BOX_TEAL, BOX_TITLE, type CardProps } from './formTypes';

export function FranquiaSkusBox({ franquia }: { franquia: string }) {
  const query = useFranquiaSkus(franquia);
  const familias = query.data ?? [];
  const vazio = familias.every((familia) => familia.skus.length === 0);
  return (
    <div className={BOX_TEAL}>
      <div className={`mb-[6px] ${BOX_TITLE}`}>
        <GridIcon />
        SKUs da franquia — somente leitura
      </div>
      {query.isPending ? <p className="text-[12px] text-apsen-muted">⟳ Carregando SKUs…</p> : null}
      {!query.isPending && vazio ? (
        <p className="text-[12px] text-apsen-muted">Nenhum SKU encontrado.</p>
      ) : null}
      {familias
        .filter((familia) => familia.skus.length > 0)
        .map((familia) => (
          <div key={familia.familia}>
            <div className="mt-[8px] mb-[3px] text-[10px] font-bold uppercase tracking-[.05em] text-apsen-teal">
              {familia.familia}
            </div>
            {familia.skus.map((sku) => (
              <div key={sku} className="pl-[8px] font-mono text-[12px] text-apsen-slate">
                {sku}
              </div>
            ))}
          </div>
        ))}
    </div>
  );
}

export function FranquiaFields({ draft, update, errors, disabled, lookups }: CardProps) {
  const opcoes = lookups.franquias
    .map((franquia) => franquia.id)
    .sort()
    .map((id) => ({ value: id, label: id }));
  return (
    <>
      <FormGrid columns={2}>
        <FormField
          full
          required
          label="Franquia / Linha Terapêutica"
          tip={<DriverTooltip tip="franquia" rotulo="Franquia / Linha Terapêutica" />}
          hint="O pipeline identificará todos os SKUs desta franquia após a ingestão."
          error={errors.franquia}
        >
          <FormSelect
            value={draft.franquia}
            placeholder="— Selecione a franquia —"
            options={opcoes}
            disabled={disabled}
            onChange={(franquia) => update((d) => ({ ...d, franquia }))}
          />
        </FormField>
      </FormGrid>
      {draft.franquia === '' ? null : <FranquiaSkusBox franquia={draft.franquia} />}
    </>
  );
}
