'use client';

import type { PerfilId, UsuarioFiltro } from '@domain/usuarios/Usuario';
import { USUARIO_FILTRO_PERFIS } from '@domain/usuarios/vocabulario';
import { useEffect, useMemo, useState } from 'react';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { useUrlState } from '../../navigation/useUrlState';

const SPEC = {
  q: { kind: 'string', default: '' },
  perfil: { kind: 'enum', default: '', values: USUARIO_FILTRO_PERFIS.map((opcao) => opcao.value) },
  page: { kind: 'int', default: 1, min: 1 },
} as const;

export function filtroDe(q: string, perfil: PerfilId | ''): UsuarioFiltro {
  const termo = q.trim();
  return {
    ...(termo === '' ? {} : { q: termo }),
    ...(perfil === '' ? {} : { perfil }),
  };
}

export function useUsuariosFiltro() {
  const [url, setUrl] = useUrlState(SPEC);
  const [busca, setBusca] = useState(url.q);
  const debounced = useDebouncedValue(busca);
  const perfil = url.perfil as PerfilId | '';

  useEffect(() => {
    if (debounced !== url.q) {
      setUrl({ q: debounced });
    }
  }, [debounced, url.q, setUrl]);

  const filtro = useMemo(() => filtroDe(url.q, perfil), [url.q, perfil]);

  return {
    busca,
    setBusca,
    perfil,
    setPerfil: (value: PerfilId | '') => setUrl({ perfil: value }),
    page: url.page,
    setPage: (page: number) => setUrl({ page }),
    filtro,
  };
}
