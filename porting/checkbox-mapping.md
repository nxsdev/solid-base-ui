# Checkbox Porting Mapping

## A. Public API Mapping

- React source path:
  - `../base-ui/packages/react/src/checkbox/*`
- Solid target path:
  - `packages/solid/src/checkbox/*`
- Export names:
  - `Checkbox` namespace (`Checkbox.Root`, `Checkbox.Indicator`)
  - `CheckboxRootDataAttributes`
  - `CheckboxIndicatorDataAttributes`
- Prop highlights (`Checkbox.Root`):
  - `checked`, `defaultChecked`
  - `indeterminate`
  - `onCheckedChange`
  - `disabled`, `readOnly`, `required`
  - `name`, `value`, `uncheckedValue`
  - `inputRef`
  - `nativeButton`
  - `render`
- Prop highlights (`Checkbox.Indicator`):
  - `keepMounted`
  - `render`

## B. Behavior Mapping

- Controlled/uncontrolled checked state.
- `onCheckedChange(checked, details)` with cancel support.
- Keyboard activation (`Enter`/`Space`) via `useButton` semantics.
- Hidden checkbox input is always rendered for form semantics.
- Hidden unchecked input is rendered when `name` + `uncheckedValue` are provided while unchecked.
- `indeterminate` drives:
  - `aria-checked="mixed"`
  - `data-indeterminate`
  - suppression of `data-checked` / `data-unchecked`
- State data attributes on both `Root` and `Indicator`:
  - `data-checked` / `data-unchecked`
  - `data-indeterminate`
  - `data-disabled`
  - `data-readonly`
  - `data-required`
  - `data-touched`
  - `data-dirty`
  - `data-filled`
  - `data-focused`

## C. Solid Adaptation Notes

- Root uses `useButton` for non-native button keyboard behavior while preserving checkbox ARIA role/state.
- Root and indicator share state through required Solid context.
- Indicator render policy:
  - default: mounted only when checked or indeterminate
  - `keepMounted=true`: always mounted
- Form/Field/CheckboxGroup integrations from React source are intentionally deferred until those Solid modules are ported.
