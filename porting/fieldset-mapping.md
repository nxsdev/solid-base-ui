# Fieldset Porting Mapping

## A. Public API Mapping

- React source path:
  - `../base-ui/packages/react/src/fieldset/*`
- Solid target path:
  - `packages/solid/src/fieldset/*`
- Export names:
  - `Fieldset` namespace (`Fieldset.Root`, `Fieldset.Legend`)
- Prop highlights (`Fieldset.Root`):
  - `disabled`
  - `aria-labelledby` (auto linked from legend)

## B. Behavior Mapping

- `Fieldset.Root` renders `<fieldset>` and keeps legend association through `aria-labelledby`.
- `Fieldset.Legend` generates an id when absent and registers it on mount.
- Custom `Fieldset.Legend id` is respected for fieldset labeling.
- Disabled state from root is propagated to legend state attribute.

## C. Solid Adaptation Notes

- Shared root data is managed via required `FieldsetRootContext`.
- Legend registration uses `createEffect` + `onCleanup` to keep context state in sync.
- React-specific conformance harness and SSR hydration edge-case tests are deferred in Solid package scope.
