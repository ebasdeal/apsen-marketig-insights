import type {
  Analise,
  AnalisePatch,
  ConfigModelo,
  InteracaoIa,
  ResultadoMock,
} from '@domain/analises/Analise';
import type { AnaliseApiDto, AnaliseConfigApiDto, ConfigModeloApiDto } from './analiseSchemas';

function toConfigModelo(dto: ConfigModeloApiDto): ConfigModelo {
  return {
    modo: dto.modo,
    ...(dto.modelo === undefined ? {} : { modelo: dto.modelo }),
    ...(dto.horizonte === undefined ? {} : { horizonte: dto.horizonte }),
    ...(dto.parametros === undefined ? {} : { parametros: { ...dto.parametros } }),
  };
}

export function toAnalise(dto: AnaliseApiDto): Analise {
  return {
    id: dto.id,
    codigo: dto.codigo ?? dto.id,
    titulo: dto.titulo,
    ciclo: dto.ciclo,
    tipo: dto.tipo,
    skus: [...dto.skus],
    modelo: dto.modelo,
    status: dto.status,
    criada: dto.criada,
    comentarios: dto.comentarios ?? '',
    drivers: [...(dto.drivers ?? [])],
    configModelo: dto.config_modelo === undefined ? null : toConfigModelo(dto.config_modelo),
    sumario: dto.sumario,
    driversImpacto: dto.drivers_impacto.map((driver) => ({ ...driver })),
    justificativas: [...dto.justificativas],
    modeloInfo: dto.modelo_info,
    historicoIa: dto.historico_ia.map((item) => ({
      pergunta: item.pergunta,
      resposta: item.resposta,
      ts: item.ts ?? null,
    })),
    salvoEm: dto.salvo_em,
    ...(dto.criado_por === undefined ? {} : { criadoPor: dto.criado_por }),
  };
}

function toInteracaoBody(item: InteracaoIa) {
  return {
    pergunta: item.pergunta,
    resposta: item.resposta,
    ...(item.ts === null ? {} : { ts: item.ts }),
  };
}

export function toAnaliseBody(analise: Analise) {
  return {
    id: analise.id,
    codigo: analise.codigo,
    titulo: analise.titulo,
    ciclo: analise.ciclo,
    tipo: analise.tipo,
    skus: [...analise.skus],
    modelo: analise.modelo,
    status: analise.status,
    criada: analise.criada,
    comentarios: analise.comentarios,
    drivers: [...analise.drivers],
    ...(analise.configModelo === null ? {} : { config_modelo: { ...analise.configModelo } }),
    sumario: analise.sumario,
    drivers_impacto: analise.driversImpacto.map((driver) => ({ ...driver })),
    justificativas: [...analise.justificativas],
    modelo_info: analise.modeloInfo,
    historico_ia: analise.historicoIa.map(toInteracaoBody),
    salvo_em: analise.salvoEm,
    ...(analise.criadoPor === undefined ? {} : { criado_por: analise.criadoPor }),
  };
}

export function toAnalisePatchBody(patch: AnalisePatch) {
  return {
    ...(patch.status === undefined ? {} : { status: patch.status }),
    ...(patch.salvoEm === undefined ? {} : { salvo_em: patch.salvoEm }),
    ...(patch.historicoIa === undefined
      ? {}
      : { historico_ia: patch.historicoIa.map(toInteracaoBody) }),
  };
}

export function toResultadoMock(dto: AnaliseConfigApiDto['analiseMockResultado']): ResultadoMock {
  return {
    modelo: dto.modelo,
    sumario: dto.sumario,
    driversImpacto: dto.drivers_impacto.map((driver) => ({ ...driver })),
    justificativas: [...dto.justificativas],
    modeloInfo: dto.modelo_info,
  };
}
