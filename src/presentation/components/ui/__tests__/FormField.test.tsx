import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { FormField } from '../FormField';
import { FormSelect } from '../FormSelect';
import { TextArea, TextInput } from '../TextInput';

const CONTROL = [
  'px-[11px]',
  'py-[8px]',
  'text-[13.5px]',
  'rounded-[6px]',
  'border-apsen-border',
  'field-focus',
];

function AreaHarness({ onChange }: { onChange: (value: string) => void }) {
  const [value, setValue] = useState('');
  return (
    <FormField label="Observações">
      <TextArea
        value={value}
        onChange={(next) => {
          setValue(next);
          onChange(next);
        }}
      />
    </FormField>
  );
}

describe('FormField', () => {
  it('associa o rótulo ao campo obrigatório', () => {
    render(
      <FormField label="Descrição" required>
        <TextInput value="" onChange={vi.fn()} />
      </FormField>,
    );
    const input = screen.getByRole('textbox', { name: 'Descrição' });
    expect(input).toBeRequired();
    expect(input).toHaveAttribute('type', 'text');
    const star = screen.getByText('*');
    expect(star).toHaveAttribute('aria-hidden', 'true');
    expect(star).toHaveClass('text-apsen-red');
    expect(screen.getByText('Descrição')).toHaveClass('uppercase', 'text-[11.5px]');
  });

  it('descreve o campo com a dica e o erro e o marca como inválido', () => {
    render(
      <FormField label="Descrição" hint="Ex: Planejamento Setembro" error="Informe a descrição">
        <TextInput value="" onChange={vi.fn()} />
      </FormField>,
    );
    const input = screen.getByRole('textbox', { name: 'Descrição' });
    expect(input).toHaveAccessibleDescription('Ex: Planejamento Setembro Informe a descrição');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveClass('aria-[invalid=true]:border-apsen-red-b');
    expect(screen.getByText('Ex: Planejamento Setembro')).toHaveClass(
      'text-[11px]',
      'text-apsen-muted-2',
    );
    expect(screen.getByText('Informe a descrição')).toHaveClass('text-apsen-red');
  });

  it('não descreve nem invalida o campo sem dica nem erro', () => {
    render(
      <FormField label="Nome">
        <TextInput value="" onChange={vi.fn()} />
      </FormField>,
    );
    const input = screen.getByRole('textbox', { name: 'Nome' });
    expect(input).not.toHaveAttribute('aria-describedby');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).not.toBeRequired();
    expect(input.parentElement).not.toHaveClass('col-span-full');
  });

  it('ocupa a linha toda com full', () => {
    render(
      <FormField label="Contexto" full>
        <TextInput value="" onChange={vi.fn()} />
      </FormField>,
    );
    expect(screen.getByRole('textbox', { name: 'Contexto' }).parentElement).toHaveClass(
      'col-span-full',
    );
  });

  it('emite o texto digitado no TextArea', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<AreaHarness onChange={onChange} />);
    const area = screen.getByRole('textbox', { name: 'Observações' });
    expect(area).toHaveClass('min-h-[72px]', 'resize-y');
    expect(area).toHaveAttribute('rows', '3');
    await user.type(area, 'ok');
    expect(onChange).toHaveBeenLastCalledWith('ok');
  });

  it('usa o aria-label fora do FormField e aplica leitura', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <>
        <TextInput value="" onChange={onChange} aria-label="Buscar código" type="email" />
        <TextInput
          value="PLP-01"
          onChange={vi.fn()}
          aria-label="Código"
          readOnly
          className="max-w-[220px]"
        />
      </>,
    );
    const free = screen.getByRole('textbox', { name: 'Buscar código' });
    expect(free).toHaveAttribute('type', 'email');
    await user.type(free, 'x');
    expect(onChange).toHaveBeenCalledWith('x');
    const readOnly = screen.getByRole('textbox', { name: 'Código' });
    expect(readOnly).toHaveAttribute('readonly');
    expect(readOnly).toHaveClass(
      'read-only:bg-apsen-bg',
      'read-only:text-apsen-muted',
      'max-w-[220px]',
    );
  });

  it('usa as mesmas classes de controle no TextInput, TextArea e FormSelect', () => {
    render(
      <>
        <TextInput value="" onChange={vi.fn()} aria-label="a" />
        <TextArea value="" onChange={vi.fn()} aria-label="b" rows={5} />
        <FormSelect
          value="x"
          options={[{ value: 'x', label: 'X' }]}
          onChange={vi.fn()}
          aria-label="c"
        />
      </>,
    );
    expect(screen.getByRole('textbox', { name: 'a' })).toHaveClass(...CONTROL);
    expect(screen.getByRole('textbox', { name: 'b' })).toHaveClass(...CONTROL);
    expect(screen.getByRole('textbox', { name: 'b' })).toHaveAttribute('rows', '5');
    expect(screen.getByRole('combobox', { name: 'c' })).toHaveClass(...CONTROL);
  });
});
