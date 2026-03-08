# Button Porting Mapping

## A. Public API Mapping

- React source path:
  - `../base-ui/packages/react/src/button/*`
  - `../base-ui/packages/react/src/use-button/*`
- Solid target path:
  - `packages/solid/src/button/*`
  - `packages/solid/src/use-button/*`
- Export names:
  - `Button`
  - `ButtonDataAttributes`
  - `useButton`
- Parts/slots:
  - none
- Prop names and defaults:
  - `disabled?: boolean` default `false`
  - `focusableWhenDisabled?: boolean` default `false`
  - `nativeButton?: boolean` default `true`
  - `native?: boolean` (for `useButton`) default `true`
  - `composite?: boolean` default `false`
  - `tabIndex?: number` default `0`
- Callback signatures and payloads:
  - keep DOM event handler signatures in Solid (`onClick`, `onKeyDown`, `onKeyUp`, `onMouseDown`, `onPointerDown`)

## B. State Model Mapping

- local state:
  - no component-local signal state required for `Button`
- controlled props:
  - none
- uncontrolled defaults:
  - parameter defaults in `useButton`
- derived values:
  - focusability/disabled/aria/tabIndex are derived from parameters
- store usage needed?:
  - no; scalar derivation only

## C. Interaction Mapping

- pointer interactions:
  - disabled state blocks click/mousedown/pointerdown
- keyboard interactions:
  - non-native: `Enter` activates on keydown, `Space` activates on keyup
  - composite + `Space`: activate on keydown
  - text-navigation roles (`menuitem*`, `option`, `gridcell`) keep prevented `Space` behavior
- focus behavior:
  - non-native disabled: `tabIndex=-1` unless `focusableWhenDisabled=true`
  - native disabled + focusable: remove `disabled` attribute and apply `aria-disabled`
- dismiss behavior and reasons:
  - not applicable for `Button`

## D. Accessibility Mapping

- roles:
  - non-native renders `role="button"` by default
- aria attrs:
  - use `aria-disabled` when required by disabled+focusability rules
- labeling relationship:
  - delegated to host element and passed-through props
- disabled/readOnly semantics:
  - `disabled` enforced by DOM attribute for native path when not focusable-disabled mode
  - disabled interaction guard applied in handlers for both paths
- required data attributes:
  - `data-disabled` when disabled

## E. Test Plan Mapping

- controlled tests:
  - not applicable
- uncontrolled tests:
  - default native button behavior
- keyboard tests:
  - non-native `Enter` and `Space`
  - composite `Space` path
- pointer tests:
  - disabled click/pointer/mousedown blocking
- aria/data-state tests:
  - `aria-disabled`, `disabled`, `tabIndex`, `data-disabled`
- callback payload tests:
  - event handler invocation counts for each interaction path

## F. Solid 2 Safety Mapping

- removed APIs checked:
  - no `solid-js/web`
  - no legacy `splitProps`/`mergeProps`; use `omit`/`merge`
- migration script status:
  - pending implementation
- quality script status:
  - pending implementation

## Intentional Non 1:1 Areas

- React `render={<span />}` element-instance contract is adapted to Solid `render="span"` or `render={Component}`.
- React-specific internal event extension (`preventBaseUIHandler`) is not ported.
