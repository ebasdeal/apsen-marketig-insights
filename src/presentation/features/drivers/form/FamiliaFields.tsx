'use client';

import type { Familia } from '@domain/catalogo/Produto';
import { Autocomplete, FormField, FormGrid, TextInput } from '@presentation/components/ui';
import { useFamiliaSkus } from '@presentation/hooks/catalogo/useProdutoSkus';
import { useFamiliaSearch } from '@presentation/hooks/catalogo/useProdutoSearch';
import { useState } from 'react';
import { GearIcon } from '../components/driverIcons';
import { DriverTooltip } from './driverFormTooltips';
import { BOX_TEAL, BOX_TITLE, type CardProps } from './formTypes';
import { usePickerSearch } from './usePickerSearch';

const toItem = (familia: Familia) => ({ value: familia.id, tag: familia.franquia });

export function FamiliaSkusBox({ familia }: { familia: string }) {
  const query = useFamiliaSkus(familia);
  const skus = query.data ?? [];
  if (skus.length === 0) {
    return null;
  }
  return (
    <div className={BOX_TEAL}>
      <div className={`mb-[8px] ${BOX_TITLE}`}>
        <GearIcon />
        SKUs identificados pela IA — somente leitura · SKU · Medicamento · Família
      </div>
      <textarea
        readOnly
        aria-label="SKUs identificados pela IA"
        rows={Math.min(skus.length + 1, 8)}
        value={skus.join('\n')}
        className="w-full resize-y rounded-[6px] border border-apsen-teal-light bg-apsen-white px-[11px] py-[9px] font-mono text-[12.5px] leading-[1.8] text-apsen-slate"
      />
      <p className="mt-[5px] text-[11px] text-apsen-teal opacity-80">
        O pipeline de ingestão confirma estes SKUs com base na composição da molécula.
      </p>
    </div>
  );
}

export function FamiliaFields({ draft, update, errors, disabled }: Omit<CardProps, 'lookups'>) {
  const buscar = useFamiliaSearch();
  const picker = usePickerSearch(buscar, toItem);
  const [texto, setTexto] = useState(draft.familia);
  return (
    <>
      <FormGrid columns={2}>
        <FormField
          full
          required
          label="Família / Molécula"
          tip={<DriverTooltip tip="familia" rotulo="Família / Molécula" />}
          hint="O pipeline de IA identificará os SKUs afetados após a ingestão."
          error={errors.familia}
        >
          {disabled ? (
            <TextInput value={draft.familia} onChange={() => undefined} disabled />
          ) : (
            <Autocomplete
              value={texto}
              placeholder="— Selecione a família —"
              search={picker.search}
              sourceLabel="Catálogo de Produtos"
              loadingText="Buscando no catálogo..."
              allowFreeText={false}
              onChange={(valor) => {
                setTexto(valor);
                const escolhida = picker.resolve(valor);
                update((d) => ({ ...d, familia: escolhida?.id ?? '' }));
              }}
            />
          )}
        </FormField>
      </FormGrid>
      {draft.familia === '' ? null : <FamiliaSkusBox familia={draft.familia} />}
    </>
  );
}
