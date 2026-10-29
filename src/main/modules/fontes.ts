import { CreateFonte } from '@application/fontes/CreateFonte';
import { DeleteFonte } from '@application/fontes/DeleteFonte';
import { ListFonteOptions } from '@application/fontes/ListFonteOptions';
import { ListFontes } from '@application/fontes/ListFontes';
import { UpdateFonteConfig } from '@application/fontes/UpdateFonteConfig';
import type { FontesUseCases } from '@application/fontes/fontesUseCases';
import { HttpFonteRepository } from '@infrastructure/fontes/HttpFonteRepository';
import type { HttpClient } from '@infrastructure/http/HttpClient';
import { CryptoIdGenerator } from '@infrastructure/shared/CryptoIdGenerator';

export function createFontesModule(http: HttpClient): FontesUseCases {
  const repository = new HttpFonteRepository(http);
  return {
    list: new ListFontes(repository),
    options: new ListFonteOptions(repository),
    create: new CreateFonte(repository, new CryptoIdGenerator()),
    update: new UpdateFonteConfig(repository),
    remove: new DeleteFonte(repository),
  };
}
