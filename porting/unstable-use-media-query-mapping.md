# unstable-use-media-query Porting Mapping

## A. Public API Mapping

- React source path:
  - `../base-ui/packages/react/src/unstable-use-media-query/index.ts`
- Solid target path:
  - `packages/solid/src/unstable-use-media-query/index.ts`
- Export names:
  - `useMediaQuery`
  - `UseMediaQueryOptions`

## B. Intentional Solid Adaptation

- React return type (`boolean`) is adapted to Solid return type (`Accessor<boolean>`).
- Rationale:
  - Solid components do not re-run on hook state updates like React components.
  - Returning an accessor keeps updates reactive without compatibility wrappers.

## C. Behavior Mapping

- query normalization:
  - strips leading `@media`
- fallbacks:
  - `defaultMatches` is used when `matchMedia` is unavailable
- server/client options:
  - `noSsr` and `ssrMatchMedia` follow React semantics
- live updates:
  - listens to `MediaQueryList` change events and updates signal

## D. Solid 2 Safety Mapping

- side effects use split-form `createEffect(compute, effect)`
- cleanup returned from effect callback
- no legacy Solid 1.x APIs
