import type { Driver } from '@domain/drivers/Driver';
import type { DriverRepository } from '@domain/drivers/DriverRepository';
import type { Page, PageRequest } from '@domain/shared/Page';
import type { HttpClient } from '../http/HttpClient';
import { toPageQuery } from '../http/pageQuery';
import { toDriver, toDriverDto } from './driverMapper';
import { orNotFound, parseResponse, resourcePath } from './parseResponse';
import { driverDtoSchema, driversDtoSchema } from './schemas';

const COLLECTION = 'drivers';
const RESOURCE = 'Driver';

export class HttpDriverRepository implements DriverRepository {
  constructor(private readonly http: HttpClient) {}

  async get(id: string): Promise<Driver> {
    const path = resourcePath(COLLECTION, id);
    const data = await orNotFound(this.http.get(path), RESOURCE, id);
    return toDriver(parseResponse(driverDtoSchema, data, path));
  }

  async create(driver: Driver): Promise<Driver> {
    const data = await this.http.post(`/${COLLECTION}`, toDriverDto(driver));
    return toDriver(parseResponse(driverDtoSchema, data, `/${COLLECTION}`));
  }

  async update(driver: Driver): Promise<Driver> {
    const path = resourcePath(COLLECTION, driver.id);
    const data = await orNotFound(this.http.put(path, toDriverDto(driver)), RESOURCE, driver.id);
    return toDriver(parseResponse(driverDtoSchema, data, path));
  }

  async list(request: PageRequest): Promise<Page<Driver>> {
    const { data, total } = await this.http.getPage(`/${COLLECTION}`, {
      query: toPageQuery(request),
    });
    return {
      items: parseResponse(driversDtoSchema, data, `/${COLLECTION}`).map(toDriver),
      total,
      page: request.page,
      limit: request.limit,
    };
  }

  async listAll(): Promise<Driver[]> {
    const data = await this.http.get(`/${COLLECTION}`);
    return parseResponse(driversDtoSchema, data, `/${COLLECTION}`).map(toDriver);
  }

  async remove(id: string): Promise<void> {
    await orNotFound(this.http.delete(resourcePath(COLLECTION, id)), RESOURCE, id);
  }
}
