# Direction Provider Porting Mapping

## A. Public API Mapping

- React source path:
  - `../base-ui/packages/react/src/direction-provider/*`
- Solid target path:
  - `packages/solid/src/direction-provider/*`
- Export names:
  - `DirectionProvider`
  - `useDirection`
  - `TextDirection`
- Parts/slots:
  - `Provider` via `index.parts.ts`
- Prop names and defaults:
  - `direction?: "ltr" | "rtl"` default `"ltr"`

## B. State Model Mapping

- local state:
  - none
- derived values:
  - direction is derived from provider props via memo accessor
- store usage needed?:
  - no

## C. Behavior Mapping

- without provider:
  - `useDirection()` returns `"ltr"`
- with provider:
  - descendants read provider direction
- dynamic updates:
  - provider prop updates propagate through context accessor

## D. Solid 2 Safety Mapping

- use context component form (`<Context value={...}>`)
- no React memo/lifecycle APIs
- no compatibility wrappers
