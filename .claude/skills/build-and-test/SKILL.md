---
name: build-and-test
description: Roda os gates de qualidade do marketing-insights-web (typecheck, lint com regras de camadas, testes Vitest com cobertura mínima de 90%, build Next e Prettier). Use antes de declarar qualquer feature, correção ou refatoração como concluída, e sempre que houver dúvida se uma mudança quebrou algo.
---

# Build & Test — marketing-insights-web

Uma mudança só está pronta quando **todos** os comandos abaixo passam, rodados por você nesta sessão. O hook `Stop`/`SubagentStop` (`.claude/hooks/verify.sh`) roda typecheck, lint e cobertura automaticamente quando há mudanças não commitadas; esta skill cobre também build e formatação.

## Comandos (na raiz do projeto)

```bash
npm run typecheck       # next typegen && tsc --noEmit — inclui typedRoutes
npm run lint            # ESLint + eslint-plugin-boundaries (direção das camadas)
npm run test:coverage   # Vitest; falha abaixo de 90% em statements/branches/functions/lines
npm run build           # next build (sem NEXT_PUBLIC_API_URL usa o repositório mock)
npm run format:check    # Prettier
```

Durante o desenvolvimento, rode só o que mudou: `npx vitest run src/presentation/features/<feature>` e `npx eslint <paths>`.

## Lendo falhas

| Sintoma                                       | Causa provável                                                                                 |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `boundaries/dependencies`                     | Import na direção errada (ex.: `presentation` → `infrastructure`). Injete via `UseCases`.      |
| `no-restricted-imports` em domain/application | React/Next/Zod/Zustand/TanStack em camada pura. Mova para infrastructure/presentation.         |
| `TS2820` em `href`                            | Rota inexistente para `typedRoutes`; use `presentation/navigation/routes.ts`.                  |
| `ERROR: Coverage for branches (...)`          | Falta cenário (erro, vazio, `null` → "—"). Escreva teste; não adicione exclusões de cobertura. |
| Erro de hidratação no build/dev               | Componente com hook sem `'use client'`, ou valor diferente entre servidor e cliente.           |
| `params` sem `await`                          | Next 16: `params` da página é `Promise`.                                                       |

## Regras

- Nunca reporte "concluído" sem colar o resumo real de cada comando (incluindo as 4 métricas de cobertura).
- Não use `--no-verify`, `vitest --coverage.enabled=false` ou exclusões novas em `vitest.config.mts` para passar no gate.
- Para pular o hook pontualmente (ex.: trabalho só em docs), exporte `SKIP_VERIFY_HOOK=1`.
