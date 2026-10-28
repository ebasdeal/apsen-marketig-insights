import { z } from 'zod';

const catSlug = z.enum([
  'midia',
  'comercial',
  'produto',
  'supply',
  'logistica',
  'concorrencia',
  'regulatorio',
  'sazo',
  'social',
  'macro',
]);

export const tipoDtoSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  label: z.string(),
  cat: catSlug,
  catL: z.string(),
  dono: z.string(),
  feature: z.string(),
  lag: z.number().int(),
  params: z.number().int().nonnegative(),
  ativo: z.boolean(),
  desc: z.string().optional(),
  impacto: z.string().optional(),
  perm: z.string().optional(),
  nota: z.string().optional(),
  alteradoPor: z.string().optional(),
  alteradoEm: z.string().optional(),
});

const opcao = z.union([z.string(), z.object({ label: z.string(), group: z.string() })]);

export const campoDtoSchema = z
  .object({
    label: z.string(),
    required: z.boolean(),
    id: z.string(),
    param: z.string(),
    type: z.enum(['text', 'number', 'date', 'select', 'autocomplete']),
    options: z.array(opcao).optional(),
    placeholder: z.string().optional(),
    step: z.union([z.string(), z.number()]).optional(),
    readonly: z.boolean().optional(),
    autocomplete: z.enum(['labs', 'marcas']).optional(),
    labelHint: z.string().optional(),
    fonte: z.string().optional(),
  })
  .passthrough();

export const camposTipoDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  layout: z.enum(['g2', 'g3']),
  campos: z.array(campoDtoSchema),
});

export const categoriaDtoSchema = z.object({
  id: z.number().int(),
  label: z.string(),
  slug: catSlug,
  labelTipoForm: z.string(),
  tipos: z.array(z.object({ slug: z.string(), label: z.string() })),
});

export const tiposResponseSchema = z.array(tipoDtoSchema);

export const categoriasResponseSchema = z.array(categoriaDtoSchema);

export type TipoApiDto = z.infer<typeof tipoDtoSchema>;

export type CampoApiDto = z.infer<typeof campoDtoSchema>;

export type CamposTipoApiDto = z.infer<typeof camposTipoDtoSchema>;

export type CategoriaApiDto = z.infer<typeof categoriaDtoSchema>;
