# Solid 2 Beta Delta Notes (for this project)

This reference captures migration-relevant deltas from Solid 1.x to Solid 2 beta for `solid-base-ui`.
Use this file as the authoritative baseline when rules in older Solid skills conflict.

## Source Baseline

- Solid release: `v2.0.0-beta.0` (March 3, 2026)
- Official migration docs:
  - https://github.com/solidjs/solid-docs/blob/main/src/routes/solid-2-0-migration/index.mdx
  - https://github.com/solidjs/solid-docs/blob/main/src/routes/solid-2-0-migration/01-core-concepts.mdx
  - https://github.com/solidjs/solid-docs/blob/main/src/routes/solid-2-0-migration/02-signals-derived-state-and-effects.mdx
  - https://github.com/solidjs/solid-docs/blob/main/src/routes/solid-2-0-migration/03-control-flow-and-async-state.mdx
  - https://github.com/solidjs/solid-docs/blob/main/src/routes/solid-2-0-migration/04-stores.mdx
  - https://github.com/solidjs/solid-docs/blob/main/src/routes/solid-2-0-migration/05-component-apis.mdx
  - https://github.com/solidjs/solid-docs/blob/main/src/routes/solid-2-0-migration/06-dom-integration.mdx
  - https://github.com/solidjs/solid-docs/blob/main/src/routes/solid-2-0-migration/07-testing-and-debugging.mdx

## High-Impact Changes

### Imports and Packages

- `solid-js/web` moved to `@solidjs/web`.
- Store APIs are now imported from `solid-js`.
- Some helpers were renamed (`splitProps` -> `omit`, `mergeProps` -> `merge`).
- When migrating component prop plumbing, prefer these official helpers over project-local replacements.

### Reactivity and Effects

- Effects use split form: `createEffect(compute, apply)` where cleanup is returned from `apply`.
- `batch` is removed.
- `flush()` is available when immediate reactive settlement is required.
- Accessing reactive values at component top-level no longer auto-tracks; use reactive scopes.

### Control Flow and Async State

- `Suspense` renamed to `Loading`.
- `ErrorBoundary` renamed to `Errored`.
- `Index` is removed; use `For keyed={false}` and accessor children.
- `createResource` / `useTransition` migration path is async computations + `Loading` and `isPending`.

### Stores

- Draft-style updates are the default store update model.
- `unwrap` becomes `snapshot`.

### Components and DOM

- Context can be provided directly as a component with `value` prop.
- `classList` is replaced by `class` object/array forms.
- `use:` directives are replaced by `ref` directive factories.

### Testing

- When assertions need immediate settled state, call `flush()` before reading DOM.

## Project Rules Based on These Deltas

- Do not port legacy Solid 1.x APIs into new code.
- Do not add compatibility wrappers for removed 1.x APIs.
- When referencing examples, prefer Solid 2 beta semantics even if older snippets exist online.
