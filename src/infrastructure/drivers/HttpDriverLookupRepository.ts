import type { Intensidade } from '@domain/drivers/Driver';
import type { DriverLookupRepository } from '@domain/drivers/DriverLookupRepository';
import type {
  CamposTipo,
  Categoria,
  DriverConfig,
  IntensidadeInfo,
  TipoStatus,
} from '@domain/drivers/lookups';
import { z } from 'zod';
import type { HttpClient } from '../http/HttpClient';
import { escapeRegex } from '../shared/escapeRegex';
import { toCamposTipo, toDriverConfig } from './driverMapper';
import { orFallbackOn404, parseResponse, resourcePath } from './parseResponse';
import {
  camposTipoSchema,
  categoriaSchema,
  concorrenteSchema,
  driverConfigSchema,
  intensidadeSchema,
  tipoStatusSchema,
} from './schemas';

const TOTAL_INTENSIDADES = 5;

export class HttpDriverLookupRepository implements DriverLookupRepository {
  constructor(private readonly http: HttpClient) {}

  async listCategorias(): Promise<Categoria[]> {
    return this.read('/categorias', z.array(categoriaSchema));
  }

  async listTipos(): Promise<TipoStatus[]> {
    const tipos = await this.read('/tipos', z.array(tipoStatusSchema));
    return tipos.map(({ slug, ativo, dono }) => ({
      slug,
      ativo,
      ...(dono === undefined ? {} : { dono }),
    }));
  }

  async listCamposTipo(): Promise<CamposTipo[]> {
    return (await this.read('/camposTipo', z.array(camposTipoSchema))).map(toCamposTipo);
  }

  async listIntensidades(): Promise<IntensidadeInfo[]> {
    const intensidades = await this.read(
      '/intensidades',
      z.array(intensidadeSchema).length(TOTAL_INTENSIDADES),
    );
    return intensidades.map((info) => ({ ...info, id: info.id as Intensidade }));
  }

  async getFormConfig(): Promise<DriverConfig> {
    return toDriverConfig(await this.read('/config', driverConfigSchema));
  }

  async searchLaboratorios(termo: string, limit: number): Promise<string[]> {
    const busca = termo.trim();
    const data = await this.http.get('/concorrentes', {
      query: {
        laboratorio_like: busca === '' ? undefined : escapeRegex(busca),
        _limit: String(limit),
      },
    });
    return parseResponse(z.array(concorrenteSchema), data, '/concorrentes').map(
      (concorrente) => concorrente.laboratorio,
    );
  }

  async getMarcas(laboratorio: string): Promise<string[]> {
    const path = resourcePath('concorrentes', laboratorio);
    const data = await orFallbackOn404(this.http.get(path), null);
    return data === null ? [] : parseResponse(concorrenteSchema, data, path).marcas;
  }

  private async read<T extends z.ZodType>(path: string, schema: T): Promise<z.infer<T>> {
    return parseResponse(schema, await this.http.get(path), path);
  }
}
