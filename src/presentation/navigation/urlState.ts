export type UrlField =
  | { kind: 'int'; default: number; min?: number }
  | { kind: 'string'; default: string }
  | { kind: 'enum'; default: string; values: readonly string[] };

export type UrlStateSpec = Record<string, UrlField>;

export type UrlValues<S extends UrlStateSpec> = {
  [K in keyof S]: S[K] extends { kind: 'int' } ? number : string;
};

const PAGE_KEY = 'page';

function parseField(raw: string | null, field: UrlField): number | string {
  if (raw === null) {
    return field.default;
  }
  if (field.kind === 'int') {
    const value = /^-?\d+$/.test(raw) ? Number(raw) : Number.NaN;
    const valid = Number.isSafeInteger(value) && (field.min === undefined || value >= field.min);
    return valid ? value : field.default;
  }
  if (field.kind === 'enum') {
    return field.values.includes(raw) ? raw : field.default;
  }
  return raw;
}

export function parseUrlState<S extends UrlStateSpec>(
  params: URLSearchParams,
  spec: S,
): UrlValues<S> {
  return Object.fromEntries(
    Object.entries(spec).map(([key, field]) => [key, parseField(params.get(key), field)]),
  ) as UrlValues<S>;
}

export function buildUrlSearch<S extends UrlStateSpec>(
  current: URLSearchParams,
  spec: S,
  patch: Partial<UrlValues<S>>,
): string {
  const next = { ...parseUrlState(current, spec), ...patch } as Record<string, number | string>;
  const resetsPage =
    PAGE_KEY in spec && !(PAGE_KEY in patch) && Object.keys(patch).some((key) => key in spec);
  if (resetsPage) {
    next[PAGE_KEY] = (spec[PAGE_KEY] as UrlField).default;
  }
  const params = new URLSearchParams(current);
  Object.entries(spec).forEach(([key, field]) => {
    const value = next[key];
    if (value === undefined || value === field.default || value === '') {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
  });
  const search = params.toString();
  return search === '' ? '' : `?${search}`;
}
