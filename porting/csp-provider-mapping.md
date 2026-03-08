# CSP Provider Porting Mapping

## A. Public API Mapping

- React source path:
  - `../base-ui/packages/react/src/csp-provider/*`
- Solid target path:
  - `packages/solid/src/csp-provider/*`
- Export names:
  - `CSPProvider`
  - `useCSPContext` (internal utility hook)
- Parts/slots:
  - none
- Prop names and defaults:
  - `nonce?: string`
  - `disableStyleElements?: boolean` default `false`

## B. State Model Mapping

- local state:
  - none
- derived values:
  - `nonce` and `disableStyleElements` are memoized accessors from provider props
- store usage needed?:
  - no

## C. Behavior Mapping

- without provider:
  - context returns defaults (`nonce: undefined`, `disableStyleElements: false`)
- with provider:
  - descendants read provider values
- dynamic updates:
  - provider prop updates propagate to descendants

## D. Solid 2 Safety Mapping

- use context component form (`<Context value={...}>`)
- no React hooks or wrappers
- strict typed context value
