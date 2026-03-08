# Labelable Provider Porting Mapping

## A. Public API Mapping

- React source path:
  - `../base-ui/packages/react/src/labelable-provider/*`
- Solid target path:
  - `packages/solid/src/labelable-provider/*`
- Export names:
  - `LabelableProvider`
  - `LabelableContext`
  - `useLabelableContext`
- Prop names:
  - `controlId?: string | null`
  - `labelId?: string`

## B. State Model Mapping

- local state:
  - `controlId`, `labelId`, `messageIds` via signals
- registration model:
  - control ids are tracked per source symbol in a map
  - register updates are flushed through `setControlId`
- description model:
  - `getDescriptionProps` merges parent + local message ids into `aria-describedby`

## C. Solid Adaptation Notes

- context value uses accessors and explicit setter functions
- no React lifecycle wrappers or stable-callback wrappers
- id generation uses Solid `createUniqueId` through `useBaseUiId`

## D. Follow-up

- `useLabelableId` / `useAriaLabelledBy` will be added as dependent components are ported
  (`field`, `checkbox`, `radio`, `switch`, `select`, `combobox`).
