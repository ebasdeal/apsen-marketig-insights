'use client';

import { INGERIDOS_CATEGORIAS } from '@domain/ingeridos/ingeridoRules';
import { FormSelect, SearchInput, Toolbar } from '@presentation/components/ui';

interface IngeridosToolbarProps {
  busca: string;
  categoria: string;
  onBusca: (value: string) => void;
  onCategoria: (value: string) => void;
}

const CATEGORIAS = INGERIDOS_CATEGORIAS.map((categoria) => ({
  value: categoria,
  label: categoria,
}));

export function IngeridosToolbar({
  busca,
  categoria,
  onBusca,
  onCategoria,
}: IngeridosToolbarProps) {
  return (
    <Toolbar>
      <SearchInput
        value={busca}
        onChange={onBusca}
        placeholder="Buscar produto, tipo, origem..."
        aria-label="Buscar drivers ingeridos"
      />
      <FormSelect
        value={categoria}
        onChange={onCategoria}
        placeholder="Todas as categorias"
        options={CATEGORIAS}
        aria-label="Categoria"
        className="w-auto text-[13px]"
      />
    </Toolbar>
  );
}
