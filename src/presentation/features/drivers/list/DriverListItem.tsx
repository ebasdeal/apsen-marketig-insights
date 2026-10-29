import type { DriverListItemDto } from '@application/drivers/dto';
import { Button } from '@presentation/components/ui';
import { Fragment, type ReactNode } from 'react';
import { DriverTypeBadge } from '../components/DriverTypeBadge';
import { TrashIcon } from '../components/driverIcons';

export function formatVerba(valor: number): string {
  return new Intl.NumberFormat('pt-BR').format(valor);
}

function linhaPrincipal(item: DriverListItemDto): string[] {
  const partes = [`📅 ${item.periodo}`, `⚡ ${item.estrelas}`];
  if (item.verba !== null) {
    partes.push(`💰 R$ ${formatVerba(item.verba)}`);
  }
  return partes;
}

function linhas(item: DriverListItemDto): ReactNode[] {
  const resultado: ReactNode[] = [linhaPrincipal(item).join(' · ')];
  if (item.canais.length > 0) {
    resultado.push(`🏪 ${item.canais.join(', ')}`);
  }
  if (item.parametros.length > 0) {
    resultado.push(
      item.parametros.map((parametro, index) => (
        <Fragment key={parametro.chave}>
          {index > 0 ? ' · ' : null}
          <em>{parametro.chave}</em>: {parametro.valor}
        </Fragment>
      )),
    );
  }
  if (item.observacoes !== '') {
    resultado.push(`💬 ${item.observacoes}`);
  }
  return resultado;
}

interface DriverListItemProps {
  item: DriverListItemDto;
  onRemove: (item: DriverListItemDto) => void;
}

export function DriverListItem({ item, onRemove }: DriverListItemProps) {
  return (
    <li className="mb-[8px] flex items-start justify-between gap-[10px] rounded-[8px] border border-apsen-border bg-apsen-white px-[15px] py-[13px] transition-[border] duration-[130ms] hover:border-apsen-blue-light">
      <div className="min-w-0 break-words">
        <DriverTypeBadge badge={item.badge} className="mb-[5px]" />
        <div className="mb-[3px] text-[13.5px] font-semibold text-apsen-slate">{item.titulo}</div>
        <div className="text-[12px] leading-[1.7] text-apsen-muted">
          {linhas(item).map((linha, index) => (
            <Fragment key={index}>
              {index > 0 ? <br /> : null}
              {linha}
            </Fragment>
          ))}
        </div>
      </div>
      <Button
        escrita
        variant="danger"
        size="sm"
        className="mt-[4px] shrink-0"
        aria-label={`Remover ${item.titulo}`}
        onClick={() => onRemove(item)}
      >
        <TrashIcon />
        Remover
      </Button>
    </li>
  );
}
