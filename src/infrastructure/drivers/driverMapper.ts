import type { Driver, Intensidade } from '@domain/drivers/Driver';
import { driverParaExport, type DriverExport } from '@domain/drivers/exportPayload';
import type { CampoTipo, CamposTipo, DriverConfig } from '@domain/drivers/lookups';
import type { CamposTipoApiDto, DriverApiDto, DriverConfigApiDto } from './schemas';

export function toDriver(dto: DriverApiDto): Driver {
  return {
    id: String(dto.id),
    modo: dto.modo,
    produto: dto.produto,
    molecula: dto.molecula,
    codigo: dto.codigo,
    skusAfetadosIa: dto.skus_afetados_ia,
    titulo: dto.titulo,
    periodo: { inicio: dto.periodo.inicio, fim: dto.periodo.fim },
    tipo: dto.tipo,
    cobertura: { regioes: dto.cobertura.regioes, canais: dto.cobertura.canais },
    intensidadeEsperada: dto.intensidade_esperada as Intensidade,
    upliftPct: dto.uplift_pct,
    verbaRs: dto.verba_rs,
    observacoes: dto.observacoes,
    parametros: Object.fromEntries(
      Object.entries(dto.parametros).map(([chave, valor]) => [chave, String(valor)]),
    ),
  };
}

export function toDriverDto(driver: Driver): DriverExport {
  return driverParaExport(driver);
}

function toCampo(campo: CamposTipoApiDto['campos'][number]): CampoTipo {
  const opcionais = Object.fromEntries(
    (['options', 'placeholder', 'step', 'readonly', 'autocomplete', 'labelHint'] as const).flatMap(
      (chave) => (campo[chave] === undefined ? [] : [[chave, campo[chave]]]),
    ),
  ) as Partial<CampoTipo>;
  return {
    label: campo.label,
    required: campo.required,
    id: campo.id,
    param: campo.param,
    type: campo.type,
    ...opcionais,
  };
}

export function toCamposTipo(dto: CamposTipoApiDto): CamposTipo {
  return { id: dto.id, title: dto.title, layout: dto.layout, campos: dto.campos.map(toCampo) };
}

export function toDriverConfig(dto: DriverConfigApiDto): DriverConfig {
  return {
    labels: dto.LABEL,
    regioes: dto.opcoes.regioes,
    canais: dto.opcoes.canais,
    canaisDefault: dto.opcoes.canaisDefault,
    exportSchema: dto.exportSchema,
    instrucoesModelagem: dto.instrucoes_modelagem,
  };
}
