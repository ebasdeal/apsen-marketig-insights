import type { Page, PageRequest } from '../shared/Page';
import type { Driver } from './Driver';

export interface DriverRepository {
  get(id: string): Promise<Driver>;
  create(driver: Driver): Promise<Driver>;
  update(driver: Driver): Promise<Driver>;
  list(request: PageRequest): Promise<Page<Driver>>;
  listAll(): Promise<Driver[]>;
  remove(id: string): Promise<void>;
}
