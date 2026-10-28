import { z } from 'zod';

const perfilId = z.enum(['admin', 'planejador', 'area', 'viewer']);

export const usuarioDtoSchema = z.object({
  id: z.union([z.string().min(1), z.number().int()]),
  nome: z.string(),
  email: z.string(),
  perfil: perfilId,
  perfilLabel: z.string(),
  area: z.string(),
  podeRegistrar: z.boolean(),
  podeValidar: z.boolean(),
  admin: z.boolean(),
  ultimoAcesso: z.string(),
  ativo: z.boolean(),
  removivel: z.boolean(),
  categorias: z.array(z.string()).optional(),
  alteradoPor: z.string().nullable().optional(),
  alteradoEm: z.string().nullable().optional(),
});

export const usuariosDtoSchema = z.array(usuarioDtoSchema);

export type UsuarioApiDto = z.infer<typeof usuarioDtoSchema>;
