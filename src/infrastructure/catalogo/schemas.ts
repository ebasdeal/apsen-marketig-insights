import { z } from 'zod';

export const skuSchema = z.object({
  id: z.string().min(1),
  label: z.string(),
  familia: z.string(),
  franquia: z.string(),
});

export const familiaSchema = z.object({
  id: z.string().min(1),
  franquia: z.string().min(1),
  skus: z.array(z.string()),
});

export const franquiaSchema = z.object({
  id: z.string().min(1),
  familias: z.array(z.string()),
});

export const skusSchema = z.array(skuSchema);
export const familiasSchema = z.array(familiaSchema);
export const franquiasSchema = z.array(franquiaSchema);
