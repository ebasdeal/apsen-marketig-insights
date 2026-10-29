---
status: REVIEW
fase: 54
area: relatorios
feature: relatorios
azure-devops-work-item:
---

# Relatórios (placeholder "A definir")

## 1. Overview

Porta a tela `relatorios` do protótipo `docs/Negócio/di-drivers-v2_84.html` (L2778–2804) para `/relatorios`: um card central informando que os relatórios gerenciais ainda serão especificados, com os candidatos listados. O escopo é evolutivo (RN-DSH-02); a tela não tem interação nem dados. Onda 5 (`docs/prototipo/ARQUITETURA.md` §6), nível mínimo 1.

Fase provisória: 54 (onda 5 → 5x); o orquestrador atualiza o índice e pode renumerar.

Decisão: **sem chamada à API**. O texto do protótipo é fixo no HTML; `config.relatorios` no `db.json` só repete esses textos. Buscar `/config` para um texto estático acrescentaria loading/erro a uma tela que não tem dados e não traria comportamento novo. Os textos ficam numa constante da feature.

Dependências: onda 0 (`screens.ts`: tela `relatorios`, nível 1, módulo `relatorios`, crumb "Relatórios"; badge "em breve" com `NavBadge tone="soon"` já é estático e fica com a onda 0).

Perguntas em aberto:

- PO: quais relatórios entram e em que ordem (RN-DSH-02). Candidatos do protótipo: Acurácia do forecast por ciclo · Histórico de drivers por SKU · Painel de restrições resolvidas · Aderência do plano de produção · Comparativo previsto vs. realizado.

## 2. Critérios de aceite

| ID    | Critério                                                                                                                                                                                                         |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CA-01 | `/relatorios` mostra o `PageHeader` "Relatórios" / "Central de relatórios do módulo Demand Intelligence", sem ações.                                                                                             |
| CA-02 | Abaixo, um card central (máx. 560 px) com o ícone 📊, o título "Relatórios — A definir", o texto do protótipo com "**Possíveis candidatos:**" e os 5 candidatos separados por " · ", e o pill "🔜 Em definição". |
| CA-03 | A tela não faz requisição HTTP e não tem estado de carregando, erro ou vazio (conteúdo estático, sempre "dados").                                                                                                |
| CA-04 | Visual fiel nos temas claro e escuro, só com tokens `apsen-*`.                                                                                                                                                   |

## 3. UX / Fluxo de tela

- Rota `src/app/relatorios/page.tsx` (Server Component), `metadata = { title: 'Relatórios' }`, renderiza `<RelatoriosScreen />`. Sem `loading.tsx`/`error.tsx` próprios (não há dados; valem os da raiz).
- `RelatoriosScreen` é Server Component (sem `'use client'`), em `src/presentation/features/relatorios/RelatoriosScreen.tsx`.
- Referências: `docs/design/DESIGN_SPEC.md` §3.7 (PageHeader); nova subseção "Relatórios" em §4.

Estrutura:

1. `PageHeader title="Relatórios" description="Central de relatórios do módulo Demand Intelligence"`.
2. `section aria-labelledby` (card): `mx-auto my-[60px] max-w-[560px] rounded-apsen-lg border border-apsen-border bg-apsen-white px-[32px] py-[40px] text-center` (no protótipo `border-radius:16px` = `rounded-apsen-lg`; padding 40/32).
   - `div aria-hidden mb-[16px] text-[48px]` "📊".
   - `h2 mb-[10px] text-[18px] font-bold text-apsen-slate` "Relatórios — A definir".
   - `p mb-[24px] text-[13.5px] leading-[1.75] text-apsen-muted`: "Esta seção está reservada para os relatórios gerenciais e operacionais do Apsen PLP Agent. Os relatórios serão especificados e priorizados em conjunto com as áreas de Planejamento, S&amp;OP e BI." + `<br /><br />` + `<strong>Possíveis candidatos:</strong>` + " " + `RELATORIOS_CANDIDATOS.join(' · ')` + ".".
   - pill `span inline-block rounded-[20px] border border-apsen-cyan-b bg-apsen-cyan-bg px-[18px] py-[6px] text-[12px] font-bold text-apsen-cyan` "🔜 Em definição".

- Responsivo: em telas estreitas o card ocupa a largura do `main` (`max-w`, sem largura fixa) e `px-[20px]` abaixo de 560 px [derivado].
- Estados: só "dados" (CA-03).

## 4. Contratos de API consumidos

Nenhum.

## 5. Domínio (`src/domain`)

Nenhum.

## 6. Aplicação (`src/application`)

Nenhum.

## 7. Infraestrutura (`src/infrastructure`)

Nenhum.

## 8. Apresentação (`src/presentation`)

- Sem hooks, `queryKeys`, stores, `UseCases` ou mudança em `createContainer`.
- `src/presentation/features/relatorios/relatoriosConteudo.ts`: `RELATORIOS_CANDIDATOS` (os 5 textos, na ordem do protótipo).
- `RELATORIOS_ROUTE = '/relatorios'` em `src/presentation/navigation/routes.ts`.

### Tokens

| Token                   | Claro (protótipo) | Escuro [derivado] | Uso                                                         |
| ----------------------- | ----------------- | ----------------- | ----------------------------------------------------------- |
| `--color-apsen-cyan-bg` | `#e0f2fe`         | `#0c2a33`         | fundo do pill (também o pill de nível Franquia do catálogo) |
| `--color-apsen-cyan-b`  | `#bae6fd`         | `#1d5566`         | borda do pill                                               |

`#0891B2` = `apsen-cyan` (existe). Usar o token da onda 1 com o mesmo valor, se já existir; senão criar nos dois temas e documentar no `DESIGN_SPEC.md`.

## 9. Arquivos

### Novos

- `src/presentation/features/relatorios/RelatoriosScreen.tsx`
- `src/presentation/features/relatorios/relatoriosConteudo.ts`
- `src/presentation/features/relatorios/__tests__/RelatoriosScreen.test.tsx`
- `src/app/relatorios/page.tsx`
- `src/app/relatorios/__tests__/page.test.tsx`

### Modificados

- `src/presentation/navigation/routes.ts` (+ teste) — `RELATORIOS_ROUTE`.
- `src/presentation/navigation/screens.ts` — conferir a tela `relatorios`.
- `src/app/globals.css` (+ `src/app/__tests__/globals.test.ts`) e `docs/design/DESIGN_SPEC.md` — tokens, se faltarem.

## 10. Regras de negócio

| RN    | Descrição                                                                                                                                      |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| RN-01 | O conteúdo é fixo: título, texto, 5 candidatos (ordem do protótipo) e status "🔜 Em definição"; nada vem da API (RN-DSH-02, escopo evolutivo). |
| RN-02 | A tela é acessível a todos os perfis (nível 1).                                                                                                |

## 11. Requisitos não funcionais

| Item (§7) | Aplicação                                                                                                                      |
| --------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 7.1       | Não se aplica (sem lista).                                                                                                     |
| 7.2       | Rota própria do App Router, Server Component, sem JavaScript de cliente além do shell; `loading`/`error` da raiz bastam.       |
| 7.3       | Não se aplica (sem dados).                                                                                                     |
| 7.4       | Não se aplica (sem formulário).                                                                                                |
| 7.5       | `h1` do `PageHeader` e `h2` no card; emoji decorativo `aria-hidden`; contraste do pill nos dois temas; card fluido até 360 px. |
| 7.6       | Sem `console.*`; sem dados pessoais.                                                                                           |

## 12. BDD — Cenários de teste unitário

| Cenário                                                                                               | Arquivo de teste                                                           | Asserção                                                                                                                                                                                                                                                                                                                         |
| ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CA-01 Dado a tela, quando renderiza, então mostra o cabeçalho sem ações                               | `src/presentation/features/relatorios/__tests__/RelatoriosScreen.test.tsx` | `heading` nível 1 "Relatórios"; "Central de relatórios do módulo Demand Intelligence"; nenhum `button`                                                                                                                                                                                                                           |
| CA-02 / RN-01 Dado a tela, quando renderiza, então card, título, candidatos e pill                    | `RelatoriosScreen.test.tsx`                                                | `heading` nível 2 "Relatórios — A definir"; `strong` "Possíveis candidatos:"; texto "Acurácia do forecast por ciclo · Histórico de drivers por SKU · Painel de restrições resolvidas · Aderência do plano de produção · Comparativo previsto vs. realizado."; "🔜 Em definição" com `bg-apsen-cyan-bg`; card com `max-w-[560px]` |
| CA-03 Dado `fetch` espionado, quando renderiza, então nenhuma requisição                              | `RelatoriosScreen.test.tsx`                                                | `vi.spyOn(globalThis, 'fetch')` não chamado; nenhum `status`/`alert`                                                                                                                                                                                                                                                             |
| CA-04 Dado o código da feature, quando lê o fonte, então não há hex nem paleta Tailwind               | `src/app/__tests__/designTokensSource.test.ts` (existente, cobre `src/`)   | passa sem exceção nova                                                                                                                                                                                                                                                                                                           |
| RN-02 Dado `page.tsx`, quando importa, então exporta `metadata.title` "Relatórios" e renderiza a tela | `src/app/relatorios/__tests__/page.test.tsx`                               | `metadata.title`; tela renderizada                                                                                                                                                                                                                                                                                               |
