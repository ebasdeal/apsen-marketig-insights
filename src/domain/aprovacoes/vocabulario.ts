import type { AprovStatus } from './Aprovacao';

export type AprovTone = 'yellow' | 'green' | 'red' | 'blue' | 'orange' | 'purple';

export const APROV_TIPOS: readonly string[] = [
  '💻 Digital / Redes',
  '📺 TV Aberta',
  '🛒 PDV / Trade',
  '⚗️ Falta de MP / IFA',
  '🚨 Recall',
  '🌡️ Sazonal / Epidemio.',
  '🚫 Restrição ANVISA',
  '🏁 Ação Concorrente',
  '🆕 Lançamento Próprio',
  '🚗 Equipe de Campo',
];

export const APROV_STATUS: readonly { value: AprovStatus; label: string }[] = [
  { value: 'pendente', label: '⏳ Pendente' },
  { value: 'aprovado', label: '✅ Aprovado' },
  { value: 'rejeitado', label: '❌ Rejeitado' },
];

export const MOTIVOS_REJEICAO: readonly string[] = [
  'Driver duplicado — já existe registro similar',
  'Produto / molécula incorreto',
  'Tipo de driver incorreto para o evento',
  'Período incoerente com o evento descrito',
  'Parâmetros insuficientes — necessário complementar',
  'Evento sem impacto relevante para o modelo',
  'Outro',
];

export const STATUS_CFG: Readonly<Record<AprovStatus, { label: string; tone: AprovTone }>> = {
  pendente: { label: '⏳ Pendente', tone: 'yellow' },
  aprovado: { label: '✅ Aprovado', tone: 'green' },
  rejeitado: { label: '❌ Rejeitado', tone: 'red' },
};

export const INT_LABEL = ['', '⚡', '⚡⚡', '⚡⚡⚡', '⚡⚡⚡⚡', '⚡⚡⚡⚡⚡'] as const;

export const INT_TONE = [
  '',
  'green',
  'green',
  'blue',
  'orange',
  'red',
] as const satisfies readonly (AprovTone | '')[];

export const PERMANENTE_FIM = '2099-12-31';

export const APROV_PAGE_SIZE = 5;
