# AGENTS.md — marketing-insights-web

Aplicação web Next.js 16 (App Router) + React 19 + TypeScript strict, com TanStack Query 5, Zustand 5, Tailwind CSS 4 e Zod 4. Testes com Vitest 5 + Testing Library. Documentação e comunicação em pt-BR. Código sem comentários.

## Antes de mexer

- Leia o `README.md` (arquitetura, estrutura de pastas, rotas, contrato HTTP, passo a passo de feature).
- O Next.js muda a cada versão: consulte `node_modules/next/dist/docs/` ou `https://nextjs.org/docs` em vez de confiar na memória (ex.: `params` é uma `Promise` nas páginas).
- Não adicione dependências sem necessidade.

## Spec-Driven Development

- Toda feature nasce como spec em `docs/specs/{area}/{feature}.md` (modelo em `docs/specs/_template.md`, fluxo e status em `docs/specs/README.md`). Leia a spec antes de mexer na feature; feature nova → escreva a spec primeiro.
- Fluxo com os agentes de `.claude/agents/`: `spec-writer` (spec `READY`) → `spec-developer` (código + testes, `REVIEW`) → `spec-qa` (`DONE` ou relatório `*.qa-{n}.md`, até 3 rodadas). A skill `new-spec-feature` conduz o ciclo inteiro.
- Cada critério de aceite (`CA-xx`) e regra de negócio (`RN-xx`) precisa de ao menos um teste que o prove.

## Design system

- O visual segue o protótipo Apsen Demand Intelligence; a fonte da verdade no repositório é `docs/design/DESIGN_SPEC.md` (tokens, shell, UI kit, telas e checklist de fidelidade).
- Tokens ficam no `@theme` de `src/app/globals.css`; não use cores hex soltas nos componentes. Componente visual novo entra em `components/ui` com teste.

## Regras de arquitetura (verificadas pelo lint)

- `src/domain` não importa nada fora de `src/domain` nem libs de UI/IO (React, Next, Zod, Zustand, TanStack).
- `src/application` importa só `domain` e também é puro.
- `src/infrastructure` importa só `domain` (implementa as portas).
- `src/presentation` importa `application`, `domain` e `presentation`; recebe casos de uso via `useUseCases()` e nunca importa `infrastructure`.
- `src/main` compõe tudo; `src/app` (rotas App Router) importa só `main`, `presentation` e `app`, e só renderiza telas.

## Convenções de código

- Features em `src/presentation/features/<feature>/` (tela + `components/`); componentes reutilizáveis em `components/ui` (importe de `@presentation/components/ui`); shell da aplicação em `components/layout`.
- Componentes pequenos (até ~120 linhas) e com uma responsabilidade; derivação/formatação em funções puras (`presentation/format`); rotas reutilizáveis em `presentation/navigation/routes.ts`.
- Componentes interativos ou que usam hooks começam com `'use client'`. Páginas em `src/app` são Server Components finos que exportam `metadata`.
- Navegação com `next/link` e `next/navigation` (`typedRoutes` ativo).
- Estilo só com Tailwind. O tema escuro vem da redefinição dos tokens `apsen-*` em `html.dark` (`globals.css`); use `dark:` só quando um token não resolve (ex.: inverter o logo). Use as utilities de `src/app/globals.css` (`focus-ring`, `surface`, `field-focus`, `page-title`, `page-sub`, `kpi-grid`, `state-block`) em vez de repetir classes; classe repetida em mais de um componente vira utility ou componente do UI kit.
- Sem `any`, sem `console`, `import type` inline, sem comentários.
- Aliases: `@domain`, `@application`, `@infrastructure`, `@presentation`, `@main`, `@test`.

## Testes

- Em `__tests__/` ao lado do código; use `renderWithProviders`, `createFakeUseCases` e as factories de `@test/*`.
- `next/navigation` já é mockado em `vitest.setup.ts`; use `routerMock` e `navigationState` de `@test/nextNavigation`.
- Cubra loading, erro (com "Tentar novamente"), vazio, dados e interações; prefira queries por role/nome acessível.

## Comandos obrigatórios antes de concluir

```bash
npm run typecheck       # next typegen && tsc --noEmit
npm run lint
npm run test:coverage   # mínimo 90% global nas 4 métricas
npm run build
npm run format:check
```

A skill `build-and-test` documenta esses gates e como ler as falhas. No Claude Code, o hook `.claude/hooks/verify.sh` (`Stop`/`SubagentStop`) roda typecheck, lint e cobertura automaticamente quando há mudanças em código.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
