export function ciclosLabel(total: number): string {
  return total === 1 ? '1 ciclo' : `${total} ciclos`;
}

export function ativosLabel(ativos: number): string {
  return ativos === 1 ? '1 ativo' : `${ativos} ativos`;
}

export function CiclosSummary({ total, ativos }: { total: number; ativos: number }) {
  return (
    <p className="mb-[12px] text-[13px] text-apsen-muted">
      <strong>{ciclosLabel(total)}</strong> cadastrados ·{' '}
      <span className="font-medium text-apsen-green-fg">{ativosLabel(ativos)}</span>
    </p>
  );
}
