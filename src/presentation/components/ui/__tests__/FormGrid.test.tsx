import { render } from '@testing-library/react';
import { FormGrid } from '../FormGrid';

describe('FormGrid', () => {
  it('usa uma coluna por padrão', () => {
    const { container } = render(<FormGrid>campo</FormGrid>);
    expect(container.firstChild).toHaveClass('grid', 'gap-[13px]', 'mb-[16px]', 'grid-cols-1');
  });

  it('aplica duas colunas com quebra em 1023px', () => {
    const { container } = render(<FormGrid columns={2}>campo</FormGrid>);
    expect(container.firstChild).toHaveClass('grid-cols-2', 'max-[1023px]:grid-cols-1');
  });

  it('aplica três colunas com quebras em 1279px e 1023px e aceita classe extra', () => {
    const { container } = render(
      <FormGrid columns={3} className="mt-[8px]">
        campo
      </FormGrid>,
    );
    expect(container.firstChild).toHaveClass(
      'grid-cols-3',
      'max-[1279px]:grid-cols-2',
      'max-[1023px]:grid-cols-1',
      'mt-[8px]',
    );
  });
});

describe('FormGrid 4 colunas', () => {
  it('aplica quatro colunas com quebras em 1279px e 1023px', () => {
    const { container } = render(<FormGrid columns={4}>campo</FormGrid>);
    expect(container.firstChild).toHaveClass(
      'grid-cols-4',
      'max-[1279px]:grid-cols-2',
      'max-[1023px]:grid-cols-1',
    );
  });
});
