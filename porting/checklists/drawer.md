# Component Porting Checklist: drawer

## 1. Scope

- Source: `../base-ui/packages/react/src/drawer`
- Target: `packages/solid/src/drawer`
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

- [x] Added item #1: Drawer public part surface mapped on top of Solid dialog primitives
  - Why required: preserve Base UI drawer composition API and detached trigger usage.
  - Why Solid-appropriate: reuses existing Solid dialog/accessor graph rather than React store cloning.
- [x] Added item #2: Provider/Indent/IndentBackground active visual coordination
  - Why required: Drawer root-level open state must drive app shell styling hooks.
  - Why Solid-appropriate: context + signal store with explicit subscription and cleanup.

## Omitted

- [x] Omitted item #1: React floating/swipe internal architecture
  - Why intentionally omitted: tied to React runtime/lifecycle and not migration target.
  - Why omission is safe: core drawer API and primary open/close/focus semantics are preserved.

## Deferred

- [x] Deferred item #1: full swipe physics/snap interpolation parity
  - Why deferred now: requires shared swipe/floating transition infrastructure not yet ported.
  - Owner/next action: align with popup/navigation motion pass.

## 7. Verification

- [ ] `pnpm --filter @solid-base-ui/solid test -- 'src/drawer/**/*.test.tsx'`
- [ ] `pnpm --filter @solid-base-ui/solid typecheck`
- [ ] `pnpm --filter @solid-base-ui/solid lint`
- [ ] `pnpm --filter @solid-base-ui/solid format:write`

## 8. Reviewer Notes

- Risk level: medium
- Remaining risks:
  - swipe dismissal and snap physics are intentionally partial and tracked as deferred.
- Follow-up PRs:
  - implement full swipe/snap parity and nested swipe propagation.
