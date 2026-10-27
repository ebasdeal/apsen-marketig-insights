# Specs — Spec-Driven Development (SDD)

Toda feature nasce como spec em `docs/specs/{area}/{feature}.md` antes de qualquer código. A spec é o contrato entre quem pede, quem implementa e quem valida.

## Fluxo

```
solicitação ──► spec-writer ──► spec (READY) ──► spec-developer ──► código + testes (IN_PROGRESS → REVIEW)
                                                        ▲                     │
                                                        └──── relatório ◄──── spec-qa ──► DONE
```

| Etapa       | Agente (`.claude/agents/`) | Saída                                                                 |
| ----------- | -------------------------- | --------------------------------------------------------------------- |
| Especificar | `spec-writer`              | `docs/specs/{area}/{feature}.md` com `status: READY`                  |
| Implementar | `spec-developer`           | código nas 4 camadas + testes; `status: REVIEW`                       |
| Validar     | `spec-qa`                  | `status: DONE` ou `docs/specs/{area}/{feature}.qa-{n}.md` com os bugs |

Máximo de 3 ciclos developer ↔ qa; depois disso a spec volta para `BLOCKED` e o humano decide.

## Status

| Status        | Significado                                        |
| ------------- | -------------------------------------------------- |
| `DRAFT`       | Em escrita, ainda com dúvidas abertas              |
| `READY`       | Pronta para implementar                            |
| `IN_PROGRESS` | Em implementação                                   |
| `REVIEW`      | Implementada, aguardando `spec-qa`                 |
| `DONE`        | Validada: critérios de aceite atendidos e gates OK |
| `BLOCKED`     | Impedida (dúvida de negócio, dependência externa)  |

## Convenções

- Arquivo em kebab-case, uma feature por arquivo; `fase` sequencial e única no projeto.
- Siga `docs/specs/_template.md` — nenhuma seção vazia (use "Nenhum").
- Critérios de aceite (`CA-xx`) e regras de negócio (`RN-xx`) numerados; cada um deve ter ao menos um cenário BDD correspondente.
- Visual: telas seguem `docs/design/DESIGN_SPEC.md` (extraído do protótipo Apsen). A spec referencia os componentes do UI kit em vez de redefinir estilo.
- Spec com `status: DONE` só é alterada com autorização; mudança de comportamento gera nova spec (ou nova fase) que referencia a anterior.

## Índice

| Fase | Área      | Spec                                                       | Status |
| ---- | --------- | ---------------------------------------------------------- | ------ |
| 1    | platform  | [app-shell-and-theme](platform/app-shell-and-theme.md)     | DONE   |
| 2    | dashboard | [dashboard-summary](dashboard/dashboard-summary.md)        | DONE   |
| 3    | campaigns | [campaign-list](campaigns/campaign-list.md)                | DONE   |
| 4    | campaigns | [campaign-details](campaigns/campaign-details.md)          | DONE   |
| 5    | platform  | [apsen-visual-identity](platform/apsen-visual-identity.md) | DONE   |
| 6    | platform  | [ui-kit-base](platform/ui-kit-base.md)                     | READY  |
