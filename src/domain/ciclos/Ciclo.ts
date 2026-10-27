export type CicloStatus = 'ativo' | 'encerrado' | 'rascunho';

export interface Ciclo {
  readonly id: string;
  readonly codigo: string;
  readonly descricao: string;
  readonly meta: string;
  readonly inicio: string;
  readonly fim: string;
  readonly periodo: string;
  readonly drivers: number;
  readonly responsavel: string;
  readonly status: CicloStatus;
  readonly versao: number;
}

export interface CicloDraft {
  descricao: string;
  inicio: string;
  fim: string;
  responsavel: string;
  ativar: boolean;
}

export type CicloField = 'descricao' | 'inicio' | 'fim';

export const CICLO_FIELDS: readonly CicloField[] = ['descricao', 'inicio', 'fim'];

export type CicloErrors = Partial<Record<CicloField, string>>;

export type CicloPatch = Partial<
  Pick<Ciclo, 'descricao' | 'inicio' | 'fim' | 'periodo' | 'responsavel' | 'status' | 'meta'>
>;
