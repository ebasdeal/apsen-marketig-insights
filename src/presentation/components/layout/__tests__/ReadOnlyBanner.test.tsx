import { useSessaoStore } from '@presentation/stores/sessaoStore';
import { SESSOES } from '@test/fixtures/sessao';
import { render, screen } from '@testing-library/react';
import { ReadOnlyBanner, SOMENTE_LEITURA_AVISO } from '../ReadOnlyBanner';

describe('ReadOnlyBanner', () => {
  it('não aparece para usuário ativo', () => {
    render(<ReadOnlyBanner />);
    expect(screen.queryByText(SOMENTE_LEITURA_AVISO)).not.toBeInTheDocument();
  });

  it('avisa o usuário inativo que o acesso é somente para visualização', () => {
    useSessaoStore.setState({
      sessao: { ...SESSOES.viewer, usuario: { ...SESSOES.viewer.usuario, ativo: false } },
      hidratado: true,
    });
    render(<ReadOnlyBanner />);
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Seu usuário está inativo: acesso somente para visualização.',
    );
  });
});
