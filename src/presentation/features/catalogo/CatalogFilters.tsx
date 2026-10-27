'use client';

import type { CatalogFiltersDto } from '@application/catalogo/dto';
import { FormSelect, SearchInput, type SelectGroup } from '@presentation/components/ui';

interface CatalogFiltersProps {
  busca: string;
  onBusca: (value: string) => void;
  franquia: string;
  onFranquia: (value: string) => void;
  familia: string;
  onFamilia: (value: string) => void;
  filtros: CatalogFiltersDto | undefined;
}

const SELECT = 'h-[38px] w-[190px]';

function opcoes(valores: readonly string[]) {
  return valores.map((value) => ({ value, label: value }));
}

export function familiaGroups(
  filtros: CatalogFiltersDto | undefined,
  franquia: string,
): { options: { value: string; label: string }[]; groups: SelectGroup<string>[] } {
  if (filtros === undefined) {
    return { options: [], groups: [] };
  }
  if (franquia !== '') {
    return { options: opcoes(filtros.familiasPorFranquia[franquia] ?? []), groups: [] };
  }
  return {
    options: [],
    groups: filtros.franquias.map((id) => ({
      label: id,
      options: opcoes(filtros.familiasPorFranquia[id] ?? []),
    })),
  };
}

export function CatalogFilters(props: CatalogFiltersProps) {
  const familias = familiaGroups(props.filtros, props.franquia);
  return (
    <div
      role="search"
      aria-label="Filtrar catálogo"
      className="mb-[14px] flex flex-wrap gap-[10px]"
    >
      <SearchInput
        value={props.busca}
        onChange={props.onBusca}
        placeholder="Buscar família ou SKU..."
        aria-label="Buscar família ou SKU"
        className="min-w-[200px] max-w-none [&_input]:h-[38px]"
      />
      <FormSelect
        aria-label="Filtrar por franquia"
        placeholder="Todas as franquias"
        className={SELECT}
        value={props.franquia}
        options={opcoes(props.filtros?.franquias ?? [])}
        onChange={props.onFranquia}
      />
      <FormSelect
        aria-label="Filtrar por família"
        placeholder="Todas as famílias"
        className={SELECT}
        value={props.familia}
        options={familias.options}
        groups={familias.groups}
        onChange={props.onFamilia}
      />
    </div>
  );
}
