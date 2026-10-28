import type { Severidade } from '@domain/restricoes/Restricao';
import { SEVERIDADE_PILL } from '../restricaoStyles';

export function SeveridadePill({ sev, label }: { sev: Severidade; label: string }) {
  return (
    <span
      className={`inline-flex w-fit shrink-0 items-center whitespace-nowrap rounded-[20px] border px-[10px] py-[3px] text-[11.5px] font-semibold ${SEVERIDADE_PILL[sev]}`}
    >
      ● {label}
    </span>
  );
}
