import { z } from 'zod';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const aprovacaoDtoSchema = z.object({
  id: z.string().min(1),
  modo: z.enum(['SKU', 'Molécula']),
  produto: z.string(),
  molecula: z.string(),
  tipo: z.string(),
  cat: z.string(),
  periodo: z.object({ ini: isoDate, fim: isoDate }),
  intensidade: z.number().int().min(1).max(5),
  registrante: z.string(),
  data_reg: isoDate,
  status: z.enum(['pendente', 'aprovado', 'rejeitado']),
  params: z.string(),
  motivo_rejeicao: z.string(),
  justificativa_rejeicao: z.string().optional(),
  driver_id: z.string().optional(),
  titulo: z.string().optional(),
  aprovado_por: z.string().optional(),
  aprovado_em: z.string().optional(),
  rejeitado_por: z.string().optional(),
  rejeitado_em: z.string().optional(),
  reaberto_por: z.string().optional(),
  reaberto_em: z.string().optional(),
});

export const aprovacoesResponseSchema = z.array(aprovacaoDtoSchema);

export const aprovConfigSchema = z.object({ APROV_INGERIDOS: z.array(z.string()) }).passthrough();

export type AprovacaoApiDto = z.infer<typeof aprovacaoDtoSchema>;
