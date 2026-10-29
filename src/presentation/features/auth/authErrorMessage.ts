import { isAuthError } from '@domain/auth/AuthErrors';
import { toUserMessage } from '../../format/errorMessage';

export function authErrorMessage(error: unknown): string {
  return isAuthError(error) ? error.message : toUserMessage(error);
}
