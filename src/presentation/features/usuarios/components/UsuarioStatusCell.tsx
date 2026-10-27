'use client';

import { Toggle } from '@presentation/components/ui';

interface UsuarioStatusCellProps {
  nome: string;
  ativo: boolean;
  onChange: (ativo: boolean) => void;
}

export function UsuarioStatusCell({ nome, ativo, onChange }: UsuarioStatusCellProps) {
  return (
    <div className="flex items-center gap-[7px]">
      <Toggle checked={ativo} onChange={onChange} aria-label={`Usuário ${nome} ativo`} />
      <span
        className={`text-[12px] font-medium ${ativo ? 'text-apsen-green' : 'text-apsen-muted'}`}
      >
        {ativo ? 'Ativo' : 'Inativo'}
      </span>
    </div>
  );
}
