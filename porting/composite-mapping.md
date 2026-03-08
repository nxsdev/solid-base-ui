# composite mapping (React -> Solid 2 beta)

## Source

- `../base-ui/packages/react/src/composite/*`
- `../base-ui/packages/react/src/floating-ui-react/utils/composite.ts`

## Target

- `packages/solid/src/composite/composite.ts`
- `packages/solid/src/composite/constants.ts`
- `packages/solid/src/composite/list/*`
- `packages/solid/src/composite/root/*`
- `packages/solid/src/composite/item/*`

## Ported

- Keyboard navigation primitives (`Arrow`, `Home`, `End`, grid navigation helpers)
- `CompositeList` registration and DOM-order indexing
- `CompositeRoot` controlled/uncontrolled highlighted index
- `CompositeItem` roving tab index and hover highlight behavior
- `CompositeRootContext` relay API (`relayKeyboardEvent`)

## Solid-specific adaptations

- React ref objects were replaced with Solid-friendly mutable objects and callbacks.
- Event handlers are DOM-native and typed with Solid `JSX` attributes.
- Rendering uses `useRender` and `render` override pattern used in this repo.

## Deferred

- Metadata generic typing parity is intentionally simplified to `Record<string, unknown>`.
- React conformance-only tests were not copied.
- Advanced row/virtualized scenarios beyond current `CompositeRoot.test.tsx` coverage remain for later components that require them.
