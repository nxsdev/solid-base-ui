# Component Porting Checklist: dialog

## 1. Scope

- Source: `../base-ui/packages/react/src/dialog`
- Target: `packages/solid/src/dialog`
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

- [x] Added item #1: detached trigger handle support (`Dialog.createHandle` + `Dialog.Trigger handle`)
  - Why required: needed for Base UI-equivalent detached trigger composition.
  - Why Solid-appropriate: implemented with signal-backed handle store, no React ref-store bridge.
- [x] Added item #2: outside/escape dismissal and focus return
  - Why required: core dialog accessibility and interaction semantics.
  - Why Solid-appropriate: implemented with explicit document listeners + signal state transitions.

## Omitted

- [x] Omitted item #1: React floating-ui store architecture
  - Why intentionally omitted: React-specific internals are not migration targets.
  - Why omission is safe: user-visible dialog behaviors are covered by Solid-native state and tests.

## Deferred

- [x] Deferred item #1: animation lifecycle parity (`startingStyle`/`endingStyle` transitions)
  - Why deferred now: transition engine for popup stack is not ported yet.
  - Owner/next action: align with future popup/nav transition pass.

## 7. Verification

- [x] `pnpm --filter @solid-base-ui/solid test -- 'src/dialog/**/*.test.tsx'`
- [x] `pnpm --filter @solid-base-ui/solid typecheck`
- [x] `pnpm --filter @solid-base-ui/solid lint`
- [x] `pnpm --filter @solid-base-ui/solid format:write`

## 8. Reviewer Notes

- Risk level: medium
- Remaining risks:
  - detached trigger hookup is signal-driven and verified by tests, but should be re-validated when additional popup stack internals are ported.
  - transition-state data attributes are currently open/closed only.
- Follow-up PRs:
  - align dialog transition statuses with future popup transition infrastructure.
