'use client';

import type { MensagemChat } from '@domain/analises/Analise';
import { ultimaInteracao } from '@domain/analises/chatRules';
import { ApsenLoader, Button } from '@presentation/components/ui';
import { useEffect, useRef, useState } from 'react';
import {
  useDocumentarInteracaoMutation,
  useResponderChatMutation,
} from '../../../hooks/analises/useAnalisesMutations';
import { useToast } from '../../../providers/ToastProvider';
import { mensagemFalhaAnalise } from '../falhaEscrita';
import { BoasVindas, ChatBubble } from './ChatBubble';
import { ChatInput } from './ChatInput';

export interface ChatPanelProps {
  analiseId: string;
  ciclo: string;
  modelo: string;
  iniciais: readonly MensagemChat[];
}

export default function ChatPanel({ analiseId, ciclo, modelo, iniciais }: ChatPanelProps) {
  const [mensagens, setMensagens] = useState<MensagemChat[]>(() => [...iniciais]);
  const [limpo, setLimpo] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const responder = useResponderChatMutation();
  const documentar = useDocumentarInteracaoMutation();
  const toast = useToast();

  useEffect(() => {
    const log = logRef.current;
    if (log !== null) log.scrollTop = log.scrollHeight;
  }, [mensagens, responder.isPending]);

  async function enviar(pergunta: string) {
    setMensagens((atuais) => [...atuais, { papel: 'usuario', texto: pergunta }]);
    try {
      const resposta = await responder.mutateAsync({ pergunta, ciclo, modelo });
      setMensagens((atuais) => [...atuais, { papel: 'ia', texto: resposta }]);
    } catch (error) {
      toast.show(mensagemFalhaAnalise(error), { tone: 'error' });
    }
  }

  async function salvarInteracao() {
    const par = ultimaInteracao(mensagens);
    if (par === null) {
      toast.show('⚠️ Nenhuma interação completa.');
      return;
    }
    try {
      await documentar.mutateAsync({ id: analiseId, ...par });
      toast.show('✅ Interação documentada.');
    } catch (error) {
      toast.show(mensagemFalhaAnalise(error), { tone: 'error' });
    }
  }

  return (
    <>
      <div className="flex h-[420px] flex-col overflow-hidden rounded-[10px] border border-apsen-border bg-apsen-white">
        <div
          ref={logRef}
          role="log"
          aria-live="polite"
          aria-label="Conversa com a IA"
          className="flex flex-1 flex-col gap-[8px] overflow-y-auto p-[14px]"
        >
          {mensagens.length === 0 ? <BoasVindas limpo={limpo} /> : null}
          {mensagens.map((mensagem, index) => (
            <ChatBubble key={index} papel={mensagem.papel}>
              {mensagem.texto}
            </ChatBubble>
          ))}
          {responder.isPending ? (
            <ChatBubble papel="ia" muted>
              <ApsenLoader variant="inline" label="Analisando…" />
            </ChatBubble>
          ) : null}
        </div>
        <ChatInput disabled={responder.isPending} onEnviar={(texto) => void enviar(texto)} />
      </div>
      <div className="mt-[8px] flex gap-[6px]">
        <Button
          escrita
          variant="ghost"
          size="sm"
          className="flex-1 justify-center text-[11.5px]"
          loading={documentar.isPending}
          onClick={() => void salvarInteracao()}
        >
          💾 Salvar interação
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-[11.5px]"
          onClick={() => {
            setMensagens([]);
            setLimpo(true);
          }}
        >
          Limpar
        </Button>
      </div>
    </>
  );
}
