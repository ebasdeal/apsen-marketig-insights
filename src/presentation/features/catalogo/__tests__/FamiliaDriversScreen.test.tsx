import { NotFoundError } from '@domain/shared/DomainError';
import { makeFamiliaDriverRow } from '@test/factories/catalogo';
import { navigationState, routerMock } from '@test/nextNavigation';
import { createFakeUseCases, renderWithProviders } from '@test/renderWithProviders';
import { render, screen, waitFor } from '@testing-library/react';
import { Component, type ReactNode } from 'react';
import { FamiliaDriversScreen } from '../FamiliaDriversScreen';
import { DriverLevelPill, FamiliaDriversTable } from '../FamiliaDriversTable';

class Boundary extends Component<{ children: ReactNode }, { erro: string | null }> {
  override state = { erro: null };
  static getDerivedStateFromError(error: Error) {
    return { erro: error.message };
  }
  override render() {
    return this.state.erro === null ? this.props.children : <p>{this.state.erro}</p>;
  }
}

function renderFamilia(execute: () => Promise<unknown>, familia = 'LEVOXIN') {
  const useCases = createFakeUseCases({
    catalogo: { familiaDrivers: { execute: vi.fn(execute) as never } },
  });
  return {
    useCases,
    ...renderWithProviders(
      <Boundary>
        <FamiliaDriversScreen familia={familia} />
      </Boundary>,
      useCases,
    ),
  };
}

const dados = (n: number) => ({
  franquia: 'ASTER',
  familia: 'LEVOXIN',
  drivers: Array.from({ length: n }, (_, i) =>
    makeFamiliaDriverRow({ id: String(i + 1), titulo: i === 0 ? '—' : `Driver ${i + 1}` }),
  ),
});

describe('FamiliaDriversScreen (CA-08, CA-09, RN-08)', () => {
  beforeEach(() => {
    navigationState.pathname = '/drivers/catalogo/LEVOXIN';
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  it('header, ações e tabela', async () => {
    renderFamilia(async () => dados(2));
    expect(
      screen.getByRole('status', { name: 'Carregando drivers da família…' }),
    ).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Drivers — LEVOXIN' })).toBeInTheDocument();
    expect(screen.getByText('ASTER', { selector: 'strong' })).toBeInTheDocument();
    expect(screen.getByText(/2 driver\(s\) cadastrado\(s\)/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '← Voltar ao catálogo' })).toHaveAttribute(
      'href',
      '/drivers/catalogo',
    );
    expect(screen.getByRole('link', { name: '+ Cadastrar novo driver' })).toHaveAttribute(
      'href',
      '/drivers/novo?familia=LEVOXIN',
    );
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('vazio', async () => {
    renderFamilia(async () => dados(0));
    expect(
      await screen.findByText('Nenhum driver cadastrado para esta família'),
    ).toBeInTheDocument();
  });

  it('mais de 10 drivers pagina na URL', async () => {
    navigationState.search = 'page=2';
    const { user } = renderFamilia(async () => dados(12));
    expect(await screen.findByText('Mostrando 11–12 de 12')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Página 1' }));
    expect(routerMock.replace).toHaveBeenCalledWith('/drivers/catalogo/LEVOXIN', { scroll: false });
  });

  it('família inexistente chama notFound; erro tem retry', async () => {
    renderFamilia(async () => {
      throw new NotFoundError('Família', 'X');
    });
    expect(await screen.findByText('NEXT_NOT_FOUND')).toBeInTheDocument();
  });

  it('erro com Tentar novamente', async () => {
    const { useCases, user } = renderFamilia(async () => {
      throw new Error('x');
    });
    await user.click(await screen.findByRole('button', { name: 'Tentar novamente' }));
    await waitFor(() => expect(useCases.catalogo.familiaDrivers.execute).toHaveBeenCalledTimes(2));
  });
});

describe('FamiliaDriversTable (CA-10, RN-09)', () => {
  it('links com ?familia, nível e estrelas', () => {
    render(<FamiliaDriversTable familia="LEVOXIN" rows={[makeFamiliaDriverRow()]} />);
    expect(screen.getByRole('link', { name: 'Visualizar' })).toHaveAttribute(
      'href',
      '/drivers/3?familia=LEVOXIN',
    );
    expect(screen.getByRole('link', { name: 'Editar' })).toHaveAttribute(
      'href',
      '/drivers/3/editar?familia=LEVOXIN',
    );
    expect(screen.getByLabelText('Intensidade 3 de 5')).toHaveTextContent('★★★☆☆');
    render(<DriverLevelPill nivel={{ label: 'Família', tone: 'familia' }} />);
    expect(screen.getByText('Família')).toHaveClass('bg-apsen-purple-soft');
  });
});
