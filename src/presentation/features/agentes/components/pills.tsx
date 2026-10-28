import type { AgenteRowDto } from '@application/agentes/dto';
import type { Provedor, UltimoTeste } from '@domain/agentes/Agente';
import type { AmbienteTone } from '@domain/agentes/agenteRules';

const PROVIDER_TONES: Record<Provedor, string> = {
  'azure-foundry': 'border-apsen-blue-light bg-apsen-kpi-blue text-apsen-blue',
  anthropic: 'border-apsen-yellow-b bg-apsen-yellow-soft text-apsen-yellow',
  openai: 'border-apsen-green-b bg-apsen-green-bg text-apsen-green',
};

const ENV_TONES: Record<AmbienteTone, string> = {
  red: 'border-apsen-red-b bg-apsen-red-bg text-apsen-red',
  yellow: 'border-apsen-yellow-b bg-apsen-yellow-bg text-apsen-yellow',
  green: 'border-apsen-green-b bg-apsen-green-bg text-apsen-green',
};

export function ProviderPill({ provedor }: { provedor: Provedor }) {
  return (
    <span
      className={`rounded-[8px] border px-[8px] py-[2px] text-[11px] font-bold ${PROVIDER_TONES[provedor]}`}
    >
      {provedor}
    </span>
  );
}

export function EnvironmentPill({
  agente,
}: {
  agente: Pick<AgenteRowDto, 'ambienteTone' | 'ambienteLabel'>;
}) {
  return (
    <span
      className={`rounded-[6px] border px-[8px] py-[2px] text-[11px] font-semibold ${ENV_TONES[agente.ambienteTone]}`}
    >
      {agente.ambienteLabel}
    </span>
  );
}

export function SchedulePill({ schedule }: { schedule: string }) {
  return (
    <span className="rounded-[8px] bg-apsen-blue-bg px-[8px] py-[2px] text-[11.5px] font-semibold text-apsen-blue">
      {schedule}
    </span>
  );
}

export function LastTestCell({ teste }: { teste: UltimoTeste }) {
  if (teste.status === 'pendente') {
    return <div className="text-[12px] text-apsen-muted">{teste.ts}</div>;
  }
  const ok = teste.status === 'ok';
  return (
    <>
      <div
        className={
          ok
            ? 'text-[12.5px] font-medium text-apsen-green'
            : 'text-[12px] font-medium text-apsen-red'
        }
      >
        {ok ? '✓ OK' : '✗ Falha — timeout'}
      </div>
      <div className="text-[11px] text-apsen-muted">{teste.ts}</div>
    </>
  );
}
