import { DEFAULT_PAGE_SIZE, PAGE_SIZES } from '../shared/Page';
import type { PlanoStatus, TamanhoPagina } from './PlanoItem';

export const PLANO_STATUS: readonly PlanoStatus[] = [
  'aprovado',
  'revisao',
  'bloqueado',
  'pendente',
];

export const PLANO_STATUS_LABEL: Record<PlanoStatus, string> = {
  aprovado: 'Aprovado',
  revisao: 'Em Revisão',
  bloqueado: 'Bloqueado',
  pendente: 'Pendente',
};

export const PLANO_FAMILIAS: readonly string[] = [
  'Imunologia',
  'Cardio',
  'Dermatologia',
  'Neurologia',
  'Reumatologia',
  'Endocrinologia',
  'Gastro',
];

export const LINHAS: readonly string[] = ['Linha 1', 'Linha 2', 'Linha 3', 'Linha 4'];

export const SEMANAS: readonly string[] = [
  'S27 (30/06–06/07)',
  'S28 (07–13/07)',
  'S29 (14–20/07)',
  'S30 (21–27/07)',
  'S31 (28/07–03/08)',
];

export const RESPONSAVEIS_PLANO: readonly string[] = [
  'Ana Planejadora',
  'Carlos Lima',
  'Roberto Gerente',
];

export const LINHA_PADRAO = 'Linha 1';

export const SEMANA_PADRAO = 'S27 (30/06–06/07)';

export const RESPONSAVEL_PADRAO_PLANO = 'Ana Planejadora';

export const PLANO_SKUS_INCLUSAO: readonly string[] = [
  'SKU-00312',
  'SKU-00313',
  'SKU-00058',
  'SKU-00059',
  'SKU-00091',
  'SKU-00092',
  'SKU-00189',
  'SKU-00315',
  'SKU-00071',
  'SKU-00140',
];

export const TAMANHOS_PAGINA: readonly TamanhoPagina[] = PAGE_SIZES;

export const TAMANHO_PADRAO: TamanhoPagina = DEFAULT_PAGE_SIZE;
