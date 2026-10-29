import type { CampoTipo } from '@domain/drivers/lookups';
import { trocarTipo, type DriverDraft } from '@domain/drivers/draft';
import { CAMPOS_PRECO, makeCamposTipo, makeDraft, makeLookups } from '@test/factories/drivers';
import {
  createFakeUseCases,
  renderWithProviders,
  type FakeUseCasesOverrides,
} from '@test/renderWithProviders';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { useState, type ReactElement } from 'react';
import { CoberturaCard } from '../CoberturaCard';
import { DynamicFieldsCard } from '../DynamicFieldsCard';
import type { CardProps } from '../formTypes';
import { IdentificacaoCard } from '../IdentificacaoCard';

type Render = (props: CardProps) => ReactElement;

function Harness({
  inicial,
  render,
  disabled,
}: {
  inicial: DriverDraft;
  render: Render;
  disabled: boolean;
}) {
  const [draft, setDraft] = useState(inicial);
  return render({
    draft,
    update: (fn) => setDraft(fn),
    errors: {},
    disabled,
    lookups: makeLookups(),
  });
}

function renderCard(
  render: Render,
  inicial: DriverDraft,
  overrides: FakeUseCasesOverrides = {},
  disabled = false,
) {
  return renderWithProviders(
    <Harness inicial={inicial} render={render} disabled={disabled} />,
    createFakeUseCases(overrides),
  );
}

const vazio = makeDraft({
  sku: null,
  inicio: '',
  fim: '',
  tipo: '',
  categoriaId: null,
  parametros: {},
});

describe('IdentificacaoCard (CA-02, CA-03, CA-04)', () => {
  it('mensagens de período, max e limpeza', () => {
    renderCard((p) => <IdentificacaoCard {...p} />, vazio);
    const inicio = screen.getByLabelText(/^Data Início/);
    const fim = screen.getByLabelText(/^Data Fim/);
    expect(fim).not.toHaveAttribute('max');
    fireEvent.change(inicio, { target: { value: '2026-07-01' } });
    expect(fim).toHaveAttribute('max', '2027-07-01');
    expect(fim).toHaveAttribute('min', '2026-07-01');
    fireEvent.change(fim, { target: { value: '2026-06-30' } });
    expect(screen.getByRole('alert')).toHaveTextContent(
      '⚠️ A data fim não pode ser anterior à data início.',
    );
    expect(fim).toHaveAttribute('aria-invalid', 'true');
    fireEvent.change(fim, { target: { value: '2027-07-02' } });
    expect(screen.getByRole('alert')).toHaveTextContent('ultrapassar 1 ano');
    fireEvent.change(fim, { target: { value: '2027-07-01' } });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('SKU escolhido mostra a grade; trocar de modo limpa', async () => {
    const { user } = renderCard((p) => <IdentificacaoCard {...p} />, vazio);
    await user.type(screen.getByRole('combobox', { name: /Produto \/ SKU/ }), 'lev');
    await user.click(
      await screen.findByRole('option', { name: /LEVOXIN 500MG - 7 COMP\. \(2300\)/ }),
    );
    expect(screen.getByText('ASTER')).toBeInTheDocument();
    expect(screen.getByText('SKU / Produto')).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: /Família/ }));
    await user.click(screen.getByRole('radio', { name: /SKU/ }));
    expect(screen.getByRole('combobox', { name: /Produto \/ SKU/ })).toHaveValue('');
    expect(screen.queryByText('SKU / Produto')).not.toBeInTheDocument();
  });

  it('família escolhida no autocomplete mostra a caixa de SKUs', async () => {
    const searchFamilias = vi
      .fn()
      .mockResolvedValue([{ id: 'LEVOXIN', franquia: 'ASTER', skus: [] }]);
    const { user } = renderCard(
      (p) => <IdentificacaoCard {...p} />,
      { ...vazio, modo: 'familia' },
      {
        catalogo: { searchFamilias: { execute: searchFamilias } },
      },
    );
    await user.type(screen.getByRole('combobox', { name: /Família/ }), 'lev');
    await user.click(await screen.findByRole('option', { name: /LEVOXIN/ }));
    expect(
      await screen.findByRole('textbox', { name: 'SKUs identificados pela IA' }),
    ).toHaveAttribute('readonly');
    expect(searchFamilias).toHaveBeenCalledWith('lev');
  });

  it('franquia lista famílias e SKUs; vazio', async () => {
    const { user } = renderCard((p) => <IdentificacaoCard {...p} />, {
      ...vazio,
      modo: 'franquia',
    });
    await user.selectOptions(screen.getByRole('combobox', { name: /Franquia/ }), 'ASTER');
    expect(await screen.findByText('SKUs da franquia — somente leitura')).toBeInTheDocument();
    expect(await screen.findByText('LEVOXIN 500MG - 7 COMP. (2300)')).toBeInTheDocument();
  });

  it('franquia sem SKUs', async () => {
    const { user } = renderCard(
      (p) => <IdentificacaoCard {...p} />,
      { ...vazio, modo: 'franquia' },
      {
        catalogo: {
          franquiaSkus: { execute: vi.fn().mockResolvedValue([{ familia: 'X', skus: [] }]) },
        },
      },
    );
    await user.selectOptions(screen.getByRole('combobox', { name: /Franquia/ }), 'ASTER');
    expect(await screen.findByText('Nenhum SKU encontrado.')).toBeInTheDocument();
  });

  it('view mostra produto em campo travado', () => {
    renderCard((p) => <IdentificacaoCard {...p} />, makeDraft(), {}, true);
    expect(screen.getByDisplayValue('LEVOXIN 500MG - 7 COMP. (2300)')).toBeDisabled();
    expect(screen.getByRole('radio', { name: /SKU/ })).toBeDisabled();
  });
});

const MACRO: CampoTipo = {
  label: 'Tipo específico',
  required: false,
  id: 'd_tipo_macro',
  param: 'tipo_macro',
  type: 'select',
  options: [
    { label: 'Pandemia', group: 'Sanitário' },
    { label: 'Guerra', group: 'Geopolítico' },
  ],
};

describe('DynamicFieldsCard (CA-06, CA-07, CA-08)', () => {
  it('controles por tipo, molécula herdada e marca sem laboratório', async () => {
    const config = makeCamposTipo({ campos: [...makeCamposTipo().campos, MACRO], layout: 'g2' });
    const inicial = trocarTipo({ ...makeDraft(), parametros: {} }, 'concorrente', config.campos);
    const searchMarcas = vi.fn().mockResolvedValue(['Genérico EMS', 'Germed']);
    const { user } = renderCard((p) => <DynamicFieldsCard {...p} config={config} />, inicial, {
      drivers: { searchMarcas: { execute: searchMarcas } },
    });
    expect(screen.getByText('Parâmetros: 🏁 Ação de Concorrente')).toBeInTheDocument();
    const molecula = screen.getByRole('textbox', { name: /Molécula/ });
    expect(molecula).toHaveValue('LEVOXIN');
    expect(molecula).toHaveClass('bg-apsen-teal-soft!');
    expect(molecula).toHaveAttribute(
      'placeholder',
      'LEVOXIN (herdado — edite se o concorrente for diferente)',
    );
    expect(screen.getByText('(do concorrente)')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Sanitário' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /^Tipo$/ })).toHaveValue('Genérico');
    await user.click(screen.getByRole('combobox', { name: /Nome do concorrente/ }));
    expect(await screen.findByText('⚠️ Selecione primeiro o laboratório.')).toBeInTheDocument();
    expect(searchMarcas).not.toHaveBeenCalled();
    await user.type(screen.getByRole('combobox', { name: /Laboratório/ }), 'E');
    await user.click(await screen.findByRole('option', { name: /EMS/ }));
    expect(screen.getByRole('combobox', { name: /Nome do concorrente/ })).toHaveAttribute(
      'placeholder',
      'Digite para buscar a marca de EMS...',
    );
    await user.click(screen.getByRole('combobox', { name: /Nome do concorrente/ }));
    expect(
      await screen.findByText('2 resultado(s) · Fonte: API de Concorrentes (mock)'),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(searchMarcas).toHaveBeenCalledWith({ laboratorio: 'EMS', termo: '' }),
    );
  });

  it('preço calcula a variação; view trava o autocomplete', () => {
    const inicial = trocarTipo(makeDraft(), 'preco', CAMPOS_PRECO.campos);
    renderCard((p) => <DynamicFieldsCard {...p} config={CAMPOS_PRECO} />, inicial);
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Preço anterior' }), {
      target: { value: '40' },
    });
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Preço novo' }), {
      target: { value: '42.6' },
    });
    expect(screen.getByRole('spinbutton', { name: /Variação/ })).toHaveValue(6.5);
    expect(screen.getByRole('spinbutton', { name: /Variação/ })).toHaveAttribute('readonly');
    expect(screen.getByRole('spinbutton', { name: 'Preço novo' })).toHaveAttribute('step', '0.01');
  });

  it('view: autocomplete vira campo travado', () => {
    renderCard(
      (p) => <DynamicFieldsCard {...p} config={makeCamposTipo()} />,
      makeDraft(),
      {},
      true,
    );
    expect(screen.getByDisplayValue('EMS')).toBeDisabled();
  });
});

describe('CoberturaCard (CA-09, RN-12)', () => {
  it('legenda, uplift sugerido e manual, chips', () => {
    renderCard(
      (p) => <CoberturaCard {...p} actions={<button type="button">ok</button>} />,
      makeDraft(),
    );
    expect(screen.getByText('1 — Marginal')).toBeInTheDocument();
    expect(
      screen.getByText('Sugerido pela intensidade (+1% a +3%) — ajuste se necessário.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '💊 Farmácias' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    fireEvent.change(screen.getByRole('slider', { name: 'Intensidade esperada' }), {
      target: { value: '4' },
    });
    expect(screen.getByText('4 — Alto')).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: /Uplift/ })).toHaveValue(22);
    fireEvent.change(screen.getByRole('spinbutton', { name: /Uplift/ }), {
      target: { value: '30' },
    });
    expect(screen.getByText('Valor ajustado manualmente.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Sul' }));
    expect(screen.getByRole('button', { name: 'Sul' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: '🏥 Hospitalar' }));
    fireEvent.change(screen.getByRole('spinbutton', { name: /Verba/ }), {
      target: { value: '100' },
    });
    fireEvent.change(screen.getByRole('textbox', { name: /Observações/ }), {
      target: { value: 'obs' },
    });
    expect(screen.getByRole('textbox', { name: /Observações/ })).toHaveValue('obs');
  });
});
