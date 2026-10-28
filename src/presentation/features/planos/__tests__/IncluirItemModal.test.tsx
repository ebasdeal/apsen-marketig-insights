import { createFakePlanosUseCases } from '@test/fakes/planos';
import { createFakeUseCases, renderWithProviders } from '@test/renderWithProviders';
import { screen, within } from '@testing-library/react';
import IncluirItemModal from '../components/IncluirItemModal';

const BARI = 'Baricitinibe 2mg — Blister 28cp · SKU-00312';
const APIX = 'Apixabana 5mg — Blister 60cp · SKU-00058';
const SKUS = [
  { value: 'SKU-00312', label: BARI },
  { value: 'SKU-00058', label: APIX },
];

function setup(planos = {}) {
  const useCases = createFakeUseCases({
    planos: createFakePlanosUseCases({
      skusInclusao: { execute: vi.fn().mockResolvedValue(SKUS) },
      ...planos,
    }),
  });
  const onClose = vi.fn();
  const view = renderWithProviders(<IncluirItemModal onClose={onClose} />, useCases);
  const dialog = () => screen.getAllByRole('dialog')[0] as HTMLElement;
  return { ...view, useCases, onClose, dialog };
}

describe('IncluirItemModal', () => {
  it('CA-07 / RN-04: valida SKU e quantidade com toast, erro e foco; padrões do protótipo', async () => {
    const { user, dialog, useCases } = setup();
    const corpo = within(dialog());
    const sku = await corpo.findByRole('combobox', { name: 'Produto / SKU' });
    await screen.findByRole('option', { name: BARI });
    expect(corpo.getByRole('combobox', { name: 'Linha' })).toHaveValue('Linha 1');
    expect(corpo.getByRole('combobox', { name: 'Semana de Produção' })).toHaveValue(
      'S27 (30/06–06/07)',
    );
    expect(corpo.getByRole('combobox', { name: 'Responsável' })).toHaveValue('Ana Planejadora');
    await user.click(corpo.getByRole('button', { name: 'Incluir Item' }));
    expect(sku).toHaveFocus();
    expect(screen.getAllByText('Selecione o SKU.').length).toBeGreaterThanOrEqual(2);
    await user.selectOptions(sku, 'SKU-00058');
    await user.click(corpo.getByRole('button', { name: 'Incluir Item' }));
    expect(corpo.getByRole('spinbutton', { name: 'Qtd. Planejada (cp)' })).toHaveFocus();
    expect(screen.getAllByText('Informe a quantidade.').length).toBeGreaterThanOrEqual(2);
    expect(useCases.planos.incluir.execute).not.toHaveBeenCalled();
  });

  it('CA-07: preenchido inclui, fecha e mostra o toast com o código', async () => {
    const { user, dialog, useCases, onClose } = setup();
    const corpo = within(dialog());
    await screen.findByRole('option', { name: APIX });
    await user.selectOptions(corpo.getByRole('combobox', { name: 'Produto / SKU' }), 'SKU-00058');
    await user.type(corpo.getByRole('spinbutton', { name: 'Qtd. Planejada (cp)' }), '50000');
    await user.type(corpo.getByRole('textbox', { name: 'Justificativa' }), 'Previsão');
    await user.selectOptions(corpo.getByRole('combobox', { name: 'Linha' }), 'Linha 2');
    await user.selectOptions(
      corpo.getByRole('combobox', { name: 'Semana de Produção' }),
      'S28 (07–13/07)',
    );
    await user.selectOptions(corpo.getByRole('combobox', { name: 'Responsável' }), 'Carlos Lima');
    await user.click(corpo.getByRole('button', { name: 'Incluir Item' }));
    expect(useCases.planos.incluir.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        sku: 'SKU-00058',
        qtd: '50000',
        obs: 'Previsão',
        linha: 'Linha 2',
        semana: 'S28 (07–13/07)',
        resp: 'Carlos Lima',
      }),
    );
    expect(onClose).toHaveBeenCalled();
    expect(await screen.findByText('Item PLP-2026-07-248 incluído no plano.')).toBeInTheDocument();
  });

  it('CA-11: "Salvando…" durante o envio e confirmação ao fechar sujo', async () => {
    const { user, dialog, onClose } = setup({
      incluir: { execute: vi.fn(() => new Promise(() => undefined)) },
    });
    const corpo = within(dialog());
    await screen.findByRole('option', { name: BARI });
    await user.click(corpo.getByRole('button', { name: 'Cancelar' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    await user.selectOptions(corpo.getByRole('combobox', { name: 'Produto / SKU' }), 'SKU-00312');
    await user.click(corpo.getByRole('button', { name: 'Fechar' }));
    expect(
      screen.getByText('Há alterações não salvas. Deseja sair mesmo assim?'),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Sair' }));
    expect(onClose).toHaveBeenCalledTimes(2);
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
    await user.type(corpo.getByRole('spinbutton', { name: 'Qtd. Planejada (cp)' }), '10');
    await user.click(corpo.getByRole('button', { name: 'Incluir Item' }));
    expect(corpo.getByRole('button', { name: 'Salvando…' })).toBeDisabled();
    await user.click(corpo.getByRole('button', { name: 'Fechar' }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('SKUs carregando, com erro e "Tentar novamente"; falha ao incluir mostra o toast', async () => {
    const execute = vi.fn().mockRejectedValueOnce(new Error('500')).mockResolvedValue(SKUS);
    const { user, dialog } = setup({
      skusInclusao: { execute },
      incluir: { execute: vi.fn().mockRejectedValue(new Error('500')) },
    });
    expect(within(dialog()).getByRole('combobox', { name: 'Produto / SKU' })).toBeDisabled();
    expect(screen.getByRole('option', { name: 'Carregando SKUs…' })).toBeInTheDocument();
    expect(await screen.findByText('Não foi possível carregar os SKUs.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    await screen.findByRole('option', { name: BARI });
    const corpo = within(dialog());
    await user.selectOptions(corpo.getByRole('combobox', { name: 'Produto / SKU' }), 'SKU-00312');
    await user.type(corpo.getByRole('spinbutton', { name: 'Qtd. Planejada (cp)' }), '10');
    await user.click(corpo.getByRole('button', { name: 'Incluir Item' }));
    expect(
      await screen.findByText('Não foi possível salvar as alterações. Tente novamente.'),
    ).toBeInTheDocument();
  });
});
