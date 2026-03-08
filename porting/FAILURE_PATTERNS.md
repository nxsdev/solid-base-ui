# Failure Patterns and Preventive Rules

This file records repeated implementation failures seen during SolidJS 2 Beta porting.
Use it as a pre-implementation checklist.

## 1. Stale state on same-tick sequential interactions

Pattern:

- Two immediate interactions (`click`, `keydown`) read stale signal-derived values.
- Observed in accordion `multiple=true`, where second toggle used outdated open values.

Preventive rule:

- In uncontrolled flows, compute next state from the latest committed local snapshot.
- Do not assume intermediate signal reads are already visible within the same interaction burst.

## 2. Stale DOM node references in roving-focus logic

Pattern:

- Keyboard navigation resolves trigger lists from nodes that are no longer current.
- Focus movement tests pass/fail intermittently.

Preventive rule:

- Resolve active nodes from current DOM at event time.
- Keep child resolution stable when list registration order matters.

## 3. React-style controlled/uncontrolled assumptions copied directly

Pattern:

- Ported logic depends on React-specific update timing/batching behavior.
- Solid implementation becomes longer and less predictable.

Preventive rule:

- Re-derive controlled/uncontrolled logic with Solid signal semantics first.
- Preserve behavior contract, not React internal timing model.

## 4. Missing children render during refactor

Pattern:

- Component returns root element but omits `{props.children}` after prop filtering.

Preventive rule:

- Every structural part (`Root`, `Item`, etc.) must explicitly render children.
- Add a minimal render test for each structural part.

## 5. Context strictness mismatches

Pattern:

- A context is treated as required where optional usage is expected (or vice versa).

Preventive rule:

- Define optional/required context access explicitly.
- Use optional context access for inherited providers (e.g. fieldset-like parent state).

## 6. Overfitting to tests with non-idiomatic workarounds

Pattern:

- Temporary compatibility code is added only to satisfy one failing test.

Preventive rule:

- If a fix cannot be justified as Solid best practice, do not merge it.
- Update tests or architecture, not only surface behavior.

## 7. Tooling/type drift from React defaults

Pattern:

- Editor/TS config drifts to React JSX runtime assumptions (`react/jsx-runtime` errors).

Preventive rule:

- Keep Solid JSX runtime and test typing settings explicit in project config.
- Validate with workspace `typecheck` before broad refactors.

## 8. Solid 1.x API muscle memory in Solid 2 Beta code

Pattern:

- Solid 1.x-style usage is accidentally introduced (e.g. `Context.Provider` usage, one-argument `createEffect`).
- This causes repeated type/runtime errors and rework.

Preventive rule:

- Always use Solid 2 Beta syntax:
  - context provider: `<MyContext value={...}>...</MyContext>`
  - effects: `createEffect(source, callback)` (or `createRenderEffect` where immediate sync is required)
- Keep migration source in rules:
  - `https://github.com/solidjs/solid/blob/next/documentation/solid-2.0/MIGRATION.md`

## 9. Structural children ownership drift

Pattern:

- `props.children` is read directly inside structural boundaries (`Root`, `Item`, `Panel`, etc.).
- Parent state updates recreate the child subtree, making stored DOM refs stale and reordering context/registration work.
- Observed during `Menu`, and reproduced in `Accordion` / `Field` when the shared wrapper was removed entirely.

Preventive rule:

- When a structural component must preserve child subtree identity across parent updates, normalize once with Solid's `children(() => props.children)`.
- This is valid only as a local structural boundary tool, not as a blanket wrapper for every component.
- Do not combine this with `untrack`; freezing resolved children breaks owner/disposal semantics.

## 10. Overpowered internal utilities around children

Pattern:

- A shared internal utility changes child lifetime/ownership semantics, then gets reused broadly because tests happen to pass.
- Later failures appear in unrelated components (`Menu`, `Field`, `Accordion`) and are hard to trace back.

Preventive rule:

- Shared children utilities must stay as thin wrappers over Solid primitives.
- If a helper changes reactivity semantics, do not keep it as a generic internal abstraction.
- Prefer either:
  - direct `{props.children}` when subtree identity does not matter, or
  - a narrowly-scoped `children()` normalization helper for structural boundaries only.

## 11. Delayed DOM listener registration for browser-owned events

Pattern:

- A listener for a browser-driven event (`beforematch`, similar future DOM-driven events) is attached in a later `createEffect`.
- Tests or real browser behavior can fire before the listener is installed, especially when the event is not user-initiated from the current component.

Preventive rule:

- If an event must exist as soon as the element is mounted, attach it from the ref path or an equivalent render-phase synchronization point.
- Use `createRenderEffect` only for the reactive re-sync portion when props controlling the listener can change after mount.
