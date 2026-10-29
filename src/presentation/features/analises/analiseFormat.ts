const inteiro = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });
const umaCasa = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function formatarUnidades(valor: number): string {
  return inteiro.format(valor);
}

function sinal(valor: number): string {
  return valor >= 0 ? '+' : '';
}

export function formatarDelta(valor: number): string {
  return `${sinal(valor)}${inteiro.format(valor)}`;
}

export function formatarDeltaPct(valor: number | null): string {
  return valor === null ? '—' : `${sinal(valor)}${umaCasa.format(valor)}%`;
}

export function formatarMilhar(valor: number): string {
  if (valor < 1000) {
    return String(valor);
  }
  return `${umaCasa.format(valor / 1000).replace(/,0$/, '')}k`;
}

export function tickMilhar(valor: number | string): number | string {
  return typeof valor === 'number' && valor >= 1000 ? `${Math.round(valor / 1000)}k` : valor;
}

export function tomDelta(valor: number): 'text-apsen-green-fg' | 'text-apsen-red' {
  return valor >= 0 ? 'text-apsen-green-fg' : 'text-apsen-red';
}
