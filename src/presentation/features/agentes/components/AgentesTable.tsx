'use client';

import type { AgenteRowDto } from '@application/agentes/dto';
import {
  CodeTag,
  EyeIcon,
  IconButton,
  IconLink,
  PulseIcon,
  Table,
  Toggle,
  type TableColumn,
} from '@presentation/components/ui';
import { agenteEditarRoute } from '@presentation/navigation/routes';
import type { ReactNode } from 'react';
import { LockIcon, PencilIcon } from '../../usuarios/components/actionIcons';
import { EnvironmentPill, LastTestCell, ProviderPill, SchedulePill } from './pills';

interface AgentesTableProps {
  rows: readonly AgenteRowDto[];
  testando: string | null;
  podeEscrever: boolean;
  onToggle: (row: AgenteRowDto, ativo: boolean) => void;
  onTestar: (row: AgenteRowDto) => void;
  onVer: (row: AgenteRowDto) => void;
  footer?: ReactNode;
}

function StatusCell({
  row,
  onToggle,
  disabled,
}: {
  row: AgenteRowDto;
  onToggle: AgentesTableProps['onToggle'];
  disabled: boolean;
}) {
  return (
    <div className="flex items-center gap-[8px]">
      <Toggle
        checked={row.ativo}
        onChange={(ativo) => onToggle(row, ativo)}
        disabled={disabled}
        aria-label={`Agente ${row.papel} ativo`}
      />
      <span
        className={`text-[12px] font-medium ${row.ativo ? 'text-apsen-green-fg' : 'text-apsen-muted'}`}
      >
        {row.ativo ? 'Ativo' : 'Inativo'}
      </span>
    </div>
  );
}

function columns(
  onToggle: AgentesTableProps['onToggle'],
  podeEscrever: boolean,
): TableColumn<AgenteRowDto>[] {
  return [
    {
      key: 'papel',
      header: 'Nome / Papel C4',
      render: (row) => (
        <>
          <div className="text-[13px] font-medium">{row.papel}</div>
          <div className="text-[11.5px] text-apsen-muted">{row.fontes}</div>
        </>
      ),
    },
    {
      key: 'provedor',
      header: 'Provedor',
      render: (row) => <ProviderPill provedor={row.provedor} />,
    },
    {
      key: 'endpoint',
      header: 'Endpoint',
      render: (row) => (
        <span
          title={row.endpoint}
          className="block max-w-[132px] truncate text-[11.5px] text-apsen-slate"
        >
          {row.endpoint}
        </span>
      ),
    },
    {
      key: 'secret',
      header: 'Secret (Key Vault ref.)',
      render: (row) => (
        <>
          <div className="flex items-center gap-[5px] text-[12px] text-apsen-muted">
            <LockIcon size={11} strokeWidth={1.5} />
            {row.secret}
          </div>
          <div className="mt-[2px] text-[10.5px] text-apsen-muted-2">vault: {row.vault}</div>
        </>
      ),
    },
    { key: 'modelo', header: 'Modelo', render: (row) => <CodeTag>{row.modelo}</CodeTag> },
    {
      key: 'schedule',
      header: 'Schedule',
      render: (row) => <SchedulePill schedule={row.schedule} />,
    },
    { key: 'ambiente', header: 'Ambiente', render: (row) => <EnvironmentPill agente={row} /> },
    {
      key: 'teste',
      header: 'Último Teste',
      render: (row) => <LastTestCell teste={row.ultimoTeste} />,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusCell row={row} onToggle={onToggle} disabled={!podeEscrever} />,
    },
  ];
}

export function AgentesTable({
  rows,
  testando,
  podeEscrever,
  onToggle,
  onTestar,
  onVer,
  footer,
}: AgentesTableProps) {
  return (
    <Table
      caption="Agentes de IA cadastrados"
      columns={columns(onToggle, podeEscrever)}
      rows={rows}
      rowKey={(row) => row.id}
      emptyText="Nenhum agente cadastrado."
      footer={footer}
      actions={(row) => (
        <>
          <IconButton
            aria-label={`Testar conexão — ${row.papel}`}
            title="Testar conexão"
            disabled={!podeEscrever || testando === row.id}
            onClick={() => onTestar(row)}
          >
            <PulseIcon className="size-[14px]" />
          </IconButton>
          <IconButton
            aria-label={`Visualizar ${row.papel}`}
            title="Visualizar"
            onClick={() => onVer(row)}
          >
            <EyeIcon />
          </IconButton>
          <IconLink href={agenteEditarRoute(row.id)} aria-label={`Editar ${row.papel}`}>
            <PencilIcon />
          </IconLink>
        </>
      )}
    />
  );
}
