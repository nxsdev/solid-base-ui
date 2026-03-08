# Component Porting Checklist: menubar

## 1. Scope

- Source: `../base-ui/packages/react/src/menubar`
- Target: `packages/solid/src/menubar`
- Mapping doc: `porting/menubar-mapping.md`
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

- [x] Added item #1: `Menubar.Root` base surface with Solid `CompositeRoot`
  - Why required: unlocks public API surface and roving-focus baseline for menubar triggers.
  - Why Solid-appropriate: reuses existing Solid composite primitives instead of React menu internals.
- [x] Added item #2: `MenubarRootContext` with submenu/open state accessors
  - Why required: future `menu`/`context-menu` parts need a stable parent contract.
  - Why Solid-appropriate: accessor-first context values align with current project patterns.
- [x] Added item #3: interaction-aware submenu open metadata (`interactionType`) + modal scroll lock
  - Why required: touch-open paths should not force modal scroll locking; mouse/keyboard paths should.
  - Why Solid-appropriate: signal-based interaction source and explicit effect cleanup in root lifecycle.

## Omitted

- [x] Omitted item #1: React floating-tree event bus wiring
  - Why intentionally omitted: depends on unported `menu` internals and React floating abstraction.
  - Why omission is safe: current menubar root behavior remains deterministic and testable.

## Deferred

- [x] Deferred item #1: full submenu click/hover behavior parity
  - Why deferred now: requires `menu` family migration.
  - Owner/next action: complete `menu` root/trigger/popup path, then wire menubar open-state events.

## 7. Verification

- [x] `pnpm --filter @solid-base-ui/solid test -- 'src/menubar/**/*.test.tsx'`
- [x] `pnpm --filter @solid-base-ui/solid typecheck`
- [x] `pnpm --filter @solid-base-ui/solid lint`
- [x] `pnpm --filter @solid-base-ui/solid format`

## 8. Reviewer Notes

- Risk level: medium
- Remaining risks:
  - submenu-open switching between sibling menus still depends on future `menu` migration.
- Follow-up PRs:
  - implement `menu` family and connect submenu-open propagation to menubar context.
