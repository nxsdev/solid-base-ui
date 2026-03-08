# Separator Porting Mapping

## A. Public API Mapping

- React source path:
  - `../base-ui/packages/react/src/separator/*`
- Solid target path:
  - `packages/solid/src/separator/*`
- Export names:
  - `Separator`
- Parts/slots:
  - none
- Prop names and defaults:
  - `orientation?: "horizontal" | "vertical"` default `"horizontal"`
  - `render?: ValidComponent`

## B. State Model Mapping

- local state:
  - none
- derived values:
  - orientation attribute from props
- store usage needed?:
  - no

## C. Accessibility Mapping

- role:
  - always `role="separator"`
- aria:
  - always `aria-orientation={orientation}`

## D. Interaction Mapping

- no keyboard/pointer interaction logic
- purely semantic rendering contract

## E. Solid 2 Safety Mapping

- render with `Dynamic` from `@solidjs/web`
- avoid `role` prop override by omitting `role` from public props
