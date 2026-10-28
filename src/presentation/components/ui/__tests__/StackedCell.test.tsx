import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StackedCell } from '../StackedCell';
import { columnLabel, stackedCellClass, stackedValueClass } from '../stackedTable';

function renderCell(kind?: Parameters<typeof StackedCell>[0]['kind']) {
  render(
    <table>
      <tbody>
        <tr>
          <StackedCell label="Status" {...(kind === undefined ? {} : { kind })}>
            valor
          </StackedCell>
        </tr>
      </tbody>
    </table>,
  );
  return screen.getByRole('cell');
}

describe('StackedCell', () => {
  it('expõe o rótulo para o cartão e empilha como campo por padrão', () => {
    const cell = renderCell();
    expect(cell).toHaveAttribute('data-label', 'Status');
    expect(cell).toHaveClass('max-md:flex');
    expect(cell.firstElementChild).toHaveClass('max-md:text-right');
  });

  it('usa o estilo de título, de ação e de formulário', () => {
    expect(renderCell('title')).toHaveClass('max-md:font-semibold');
    expect(stackedCellClass('actions')).toContain('max-md:border-t');
    expect(stackedCellClass('form')).toContain('max-md:flex-col');
    expect(stackedValueClass('actions')).toBe('');
    expect(stackedValueClass('form')).toContain('max-md:w-full');
    expect(stackedValueClass('title')).toBe('max-md:text-left');
  });

  it('oculta a coluna de baixa prioridade no cartão', () => {
    expect(stackedCellClass('hidden')).toBe('max-md:hidden');
  });

  it('deriva o rótulo do cabeçalho textual ou do rótulo explícito', () => {
    expect(columnLabel('Nome', undefined)).toBe('Nome');
    expect(columnLabel(<span>x</span>, undefined)).toBeUndefined();
    expect(columnLabel(<span>x</span>, 'Tipo')).toBe('Tipo');
  });
});
