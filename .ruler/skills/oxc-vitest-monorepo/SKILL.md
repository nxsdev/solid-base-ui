---
name: oxc-vitest-monorepo
description: Set up and maintain pnpm+turborepo monorepo workflows using oxlint, oxfmt, and Vitest with strict TypeScript constraints. Use when adding tooling config, lint/format/test scripts, CI steps, or quality gates for this repository.
---

# OXC + Vitest Monorepo Workflow

Use this skill when editing lint, format, and test workflows in this repository.

## Baseline Decisions

- Package manager: `pnpm`
- Task orchestrator: `turbo`
- Linter: `oxlint`
- Formatter: `oxfmt`
- Test runner: `vitest`

## Required Quality Constraints

- Ban `any` in production code.
- Avoid type assertions used only to bypass typing.
- Keep lint and format deterministic in CI and local runs.

## Recommended File Set

- `.oxlintrc.json`
- `.oxfmt.json`
- `vitest.config.ts` or `vitest.config.mts`
- package-level `package.json` scripts
- root `turbo.json` tasks

## Script Conventions

At root:

- `lint`: run oxlint across workspace
- `lint:fix`: run oxlint with fixes
- `format`: check formatting with oxfmt
- `format:write`: apply formatting with oxfmt
- `test`: run vitest
- `test:watch`: run vitest watch

In packages:

- keep script names aligned with root tasks so `turbo run <task>` works predictably

## OXLint Notes

- Use `.oxlintrc.json` (JSON/JSONC).
- Keep plugin set explicit.
- Add file overrides for test files when needed.
- Keep rule surface minimal at first, then tighten incrementally.

## OXFmt Notes

- Keep options close to project defaults.
- Avoid style churn by pinning key options (`semi`, `singleQuote`, `trailingComma`, `printWidth`).

## Vitest Notes

- Use `jsdom` for fast component behavior checks.
- Add browser-mode coverage only where jsdom is insufficient.
- Prefer interaction-level assertions over implementation internals.

## CI Gate

Order for CI:

1. `pnpm lint`
2. `pnpm format`
3. `pnpm test`
4. `pnpm typecheck` (if defined)

Fail fast on any step.

