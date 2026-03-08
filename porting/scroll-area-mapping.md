# Scroll Area Mapping (React -> Solid)

## Source

- `../base-ui/packages/react/src/scroll-area/*`

## Target

- `packages/solid/src/scroll-area/*`

## Current file mapping

- `root/ScrollAreaRoot.tsx` -> `root/ScrollAreaRoot.tsx`
- `viewport/ScrollAreaViewport.tsx` -> `viewport/ScrollAreaViewport.tsx`
- `scrollbar/ScrollAreaScrollbar.tsx` -> `scrollbar/ScrollAreaScrollbar.tsx`
- `thumb/ScrollAreaThumb.tsx` -> `thumb/ScrollAreaThumb.tsx`
- `content/ScrollAreaContent.tsx` -> `content/ScrollAreaContent.tsx`
- `corner/ScrollAreaCorner.tsx` -> `corner/ScrollAreaCorner.tsx`
- `utils/getOffset.ts`, `utils/scrollEdges.ts`, `constants.ts` -> same names in Solid

## Implemented in this pass

- public parts and exports (`Root`, `Viewport`, `Scrollbar`, `Thumb`, `Content`, `Corner`)
- signal-based root state/context (`scrolling`, overflow edges, thumb/corner sizes)
- viewport overflow measurement + thumb sizing + overflow data attributes
- scrollbar orientation-specific state and track click/wheel handling
- CSP-aware inline style injection for scrollbar hiding (`styleDisableScrollbar`)
- viewport scrollbar-hiding class parity (`base-ui-disable-scrollbar`)
- viewport interaction parity for scroll-state tracking (`role`, `data-id`, focusable tabIndex, user-vs-programmatic scroll)

## Deferred parity work

- advanced pointer/RTL edge-case parity for thumb drag behavior
- exact ResizeObserver timing parity with Base UI
