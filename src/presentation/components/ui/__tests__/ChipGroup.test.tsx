import { renderWithProviders } from '@test/renderWithProviders';
import { screen, within } from '@testing-library/react';
import { ChipGroup, type ChipOption } from '../ChipGroup';

const CHANNEL_OPTIONS: readonly ChipOption<string | null>[] = [
  { value: null, label: 'Todos' },
  { value: 'meta', label: 'Meta Ads' },
  { value: 'tiktok', label: 'TikTok Ads' },
];

const PERIOD_OPTIONS: readonly ChipOption<string>[] = [
  { value: 'all', label: 'Tudo' },
  { value: '30d', label: '30 dias' },
];

describe('ChipGroup', () => {
  it('renderiza radiogroup acessível com rótulo visível', () => {
    renderWithProviders(
      <ChipGroup label="Canal" options={CHANNEL_OPTIONS} selected={null} onSelect={vi.fn()} />,
    );
    const group = screen.getByRole('radiogroup', { name: 'Canal' });
    expect(within(group).getAllByRole('radio')).toHaveLength(CHANNEL_OPTIONS.length);
    const label = screen.getByText('Canal');
    expect(label).toBeVisible();
    expect(label).toHaveClass('uppercase', 'text-[11.5px]');
    expect(label).not.toHaveClass('sr-only');
  });

  it('marca a opção selecionada e notifica seleção', async () => {
    const onSelect = vi.fn();
    const { user } = renderWithProviders(
      <ChipGroup label="Canal" options={CHANNEL_OPTIONS} selected="meta" onSelect={onSelect} />,
    );
    const active = screen.getByRole('radio', { name: 'Canal: Meta Ads' });
    const inactive = screen.getByRole('radio', { name: 'Canal: Todos' });
    expect(active).toBeChecked();
    expect(active).toHaveClass('bg-apsen-blue-bg', 'font-semibold');
    expect(inactive).not.toBeChecked();
    expect(inactive).toHaveClass('bg-apsen-bg', 'hover:border-apsen-blue');

    await user.click(screen.getByRole('radio', { name: 'Canal: TikTok Ads' }));
    expect(onSelect).toHaveBeenCalledWith('tiktok');

    await user.click(inactive);
    expect(onSelect).toHaveBeenCalledWith(null);
  });

  it('deixa o rótulo só para leitores de tela com hideLabel', () => {
    renderWithProviders(
      <ChipGroup
        label="Período"
        options={PERIOD_OPTIONS}
        selected="all"
        onSelect={vi.fn()}
        hideLabel
      />,
    );
    expect(screen.getByText('Período')).toHaveClass('sr-only');
    expect(screen.getByRole('radiogroup', { name: 'Período' })).toBeInTheDocument();
  });
});
