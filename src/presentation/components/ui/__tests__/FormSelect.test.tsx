import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormSelect } from '../FormSelect';

const OPTIONS = [
  { value: 'a', label: 'Opção A' },
  { value: 'b', label: 'Opção B' },
] as const;

describe('FormSelect', () => {
  it('renderiza o select com as classes do .form-select', () => {
    render(<FormSelect aria-label="Campo" value="a" options={OPTIONS} onChange={vi.fn()} />);
    const select = screen.getByRole('combobox', { name: 'Campo' });
    expect(select).toHaveValue('a');
    expect(select).toHaveClass(
      'w-full',
      'px-[11px]',
      'py-[8px]',
      'text-[13.5px]',
      'rounded-[6px]',
      'border-apsen-border',
      'field-focus',
    );
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual([
      'Opção A',
      'Opção B',
    ]);
  });

  it('aceita largura customizada e emite o valor escolhido', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <FormSelect
        aria-label="Campo"
        value="a"
        options={OPTIONS}
        onChange={onChange}
        className="w-[170px]"
      />,
    );
    const select = screen.getByRole('combobox', { name: 'Campo' });
    expect(select).toHaveClass('w-[170px]');
    expect(select).not.toHaveClass('w-full');
    await user.selectOptions(select, 'b');
    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('ignora valores fora das opções', () => {
    const onChange = vi.fn();
    render(<FormSelect aria-label="Campo" value="a" options={OPTIONS} onChange={onChange} />);
    fireEvent.change(screen.getByRole('combobox', { name: 'Campo' }), {
      target: { value: 'zzz' },
    });
    expect(onChange).not.toHaveBeenCalled();
  });
});
