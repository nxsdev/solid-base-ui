# Component Porting Checklist: alert-dialog

## 1. Scope

- Source: `../base-ui/packages/react/src/alert-dialog`
- Target: `packages/solid/src/alert-dialog`
- Mapping doc: n/a (not created yet)
- Decision log updated: `porting/IMPLEMENTATION_DECISIONS.md`

## 2. Public API Parity

- [x] Export path exists in `packages/solid/package.json`
- [x] Top-level exports wired in `packages/solid/src/index.ts`
- [x] Namespace-style part exports exist (`index.parts.ts`)
- [x] Type exports are complete

## 3. Behavioral Parity

- [x] Controlled/uncontrolled behavior covered by tests
- [x] Keyboard behavior covered by tests
- [x] Pointer behavior covered by tests
- [x] Focus management covered by tests
- [x] ARIA attributes covered by tests
- [x] Data-state attributes covered by tests

## 4. Form/Field Integration (if applicable)

- [x] Not applicable

## 5. Solid-First Quality Gates

- [x] No React lifecycle emulation wrappers
- [x] No compatibility fallback added only for React internals
- [x] Derived state uses signals/memos, not effect chains
- [x] No `any` and no unsafe assertion chains
- [x] Event detail objects match existing project conventions

## 6. Added / Omitted / Deferred

## Added

- [x] Added item #1: `AlertDialog.Root` enforces modal + pointer-dismiss disabled
  - Why required: alert dialogs must remain explicit-confirmation surfaces and not close on outside click.
  - Why Solid-appropriate: implemented as fixed props on `DialogRoot`, not a compatibility layer.
- [x] Added item #2: detached handle support via `AlertDialog.createHandle`
  - Why required: parity with Base UI detached trigger workflows.
  - Why Solid-appropriate: reuses signal-backed handle from dialog without wrapper indirection.

## Omitted

- [x] Omitted item #1: separate alert-dialog store class from React
  - Why intentionally omitted: duplicates dialog state logic and is React-internal architecture.
  - Why omission is safe: behavior is preserved by typed `DialogRoot` composition and tests.

## Deferred

- [x] Deferred item #1: transition lifecycle parity beyond open/closed state
  - Why deferred now: depends on shared popup transition infrastructure not ported yet.
  - Owner/next action: align with upcoming popup/nav transition pass.

## 7. Verification

- [x] `pnpm --filter @solid-base-ui/solid test -- 'src/alert-dialog/**/*.test.tsx'`
- [x] `pnpm --filter @solid-base-ui/solid typecheck`
- [x] `pnpm --filter @solid-base-ui/solid lint`
- [x] `pnpm --filter @solid-base-ui/solid format:write`

## 8. Reviewer Notes

- Risk level: low
- Remaining risks:
  - alert-dialog currently inherits dialog transition-state limitations (open/closed only).
- Follow-up PRs:
  - align with future transition state attributes once popup transition infra is ported.
