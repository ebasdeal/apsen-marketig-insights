import type { FonteCardDto } from '@application/fontes/dto';
import type { FonteConfigDraft, FonteDraft, FonteModo } from '@domain/fontes/Fonte';
import { CACHE_PADRAO, ICONE_PADRAO, MAP_PADRAO } from '@domain/fontes/vocabulario';

export type FonteModalMode = { modo: 'nova' } | { modo: 'config'; fonte: FonteCardDto };

export type FonteFormState = FonteDraft;

export const MODO_OPTIONS = [
  { value: 'mock', label: '📦 Lista interna (mock)' },
  { value: 'api', label: '🔌 API externa' },
] as const satisfies readonly { value: FonteModo; label: string }[];

export const MODO_HINT: Record<FonteModo, string> = {
  mock: 'Usa a lista interna do sistema. Sem chamada de rede.',
  api: 'Consulta a API externa em tempo real a cada busca do usuário.',
};

export function initialFonteForm(mode: FonteModalMode): FonteFormState {
  if (mode.modo === 'nova') {
    return {
      nome: '',
      icon: ICONE_PADRAO,
      desc: '',
      modo: 'mock',
      url: '',
      auth: 'none',
      cache: String(CACHE_PADRAO),
      mapValor: MAP_PADRAO.valor,
      mapLabel: MAP_PADRAO.label,
    };
  }
  const { fonte } = mode;
  return {
    nome: fonte.nome,
    icon: fonte.icon,
    desc: fonte.desc,
    modo: fonte.config.modo,
    url: fonte.config.url,
    auth: fonte.config.auth,
    cache: String(fonte.config.cache),
    mapValor: fonte.config.mapValor,
    mapLabel: fonte.config.mapLabel,
  };
}

export function isFonteFormDirty(current: FonteFormState, initial: FonteFormState): boolean {
  return (Object.keys(initial) as (keyof FonteFormState)[]).some(
    (key) => current[key] !== initial[key],
  );
}

export function toFonteConfigDraft(form: FonteFormState): FonteConfigDraft {
  return {
    modo: form.modo,
    url: form.url,
    auth: form.auth,
    cache: form.cache,
    mapValor: form.mapValor,
    mapLabel: form.mapLabel,
  };
}

export function fonteModalTitle(mode: FonteModalMode): string {
  return mode.modo === 'nova' ? 'Nova Fonte de Dados' : `Configurar: ${mode.fonte.nome}`;
}
