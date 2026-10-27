import { z } from 'zod';

export const agenteDtoSchema = z.object({
  id: z.string().min(1),
  codigo: z
    .string()
    .regex(/^AG-\d{3,}$/)
    .optional(),
  papel: z.string().min(1),
  nome: z.string().optional(),
  fontes: z.string(),
  provedor: z.enum(['azure-foundry', 'anthropic', 'openai']),
  endpoint: z.string(),
  secret: z.string(),
  vault: z.string(),
  modelo: z.string(),
  schedule: z.string(),
  ambiente: z.string(),
  ultimo_teste: z.object({ status: z.enum(['ok', 'falha', 'pendente']), ts: z.string() }),
  ativo: z.boolean(),
  limiar: z.number().int().min(50).max(100).optional(),
});

export const agentesDtoSchema = z.array(agenteDtoSchema);

export type AgenteApiDto = z.infer<typeof agenteDtoSchema>;
