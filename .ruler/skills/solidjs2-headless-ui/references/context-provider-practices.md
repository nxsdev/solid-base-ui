# Context and Provider Practices

## 1. Keep Context Shape Minimal

Context should expose only required runtime contract.

```tsx
type ListContextValue = {
  activeId: () => string | null;
  setActiveId: (id: string | null) => void;
};
```

Avoid injecting unrelated values just for convenience.

## 2. Use Required Helper Pattern

Always expose a required consumer helper that throws if provider is missing.

```tsx
export function useListContext(): ListContextValue {
  const context = useContext(ListContext);
  if (!context) throw new Error("useListContext must be used within <ListContext>.");
  return context;
}
```

## 3. Split Context by Update Frequency

If one value updates frequently and another is stable, separate contexts to reduce unnecessary recomputation and coupling.

## 4. Provider Composition

If a component requires multiple providers:

- compose providers in explicit order
- document dependencies between providers
- keep nesting shallow where possible

## 5. Testing Context Boundaries

Each context should have tests for:

- missing provider throws
- provider value is consumed correctly
- updates propagate to consumer behavior

