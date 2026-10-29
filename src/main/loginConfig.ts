import { parseLoginEnv, readProcessEnv, type LoginEnv } from '@infrastructure/config/env';

export function readLoginConfig(): LoginEnv {
  return parseLoginEnv(readProcessEnv());
}
