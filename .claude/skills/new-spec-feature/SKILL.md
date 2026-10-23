---
name: new-spec-feature
description: Conduz uma feature nova do marketing-insights-web pelo fluxo SDD completo — spec-writer escreve a spec em docs/specs, spec-developer implementa com testes nas 4 camadas, spec-qa valida e marca DONE (até 3 ciclos). Use quando o usuário pedir uma feature, tela ou integração nova neste projeto.
---

# Nova feature via SDD

1. **Spec** — acione o agente `spec-writer` com a solicitação (texto, história ou work item). Ele cria `docs/specs/{area}/{feature}.md` com `status: READY` e atualiza o índice em `docs/specs/README.md`. Mostre ao usuário o resumo (critérios de aceite, rota, contrato de API) antes de implementar quando houver dúvida de negócio aberta.
2. **Implementação** — acione `spec-developer` com `specFile`. Ordem: domain → application → infrastructure → composição (`UseCases` + `createContainer`) → presentation (hook, store, componentes, tela) → rota em `src/app`. Status vai para `REVIEW`.
3. **QA** — acione `spec-qa` com `specFile` e `qaRound`. Se reprovar, ele gera `docs/specs/{area}/{feature}.qa-{n}.md`; reacione `spec-developer` com `fixReport`. Máximo 3 rodadas, depois `BLOCKED`.
4. **Fechamento** — rode a skill `build-and-test` e reporte ao usuário: arquivos criados/alterados, números de cobertura, status final da spec.

Visual: toda tela segue `docs/design/DESIGN_SPEC.md` e reutiliza `@presentation/components/ui`; componente visual novo entra no UI kit com teste próprio.
