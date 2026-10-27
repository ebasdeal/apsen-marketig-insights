import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormField } from '../FormField';
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

describe('FormSelect estendido', () => {
  const GROUPS = [
    { label: 'ASTER', options: [{ value: 'asma', label: 'Asma' }] },
    { label: 'NEURO', options: [{ value: 'dor', label: 'Dor' }] },
  ] as const;

  it('mostra placeholder selecionável que emite vazio e agrupa opções', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <FormSelect
        aria-label="Franquia"
        value="asma"
        placeholder="— Selecione a franquia —"
        options={[{ value: 'outra', label: 'Outra' }]}
        groups={GROUPS}
        onChange={onChange}
      />,
    );
    const select = screen.getByRole('combobox', { name: 'Franquia' });
    const first = screen.getAllByRole('option')[0];
    expect(first).toHaveTextContent('— Selecione a franquia —');
    expect(first).toHaveValue('');
    expect(select.querySelector('optgroup[label="ASTER"]')).not.toBeNull();
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual([
      '— Selecione a franquia —',
      'Outra',
      'Asma',
      'Dor',
    ]);
    await user.selectOptions(select, '');
    expect(onChange).toHaveBeenLastCalledWith('');
    await user.selectOptions(select, 'dor');
    expect(onChange).toHaveBeenLastCalledWith('dor');
  });

  it('não emite vazio sem placeholder', () => {
    const onChange = vi.fn();
    render(<FormSelect aria-label="Campo" value="a" options={OPTIONS} onChange={onChange} />);
    fireEvent.change(screen.getByRole('combobox', { name: 'Campo' }), { target: { value: '' } });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('desabilita com fundo de leitura', () => {
    render(
      <FormSelect aria-label="Campo" value="a" options={OPTIONS} onChange={vi.fn()} disabled />,
    );
    const select = screen.getByRole('combobox', { name: 'Campo' });
    expect(select).toBeDisabled();
    expect(select).toHaveClass(
      'disabled:bg-apsen-bg',
      'disabled:text-apsen-muted',
      'disabled:cursor-default',
    );
  });

  it('usa o id, a descrição, o obrigatório e o inválido do FormField', () => {
    render(
      <FormField label="Franquia" required error="Escolha a franquia">
        <FormSelect value="" placeholder="—" options={OPTIONS} onChange={vi.fn()} />
      </FormField>,
    );
    const select = screen.getByRole('combobox', { name: 'Franquia' });
    expect(select).toBeRequired();
    expect(select).toHaveAttribute('aria-invalid', 'true');
    expect(select).toHaveAccessibleDescription('Escolha a franquia');
    expect(select).toHaveClass('px-[11px]', 'py-[8px]', 'field-focus');
  });
});
