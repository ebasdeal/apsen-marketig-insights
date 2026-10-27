import type { TipoCampoValidado, TipoValidation } from './errors';
import type {
  CampoTipo,
  Categoria,
  CategoriaSlug,
  CategoriaTipoRef,
  OpcaoCampo,
  ParamRow,
  TipoDraft,
} from './Tipo';
import { FEATURE_TONES, LAG_MAX, LAG_MIN, TIPO_CAT_FILTERS, type CodeTone } from './vocabulario';

export const SLUG_REGEX = /^[a-z][a-z0-9_]*$/;

const LAG_REGEX = /^-?\d+$/;

const CAMPOS_ORDEM: readonly TipoCampoValidado[] = ['slug', 'label', 'cat', 'dono', 'lag'];

export function formatLag(lag: number): string {
  return lag > 0 ? `+${lag}` : String(lag);
}

export function featureTone(feature: string): CodeTone {
  return FEATURE_TONES[feature] ?? 'muted';
}

export function catLabelCurto(cat: CategoriaSlug): string {
  return TIPO_CAT_FILTERS.find((filtro) => filtro.value === cat)?.label ?? cat;
}

export function parseLag(lag: string): number | null {
  const texto = lag.trim();
  if (!LAG_REGEX.test(texto)) {
    return null;
  }
  const valor = Number(texto);
  return valor >= LAG_MIN && valor <= LAG_MAX ? valor : null;
}

export interface ValidateTipoOptions {
  modo: 'novo' | 'editar';
  slugExiste: boolean;
}

function slugError(slug: string, { modo, slugExiste }: ValidateTipoOptions): string | undefined {
  if (slug === '') {
    return '⚠️ Informe o slug.';
  }
  if (!SLUG_REGEX.test(slug)) {
    return '⚠️ Slug inválido — use letras minúsculas, números e underscore.';
  }
  if (modo === 'novo' && slugExiste) {
    return '⚠️ Já existe um tipo com este slug.';
  }
  return undefined;
}

function fieldErrors(draft: TipoDraft, options: ValidateTipoOptions): TipoValidation['fields'] {
  const candidatos: Record<TipoCampoValidado, string | undefined> = {
    slug: slugError(draft.slug.trim(), options),
    label: draft.label.trim() === '' ? '⚠️ Informe o label.' : undefined,
    cat: draft.cat === '' ? '⚠️ Selecione a categoria.' : undefined,
    dono: draft.dono.trim() === '' ? '⚠️ Selecione o dono de área.' : undefined,
    lag:
      parseLag(draft.lag) === null
        ? '⚠️ O lag deve ser um número inteiro entre -3 e 6.'
        : undefined,
  };
  const fields: TipoValidation['fields'] = {};
  CAMPOS_ORDEM.forEach((campo) => {
    const mensagem = candidatos[campo];
    if (mensagem !== undefined) {
      fields[campo] = mensagem;
    }
  });
  return fields;
}

export function isRowVazia(row: ParamRow): boolean {
  return row.nome.trim() === '' && row.label.trim() === '';
}

function opcoesDe(texto: string): string[] {
  return texto
    .split('|')
    .map((item) => item.trim())
    .filter((item) => item !== '');
}

function rowError(row: ParamRow, n: number, nomesAnteriores: Set<string>): string | undefined {
  const nome = row.nome.trim();
  if (nome === '' || row.label.trim() === '') {
    return `⚠️ Campo ${n}: informe o nome e o label.`;
  }
  if (row.original === undefined && !SLUG_REGEX.test(nome)) {
    return `⚠️ Campo ${n}: nome inválido — use letras minúsculas, números e underscore.`;
  }
  if (nomesAnteriores.has(nome)) {
    return `⚠️ Campo ${n}: nome repetido.`;
  }
  if (row.tipo === 'select' && row.origem === 'fixas' && opcoesDe(row.opcoes).length === 0) {
    return `⚠️ Campo ${n}: informe as opções separadas por |.`;
  }
  if (row.tipo === 'select' && row.origem === 'api' && row.fonte.trim() === '') {
    return `⚠️ Campo ${n}: selecione a fonte de dados.`;
  }
  return undefined;
}

function rowErrors(rows: readonly ParamRow[]): TipoValidation['rows'] {
  const erros: TipoValidation['rows'] = {};
  const nomes = new Set<string>();
  rows.forEach((row, index) => {
    if (isRowVazia(row)) {
      return;
    }
    const erro = rowError(row, index + 1, nomes);
    nomes.add(row.nome.trim());
    if (erro !== undefined) {
      erros[row.key] = erro;
    }
  });
  return erros;
}

export function validateTipoDraft(draft: TipoDraft, options: ValidateTipoOptions): TipoValidation {
  return { fields: fieldErrors(draft, options), rows: rowErrors(draft.rows) };
}

export function primeiraMensagem(validation: TipoValidation): string | null {
  return Object.values(validation.fields)[0] ?? Object.values(validation.rows)[0] ?? null;
}

function opcaoLabel(opcao: OpcaoCampo): string {
  return typeof opcao === 'string' ? opcao : opcao.label;
}

function opcoesTexto(options: readonly OpcaoCampo[] | undefined): string {
  return (options ?? []).map(opcaoLabel).join('|');
}

function semOpcoes(campo: CampoTipo | undefined): Record<string, unknown> {
  if (campo === undefined) {
    return {};
  }
  return Object.fromEntries(
    Object.entries(campo).filter(([atributo]) => atributo !== 'options' && atributo !== 'fonte'),
  );
}

function opcoesDoSelect(row: ParamRow): Pick<CampoTipo, 'options' | 'fonte'> {
  if (row.origem === 'api') {
    return { fonte: row.fonte.trim() };
  }
  const original = row.original?.options;
  if (original !== undefined && row.opcoes === opcoesTexto(original)) {
    return { options: original };
  }
  return { options: opcoesDe(row.opcoes) };
}

export function rowToCampo(row: ParamRow): CampoTipo {
  const nome = row.nome.trim();
  return {
    ...semOpcoes(row.original),
    label: row.label.trim(),
    required: row.obrigatorio,
    id: row.original?.id ?? `d_${nome}`,
    param: nome,
    type: row.tipo,
    ...(row.tipo === 'select' ? opcoesDoSelect(row) : {}),
  };
}

export function rowsToCampos(rows: readonly ParamRow[]): CampoTipo[] {
  return rows.filter((row) => !isRowVazia(row)).map(rowToCampo);
}

export function campoToRow(campo: CampoTipo, key: string): ParamRow {
  return {
    key,
    nome: campo.param,
    label: campo.label,
    tipo: campo.type,
    obrigatorio: campo.required,
    origem: campo.fonte === undefined ? 'fixas' : 'api',
    opcoes: opcoesTexto(campo.options),
    fonte: campo.fonte ?? '',
    original: campo,
  };
}

export function camposToRows(campos: readonly CampoTipo[]): ParamRow[] {
  return campos.map((campo, index) => campoToRow(campo, `row-${index + 1}`));
}

export interface CategoriaPatchInput {
  slug: string;
  label: string;
  catAnterior?: CategoriaSlug | null;
  catNova: CategoriaSlug | null;
  remover?: boolean;
}

export interface CategoriaPatch {
  id: number;
  tipos: CategoriaTipoRef[];
}

function tiposDaCategoria(categoria: Categoria, input: CategoriaPatchInput): CategoriaTipoRef[] {
  const entra = input.remover !== true && categoria.slug === input.catNova;
  const entrada = { slug: input.slug, label: input.label };
  const posicao = categoria.tipos.findIndex((tipo) => tipo.slug === input.slug);
  const sem = categoria.tipos.filter((tipo) => tipo.slug !== input.slug);
  if (!entra) {
    return sem;
  }
  if (posicao === -1) {
    return [...sem, entrada];
  }
  return [...sem.slice(0, posicao), entrada, ...sem.slice(posicao)];
}

function mesmosTipos(a: readonly CategoriaTipoRef[], b: readonly CategoriaTipoRef[]): boolean {
  return (
    a.length === b.length &&
    a.every((tipo, index) => tipo.slug === b[index]?.slug && tipo.label === b[index]?.label)
  );
}

export function categoriaPatches(
  categorias: readonly Categoria[],
  input: CategoriaPatchInput,
): CategoriaPatch[] {
  return categorias.flatMap((categoria) => {
    const tipos = tiposDaCategoria(categoria, input);
    return mesmosTipos(tipos, categoria.tipos) ? [] : [{ id: categoria.id, tipos }];
  });
}

export function aplicarCategoriaPatches(
  categorias: readonly Categoria[],
  patches: readonly CategoriaPatch[],
): Categoria[] {
  return categorias.map((categoria) => {
    const patch = patches.find((candidato) => candidato.id === categoria.id);
    return patch === undefined ? categoria : { ...categoria, tipos: patch.tipos };
  });
}
