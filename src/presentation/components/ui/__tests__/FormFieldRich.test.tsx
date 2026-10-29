import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { FormField } from '../FormField';
import { TextInput } from '../TextInput';
import { Tooltip } from '../Tooltip';

describe('FormField com rótulo rico', () => {
  it('aceita label ReactNode e tip fora do label', () => {
    render(
      <FormField
        label={
          <>
            Data Fim *{' '}
            <small className="text-[11px] font-normal normal-case text-apsen-muted">
              (máx. 1 ano da data início)
            </small>
          </>
        }
        tip={
          <Tooltip label="Ajuda sobre data fim">
            <strong>Limite</strong> de um ano.
            <br />
            <em>Obrigatório</em>
          </Tooltip>
        }
        labelClassName="extra-label"
      >
        <TextInput value="" onChange={vi.fn()} type="text" />
      </FormField>,
    );
    const input = screen.getByRole('textbox', { name: 'Data Fim * (máx. 1 ano da data início)' });
    expect(input).toBeInTheDocument();
    const tipButton = screen.getByRole('button', { name: 'Ajuda sobre data fim' });
    expect(tipButton.closest('label')).toBeNull();
    const label = screen.getByText(/Data Fim/).closest('label');
    expect(label).toHaveClass('extra-label');
    expect(label?.parentElement).toHaveClass('flex', 'items-center');
    expect(screen.getByRole('tooltip', { hidden: true }).querySelector('strong')).toHaveTextContent(
      'Limite',
    );
  });
});

describe('TextInput numérico', () => {
  it('repassa min, max, step, inputMode e ref', () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <TextInput
        ref={ref}
        aria-label="Intensidade"
        type="number"
        min={-3}
        max={6}
        step={0.5}
        inputMode="decimal"
        value="1"
        onChange={vi.fn()}
      />,
    );
    const input = screen.getByRole('spinbutton', { name: 'Intensidade' });
    expect(input).toHaveAttribute('min', '-3');
    expect(input).toHaveAttribute('max', '6');
    expect(input).toHaveAttribute('step', '0.5');
    expect(input).toHaveAttribute('inputmode', 'decimal');
    expect(ref.current).toBe(input);
  });
});
