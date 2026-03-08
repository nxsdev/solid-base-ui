# Button コンポーネント レビューレポート

**対象**: `packages/solid/src/button/`
**比較元**: `../base-ui/packages/react/src/button/`
**日付**: 2026-03-06

---

## 1. ファイル構成比較

| ファイル | base-ui (React) | solid-base-ui (Solid) | 備考 |
|---|---|---|---|
| `index.ts` | あり | あり | Solid版は明示的に型をexport |
| `Button.tsx` | あり | あり | |
| `ButtonDataAttributes.ts` | あり (.tsx) | あり (.ts) | Solid版は `as const` オブジェクト |
| `Button.test.tsx` | あり | あり | |
| `Button.spec.tsx` | あり (型テスト) | **なし** | 欠落 |

---

## 2. Button 実装レビュー

### 2.1 実装比較

#### 良い点
- `useButton` フックを使用した共通ロジックの再利用
- `useRender` を使ったレンダリング（React版の `useRenderElement` に相当）
- `nativeButton` / `disabled` / `focusableWhenDisabled` / `composite` のプロパティが正しくサポート
- `getButtonProps` でイベントハンドラを自動合成するパターンが良い

#### 問題点

**[MEDIUM] props 分割代入によるリアクティビティの問題**
```tsx
const {
  children,
  composite: _composite,
  disabled: _disabled,
  focusableWhenDisabled: _focusableWhenDisabled,
  nativeButton,
  render,
  tabindex: _tabindex,
  ...elementProps
} = props;
```
- **Solid のベストプラクティス違反**: props を分割代入するとリアクティブな追跡が壊れる
- `_composite`, `_disabled` 等を `void` で捨てているのは冗長
- `omitProps` ユーティリティを使うべき（accordion 等の他コンポーネントで使用済み）
- `nativeButton` と `render` も分割後にクロージャ外で使用するため、リアクティブ更新時に反映されない

**[MEDIUM] `useButton` へのアクセサ渡しパターン**
```tsx
const { getButtonProps, buttonRef } = useButton({
  disabled: () => props.disabled,
  focusableWhenDisabled: () => props.focusableWhenDisabled,
  native: () => props.nativeButton,
  composite: () => props.composite,
  tabIndex: () => props.tabindex,
});
```
- アクセサ形式で渡しているのは正しい Solid パターン
- ただし `useButton` の戻り値 (`getButtonProps`, `buttonRef`) がコンポーネント初期化時に固定されるなら問題なし

**[LOW] `ButtonDataAttributes` の定義差異**
- React版: `enum`
  ```ts
  export enum ButtonDataAttributes {
    disabled = 'data-disabled',
  }
  ```
- Solid版: `as const` オブジェクト
  ```ts
  export const ButtonDataAttributes = {
    disabled: "data-disabled",
  } as const;
  ```
- `as const` の方が tree-shaking に有利で、Solid/モダンTS では好ましい
- ただし他の Solid コンポーネントが `enum` を使っている場合は一貫性の問題

**[LOW] `NativeButtonProps` の欠如**
- React版: `ButtonProps extends NativeButtonProps, BaseUIComponentProps<'button', ButtonState>`
  - `NativeButtonProps` は `type`, `form`, `name` 等のネイティブボタン属性を含む
- Solid版: `ButtonProps extends Omit<ButtonPropsForUseButton<HTMLElement>, "disabled">`
  - `useButton` の型から派生。ネイティブボタン固有の属性は `JSX.HTMLAttributes` 経由で含まれる可能性
  - 明示的な `NativeButtonProps` がないため、`type`, `form`, `name` の型安全性が確認必要

---

## 3. テストカバレッジ比較

| テストケース | base-ui | solid | 備考 |
|---|---|---|---|
| Conformance テスト | あり (`describeConformance`) | **なし** | 欠落 |
| native disabled: disabled属性 + イベントブロック | あり | あり | OK |
| native disabled: フォーカス不可 | あり (Tab テスト) | **なし** | 欠落 |
| custom disabled: aria-disabled + tabIndex=-1 | あり | あり | OK |
| custom disabled: フォーカス不可 | あり (Tab テスト) | **なし** | 欠落 |
| focusableWhenDisabled: native | あり | あり | OK |
| focusableWhenDisabled: native フォーカス可 | あり (Tab テスト) | **なし** | 欠落 |
| focusableWhenDisabled: custom | あり | あり | OK |
| focusableWhenDisabled: custom フォーカス可 | あり (Tab テスト) | **なし** | 欠落 |
| 型テスト (spec.tsx) | あり | **なし** | 欠落 |

### テスト実装の差異
- React版: `user.keyboard('[Tab]')` と `expect(button).toHaveFocus()` でフォーカス可否を検証
- Solid版: フォーカス移動のテストが一切なく、属性の存在とイベントブロックのみ
- React版: `user.click()` / `user.keyboard()` で高レベルのユーザー操作をシミュレート
- Solid版: `fireEvent.click()` / `fireEvent.keyDown()` で低レベルイベントを発火
  - `fireEvent` は bubbling をシミュレートしないため、`disabled` ネイティブボタンでは挙動が異なる場合がある

---

## 4. Solid 2 ベストプラクティス適合性

| プラクティス | 状態 | 備考 |
|---|---|---|
| props を分割代入しない | **NG** | render 関数内で分割代入している |
| リアクティブ値を関数で包む | OK | `useButton` へアクセサ渡し |
| `createEffect` は控えめに | OK | effect 不使用 |
| `.Provider` を使わない | N/A | Context 不使用 |

---

## 5. 重要度別サマリ

### HIGH
（なし — 基本機能は正しく動作）

### MEDIUM
1. **props 分割代入パターン** — リアクティビティ喪失のリスク。`omitProps` に統一すべき
2. `useButton` のアクセサパターンは正しいが、分割代入された `nativeButton` / `render` が non-reactive

### LOW
3. `ButtonDataAttributes` の定義形式の差異（enum vs const object）— 一貫性の確認
4. `NativeButtonProps` の明示的型定義の不足
5. フォーカス移動テストの欠落

### テスト欠落（6件）
- Conformance テスト
- フォーカス可否のテスト（disabled/focusableWhenDisabled 各パターン4件）
- 型テスト（spec.tsx）
