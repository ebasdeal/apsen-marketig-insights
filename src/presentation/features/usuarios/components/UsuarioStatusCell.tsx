'use client';

import { Toggle } from '@presentation/components/ui';

interface UsuarioStatusCellProps {
  nome: string;
  ativo: boolean;
  alteracao: string | null;
  disabled: boolean;
  onChange: (ativo: boolean) => void;
}

export function UsuarioStatusCell({
  nome,
  ativo,
  alteracao,
  disabled,
  onChange,
}: UsuarioStatusCellProps) {
  return (
    <>
      <div className="flex items-center gap-[7px]">
        <Toggle
          checked={ativo}
          onChange={onChange}
          disabled={disabled}
          aria-label={`Usuário ${nome} ativo`}
        />
        <span
          className={`text-[12px] font-medium ${ativo ? 'text-apsen-green' : 'text-apsen-muted'}`}
        >
          {ativo ? 'Ativo' : 'Inativo'}
        </span>
      </div>
      {alteracao === null ? null : (
        <div className="mt-[3px] text-[10.5px] whitespace-nowrap text-apsen-muted-2">
          {alteracao}
        </div>
      )}
    </>
  );
}
