import {
  isCategoriaSlug,
  isParamTipo,
  type CampoTipo,
  type CategoriaSlug,
  type OpcaoCampo,
} from './Tipo';
import { SLUG_REGEX } from './tipoRules';

export const CATALOGO_SCHEMA = 'drivers-catalogo-v1';

export interface ImportTipo {
  slug: string;
  label: string;
  cat: CategoriaSlug;
  dono: string;
  feature?: string;
  lag?: number;
  ativo?: boolean;
  desc?: string;
  impacto?: string;
  perm?: string;
  nota?: string;
  campos?: CampoTipo[];
}

export type CatalogoImportResult = { ok: true; tipos: ImportTipo[] } | { ok: false; erro: string };

type Registro = Record<string, unknown>;

const TEXTOS_OPCIONAIS = ['feature', 'desc', 'impacto', 'perm', 'nota'] as const;

const ATRIBUTOS_CAMPO_TEXTO = ['placeholder', 'labelHint', 'fonte'] as const;

function isRegistro(value: unknown): value is Registro {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function textoPreenchido(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

function isOpcao(value: unknown): value is OpcaoCampo {
  return (
    typeof value === 'string' ||
    (isRegistro(value) && typeof value.label === 'string' && typeof value.group === 'string')
  );
}

function parseJson(texto: string): { ok: true; valor: unknown } | { ok: false } {
  try {
    return { ok: true, valor: JSON.parse(texto) as unknown };
  } catch {
    return { ok: false };
  }
}

function parseCampo(bruto: unknown): CampoTipo | null {
  if (!isRegistro(bruto) || !textoPreenchido(bruto.param) || !textoPreenchido(bruto.label)) {
    return null;
  }
  const type = bruto.type ?? 'text';
  if (!isParamTipo(type)) {
    return null;
  }
  const param = bruto.param.trim();
  const campo: CampoTipo = {
    label: bruto.label.trim(),
    required: bruto.required === true,
    id: textoPreenchido(bruto.id) ? bruto.id : `d_${param}`,
    param,
    type,
  };
  if (Array.isArray(bruto.options) && bruto.options.every(isOpcao)) {
    campo.options = bruto.options;
  }
  ATRIBUTOS_CAMPO_TEXTO.forEach((atributo) => {
    const valor = bruto[atributo];
    if (typeof valor === 'string') {
      campo[atributo] = valor;
    }
  });
  return campo;
}

function parseCampos(bruto: unknown): CampoTipo[] | null | undefined {
  if (bruto === undefined) {
    return undefined;
  }
  if (!Array.isArray(bruto)) {
    return null;
  }
  const campos = bruto.map(parseCampo);
  return campos.every((campo): campo is CampoTipo => campo !== null) ? campos : null;
}

function parseOpcionais(item: Registro): Omit<ImportTipo, 'slug' | 'label' | 'cat' | 'dono'> {
  const opcionais: Omit<ImportTipo, 'slug' | 'label' | 'cat' | 'dono'> = {};
  TEXTOS_OPCIONAIS.forEach((atributo) => {
    const valor = item[atributo];
    if (typeof valor === 'string') {
      opcionais[atributo] = valor;
    }
  });
  if (typeof item.lag === 'number' && Number.isInteger(item.lag)) {
    opcionais.lag = item.lag;
  }
  if (typeof item.ativo === 'boolean') {
    opcionais.ativo = item.ativo;
  }
  return opcionais;
}

function parseItem(item: unknown): ImportTipo | null {
  if (!isRegistro(item)) {
    return null;
  }
  const { slug, label, cat, dono } = item;
  if (
    typeof slug !== 'string' ||
    !SLUG_REGEX.test(slug.trim()) ||
    !textoPreenchido(label) ||
    !isCategoriaSlug(cat) ||
    !textoPreenchido(dono)
  ) {
    return null;
  }
  const campos = parseCampos(item.campos);
  if (campos === null) {
    return null;
  }
  return {
    slug: slug.trim(),
    label: label.trim(),
    cat,
    dono: dono.trim(),
    ...parseOpcionais(item),
    ...(campos === undefined ? {} : { campos }),
  };
}

function parseTipos(lista: readonly unknown[]): CatalogoImportResult {
  const tipos: ImportTipo[] = [];
  const slugs = new Set<string>();
  for (const [index, bruto] of lista.entries()) {
    const n = index + 1;
    const tipo = parseItem(bruto);
    if (tipo === null) {
      return { ok: false, erro: `⚠️ Tipo ${n}: informe slug, label, categoria e dono válidos.` };
    }
    if (slugs.has(tipo.slug)) {
      return { ok: false, erro: `⚠️ Tipo ${n}: slug repetido no arquivo.` };
    }
    slugs.add(tipo.slug);
    tipos.push(tipo);
  }
  return { ok: true, tipos };
}

export function parseCatalogoImport(texto: string): CatalogoImportResult {
  if (texto.trim() === '') {
    return { ok: false, erro: '⚠️ Cole o JSON do catálogo.' };
  }
  const json = parseJson(texto);
  if (!json.ok) {
    return { ok: false, erro: '⚠️ JSON inválido — verifique a sintaxe.' };
  }
  if (!isRegistro(json.valor) || json.valor.schema !== CATALOGO_SCHEMA) {
    return { ok: false, erro: '⚠️ Schema não reconhecido — use drivers-catalogo-v1.' };
  }
  const { tipos } = json.valor;
  if (!Array.isArray(tipos) || tipos.length === 0) {
    return { ok: false, erro: '⚠️ Nenhum tipo encontrado no JSON.' };
  }
  return parseTipos(tipos);
}
