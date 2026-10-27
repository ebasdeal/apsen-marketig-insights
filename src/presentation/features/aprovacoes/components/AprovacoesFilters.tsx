'use client';

import type { AprovStatus } from '@domain/aprovacoes/Aprovacao';
import { APROV_STATUS, APROV_TIPOS } from '@domain/aprovacoes/vocabulario';
import {
  FilterBar,
  FormField,
  FormSelect,
  SearchInput,
  TextInput,
} from '@presentation/components/ui';

export interface AprovFiltrosValores {
  busca: string;
  ini: string;
  fim: string;
  tipo: string;
  status: AprovStatus | '';
}

interface AprovacoesFiltersProps {
  valores: AprovFiltrosValores;
  onBusca: (value: string) => void;
  onChange: (patch: Partial<Omit<AprovFiltrosValores, 'busca'>>) => void;
}

const TIPOS = APROV_TIPOS.map((tipo) => ({ value: tipo, label: tipo }));

export function AprovacoesFilters({ valores, onBusca, onChange }: AprovacoesFiltersProps) {
  return (
    <FilterBar aria-label="Filtros da fila de aprovação">
      <FormField label="Busca">
        <SearchInput
          value={valores.busca}
          onChange={onBusca}
          placeholder="Produto, molécula, registrante, código..."
          aria-label="Busca"
          className="max-w-full min-w-0"
        />
      </FormField>
      <div className="min-w-[130px]">
        <FormField label="Data inicial">
          <TextInput
            type="date"
            value={valores.ini}
            {...(valores.fim === '' ? {} : { max: valores.fim })}
            onChange={(ini) => onChange({ ini })}
          />
        </FormField>
      </div>
      <div className="min-w-[130px]">
        <FormField label="Data final">
          <TextInput
            type="date"
            value={valores.fim}
            {...(valores.ini === '' ? {} : { min: valores.ini })}
            onChange={(fim) => onChange({ fim })}
          />
        </FormField>
      </div>
      <div className="min-w-[160px]">
        <FormField label="Tipo de Driver">
          <FormSelect
            value={valores.tipo}
            onChange={(tipo) => onChange({ tipo })}
            placeholder="Todos os tipos"
            options={TIPOS}
          />
        </FormField>
      </div>
      <div className="min-w-[140px]">
        <FormField label="Status">
          <FormSelect<AprovStatus>
            value={valores.status}
            onChange={(status) => onChange({ status })}
            placeholder="Todos"
            options={APROV_STATUS}
          />
        </FormField>
      </div>
    </FilterBar>
  );
}
