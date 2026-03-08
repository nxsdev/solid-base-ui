# Menubar Mapping (React -> Solid)

## Source

- `../base-ui/packages/react/src/menubar/*`

## Target

- `packages/solid/src/menubar/*`

## Current file mapping

- `Menubar.tsx` -> `root/MenubarRoot.tsx`
- `MenubarContext.ts` -> `root/MenubarRootContext.ts`
- `MenubarDataAttributes.ts` -> `root/MenubarDataAttributes.ts`
- `index.ts` -> `index.ts`

## Implemented in this pass

- `Menubar.Root` public surface and exports
- context contract for future menu integration (`hasSubmenuOpen`, `contentElement`, `rootId`)
- `role="menubar"` with orientation, modal, and submenu state attributes
- composite roving-focus baseline via `CompositeRoot`
- interaction-type-aware submenu state setter in context (`setHasSubmenuOpen(open, interactionType?)`)
- modal scroll-lock behavior while submenu is open, including touch-open bypass
- keyboard/pointer behavior coverage for root-level roving focus and hover highlight gating

## Deferred parity work

- floating-tree event bridge that updates `hasSubmenuOpen` from nested menu open events
- click/hover interop behavior that depends on `menu` family implementation
