import { renderWithProviders } from '@test/renderWithProviders';
import { campaignDetailsRoute } from '@presentation/navigation/routes';
import { render, screen } from '@testing-library/react';
import { ActionGroup, IconButton, IconLink } from '../IconButton';
import { ChevronRightIcon, EyeIcon } from '../icons';

describe('IconButton', () => {
  it('exige nome acessível e dispara o clique', async () => {
    const onClick = vi.fn();
    const { user } = renderWithProviders(
      <IconButton aria-label="Ver" onClick={onClick}>
        <EyeIcon />
      </IconButton>,
    );
    const button = screen.getByRole('button', { name: 'Ver' });
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveClass('size-[28px]');
    await user.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('aceita classe extra e type explícito', () => {
    render(<IconButton aria-label="Excluir" type="submit" className="text-apsen-red" />);
    const button = screen.getByRole('button', { name: 'Excluir' });
    expect(button).toHaveClass('text-apsen-red');
    expect(button).toHaveAttribute('type', 'submit');
  });
});

describe('IconLink', () => {
  it('renderiza link com visual de action-btn dentro do grupo', () => {
    render(
      <ActionGroup>
        <IconLink href="/campaigns" aria-label="Abrir campanha X" className="extra">
          <EyeIcon className="size-[14px]" />
        </IconLink>
        <IconLink href="/" aria-label="Início">
          <ChevronRightIcon />
        </IconLink>
      </ActionGroup>,
    );
    const link = screen.getByRole('link', { name: 'Abrir campanha X' });
    expect(link).toHaveAttribute('href', '/campaigns');
    expect(link).toHaveClass('rounded-[5px]', 'extra');
    expect(link.parentElement).toHaveClass('gap-[2px]');
    expect(link.querySelector('svg')).toHaveClass('size-[14px]');
    expect(screen.getByRole('link', { name: 'Início' }).querySelector('svg')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });

  it('aceita rota tipada dinâmica', () => {
    render(
      <IconLink href={campaignDetailsRoute('cmp-9')} aria-label="Abrir campanha 9">
        <EyeIcon />
      </IconLink>,
    );
    expect(screen.getByRole('link', { name: 'Abrir campanha 9' })).toHaveAttribute(
      'href',
      '/campaigns/cmp-9',
    );
  });

  it('renderiza o chevron com classe customizada', () => {
    const { container } = render(<ChevronRightIcon className="size-[12px] opacity-40" />);
    expect(container.querySelector('polyline')).toHaveAttribute('points', '9 18 15 12 9 6');
    expect(container.querySelector('svg')).toHaveClass('opacity-40');
  });
});
