import { renderWithProviders } from '@test/renderWithProviders';
import { campaignDetailsRoute } from '@presentation/navigation/routes';
import { render, screen } from '@testing-library/react';
import { Button, ButtonLink } from '../Button';
import { buttonClasses, type ButtonVariant } from '../buttonClasses';

const VARIANT_CASES: readonly (readonly [ButtonVariant, string])[] = [
  ['primary', 'hover:bg-apsen-blue-d'],
  ['outline', 'hover:bg-apsen-blue-bg'],
  ['ghost', 'border-apsen-border'],
  ['danger', 'text-apsen-red'],
  ['success', 'text-apsen-green'],
  ['teal', 'hover:bg-apsen-teal-hover'],
  ['purple', 'hover:bg-apsen-purple-hover'],
  ['outline-teal', 'hover:bg-apsen-teal-bg'],
];

describe('buttonClasses', () => {
  it('usa primary md por padrão', () => {
    const classes = buttonClasses();
    expect(classes).toContain('rounded-apsen-pill');
    expect(classes).toContain('px-[20px] py-[9px] text-[13px]');
    expect(classes).toContain('bg-apsen-blue text-white');
  });

  it.each(VARIANT_CASES)('aplica a variante %s', (variant, expected) => {
    const classes = buttonClasses(variant, 'sm', 'extra');
    expect(classes).toContain(expected);
    expect(classes).toContain('px-[12px] py-[5px] text-[12px]');
    expect(classes.endsWith('extra')).toBe(true);
  });

  it.each(VARIANT_CASES)(
    'a variante %s não anula a cor da borda com border-transparent',
    (variant) => {
      expect(buttonClasses(variant)).not.toContain('border-transparent');
    },
  );
});

describe('Button', () => {
  it('renderiza botão do tipo button e dispara o clique', async () => {
    const onClick = vi.fn();
    const { user } = renderWithProviders(
      <Button variant="ghost" size="sm" onClick={onClick} className="mt-[16px]">
        Atualizar
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Atualizar' });
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveClass('mt-[16px]', 'text-apsen-muted');
    await user.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('aceita type submit e estado desabilitado', () => {
    render(
      <Button type="submit" disabled>
        Enviar
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Enviar' });
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('bg-apsen-blue', 'disabled:opacity-[.35]');
  });
});

describe('ButtonLink', () => {
  it('renderiza link com visual de botão', () => {
    render(
      <ButtonLink href="/" variant="outline" aria-label="Ir ao início" className="w-fit">
        ← Voltar ao Dashboard
      </ButtonLink>,
    );
    const link = screen.getByRole('link', { name: 'Ir ao início' });
    expect(link).toHaveAttribute('href', '/');
    expect(link).toHaveClass('text-apsen-blue', 'w-fit', 'px-[20px]');
  });

  it('usa primary md por padrão', () => {
    render(<ButtonLink href="/campaigns">Campanhas</ButtonLink>);
    expect(screen.getByRole('link', { name: 'Campanhas' })).toHaveClass('bg-apsen-blue');
  });

  it('aceita rota tipada dinâmica', () => {
    render(<ButtonLink href={campaignDetailsRoute('cmp-2')}>Abrir</ButtonLink>);
    expect(screen.getByRole('link', { name: 'Abrir' })).toHaveAttribute('href', '/campaigns/cmp-2');
  });
});
