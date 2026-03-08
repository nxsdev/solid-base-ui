# Component Porting Checklist: <component-family>

## 1. Scope

- Source: `../base-ui/packages/react/src/<component-family>`
- Target: `packages/solid/src/<component-family>`
- Mapping doc: `porting/<component-family>-mapping.md`
- Decision log updated: `porting/IMPLEMENTATION_DECISIONS.md`

## 2. Public API Parity

- [ ] Export path exists in `packages/solid/package.json`
- [ ] Top-level exports wired in `packages/solid/src/index.ts`
- [ ] Namespace-style part exports exist (`index.parts.ts`)
- [ ] Type exports are complete

## 3. Behavioral Parity

- [ ] Controlled/uncontrolled behavior covered by tests
- [ ] Keyboard behavior covered by tests
- [ ] Pointer behavior covered by tests
- [ ] Focus management covered by tests
- [ ] ARIA attributes covered by tests
- [ ] Data-state attributes covered by tests

## 4. Form/Field Integration (if applicable)

- [ ] `name`/value propagation is implemented
- [ ] Validation/error integration is tested
- [ ] `disabled` inheritance is tested

## 5. Solid-First Quality Gates

- [ ] No React lifecycle emulation wrappers
- [ ] No compatibility fallback added only for React internals
- [ ] Derived state uses signals/memos, not effect chains
- [ ] No `any` and no unsafe assertion chains
- [ ] Event detail objects match existing project conventions

## 6. Added / Omitted / Deferred

## Added

- [ ] Added item #1: <what>
  - Why required:
  - Why Solid-appropriate:

## Omitted

- [ ] Omitted item #1: <what>
  - Why intentionally omitted:
  - Why omission is safe:

## Deferred

- [ ] Deferred item #1: <what>
  - Why deferred now:
  - Owner/next action:

## 7. Verification

- [ ] `pnpm --filter @solid-base-ui/solid test -- '<component test glob>'`
- [ ] `pnpm --filter @solid-base-ui/solid typecheck`
- [ ] `pnpm --filter @solid-base-ui/solid lint`
- [ ] `pnpm --filter @solid-base-ui/solid format`

## 8. Reviewer Notes

- Risk level: <low|medium|high>
- Remaining risks:
- Follow-up PRs:
