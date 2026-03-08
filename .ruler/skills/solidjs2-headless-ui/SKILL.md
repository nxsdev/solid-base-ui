---
name: solidjs2-headless-ui
description: Implement and review headless UI components for solid-base-ui with SolidJS 2 Beta coding practices. Use when porting behavior from ../base-ui, writing component APIs/parts/state logic, enforcing strict typing, and validating Solid 2 migration-safe code. Triggers: solid2, solid 2 beta, headless ui, base-ui port, component port, context helper, controlled uncontrolled, aria keyboard behavior.
---

# SolidJS 2 Beta Headless UI Coding Skill

This skill is project-specific for `solid-base-ui`.
It is a coding-practice skill, not a doc-link skill.

Primary goal:

- replicate Base UI behavior
- keep Solid-native implementation style
- enforce Solid 2 beta-safe APIs

## Execution Protocol (Mandatory)

When asked to implement or port a component, follow this exact order:

1. Build a mapping sheet from Base UI source and tests.
2. Scaffold files (`Component.tsx`, `Context`, `DataAttributes`, tests, `index`, `index.parts`).
3. Implement types and event payloads first.
4. Implement state/derivation and controlled-uncontrolled behavior.
5. Implement DOM/ARIA contract and keyboard/pointer handlers.
6. Implement focus management and dismiss logic.
7. Write tests from behavior matrix.
8. Run migration and quality checks.

Use `references/porting-mapping-template.md` for Step 1.

## Required Input Before Coding

Read `PORTING_PLAN.md` first and confirm category (port/adapt/do-not-port-1:1).

For each component, inspect:

1. `../base-ui/packages/react/src/<component>/index.ts`
2. `../base-ui/packages/react/src/<component>/index.parts.ts`
3. `../base-ui/packages/react/src/<component>/**/*.test.tsx`
4. `../base-ui/packages/react/src/<component>/**/*.spec.tsx`

Treat React tests as behavior contract and re-express in Solid.

## File Structure Practice

For each component, keep this shape:

- `src/<component>/<Component>.tsx` main logic
- `src/<component>/<ComponentDataAttributes>.ts` data attribute constants
- `src/<component>/<ComponentContext>.ts` typed context if needed
- `src/<component>/<Component>.test.tsx` behavior tests
- `src/<component>/index.ts` public exports
- `src/<component>/index.parts.ts` slot/part exports

Naming rules are project-level and must follow `.ruler/30-naming.md`.

## Coding Style Rules

### 1. State and Derivation

- use `createSignal` for scalar mutable state
- use `createMemo` for derivation
- avoid effect-based derivation
- use store only when nested object updates are necessary

```tsx
const [open, setOpen] = createSignal(false);
const isInteractive = createMemo(() => !props.disabled && !props.readOnly);
```

### 2. Typed Context Helper (Required Pattern)

Always wrap `useContext` with a typed helper.

```tsx
import { createContext, useContext } from "solid-js";

type MenuContextValue = {
  open: () => boolean;
  setOpen: (next: boolean) => void;
};

const MenuContext = createContext<MenuContextValue>();

export function useMenuContext(): MenuContextValue {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error("useMenuContext must be used within <MenuContext> provider.");
  return ctx;
}
```

### 3. Controlled / Uncontrolled Practice

Model controlled logic explicitly.

```tsx
const isControlled = () => props.open !== undefined;
const [localOpen, setLocalOpen] = createSignal(props.defaultOpen ?? false);
const open = () => (props.open !== undefined ? props.open : localOpen());

const setOpen = (next: boolean) => {
  if (!isControlled()) setLocalOpen(next);
  props.onOpenChange?.(next);
};
```

If a cast appears, replace with narrower prop typing instead of keeping cast.

### 4. Effect and Cleanup Practice

- use effects only for side effects
- cleanup must be explicit
- avoid persistent global listeners outside lifecycle

```tsx
createEffect(() => {
  if (!open()) return;
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") setOpen(false);
  };
  window.addEventListener("keydown", onKeyDown);
  onCleanup(() => window.removeEventListener("keydown", onKeyDown));
});
```

### 5. Props and API Surface

- do not widen public props unnecessarily
- keep names compatible with Base UI conceptual model
- preserve slot/part naming consistency
- no `any`
- no assertion-driven design

### 6. Accessibility Behavior

For each component, preserve:

- role and aria state attributes
- keyboard behavior matrix
- disabled/readOnly semantics
- focus entering and focus restoring behavior

Do not ship component if keyboard and aria behavior diverges from contract.

## Control Flow and Async Practices

- use `Show` for binary conditional rendering
- use `For` for list rendering
- use non-keyed list mode where index stability is the behavior contract
- avoid bringing back removed 1.x control flow APIs through wrappers
- treat async loading and error states as explicit UI states

See `references/control-flow-async-practices.md`.

## Context, Lifecycle, Refs, and Events

- keep required context helpers per component family
- keep lifecycle cleanup in the same scope that allocates side effects
- use refs deliberately for focus/measurement, not for bypassing reactivity
- keep keyboard and pointer event semantics centralized
- keep event detail payload types explicit and exported

See `references/lifecycle-events-practices.md`.

## Store and State Mutation Practices

- default to signal + memo
- use store only for nested, multi-key updates
- avoid broad object replacement when targeted updates are clearer
- avoid read-modify-write races across multiple effects

See `references/coding-practices.md`.

## Reactivity and Effects Practices

- keep derivation in `createMemo`
- keep side effects in `createEffect`
- avoid state writes that depend on stale closure values
- isolate non-reactive reads with `untrack` only when dependency tracking must be avoided intentionally
- avoid chained effects where one effect only feeds another

See `references/reactivity-effects-practices.md`.

## Context and Provider Composition Practices

- keep provider value shape stable and explicit
- split context by concern if update frequency differs significantly
- avoid monolithic context objects for unrelated concerns
- throw early for missing providers

See `references/context-provider-practices.md`.

## TypeScript and Public API Practices

- type every exported prop and callback payload
- no `any`
- no double assertions (`as unknown as ...`)
- avoid assertion-driven API design
- keep public API names predictable across components

See `references/typescript-api-practices.md`.

## Store Mutation Practices

- prefer narrow path updates over broad object replacement
- do not mix unrelated concerns in one store subtree
- keep store write paths predictable for testability

See `references/store-practices.md`.

## Solid 2 Beta Guardrails

Use these migration-safe defaults in this repository:

- prefer `@solidjs/web` over `solid-js/web`
- do not add new 1.x-only patterns
- avoid reintroducing removed/legacy APIs through wrappers

Run migration checks:

```bash
bash .ruler/skills/solidjs2-headless-ui/scripts/check-solid2-migration.sh packages
```

## Testing Practice

Use Vitest + `@solidjs/testing-library`.
Prefer behavior checks over implementation detail checks.

Must cover:

- controlled vs uncontrolled
- pointer interaction
- keyboard interaction
- focus and blur transitions
- aria/data-state transitions
- callback detail payload shape

Also cover:

- slot/parts rendering contracts
- DOM attribute state (`data-*`, `aria-*`) transitions
- focus restoration behavior after dismiss
- composition behavior with nested providers/parents

See `references/testing-recipes.md`.

Example:

```tsx
test("calls onOpenChange when toggled", async () => {
  const onOpenChange = vi.fn<(next: boolean) => void>();
  const view = render(() => <MenuTrigger onOpenChange={onOpenChange} />);
  await fireEvent.click(view.getByRole("button"));
  expect(onOpenChange).toHaveBeenCalledWith(true);
});
```

## Anti-Patterns (Reject in Review)

- hook-by-hook React translation without Solid adaptation
- effect-heavy implementation for pure state derivation
- global mutable singleton state for per-instance behavior
- compatibility wrappers for old APIs "just in case"
- adding `any` or unsafe assertions to pass tests
- weakening tests to match broken implementation

## Practical References

- `references/coding-practices.md`: concrete patterns and templates used in this repository
- `references/component-porting-checklist.md`: per-component completion checklist
- `references/control-flow-async-practices.md`: control flow and async rendering practices
- `references/context-provider-practices.md`: context boundaries and provider composition rules
- `references/lifecycle-events-practices.md`: lifecycle, refs, and event handling practices
- `references/porting-mapping-template.md`: required mapping sheet before implementation
- `references/reactivity-effects-practices.md`: reactivity and effect design patterns
- `references/solid2-beta-deltas.md`: Solid 2 migration-focused delta list
- `references/store-practices.md`: store mutation and structure rules
- `references/testing-recipes.md`: behavior-oriented test recipes
- `references/typescript-api-practices.md`: strict typing and public API design practices

## Definition of Done

A component port is done only when all conditions are true:

1. behavior parity with Base UI intent is validated by tests
2. keyboard and aria contracts are covered by tests
3. controlled/uncontrolled behavior is covered by tests
4. no `any` and no assertion-only workaround remains
5. Solid 2 migration check passes

Run checks:

```bash
bash .ruler/skills/solidjs2-headless-ui/scripts/check-solid2-migration.sh packages
bash .ruler/skills/solidjs2-headless-ui/scripts/check-headless-quality.sh packages
```
