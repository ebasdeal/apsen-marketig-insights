import { themeInitScript } from '@presentation/theme/themeInitScript';
import { renderToStaticMarkup } from 'react-dom/server';
import RootLayout, { metadata } from '../layout';

const interCalls = vi.hoisted((): unknown[] => []);

vi.mock('next/font/google', () => ({
  Inter: (options: unknown) => {
    interCalls.push(options);
    return { variable: 'font-inter-test', className: 'inter' };
  },
}));

describe('app/layout', () => {
  it('renderiza html pt-BR com script de tema, provedores e conteúdo, sem o shell', () => {
    const html = renderToStaticMarkup(
      <RootLayout>
        <p>página</p>
      </RootLayout>,
    );
    expect(html).toContain('<html lang="pt-BR" class="font-inter-test">');
    expect(html).toContain(themeInitScript.slice(0, 40));
    expect(html).toContain('<body class="font-sans">');
    expect(html).toContain('<p>página</p>');
    expect(html).toContain('aria-label="Notificações"');
    expect(html).not.toContain('aria-label="Menu lateral"');
  });

  it('carrega a Inter com os pesos exatos do protótipo', () => {
    expect(interCalls).toContainEqual({
      subsets: ['latin'],
      weight: ['400', '500', '600', '700'],
      variable: '--font-inter',
      display: 'swap',
    });
  });

  it('define metadados da aplicação', () => {
    expect(metadata.title).toEqual({
      default: 'Demand Intelligence',
      template: '%s · Demand Intelligence',
    });
    expect(metadata.description).toBe('Apsen · Demand Intelligence — Drivers de Demanda.');
  });
});
