import type { MensagemChat } from '@domain/analises/Analise';
import { createFakeUseCases, renderWithProviders } from '@test/renderWithProviders';
import { screen, waitFor } from '@testing-library/react';
import ChatPanel from '../components/ChatPanel';

const PROPS = {
  analiseId: 'ANL-002',
  ciclo: 'PLP-2026-07',
  modelo: 'SARIMAX',
  iniciais: [] as MensagemChat[],
};

function render(extra: Parameters<typeof createFakeUseCases>[0] = {}, iniciais = PROPS.iniciais) {
  const useCases = createFakeUseCases(extra);
  return {
    useCases,
    ...renderWithProviders(<ChatPanel {...PROPS} iniciais={iniciais} />, useCases),
  };
}

describe('ChatPanel', () => {
  it('CA-13: boas-vindas, Enter envia com "⟳ Analisando..." e mostra a resposta', async () => {
    let responder: (texto: string) => void = () => undefined;
    const execute = vi.fn(() => new Promise<string>((resolve) => (responder = resolve)));
    const { user } = render({ analises: { responderChat: { execute } } });
    expect(screen.getByText(/Pronto para ajudar/)).toBeInTheDocument();
    const campo = screen.getByRole('textbox', { name: 'Pergunte à IA' });
    await user.type(campo, 'linha 1{Shift>}{Enter}{/Shift}');
    expect(execute).not.toHaveBeenCalled();
    await user.clear(campo);
    await user.type(campo, 'qual o lag?{Enter}');
    expect(screen.getByText('qual o lag?')).toBeInTheDocument();
    expect(screen.getByText('⟳ Analisando...')).toBeInTheDocument();
    expect(execute).toHaveBeenCalledWith({
      pergunta: 'qual o lag?',
      ciclo: 'PLP-2026-07',
      modelo: 'SARIMAX',
    });
    responder('O lag de +1 mês…');
    expect(await screen.findByText('O lag de +1 mês…')).toBeInTheDocument();
    expect(screen.queryByText('⟳ Analisando...')).not.toBeInTheDocument();
  });

  it('texto vazio não envia; botão Enviar envia', async () => {
    const { user, useCases } = render();
    await user.click(screen.getByRole('button', { name: 'Enviar' }));
    expect(useCases.analises.responderChat.execute).not.toHaveBeenCalled();
    await user.type(screen.getByRole('textbox', { name: 'Pergunte à IA' }), 'oi');
    await user.click(screen.getByRole('button', { name: 'Enviar' }));
    expect(await screen.findByText('Resposta da IA')).toBeInTheDocument();
  });

  it('CA-13 / RN-11: salvar interação sem par avisa; com par documenta', async () => {
    const { user, useCases } = render();
    await user.click(screen.getByRole('button', { name: '💾 Salvar interação' }));
    expect(await screen.findByText('Nenhuma interação completa.')).toBeInTheDocument();
    await user.type(screen.getByRole('textbox', { name: 'Pergunte à IA' }), 'oi{Enter}');
    await screen.findByText('Resposta da IA');
    await user.click(screen.getByRole('button', { name: '💾 Salvar interação' }));
    await waitFor(() =>
      expect(useCases.analises.documentarInteracao.execute).toHaveBeenCalledWith({
        id: 'ANL-002',
        pergunta: 'oi',
        resposta: 'Resposta da IA',
      }),
    );
    expect(await screen.findByText('Interação documentada.')).toBeInTheDocument();
  });

  it('CA-13: semeado com o histórico; Limpar mostra a nova boas-vindas', async () => {
    const { user } = render({}, [
      { papel: 'usuario' as const, texto: 'Pergunta antiga' },
      { papel: 'ia' as const, texto: 'Resposta antiga' },
    ]);
    expect(screen.getByText('Pergunta antiga')).toBeInTheDocument();
    expect(screen.queryByText(/Pronto para ajudar/)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Limpar' }));
    expect(screen.getByText('Chat limpo. Como posso ajudar?')).toBeInTheDocument();
    expect(screen.queryByText('Pergunta antiga')).not.toBeInTheDocument();
  });

  it('falhas mostram o toast de erro', async () => {
    const { user } = render(
      {
        analises: {
          responderChat: { execute: vi.fn().mockRejectedValue(new Error('x')) },
          documentarInteracao: { execute: vi.fn().mockRejectedValue(new Error('x')) },
        },
      },
      [
        { papel: 'usuario' as const, texto: 'p' },
        { papel: 'ia' as const, texto: 'r' },
      ],
    );
    await user.type(screen.getByRole('textbox', { name: 'Pergunte à IA' }), 'oi{Enter}');
    expect(
      await screen.findByText('Não foi possível salvar. Tente novamente.'),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '💾 Salvar interação' }));
    await waitFor(() =>
      expect(
        screen.getAllByText('Não foi possível salvar. Tente novamente.').length,
      ).toBeGreaterThan(0),
    );
  });
});
