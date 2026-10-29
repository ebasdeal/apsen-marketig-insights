import { buildAnaliseDetail } from '@test/fixtures/analises';
import { createFakeUseCases, renderWithProviders } from '@test/renderWithProviders';
import { render, screen } from '@testing-library/react';
import AnaliseLoading from '../[id]/loading';
import AnaliseNotFound from '../[id]/not-found';
import AnalisePage, { metadata as analiseMetadata } from '../[id]/page';
import AnalisesLoading from '../loading';
import NovaAnaliseLoading from '../nova/loading';
import NovaAnalisePage, { metadata as novaMetadata } from '../nova/page';
import AnalisesPage, { metadata } from '../page';
import RelatoriosPage, { metadata as relatoriosMetadata } from '../../relatorios/page';

vi.mock('react-chartjs-2', () => ({ Line: () => <canvas /> }));

describe('rotas de análises e relatórios', () => {
  it('metadata dos títulos', () => {
    expect(metadata.title).toBe('Análises');
    expect(novaMetadata.title).toBe('Nova Análise');
    expect(analiseMetadata.title).toBe('Análise');
    expect(relatoriosMetadata.title).toBe('Relatórios');
  });

  it('lista e nova análise renderizam as telas', async () => {
    const { unmount } = renderWithProviders(<AnalisesPage />);
    expect(await screen.findByRole('heading', { level: 1, name: 'Análises' })).toBeInTheDocument();
    unmount();
    renderWithProviders(<NovaAnalisePage />);
    expect(screen.getByText(/Configure o escopo/)).toBeInTheDocument();
  });

  it('detalhe aguarda params e decodifica o id', async () => {
    const execute = vi.fn().mockResolvedValue(buildAnaliseDetail({ id: 'a b' }));
    const page = await AnalisePage({ params: Promise.resolve({ id: 'a%20b' }) });
    renderWithProviders(page, createFakeUseCases({ analises: { get: { execute } } }));
    expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(execute.mock.calls[0]?.[0]).toBe('a b');
  });

  it('loading, not-found e relatórios', () => {
    const { unmount } = render(
      <>
        <AnalisesLoading />
        <NovaAnaliseLoading />
        <AnaliseLoading />
      </>,
    );
    expect(screen.getByRole('status', { name: 'Carregando análises…' })).toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Carregando nova análise…' })).toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Carregando análise…' })).toBeInTheDocument();
    unmount();
    render(<AnaliseNotFound />);
    expect(screen.getByText('Análise não encontrada')).toBeInTheDocument();
    render(<RelatoriosPage />);
    expect(screen.getByText('Relatórios — A definir')).toBeInTheDocument();
  });
});
