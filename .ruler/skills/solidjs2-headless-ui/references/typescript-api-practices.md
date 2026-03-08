# TypeScript and Public API Practices

## 1. Public Props Discipline

- exported props must be explicit types
- callback payloads must be explicit exported types
- avoid `Record<string, unknown>` for primary public surface unless truly open-ended

## 2. Controlled/Uncontrolled Typing

Use discriminated or clear optional model and keep transitions explicit.
Do not rely on casts to force narrowing.

## 3. Data Attributes and State Tokens

Centralize state token strings in `as const` objects.

```ts
export const menuState = {
  open: "open",
  closed: "closed"
} as const;

export type MenuState = (typeof menuState)[keyof typeof menuState];
```

## 4. Event Detail Types

Expose reason enums as string unions.
Avoid untyped `object` payloads.

```ts
export type OpenReason = "trigger-click" | "escape-key" | "outside-press";
```

## 5. Forbidden Typing Patterns

- `any`
- `as any`
- `as unknown as X`
- opaque `Function` types for callbacks

## 6. Preferred Typing Patterns

- generic helpers with constrained type parameters
- narrow unions for variant props
- readonly arrays/objects where mutation is not required

