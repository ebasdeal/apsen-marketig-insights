import { render, screen } from '@testing-library/react';
import { Card, CardTitle } from '../Card';
import { PageHeader } from '../PageHeader';
import { ScreenDesc } from '../ScreenDesc';
import { Section } from '../Section';

describe('Card', () => {
  it('renderiza como div por padrão', () => {
    render(<Card>conteúdo</Card>);
    const card = screen.getByText('conteúdo');
    expect(card.tagName).toBe('DIV');
    expect(card).toHaveClass('surface');
  });

  it('aceita elemento e classe customizados', () => {
    render(
      <ul>
        <Card as="li" className="mt-4">
          item
        </Card>
      </ul>,
    );
    const card = screen.getByRole('listitem');
    expect(card).toHaveTextContent('item');
    expect(card).toHaveClass('surface', 'mt-4');
  });
});

describe('CardTitle', () => {
  it('exibe título com complemento à direita', () => {
    render(<CardTitle small="atualizado agora">Resumo</CardTitle>);
    const small = screen.getByText('atualizado agora');
    expect(small.tagName).toBe('SMALL');
    expect(small).toHaveClass('ml-auto', 'text-[11px]');
    expect(small.parentElement).toHaveClass('text-[13.5px]', 'font-semibold');
  });

  it('exibe só o título sem complemento', () => {
    const { container } = render(<CardTitle>Resumo</CardTitle>);
    expect(screen.getByText('Resumo')).toBeInTheDocument();
    expect(container.querySelector('small')).toBeNull();
  });
});

describe('Section', () => {
  it('rotula a seção pelo título h2 e exibe a ação no cabeçalho', () => {
    render(
      <Section title="Por canal" action={<button type="button">Ver tudo</button>}>
        <p>linhas</p>
      </Section>,
    );
    const heading = screen.getByRole('heading', { level: 2, name: 'Por canal' });
    expect(heading).not.toHaveClass('mb-[12px]');
    expect(heading.parentElement).toHaveClass('mb-[12px]', 'justify-between');
    const region = screen.getByRole('region', { name: 'Por canal' });
    expect(region).toHaveTextContent('linhas');
    expect(region).toHaveClass('surface', 'px-[18px]', 'py-[16px]');
    expect(screen.getByRole('button', { name: 'Ver tudo' })).toBeInTheDocument();
  });

  it('dá margem ao título do painel sem ação', () => {
    render(
      <Section title="Resumo">
        <p>kpis</p>
      </Section>,
    );
    expect(screen.getByRole('region', { name: 'Resumo' })).toHaveTextContent('kpis');
    expect(screen.getByRole('heading', { name: 'Resumo' })).toHaveClass('mb-[12px]', 'uppercase');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('usa o visual de seção de detalhe', () => {
    render(
      <Section title="💰 Orçamento" variant="detail">
        <p>valores</p>
      </Section>,
    );
    const region = screen.getByRole('region', { name: '💰 Orçamento' });
    expect(region).toHaveClass('rounded-[10px]', 'mb-[12px]');
    expect(region).not.toHaveClass('surface');
    expect(screen.getByRole('heading', { name: '💰 Orçamento' })).toHaveClass(
      'text-apsen-orange',
      'border-b-2',
      'border-apsen-orange-soft',
      'mb-[10px]',
    );
  });
});

describe('PageHeader', () => {
  it('exibe título h1, descrição e ações', () => {
    render(
      <PageHeader
        title="Campanhas"
        description="Acompanhe suas campanhas"
        actions={<button type="button">Atualizar</button>}
      />,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Campanhas' })).toHaveClass('page-title');
    expect(screen.getByText('Acompanhe suas campanhas')).toHaveClass('page-sub');
    expect(screen.getByRole('button', { name: 'Atualizar' }).parentElement).toHaveClass(
      'gap-[8px]',
    );
  });

  it('prioriza meta sobre a descrição', () => {
    render(
      <PageHeader
        title="Campanha"
        description="ignorada"
        meta={
          <>
            Canal: <strong>Meta Ads</strong>
          </>
        }
      />,
    );
    expect(screen.getByText('Meta Ads').tagName).toBe('STRONG');
    expect(screen.queryByText('ignorada')).not.toBeInTheDocument();
  });

  it('exibe apenas o título sem opcionais', () => {
    render(<PageHeader title="Dashboard" />);
    expect(screen.getByRole('banner')).toHaveTextContent('Dashboard');
    expect(screen.queryByRole('paragraph')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

describe('ScreenDesc', () => {
  it('exibe ícone decorativo e conteúdo rico', () => {
    render(
      <ScreenDesc icon="📣">
        Abra uma campanha para ver o <em>detalhe</em>.
      </ScreenDesc>,
    );
    const icon = screen.getByText('📣');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('detalhe').tagName).toBe('EM');
    expect(icon.parentElement).toHaveClass('bg-apsen-bg', 'leading-[1.65]', 'text-[12.5px]');
  });
});

describe('CardTitle com etapa', () => {
  it('mostra a pílula azul por padrão e laranja com stepTone', () => {
    const { rerender } = render(<CardTitle step="01">Identificação</CardTitle>);
    expect(screen.getByText('01')).toHaveClass(
      'bg-apsen-blue-bg',
      'text-apsen-blue',
      'rounded-[6px]',
      'px-[10px]',
      'py-[2px]',
      'text-[11px]',
      'font-bold',
    );
    rerender(
      <CardTitle step="02" stepTone="orange">
        Modelo
      </CardTitle>,
    );
    expect(screen.getByText('02')).toHaveClass('bg-apsen-orange-soft', 'text-apsen-orange');
  });
});

describe('Section com tom', () => {
  it('usa laranja no detail e troca com tone', () => {
    const { rerender } = render(
      <Section title="Justificativa" variant="detail">
        x
      </Section>,
    );
    expect(screen.getByRole('heading', { name: 'Justificativa' })).toHaveClass('text-apsen-orange');
    rerender(
      <Section title="Justificativa" variant="detail" tone="muted">
        x
      </Section>,
    );
    const heading = screen.getByRole('heading', { name: 'Justificativa' });
    expect(heading).toHaveClass('text-apsen-muted');
    expect(heading).not.toHaveClass('text-apsen-orange');
    rerender(
      <Section title="Painel" tone="orange">
        x
      </Section>,
    );
    expect(screen.getByRole('heading', { name: 'Painel' })).toHaveClass('text-apsen-orange');
  });
});
