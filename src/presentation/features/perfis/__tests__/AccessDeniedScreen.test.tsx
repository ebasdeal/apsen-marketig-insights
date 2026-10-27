import { createFakeUseCases, renderWithProviders } from '@test/renderWithProviders';
import { screen } from '@testing-library/react';
import { loginAs } from '@test/resetStores';
import { AccessDeniedScreen } from '../AccessDeniedScreen';

describe('AccessDeniedScreen', () => {
  it('mostra a mensagem do perfil atual com o texto de upgrade', async () => {
    loginAs('planejador');
    renderWithProviders(<AccessDeniedScreen />);
    expect(
      await screen.findByText('Seu perfil (Planejador) não tem acesso a esta funcionalidade.'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('denied-detail')).toHaveTextContent(
      'Solicite acesso de Admin para gerenciar agentes de IA e controle de acesso.',
    );
  });

  it('sem perfil carregado mostra o texto inicial', () => {
    const useCases = createFakeUseCases({
      perfis: { list: { execute: () => new Promise(() => undefined) } },
    });
    renderWithProviders(<AccessDeniedScreen />, useCases);
    expect(
      screen.getByText(
        'Você não tem permissão para acessar esta funcionalidade com o perfil atual.',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('denied-detail')).not.toBeInTheDocument();
  });
});
