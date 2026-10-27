import { z } from 'zod';

const cssVar = z.string().regex(/^var\(--[a-z-]+\)$/);

export const ingeridoDtoSchema = z.object({
  id: z.string().min(1),
  produto: z.string(),
  sku: z.string(),
  tipo: z.string(),
  badge: z.string().regex(/^db-[a-z]+$/),
  periodo: z.string(),
  feature: z.string(),
  featureCor: cssVar,
  area: z.string(),
  validadoPor: z.string(),
  categoria: z.string(),
  idCor: cssVar,
});

export const ingeridosResponseSchema = z.array(ingeridoDtoSchema);

export type IngeridoApiDto = z.infer<typeof ingeridoDtoSchema>;
