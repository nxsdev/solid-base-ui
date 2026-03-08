# Popover Mapping (React -> Solid)

## Source

- `../base-ui/packages/react/src/popover/*`

## Target

- `packages/solid/src/popover/*`

## Current file mapping

- `root/PopoverRoot.tsx` -> `root/PopoverRoot.tsx`
- `trigger/PopoverTrigger.tsx` -> `trigger/PopoverTrigger.tsx`
- `positioner/PopoverPositioner.tsx` -> `positioner/PopoverPositioner.tsx`
- `popup/PopoverPopup.tsx` -> `popup/PopoverPopup.tsx`
- `arrow/PopoverArrow.tsx` -> `arrow/PopoverArrow.tsx`
- `close/title/description/backdrop/portal/viewport` -> delegated to existing solid `dialog` parts

## Deferred parity work

- floating-ui-based position computation and collision middleware parity
- hover patient-click threshold behavior parity
- full viewport transition state parity
