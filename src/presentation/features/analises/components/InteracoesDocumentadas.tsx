import type { InteracaoIa } from '@domain/analises/Analise';

export function InteracoesDocumentadas({ historico }: { historico: readonly InteracaoIa[] }) {
  return (
    <ol>
      {historico.map((item, index) => (
        <li key={`${index}-${item.pergunta}`} className="border-b border-apsen-bg py-[10px]">
          <p className="mb-[4px] text-[11px] font-bold uppercase text-apsen-muted">
            {`Pergunta ${index + 1}`}
          </p>
          <p className="mb-[6px] text-[13px] italic text-apsen-slate">{`"${item.pergunta}"`}</p>
          <p className="rounded-[6px] bg-apsen-bg px-[12px] py-[8px] text-[12.5px] text-apsen-muted">
            {item.resposta}
          </p>
        </li>
      ))}
    </ol>
  );
}
