'use client';

import type { AnaliseStatus } from '@domain/analises/Analise';
import { ANALISE_STATUS_FILTRO } from '@domain/analises/analiseConstants';
import { FormSelect, SearchInput } from '@presentation/components/ui';

const OPCOES_STATUS = ANALISE_STATUS_FILTRO.filter((opcao) => opcao.value !== '').map((opcao) => ({
  value: opcao.value as AnaliseStatus,
  label: opcao.label,
}));

interface AnalisesFiltrosProps {
  busca: string;
  status: AnaliseStatus | '';
  onBusca: (valor: string) => void;
  onStatus: (valor: AnaliseStatus | '') => void;
}

export function AnalisesFiltros({ busca, status, onBusca, onStatus }: AnalisesFiltrosProps) {
  return (
    <div role="search" className="mb-[14px] flex flex-wrap gap-[10px]">
      <SearchInput
        value={busca}
        onChange={onBusca}
        placeholder="Título, SKU, ciclo..."
        aria-label="Buscar análises"
        className="min-w-[220px]"
      />
      <FormSelect
        aria-label="Status"
        value={status}
        onChange={onStatus}
        options={OPCOES_STATUS}
        placeholder="Todos os status"
        className="w-[170px]"
      />
    </div>
  );
}
