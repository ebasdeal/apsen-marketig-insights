---
status: DRAFT
fase: N
area: area
feature: nome-da-feature
azure-devops-work-item:
---

# Título da feature

## 1. Overview

Objetivo de negócio em 2–4 linhas.

## 2. Critérios de aceite

| ID    | Critério |
| ----- | -------- |
| CA-01 |          |

## 3. UX / Fluxo de tela

- Rota App Router (`src/app/...`) e título (`metadata`).
- Componentes da tela e do UI kit (`@presentation/components/ui`) usados; referência à seção de `docs/design/DESIGN_SPEC.md`.
- Estados: carregando, erro (com "Tentar novamente"), vazio, dados.
- Interações e textos exibidos (pt-BR).

## 4. Contratos de API consumidos

`MÉTODO {NEXT_PUBLIC_API_URL}/caminho` — parâmetros, payload JSON de exemplo, validação Zod, tratamento de erros (404, 5xx, payload inválido).

## 5. Domínio (`src/domain`)

Entidades, value objects, regras, portas e erros de domínio. TypeScript puro.

## 6. Aplicação (`src/application`)

Casos de uso (recebem portas no construtor) e DTOs de entrada/saída.

## 7. Infraestrutura (`src/infrastructure`)

Implementações das portas (HTTP + Zod + mapper, versão em memória com mock).

## 8. Apresentação (`src/presentation`)

Hooks de query (chaves em `queryKeys`), stores Zustand, componentes e tela; registro em `UseCases` e `createContainer`.

## 9. Arquivos

### Novos

- `src/...`

### Modificados

- `src/...` — o que muda

## 10. Regras de negócio

| RN    | Descrição |
| ----- | --------- |
| RN-01 |           |

## 11. BDD — Cenários de teste unitário

| Cenário | Arquivo de teste | Asserção |
| ------- | ---------------- | -------- |
|         |                  |          |
