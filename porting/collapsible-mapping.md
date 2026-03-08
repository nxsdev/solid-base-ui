# Collapsible Porting Mapping

## A. Public API Mapping

- React source path:
  - `../base-ui/packages/react/src/collapsible/*`
- Solid target path:
  - `packages/solid/src/collapsible/*`
- Export names:
  - `Collapsible` namespace (`Collapsible.Root`, `Collapsible.Trigger`, `Collapsible.Panel`)
  - `CollapsibleTriggerDataAttributes`
  - `CollapsiblePanelDataAttributes`
- Prop highlights:
  - `Collapsible.Root`: `open`, `defaultOpen`, `onOpenChange`, `disabled`
  - `Collapsible.Panel`: `keepMounted`, `hiddenUntilFound`
  - `Collapsible.Trigger`: `nativeButton`

## B. Behavior Mapping

- Controlled/uncontrolled open state.
- Trigger toggles open state and updates:
  - `aria-expanded`
  - `aria-controls`
  - `data-panel-open`
- Panel state attributes:
  - `data-open`
  - `data-closed`
- `keepMounted` keeps panel in DOM while closed and toggles `hidden`.
- `onOpenChange(nextOpen, details)` returns reasoned event details (`trigger-press`) with cancel support.

## C. Solid Adaptation Notes

- CSS transition/animation lifecycle helpers are deferred.
- Transition status is currently fixed to `idle` in state shape for API continuity.
- `hiddenUntilFound` の `beforematch` 連携による自動展開は未対応（属性付与のみ対応）。
- Core accessibility, toggle behavior, and data attributes are implemented with signal-based state.
