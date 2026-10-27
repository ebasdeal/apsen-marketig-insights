import { z } from 'zod';

const cor = z.string().regex(/^var\(--(purple|blue|teal|muted)\)$/);

export const perfilDtoSchema = z.object({
  id: z.enum(['admin', 'planejador', 'area', 'viewer']),
  level: z.number().int().min(1).max(4),
  label: z.string().min(1),
  color: cor,
  av: z.string().min(1).max(2),
  user: z.string().min(1),
  dot: cor,
  hint: z.string(),
});

export const perfisResponseSchema = z.array(perfilDtoSchema);

export type PerfilApiDto = z.infer<typeof perfilDtoSchema>;
