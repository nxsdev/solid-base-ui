# Progress Porting Mapping

## A. Public API Mapping

- React source path:
  - `../base-ui/packages/react/src/progress/*`
- Solid target path:
  - `packages/solid/src/progress/*`
- Export names:
  - `Progress` namespace (`Progress.Root`, `Progress.Label`, `Progress.Track`, `Progress.Indicator`, `Progress.Value`)
  - `ProgressRootDataAttributes`
  - `ProgressLabelDataAttributes`
  - `ProgressTrackDataAttributes`
  - `ProgressIndicatorDataAttributes`
  - `ProgressValueDataAttributes`
- Prop highlights (`Progress.Root`):
  - `value`
  - `min`, `max`
  - `format`, `locale`
  - `getAriaValueText`

## B. Behavior Mapping

- Progress semantics:
  - `role="progressbar"`
  - `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `aria-valuetext`
  - `aria-labelledby` wired from `Progress.Label`
- Status mapping:
  - `value === null` or non-finite -> `indeterminate`
  - `value === max` -> `complete`
  - otherwise -> `progressing`
- Shared status data attributes are forwarded to all parts:
  - `data-indeterminate`
  - `data-progressing`
  - `data-complete`
- `Progress.Indicator` width is derived from normalized percentage only in determinate state.
- `Progress.Value` supports default formatted output and render-function children.

## C. Solid Adaptation Notes

- Root state is provided through required `ProgressRootContext`.
- Formatting defaults to percent style (`value / 100`) when `format` is omitted.
- The hidden presentation span used for screen reader compatibility is preserved in the Solid implementation.
