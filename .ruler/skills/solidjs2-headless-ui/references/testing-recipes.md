# Testing Recipes (Vitest + Solid Testing Library)

## 1. Controlled vs Uncontrolled Recipe

Test both paths explicitly:

- uncontrolled: local state changes UI
- controlled: callback fires and parent-driven prop changes UI

## 2. Keyboard Recipe

For trigger + popup components:

1. trigger focus
2. key press (`Enter`/`Space`)
3. assert open state and aria attrs
4. press `Escape`
5. assert closed state and focus restoration

## 3. Pointer Recipe

1. click trigger
2. assert open
3. click outside
4. assert dismiss reason and closed state

## 4. Data Attribute Recipe

Assert transitions:

- `data-state="closed"` -> `"open"` -> `"closed"`
- component-specific flags (`data-disabled`, etc.)

## 5. Callback Payload Recipe

Assert payloads with strict values:

```tsx
expect(onOpenChange).toHaveBeenCalledWith(true, { reason: "trigger-click" });
```

## 6. Provider Boundary Recipe

Assert missing provider throws with deterministic message.

