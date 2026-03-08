# SolidJS 2 Beta Coding Practices for solid-base-ui

## 1. Component Template

Use this baseline shape for new components.

```tsx
type ComponentProps = {
  disabled?: boolean;
  onValueChange?: (value: string) => void;
};

export function Example(props: ComponentProps) {
  const [value, setValue] = createSignal("");
  const interactive = createMemo(() => !props.disabled);

  const handleInput = (event: InputEvent) => {
    if (!interactive()) return;
    const next = (event.currentTarget as HTMLInputElement).value;
    setValue(next);
    props.onValueChange?.(next);
  };

  return (
    <input
      value={value()}
      disabled={props.disabled}
      aria-disabled={props.disabled ? "true" : undefined}
      onInput={handleInput}
      data-state={interactive() ? "enabled" : "disabled"}
    />
  );
}
```

## 2. Typed Required Context Pattern

```tsx
type Ctx = { activeId: () => string | null; setActiveId: (id: string | null) => void };
const Ctx = createContext<Ctx>();

export function useRequiredCtx(): Ctx {
  const value = useContext(Ctx);
  if (!value) throw new Error("useRequiredCtx must be used within provider.");
  return value;
}
```

## 3. Event Detail Pattern

Keep event payload types explicit.

```tsx
export type OpenChangeDetails = {
  reason: "trigger-click" | "escape-key" | "outside-press";
};

export type OnOpenChange = (open: boolean, details: OpenChangeDetails) => void;
```

## 4. Data Attribute Pattern

Centralize data-state and variant attrs.

```ts
export const triggerDataAttributes = {
  open: "data-open",
  closed: "data-closed",
  disabled: "data-disabled"
} as const;
```

## 5. Keyboard Matrix Pattern

For interactive components, test at minimum:

- `Enter` and `Space` for trigger
- `Escape` for dismiss
- `Arrow` keys when list-like navigation exists
- `Tab` behavior for focus leaving/retaining

## 6. Focus Management Pattern

- preserve active item after non-destructive updates
- avoid focus jumps during state sync
- restore focus to trigger on close when behavior contract requires it

## 7. Store Usage Criteria

Prefer signal first.
Use store only if all of these are true:

- nested mutable structure is needed
- multiple keys are updated per interaction
- path-level updates improve clarity

If none apply, do not use store.

## 8. Review Gate (Per PR)

- no `any`
- no assertion-only type workaround
- no untracked keyboard behavior
- no missing aria states
- no missing controlled/uncontrolled tests

