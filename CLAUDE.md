@AGENTS.md

## Claude Code

- Agentes do projeto em `.claude/agents/`: `spec-writer` → `spec-developer` → `spec-qa` (fluxo SDD de `docs/specs/README.md`).
- Skills: `build-and-test` (gates de qualidade) e `new-spec-feature` (fluxo SDD ponta a ponta).
- O hook `Stop`/`SubagentStop` (`.claude/hooks/verify.sh`) roda typecheck, lint e testes com cobertura quando há mudanças não commitadas; falha bloqueia a conclusão — corrija antes de seguir.
