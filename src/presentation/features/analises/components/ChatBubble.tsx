import type { ReactNode } from 'react';

const BASE = 'max-w-[82%] px-[13px] py-[9px] text-[13px] leading-[1.6]';

const PAPEIS = {
  ia: 'self-start rounded-[12px_12px_12px_3px] border border-apsen-border bg-apsen-bg',
  usuario: 'self-end rounded-[12px_12px_3px_12px] bg-apsen-blue text-white',
};

interface ChatBubbleProps {
  papel: keyof typeof PAPEIS;
  children: ReactNode;
  muted?: boolean;
}

export function ChatBubble({ papel, children, muted = false }: ChatBubbleProps) {
  return (
    <div className={`${BASE} ${PAPEIS[papel]} ${muted ? 'text-apsen-muted' : ''}`.trim()}>
      {children}
    </div>
  );
}

export function BoasVindas({ limpo }: { limpo: boolean }) {
  return (
    <ChatBubble papel="ia">
      {limpo ? (
        'Chat limpo. Como posso ajudar?'
      ) : (
        <>
          Pronto para ajudar. Posso <strong>explicar resultados</strong>,{' '}
          <strong>ajustar parâmetros</strong> ou comparar cenários.
        </>
      )}
    </ChatBubble>
  );
}
