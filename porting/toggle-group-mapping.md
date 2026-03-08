# ToggleGroup Porting Mapping

## A. Public API Mapping

- React source path:
  - `../base-ui/packages/react/src/toggle-group/*`
- Solid target path:
  - `packages/solid/src/toggle-group/*`
- Export names:
  - `ToggleGroup`
  - `ToggleGroupDataAttributes`
- Prop highlights:
  - `value`, `defaultValue`
  - `onValueChange`
  - `disabled`
  - `orientation`
  - `multiple`
  - `loopFocus` (reserved for future roving focus support)

## B. Behavior Mapping

- Controlled/uncontrolled array state.
- Single and multiple selection modes.
- Group-level disabled propagation through context.
- Group data attributes:
  - `data-disabled`
  - `data-orientation`
  - `data-multiple`

## C. Intentional Non-1:1 Area

- Composite roving-focus keyboard navigation is not yet implemented.
- Current scope covers selection/pressed semantics and context contract.
