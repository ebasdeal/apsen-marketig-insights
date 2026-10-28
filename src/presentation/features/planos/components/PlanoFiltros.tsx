'use client';

import { PLANO_FAMILIAS, PLANO_STATUS, PLANO_STATUS_LABEL } from '@domain/planos/planoConstants';
import { FormSelect, SearchInput } from '@presentation/components/ui';
import { useDebouncedValue } from '@presentation/hooks/useDebouncedValue';
import { useEffect, useState } from 'react';

interface PlanoFiltrosProps {
  busca: string;
  familia: string;
  status: string;
  onChange: (patch: { busca?: string; familia?: string; status?: string }) => void;
}

const FAMILIA_OPCOES = PLANO_FAMILIAS.map((familia) => ({ value: familia, label: familia }));
const STATUS_OPCOES = PLANO_STATUS.map((status) => ({
  value: status,
  label: `● ${PLANO_STATUS_LABEL[status]}`,
}));

export function PlanoFiltros({ busca, familia, status, onChange }: PlanoFiltrosProps) {
  const [texto, setTexto] = useState(busca);
  const debounced = useDebouncedValue(texto);

  useEffect(() => {
    if (debounced !== busca) onChange({ busca: debounced });
  }, [debounced, busca, onChange]);

  return (
    <div role="search" className="mb-[12px] flex flex-wrap items-center gap-[10px]">
      <SearchInput
        aria-label="Buscar itens do plano"
        placeholder="Buscar produto, código, linha..."
        className="min-w-[220px]"
        value={texto}
        onChange={setTexto}
      />
      <FormSelect
        aria-label="Família"
        className="w-[180px]"
        placeholder="Todas as famílias"
        options={FAMILIA_OPCOES}
        value={familia}
        onChange={(valor) => onChange({ familia: valor })}
      />
      <FormSelect
        aria-label="Status"
        className="w-[170px]"
        placeholder="Todos os status"
        options={STATUS_OPCOES}
        value={status as (typeof PLANO_STATUS)[number] | ''}
        onChange={(valor) => onChange({ status: valor })}
      />
    </div>
  );
}
