import { renderWithProviders } from '@test/renderWithProviders';
import { screen } from '@testing-library/react';
import { ChipMultiSelect, toggleChip } from '../ChipMultiSelect';
import { Tooltip } from '../Tooltip';

type Canal = 'farmacias' | 'hospitalar' | 'distribuidores';

const OPTIONS = [
  { value: 'farmacias', label: 'Farmácias' },
  { value: 'hospitalar', label: 'Hospitalar' },
  { value: 'distribuidores', label: 'Distribuidores' },
] as const;

describe('ChipMultiSelect', () => {
  it('marca os chips selecionados e emite na ordem das opções', async () => {
    const onChange = vi.fn();
    const { user, rerender } = renderWithProviders(
      <ChipMultiSelect<Canal>
        label="Canais"
        options={OPTIONS}
        selected={['farmacias']}
        onChange={onChange}
        tip={<Tooltip label="Ajuda sobre canais">Canais</Tooltip>}
      />,
    );
    expect(screen.getByRole('group', { name: 'Canais' })).toHaveClass('mt-[4px]', 'flex-wrap');
    const farmacias = screen.getByRole('button', { name: 'Farmácias' });
    expect(farmacias).toHaveAttribute('aria-pressed', 'true');
    expect(farmacias).toHaveClass('bg-apsen-blue-bg', 'border-apsen-blue');
    expect(screen.getByRole('button', { name: 'Ajuda sobre canais' })).toBeInTheDocument();
    const hospitalar = screen.getByRole('button', { name: 'Hospitalar' });
    expect(hospitalar).toHaveAttribute('aria-pressed', 'false');
    await user.click(hospitalar);
    expect(onChange).toHaveBeenLastCalledWith(['farmacias', 'hospitalar']);
    rerender(
      <ChipMultiSelect<Canal>
        label="Canais"
        options={OPTIONS}
        selected={['hospitalar', 'farmacias']}
        onChange={onChange}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Hospitalar' }));
    expect(onChange).toHaveBeenLastCalledWith(['farmacias']);
  });

  it('não emite quando desabilitado e esconde o rótulo com hideLabel', async () => {
    const onChange = vi.fn();
    const { user } = renderWithProviders(
      <ChipMultiSelect<Canal>
        label="Canais"
        options={OPTIONS}
        selected={[]}
        onChange={onChange}
        disabled
        hideLabel
      />,
    );
    const chip = screen.getByRole('button', { name: 'Distribuidores' });
    expect(chip).toBeDisabled();
    expect(chip).toHaveClass('disabled:cursor-default');
    expect(chip).not.toHaveClass('hover:border-apsen-blue');
    await user.click(chip);
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByText('Canais').parentElement).toHaveClass('sr-only');
  });

  it('não duplica valores', () => {
    expect(toggleChip(OPTIONS, ['farmacias', 'farmacias'], 'hospitalar')).toEqual([
      'farmacias',
      'hospitalar',
    ]);
  });
});
