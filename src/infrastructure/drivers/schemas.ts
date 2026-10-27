import { z } from 'zod';

export const driverDtoSchema = z.object({
  id: z.union([z.string().min(1), z.number().int().positive()]),
  modo: z.enum(['franquia', 'familia', 'sku']),
  produto: z.string(),
  molecula: z.string(),
  codigo: z.string(),
  skus_afetados_ia: z.array(z.string()),
  titulo: z.string(),
  periodo: z.object({ inicio: z.string(), fim: z.string() }),
  tipo: z.string().min(1),
  cobertura: z.object({ regioes: z.array(z.string()), canais: z.array(z.string()) }),
  intensidade_esperada: z.number().int().min(1).max(5),
  uplift_pct: z.number().nullable(),
  verba_rs: z.number().nullable(),
  observacoes: z.string(),
  parametros: z.record(z.string(), z.union([z.string(), z.number()])),
});

export const driversDtoSchema = z.array(driverDtoSchema);

export const categoriaSchema = z.object({
  id: z.number().int().min(0).max(9),
  label: z.string(),
  slug: z.string(),
  tipos: z.array(z.object({ slug: z.string(), label: z.string() })),
});

export const tipoStatusSchema = z.object({
  id: z.string(),
  slug: z.string(),
  ativo: z.boolean(),
});

const campoOptionSchema = z.union([z.string(), z.object({ label: z.string(), group: z.string() })]);

const campoSchema = z
  .object({
    label: z.string().min(1),
    required: z.boolean(),
    id: z.string().startsWith('d_'),
    param: z.string().min(1),
    type: z.enum(['text', 'number', 'date', 'select', 'autocomplete']),
    options: z.array(campoOptionSchema).min(1).optional(),
    placeholder: z.string().optional(),
    step: z.string().optional(),
    readonly: z.boolean().optional(),
    autocomplete: z.enum(['labs', 'marcas']).optional(),
    labelHint: z.string().optional(),
  })
  .refine((campo) => campo.type !== 'select' || campo.options !== undefined, {
    path: ['options'],
  })
  .refine((campo) => campo.type !== 'autocomplete' || campo.autocomplete !== undefined, {
    path: ['autocomplete'],
  });

export const camposTipoSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  layout: z.enum(['g2', 'g3']),
  campos: z.array(campoSchema).min(1),
});

export const intensidadeSchema = z.object({
  id: z.number().int().min(1).max(5),
  label: z.string(),
  faixa: z.string(),
  default: z.number(),
  desc: z.string(),
});

const chipSchema = z.object({ value: z.string(), label: z.string() });

export const driverConfigSchema = z.object({
  LABEL: z.record(z.string(), z.string()),
  opcoes: z.object({
    regioes: z.array(chipSchema),
    canais: z.array(chipSchema),
    canaisDefault: z.array(z.string()),
  }),
  exportSchema: z.string().min(1),
  instrucoes_modelagem: z.array(z.string()).min(1),
});

export const concorrenteSchema = z.object({
  id: z.string(),
  laboratorio: z.string(),
  marcas: z.array(z.string()),
});

export type DriverApiDto = z.infer<typeof driverDtoSchema>;
export type CamposTipoApiDto = z.infer<typeof camposTipoSchema>;
export type DriverConfigApiDto = z.infer<typeof driverConfigSchema>;
