import { buildListItem } from '@test/factories';
import { render, screen, within } from '@testing-library/react';
import { CampaignTable } from '../CampaignTable';

const EMPTY = 'Nenhuma campanha encontrada com os filtros atuais.';

describe('CampaignTable', () => {
  it('renderiza cabeçalhos com as cores do protótipo e a linha da campanha', () => {
    render(
      <CampaignTable
        emptyText={EMPTY}
        campaigns={[
          buildListItem({
            id: 'CMP-01',
            channel: 'meta',
            status: 'pausada',
            spend: 1000,
            roas: 2.5,
            periodStart: '2026-06-01T00:00:00.000Z',
            periodEnd: '2026-06-30T00:00:00.000Z',
          }),
        ]}
      />,
    );
    const table = screen.getByRole('table', { name: 'Campanhas' });
    const headers = within(table).getAllByRole('columnheader');
    expect(headers.map((header) => header.textContent)).toEqual([
      'Código',
      'Campanha / Período',
      'Canal',
      'Status',
      'Investimento',
      'ROAS',
      'Ações',
    ]);
    expect(headers[0]).toHaveClass('text-apsen-blue', 'text-left', 'text-[11.5px]');
    headers
      .slice(1)
      .forEach((header) => expect(header).toHaveClass('text-apsen-muted', 'text-left'));

    const code = screen.getByRole('link', { name: 'CMP-01' });
    expect(code).toHaveAttribute('href', '/campaigns/CMP-01');
    expect(code).toHaveClass('font-mono', 'text-[12px]', 'font-semibold', 'text-apsen-blue');
    expect(screen.getByText('Campanha Teste')).toHaveClass('text-[13px]', 'font-medium');
    expect(screen.getByText('01/06 → 30/06/2026')).toHaveClass('text-apsen-muted');
    expect(screen.getByText('Meta Ads')).toBeInTheDocument();
    const status = screen.getByText('● Pausada');
    expect(status).toHaveAttribute('data-status', 'pausada');
    expect(status).toHaveClass('text-[12px]', 'font-semibold', 'text-apsen-orange');
    expect(status).not.toHaveClass('rounded-[10px]');
    expect(screen.getByText(/R\$\s?1\.000,00/)).toHaveClass('font-semibold', 'text-[13px]');
    expect(screen.getByText('2,50x')).toBeInTheDocument();
    const open = screen.getByRole('link', { name: 'Abrir campanha Campanha Teste' });
    expect(open).toHaveAttribute('href', '/campaigns/CMP-01');
    expect(open).toHaveClass('size-[28px]', 'rounded-[5px]', 'hover:bg-apsen-blue-bg');
    expect(open.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('colore cada status como texto', () => {
    render(
      <CampaignTable
        emptyText={EMPTY}
        campaigns={[
          buildListItem({ id: 'a', status: 'ativa' }),
          buildListItem({ id: 'e', status: 'encerrada' }),
        ]}
      />,
    );
    expect(screen.getByText('● Ativa')).toHaveClass('text-apsen-green');
    expect(screen.getByText('● Encerrada')).toHaveClass('text-apsen-muted');
  });

  it('mostra traço quando não há ROAS', () => {
    render(<CampaignTable emptyText={EMPTY} campaigns={[buildListItem({ roas: null })]} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('mostra a linha de vazio em colspan quando não há campanhas', () => {
    render(<CampaignTable emptyText={EMPTY} campaigns={[]} />);
    const cell = screen.getByRole('cell', { name: EMPTY });
    expect(cell).toHaveAttribute('colspan', '7');
    expect(cell).toHaveClass('p-[30px]', 'text-center', 'text-apsen-muted');
  });
});
