import type { AprovTone } from '@domain/aprovacoes/vocabulario';

export const TEXT_TONE: Record<AprovTone | '', string> = {
  '': 'text-apsen-slate',
  yellow: 'text-apsen-yellow',
  green: 'text-apsen-green',
  red: 'text-apsen-red',
  blue: 'text-apsen-blue',
  orange: 'text-apsen-orange',
  purple: 'text-apsen-purple',
};

export const BORDER_DECIDIDO: Record<string, string> = {
  aprovado: 'border-l-[3px] border-l-apsen-green',
  rejeitado: 'border-l-[3px] border-l-apsen-red',
};
