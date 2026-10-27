import type { Analise, AnaliseStatus, DriverImpacto } from '@domain/analises/Analise';
import { ANALISE_STATUS_LABEL } from '@domain/analises/analiseConstants';
import type { AnaliseRepository } from '@domain/analises/AnaliseRepository';
import {
  larguraBarraImpacto,
  podeExportarPdf,
  segmentosRichText,
} from '@domain/analises/analiseRules';
import { mensagensDoHistorico } from '@domain/analises/chatRules';
import { comparacaoComVsSemDrivers } from '@domain/analises/comparacao';
import type { AnaliseDetailOutput, ImpactoOutput } from './dto';

function toImpacto(driver: DriverImpacto): ImpactoOutput {
  return {
    ...driver,
    largura: larguraBarraImpacto(driver.impacto),
    sinal: driver.dir === 'up' ? '+' : '',
  };
}

export function toAnaliseDetail(analise: Analise): AnaliseDetailOutput {
  return {
    id: analise.id,
    codigo: analise.codigo,
    titulo: analise.titulo,
    ciclo: analise.ciclo,
    tipo: analise.tipo,
    skus: [...analise.skus],
    modelo: analise.modelo,
    status: analise.status,
    statusLabel: ANALISE_STATUS_LABEL[analise.status],
    criada: analise.criada,
    comentarios: analise.comentarios,
    drivers: [...analise.drivers],
    configModelo: analise.configModelo,
    sumario: analise.sumario,
    justificativas: [...analise.justificativas],
    modeloInfo: analise.modeloInfo,
    salvoEm: analise.salvoEm,
    metaSkus: `${analise.skus.length} SKU(s)`,
    podeExportarPdf: podeExportarPdf(analise.status),
    sumarioSegmentos: segmentosRichText(analise.sumario),
    impactos: analise.driversImpacto.map(toImpacto),
    comparacao: comparacaoComVsSemDrivers(analise),
    historico: analise.historicoIa.map((item) => ({ ...item })),
    mensagensChat: mensagensDoHistorico(analise.historicoIa),
  };
}

export function comStatus(detail: AnaliseDetailOutput, status: AnaliseStatus): AnaliseDetailOutput {
  return {
    ...detail,
    status,
    statusLabel: ANALISE_STATUS_LABEL[status],
    podeExportarPdf: podeExportarPdf(status),
  };
}

export class GetAnalise {
  constructor(private readonly repository: AnaliseRepository) {}

  async execute(id: string): Promise<AnaliseDetailOutput> {
    return toAnaliseDetail(await this.repository.get(id));
  }
}
