export type StatusPeriodo = 'ok' | 'anterior' | 'excede';

const DATA_ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

const MENSAGENS: Record<Exclude<StatusPeriodo, 'ok'>, string> = {
  anterior: '⚠️ A data fim não pode ser anterior à data início.',
  excede: '⚠️ A data fim não pode ultrapassar 1 ano a partir da data início.',
};

export function dataFimMaxima(inicio: string): string {
  const match = DATA_ISO.exec(inicio);
  if (match === null) {
    return '';
  }
  const [, ano, mes, dia] = match;
  const data = new Date(Date.UTC(Number(ano), Number(mes) - 1, Number(dia)));
  data.setUTCFullYear(data.getUTCFullYear() + 1);
  return data.toISOString().slice(0, 10);
}

export function validarPeriodo(inicio: string, fim: string): StatusPeriodo {
  if (inicio === '' || fim === '') {
    return 'ok';
  }
  if (fim < inicio) {
    return 'anterior';
  }
  const maxima = dataFimMaxima(inicio);
  return maxima !== '' && fim > maxima ? 'excede' : 'ok';
}

export function mensagemPeriodo(status: StatusPeriodo): string | null {
  return status === 'ok' ? null : MENSAGENS[status];
}
