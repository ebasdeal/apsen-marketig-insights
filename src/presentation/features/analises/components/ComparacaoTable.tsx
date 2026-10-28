import type { Comparacao, FaixaIncerteza, LinhaComparacao } from '@domain/analises/Analise';
import {
  STACK_BODY,
  STACK_HEAD,
  STACK_ROW,
  STACK_TABLE,
  StackedCell,
} from '@presentation/components/ui';
import { formatarDelta, formatarDeltaPct, formatarUnidades, tomDelta } from '../analiseFormat';

const TH =
  'whitespace-nowrap px-[10px] py-[8px] text-[11px] font-semibold uppercase tracking-[.05em]';

function Linha({
  linha,
  faixa,
  total = false,
}: {
  linha: Omit<LinhaComparacao, 'mes'> & { mes: string };
  faixa: FaixaIncerteza;
  total?: boolean;
}) {
  const td = `text-[13px] ${total ? 'px-[10px] py-[9px]' : 'px-[10px] py-[7px]'}`;
  const tom = tomDelta(linha.deltaUn);
  return (
    <tr
      className={`${total ? 'border-t-2 border-apsen-border font-bold' : 'border-b border-apsen-bg'} ${STACK_ROW}`}
    >
      <th
        scope="row"
        className={`${td} text-left ${total ? '' : 'font-medium'} max-md:block max-md:px-0 max-md:pt-0 max-md:pb-[6px] max-md:text-[14px] max-md:font-semibold`}
      >
        {linha.mes}
      </th>
      <StackedCell label="Sem drivers" className={`${td} text-right text-apsen-muted`}>
        {formatarUnidades(linha.sem)}
      </StackedCell>
      <StackedCell
        label="Com drivers"
        className={`${td} text-right text-apsen-blue ${total ? '' : 'font-semibold'}`}
      >
        {formatarUnidades(linha.com)}
      </StackedCell>
      <StackedCell label="Δ un." className={`${td} text-right ${tom}`}>
        {formatarDelta(linha.deltaUn)}
      </StackedCell>
      <StackedCell
        label="Δ %"
        className={`${td} text-right ${tom} ${total ? '' : 'font-semibold'}`}
      >
        {formatarDeltaPct(linha.deltaPct)}
      </StackedCell>
      <StackedCell
        label="Intervalo"
        className={`${td} whitespace-nowrap text-right text-apsen-muted`}
      >
        {formatarUnidades(faixa.min)} – {formatarUnidades(faixa.max)}
      </StackedCell>
    </tr>
  );
}

export function ComparacaoTable({ comparacao }: { comparacao: Comparacao }) {
  return (
    <div className="overflow-x-auto max-md:overflow-visible">
      <table className={`w-full min-w-[640px] border-collapse text-[12.5px] ${STACK_TABLE}`}>
        <caption className="sr-only">Previsão mês a mês com e sem drivers</caption>
        <thead className={STACK_HEAD}>
          <tr className="border-b-2 border-apsen-border bg-apsen-bg">
            <th scope="col" className={`${TH} text-left text-apsen-muted`}>
              Mês
            </th>
            <th scope="col" className={`${TH} text-right text-apsen-muted`}>
              Sem drivers
            </th>
            <th scope="col" className={`${TH} text-right text-apsen-blue`}>
              Com drivers
            </th>
            <th scope="col" className={`${TH} text-right text-apsen-muted`}>
              Δ un.
            </th>
            <th scope="col" className={`${TH} text-right text-apsen-muted`}>
              Δ %
            </th>
            <th scope="col" className={`${TH} text-right text-apsen-muted`}>
              Intervalo ({comparacao.incerteza.nivel}%)
            </th>
          </tr>
        </thead>
        <tbody className={STACK_BODY}>
          {comparacao.linhas.map((linha, i) => (
            <Linha
              key={linha.mes}
              linha={linha}
              faixa={comparacao.incerteza.linhas[i] ?? comparacao.incerteza.total}
            />
          ))}
          <Linha
            linha={{ ...comparacao.total, mes: 'Total' }}
            faixa={comparacao.incerteza.total}
            total
          />
        </tbody>
      </table>
    </div>
  );
}
