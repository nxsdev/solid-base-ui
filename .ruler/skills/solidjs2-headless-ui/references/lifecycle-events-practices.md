# Lifecycle, Refs, and Event Practices

## 1. Lifecycle Boundaries

Allocate and cleanup in the same effect/lifecycle scope.

```tsx
createEffect(() => {
  if (!open()) return;
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") close("escape-key");
  };
  window.addEventListener("keydown", onKeyDown);
  onCleanup(() => window.removeEventListener("keydown", onKeyDown));
});
```

## 2. Ref Usage

Use refs for:

- focus management
- geometry measurement
- imperative integration with browser APIs

Do not use refs as a generic state storage replacement.

## 3. Event Handler Design

Keep handlers:

- pure at entry point (read current state once, branch, then mutate)
- typed (`KeyboardEvent`, `PointerEvent`, etc.)
- reason-aware for public callbacks

```tsx
type CloseReason = "escape-key" | "outside-press" | "trigger-click";
type OnOpenChange = (open: boolean, reason: CloseReason) => void;
```

## 4. Keyboard Contracts

Minimum keyboard contract for interactive triggers:

- `Enter` and `Space`: activate
- `Escape`: dismiss current popup/context
- arrow keys: roving navigation where applicable

## 5. Outside Press and Focus Out

Define precedence to prevent flaky behavior:

1. pointer-down outside decision
2. focus transition decision
3. final state commit callback

Keep this order consistent across components.

