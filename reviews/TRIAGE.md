# Review Triage

Date: 2026-03-08

This file records which external review findings are currently accurate against the working tree, which are only partially accurate, and which are outdated.

## High Confidence Valid

- `reviews/avatar/review-report.md`
  - `Avatar.Root` and `Avatar.Fallback` had incomplete HTML prop forwarding and ignored `render`.
  - `Avatar.Image` used ad hoc prop stripping instead of the shared `omitProps` pattern.
  - Status: partially fixed in current tree.
    - `Avatar.Root` now forwards general HTML props and supports `render`.
    - `Avatar.Fallback` now forwards general HTML props and supports `render`.
    - `Avatar.Image` now uses `omitProps`.
  - Still pending:
    - `delay`
    - transition / animation parity

- `reviews/collapsible/review-report.md`
  - The report was correct when written: the initial Solid port had no real panel lifecycle.
  - Status: partially fixed in current tree.
    - `Collapsible.Panel` now has presence/lifecycle handling, `hiddenUntilFound`, and non-static `transitionStatus`.
    - `Collapsible.Trigger` now uses `useButton` and supports `render`.
  - Still pending:
    - richer dimension / animation parity beyond the current minimal lifecycle
    - broader regression coverage around animation-state data attributes

- `reviews/checkbox-group/review-report.md`
  - Parent checkbox logic, `allValues`, and Field/Form integration are genuinely not implemented.
  - Status: valid and still open.

- `reviews/checkbox/review-report.md`
  - Field integration parity is genuinely missing.
  - Indicator transition parity is also missing.
  - Status: valid and still open.

## Partially Valid / Severity Too High

- `reviews/accordion/review-report.md`
  - The report correctly noticed architectural simplifications around transition state.
  - `Accordion` no longer emits the previous owned-scope warning from `AccordionPanel` mount lifecycle.
  - However, some `HIGH` items are overstated for the current tree:
    - `AccordionTrigger` ID sync using `createEffect(source, fn)` is not currently a reproduced bug.
    - `onValueChange` reason difference is now intentional in current Solid tests and code.
  - Status: partially valid.

- `reviews/button/review-report.md`
  - The concern about top-level prop destructuring/reactivity was valid.
  - It was not a demonstrated production bug, but it was a reasonable maintainability issue.
  - Status: fixed in current tree.

## Likely Outdated / Not A Bug

- `reviews/alert-dialog/review-report.md`
  - The claim that `createAlertDialogHandle()` must embed alert-dialog modal config into the handle is not accurate for the current Solid design.
  - In this codebase the handle is only a holder; the actual behavior is injected when `AlertDialogRoot` attaches the dialog store.
  - `AlertDialogRoot` itself still forces `modal={true}`, `role="alertdialog"`, and `disablePointerDismissal={true}`.
  - Status: this specific `HIGH` finding is not considered valid.

## Notes

- Review files that mainly call out missing tests are still useful as parity backlogs, even when their severity labels are too aggressive.
- The most important cross-cutting lesson from the `Menu` work was not captured in the old review reports:
  - child lifetime/ownership bugs caused by overpowered internal children utilities were a larger real risk than some of the component-local findings.
