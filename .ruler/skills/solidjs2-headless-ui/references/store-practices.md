# Store Practices

## 1. When to Use Store

Use store only when all are true:

- nested data model
- multi-key updates in one interaction
- path updates increase clarity

Otherwise use signal + memo.

## 2. Mutation Strategy

Prefer narrow updates:

```tsx
setState("items", index, "selected", true);
```

Avoid replacing large objects when one field changes.

## 3. Store Domain Boundaries

Keep unrelated concerns separated:

- selection state
- popup visibility
- focus state

Do not merge all into one deep store tree.

## 4. Derived Values from Store

Do not store derived values as mutable state unless necessary for external side effects.
Derive with memo from source state.

## 5. Testability

Every store write path should map to user-observable behavior covered in tests.

