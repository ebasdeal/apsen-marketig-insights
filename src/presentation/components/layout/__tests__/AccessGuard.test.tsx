import { PERFIS_FIXTURE } from '@test/fixtures/perfis';
import { navigationState } from '@test/nextNavigation';
import { createFakeUseCases, renderWithProviders } from '@test/renderWithProviders';
import { screen } from '@testing-library/react';
import { useEffect } from 'react';
import { loginAs } from '@test/resetStores';
import { AccessGuard } from '../AccessGuard';

const mounted = vi.fn();

function Child() {
  useEffect(() => {
    mounted();
  }, []);
  return <p>conteúdo protegido</p>;
}

function renderGuard(useCases = createFakeUseCases()) {
  return renderWithProviders(
    <AccessGuard>
      <Child />
    </AccessGuard>,
    useCases,
  );
}

const pending = () =>
  createFakeUseCases({ perfis: { list: { execute: () => new Promise(() => undefined) } } });

describe('AccessGuard', () => {
  beforeEach(() => {
    mounted.mockReset();
  });

  it('bloqueia o Visualizador em /admin/ciclos sem montar o conteúdo', async () => {
    loginAs('viewer');
    navigationState.pathname = '/admin/ciclos';
    renderGuard();
    expect(await screen.findByRole('heading', { name: 'Acesso Restrito' })).toBeInTheDocument();
    expect(
      screen.getByText('Seu perfil (Visualizador) não tem acesso a esta funcionalidade.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Área', { selector: 'strong' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '← Voltar ao Dashboard' })).toHaveAttribute(
      'href',
      '/',
    );
    expect(screen.queryByText('conteúdo protegido')).not.toBeInTheDocument();
    expect(mounted).not.toHaveBeenCalled();
  });

  it('libera o Admin', async () => {
    navigationState.pathname = '/admin/ciclos';
    renderGuard();
    expect(await screen.findByText('conteúdo protegido')).toBeInTheDocument();
    expect(mounted).toHaveBeenCalledTimes(1);
  });

  it.each(['/planos', '/', '/acesso-negado', '/nada'])(
    '%s renderiza o conteúdo sem esperar os perfis',
    (pathname) => {
      navigationState.pathname = pathname;
      renderGuard(pending());
      expect(screen.getByText('conteúdo protegido')).toBeInTheDocument();
    },
  );

  it('nível 2 com perfis pendentes mostra carregando', () => {
    navigationState.pathname = '/drivers';
    renderGuard(pending());
    expect(screen.getByText('Carregando…').closest('[role="status"]')).not.toBeNull();
    expect(mounted).not.toHaveBeenCalled();
  });

  it('erro ao carregar perfis mostra ErrorState e tenta de novo', async () => {
    navigationState.pathname = '/drivers';
    const execute = vi.fn().mockRejectedValue(new Error('fora'));
    const { user } = renderGuard(createFakeUseCases({ perfis: { list: { execute } } }));
    expect(
      await screen.findByRole('heading', { name: 'Não foi possível carregar os perfis de acesso' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Verifique se a API local está no ar e tente novamente.'),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(execute).toHaveBeenCalledTimes(2);
  });

  it('perfil ausente na lista mostra o mesmo erro', async () => {
    navigationState.pathname = '/drivers';
    const execute = vi.fn().mockResolvedValue(PERFIS_FIXTURE.slice(1));
    renderGuard(createFakeUseCases({ perfis: { list: { execute } } }));
    expect(
      await screen.findByRole('heading', { name: 'Não foi possível carregar os perfis de acesso' }),
    ).toBeInTheDocument();
    expect(mounted).not.toHaveBeenCalled();
  });
});
