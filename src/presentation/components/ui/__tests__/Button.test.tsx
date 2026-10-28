import { renderWithProviders } from '@test/renderWithProviders';
import { loginAs } from '@test/resetStores';
import { screenHref } from '@presentation/navigation/screens';
import type { Route } from 'next';
import { render, screen } from '@testing-library/react';
import { Button, ButtonLink } from '../Button';
import { useSessaoStore } from '../../../stores/sessaoStore';
import { buttonClasses, type ButtonVariant } from '../buttonClasses';

const VARIANT_CASES: readonly (readonly [ButtonVariant, string])[] = [
  ['primary', 'hover:bg-apsen-blue-d'],
  ['outline', 'hover:bg-apsen-blue-bg'],
  ['ghost', 'border-apsen-border'],
  ['danger', 'text-apsen-red'],
  ['success', 'text-apsen-green-fg'],
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
    render(<ButtonLink href="/acesso-negado">Campanhas</ButtonLink>);
    expect(screen.getByRole('link', { name: 'Campanhas' })).toHaveClass('bg-apsen-blue');
  });

  it('aceita rota tipada dinâmica', () => {
    render(<ButtonLink href={screenHref('form', { id: 'cmp-2' }) as Route}>Abrir</ButtonLink>);
    expect(screen.getByRole('link', { name: 'Abrir' })).toHaveAttribute('href', '/drivers/cmp-2');
  });
});

describe('variantes do protótipo', () => {
  it.each([
    ['orange', ['bg-apsen-orange', 'border-apsen-orange', 'text-white']],
    ['red', ['bg-apsen-red', 'border-apsen-red', 'text-white']],
  ] as const)('a variante %s é sólida e sem hover', (variant, expected) => {
    render(<Button variant={variant}>Ação</Button>);
    const button = screen.getByRole('button', { name: 'Ação' });
    expect(button).toHaveClass(...expected);
    expect(button.className).not.toMatch(/hover:/);
  });

  it('aplica o tamanho xs', () => {
    expect(buttonClasses('ghost', 'xs')).toContain('px-[8px] py-[2px] text-[11px]');
  });

  it('aplica borda tracejada no Button e no ButtonLink', () => {
    render(
      <>
        <Button variant="ghost" dashed>
          Adicionar linha
        </Button>
        <ButtonLink href="/" variant="ghost" dashed>
          Novo
        </ButtonLink>
      </>,
    );
    expect(screen.getByRole('button', { name: 'Adicionar linha' })).toHaveClass('border-dashed');
    expect(screen.getByRole('link', { name: 'Novo' })).toHaveClass('border-dashed');
  });

  it('mostra Salvando… desabilitado e ocupado com loading', () => {
    const onClick = vi.fn();
    const { rerender } = render(
      <Button loading onClick={onClick}>
        Salvar
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Salvando…' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    rerender(
      <Button loading loadingLabel="Enviando…">
        Salvar
      </Button>,
    );
    expect(screen.getByRole('button', { name: 'Enviando…' })).toBeDisabled();
    rerender(<Button>Salvar</Button>);
    expect(screen.getByRole('button', { name: 'Salvar' })).not.toHaveAttribute('aria-busy');
  });
});

describe('Button escrita (usuário inativo só visualiza)', () => {
  it('fica desabilitado para usuário inativo e habilitado para ativo', () => {
    useSessaoStore.setState((estado) =>
      estado.sessao === null
        ? estado
        : { sessao: { ...estado.sessao, usuario: { ...estado.sessao.usuario, ativo: false } } },
    );
    const { rerender } = render(<Button escrita>Salvar</Button>);
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeDisabled();
    rerender(<Button>Salvar</Button>);
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeEnabled();
    loginAs('admin');
    rerender(<Button escrita>Salvar</Button>);
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeEnabled();
  });
});
