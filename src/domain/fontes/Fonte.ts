export type FonteModo = 'mock' | 'api';

export type FonteAuth = 'none' | 'apikey' | 'bearer' | 'basic';

export interface Fonte {
  readonly id: string;
  readonly nome: string;
  readonly icon: string;
  readonly desc: string;
  readonly modo: FonteModo;
  readonly url: string;
  readonly auth: FonteAuth;
  readonly cache: number;
  readonly campos: string;
  readonly mapValor: string;
  readonly mapLabel: string;
  readonly custom: boolean;
}

export interface FonteDraft {
  nome: string;
  icon: string;
  desc: string;
  modo: FonteModo;
  url: string;
  auth: FonteAuth;
  cache: string;
  mapValor: string;
  mapLabel: string;
}

export type FonteConfigDraft = Pick<
  FonteDraft,
  'modo' | 'url' | 'auth' | 'cache' | 'mapValor' | 'mapLabel'
>;

export type FonteConfig = Pick<Fonte, 'modo' | 'url' | 'auth' | 'cache' | 'mapValor' | 'mapLabel'>;

export type FonteField = 'nome' | 'url';

export const FONTE_FIELDS: readonly FonteField[] = ['nome', 'url'];

export type FonteErrors = Partial<Record<FonteField, string>>;
