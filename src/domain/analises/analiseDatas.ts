function doisDigitos(valor: number): string {
  return String(valor).padStart(2, '0');
}

export function dataBr(date: Date): string {
  return `${doisDigitos(date.getDate())}/${doisDigitos(date.getMonth() + 1)}/${date.getFullYear()}`;
}

export function dataHoraBr(date: Date): string {
  return `${dataBr(date)} ${doisDigitos(date.getHours())}:${doisDigitos(date.getMinutes())}`;
}
