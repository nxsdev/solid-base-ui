# types Module Porting Mapping

## A. Public API Mapping

- React source path:
  - `../base-ui/packages/react/src/types/index.ts`
  - `../base-ui/packages/react/src/utils/types.ts` (selected utility types)
- Solid target path:
  - `packages/solid/src/types/index.ts`
- Exported types:
  - `HTMLProps`
  - `ComponentRenderFn`
  - `BaseUIEvent`
  - `BaseUIChangeEventDetails`
  - `BaseUIGenericEventDetails`
  - `Simplify`
  - `RequiredExcept`
  - `Orientation`

## B. Intentional Solid Adaptation

- React `SyntheticEvent` and `ReactElement` references are replaced with DOM `Event` and `JSX.Element`.
- Generic defaults avoid `any` and keep strict type safety.

## C. Follow-up Needed

- As more components are ported, event detail types can be narrowed with reason-specific event mappings.
- Current module shape is sufficient for strict typed API scaffolding and primitive components.
