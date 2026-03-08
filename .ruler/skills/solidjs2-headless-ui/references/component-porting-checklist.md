# Component Porting Checklist

## 1. Contract Inventory

- Exported components and namespaces identified
- Slot/parts surface identified
- Public props and defaults identified
- Controlled/uncontrolled signatures identified

## 2. Behavior Inventory

- Open/close state transitions mapped
- Selection/focus model mapped
- Keyboard matrix mapped
- Pointer behavior mapped
- Dismissal conditions mapped

## 3. Accessibility Inventory

- Roles and aria attributes mapped
- Labeling relationships mapped
- Disabled state semantics mapped
- Focus management behavior mapped

## 4. Solid Architecture

- Signals only for local scalar state
- Memos for derivations
- Split-form effects for side effects
- Stores only for nested mutable structures
- Context boundaries defined
- Cleanup boundaries defined
- No top-level reactive reads without reactive scope

## 5. Test Coverage Baseline

- Happy path interaction
- Controlled mode
- Uncontrolled mode
- Edge keyboard paths
- Edge pointer paths
- Accessibility assertions
- Flush-sensitive assertions if immediate settle is required

## 6. Quality Gate

- No `any`
- No assertion-only typing workaround
- No unnecessary compatibility wrapper
- No regression from Base UI behavior intent
- Solid 2 beta rename/removal deltas are applied
