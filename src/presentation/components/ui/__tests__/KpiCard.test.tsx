import { render, screen } from '@testing-library/react';
import { KpiCard, type KpiTone } from '../KpiCard';

const TONE_CASES: readonly (readonly [KpiTone, string, string])[] = [
  ['blue', 'bg-apsen-kpi-blue', 'text-apsen-blue'],
  ['green', 'bg-apsen-kpi-green', 'text-apsen-green-fg'],
  ['orange', 'bg-apsen-kpi-orange', 'text-apsen-orange'],
  ['red', 'bg-apsen-kpi-red', 'text-apsen-red'],
];

describe('KpiCard', () => {
  it('exibe valor, rótulo e dica na ordem do protótipo', () => {
    render(<KpiCard label="ROAS" value="3,00x" hint="no período" className="col-span-2" />);
    const card = screen.getByRole('article', { name: 'ROAS: 3,00x' });
    expect(card).toHaveClass('col-span-2', 'rounded-[10px]', 'px-[20px]', 'py-[18px]');
    expect(card).not.toHaveClass('cursor-pointer');
    const value = screen.getByText('3,00x');
    const heading = screen.getByRole('heading', { level: 2, name: 'ROAS' });
    expect(value.nextElementSibling).toBe(heading);
    expect(value).toHaveClass('text-[26px]', 'font-extrabold', 'text-apsen-blue');
    expect(screen.getByText('no período')).toHaveClass('font-semibold', 'text-apsen-blue');
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('omite dica e ícone quando ausentes', () => {
    render(<KpiCard label="CPA" value="R$ 10,00" />);
    const card = screen.getByRole('article', { name: 'CPA: R$ 10,00' });
    expect(card.firstElementChild?.tagName).toBe('P');
    expect(card.querySelectorAll('p')).toHaveLength(1);
  });

  it.each(TONE_CASES)('aplica o tom %s ao ícone, valor e dica', (tone, iconBg, text) => {
    render(<KpiCard label="Receita" value="R$ 1,00" hint="dica" icon="📈" tone={tone} />);
    const icon = screen.getByText('📈');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(icon).toHaveClass(iconBg, 'size-[36px]', 'rounded-[9px]');
    expect(screen.getByText('R$ 1,00')).toHaveClass(text);
    expect(screen.getByText('dica')).toHaveClass(text);
  });

  it('navega quando recebe href', () => {
    render(<KpiCard label="Campanhas" value="15" href="/acesso-negado" className="extra" />);
    const link = screen.getByRole('link', { name: 'Campanhas: 15' });
    expect(link).toHaveAttribute('href', '/acesso-negado');
    expect(link).toHaveClass('extra', 'focus-ring');
    const card = screen.getByRole('article', { name: 'Campanhas: 15' });
    expect(card).toHaveClass('cursor-pointer', 'hover:shadow-apsen-hover');
    expect(card).not.toHaveClass('extra');
  });
});
