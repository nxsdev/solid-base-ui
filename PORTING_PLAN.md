# solid-base-ui Porting Plan (Pre-Implementation)

This file defines what we port, what we adapt, and what we intentionally do not port 1:1 from `../base-ui`.
All implementation work must follow this plan before adding components.

## Decision Log

Implementation-level add/omit rationale is tracked in:

- `porting/IMPLEMENTATION_DECISIONS.md`
- Per-component checklist template: `porting/checklists/_template.md`
- PR template linkage: `.github/PULL_REQUEST_TEMPLATE.md`

When behavior is adapted for Solid, update that file in the same change.

## Scope Baseline

Source scope:

- `../base-ui/packages/react/src/*`
- `../base-ui/packages/utils/src/*`

Target scope:

- `packages/solid/src/*`
- `packages/utils/src/*`

Primary rule:

- preserve behavior and accessibility contracts
- do not preserve React internals

## Decision Matrix

### A. Port with Behavior Parity (Required)

Port all headless component families with parity in:

- public exports
- slot/parts API
- keyboard/pointer/focus behavior
- aria/data-state semantics

Component families:

- accordion
- alert-dialog
- autocomplete
- avatar
- button
- checkbox
- checkbox-group
- collapsible
- combobox
- context-menu
- dialog
- drawer
- field
- fieldset
- form
- input
- menu
- menubar
- meter
- navigation-menu
- number-field
- popover
- preview-card
- progress
- radio
- radio-group
- scroll-area
- select
- separator
- slider
- switch
- tabs
- toast
- toggle
- toggle-group
- toolbar
- tooltip

### B. Port as Public Support APIs (Required, Solid-Style)

These are public/support modules and must exist, but implementation must be Solid-native:

- csp-provider
- direction-provider
- labelable-provider
- types
- merge-props
- use-button
- use-render
- unstable-use-media-query

### C. Re-Implement Architecture (Do Not Port 1:1)

These areas are conceptually required but React implementation must not be copied directly:

- floating-ui-react (replace with Solid-compatible abstraction)
- component-local `store.ts` files (re-evaluate per component with signal-first rule)
- shared utility patterns that are React lifecycle dependent

### D. Do Not Port React-Specific Internals Directly

The following patterns/files from Base UI are not 1:1 migration targets:

- `safeReact.ts`
- `reactVersion.ts`
- `getReactElementRef.ts`
- `useIsoLayoutEffect.ts`
- any helper that exists only to bridge React ref/effect semantics
- any tests that assert React runtime quirks instead of user-facing behavior

If functionality is still needed, create Solid-native replacement with different internals.

## What Is Considered "Not Solid-Like" and Must Be Rejected

- hook-by-hook translation from React without rethinking reactive graph
- effect chains used for derivation
- compatibility wrappers for removed Solid 1.x or React-specific APIs
- forced typing via `any`, `as any`, or `as unknown as`
- API design that mirrors React constraints instead of Solid constraints

## Implementation Order (Mandatory)

1. Foundation utilities
2. Provider/context infrastructure
3. Primitive interactive components
4. Composite components
5. Advanced async/popup/navigation components
6. Final API surface consistency pass

### 1. Foundation Utilities

- create required context helper
- callback/event detail typing patterns
- data-attribute conventions
- migration and quality checks

### 2. Provider/Context Infrastructure

- direction-provider
- csp-provider
- labelable-provider

### 3. Primitive Interactive Components

- button
- input
- checkbox
- radio
- toggle
- switch
- separator

### 4. Composite Components

- field
- fieldset
- form
- checkbox-group
- radio-group
- toggle-group
- meter
- progress
- slider
- number-field

### 5. Advanced Async/Popup/Navigation Components

- popover
- tooltip
- dialog
- alert-dialog
- drawer
- menu
- menubar
- select
- combobox
- autocomplete
- toast
- preview-card
- navigation-menu
- tabs
- toolbar
- scroll-area
- context-menu
- accordion
- collapsible

### 6. Final API Surface Consistency Pass

- export shape checks (`index.ts`, `index.parts.ts`)
- naming conformance with `.ruler/30-naming.md`
- cross-component callback/detail consistency

## Per-Component Gate (Must Pass Before Next Component)

1. porting mapping sheet completed
2. controlled/uncontrolled behavior covered
3. keyboard + pointer + focus behavior covered
4. aria/data-state coverage exists
5. migration check passes
6. quality check passes

Checks:

```bash
bash .ruler/skills/solidjs2-headless-ui/scripts/check-solid2-migration.sh packages
bash .ruler/skills/solidjs2-headless-ui/scripts/check-headless-quality.sh packages
```

## Change Control

If a module is moved between A/B/C/D categories, update this file first, then implement.
