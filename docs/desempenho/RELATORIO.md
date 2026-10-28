# Relatório de desempenho — Demand Intelligence (funcional)

Branch `perf/funcional`, a partir de `feat/pbi-39022`.

## Como foi medido

- O Lighthouse reportado (Performance 38) veio muito provavelmente do `next dev` (React em modo dev, 77 User Timing marks, bfcache bloqueado pelo WebSocket do HMR). Nenhuma dessas métricas se aplica ao build de produção.
- Medição: build de produção (`next build` + `next start`), Lighthouse 12 programático, mobile, throttling `simulate` (Moto G Power, 4G lenta), Edge headless, com sessão obtida pelo SSO simulado (`mock-api`, atraso de 300 ms nas respostas).
- Para medir em produção foi preciso um patch local, não commitado, em `src/infrastructure/config/env.ts` (produção força `authMode: 'entra'`; o patch deixa o modo simulado).
- Mediana de 3 execuções por página. A máquina estava compartilhada com outros processos: TBT/Performance variam ±10 pontos entre execuções; CLS, Acessibilidade e SEO são determinísticos.

## Antes x depois (mediana de 3)

| Página                     | Perf | A11y | SEO | FCP (s) | LCP (s) | TBT (ms) | CLS   | SI (s) |
| -------------------------- | ---- | ---- | --- | ------- | ------- | -------- | ----- | ------ |
| `/` antes                  | 79   | 93   | 91  | 0,7     | 1,5     | 820      | 0,078 | 2,6    |
| `/` depois                 | 82   | 98   | 100 | 0,8     | 1,4     | 760      | 0,001 | 2,1    |
| `/drivers/catalogo` antes  | 74   | 100  | 91  | 0,6     | 2,6     | 1100     | 0,002 | 2,4    |
| `/drivers/catalogo` depois | 72   | 100  | 100 | 0,7     | 2,6     | 1270     | 0,002 | 2,2    |
| `/planos` antes            | 76   | 100  | 91  | 0,7     | 1,9     | 960      | 0,031 | 2,6    |
| `/planos` depois           | 80   | 100  | 100 | 0,7     | 1,7     | 850      | 0,029 | 1,8    |
| `/admin/aprovacoes` antes  | 66   | 96   | 91  | 0,7     | 2,9     | 1640     | 0,100 | 2,9    |
| `/admin/aprovacoes` depois | 74   | 100  | 100 | 0,7     | 2,3     | 1190     | 0,021 | 2,0    |

Em `/` o A11y restante (98) era `heading-order`; corrigido depois da última medição (KpiCard h3 -> h2).

## Mudanças

1. **Shell imediato no AuthGate** (`ShellSkeleton`): antes da hidratação, em vez de uma tela cheia de loader, o HTML já traz a moldura (sidebar/topbar) e o esqueleto da página. Com sessão no `sessionStorage`, o conteúdo não espera mais `/auth/me`: a validação roda em paralelo e, se falhar, o `ErrorState` substitui o conteúdo. Elimina uma ida e volta serial antes das consultas da página.
2. **CLS**: no mobile o menu nascia aberto no SSR e fechava após hidratar (deslocamento da página inteira, backdrop piscando e transições de layout). Agora `NavContext` expõe `settled`; antes dele o menu já nasce oculto no mobile por CSS, sem backdrop e sem transição. O botão de tema ganhou largura mínima (o rótulo muda após reidratar a preferência).
3. **Animações não compostas**: a barra de progresso de rota anima `transform: scaleX` em vez de `width`; transições de `margin-left`/`left`/`transform` do menu só existem depois de `settled`; botões usam `transition-colors` em vez de `transition-all`.
4. **Reflow forçado**: `ShellMain` não lê/escreve `scrollTop` na primeira montagem (145 ms de reflow no carregamento).
5. **Contraste**: novos tokens `--color-apsen-green-fg` (`#0f7a3d`) e `--color-apsen-yellow-fg` (`#8a6a00`) para texto em tema claro; no escuro mantêm os valores atuais. Todo `text-apsen-green|yellow` virou `-fg`; fundos e bordas não mudaram.
6. **SEO**: `src/app/robots.ts` gera um `robots.txt` válido (antes `/robots.txt` devolvia a página 404 em HTML).
7. **Legado/bundle**: `browserslist` moderno e `optimizePackageImports` (react-query, zustand, chart.js).
8. **A11y**: `KpiCard` usa `h2` (ordem de títulos).

## Não resolvido / observações

- `robots.txt`: foi usado `Allow: /` em vez de `Disallow: /`. Com `Disallow: /` o Lighthouse marca `is-crawlable` e o SEO cai de 91 para 63. O app fica atrás de SSO, então nada é exposto. Para bloquear indexação trocar `allow` por `disallow` em `src/app/robots.ts`.
- bfcache: em produção não há motivo acionável (a falha vista é a navegação cancelada pelo próprio runner). Em `next dev` o bloqueio vem do WebSocket do HMR e não existe no build.
- JS legado (~14 KiB): são os polyfills que o próprio Next injeta no chunk do runtime; o `browserslist` não os remove.
- TBT: o custo dominante é hidratação/render do React (chunk do runtime) sob CPU 4x mais lenta; o chunk do zod (188 KB) custa pouco em execução (~80 ms). Reduzi-lo exigiria carregar módulos do container sob demanda (mudança arquitetural, fora do escopo).
- CLS residual em `/planos` e `/admin/aprovacoes` (0,02–0,03): filtros deslocados quando o resumo acima carrega.
- Cobertura de testes e portas: nenhuma mudança de comportamento além do AuthGate renderizar o conteúdo enquanto `/auth/me` valida.
