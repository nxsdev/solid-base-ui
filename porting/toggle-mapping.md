# Toggle Porting Mapping

## A. Public API Mapping

- React source path:
  - `../base-ui/packages/react/src/toggle/*`
- Solid target path:
  - `packages/solid/src/toggle/*`
- Export names:
  - `Toggle`
  - `ToggleDataAttributes`
- Prop highlights:
  - `pressed`, `defaultPressed`
  - `onPressedChange`
  - `disabled`
  - `value`
  - `nativeButton`
  - `render`

## B. Behavior Mapping

- Controlled and uncontrolled pressed state.
- `aria-pressed` and `data-pressed` support.
- Disabled state blocks interaction via `useButton`.
- Integrates with `ToggleGroup` context if present.

## C. Solid Adaptation Notes

- Uses `useButton` for keyboard/pointer/disabled semantics.
- Uses `useRender` to preserve `render` API.
