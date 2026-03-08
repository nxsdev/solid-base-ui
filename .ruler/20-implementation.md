# Implementation Guide

Do not mechanically port React implementations.
Where React and Solid differ, prefer SolidJS 2 Beta best practices.

Avoid `any` by default.
Avoid type assertions used only to force compilation.
Do not implement hacks only to satisfy tests.

Treat this repository as public OSS: prioritize readability, maintainability, and consistency.
Prefer Solid 2 official helpers (`omit`, `merge`) over custom prop-filtering/merging utilities by default.

# Known Repeated Failures (Must Avoid)

1. Same-tick stale state updates
- In uncontrolled state updates, do not rely on intermediate signal reads between rapid interactions.
- Compute next value from the latest committed local state source.

2. Stale node access in keyboard roving/focus logic
- Resolve target elements from current DOM at event time.
- Keep child/list registration stable when index order matters.

3. React-timing assumptions copied into Solid
- Preserve external behavior parity, but re-derive internals for Solid signals.
- Do not emulate React batching/lifecycle behavior unless strictly required by public API.

4. Missing structural children rendering
- Every structural part (`Root`, `Item`, etc.) must explicitly render `children`.

5. Provider/Context design mistakes
- Decide required vs optional context explicitly and encode it in the accessor API.
- Keep context values reactive (`Accessor`/signals), not one-time plain snapshots.
- Always pair registration side effects with cleanup (`onCleanup`) to avoid stale links.
- When context supports list-like updates, prefer updater form (`prev => next`) to avoid race conditions.
- SolidJS 2 Beta context provider syntax is required:
  - NG (old style): `<Theme.Provider value=\"dark\">...</Theme.Provider>`
  - OK (Solid 2): `<Theme value=\"dark\">...</Theme>`
- Never use `.Provider` in this repository.

6. Test-overfit patches
- Do not add workaround code that only satisfies one test but violates Solid best practices.

7. Tooling drift to React defaults
- Keep Solid JSX/runtime assumptions explicit in project config.
- Validate with `typecheck` before and after major refactors.

8. Solid 2 Beta effect API misuse
- Use Solid 2 shape for render effects: `createRenderEffect(source, effectFn, initial?)`.
- Do not replace render-phase synchronization with `createEffect` in component render paths.
- Do not compute a value from a context signal and then write back to the same signal in that computation chain.
- For imperative focus/linking actions, prefer direct element refs when available; treat id-based context values as eventual.

9. Solid lint gate drift
- Keep Solid rules active in `oxlint` (`solid/prefer-for`, `solid/no-destructure`, `solid/no-react-deps`, `solid/no-react-specific-props`).
- If a Solid ESLint rule is unsupported in oxlint JS plugin runtime, do not weaken core rules; document and isolate only that rule.
- `solid/jsx-uses-vars` is currently isolated as `off` because oxlint JS plugin runtime misses `context.markVariableAsUsed`.
- Keep `no-restricted-imports` for Solid 2 migration-sensitive APIs (`solid-js/web`, `solid-js/store`, and legacy imports from `solid-js`).
- Run the Solid 2 migration script in package lint to block `.Provider` old context syntax (except explicit public APIs like `<Drawer.Provider>`) and `onMount`.

10. Structural children ownership drift
- When a structural boundary (`Root`, `Item`, `Panel`, etc.) must preserve subtree identity across parent updates, normalize children once with Solid's `children(() => props.children)`.
- Do not combine structural children normalization with `untrack`.
- Do not add shared helpers that freeze or otherwise alter child ownership semantics.

11. Overpowered internal utilities
- Do not introduce generic internal utilities that change reactivity or ownership semantics just because one component test passes.
- Prefer direct Solid primitives first; add a shared helper only when it stays thin and semantically transparent.
- For prop plumbing, prefer Solid 2 official helpers (`omit`, `merge`) over custom replacements.

12. Delayed DOM listener registration
- Browser-owned events that must exist as soon as an element mounts (for example `beforematch`) must be attached from the ref path or another render-synchronized path.
- Do not defer these listeners to a later passive effect if correctness depends on immediate availability.
