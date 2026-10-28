import type { Comparacao, LinhaComparacao } from '@domain/analises/Analise';
import { formatarDelta, formatarDeltaPct, formatarUnidades, tomDelta } from '../analiseFormat';

const TH =
  'whitespace-nowrap px-[10px] py-[8px] text-[11px] font-semibold uppercase tracking-[.05em]';

function Linha({
  linha,
  total = false,
}: {
  linha: Omit<LinhaComparacao, 'mes'> & { mes: string };
  total?: boolean;
}) {
  const td = `text-[13px] ${total ? 'px-[10px] py-[9px]' : 'px-[10px] py-[7px]'}`;
  const tom = tomDelta(linha.deltaUn);
  return (
    <tr className={total ? 'border-t-2 border-apsen-border font-bold' : 'border-b border-apsen-bg'}>
      <th scope="row" className={`${td} text-left ${total ? '' : 'font-medium'}`}>
        {linha.mes}
      </th>
      <td className={`${td} text-right text-apsen-muted`}>{formatarUnidades(linha.sem)}</td>
      <td className={`${td} text-right text-apsen-blue ${total ? '' : 'font-semibold'}`}>
        {formatarUnidades(linha.com)}
      </td>
      <td className={`${td} text-right ${tom}`}>{formatarDelta(linha.deltaUn)}</td>
      <td className={`${td} text-right ${tom} ${total ? '' : 'font-semibold'}`}>
        {formatarDeltaPct(linha.deltaPct)}
      </td>
    </tr>
  );
}

export function ComparacaoTable({ comparacao }: { comparacao: Comparacao }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse text-[12.5px]">
        <caption className="sr-only">Previsão mês a mês com e sem drivers</caption>
        <thead>
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
          </tr>
        </thead>
        <tbody>
          {comparacao.linhas.map((linha) => (
            <Linha key={linha.mes} linha={linha} />
          ))}
          <Linha linha={{ ...comparacao.total, mes: 'Total' }} total />
        </tbody>
      </table>
    </div>
  );
}
