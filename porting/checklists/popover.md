# Component Porting Checklist: popover

## 1. Scope

- Source: `../base-ui/packages/react/src/popover`
- Target: `packages/solid/src/popover`
- Mapping doc: `porting/popover-mapping.md`
- Decision log updated: `porting/IMPLEMENTATION_DECISIONS.md`

## 2. Public API Parity

- [x] Export path exists in `packages/solid/package.json`
- [x] Top-level exports wired in `packages/solid/src/index.ts`
- [x] Namespace-style part exports exist (`index.parts.ts`)
- [x] Type exports are complete

## 3. Behavioral Parity

- [x] Controlled/uncontrolled behavior covered by tests
- [ ] Keyboard behavior covered by tests
- [x] Pointer behavior covered by tests
- [x] Focus management covered by tests
- [x] ARIA attributes covered by tests
- [x] Data-state attributes covered by tests

## 4. Form/Field Integration (if applicable)

- [ ] `name`/value propagation is implemented
- [ ] Validation/error integration is tested
- [ ] `disabled` inheritance is tested

## 5. Solid-First Quality Gates

- [x] No React lifecycle emulation wrappers
- [x] No compatibility fallback added only for React internals
- [x] Derived state uses signals/memos, not effect chains
- [x] No `any` and no unsafe assertion chains
- [x] Event detail objects match existing project conventions

## 6. Added / Omitted / Deferred

## Added

- [x] Added item #1: popover public parts and exports
  - Why required: keeps package surface aligned with Base UI public API.
  - Why Solid-appropriate: built on existing Solid dialog state graph and accessors.
- [x] Added item #2: hover open/close support on trigger
  - Why required: covers common popover interaction mode.
  - Why Solid-appropriate: simple timer + signal approach without store emulation.

## Omitted

- [x] Omitted item #1: React floating-ui internal store architecture
  - Why intentionally omitted: architecture is React lifecycle-coupled.
  - Why omission is safe: Solid already has native popup ownership via context + signals.

## Deferred

- [x] Deferred item #1: floating collision/anchor parity and advanced viewport transitions
  - Why deferred now: requires dedicated Solid floating abstraction shared with menu/select.
  - Owner/next action: implement shared floating layer, then migrate popover positioner.

## 7. Verification

- [x] `pnpm --filter @solid-base-ui/solid test -- '<component test glob>'`
- [x] `pnpm --filter @solid-base-ui/solid typecheck`
- [x] `pnpm --filter @solid-base-ui/solid lint`
- [x] `pnpm --filter @solid-base-ui/solid format`

## 8. Reviewer Notes

- Risk level: medium
- Remaining risks: advanced floating/collision semantics are still deferred.
- Follow-up PRs: shared floating abstraction + popover parity completion.
