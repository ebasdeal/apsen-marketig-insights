import { z } from 'zod';

export const fonteDtoSchema = z.object({
  id: z.string().min(1),
  nome: z.string().min(1),
  icon: z.string(),
  desc: z.string(),
  modo: z.enum(['mock', 'api']),
  url: z.string(),
  auth: z.enum(['none', 'apikey', 'bearer', 'basic']),
  cache: z.number().nonnegative(),
  campos: z.string().optional(),
  mapValor: z.string().optional(),
  mapLabel: z.string().optional(),
  _custom: z.boolean().optional(),
});

export const fonteListSchema = z.array(fonteDtoSchema);

export type FonteApiDto = z.infer<typeof fonteDtoSchema>;
