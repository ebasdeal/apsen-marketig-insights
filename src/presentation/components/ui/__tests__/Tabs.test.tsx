import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { Tabs, type TabItem } from '../Tabs';

type Status = 'ativas' | 'resolvidas' | 'todas';

const ITEMS: readonly TabItem<Status>[] = [
  { value: 'ativas', label: 'Ativas', count: 8 },
  { value: 'resolvidas', label: 'Resolvidas', count: 0 },
  { value: 'todas', label: 'Todas' },
];

function Harness({ onChange }: { onChange: (value: Status) => void }) {
  const [value, setValue] = useState<Status>('ativas');
  return (
    <Tabs
      id="restricoes"
      aria-label="Situação das restrições"
      items={ITEMS}
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange(next);
      }}
      tone="red"
    >
      <p>Conteúdo de {value}</p>
    </Tabs>
  );
}

describe('Tabs', () => {
  it('segue o padrão WAI-ARIA de abas com contador e tom', () => {
    render(<Harness onChange={vi.fn()} />);
    expect(screen.getByRole('tablist', { name: 'Situação das restrições' })).toBeInTheDocument();
    const active = screen.getByRole('tab', { name: 'Ativas 8' });
    const other = screen.getByRole('tab', { name: 'Resolvidas 0' });
    expect(active).toHaveAttribute('aria-selected', 'true');
    expect(active).toHaveAttribute('tabindex', '0');
    expect(active).toHaveClass('border-apsen-red', 'text-apsen-red');
    expect(other).toHaveAttribute('aria-selected', 'false');
    expect(other).toHaveAttribute('tabindex', '-1');
    expect(other).toHaveClass('border-transparent', 'text-apsen-muted');
    expect(screen.getByText('8')).toHaveClass('bg-apsen-red', 'text-white');
    expect(screen.getByText('0')).toHaveClass('bg-apsen-border');
    expect(screen.getByRole('tab', { name: 'Todas' })).toBeInTheDocument();
    const panel = screen.getByRole('tabpanel', { name: 'Ativas 8' });
    expect(active).toHaveAttribute('aria-controls', panel.id);
    expect(panel).toHaveTextContent('Conteúdo de ativas');
  });

  it('troca e foca a aba com setas, Home, End e clique', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Harness onChange={onChange} />);
    screen.getByRole('tab', { name: 'Ativas 8' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenLastCalledWith('resolvidas');
    expect(screen.getByRole('tab', { name: 'Resolvidas 0' })).toHaveFocus();
    await user.keyboard('{End}');
    expect(screen.getByRole('tab', { name: 'Todas' })).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Ativas 8' })).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(onChange).toHaveBeenLastCalledWith('todas');
    await user.keyboard('{Home}');
    expect(onChange).toHaveBeenLastCalledWith('ativas');
    const calls = onChange.mock.calls.length;
    await user.keyboard('a');
    expect(onChange).toHaveBeenCalledTimes(calls);
    await user.click(screen.getByRole('tab', { name: 'Resolvidas 0' }));
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Conteúdo de resolvidas');
  });

  it('não troca a aba sem o pai mudar o valor e usa azul por padrão', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Tabs id="t" aria-label="Abas" items={ITEMS} value="ativas" onChange={onChange}>
        <p>Painel</p>
      </Tabs>,
    );
    await user.click(screen.getByRole('tab', { name: 'Todas' }));
    expect(onChange).toHaveBeenCalledWith('todas');
    expect(screen.getByRole('tab', { name: 'Ativas 8' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Ativas 8' })).toHaveClass(
      'border-apsen-blue',
      'text-apsen-blue',
    );
    expect(screen.getByText('8')).toHaveClass('bg-apsen-blue');
  });
});

describe('Tabs com tom por item', () => {
  const TONED: readonly TabItem<Status>[] = [
    { value: 'ativas', label: 'Ativas', count: 3, tone: 'red', countTone: 'red' },
    { value: 'resolvidas', label: 'Resolvidas', count: 2, tone: 'blue', countTone: 'gray' },
  ];

  it('usa o tom do item e o contador fixo', () => {
    render(
      <Tabs id="r" aria-label="Situação" items={TONED} value="resolvidas" onChange={vi.fn()}>
        x
      </Tabs>,
    );
    const resolved = screen.getByRole('tab', { name: 'Resolvidas 2' });
    expect(resolved).toHaveClass('border-apsen-blue', 'text-apsen-blue');
    expect(resolved.querySelector('span')).toHaveClass('bg-apsen-border', 'text-apsen-muted');
    const active = screen.getByRole('tab', { name: 'Ativas 3' });
    expect(active.querySelector('span')).toHaveClass('bg-apsen-red', 'text-white');
  });

  it('usa o tom do item ativo vermelho', () => {
    render(
      <Tabs id="r" aria-label="Situação" items={TONED} value="ativas" onChange={vi.fn()}>
        x
      </Tabs>,
    );
    expect(screen.getByRole('tab', { name: 'Ativas 3' })).toHaveClass('border-apsen-red');
  });
});
