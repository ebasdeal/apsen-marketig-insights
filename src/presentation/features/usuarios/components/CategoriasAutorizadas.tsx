'use client';

import { CardSectionLabel, ChipMultiSelect, type ChipOption } from '@presentation/components/ui';

interface CategoriasAutorizadasProps {
  options: readonly ChipOption<string>[];
  selected: readonly string[];
  onChange: (next: string[]) => void;
}

export function CategoriasAutorizadas({ options, selected, onChange }: CategoriasAutorizadasProps) {
  return (
    <div>
      <CardSectionLabel>Categorias de Driver Autorizadas</CardSectionLabel>
      <p className="mb-[10px] text-[11px] text-apsen-muted-2">
        Usuários de <strong>Área</strong> só podem registrar drivers das categorias abaixo
        selecionadas. Marque apenas as relevantes para o setor deste usuário.
      </p>
      <ChipMultiSelect
        label="Categorias de driver autorizadas"
        hideLabel
        options={options}
        selected={selected}
        onChange={onChange}
      />
    </div>
  );
}
