# Radio Porting Mapping

## A. Public API Mapping

- React source path:
  - `../base-ui/packages/react/src/radio/*`
- Solid target path:
  - `packages/solid/src/radio/*`
- Export names:
  - `Radio` namespace (`Radio.Root`, `Radio.Indicator`)
  - `RadioRootDataAttributes`
  - `RadioIndicatorDataAttributes`
- Prop highlights (`Radio.Root`):
  - `value`
  - `checked`, `defaultChecked`
  - `onCheckedChange`
  - `disabled`, `readOnly`, `required`
  - `name`
  - `inputRef`
  - `nativeButton`
  - `render`
- Prop highlights (`Radio.Indicator`):
  - `keepMounted`
  - `render`

## B. Behavior Mapping

- Group-driven checked state when used under `RadioGroup`.
- Standalone controlled/uncontrolled checked state.
- Hidden radio input is always rendered for form semantics.
- Keyboard behavior:
  - `Enter` is prevented.
  - `Space` selects the radio.
- State data attributes on both `Root` and `Indicator`:
  - `data-checked` / `data-unchecked`
  - `data-disabled`
  - `data-readonly`
  - `data-required`
  - `data-touched`
  - `data-dirty`
  - `data-filled`
  - `data-focused`

## C. Solid Adaptation Notes

- Root/indicator state is shared through required Solid context.
- Advanced composite/roving-focus integration from React source is intentionally deferred until composite infrastructure is ported.
