import { AUTH_CALLBACK_ROUTE, HOME_ROUTE, LOGIN_ROUTE } from './routes';

export function safeNext(next: string | null | undefined): string {
  if (next === null || next === undefined) {
    return HOME_ROUTE;
  }
  const internal = next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/\\');
  if (!internal || next.startsWith(AUTH_CALLBACK_ROUTE) || next.startsWith(LOGIN_ROUTE)) {
    return HOME_ROUTE;
  }
  return next;
}
