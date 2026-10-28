import { z } from 'zod';

const driverImpacto = z.object({
  id: z.string(),
  tipo: z.string(),
  impacto: z.number(),
  dir: z.enum(['up', 'down']),
  conf: z.number(),
});

const interacao = z.object({
  pergunta: z.string(),
  resposta: z.string(),
  ts: z.string().optional(),
});

const configModelo = z.object({
  modo: z.enum(['auto', 'guiado', 'avancado']),
  modelo: z.string().optional(),
  horizonte: z.number().int().optional(),
  parametros: z.record(z.string(), z.union([z.number(), z.boolean()])).optional(),
});

export const analiseDtoSchema = z.object({
  id: z.string().min(1),
  codigo: z.string().optional(),
  titulo: z.string(),
  ciclo: z.string(),
  tipo: z.string(),
  skus: z.array(z.string()),
  modelo: z.string(),
  status: z.enum(['rascunho', 'salva', 'relatorio']),
  criada: z.string(),
  comentarios: z.string().optional(),
  drivers: z.array(z.string()).optional(),
  config_modelo: configModelo.optional(),
  sumario: z.string().default(''),
  drivers_impacto: z.array(driverImpacto).default([]),
  justificativas: z.array(z.string()).default([]),
  modelo_info: z.string().default(''),
  historico_ia: z.array(interacao).default([]),
  salvo_em: z.string().nullable().default(null),
  criado_por: z.string().optional(),
});

export const analisesDtoSchema = z.array(analiseDtoSchema);

export const maiorCodigoDtoSchema = z.array(z.object({ codigo: z.string().optional() }));

export const skusCicloDtoSchema = z.object({
  id: z.string(),
  skus: z.array(
    z.object({
      codigo: z.string(),
      nome: z.string(),
      familia: z.string(),
      dias: z.number().default(0),
    }),
  ),
});

export const modeloGuiadoDtoSchema = z.object({
  id: z.string(),
  nome: z.string(),
  icon: z.string(),
  desc: z.string(),
  tag: z.string(),
});

export const modelosGuiadosDtoSchema = z.array(modeloGuiadoDtoSchema);

export const analiseConfigDtoSchema = z.object({
  analiseMockResultado: z.object({
    modelo: z.string(),
    sumario: z.string(),
    drivers_impacto: z.array(driverImpacto),
    justificativas: z.array(z.string()),
    modelo_info: z.string(),
  }),
  chatRespostas: z.array(z.object({ gatilhos: z.array(z.string()), resposta: z.string() })).min(1),
});

export type AnaliseApiDto = z.infer<typeof analiseDtoSchema>;

export type AnaliseConfigApiDto = z.infer<typeof analiseConfigDtoSchema>;

export type ConfigModeloApiDto = z.infer<typeof configModelo>;
