# Control Flow and Async Practices (Solid 2 Beta)

## 1. Conditional Rendering

Prefer explicit fallback paths.

```tsx
<Show when={open()} fallback={<ClosedState />}>
  <OpenState />
</Show>
```

Avoid inline nested ternaries for stateful UI.

## 2. List Rendering

Use `For` for list rendering.
Use keyed or non-keyed mode based on behavior contract, not preference.

```tsx
<For each={items()}>
  {(item) => <ItemRow item={item} />}
</For>
```

When index-stable behavior is required, use non-keyed mode and accessor values.

## 3. Async State Modeling

Represent async state as explicit UI branches:

- pending
- ready
- empty
- errored

Do not hide async transitions behind implicit side effects.

## 4. Popup/Overlay Visibility

For popup-like components:

- render condition and visibility state must be derived from a single source of truth
- state attributes (`data-state`, `aria-expanded`) must update in the same turn as open state
- dismiss flows (`escape`, outside press, blur) must map to explicit reasons

## 5. Error and Loading Boundaries

When boundary semantics are needed, keep fallback components minimal and deterministic.
Do not use boundaries as generic control flow.

