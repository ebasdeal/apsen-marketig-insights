'use client';

import { PARAM_LABORATORIO } from '@domain/drivers/camposDinamicos';
import type { CampoTipo } from '@domain/drivers/lookups';
import { Autocomplete } from '@presentation/components/ui';
import {
  useLaboratorioSearch,
  useMarcaSearch,
} from '@presentation/hooks/drivers/useConcorrenteSearch';
import { useCallback, useRef } from 'react';

export const MARCA_SEM_LAB = '⚠️ Selecione primeiro o laboratório.';

interface ConcorrenteAutocompleteProps {
  campo: CampoTipo;
  value: string;
  laboratorio: string;
  onType: (value: string) => void;
  onPick: (value: string) => void;
}

export function ConcorrenteAutocomplete({
  campo,
  value,
  laboratorio,
  onType,
  onPick,
}: ConcorrenteAutocompleteProps) {
  const buscarLabs = useLaboratorioSearch();
  const buscarMarcas = useMarcaSearch();
  const vistos = useRef(new Set<string>());
  const marcas = campo.autocomplete === 'marcas';
  const search = useCallback(
    async (termo: string) => {
      const lista = marcas ? await buscarMarcas(laboratorio, termo) : await buscarLabs(termo);
      lista.forEach((item) => vistos.current.add(item));
      return lista.map((item) => ({ value: item }));
    },
    [marcas, buscarMarcas, buscarLabs, laboratorio],
  );
  const placeholder =
    marcas && laboratorio.trim() !== ''
      ? `Digite para buscar a marca de ${laboratorio}...`
      : campo.placeholder;
  return (
    <Autocomplete
      value={value}
      search={search}
      sourceLabel="API de Concorrentes (mock)"
      loadingText="Consultando base de concorrentes..."
      itemTag={marcas ? 'Marca' : 'Laboratório'}
      {...(placeholder === undefined ? {} : { placeholder })}
      {...(marcas && laboratorio.trim() === '' ? { disabledMessage: MARCA_SEM_LAB } : {})}
      onChange={(next) => {
        if (vistos.current.has(next) && campo.param === PARAM_LABORATORIO) {
          onPick(next);
        } else {
          onType(next);
        }
      }}
    />
  );
}
