# Reactivity and Effects Practices

## 1. Derive First, Effect Later

If a value can be derived from state/props, use memo.
Do not use effect to maintain mirrored state.

```tsx
const selectedCount = createMemo(() => selectedIds().length);
```

## 2. Effect Scope Discipline

Effects are for I/O or imperative side effects:

- DOM listeners
- timers
- external APIs
- measurement/focus side effects

If an effect only computes another value, replace with memo.

## 3. Closure Safety

Avoid stale value writes:

```tsx
setOpen((prev) => !prev);
```

Prefer functional setters when update is based on previous state.

## 4. Avoid Effect Chains

Anti-pattern:

- effect A sets signal X
- effect B depends on X and sets Y
- effect C depends on Y

Prefer one derived graph (memo) + one effect at edge.

## 5. `untrack` Usage

Use `untrack` only for intentional non-tracked reads, such as:

- reading static initial values
- reading previous snapshots for analytics payload

Do not wrap broad component logic in `untrack`.

