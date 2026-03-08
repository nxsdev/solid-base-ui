# Input Porting Mapping

## A. Public API Mapping

- React source path:
  - `../base-ui/packages/react/src/input/*`
- Solid target path:
  - `packages/solid/src/input/*`
- Export names:
  - `Input`
  - `InputDataAttributes`
- Prop highlights:
  - `value`, `defaultValue`
  - `onValueChange(value, details)`
  - `disabled`
  - `render`

## B. Behavior Mapping

- Supports controlled and uncontrolled value flow.
- Emits `onValueChange` with reason `"none"`.
- Exposes state data attributes:
  - `data-disabled`
  - `data-touched`
  - `data-dirty`
  - `data-filled`
  - `data-focused`

## C. Solid Adaptation Notes

- Implemented as native input primitive, independent from `Field.Control`.
- Inherits `aria-labelledby` from `LabelableProvider` when not explicitly provided.
