import { renderWithProviders } from '@test/renderWithProviders';
import { render, screen } from '@testing-library/react';
import { CheckboxCard } from '../CheckboxCard';

describe('CheckboxCard', () => {
  it('nomeia pelo título, descreve pelo subtítulo e emite a marcação', async () => {
    const onChange = vi.fn();
    const { user } = renderWithProviders(
      <CheckboxCard
        checked={false}
        onChange={onChange}
        title="Asmaliv 20mg"
        subtitle="SKU 1020"
        aside={<span>12 drivers</span>}
      />,
    );
    const checkbox = screen.getByRole('checkbox', { name: 'Asmaliv 20mg' });
    expect(checkbox).toHaveAccessibleDescription('SKU 1020');
    expect(checkbox).toHaveClass('accent-apsen-orange', 'size-[15px]');
    const card = checkbox.closest('label');
    expect(card).toHaveClass('bg-apsen-white', 'rounded-[6px]', 'mb-[5px]', 'py-[9px]');
    expect(screen.getByText('12 drivers')).toBeInTheDocument();
    await user.click(screen.getByText('SKU 1020'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('aplica a variante muted e desabilita', () => {
    render(
      <CheckboxCard
        checked
        onChange={vi.fn()}
        title="Driver X"
        subtitle="TV"
        variant="muted"
        disabled
      />,
    );
    const checkbox = screen.getByRole('checkbox', { name: 'Driver X' });
    expect(checkbox).toBeChecked();
    expect(checkbox).toBeDisabled();
    expect(checkbox.closest('label')).toHaveClass('bg-apsen-bg', 'rounded-apsen', 'py-[10px]');
    expect(screen.getByText('TV')).toHaveClass('mt-[2px]');
  });

  it('não descreve sem subtítulo', () => {
    render(<CheckboxCard checked={false} onChange={vi.fn()} title="Só título" />);
    expect(screen.getByRole('checkbox', { name: 'Só título' })).not.toHaveAttribute(
      'aria-describedby',
    );
  });
});
