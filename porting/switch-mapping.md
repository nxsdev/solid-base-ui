# Switch Porting Mapping

## A. Public API Mapping

- React source path:
  - `../base-ui/packages/react/src/switch/*`
- Solid target path:
  - `packages/solid/src/switch/*`
- Export names:
  - `Switch` namespace (`Switch.Root`, `Switch.Thumb`)
  - `SwitchRootDataAttributes`
  - `SwitchThumbDataAttributes`
- Prop highlights (`Switch.Root`):
  - `checked`, `defaultChecked`
  - `onCheckedChange`
  - `disabled`, `readOnly`, `required`
  - `name`, `value`, `uncheckedValue`
  - `inputRef`
  - `nativeButton`
  - `render`

## B. Behavior Mapping

- Controlled/uncontrolled checked state.
- `onCheckedChange(checked, details)` with cancel support.
- Keyboard activation (`Enter`/`Space`) with explicit Solid event handling.
- Hidden checkbox input is always rendered for form semantics.
- Hidden unchecked input is rendered when `name` + `uncheckedValue` are provided while unchecked.
- State data attributes on both `Root` and `Thumb`:
  - `data-checked` / `data-unchecked`
  - `data-disabled`
  - `data-readonly`
  - `data-required`
  - `data-touched`
  - `data-dirty`
  - `data-filled`
  - `data-focused`

## C. Solid Adaptation Notes

- Default render target is `span` with non-native button semantics (`nativeButton` default `false`).
- `id` is applied to the hidden input when non-native rendering is used, so explicit `<label for="...">` can toggle the switch.
- Root and thumb share state through a required Solid context.
- `Switch` tests are active (`*.test.tsx`) and pass in the current setup.
- Test runtime uses `packages/solid/src/internal/solid-web-compat.ts` as `solid-js/web` alias to bridge Solid 1 style compiler output from `vite-plugin-solid` with Solid 2 beta runtime.
