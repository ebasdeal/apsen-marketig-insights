'use client';

import type { CicloRowDto } from '@application/ciclos/dto';
import { Badge, Toggle } from '@presentation/components/ui';

interface CicloStatusCellProps {
  ciclo: CicloRowDto;
  pending: boolean;
  onToggle: (ciclo: CicloRowDto, ativo: boolean) => void;
}

export function CicloStatusCell({ ciclo, pending, onToggle }: CicloStatusCellProps) {
  if (ciclo.status === 'encerrado') {
    return <Badge tone="gray">Encerrado</Badge>;
  }
  const ativo = ciclo.status === 'ativo';
  return (
    <div className="flex items-center gap-[8px]">
      <Toggle
        checked={ativo}
        disabled={pending}
        aria-label={`Ciclo ${ciclo.codigo} ativo`}
        onChange={(checked) => onToggle(ciclo, checked)}
      />
      <span
        className={`text-[12px] font-medium ${ativo ? 'text-apsen-green' : 'text-apsen-muted'}`}
      >
        {ativo ? 'Ativo' : 'Rascunho'}
      </span>
    </div>
  );
}
