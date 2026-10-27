import type { CreateFonte } from './CreateFonte';
import type { DeleteFonte } from './DeleteFonte';
import type { ListFonteOptions } from './ListFonteOptions';
import type { ListFontes } from './ListFontes';
import type { UpdateFonteConfig } from './UpdateFonteConfig';

export interface FontesUseCases {
  list: Pick<ListFontes, 'execute'>;
  options: Pick<ListFonteOptions, 'execute'>;
  create: Pick<CreateFonte, 'execute'>;
  update: Pick<UpdateFonteConfig, 'execute'>;
  remove: Pick<DeleteFonte, 'execute'>;
}
