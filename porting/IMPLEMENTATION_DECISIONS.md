# Solid Porting Implementation Decisions

This is a living log of **what we intentionally added**, **what we intentionally omitted**, and **why each choice is Solid-first and not React-compat driven**.

Use this file as a quality gate before introducing new compatibility layers.

## Decision Rules

- Preserve behavior and accessibility contracts, not React internals.
- Prefer signal-first derivation over effect chains.
- Avoid React-shaped wrappers/fallbacks unless they are required for public API parity.
- Use `createEffect` as default for side effects; use `createRenderEffect` only when render-phase synchronization is required for immediate DOM/ARIA consistency.
- Use `pureWrite` only for signal writes that are intentionally imperative (e.g. DOM ref sinks and render-phase registration signals); do not use it for ordinary state flow.
- No `any`, no unsafe assertion chains.
- If a React-only mechanism has no Solid equivalent, document the omission explicitly.
- Repeated failure patterns are tracked in `porting/FAILURE_PATTERNS.md`.

## Global Additions (Cross-cutting)

- `internal/omitProps.ts`
  - Why: avoids leaking component-only props to DOM and keeps JSX spreads clean.
  - Solid rationale: simple, explicit, no runtime proxy tricks.
- `internal/ResolvedChildren.tsx`
  - Why: normalizes structural children with Solid's `children()` helper where subtree identity must survive parent updates.
  - Solid rationale: preserves Solid ownership semantics without freezing or untracking child resolution.
- Boolean normalization helpers (`resolveBoolean` style)
  - Why: treat `true` and empty-attribute (`""`) consistently across custom components.
  - Solid rationale: aligns with Solid JSX prop behavior without compatibility wrappers.

## Global Omissions (Intentional)

- React runtime/shim internals (`safeReact`, React ref/effect compatibility helpers)
  - Why omitted: not meaningful in Solid.
  - Solid rationale: would add abstraction debt without behavior value.
- React lifecycle-specific fallback layers
  - Why omitted: they model React scheduling quirks, not user-facing API.
  - Solid rationale: Solid has different ownership/reactivity semantics.

## Component Family Decisions

## Foundation / Provider

### `types`
- Added: strict shared event/detail typings for headless APIs.
- Omitted: React-specific helper utility types.
- Solid rationale: framework-agnostic type surface is enough.

### `merge-props`
- Added: explicit event chaining utilities (`combineProps`, `chainEventHandlers`).
- Omitted: React synthetic-event-only merge assumptions.
- Solid rationale: direct DOM event typing and deterministic chain order.

### `direction-provider`, `csp-provider`, `labelable-provider`
- Added: accessor-based contexts and local registries.
- Omitted: React context patterns tied to hook identity constraints.
- Solid rationale: accessors provide cheap reads and predictable updates.

## Primitive Controls

### `button`
- Added: Solid-native prop/event composition and state attrs.
- Omitted: React ref bridge helpers.
- Solid rationale: direct DOM refs + typed handlers are sufficient.

### `input`
- Added: explicit filled/dirty/touched/focused signal state.
- Omitted: React controlled-state warning/fallback machinery.
- Solid rationale: controlled/uncontrolled is explicit via signal access.

### `checkbox`, `radio`, `switch`, `toggle`
- Added: signal-based state + shared event detail model.
- Omitted: React-specific event normalization layers.
- Solid rationale: native event + typed detail object keeps semantics clear.

### `separator`
- Added: minimal ARIA-role and orientation behavior.
- Omitted: non-essential React render indirection.
- Solid rationale: simple DOM output with explicit attributes.

## Composite Controls

### `checkbox-group`, `radio-group`, `toggle-group`
- Added: group context with controlled/uncontrolled values.
- Omitted: React batching-dependent update assumptions.
- Solid rationale: value logic is local and deterministic.

### `meter`, `progress`
- Added: ARIA/state/data mapping via computed accessors.
- Omitted: React-only render abstraction helpers.
- Solid rationale: direct JSX with computed attributes is clearer.

### `fieldset`
- Added: lightweight legend linkage via context.
- Omitted: React effect compatibility utilities.
- Solid rationale: minimal context contract with explicit IDs.

### `field` (in progress)
- Added:
  - `Field.Root/Control/Label/Description/Error/Validity/Item`
  - signal-based validation state and label/description wiring
  - `useField` registration hook for form-level aggregation
- Omitted / deferred:
  - React animation-transition state hooks for `Field.Error`
  - React-specific warning scaffolding around `nativeLabel`
- Solid rationale:
  - validation and accessibility behavior are implemented directly with accessors/signals;
  - deferred parts are non-essential React internals or animation infrastructure not yet ported.

### `form` (in progress)
- Added:
  - form context with field registry
  - `onFormSubmit` value aggregation
  - imperative `validate` action surface
- Omitted / deferred:
  - React `flushSync`-equivalent submit-path sync semantics
  - advanced async-validation submission guarantees
- Solid rationale:
  - current implementation preserves public behavior contracts while avoiding fake React scheduling layers.

## Advanced / Structural

### `composite`
- Added: collection/root/list/item primitives with Solid signals.
- Omitted: React-specific list-registration lifecycle assumptions.
- Solid rationale: explicit registration works better with Solid ownership model.

### `collapsible`
- Added:
  - root/trigger/panel composition with state attrs
  - panel-local presence lifecycle (`present`, `hiddenUntilFound`, measured CSS vars, transition status)
  - `useButton`-based trigger semantics with `render` support
  - `beforematch` listener registration in the panel ref path, with reactive re-sync only for prop changes
- Omitted:
  - React-specific transition observers and layout orchestration helpers
- Solid rationale:
  - lifecycle stays local to the panel instead of reproducing React hook timing;
  - state sources that are intentionally imperative (`present`, measured dimensions, DOM ref sinks) use `pureWrite`;
  - browser-driven DOM events like `beforematch` are attached at ref time, not delayed to a later passive effect tick;
  - keeps behavior parity without recreating React's transition helper stack.

### `accordion`
- Added:
  - full root/item/header/trigger/panel structure
  - roving-focus key handling and orientation/RTL behavior
  - multiple/single value handling aligned to Solid signal flow
  - item-local trigger ID ownership and panel lifecycle reuse via `useCollapsiblePanel`
  - item-local `transitionStatus` ownership so trigger/panel/item attrs read the same lifecycle state
- Omitted:
  - React-only internal wrappers used for hook stability
- Solid rationale:
  - behavior parity kept; internals rewritten for accessor-driven updates;
  - panel lifecycle state is owned by the accordion item instead of hidden behind panel-local no-op bridges.

### `avatar`
- Added: root/image/fallback composition with loading-state behavior.
- Omitted: React-only image lifecycle glue.
- Solid rationale: native image events are directly usable.

### `toolbar`
- Added:
  - root/group/button/link/input/separator parts with composite roving-focus behavior
  - disabled/focusable-when-disabled propagation through group and root contexts
  - orientation + RTL key behavior mapped to Solid composite primitives
- Omitted:
  - React-only event/ref glue used by toolbar internals
- Solid rationale:
  - reused Solid-native `CompositeRoot` + `useButton` instead of React store wrappers;
  - kept behavior parity while avoiding framework-specific compatibility layers.

### `menubar` (in progress)
- Added:
  - `Menubar.Root` surface with `CompositeRoot`-based roving-focus baseline
  - `MenubarRootContext` with accessor-based values (`hasSubmenuOpen`, `contentElement`, `rootId`)
  - menubar state attributes (`data-modal`, `data-orientation`, `data-has-submenu-open`)
  - interaction-aware submenu state updates (`setHasSubmenuOpen(open, interactionType?)`)
  - modal scroll-lock lifecycle in root with touch-open bypass
- Omitted / deferred:
  - React floating-tree menu-open event bridge used to synchronize submenu-open state
  - sibling menu hover/click switching semantics that require the `menu` family
- Solid rationale:
  - root-level menubar contract is available with Solid-native primitives today;
  - interaction source and scroll-lock are handled with explicit signals/effects instead of React event helper hooks;
  - advanced submenu semantics are delayed until `menu` internals are ported, avoiding placeholder React compatibility layers.

### `menu` (in progress)
- Added:
  - baseline public parts: `Root/Trigger/Portal/Positioner/Popup/Item`
  - `MenuHandle` support (`Menu.createHandle`) via menu-owned handle/store contract
  - signal-first root context (`orientation`, `loopFocus`, `highlightItemOnHover`, interaction source)
  - `CompositeRoot` based roving-focus wiring in popup
  - item close behavior (`closeOnClick`) and menu state data attributes
  - touch-open path that bypasses modal scroll lock
- Omitted / deferred:
  - submenu tree (`SubmenuRoot`, `SubmenuTrigger`) and sibling-branch close semantics
  - item variants (`CheckboxItem`, `RadioItem`, indicators, group/label/link)
  - React floating-tree event bus parity and detached-trigger advanced parity tests
- Solid rationale:
  - keeps `Menu` ownership explicit with menu-specific handle/context boundaries rather than reusing dialog semantics;
  - uses Solid accessors directly for menu state while keeping parent/current submenu relationships explicit;
  - uses `children()` normalization only at structural boundaries where nested subtree identity matters;
  - does not use `untrack`-based child freezing or other lifetime hacks to force compatibility.

### `scroll-area`
- Added:
  - `Root/Viewport/Scrollbar/Thumb/Content/Corner` public parts and exports
  - signal-first shared context for overflow/scrolling/thumb/corner state
  - resize and scroll driven overflow-edge + thumb-size recalculation
  - immediate DOM sync for scroll/overflow data-attributes on measured elements
  - Solid 2 strict-read/owned-scope safe ref handling (`pureWrite` for DOM-ref signals + tracked `createRenderEffect` inputs)
  - CSP-aware scrollbar-hide style injection with nonce/disableStyleElements support (`styleDisableScrollbar`)
  - viewport class parity for native scrollbar hiding (`base-ui-disable-scrollbar`)
  - viewport interaction parity for user-driven scrolling (`data-id`, focusable tab index, user/programmatic scroll distinction)
- Omitted / deferred:
  - exact drag/RTL edge-case parity for all browser scrollLeft modes
- Solid rationale:
  - DOM-measurement behavior is implemented directly in component lifecycle with accessors;
  - scroll-time attributes are synchronized directly on elements to keep updates deterministic in Solid 2 event timing;
  - avoids React-only helper layers while preserving core headless behavior and data-attribute contract.

### `tabs`
- Added:
  - root/list/tab/panel/indicator parts with controlled/uncontrolled value model
  - panel registration for `aria-controls`/`aria-labelledby` linkage
  - keyboard activation semantics (`activateOnFocus` plus Enter activation)
- Omitted:
  - React store-based popup architecture and lifecycle wrappers
- Solid rationale:
  - signal-first root state with explicit context contracts;
  - composite navigation and button semantics are composed from existing Solid primitives, not React internals.

### `dialog`
- Added:
  - root/trigger/portal/popup/backdrop/title/description/close/viewport and detached-handle API
  - controlled/uncontrolled open state, payload forwarding, and open/close reason details
  - escape/outside-dismiss handling with modal/non-modal behavior and focus return
- Omitted:
  - React floating-ui integration internals and dialog store class architecture
  - animation-driven transition lifecycle markers beyond current open/closed state
- Solid rationale:
  - direct signal/memo state graph is simpler and matches Solid ownership semantics;
  - behavior contracts are preserved without React-specific abstraction layers.

### `alert-dialog`
- Added:
  - dedicated `AlertDialog.Root` that enforces modal + non-dismissible pointer behavior
  - `alertdialog` role wiring via shared dialog popup implementation
  - detached-handle support via `AlertDialog.createHandle`
- Omitted:
  - separate alert-dialog store architecture from React implementation
- Solid rationale:
  - built as a thin, typed wrapper over Solid-native `DialogRoot` to avoid duplicate state logic;
  - preserves user-facing behavior while keeping internals minimal and signal-first.

### `drawer`
- Added:
  - full public part surface (`Root/Provider/Indent/IndentBackground/Trigger/Portal/Popup/Content/Backdrop/Viewport/Title/Description/Close`)
  - dialog-based drawer composition with provider-driven active/visual state and detached trigger support
  - popup sizing + focus-default behavior tailored for drawer (`popup` receives initial focus)
- Omitted:
  - React-specific floating/swipe stack internals and store-class architecture
- Solid rationale:
  - reuses Solid-native dialog primitives and accessors to keep state flow explicit;
  - keeps behavior-facing API while avoiding React lifecycle emulation layers.

### `popover`
- Added:
  - public part surface for current phase (`Root/Trigger/Portal/Positioner/Popup/Arrow/Title/Description/Close/Backdrop/Viewport`)
  - non-modal-by-default root behavior and detached-trigger handle support
  - signal-first trigger behavior for click + hover open/close (`openOnHover`, `delay`, `closeDelay`)
  - positioner-to-popup side/align propagation through dedicated context
- Omitted / deferred:
  - full floating-ui parity (anchor tracking, collision avoidance, adaptive origin middleware)
  - hover patient-click threshold semantics and full interaction-reason parity (`trigger-hover`/`trigger-focus`)
  - viewport transition orchestration (`data-current` / `data-previous` / activation-direction)
- Solid rationale:
  - keeps popup state ownership in existing Solid-native dialog graph rather than reintroducing React store classes;
  - exposes the popover API shape now while isolating advanced positioning logic for a focused follow-up port.

## Utility Hooks

### `use-button`, `use-render`, `use-focusable-when-disabled`, `unstable-use-media-query`
- Added: Solid-native hook signatures with typed return props.
- Omitted: React hook dependency-pattern compatibility helpers.
- Solid rationale: hook contracts stay public-compatible while internals stay Solid-native.

## Known Deferred Items

These are intentionally not treated as parity regressions yet and must be tracked until complete:

- full animation lifecycle parity for components that require transition state markers
- full popup/nav stack (`menu`, `select`, etc.)
- popover floating-position parity (`collisionAvoidance`, advanced anchor tracking, patient-click hover semantics)
- advanced form/field async validation semantics equivalent to React implementation
- drawer swipe physics/snap transition parity (velocity/snap interpolation and full nested swipe propagation)

## Update Protocol (Required)

When implementing or changing any component family:

1. Add one entry under the component family with `Added`, `Omitted`, `Solid rationale`.
2. If behavior parity is intentionally deferred, add it to **Known Deferred Items**.
3. Create or update `porting/checklists/<component-family>.md` from `porting/checklists/_template.md`.
4. Fill the PR checks in `.github/PULL_REQUEST_TEMPLATE.md` and include the checklist path.
5. Do not merge undocumented compatibility layers.
