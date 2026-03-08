# RadioGroup Porting Mapping

## A. Public API Mapping

- React source path:
  - `../base-ui/packages/react/src/radio-group/*`
- Solid target path:
  - `packages/solid/src/radio-group/*`
- Export names:
  - `RadioGroup`
  - `RadioGroupDataAttributes`
- Prop highlights:
  - `value`, `defaultValue`
  - `onValueChange`
  - `disabled`, `readOnly`, `required`
  - `name`
  - `render`

## B. Behavior Mapping

- Controlled/uncontrolled selected value.
- `onValueChange(nextValue, details)` with cancel support.
- Group-level disabled/readOnly/required state propagated to child `Radio.Root`.
- Group root semantics:
  - `role="radiogroup"` by default
  - `aria-disabled`, `aria-readonly`, `aria-required`
  - `data-disabled`, `data-readonly`, `data-required`

## C. Solid Adaptation Notes

- Shared state is provided via `RadioGroupContext`.
- `Radio.Root` resolves checked state from group value when context exists.
- Advanced composite navigation and field/form integration from React source are deferred until their Solid counterparts are ported.
