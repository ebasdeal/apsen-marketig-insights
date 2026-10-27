import { render, screen } from '@testing-library/react';
import { PendingItemRow } from '../PendingItemRow';

describe('PendingItemRow', () => {
  it('mostra código, título, subtítulo e a ação', () => {
    render(
      <PendingItemRow
        code="DRV-2026-031"
        title="Campanha de TV"
        subtitle="Asmaliv · Abr/2026"
        actionLabel="Revisar"
        actionHref="/admin/aprovacoes"
      />,
    );
    expect(screen.getByText('DRV-2026-031')).toHaveClass(
      'min-w-[95px]',
      'font-mono',
      'text-[11px]',
      'font-semibold',
      'text-apsen-blue',
    );
    expect(screen.getByText('Campanha de TV')).toHaveClass('text-[12.5px]', 'font-medium');
    expect(screen.getByText('Asmaliv · Abr/2026')).toHaveClass('text-[11.5px]', 'text-apsen-muted');
    const link = screen.getByRole('link', { name: 'Revisar' });
    expect(link).toHaveAttribute('href', '/admin/aprovacoes');
    expect(link).toHaveClass('text-[11px]', 'px-[8px]', 'py-[2px]', 'border-apsen-border');
  });

  it('dispensa o subtítulo', () => {
    render(<PendingItemRow code="X" title="Sem subtítulo" actionLabel="Abrir" actionHref="/" />);
    expect(screen.getByText('Sem subtítulo').nextElementSibling).toBeNull();
  });
});
