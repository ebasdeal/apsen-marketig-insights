import { render } from '@testing-library/react';
import { CheckIcon, PencilIcon, TrashIcon } from '../rowActionIcons';

describe('rowActionIcons', () => {
  it('renderiza os ícones de ação do protótipo ocultos para leitores de tela', () => {
    const { container } = render(
      <>
        <PencilIcon />
        <TrashIcon />
        <CheckIcon />
      </>,
    );
    const svgs = container.querySelectorAll('svg');
    expect(svgs).toHaveLength(3);
    svgs.forEach((svg) => {
      expect(svg).toHaveAttribute('aria-hidden', 'true');
      expect(svg).toHaveAttribute('width', '14');
    });
    expect(container.querySelector('polyline')).toHaveAttribute('points', '3 6 5 6 21 6');
  });
});
