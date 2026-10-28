import type { Aprovacao, AprovStatus, Intensidade } from '@domain/aprovacoes/Aprovacao';
import type { Driver } from '@domain/drivers/Driver';
import type { PerfilId } from '@domain/perfis/Perfil';

export interface Registrante {
  nome: string;
  perfil: PerfilId;
}

export interface ContextoAprovacao {
  registrante: Registrante;
  tipoLabel: string;
  categoria: string;
}

const NUMERO_FINAL = /-(\d+)$/;

export function statusDoRegistro(perfil: PerfilId): AprovStatus {
  return perfil === 'area' ? 'pendente' : 'aprovado';
}

export function proximoIdAprovacao(maior: string | null, agora: Date): string {
  const atual = maior === null ? 0 : Number(NUMERO_FINAL.exec(maior)?.[1] ?? 0);
  return `DRV-${agora.getUTCFullYear()}-${String(atual + 1).padStart(3, '0')}`;
}

function paramsTexto(parametros: Readonly<Record<string, string>>): string {
  return Object.entries(parametros)
    .filter(([, valor]) => valor !== '')
    .map(([chave, valor]) => `${chave}: ${valor}`)
    .join(' · ');
}

export function aprovacaoDoDriver(
  driver: Driver,
  contexto: ContextoAprovacao,
  id: string,
  agora: Date,
): Aprovacao {
  const status = statusDoRegistro(contexto.registrante.perfil);
  return {
    id,
    modo: driver.modo === 'sku' ? 'SKU' : 'Molécula',
    produto: driver.produto,
    molecula: driver.molecula,
    tipo: contexto.tipoLabel,
    cat: contexto.categoria,
    periodo: { ini: driver.periodo.inicio, fim: driver.periodo.fim },
    intensidade: driver.intensidadeEsperada as Intensidade,
    registrante: contexto.registrante.nome,
    dataReg: agora.toISOString().slice(0, 10),
    status,
    params: paramsTexto(driver.parametros),
    motivoRejeicao: '',
    justificativaRejeicao: '',
    decisao:
      status === 'aprovado'
        ? { tipo: 'aprovado', por: contexto.registrante.nome, em: agora.toISOString() }
        : null,
  };
}
