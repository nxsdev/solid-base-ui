# Meter Porting Mapping

## A. Public API Mapping

- React source path:
  - `../base-ui/packages/react/src/meter/*`
- Solid target path:
  - `packages/solid/src/meter/*`
- Export names:
  - `Meter` namespace (`Meter.Root`, `Meter.Label`, `Meter.Track`, `Meter.Indicator`, `Meter.Value`)
- Prop highlights (`Meter.Root`):
  - `value`
  - `min`, `max`
  - `format`, `locale`
  - `getAriaValueText`

## B. Behavior Mapping

- Meter semantics:
  - `role="meter"`
  - `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `aria-valuetext`
  - `aria-labelledby` wired from `Meter.Label`
- `Meter.Indicator` width is derived from normalized value percentage.
- `Meter.Value` displays formatted value by default and supports render-function children.

## C. Solid Adaptation Notes

- Shared meter values are provided through `MeterRootContext`.
- `format` handling defaults to percent formatting (`value / 100`) when not explicitly provided.
- Advanced animation/layout behaviors are not needed for headless parity at this stage.
