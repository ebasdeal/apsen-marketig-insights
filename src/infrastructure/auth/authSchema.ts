import { z } from 'zod';

export const usuarioSessaoSchema = z.object({
  id: z.union([z.string().min(1), z.number().int()]).transform(String),
  nome: z.string().min(1),
  email: z.string().min(1),
  perfil: z.enum(['admin', 'planejador', 'area', 'viewer']),
  perfilLabel: z.string().min(1),
  area: z.string(),
  ativo: z.boolean().default(true),
});

export const tokenResponseSchema = z.object({
  token: z.string().min(1),
  usuario: usuarioSessaoSchema,
});

export const meResponseSchema = z.object({ usuario: usuarioSessaoSchema });
