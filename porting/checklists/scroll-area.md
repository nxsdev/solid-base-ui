# Component Porting Checklist: scroll-area

## 1. Scope

- Source: `../base-ui/packages/react/src/scroll-area`
- Target: `packages/solid/src/scroll-area`
- Mapping doc: `porting/scroll-area-mapping.md`
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

- [x] Added item #1: signal-first root/viewport/scrollbar state graph
  - Why required: scroll area needs shared measurement and visibility state across parts.
  - Why Solid-appropriate: accessors and setters keep updates explicit without React store patterns.
- [x] Added item #2: minimal resize-driven thumb recomputation
  - Why required: thumb sizing must react to viewport/content changes.
  - Why Solid-appropriate: uses native `ResizeObserver` in component lifecycle scope.
- [x] Added item #3: CSP-aware inline style injection for scrollbar hiding
  - Why required: parity for nonce/disableStyleElements contract and webkit scrollbar hiding utility.
  - Why Solid-appropriate: uses existing `CSPContext` accessors and a small Solid-native style utility.
- [x] Added item #4: viewport user-interaction gating for scroll-state updates
  - Why required: align `[data-scrolling]` semantics with user-driven scrolling behavior.
  - Why Solid-appropriate: explicit event hooks + timeout in viewport lifecycle without React-specific wrappers.

## Omitted

- [x] Omitted item #1: React-specific `floating-ui-react/utils` helpers
  - Why intentionally omitted: they are React internals and not user-facing API.
  - Why omission is safe: equivalent behavior is implemented directly with DOM APIs.

## Deferred

- [x] Deferred item #1: exact drag/RTL edge-case parity and ResizeObserver timing parity
  - Why deferred now: requires broader cross-browser verification and shared popup/measurement refinements.
  - Owner/next action: add dedicated edge-case tests and harmonize timing behavior with future popup/nav pass.

## 7. Verification

- [x] `pnpm --filter @solid-base-ui/solid test -- 'src/scroll-area/**/*.test.tsx'`
- [x] `pnpm --filter @solid-base-ui/solid typecheck`
- [x] `pnpm --filter @solid-base-ui/solid lint`
- [x] `pnpm --filter @solid-base-ui/solid format`

## 8. Reviewer Notes

- Risk level: medium
- Remaining risks:
  - drag and RTL edge-cases need additional browser-mode coverage.
- Follow-up PRs:
  - tighten thumb drag/RTL edge-case tests and ResizeObserver timing parity.
