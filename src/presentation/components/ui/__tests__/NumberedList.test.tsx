import { render, screen, within } from '@testing-library/react';
import { NumberedList } from '../NumberedList';

describe('NumberedList', () => {
  it('numera os itens em laranja com o número oculto', () => {
    render(
      <NumberedList
        aria-label="Justificativas"
        items={['Sazonalidade', <strong key="b">Preço</strong>, 'Concorrência']}
      />,
    );
    const list = screen.getByRole('list', { name: 'Justificativas' });
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveClass('border-b', 'border-apsen-bg', 'py-[7px]', 'text-[13px]');
    const number = within(items[0] as HTMLElement).getByText('1.');
    expect(number).toHaveAttribute('aria-hidden', 'true');
    expect(number).toHaveClass('mr-[6px]', 'font-bold', 'text-apsen-orange');
    expect(within(items[1] as HTMLElement).getByText('Preço').tagName).toBe('STRONG');
  });
});
