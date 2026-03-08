# Menu Mapping (React -> Solid)

## Source

- `../base-ui/packages/react/src/menu/*`

## Target

- `packages/solid/src/menu/*`

## Current file mapping

- `root/MenuRoot.tsx` -> `root/MenuRoot.tsx`
- `root/MenuRootContext.ts` -> `root/MenuRootContext.ts`
- `trigger/MenuTrigger.tsx` -> `trigger/MenuTrigger.tsx`
- `positioner/MenuPositioner.tsx` -> `positioner/MenuPositioner.tsx`
- `positioner/MenuPositionerContext.ts` -> `positioner/MenuPositionerContext.ts`
- `popup/MenuPopup.tsx` -> `popup/MenuPopup.tsx`
- `item/MenuItem.tsx` -> `item/MenuItem.tsx`
- `store/MenuHandle.ts` -> `handle.ts` (DialogHandle ベース)
- `portal/MenuPortal.tsx` -> `DialogPortal` を再利用
- `index.parts.ts` -> `index.parts.ts`
- `index.ts` -> `index.ts`

## Implemented in this pass

- `Menu.Root/Trigger/Portal/Positioner/Popup/Item` の公開 API を追加
- detached trigger 用 `Menu.createHandle` / `Menu.Handle` を追加
- popup 内 roving-focus を `CompositeRoot` で実装
- `Menu.Item` の `closeOnClick` 対応
- touch 開始時は scroll lock を適用しない modal 判定を追加
- menu 用 data attributes 定義を追加（trigger/popup/positioner/item）
- Solid ルート export と package export (`./menu`) を追加

## Deferred parity work

- `Arrow / Backdrop / Group / GroupLabel / LinkItem / CheckboxItem / RadioItem / Submenu*`
- nested menu tree の sibling close / parent close 連動
- typeahead, advanced close reason parity, detached trigger payload 切替の完全互換
- React 側 `MenuRoot.detached-triggers.test.tsx` 相当の包括テスト

## Notes for Future Agents

- `Menu` で最も時間を使ったのは open 判定そのものではなく、submenu open 時の subtree lifetime 崩れだった。
- `Dialog` 互換を無理に持ち込むより、`Menu` 専用 state/context と parent-owned submenu registry を優先すること。
- structural boundary で child subtree identity が必要な箇所は `children(() => props.children)` 正規化を使ってよい。
- ただし `untrack` で resolved children を凍らせるのは禁止。これは `Menu` だけでなく `Field` / `Accordion` まで壊した。
- render prop は top-level 直呼びしない。`createMemo` など追跡 scope の中で評価する。
