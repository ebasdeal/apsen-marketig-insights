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

As fases 7 em diante portam o protótipo do Demand Intelligence (ver `docs/prototipo/`). A dezena indica a onda: 2x Drivers, 3x Administração DI, 4x Acesso e Agentes, 5x Análises, Restrições, Planos, Relatórios e Dashboard. As fases 2–4 (Dashboard de marketing e Campanhas) foram removidas junto com o módulo.

| Fase | Área       | Spec                                                                        | Status      |
| ---- | ---------- | --------------------------------------------------------------------------- | ----------- |
| 1    | platform   | [app-shell-and-theme](platform/app-shell-and-theme.md)                      | DONE        |
| 5    | platform   | [apsen-visual-identity](platform/apsen-visual-identity.md)                  | DONE        |
| 6    | platform   | [ui-kit-base](platform/ui-kit-base.md)                                      | READY       |
| 7    | platform   | [prototipo-plataforma](platform/prototipo-plataforma.md)                    | IN_PROGRESS |
| 8    | platform   | [prototipo-ui-kit](platform/prototipo-ui-kit.md)                            | READY       |
| 9    | platform   | [login](platform/login.md)                                                  | READY       |
| 20   | drivers    | [registrar-driver](drivers/registrar-driver.md)                             | READY       |
| 21   | drivers    | [meus-registros-e-exportar](drivers/meus-registros-e-exportar.md)           | READY       |
| 22   | drivers    | [catalogo-de-produtos](drivers/catalogo-de-produtos.md)                     | READY       |
| 31   | admin      | [ciclos](admin/ciclos.md)                                                   | READY       |
| 32   | admin      | [fontes](admin/fontes.md)                                                   | READY       |
| 33   | admin      | [tipos](admin/tipos.md)                                                     | READY       |
| 34   | admin      | [aprovacoes](admin/aprovacoes.md)                                           | READY       |
| 35   | admin      | [ingeridos](admin/ingeridos.md)                                             | READY       |
| 41   | acesso     | [usuarios-e-perfis](acesso/usuarios-e-perfis.md)                            | READY       |
| 42   | agentes    | [agentes](agentes/agentes.md)                                               | READY       |
| 51   | restricoes | [restricoes](restricoes/restricoes.md)                                      | READY       |
| 52   | planos     | [plano-de-producao](planos/plano-de-producao.md)                            | READY       |
| 53   | analises   | [analises](analises/analises.md)                                            | READY       |
| 54   | relatorios | [relatorios](relatorios/relatorios.md)                                      | READY       |
| 55   | dashboard  | [dashboard-demand-intelligence](dashboard/dashboard-demand-intelligence.md) | READY       |
