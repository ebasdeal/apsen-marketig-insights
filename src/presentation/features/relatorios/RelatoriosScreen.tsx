import { PageHeader } from '@presentation/components/ui';
import { RELATORIOS_CANDIDATOS } from './relatoriosConteudo';

const TITULO_ID = 'relatorios-a-definir';

export function RelatoriosScreen() {
  return (
    <>
      <PageHeader
        title="Relatórios"
        description="Central de relatórios do módulo Demand Intelligence"
      />
      <section
        aria-labelledby={TITULO_ID}
        className="mx-auto my-[60px] max-w-[560px] rounded-apsen-lg border border-apsen-border bg-apsen-white px-[32px] py-[40px] text-center max-[560px]:px-[20px]"
      >
        <div aria-hidden="true" className="mb-[16px] text-[48px]">
          📊
        </div>
        <h2 id={TITULO_ID} className="mb-[10px] text-[18px] font-bold text-apsen-slate">
          Relatórios — A definir
        </h2>
        <p className="mb-[24px] text-[13.5px] leading-[1.75] text-apsen-muted">
          Esta seção está reservada para os relatórios gerenciais e operacionais do Apsen PLP Agent.
          Os relatórios serão especificados e priorizados em conjunto com as áreas de Planejamento,
          S&amp;OP e BI.
          <br />
          <br />
          <strong>Possíveis candidatos:</strong> {`${RELATORIOS_CANDIDATOS.join(' · ')}.`}
        </p>
        <span className="inline-block whitespace-nowrap rounded-[20px] border border-apsen-cyan-b bg-apsen-cyan-bg px-[18px] py-[6px] text-[12px] font-bold text-apsen-cyan">
          🔜 Em definição
        </span>
      </section>
    </>
  );
}
