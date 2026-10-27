import { render, screen } from '@testing-library/react';
import { AccessDenied, DENIED_FALLBACK_MESSAGE } from '../AccessDenied';

describe('AccessDenied', () => {
  it.each([
    [
      1,
      'Solicite acesso de Área para registrar drivers e análises, ou Planejador para acesso operacional completo.',
      ['Área', 'Planejador'],
    ],
    [
      2,
      'Solicite acesso de Planejador para acessar ciclos, restrições, aprovações e exportações.',
      ['Planejador'],
    ],
    [3, 'Solicite acesso de Admin para gerenciar agentes de IA e controle de acesso.', ['Admin']],
  ] as const)('nível %i mostra o texto de upgrade', (nivel, texto, fortes) => {
    render(<AccessDenied perfil={{ label: 'X', nivel }} />);
    const detail = screen.getByTestId('denied-detail');
    expect(detail).toHaveTextContent(texto);
    expect(detail).toHaveClass('mt-[8px]', 'text-[12.5px]', 'leading-[1.6]');
    expect(Array.from(detail.querySelectorAll('strong'), (el) => el.textContent)).toEqual(fortes);
  });

  it('nível 4 não renderiza o bloco de detalhe', () => {
    render(<AccessDenied perfil={{ label: 'Admin', nivel: 4 }} />);
    expect(
      screen.getByText('Seu perfil (Admin) não tem acesso a esta funcionalidade.'),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('denied-detail')).not.toBeInTheDocument();
  });

  it('tem h1, cadeado e botão outline para o Dashboard', () => {
    render(<AccessDenied />);
    const heading = screen.getByRole('heading', { level: 1, name: 'Acesso Restrito' });
    expect(heading).toHaveClass('text-[16px]', 'font-semibold', 'text-apsen-slate');
    expect(screen.getByRole('region', { name: 'Acesso Restrito' })).toHaveClass('h-[60vh]');
    expect(screen.getByText('🔒')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText(DENIED_FALLBACK_MESSAGE)).toBeInTheDocument();
    expect(screen.queryByTestId('denied-detail')).not.toBeInTheDocument();
    const link = screen.getByRole('link', { name: '← Voltar ao Dashboard' });
    expect(link).toHaveAttribute('href', '/');
    expect(link).toHaveClass('border-apsen-blue', 'mt-[16px]');
  });
});
