import { z } from 'zod';

export const permissaoDtoSchema = z.object({
  id: z.union([z.string(), z.number()]),
  grupo: z.string(),
  funcionalidade: z.string(),
  viewer: z.string(),
  area: z.string(),
  planejador: z.string(),
  admin: z.string(),
});

export const permissoesDtoSchema = z.array(permissaoDtoSchema);
