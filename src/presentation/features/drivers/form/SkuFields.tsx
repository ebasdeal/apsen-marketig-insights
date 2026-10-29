'use client';

import type { Sku } from '@domain/catalogo/Produto';
import { tagDoSku } from '@domain/catalogo/skuLabel';
import { Autocomplete, FormField, FormGrid, TextInput } from '@presentation/components/ui';
import { useSkuSearch } from '@presentation/hooks/catalogo/useProdutoSearch';
import { useState } from 'react';
import { DriverTooltip } from './driverFormTooltips';
import type { CardProps } from './formTypes';
import { usePickerSearch } from './usePickerSearch';

const toItem = (sku: Sku) => ({ value: sku.label, tag: tagDoSku(sku) });

const LABEL = 'mb-[3px] text-[10px] uppercase tracking-[.05em] text-apsen-muted';

export function SkuAutoFields({ sku }: { sku: Sku }) {
  return (
    <div className="mb-[14px] grid grid-cols-3 gap-[10px] rounded-[8px] border border-apsen-border border-l-[3px] border-l-apsen-blue bg-apsen-bg px-[14px] py-[12px] max-[560px]:grid-cols-1">
      <div>
        <div className={LABEL}>SKU / Produto</div>
        <div className="font-mono text-[13px] font-semibold text-apsen-blue">{sku.label}</div>
      </div>
      <div>
        <div className={LABEL}>Família</div>
        <div className="text-[13px] font-medium text-apsen-slate">{sku.familia}</div>
      </div>
      <div>
        <div className={LABEL}>Franquia</div>
        <div className="text-[13px] text-apsen-slate">{sku.franquia}</div>
      </div>
    </div>
  );
}

export function SkuFields({ draft, update, errors, disabled }: Omit<CardProps, 'lookups'>) {
  const buscar = useSkuSearch();
  const picker = usePickerSearch(buscar, toItem);
  const [texto, setTexto] = useState(draft.sku?.label ?? '');
  return (
    <>
      <FormGrid columns={1}>
        <FormField
          required
          label="Produto / SKU"
          tip={<DriverTooltip tip="sku" rotulo="Produto / SKU" />}
          hint="Selecione o SKU — os campos abaixo serão preenchidos automaticamente."
          error={errors.sku}
        >
          {disabled ? (
            <TextInput value={draft.sku?.label ?? ''} onChange={() => undefined} disabled />
          ) : (
            <Autocomplete
              value={texto}
              placeholder="— Selecione ou busque pelo nome / código —"
              search={picker.search}
              sourceLabel="Catálogo de Produtos"
              loadingText="Buscando no catálogo..."
              allowFreeText={false}
              onChange={(valor) => {
                setTexto(valor);
                const escolhido = picker.resolve(valor) ?? null;
                update((d) => ({ ...d, sku: escolhido }));
              }}
            />
          )}
        </FormField>
      </FormGrid>
      {draft.sku === null ? null : <SkuAutoFields sku={draft.sku} />}
    </>
  );
}
