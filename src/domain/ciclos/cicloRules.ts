import { InvalidValueError } from '../shared/DomainError';
import { CICLO_FIELDS, type CicloDraft, type CicloErrors, type CicloField } from './Ciclo';

export const RESPONSAVEIS_CICLO = ['Ana Planejadora', 'Carlos Planejador'] as const;

export const CICLO_MESSAGES = {
  descricao: '⚠️ Informe a descrição.',
  inicio: '⚠️ Informe a data de início.',
  fim: '⚠️ Informe a data fim.',
  fimAntesDoInicio: '⚠️ A data fim não pode ser anterior à data início.',
} as const;

const MESES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
] as const;

const CODIGO_PATTERN = /^PLP-(\d{4})-(\d{2})$/;

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

interface AnoMes {
  ano: number;
  mes: number;
}

const pad2 = (value: number): string => String(value).padStart(2, '0');

export function parseCicloCodigo(codigo: string): AnoMes | null {
  const match = CODIGO_PATTERN.exec(codigo);
  if (match === null) {
    return null;
  }
  const mes = Number(match[2]);
  return mes >= 1 && mes <= 12 ? { ano: Number(match[1]), mes } : null;
}

function formatCodigo({ ano, mes }: AnoMes): string {
  return `PLP-${ano}-${pad2(mes)}`;
}

export function nextCicloCodigo(codigos: readonly string[], today: Date): string {
  const indices = codigos
    .map(parseCicloCodigo)
    .filter((value): value is AnoMes => value !== null)
    .map(({ ano, mes }) => ano * 12 + (mes - 1));
  if (indices.length === 0) {
    return formatCodigo({ ano: today.getFullYear(), mes: today.getMonth() + 1 });
  }
  const next = Math.max(...indices) + 1;
  return formatCodigo({ ano: Math.floor(next / 12), mes: (next % 12) + 1 });
}

export function defaultPeriodo(codigo: string): { inicio: string; fim: string } {
  const parsed = parseCicloCodigo(codigo);
  if (parsed === null) {
    throw new InvalidValueError(`Código de ciclo inválido: ${codigo}`);
  }
  const ultimoDia = new Date(Date.UTC(parsed.ano, parsed.mes, 0)).getUTCDate();
  const prefixo = `${parsed.ano}-${pad2(parsed.mes)}`;
  return { inicio: `${prefixo}-01`, fim: `${prefixo}-${pad2(ultimoDia)}` };
}

function isoParts(iso: string): [string, string, string] {
  const match = ISO_DATE_PATTERN.exec(iso);
  if (match === null) {
    throw new InvalidValueError(`Data inválida: ${iso}`);
  }
  return [match[1] as string, match[2] as string, match[3] as string];
}

export function formatPeriodo(inicio: string, fim: string): string {
  const [anoInicio, mesInicio, diaInicio] = isoParts(inicio);
  const [anoFim, mesFim, diaFim] = isoParts(fim);
  const fimBr = `${diaFim}/${mesFim}/${anoFim}`;
  if (anoInicio === anoFim) {
    return `${diaInicio}/${mesInicio} → ${fimBr}`;
  }
  return `${diaInicio}/${mesInicio}/${anoInicio} → ${fimBr}`;
}

export function formatDateBr(date: Date): string {
  return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()}`;
}

export function metaCriado(today: Date, versao: number): string {
  return `Criado em ${formatDateBr(today)} · v${versao}`;
}

export function metaEncerrado(today: Date, versao: number): string {
  return `Encerrado em ${formatDateBr(today)} · v${versao}`;
}

export function mesAno(inicio: string): string {
  const [ano, mes] = isoParts(inicio);
  return `${MESES[Number(mes) - 1] ?? mes} ${ano}`;
}

export function validateCicloDraft(draft: CicloDraft): CicloErrors {
  const errors: CicloErrors = {};
  if (draft.descricao.trim() === '') {
    errors.descricao = CICLO_MESSAGES.descricao;
  }
  if (draft.inicio === '') {
    errors.inicio = CICLO_MESSAGES.inicio;
  }
  if (draft.fim === '') {
    errors.fim = CICLO_MESSAGES.fim;
  } else if (draft.inicio !== '' && draft.fim < draft.inicio) {
    errors.fim = CICLO_MESSAGES.fimAntesDoInicio;
  }
  return errors;
}

export function firstError(
  errors: CicloErrors,
  order: readonly CicloField[] = CICLO_FIELDS,
): string | undefined {
  const field = order.find((key) => errors[key] !== undefined);
  return field === undefined ? undefined : errors[field];
}
