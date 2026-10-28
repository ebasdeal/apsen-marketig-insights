import { render, screen } from '@testing-library/react';
import { CardSectionLabel } from '../CardSectionLabel';
import { CodeTag } from '../CodeTag';
import { DetailField } from '../DetailField';
import { FilterBar } from '../FilterBar';
import { FormActions } from '../FormActions';
import { Toolbar } from '../Toolbar';

describe('componentes de estrutura', () => {
  it('CardSectionLabel é um h3 azul uppercase', () => {
    render(<CardSectionLabel>Dados pessoais</CardSectionLabel>);
    expect(screen.getByRole('heading', { level: 3, name: 'Dados pessoais' })).toHaveClass(
      'mb-[13px]',
      'border-b-2',
      'border-apsen-blue-bg',
      'pt-[12px]',
      'pb-[8px]',
      'text-[10.5px]',
      'uppercase',
      'tracking-[.08em]',
      'text-apsen-blue',
    );
  });

  it('FormActions alinha à direita com borda superior', () => {
    render(
      <FormActions className="mt-[8px]">
        <button type="button">Salvar</button>
      </FormActions>,
    );
    expect(screen.getByRole('button', { name: 'Salvar' }).parentElement).toHaveClass(
      'flex',
      'justify-end',
      'gap-[8px]',
      'border-t',
      'border-apsen-border',
      'pt-[14px]',
      'mt-[8px]',
    );
  });

  it('Toolbar põe o slot right em ml-auto', () => {
    render(
      <Toolbar right={<button type="button">Exportar</button>}>
        <input aria-label="Buscar" />
      </Toolbar>,
    );
    const toolbar = screen.getByRole('textbox', { name: 'Buscar' }).parentElement;
    expect(toolbar).toHaveClass('mb-[13px]', 'flex', 'flex-wrap', 'items-center', 'gap-[8px]');
    expect(screen.getByRole('button', { name: 'Exportar' }).parentElement).toHaveClass(
      'ml-auto',
      'flex',
      'gap-[6px]',
    );
  });

  it('Toolbar sem right não cria o slot', () => {
    const { container } = render(<Toolbar>itens</Toolbar>);
    expect(container.querySelector('.ml-auto')).toBeNull();
  });

  it('FilterBar é uma busca nomeada em grade responsiva', () => {
    const { rerender } = render(<FilterBar aria-label="Filtros da fila">campos</FilterBar>);
    expect(screen.getByRole('search', { name: 'Filtros da fila' })).toHaveClass(
      'grid',
      'items-end',
      'gap-[10px]',
      'rounded-apsen-lg',
      'px-[16px]',
      'py-[14px]',
      'grid-cols-[1fr_auto_auto_auto_auto]',
      'max-[1023px]:grid-cols-2',
      'max-[560px]:grid-cols-1',
    );
    rerender(
      <FilterBar aria-label="Filtros" columnsClassName="grid-cols-[1fr_auto]">
        campos
      </FilterBar>,
    );
    expect(screen.getByRole('search', { name: 'Filtros' })).toHaveClass('grid-cols-[1fr_auto]');
  });

  it('DetailField mostra rótulo uppercase e ocupa a linha com full', () => {
    const { rerender } = render(<DetailField label="Produto">Asmaliv</DetailField>);
    expect(screen.getByText('Produto')).toHaveClass('uppercase', 'text-[10.5px]', 'font-bold');
    expect(screen.getByText('Asmaliv')).toHaveClass('text-[13px]');
    expect(screen.getByText('Produto').parentElement).not.toHaveClass('col-span-full');
    rerender(
      <DetailField label="Endpoint" full>
        x
      </DetailField>,
    );
    expect(screen.getByText('Endpoint').parentElement).toHaveClass('col-span-full');
  });

  it('CodeTag usa mono com o tom', () => {
    render(
      <>
        <CodeTag>padrao</CodeTag>
        <CodeTag tone="red" className="ml-[4px]">
          dummy_censored
        </CodeTag>
        <CodeTag tone="yellow">lag</CodeTag>
      </>,
    );
    expect(screen.getByText('padrao')).toHaveClass('font-mono', 'bg-apsen-bg', 'text-apsen-slate');
    expect(screen.getByText('dummy_censored')).toHaveClass('text-apsen-red', 'ml-[4px]');
    expect(screen.getByText('lag')).toHaveClass('text-apsen-warning-fg');
  });
});
