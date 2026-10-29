'use client';

import type { FonteModo } from '@domain/fontes/Fonte';
import { ModeSelector } from '@presentation/components/ui';
import { MODO_HINT, MODO_OPTIONS } from '../fonteForm';

interface FonteModoFieldProps {
  value: FonteModo;
  onChange: (modo: FonteModo) => void;
}

export function FonteModoField({ value, onChange }: FonteModoFieldProps) {
  return (
    <div>
      <span className="text-[11.5px] font-semibold tracking-[.04em] text-apsen-muted uppercase">
        Modo de operação
      </span>
      <div className="mt-[4px]">
        <ModeSelector
          aria-label="Modo de operação"
          size="sm"
          options={MODO_OPTIONS}
          value={value}
          onChange={onChange}
        />
      </div>
      <div className="mt-[2px] text-[11px] text-apsen-muted-2">{MODO_HINT[value]}</div>
    </div>
  );
}
