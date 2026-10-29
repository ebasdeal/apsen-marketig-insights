import { renderWithProviders } from '@test/renderWithProviders';
import { render, screen } from '@testing-library/react';
import { SelectableCard } from '../SelectableCard';

describe('SelectableCard', () => {
  it('marca o selecionado com check e laranja', async () => {
    const onSelect = vi.fn();
    const { user } = renderWithProviders(
      <div role="radiogroup" aria-label="Modelo">
        <SelectableCard
          title="Prophet"
          description="Séries com sazonalidade"
          icon="📈"
          tag="Recomendado"
          selected
          onSelect={onSelect}
        />
      </div>,
    );
    const card = screen.getByRole('radio', { name: /Prophet/ });
    expect(card).toHaveAttribute('aria-checked', 'true');
    expect(card).toHaveClass(
      'border-apsen-orange',
      'bg-apsen-orange-soft',
      'rounded-[10px]',
      'p-[14px]',
    );
    expect(screen.getByText('✓')).toHaveClass('bg-apsen-orange', 'text-white', 'size-[18px]');
    expect(screen.getByText('Recomendado')).toHaveClass('border-apsen-orange-b', 'text-[10.5px]');
    expect(screen.getByText('Séries com sazonalidade')).toHaveClass(
      'text-[12px]',
      'text-apsen-muted',
    );
    await user.click(card);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('mostra o não selecionado neutro sem opcionais', () => {
    render(<SelectableCard title="ARIMA" selected={false} onSelect={vi.fn()} />);
    const card = screen.getByRole('radio', { name: 'ARIMA' });
    expect(card).toHaveAttribute('aria-checked', 'false');
    expect(card).toHaveClass('border-apsen-border', 'bg-apsen-bg', 'hover:border-apsen-orange');
    expect(screen.queryByText('✓')).toBeNull();
  });
});
