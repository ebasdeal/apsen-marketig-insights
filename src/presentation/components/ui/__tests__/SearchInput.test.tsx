import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { SearchInput } from '../SearchInput';

function Harness({ onChange }: { onChange: (value: string) => void }) {
  const [value, setValue] = useState('');
  return (
    <SearchInput
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange(next);
      }}
      placeholder="Buscar..."
      aria-label="Buscar"
    />
  );
}

describe('SearchInput', () => {
  it('renderiza o campo com ícone e as medidas do .search-input', () => {
    const { container } = render(
      <SearchInput value="" onChange={vi.fn()} placeholder="Buscar..." aria-label="Buscar" />,
    );
    const input = screen.getByRole('textbox', { name: 'Buscar' });
    expect(input).toHaveAttribute('placeholder', 'Buscar...');
    expect(input).toHaveClass(
      'pl-[30px]',
      'py-[7px]',
      'text-[13px]',
      'rounded-[6px]',
      'field-focus',
    );
    expect(container.firstChild).toHaveClass(
      'relative',
      'max-w-[360px]',
      'flex-1',
      'min-w-[260px]',
    );
    expect(container.querySelector('svg')).toHaveClass('size-[14px]', 'text-apsen-muted-2');
  });

  it('aceita largura mínima customizada', () => {
    const { container } = render(
      <SearchInput
        value=""
        onChange={vi.fn()}
        placeholder="x"
        aria-label="Buscar"
        className="min-w-[220px]"
      />,
    );
    expect(container.firstChild).toHaveClass('min-w-[220px]');
    expect(container.firstChild).not.toHaveClass('min-w-[260px]');
  });

  it('emite o texto digitado', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Harness onChange={onChange} />);
    await user.type(screen.getByRole('textbox', { name: 'Buscar' }), 'ab');
    expect(onChange).toHaveBeenLastCalledWith('ab');
  });
});
