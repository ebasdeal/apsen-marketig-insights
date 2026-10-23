#!/usr/bin/env bash
set -uo pipefail

ROOT="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"
cd "$ROOT" || exit 0

if [ "${SKIP_VERIFY_HOOK:-0}" = "1" ]; then
  exit 0
fi

CHANGED=$(git status --porcelain -- src test vitest.config.mts vitest.setup.ts tsconfig.json eslint.config.mjs next.config.ts package.json 2>/dev/null)
if [ -z "$CHANGED" ]; then
  exit 0
fi

REPORT=""
FAILED=0

run_step() {
  local name="$1"
  shift
  local output
  if ! output=$("$@" 2>&1); then
    FAILED=1
    REPORT="${REPORT}
### ${name} falhou
$(printf '%s\n' "$output" | tail -n 40)"
  fi
}

run_step "typecheck" npm run --silent typecheck
run_step "lint" npm run --silent lint
run_step "test:coverage" npm run --silent test:coverage

if [ "$FAILED" -ne 0 ]; then
  printf 'Gates de qualidade do marketing-insights-web falharam. Corrija antes de concluir:%s\n' "$REPORT" >&2
  exit 2
fi

exit 0
