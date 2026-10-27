import { z } from 'zod';

export const planoItemDtoSchema = z.object({
  id: z.string().min(1),
  codigo: z.string().min(1).optional(),
  sku: z.string(),
  nome: z.string(),
  apres: z.string().default(''),
  familia: z.string().default(''),
  qtd: z.number().int().nonnegative(),
  linha: z.string(),
  semana: z.string(),
  status: z.enum(['aprovado', 'revisao', 'bloqueado', 'pendente']),
  resp: z.string().default(''),
  obs: z.string().default(''),
});

export const planoItemListSchema = z.array(planoItemDtoSchema);

export const skuMetaDtoSchema = z.object({
  id: z.string(),
  nome: z.string(),
  apres: z.string(),
  familia: z.string(),
});

export const skuMetaListSchema = z.array(skuMetaDtoSchema);

export const cicloResumoListSchema = z.array(
  z.object({ id: z.string().min(1), status: z.string() }),
);

export type PlanoItemDto = z.infer<typeof planoItemDtoSchema>;
