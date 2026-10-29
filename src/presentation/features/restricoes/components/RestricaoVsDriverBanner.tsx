export function RestricaoVsDriverBanner() {
  return (
    <div
      role="note"
      className="mb-[18px] flex gap-[12px] rounded-[10px] border border-apsen-danger-b-soft bg-apsen-kpi-red px-[18px] py-[14px]"
    >
      <div aria-hidden="true" className="shrink-0 text-[20px]">
        ⚠️
      </div>
      <div className="text-[13px] leading-[1.75] text-apsen-danger-ink">
        <strong className="mb-[5px] block text-apsen-danger-fg">
          Restrição vs. Driver de Demanda — qual a diferença?
        </strong>
        <strong>Driver de Demanda</strong> é um evento externo que explica variação na demanda
        (campanha de TV, sazonalidade, lançamento de concorrente) — serve de input para o modelo
        causal.
        <br />
        <strong>Restrição &amp; Alerta</strong> é um impedimento operacional que afeta a{' '}
        <em>capacidade de executar</em> o plano (falta de IFA, manutenção de linha, demanda acima do
        plano) — aciona revisão imediata do S&amp;OP.
        <br />
        <span className="mt-[5px] inline-block whitespace-nowrap rounded-[4px] bg-apsen-danger-b-soft px-[8px] py-[2px] text-[11.5px] font-semibold">
          Atenção:
        </span>{' '}
        Um mesmo evento pode gerar <em>ambos</em>: falta de IFA deve ser registrada como Driver
        (demanda censurada) <em>e</em> como Restrição (bloqueio de linha).
      </div>
    </div>
  );
}
