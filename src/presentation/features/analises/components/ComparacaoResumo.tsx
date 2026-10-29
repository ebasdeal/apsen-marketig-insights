import type { Comparacao } from '@domain/analises/Analise';
import { formatarDelta, formatarDeltaPct, tomDelta } from '../analiseFormat';

export function ComparacaoResumo({ comparacao }: { comparacao: Comparacao }) {
  const { total } = comparacao;
  return (
    <>
      <p className="mb-[14px] text-[12.5px] leading-[1.6] text-apsen-muted">
        No horizonte de 12 meses, o efeito combinado dos drivers representa{' '}
        <strong className={tomDelta(total.deltaUn)}>
          {`${formatarDelta(total.deltaUn)} unidades (${formatarDeltaPct(total.deltaPct)})`}
        </strong>{' '}
        em relação ao baseline sem drivers.
      </p>
      <p className="mb-[8px] text-[12px] text-apsen-muted">
        <span
          aria-hidden="true"
          className="mr-[5px] inline-block h-[3px] w-[14px] rounded-[2px] bg-apsen-blue align-middle"
        />
        Com drivers &nbsp;
        <span
          aria-hidden="true"
          className="mr-[5px] inline-block w-[14px] border-t-2 border-dashed border-apsen-muted-2 align-middle"
        />
        Sem drivers (baseline)
      </p>
    </>
  );
}
