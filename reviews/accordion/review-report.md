# Accordion コンポーネント レビューレポート

**対象**: `packages/solid/src/accordion/`
**比較元**: `../base-ui/packages/react/src/accordion/`
**日付**: 2026-03-06

---

## 1. ファイル構成比較

| ファイル | base-ui (React) | solid-base-ui (Solid) | 備考 |
|---|---|---|---|
| `index.ts` | あり | あり | Solid版はDataAttributesもre-export (良い) |
| `index.parts.ts` | あり | あり | 同等 |
| `root/AccordionRoot.tsx` | あり | あり | |
| `root/AccordionRootContext.ts` | あり | あり | |
| `root/AccordionRootDataAttributes.ts` | あり | あり | |
| `root/stateAttributesMapping.ts` | なし (Root内でインライン) | あり | Solid版で分離。良い判断 |
| `root/AccordionRoot.test.tsx` | あり (790行) | あり (546行) | テスト数に差あり |
| `root/AccordionRoot.spec.tsx` | あり (型テスト) | **なし** | 欠落 |
| `item/AccordionItem.tsx` | あり | あり | |
| `item/AccordionItemContext.ts` | あり | あり | |
| `item/AccordionItemDataAttributes.ts` | あり | あり | |
| `item/stateAttributesMapping.ts` | あり | あり | |
| `item/AccordionItem.test.tsx` | あり | あり | |
| `header/AccordionHeader.tsx` | あり | あり | |
| `header/AccordionHeaderDataAttributes.ts` | あり | あり | |
| `header/AccordionHeader.test.tsx` | あり | あり | |
| `trigger/AccordionTrigger.tsx` | あり | あり | |
| `trigger/AccordionTriggerDataAttributes.ts` | あり | あり | |
| `trigger/AccordionTrigger.test.tsx` | あり | あり | |
| `panel/AccordionPanel.tsx` | あり | あり | |
| `panel/AccordionPanelDataAttributes.ts` | あり | あり | |
| `panel/AccordionPanelCssVars.ts` | あり | あり | |
| `panel/AccordionPanel.test.tsx` | あり | あり | |

---

## 2. AccordionRoot レビュー

### 2.1 実装比較

#### 良い点
- `getNextAccordionValue()` を純粋関数として切り出し。React版は `handleValueChange` 内にインラインだったので、テスタビリティが向上
- `uncontrolledValue` を `let` 変数で保持し、stale state問題を回避（CLAUDE.md Known Failure #1 対応済み）
- Context を Solid 2 Beta 構文 `<AccordionRootContext value={...}>` で使用（`.Provider` 不使用）

#### 問題点

**[HIGH] `createEffect` の Solid 2 形式未使用**
- base-ui (React) では `useDirection()` は直接値を返すが、Solid版では `const direction = createMemo(() => useDirection())` としている
- `useDirection()` がすでにリアクティブな値を返すなら、`createMemo` で包む必要がない可能性がある。ただし、`useDirection` の実装次第では正しい場合もある

**[MEDIUM] `onValueChange` のイベント伝播経路の相違**
- React版: `handleValueChange(newValue, nextOpen)` → Root内部で `createChangeEventDetails(REASONS.none)` を生成 → `onValueChange(nextValue, details)` → キャンセル判定 → `setValue`
- Solid版: `handleValueChange(newValue, nextOpen, eventDetails)` → Item側から `eventDetails` を受け取る
- Solid版の方がイベント詳細の生成元がItem側になっている。これ自体は設計判断だが、Root直接の `onValueChange` に渡される `eventDetails` の `reason` がItem由来の `"trigger-press"` になる点はReact版と同じ挙動（React版は `"none"` を渡す）
- **React版の `handleValueChange` は reason を `"none"` で固定しているが、Solid版はItemから受け取った reason をそのまま使う。この差異が意図的かどうか要確認**

**[MEDIUM] `multiple=false` 時の toggle ロジックの差異**
- React版:
  ```js
  const nextValue = value[0] === newValue ? [] : [newValue];
  ```
  先頭要素だけを比較（`multiple=false`なので最大1要素の前提）
- Solid版:
  ```js
  const isAlreadyOpen = currentValue.some((entry) => entry === newValue);
  return isAlreadyOpen ? [] : [newValue];
  ```
  全要素を走査。動作は同等だが、`some` の方が防御的で正しい

**[LOW] 型ジェネリクスの欠落**
- React版は `AccordionRoot<Value>` でジェネリック型パラメータを持ち、型安全な `onValueChange` コールバックを提供
- Solid版は `AccordionValue = unknown[]` で固定。ユーザーが型安全に値を扱えない
- 対応する `AccordionRoot.spec.tsx` (型テスト) も欠落

**[LOW] dev-only 警告の欠落**
- React版は `hiddenUntilFound && keepMounted === false` の矛盾設定を警告
- Solid版にはこの警告がない

### 2.2 Data Attributes

| 属性 | React | Solid | 一致 |
|---|---|---|---|
| `data-disabled` | あり | あり | OK |
| `data-orientation` | あり | あり | OK |
| `role="region"` | あり | あり | OK |
| `dir` | あり | あり | OK |

---

## 3. AccordionItem レビュー

### 3.1 実装比較

#### 良い点
- `useCompositeListItem` を使った登録パターンはReact版と同等
- `CollapsibleRootContext` と `AccordionItemContext` の二重コンテキストパターンを維持
- Solid 2 Context 構文を正しく使用

#### 問題点

**[HIGH] `onOpenChange` シグネチャの差異**
- React版: `onOpenChange(nextOpen: boolean, eventDetails: CollapsibleRoot.ChangeEventDetails)`
- Solid版: `onOpenChange(nextOpen: boolean, event: Event, trigger: Element | undefined, reason: string)`
- Solid版は `CollapsibleRootContextValue` の `onOpenChange` を直接合わせており、引数が展開されている。これは Collapsible の内部API設計に依存するが、base-ui との public API (`AccordionItem.Props.onOpenChange`) は同じ形（`(open, eventDetails) => void`）なので問題なし。内部の差異として許容可能

**[MEDIUM] `useCollapsibleRoot` フックの不在**
- React版: Item内で `useCollapsibleRoot({ open, onOpenChange, disabled })` を呼び出し、`mounted`, `transitionStatus` 等のアニメーション状態を取得
- Solid版: `CollapsibleRootContext` を直接構築し、`transitionStatus: "idle"` を固定値で渡している
- **これによりアニメーション遷移（`data-starting-style`, `data-ending-style`）が機能しない可能性がある**

**[MEDIUM] `collapsibleState` の `transitionStatus` が常に `"idle"`**
```ts
const collapsibleState = createMemo<CollapsibleRootState>(() => ({
  open: open(),
  disabled: disabled(),
  transitionStatus: "idle", // ← 常にidle
}));
```
- Panel側で `collapsibleContext.state().transitionStatus` を参照しているが、遷移が起きない

**[LOW] AccordionItemDataAttributes に `orientation` と `startingStyle`/`endingStyle` が含まれている**
- React版の `AccordionItemDataAttributes` には `index`, `disabled`, `open` の3つのみ
- Solid版には追加で `orientation`, `startingStyle`, `endingStyle` が含まれている
- これは `stateAttributesMapping` が出力するものと一致させるための判断だが、base-uiとの乖離

### 3.2 Data Attributes

| 属性 | React | Solid | 一致 |
|---|---|---|---|
| `data-index` | あり | あり | OK |
| `data-disabled` | あり | あり | OK |
| `data-open` | あり | あり | OK |
| `data-orientation` | Itemレベルではなし | あり | 差異 |
| `data-starting-style` | あり (transition経由) | あり (ただし常にidle) | 実質機能なし |
| `data-ending-style` | あり (transition経由) | あり (ただし常にidle) | 実質機能なし |

---

## 4. AccordionHeader レビュー

### 4.1 実装比較

#### 良い点
- `<h3>` タグとして正しくレンダリング
- ItemContextからstateを取得するパターンはReact版と同等

#### 問題点

**[LOW] `transitionStatus: "idle"` のハードコード**
```tsx
{...getAccordionStateDataAttributes({
  ...itemContext.state(),
  transitionStatus: "idle",
})}
```
- Headerにtransition属性を付与する必要性自体が低いため、実用上問題なし
- ただし `data-starting-style` / `data-ending-style` が常に undefined になるので、不要な計算

**[LOW] React版は `render` prop をサポート**
- React版: `useRenderElement` で `render` prop によるカスタムレンダリングをサポート
- Solid版: `render` prop なし。固定の `<h3>`
- これはSolid版全体の設計判断（`render` の代わりに `Dynamic` を使う場所と使わない場所が混在）

### 4.2 Data Attributes

| 属性 | React (via stateAttributesMapping) | Solid | 一致 |
|---|---|---|---|
| `data-index` | あり | あり | OK |
| `data-disabled` | あり | あり | OK |
| `data-open` | あり | あり | OK |

ただし Solid版の `AccordionHeaderDataAttributes` enum には `orientation`, `startingStyle`, `endingStyle` がない（正しい）。

---

## 5. AccordionTrigger レビュー

### 5.1 実装比較

#### 良い点
- キーボードナビゲーション（ArrowUp/Down/Left/Right, Home, End）が完全実装
- RTL対応が正しく実装
- disabled アイテムのスキップが正しく動作
- `nativeButton` の切り替えロジックが適切

#### 問題点

**[HIGH] `createEffect` の Solid 2 Beta 形式の問題**
```tsx
createEffect(
  () => props.id,
  (id) => {
    itemContext.setTriggerId(typeof id === "string" ? id : generatedId);
  },
);
```
- Solid 2 Betaの `createEffect(source, fn)` 形式を使用しているが、`props.id` が undefined の場合のフォールバックが `generatedId` になる
- React版では `useIsoLayoutEffect` で同期的にID設定を行う。Solid版の `createEffect` は非同期の可能性がある
- **CLAUDE.md Known Failure #8**: レンダーフェーズの同期化には `createRenderEffect` を使うべき。ID設定はレンダーフェーズで同期的に行われるべき

**[HIGH] `Dynamic` コンポーネントで手動prop転送**
```tsx
<Dynamic
  component={props.render ?? (nativeButton() ? "button" : "span")}
  id={itemContext.triggerId()}
  class={props.class}
  style={props.style}
  // ... 大量の手動prop転送
  onFocus={props.onFocus}
  onBlur={props.onBlur}
  onMouseDown={props.onMouseDown}
  // ...
>
```
- イベントハンドラを個別に手動転送している。新しいイベントが追加された場合にメンテナンス漏れが発生する
- `...elementProps()` パターン（他のコンポーネントでは使用済み）に統一すべき
- React版は `useRenderElement` + `getButtonProps` で自動的にprops合成される

**[MEDIUM] `useButton` フックの不在**
- React版: `useButton({ disabled, focusableWhenDisabled: true, native: nativeButton })` を使用
- Solid版: `useButton` に相当するロジックを手動実装
- `focusableWhenDisabled: true` の挙動（disabled時もフォーカス可能）がReact版と同等かどうか要確認
- 現在のSolid版では disabled 時に `aria-disabled="true"` を設定し、ネイティブボタンの場合は `disabled` 属性を設定。`focusableWhenDisabled` に相当する処理がないため、**ネイティブボタンかつdisabledの場合にフォーカスが当たらない**

**[MEDIUM] `aria-controls` の条件付き設定**
- React版: `'aria-controls': open ? panelId : undefined`
- Solid版: `aria-controls={collapsibleContext.open() ? collapsibleContext.panelId() : undefined}`
- 同等だが、閉じている時にaria-controlsがないのはARIA仕様的に正しい

**[LOW] `callEventHandler` ユーティリティ**
- Solid版独自の `callEventHandler` 関数でSolidのイベントハンドラ形式（関数 or `[handler, data]` タプル）に対応
- これ自体は正しいSolid対応だが、ファイルローカルでの定義は再利用性が低い。共有ユーティリティに切り出す方が良い

### 5.2 キーボードナビゲーション比較

| 機能 | React | Solid | 一致 |
|---|---|---|---|
| ArrowDown (vertical) | あり | あり | OK |
| ArrowUp (vertical) | あり | あり | OK |
| ArrowRight (horizontal) | あり | あり | OK |
| ArrowLeft (horizontal) | あり | あり | OK |
| Home | あり | あり | OK |
| End | あり | あり | OK |
| loopFocus | あり | あり | OK |
| RTL反転 | あり | あり | OK |
| disabled skip | あり | あり | OK |
| Enter/Space (non-native) | あり | あり | OK |
| パネル内要素への影響なし | テストあり | **テストなし** | 欠落 |

---

## 6. AccordionPanel レビュー

### 6.1 実装比較

#### 良い点
- `keepMounted` / `hiddenUntilFound` の Root レベルとPanel レベルの優先順位が正しく実装
- `<Show>` コンポーネントを使った条件レンダリングがSolidのベストプラクティスに沿っている
- CSS Variables の設定は base-ui と同等

#### 問題点

**[HIGH] アニメーション・トランジションの欠落**
- React版: `useCollapsiblePanel` フックで `height`, `width`, `mounted`, `visible`, `transitionStatus` を管理し、実際のアニメーション遷移をサポート
- Solid版: これらのフック呼び出しが一切ない。CSS Variables は `"auto"` 固定
  ```tsx
  const style = createMemo<JSX.CSSProperties>(() => ({
    [AccordionPanelCssVars.accordionPanelHeight]: "auto",
    [AccordionPanelCssVars.accordionPanelWidth]: "auto",
    ...inputStyle,
  }));
  ```
- **実際のheight/widthアニメーションが動作しない**。CSS transitionsで `--accordion-panel-height` を使ったスムーズな開閉ができない

**[HIGH] `mounted` 状態の欠如**
- React版: `shouldRender = keepMounted || hiddenUntilFound || (!keepMounted && mounted)` — `mounted` はアニメーション完了後に `false` になる
- Solid版: `shouldRender = keepMounted || hiddenUntilFound || collapsibleContext.open()` — `open` を直接使用
- アニメーション中にパネルが即座にアンマウントされるため、閉じるアニメーションが表示されない

**[MEDIUM] `createEffect` の Solid 2 形式の問題（Panel ID）**
```tsx
createEffect(
  () => props.id,
  (id) => {
    if (typeof id === "string") {
      collapsibleContext.setPanelId(id);
      return;
    }
    collapsibleContext.setPanelId(undefined);
  },
);
```
- Trigger と同様、`createRenderEffect` を使うべき（Known Failure #8）

**[MEDIUM] dev-only 警告の欠落**
- React版: `keepMounted={false} && hiddenUntilFound` の矛盾設定を警告
- Solid版: 警告なし

**[LOW] `hidden` 属性の型**
- `hidden` に `"until-found"` を渡しているが、SolidJSのHTML型定義が `"until-found"` をサポートしているか要確認

### 6.2 Data Attributes

| 属性 | React | Solid | 一致 |
|---|---|---|---|
| `data-index` | あり | あり | OK |
| `data-open` | あり | あり | OK |
| `data-orientation` | あり | あり | OK |
| `data-disabled` | あり | あり | OK |
| `data-starting-style` | あり (機能する) | あり (常にidle=未設定) | 実質不一致 |
| `data-ending-style` | あり (機能する) | あり (常にidle=未設定) | 実質不一致 |
| `role="region"` | あり | あり | OK |
| `aria-labelledby` | あり | あり | OK |

---

## 7. Context 設計レビュー

### 7.1 AccordionRootContext

| フィールド | React型 | Solid型 | 備考 |
|---|---|---|---|
| `accordionItemRefs` | `React.RefObject<(HTMLElement\|null)[]>` | `ElementListRef<HTMLElement>` | OK |
| `direction` | `TextDirection` (plain) | `() => TextDirection` (Accessor) | Solid化OK |
| `disabled` | `boolean` | `() => boolean` | Solid化OK |
| `hiddenUntilFound` | `boolean` | `() => boolean` | Solid化OK |
| `keepMounted` | `boolean` | `() => boolean` | Solid化OK |
| `loopFocus` | `boolean` | `() => boolean` | Solid化OK |
| `orientation` | `Orientation` | `() => Orientation` | Solid化OK |
| `value` | `AccordionRoot.Value<Value>` | `() => AccordionValue` | Solid化OK |
| `handleValueChange` | `(newValue, nextOpen) => void` | `(newValue, nextOpen, eventDetails) => void` | シグネチャ差異 |
| `state` | `AccordionRoot.State<Value>` | `() => AccordionRootState` | Solid化OK |

Context値をリアクティブ（Accessor）にしているのは正しいSolidパターン。

### 7.2 AccordionItemContext

| フィールド | React型 | Solid型 | 備考 |
|---|---|---|---|
| `open` | `boolean` | `() => boolean` | Solid化OK |
| `state` | `AccordionItem.State` | `() => AccordionItemState` | Solid化OK |
| `setTriggerId` | `(id) => void` | `(id) => void` | 同等 |
| `triggerId` | `string \| undefined` | `() => string \| undefined` | Solid化OK |

---

## 8. テストカバレッジ比較

### 8.1 AccordionRoot.test.tsx

| テストケース | base-ui | solid | 備考 |
|---|---|---|---|
| ARIA属性 (role, controls, labelledby, expanded) | あり | あり | OK |
| カスタム panel id | あり | あり | OK |
| Uncontrolled: トグル動作 | あり | あり | OK |
| Controlled: value追従 | あり | あり (setPropsの代わりにSignal) | OK |
| defaultValue (カスタム値) | あり | あり | OK |
| Controlled: カスタム値 | あり | **なし** | 欠落 |
| disabled: 全体 | あり | あり | OK |
| disabled: 個別Item | あり | **なし** | 欠落 |
| Enter/Space トグル (native button) | あり | **なし** (non-nativeのみ) | 部分欠落 |
| Enter/Space トグル (non-native) | あり | あり | OK |
| ArrowUp/Down + ループ | あり | あり (ループのテストは別) | OK |
| ArrowUp/Down + disabled skip | あり | あり | OK |
| Home/End | あり | あり | OK |
| Home/End + disabled skip | あり | **なし** | 欠落 |
| パネル内要素への影響なし | あり | **なし** | 欠落 |
| loopFocus=false | あり | あり | OK |
| loopFocus=false (ArrowUp方向) | あり | **なし** | 欠落 |
| multiple=true | あり | あり | OK |
| multiple=false | あり | あり | OK |
| horizontal: ArrowLeft/Right | あり | あり | OK |
| horizontal: ループ | あり | **なし** | 欠落 |
| RTL | あり | あり | OK |
| RTL: ループ | あり | **なし** | 欠落 |
| onValueChange (default値) | あり | **なし** | 欠落 |
| onValueChange (カスタム値) | あり | あり | OK |
| onValueChange (multiple=false) | あり | **なし** | 欠落 |
| onValueChange: キャンセル | あり | あり | OK |
| Conformance テスト | あり (`describeConformance`) | **なし** | 欠落 |
| 型テスト (spec.tsx) | あり | **なし** | 欠落 |

### 8.2 サブコンポーネントテスト

| テスト | base-ui | solid | 備考 |
|---|---|---|---|
| Item: conformance | あり | 独自テスト | OK |
| Header: conformance | あり | 独自テスト | OK |
| Trigger: conformance | あり | 独自テスト | OK |
| Trigger: non-native tabindex | あり | あり | OK |
| Panel: conformance | あり | 独自テスト | OK |
| Panel: keepMounted | (conformanceに含む) | あり | OK |

---

## 9. Solid 2 ベストプラクティス適合性

| プラクティス | 状態 | 備考 |
|---|---|---|
| propsを分割代入しない | OK | `props.xxx` で直接アクセス |
| リアクティブ値を関数で包む | OK | Context値が `() => T` 形式 |
| Solidの制御フローコンポーネント使用 | OK | `<Show>` を使用 |
| `createEffect` は控えめに | 要確認 | Trigger/Panelで使用。`createRenderEffect` が適切な箇所あり |
| 状態の導出を優先 | OK | `createMemo` で導出 |
| 複雑オブジェクトにはstoreを使用 | N/A | 現在のスコープでは不要 |
| `.Provider` を使わない (Solid 2) | OK | すべて `<Context value={...}>` 形式 |
| `onMount` を使わない (Solid 2) | OK | 使用なし |

---

## 10. 重要度別サマリ

### HIGH (機能に影響する問題)
1. **アニメーション/トランジション未実装**: `useCollapsiblePanel` 相当のロジックがなく、height/widthアニメーションと `data-starting-style`/`data-ending-style` が機能しない
2. **`createEffect` → `createRenderEffect`**: Trigger ID / Panel ID の設定が非同期になりレースコンディションの可能性 (Known Failure #8)
3. **`focusableWhenDisabled` 未実装**: ネイティブボタンのdisabled時にフォーカスが当たらず、React版と挙動が異なる
4. **型ジェネリクス欠落**: `AccordionValue = unknown[]` 固定で型安全性がない

### MEDIUM (動作するが改善が必要)
5. `onValueChange` のeventDetails伝播経路がReact版と異なる（Root側でのreason差異）
6. `collapsibleState.transitionStatus` が常に `"idle"` 固定
7. Trigger の手動prop転送パターンがメンテナンスリスク
8. dev-only 警告の欠落 (hiddenUntilFound + keepMounted=false)

### LOW (品質向上の機会)
9. `callEventHandler` の共有ユーティリティ化
10. `AccordionItemDataAttributes` のenum差異（orientation等の追加）
11. Header の `render` prop 未サポート

---

## 11. テスト欠落一覧

追加すべきテスト:
1. `AccordionRoot.spec.tsx` — 型テスト
2. disabled: 個別Item単位のdisabled
3. Enter/Space: ネイティブボタンでのトグル
4. Home/End: disabled アイテムをスキップしてのフォーカス移動
5. パネル内のインタラクティブ要素へのキー操作の非干渉
6. loopFocus=false: ArrowUp方向のテスト
7. horizontal + ループ動作
8. RTL + ループ動作
9. onValueChange: デフォルト値（数値）でのコールバック
10. onValueChange: multiple=false での挙動
11. Conformance テスト（ref転送、className、style等の基本的なDOMプロパティ）
