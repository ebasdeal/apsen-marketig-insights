'use client';

import type { PerfilId } from '@domain/usuarios/Usuario';
import { USUARIO_FILTRO_PERFIS } from '@domain/usuarios/vocabulario';
import { FormSelect, SearchInput, Toolbar } from '@presentation/components/ui';

interface UsuariosToolbarProps {
  busca: string;
  onBusca: (value: string) => void;
  perfil: PerfilId | '';
  onPerfil: (value: PerfilId | '') => void;
}

export function UsuariosToolbar({ busca, onBusca, perfil, onPerfil }: UsuariosToolbarProps) {
  return (
    <Toolbar>
      <SearchInput
        value={busca}
        onChange={onBusca}
        placeholder="Buscar por nome, e-mail ou área..."
        aria-label="Buscar usuários"
      />
      <FormSelect<PerfilId | ''>
        value={perfil}
        onChange={onPerfil}
        options={USUARIO_FILTRO_PERFIS}
        className="w-auto text-[13px]"
        aria-label="Perfil"
      />
    </Toolbar>
  );
}
