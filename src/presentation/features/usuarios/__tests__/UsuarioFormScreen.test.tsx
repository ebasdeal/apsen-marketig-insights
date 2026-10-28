import { NotFoundError } from '@domain/shared/DomainError';
import { UsuarioValidationError } from '@domain/usuarios/errors';
import { CatchBoundary } from '@test/CatchBoundary';
import { createFakeUsuariosUseCases } from '@test/fakes/usuarios';
import { USUARIO_FORM_FIXTURE } from '@test/fixtures/usuarios';
import { routerMock } from '@test/nextNavigation';
import { createFakeUseCases, renderWithProviders } from '@test/renderWithProviders';
import { screen, waitFor, within } from '@testing-library/react';
import { UsuarioFormScreen } from '../UsuarioFormScreen';

function setup(id?: string, overrides: Parameters<typeof createFakeUsuariosUseCases>[0] = {}) {
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  const usuarios = createFakeUsuariosUseCases(overrides);
  const result = renderWithProviders(
    <CatchBoundary>
      <UsuarioFormScreen {...(id === undefined ? {} : { id })} />
    </CatchBoundary>,
    createFakeUseCases({ usuarios }),
  );
  return { ...result, usuarios };
}

async function preencher(user: ReturnType<typeof setup>['user']) {
  await user.type(screen.getByRole('textbox', { name: /Nome completo/ }), 'Ana Paula Ferreira');
  await user.type(
    screen.getByRole('textbox', { name: /E-mail corporativo/ }),
    'ana.ferreira@apsen.com.br',
  );
  await user.selectOptions(
    screen.getByRole('combobox', { name: /Área \/ Departamento/ }),
    'Marketing',
  );
  await user.selectOptions(screen.getByRole('combobox', { name: /Perfil de acesso/ }), 'area');
}

describe('UsuarioFormScreen — cadastrar', { timeout: 20000 }, () => {
  afterEach(() => vi.mocked(console.error).mockRestore());

  it('CA-06 RN-06 breadcrumb, hint do perfil e chips só para Área', async () => {
    const { user } = setup();
    expect(screen.getByRole('navigation', { name: 'Trilha da página' })).toHaveTextContent(
      'Cadastrar Usuário',
    );
    expect(screen.getByRole('switch', { name: 'Ativo / Inativo' })).toBeChecked();
    await user.selectOptions(screen.getByRole('combobox', { name: /Perfil de acesso/ }), 'area');
    expect(
      await screen.findByText(/Registra drivers apenas das categorias autorizadas/),
    ).toBeInTheDocument();
    const chips = await screen.findByRole('group', { name: 'Categorias de driver autorizadas' });
    await waitFor(() => expect(within(chips).getAllByRole('button')).toHaveLength(10));
    await user.click(within(chips).getByRole('button', { name: /Mídia/ }));
    expect(within(chips).getByRole('button', { name: /Mídia/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await user.selectOptions(screen.getByRole('combobox', { name: /Perfil de acesso/ }), 'admin');
    expect(screen.queryByRole('group', { name: 'Categorias de driver autorizadas' })).toBeNull();
  });

  it('CA-07 nome vazio: erro no campo, foco e toast; nada é gravado', async () => {
    const { user, usuarios } = setup();
    await user.click(screen.getByRole('button', { name: 'Salvar Usuário' }));
    const nome = screen.getByRole('textbox', { name: /Nome completo/ });
    expect(nome).toHaveAttribute('aria-invalid', 'true');
    await waitFor(() => expect(nome).toHaveFocus());
    expect(screen.getAllByText('⚠️ Informe o nome completo.').length).toBeGreaterThan(0);
    expect(usuarios.save.execute).not.toHaveBeenCalled();
  });

  it('CA-07 válido grava com o autor, mostra o toast e volta à lista', async () => {
    const { user, usuarios } = setup();
    await preencher(user);
    await user.click(screen.getByRole('button', { name: 'Salvar Usuário' }));
    await waitFor(() =>
      expect(usuarios.save.execute).toHaveBeenCalledWith({
        alteradoPor: 'Ana Admin',
        draft: {
          nome: 'Ana Paula Ferreira',
          email: 'ana.ferreira@apsen.com.br',
          area: 'Marketing',
          perfil: 'area',
          categorias: [],
          ativo: true,
        },
      }),
    );
    expect(await screen.findByText('Usuário salvo!')).toBeInTheDocument();
    expect(routerMock.push).toHaveBeenCalledWith('/acesso/usuarios');
  });

  it('e-mail repetido vindo do servidor marca o campo; falha genérica mostra o toast', async () => {
    const save = {
      execute: vi
        .fn()
        .mockRejectedValueOnce(
          new UsuarioValidationError({ email: '⚠️ Já existe um usuário com este e-mail.' }),
        )
        .mockRejectedValueOnce(new Error('500')),
    };
    const { user } = setup(undefined, { save });
    await preencher(user);
    await user.click(screen.getByRole('button', { name: 'Salvar Usuário' }));
    expect(
      (await screen.findAllByText('⚠️ Já existe um usuário com este e-mail.')).length,
    ).toBeGreaterThan(0);
    await user.click(screen.getByRole('button', { name: 'Salvar Usuário' }));
    expect(
      await screen.findByText('Não foi possível salvar as alterações. Tente novamente.'),
    ).toBeInTheDocument();
  });

  it('CA-09 formulário sujo pede "Descartar alterações?" ao cancelar ou voltar', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(routerMock.push).toHaveBeenCalledWith('/acesso/usuarios');
    await user.type(screen.getByRole('textbox', { name: /Nome completo/ }), 'X');
    await user.click(screen.getByRole('link', { name: '← Voltar' }));
    expect(screen.getByRole('dialog', { name: 'Descartar alterações?' })).toBeInTheDocument();
  });
});

describe('UsuarioFormScreen — editar', { timeout: 20000 }, () => {
  afterEach(() => vi.mocked(console.error).mockRestore());

  it('CA-08 pré-preenche, mostra quem alterou e a área extra', async () => {
    const getForm = {
      execute: vi.fn().mockResolvedValue({
        ...USUARIO_FORM_FIXTURE,
        draft: { ...USUARIO_FORM_FIXTURE.draft, area: 'S&OP' },
        areaExtra: 'S&OP',
        alteracao: 'Alterado por Ana Admin em 27/10/2026 14:05',
      }),
    };
    setup('3', { getForm });
    expect(await screen.findByDisplayValue('Fernanda Marketing')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Trilha da página' })).toHaveTextContent(
      'Editar Usuário',
    );
    expect(screen.getByRole('combobox', { name: /Área/ })).toHaveValue('S&OP');
    expect(screen.getByText('Alterado por Ana Admin em 27/10/2026 14:05')).toBeInTheDocument();
    const chips = screen.getByRole('group', { name: 'Categorias de driver autorizadas' });
    await waitFor(() =>
      expect(within(chips).getByRole('button', { name: /Mídia/ })).toHaveAttribute(
        'aria-pressed',
        'true',
      ),
    );
    expect(getForm.execute).toHaveBeenCalledWith('3');
  });

  it('CA-08 inexistente chama notFound; outro erro mostra "Tentar novamente"', async () => {
    setup('99', {
      getForm: { execute: vi.fn().mockRejectedValue(new NotFoundError('Usuário', '99')) },
    });
    expect(await screen.findByText('erro: NEXT_NOT_FOUND')).toBeInTheDocument();
  });

  it('erro genérico ao carregar oferece "Tentar novamente"', async () => {
    setup('3', { getForm: { execute: vi.fn().mockRejectedValue(new Error('rede')) } });
    expect(await screen.findByRole('button', { name: 'Tentar novamente' })).toBeInTheDocument();
  });
});
