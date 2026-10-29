import { DeleteIngerido } from '@application/ingeridos/DeleteIngerido';
import type { IngeridosUseCases } from '@application/ingeridos/ingeridosUseCases';
import { ListIngeridos } from '@application/ingeridos/ListIngeridos';
import type { HttpClient } from '@infrastructure/http/HttpClient';
import { HttpIngeridoRepository } from '@infrastructure/ingeridos/HttpIngeridoRepository';

export function createIngeridosModule(http: HttpClient): IngeridosUseCases {
  const repository = new HttpIngeridoRepository(http);
  return {
    list: new ListIngeridos(repository),
    remove: new DeleteIngerido(repository),
  };
}
