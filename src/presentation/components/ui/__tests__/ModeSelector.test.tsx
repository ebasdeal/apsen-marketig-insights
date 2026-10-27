import { renderWithProviders } from '@test/renderWithProviders';
import { render, screen, within } from '@testing-library/react';
import { ModeSelector, type ModeOption } from '../ModeSelector';

type Modo = 'franquia' | 'familia' | 'sku';

const OPTIONS: readonly ModeOption<Modo>[] = [
  { value: 'franquia', label: 'Franquia', icon: '🏢', description: 'Linha completa' },
  { value: 'familia', label: 'Família', icon: '📦', description: 'Uma família' },
  { value: 'sku', label: 'SKU', description: 'Um produto' },
];

describe('ModeSelector', () => {
  it('é um radiogroup com o ativo preenchido e opera por clique e setas', async () => {
    const onChange = vi.fn();
    const { user } = renderWithProviders(
      <ModeSelector
        aria-label="Granularidade"
        options={OPTIONS}
        value="franquia"
        onChange={onChange}
      />,
    );
    const group = screen.getByRole('radiogroup', { name: 'Granularidade' });
    const radios = within(group).getAllByRole('radio');
    expect(radios).toHaveLength(3);
    const active = screen.getByRole('radio', { name: /Franquia/ });
    expect(active).toHaveAttribute('aria-checked', 'true');
    expect(active).toHaveAttribute('tabindex', '0');
    expect(active).toHaveClass(
      'bg-apsen-blue',
      'text-white',
      'px-[16px]',
      'py-[12px]',
      'text-[13px]',
    );
    const other = screen.getByRole('radio', { name: /Família/ });
    expect(other).toHaveAttribute('tabindex', '-1');
    expect(other).toHaveClass('border-apsen-border', 'bg-apsen-white', 'text-apsen-muted');
    expect(screen.getByText('Linha completa')).toHaveClass('text-[11px]', 'opacity-[.85]');
    await user.click(other);
    expect(onChange).toHaveBeenLastCalledWith('familia');
    active.focus();
    await user.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenLastCalledWith('familia');
    expect(other).toHaveFocus();
    await user.keyboard('{Enter}');
    await user.keyboard('a');
    expect(onChange).toHaveBeenCalledTimes(3);
  });

  it('aplica o accent laranja e o tamanho md', () => {
    render(
      <ModeSelector
        aria-label="Modo"
        options={OPTIONS}
        value="familia"
        onChange={vi.fn()}
        accent="orange"
        size="md"
      />,
    );
    const active = screen.getByRole('radio', { name: /Família/ });
    expect(active).toHaveClass('bg-apsen-orange', 'border-apsen-orange', 'px-[8px]', 'py-[11px]');
    expect(screen.getByText('Família')).toHaveClass('text-[12px]', 'font-semibold');
    expect(screen.getByText('Uma família')).toHaveClass('text-[10px]');
  });

  it('usa o sm com ícone inline e sem descrição, e não emite desabilitado', async () => {
    const onChange = vi.fn();
    const { user } = renderWithProviders(
      <ModeSelector
        aria-label="Fonte"
        options={OPTIONS}
        value="sku"
        onChange={onChange}
        size="sm"
        disabled
      />,
    );
    const radio = screen.getByRole('radio', { name: 'Franquia' });
    expect(radio).toHaveClass('p-[10px]', 'text-[12.5px]', 'font-semibold');
    expect(screen.queryByText('Linha completa')).toBeNull();
    expect(screen.getByText('🏢', { exact: false })).toHaveAttribute('aria-hidden', 'true');
    await user.click(radio);
    expect(onChange).not.toHaveBeenCalled();
  });
});
