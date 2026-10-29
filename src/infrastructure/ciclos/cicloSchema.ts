import { z } from 'zod';

const CODIGO = /^PLP-\d{4}-\d{2}$/;

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const cicloDtoSchema = z
  .object({
    id: z.string().min(1),
    codigo: z.string().regex(CODIGO).optional(),
    descricao: z.string(),
    meta: z.string(),
    inicio: isoDate,
    fim: isoDate,
    periodo: z.string(),
    drivers: z.number().int().nonnegative(),
    responsavel: z.string(),
    status: z.enum(['ativo', 'encerrado', 'rascunho']),
    versao: z.number().int().positive(),
  })
  .refine((dto) => dto.codigo !== undefined || CODIGO.test(dto.id), {
    message: 'Ciclo sem código e com id fora do padrão PLP-AAAA-MM',
    path: ['codigo'],
  });

export const cicloListSchema = z.array(cicloDtoSchema);

export type CicloApiDto = z.infer<typeof cicloDtoSchema>;
