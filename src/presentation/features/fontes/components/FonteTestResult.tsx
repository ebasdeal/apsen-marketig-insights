import type { TesteConexao, TesteConexaoTone } from '@domain/fontes/fonteRules';

const TONES: Record<TesteConexaoTone, string> = {
  error: 'bg-apsen-kpi-red text-apsen-red',
  loading: 'bg-apsen-bg text-apsen-muted',
  success: 'bg-apsen-green-bg text-apsen-green',
};

export function FonteTestResult({ resultado }: { resultado: TesteConexao | null }) {
  return (
    <div role="status" aria-live="polite">
      {resultado === null ? null : (
        <div className={`rounded-[6px] px-[12px] py-[9px] text-[12.5px] ${TONES[resultado.tone]}`}>
          {resultado.texto}
          {resultado.nota === undefined ? null : (
            <>
              <br />
              <span className="text-[11px] opacity-80">{resultado.nota}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
