import type { DriverRepository } from '@domain/drivers/DriverRepository';
import { NotFoundError } from '@domain/shared/DomainError';

export class DeleteDriver {
  constructor(private readonly drivers: DriverRepository) {}

  async execute(id: string): Promise<void> {
    try {
      await this.drivers.remove(id);
    } catch (error) {
      if (!(error instanceof NotFoundError)) {
        throw error;
      }
    }
  }
}
