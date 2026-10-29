import { makeDriver } from '@test/factories/drivers';
import { toDriver, toDriverDto } from '../driverMapper';
import { camposTipoSchema, driverDtoSchema } from '../schemas';
import { DRIVER_API_3 } from './driverApiFixtures';

describe('driverDtoSchema e mapper (contrato)', () => {
  it('aceita id numérico ou texto', () => {
    expect(driverDtoSchema.safeParse(DRIVER_API_3).success).toBe(true);
    expect(driverDtoSchema.safeParse({ ...DRIVER_API_3, id: 'uuid' }).success).toBe(true);
    expect(driverDtoSchema.safeParse({ ...DRIVER_API_3, id: '' }).success).toBe(false);
    expect(driverDtoSchema.safeParse({ ...DRIVER_API_3, id: 0 }).success).toBe(false);
  });

  it('rejeita intensidade fora de 1–5 e modo desconhecido', () => {
    expect(driverDtoSchema.safeParse({ ...DRIVER_API_3, intensidade_esperada: 7 }).success).toBe(
      false,
    );
    expect(driverDtoSchema.safeParse({ ...DRIVER_API_3, modo: 'x' }).success).toBe(false);
  });

  it('ida e volta preservam o driver', () => {
    const driver = makeDriver({ id: 'uuid-1', parametros: { a: '1' } });
    expect(toDriver(driverDtoSchema.parse(toDriverDto(driver)))).toEqual(driver);
  });
});

describe('camposTipoSchema', () => {
  it('aceita tipo sem nenhum campo (não pode quebrar o formulário de driver)', () => {
    expect(
      camposTipoSchema.safeParse({ id: 'novo', title: 'Novo', layout: 'g2', campos: [] }).success,
    ).toBe(true);
  });
});
