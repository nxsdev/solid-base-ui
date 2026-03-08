# Component Porting Checklist: menu

## 1. Scope

- Source: `../base-ui/packages/react/src/menu`
- Target: `packages/solid/src/menu`
- Mapping doc: `porting/menu-mapping.md`
- Decision log updated: `porting/IMPLEMENTATION_DECISIONS.md`

## 2. Public API Parity

- [x] Export path exists in `packages/solid/package.json`
- [x] Top-level exports wired in `packages/solid/src/index.ts`
- [x] Namespace-style part exports exist (`index.parts.ts`)
- [ ] Type exports are complete

## 3. Behavioral Parity

- [x] Controlled/uncontrolled behavior covered by tests
- [ ] Keyboard behavior covered by tests
- [x] Pointer behavior covered by tests
- [ ] Focus management covered by tests
- [x] ARIA attributes covered by tests
- [x] Data-state attributes covered by tests

## 4. Form/Field Integration (if applicable)

- [x] Not applicable

## 5. Solid-First Quality Gates

- [x] No React lifecycle emulation wrappers
- [x] No compatibility fallback added only for React internals
- [x] Derived state uses signals/memos, not effect chains
- [x] No `any` and no unsafe assertion chains
- [x] Event detail objects match existing project conventions

## 6. Added / Omitted / Deferred

## Added

- [x] Added item #1: `Menu.Root/Trigger/Positioner/Popup/Item` の公開面
  - Why required: menubar/context-menu 実装の前提となる menu 基盤が必要。
  - Why Solid-appropriate: `DialogRoot` + `CompositeRoot` を組み合わせた signal-first 実装。
- [x] Added item #2: touch interaction-aware modal scroll lock
  - Why required: touch 開始時に scroll lock を回避する React 契約を維持。
  - Why Solid-appropriate: interaction source を context signal で明示管理。

## Omitted

- [x] Omitted item #1: React floating tree/event bus の直接移植
  - Why intentionally omitted: React 専用の FloatingTree 依存をそのまま持ち込まないため。
  - Why omission is safe: 現段階の menu 最小公開面では必須ではない。

## Deferred

- [x] Deferred item #1: submenu / checkbox/radio/group/link / arrow/backdrop
  - Why deferred now: API 面積が広く、段階移植しないとレビュー精度が落ちるため。
  - Owner/next action: 次パスで `SubmenuRoot + SubmenuTrigger` と item variants を追加。
- [x] Deferred item #2: keyboard/focus の完全 parity
  - Why deferred now: React 側 `MenuRoot.test.tsx` の網羅ケースを段階的に再現する必要があるため。
  - Owner/next action: detached trigger と nested menu を含むテスト群を順次追加。

## 7. Verification

- [x] `pnpm --filter @solid-base-ui/solid test -- 'src/menu/**/*.test.tsx'`
- [x] `pnpm --filter @solid-base-ui/solid typecheck`
- [x] `pnpm --filter @solid-base-ui/solid lint`
- [x] `pnpm --filter @solid-base-ui/solid format`

## 8. Reviewer Notes

- Risk level: medium
- Remaining risks:
  - menu family は最小公開面のみで、submenu/item variants は未実装。
  - keyboard/focus parity は React 実装に対して不足ケースがある。
- Follow-up PRs:
  - `Menu.Submenu*` / `Menu.CheckboxItem*` / `Menu.RadioItem*` の移植
  - `MenuRoot.detached-triggers` 相当テスト移植
