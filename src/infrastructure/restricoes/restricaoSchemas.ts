import { z } from 'zod';

const severidade = z.enum(['critica', 'atencao', 'analise']);

export const restricaoDtoSchema = z.object({
  id: z.string().min(1),
  codigo: z.string().min(1).optional(),
  tipo: z.enum(['mp', 'capacidade', 'demanda', 'qualidade', 'regulatorio', 'logistica', 'outro']),
  label: z.string(),
  desc: z.string(),
  det: z.string().default(''),
  produto: z.string().default(''),
  impacto: z.string().default(''),
  impCor: severidade,
  prazo: z.string().default('—'),
  resp: z.string().default(''),
  sev: severidade,
  status: z.enum(['ativa', 'resolvida']),
  obs: z.string().default(''),
  resolucao: z.string().optional(),
});

export const restricaoListSchema = z.array(restricaoDtoSchema);

export type RestricaoDto = z.infer<typeof restricaoDtoSchema>;
