# CheckboxGroup Porting Mapping

## A. Public API Mapping

- React source path:
  - `../base-ui/packages/react/src/checkbox-group/*`
- Solid target path:
  - `packages/solid/src/checkbox-group/*`
- Export names:
  - `CheckboxGroup`
  - `CheckboxGroupDataAttributes`
- Prop highlights:
  - `value`, `defaultValue`
  - `onValueChange`
  - `disabled`
  - `render`

## B. Behavior Mapping

- Controlled/uncontrolled array state for selected values.
- `onValueChange(nextValue, details)` with cancel support.
- Group-level disabled state propagated to child `Checkbox.Root`.
- Group root semantics:
  - `role="group"` by default
  - `data-disabled` when disabled

## C. Solid Adaptation Notes

- Group state is shared via `CheckboxGroupContext`.
- `Checkbox.Root` consumes the context and resolves checked state by value membership.
- Parent-checkbox logic (`allValues`/tri-state parent orchestration) from React source is intentionally deferred until advanced checkbox-group parity phase.
