import type { DashboardOverview, DashboardRepository } from '@domain/dashboard/DashboardOverview';
import { z } from 'zod';
import { InvalidResponseError, type HttpClient } from '../http/HttpClient';

const contagem = z.number().int().nonnegative();

const dashboardDtoSchema = z.object({
  atualizadoEm: z.string().min(1),
  cicloAtivo: z.object({ id: z.string(), descricao: z.string() }).nullable(),
  pipeline: z.object({ total: contagem, pendentes: contagem }),
  restricoes: z.object({
    ativas: contagem,
    criticas: contagem,
    porTipo: z.array(z.object({ tipo: z.string(), label: z.string(), n: contagem })),
  }),
  plano: z.object({
    total: contagem,
    aprovados: contagem,
    porStatus: z.object({
      aprovado: contagem,
      revisao: contagem,
      bloqueado: contagem,
      pendente: contagem,
    }),
  }),
  analises: z.object({ total: contagem, salvas: contagem }),
  driversPorCategoria: z.array(z.object({ categoria: z.string(), label: z.string(), n: contagem })),
  aguardandoAprovacao: z.object({
    total: contagem,
    itens: z.array(z.object({ id: z.string(), produto: z.string(), tipo: z.string() })),
  }),
});

export class HttpDashboardRepository implements DashboardRepository {
  constructor(private readonly http: HttpClient) {}

  async overview(): Promise<DashboardOverview> {
    const result = dashboardDtoSchema.safeParse(await this.http.get('/dashboard'));
    if (!result.success) {
      throw new InvalidResponseError('Resposta de /dashboard fora do contrato');
    }
    const dto = result.data;
    return {
      atualizadoEm: dto.atualizadoEm,
      cicloAtivo: dto.cicloAtivo,
      pipeline: dto.pipeline,
      restricoes: {
        ativas: dto.restricoes.ativas,
        criticas: dto.restricoes.criticas,
        porTipo: dto.restricoes.porTipo.map(({ tipo, label, n }) => ({ chave: tipo, label, n })),
      },
      plano: dto.plano,
      analises: dto.analises,
      driversPorCategoria: dto.driversPorCategoria.map(({ categoria, label, n }) => ({
        chave: categoria,
        label,
        n,
      })),
      aguardandoAprovacao: dto.aguardandoAprovacao,
    };
  }
}
