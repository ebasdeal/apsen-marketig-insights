import { NAV_BADGES_FIXTURE } from '@test/fixtures/navBadges';
import { navigationState } from '@test/nextNavigation';
import { createFakeUseCases, renderWithProviders } from '@test/renderWithProviders';
import { screen, within } from '@testing-library/react';
import { loginAs } from '@test/resetStores';
import { NavProvider } from '../NavContext';
import { NavLinks } from '../NavLinks';
import { NAV_MODULES } from '../navItems';

const HEADERS = [
  'Drivers de Demanda',
  'Administração DI',
  'Controle de Acesso',
  'Agentes de IA',
  'Análises',
  'Restrições & Alertas',
  'Planos de Produção',
  'Relatórios',
];

function renderNav(useCases = createFakeUseCases()) {
  return renderWithProviders(
    <NavProvider>
      <NavLinks />
    </NavProvider>,
    useCases,
  );
}

function headerNames(): string[] {
  return screen
    .getAllByRole('button')
    .map((button) => button.textContent?.replace('▼', '').trim() ?? '');
}

async function waitForModules() {
  await screen.findByRole('button', { name: /Planos de Produção/ });
}

describe('NavLinks', () => {
  it('mostra Dashboard e os 8 módulos na ordem para o Admin, com accent nos 3 primeiros', async () => {
    renderNav();
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/');
    await waitForModules();
    expect(headerNames()).toEqual(HEADERS);
    expect(screen.getByTestId('accent-drivers')).toHaveClass(
      'bg-apsen-blue',
      'h-[22px]',
      'w-[3px]',
    );
    expect(screen.getByTestId('accent-admin')).toHaveClass('bg-apsen-teal');
    expect(screen.getByTestId('accent-acesso')).toHaveClass('bg-apsen-purple');
    expect(screen.queryByTestId('accent-agentes')).not.toBeInTheDocument();
    expect(screen.queryByTestId('accent-planos')).not.toBeInTheDocument();
  });

  it('cada módulo aberto lista os itens com rótulos e rotas', async () => {
    const { user } = renderNav();
    await waitForModules();
    for (const group of NAV_MODULES) {
      const header = screen.getByRole('button', { name: new RegExp(group.label) });
      if (header.getAttribute('aria-expanded') !== 'true') {
        await user.click(header);
      }
      const list = document.getElementById(header.getAttribute('aria-controls') ?? '');
      expect(list).not.toBeNull();
      const links = within(list as HTMLElement).getAllByRole('link');
      expect(links.map((link) => link.getAttribute('href'))).toEqual(
        group.items.map((item) => item.href),
      );
      group.items.forEach((item) => {
        expect(
          within(list as HTMLElement).getByRole('link', { name: new RegExp(item.label) }),
        ).toBeInTheDocument();
      });
    }
  });

  it.each([
    ['viewer', ['Planos de Produção', 'Relatórios']],
    ['area', ['Drivers de Demanda', 'Análises', 'Planos de Produção', 'Relatórios']],
    [
      'planejador',
      [
        'Drivers de Demanda',
        'Administração DI',
        'Análises',
        'Restrições & Alertas',
        'Planos de Produção',
        'Relatórios',
      ],
    ],
    ['admin', HEADERS],
  ] as const)('perfil %s vê exatamente os módulos do setRole', async (perfilId, esperado) => {
    loginAs(perfilId);
    renderNav();
    await screen.findByRole('button', { name: /Relatórios/ });
    expect(headerNames()).toEqual(esperado);
  });

  it('Área não vê Exportar JSON; Planejador vê', async () => {
    loginAs('area');
    const { unmount } = renderNav();
    await screen.findByRole('link', { name: 'Registrar Driver' });
    expect(screen.queryByRole('link', { name: 'Exportar JSON' })).not.toBeInTheDocument();
    unmount();
    loginAs('planejador');
    renderNav();
    expect(await screen.findByRole('link', { name: 'Exportar JSON' })).toBeInTheDocument();
  });

  it('Admin com Controle de Acesso aberto vê Novo Usuário', async () => {
    navigationState.pathname = '/acesso/usuarios';
    renderNav();
    expect(await screen.findByRole('link', { name: 'Novo Usuário' })).toHaveAttribute(
      'href',
      '/acesso/usuarios/novo',
    );
  });

  describe('accordion', () => {
    it('Drivers começa aberto; abrir outro fecha; clicar no aberto fecha todos', async () => {
      const { user } = renderNav();
      await waitForModules();
      const drivers = screen.getByRole('button', { name: /Drivers de Demanda/ });
      const analises = screen.getByRole('button', { name: /Análises/ });
      expect(drivers).toHaveAttribute('aria-expanded', 'true');
      expect(within(drivers).getByText('▼')).toHaveClass('rotate-180');
      await user.click(analises);
      expect(analises).toHaveAttribute('aria-expanded', 'true');
      expect(drivers).toHaveAttribute('aria-expanded', 'false');
      expect(within(drivers).getByText('▼')).not.toHaveClass('rotate-180');
      await user.click(analises);
      expect(screen.queryAllByRole('button', { expanded: true })).toHaveLength(0);
      await user.click(screen.getByRole('button', { name: /Relatórios/ }));
      expect(screen.getAllByRole('button', { expanded: true }).map((b) => b.textContent)).toEqual([
        'Relatórios▼',
      ]);
    });

    it('a tela atual abre o seu módulo', async () => {
      navigationState.pathname = '/admin/ciclos';
      renderNav();
      await waitForModules();
      expect(screen.getByRole('button', { name: /Administração DI/ })).toHaveAttribute(
        'aria-expanded',
        'true',
      );
      expect(screen.getByRole('button', { name: /Drivers de Demanda/ })).toHaveAttribute(
        'aria-expanded',
        'false',
      );
    });

    it('cabeçalho controla a lista por aria-controls', async () => {
      renderNav();
      await waitForModules();
      const header = screen.getByRole('button', { name: /Drivers de Demanda/ });
      expect(document.getElementById(header.getAttribute('aria-controls') ?? '')).toBeVisible();
    });
  });

  describe('item ativo', () => {
    it.each(['/drivers/ABC', '/drivers/ABC/editar', '/drivers/novo'])(
      '%s ativa Registrar Driver',
      async (pathname) => {
        navigationState.pathname = pathname;
        renderNav();
        const item = await screen.findByRole('link', { name: 'Registrar Driver' });
        expect(item).toHaveAttribute('aria-current', 'page');
        expect(item).toHaveClass('border-apsen-blue', 'bg-apsen-blue-bg', 'text-apsen-blue');
        expect(screen.getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute('aria-current');
      },
    );

    it.each(['/drivers/catalogo/X', '/admin/tipos/novo', '/planos/1'])(
      '%s não ativa nenhum item',
      async (pathname) => {
        navigationState.pathname = pathname;
        renderNav();
        await waitForModules();
        expect(
          screen.getAllByRole('link').filter((link) => link.hasAttribute('aria-current')),
        ).toHaveLength(0);
      },
    );

    it('Dashboard usa a pílula azul sólida em /', async () => {
      renderNav();
      const dashboard = screen.getByRole('link', { name: 'Dashboard' });
      expect(dashboard).toHaveAttribute('aria-current', 'page');
      expect(dashboard).toHaveClass('bg-apsen-blue', 'text-white', 'rounded-apsen');
      await waitForModules();
    });

    it('com a guarda bloqueando nenhum item fica ativo', async () => {
      loginAs('viewer');
      navigationState.pathname = '/admin/ciclos';
      renderNav();
      await screen.findByRole('button', { name: /Planos de Produção/ });
      expect(
        screen.getAllByRole('link').filter((link) => link.hasAttribute('aria-current')),
      ).toHaveLength(0);
    });
  });

  describe('badges', () => {
    function badgeOf(label: string): HTMLElement {
      const link = screen.getByRole('link', { name: new RegExp(`^${label}`), hidden: true });
      const badge = link.querySelector('span');
      if (badge === null) {
        throw new Error(`sem badge em ${label}`);
      }
      return badge;
    }

    it('mostra os totais com as cores e "em breve"', async () => {
      renderNav();
      await screen.findByRole('link', { name: /^Meus Registross?4$/ });
      expect(badgeOf('Meus Registros')).toHaveTextContent('4');
      expect(badgeOf('Meus Registros')).toHaveClass('bg-apsen-blue', 'text-[10px]');
      expect(badgeOf('Ciclos de Planejamento')).toHaveTextContent('3');
      expect(badgeOf('Ciclos de Planejamento')).toHaveClass('bg-apsen-orange');
      expect(badgeOf('Catálogo de Tipos')).toHaveTextContent('47');
      expect(badgeOf('Catálogo de Tipos')).toHaveClass('bg-apsen-teal');
      expect(badgeOf('Fila de Aprovação')).toHaveTextContent('2');
      expect(badgeOf('Fila de Aprovação')).toHaveClass('bg-apsen-red');
      expect(badgeOf('Usuários')).toHaveTextContent('4');
      expect(badgeOf('Usuários')).toHaveClass('bg-apsen-purple');
      expect(badgeOf('Agentes Cadastrados')).toHaveTextContent('5');
      expect(badgeOf('Agentes Cadastrados')).toHaveClass('bg-apsen-purple');
      expect(badgeOf('Minhas Análises')).toHaveTextContent('2');
      expect(badgeOf('Minhas Análises')).toHaveClass('bg-apsen-orange');
      expect(badgeOf('Restrições Ativas')).toHaveTextContent('8');
      expect(badgeOf('Restrições Ativas')).toHaveClass('bg-apsen-red');
      expect(badgeOf('PLP Ativo')).toHaveTextContent('247');
      expect(badgeOf('PLP Ativo')).toHaveClass('bg-apsen-blue');
      expect(badgeOf('A definir')).toHaveTextContent('em breve');
      expect(badgeOf('A definir')).toHaveClass('text-[9px]', 'bg-apsen-cyan');
    });

    it('exibe 0 e oculta badge indisponível', async () => {
      const useCases = createFakeUseCases({
        navegacao: {
          badges: {
            execute: vi.fn().mockResolvedValue({ ...NAV_BADGES_FIXTURE, lista: 0, tipos: null }),
          },
        },
      });
      renderNav(useCases);
      await screen.findByRole('link', { name: /^Meus Registross?0$/ });
      expect(badgeOf('Meus Registros')).toHaveClass('bg-apsen-blue');
      expect(
        screen.getByRole('link', { name: 'Catálogo de Tipos', hidden: true }),
      ).toHaveTextContent(/^Catálogo de Tipos$/);
      expect(badgeOf('Fila de Aprovação')).toHaveTextContent('2');
    });

    it('sem contagens carregadas não mostra badges numéricos', async () => {
      const useCases = createFakeUseCases({
        navegacao: { badges: { execute: vi.fn().mockRejectedValue(new Error('fora')) } },
      });
      renderNav(useCases);
      const item = await screen.findByRole('link', { name: 'Meus Registros' });
      expect(item).toHaveTextContent(/^Meus Registros$/);
    });
  });

  it('sem perfil carregado mostra só o Dashboard', async () => {
    const useCases = createFakeUseCases({
      perfis: { list: { execute: vi.fn().mockRejectedValue(new Error('fora')) } },
    });
    renderNav(useCases);
    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });
});
