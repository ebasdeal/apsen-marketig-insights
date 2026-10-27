import nextConfig from '../../../next.config';
import { buildContentSecurityPolicy, buildSecurityHeaders } from '../securityHeaders';

function asRecord(entries: { key: string; value: string }[]): Record<string, string> {
  return Object.fromEntries(entries.map((entry) => [entry.key, entry.value]));
}

describe('buildSecurityHeaders', () => {
  it('envia os 5 headers de segurança', () => {
    const headers = asRecord(buildSecurityHeaders({ apiUrl: 'http://localhost:3001', dev: false }));
    expect(Object.keys(headers)).toEqual([
      'Content-Security-Policy',
      'X-Content-Type-Options',
      'Referrer-Policy',
      'X-Frame-Options',
      'Permissions-Policy',
    ]);
    expect(headers['X-Content-Type-Options']).toBe('nosniff');
    expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['X-Frame-Options']).toBe('DENY');
    expect(headers['Permissions-Policy']).toContain('camera=()');
  });

  it('CSP de produção bloqueia frames e objetos e libera a origem da API', () => {
    const csp = buildContentSecurityPolicy({ apiUrl: 'http://localhost:3001/v1/', dev: false });
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("connect-src 'self' http://localhost:3001;");
    expect(csp).toContain("script-src 'self' 'unsafe-inline';");
    expect(csp).not.toContain("'unsafe-eval'");
    expect(csp).not.toContain('ws:');
  });

  it('CSP de desenvolvimento libera eval e websocket do HMR', () => {
    const csp = buildContentSecurityPolicy({ apiUrl: 'http://localhost:3001', dev: true });
    expect(csp).toContain("'unsafe-eval'");
    expect(csp).toContain("connect-src 'self' http://localhost:3001 ws:");
  });

  it('ignora URL de API inválida no connect-src', () => {
    expect(buildContentSecurityPolicy({ apiUrl: 'nada', dev: false })).toContain(
      "connect-src 'self';",
    );
  });
});

describe('next.config', () => {
  it('aplica os headers em todas as rotas', async () => {
    const rules = (await nextConfig.headers?.()) ?? [];
    expect(rules).toHaveLength(1);
    expect(rules[0]?.source).toBe('/:path*');
    expect(asRecord(rules[0]?.headers ?? [])['X-Frame-Options']).toBe('DENY');
    expect(nextConfig.typedRoutes).toBe(true);
  });
});
