import type { Driver, Granularidade } from './Driver';

export const TEXTO_EXPORT_VAZIO = 'Nenhum registro.';

export interface DriverExport {
  id: string;
  modo: Granularidade;
  produto: string;
  molecula: string;
  codigo: string;
  skus_afetados_ia: string[];
  titulo: string;
  periodo: { inicio: string; fim: string };
  tipo: string;
  cobertura: { regioes: string[]; canais: string[] };
  intensidade_esperada: number;
  uplift_pct: number | null;
  verba_rs: number | null;
  observacoes: string;
  parametros: Record<string, string>;
}

export interface ExportMeta {
  exportSchema: string;
  instrucoesModelagem: readonly string[];
}

export interface DriversExport {
  schema: string;
  exportado_em: string;
  total_registros: number;
  instrucoes_modelagem: string[];
  drivers: DriverExport[];
}

export function driverParaExport(driver: Driver): DriverExport {
  return {
    id: driver.id,
    modo: driver.modo,
    produto: driver.produto,
    molecula: driver.molecula,
    codigo: driver.codigo,
    skus_afetados_ia: [...driver.skusAfetadosIa],
    titulo: driver.titulo,
    periodo: { inicio: driver.periodo.inicio, fim: driver.periodo.fim },
    tipo: driver.tipo,
    cobertura: { regioes: [...driver.cobertura.regioes], canais: [...driver.cobertura.canais] },
    intensidade_esperada: driver.intensidadeEsperada,
    uplift_pct: driver.upliftPct,
    verba_rs: driver.verbaRs,
    observacoes: driver.observacoes,
    parametros: { ...driver.parametros },
  };
}

export function montarExport(
  drivers: readonly Driver[],
  meta: ExportMeta,
  exportadoEm: Date,
): DriversExport {
  return {
    schema: meta.exportSchema,
    exportado_em: exportadoEm.toISOString(),
    total_registros: drivers.length,
    instrucoes_modelagem: [...meta.instrucoesModelagem],
    drivers: drivers.map(driverParaExport),
  };
}

export function textoDoExport(
  drivers: readonly Driver[],
  meta: ExportMeta,
  exportadoEm: Date,
): string {
  if (drivers.length === 0) {
    return TEXTO_EXPORT_VAZIO;
  }
  return JSON.stringify(montarExport(drivers, meta, exportadoEm), null, 2);
}

export function nomeArquivoExport(data: Date): string {
  return `drivers_demanda_v2_${data.toISOString().slice(0, 10)}.json`;
}
