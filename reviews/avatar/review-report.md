# Avatar コンポーネント レビューレポート

**対象**: `packages/solid/src/avatar/`
**比較元**: `../base-ui/packages/react/src/avatar/`
**日付**: 2026-03-06

---

## 1. ファイル構成比較

| ファイル | base-ui (React) | solid-base-ui (Solid) | 備考 |
|---|---|---|---|
| `index.ts` | あり | あり | 同等 |
| `index.parts.ts` | あり | あり | 同等 |
| `root/AvatarRoot.tsx` | あり | あり | |
| `root/AvatarRootContext.ts` | あり | あり | |
| `root/stateAttributesMapping.ts` | あり | あり | |
| `root/AvatarRoot.test.tsx` | あり (conformance) | あり (2テスト) | |
| `image/AvatarImage.tsx` | あり | あり | 実装差異あり |
| `image/AvatarImageDataAttributes.ts` | あり | あり | |
| `image/useImageLoadingStatus.ts` | あり | あり | |
| `image/AvatarImage.test.tsx` | あり | あり | |
| `fallback/AvatarFallback.tsx` | あり | あり | 機能差異あり |
| `fallback/AvatarFallback.test.tsx` | あり | あり | |

---

## 2. AvatarRoot レビュー

### 2.1 実装比較

#### 良い点
- `createSignal` で `imageLoadingStatus` を管理。Solid のリアクティブパターンに沿っている
- Context を Solid 2 構文 `<AvatarRootContext value={...}>` で使用
- Context 値が Accessor (`() => ImageLoadingStatus`) 形式で正しくリアクティブ

#### 問題点

**[MEDIUM] prop のスプレッドが不完全**
- React版: `useRenderElement` で全ての HTML属性を自動的に渡す
- Solid版:
  ```tsx
  <span class={props.class} style={props.style} data-testid={props["data-testid"]}>
    {props.children}
  </span>
  ```
  - `class`, `style`, `data-testid` しか転送していない
  - `id`, `aria-*`, `role`, `onClick` 等のその他の HTML属性が無視される
  - `ref` も転送されていない

**[LOW] `render` prop が Props 定義にあるが使用されていない**
- `AvatarRootProps` に `render?: ValidComponent` があるが、実装で使われていない

**[LOW] state attributes mapping が使用されていない**
- `stateAttributesMapping.ts` は定義されているが、Root のレンダリングでは使用されていない
- React版は `useRenderElement` 経由で自動的に適用される

---

## 3. AvatarImage レビュー

### 3.1 実装比較

#### 良い点
- `useImageLoadingStatus` フックの Solid 移植は正しい
  - `createEffect(source, fn)` で Solid 2 形式を使用
  - `onCleanup` でイベントリスナーの解除を適切に行っている
  - `isMounted` フラグで非同期更新を安全に処理
- `<Show>` コンポーネントでの条件レンダリングが Solid ベストプラクティスに沿っている
- Context への loading status 伝播が正しい

#### 問題点

**[HIGH] トランジション/アニメーション機能の欠如**
- React版: `useTransitionStatus` で `mounted`, `transitionStatus`, `setMounted` を管理
  - `data-starting-style` / `data-ending-style` で CSS アニメーションをサポート
  - `useOpenChangeComplete` でアニメーション完了後のアンマウント
- Solid版: `<Show when={isVisible()}>` で即座にマウント/アンマウント
  - **フェードインアニメーションが動作しない**
  - **フェードアウト（アンマウント前の ending-style）が動作しない**

**[MEDIUM] `createEffect` の使い方**
```tsx
createEffect(imageLoadingStatus, (status) => {
  if (status === "idle") return;
  props.onLoadingStatusChange?.(status);
  context.setImageLoadingStatus(status);
});
```
- Solid 2 の `createEffect(source, fn)` 形式を使用（正しい）
- ただし、`createRenderEffect` の方が適切な可能性（レンダーフェーズの同期化）
- `props.onLoadingStatusChange` への直接アクセスは OK（分割代入していない）

**[MEDIUM] elementProps の手動分割代入**
```tsx
const elementProps = createMemo(() => {
  const { onLoadingStatusChange: _onLoadingStatusChange, render: _render, ...rest } = props;
  void _onLoadingStatusChange;
  void _render;
  return rest;
});
```
- `void` で未使用変数を抑制しているが、`omitProps` ユーティリティを使うべき（他コンポーネントとの一貫性）
- **Solid のベストプラクティス違反**: props を分割代入するとリアクティビティが壊れる可能性
  - ただし `createMemo` 内なので再評価はされる
  - `omitProps` パターンに統一した方が安全

**[LOW] `AvatarImageState.transitionStatus` の型定義が不正確**
```ts
transitionStatus: "starting" | "ending" | "running" | "ended";
```
- React版は `TransitionStatus` 型（`"idle" | "starting" | "ending"` 等）を使用
- Solid版の `"running" | "ended"` は React版に存在しない値

---

## 4. AvatarFallback レビュー

### 4.1 実装比較

#### 良い点
- `<Show>` コンポーネントでの条件レンダリング
- Context から `imageLoadingStatus` を正しく参照

#### 問題点

**[HIGH] `delay` prop の欠落**
- React版: `delay` prop でフォールバック表示を遅延可能
  ```tsx
  <Avatar.Fallback delay={100}>AC</Avatar.Fallback>
  ```
  - `useTimeout` フックで遅延管理
- Solid版: `delay` prop が存在しない
  - フォールバックが即座に表示される
  - ネットワーク遅延が短い場合のフリッカー防止ができない

**[MEDIUM] prop のスプレッドが不完全（Root と同様）**
```tsx
<span class={props.class} style={props.style} data-testid={props["data-testid"]}>
  {props.children}
</span>
```
- `id`, `aria-*`, `onClick`, `ref` 等が転送されない
- React版は `useRenderElement` で全属性を自動転送

**[LOW] `render` prop が Props 定義にあるが使用されていない**

---

## 5. useImageLoadingStatus フックレビュー

### 5.1 実装比較

#### 良い点
- `createMemo` で入力をまとめてから `createEffect` に渡すパターンが正しい
- `onCleanup` でリスナーの解除が適切
- `isMounted` フラグで unmount 後の更新を防止

#### 問題点

**[LOW] React版との引数の差異**
- React版: `useImageLoadingStatus(src, { referrerPolicy, crossOrigin })` — `src` は直値
- Solid版: `useImageLoadingStatus(() => src, { referrerPolicy: () => ..., crossOrigin: () => ... })` — すべてアクセサ
- これはSolid化として正しい変換

---

## 6. テストカバレッジ比較

### AvatarRoot.test.tsx

| テストケース | base-ui | solid | 備考 |
|---|---|---|---|
| Conformance テスト | あり | **なし** | 欠落 |
| span としてレンダリング | (conformance内) | あり | OK |
| children の表示 | (conformance内) | あり | OK |

### AvatarImage.test.tsx

| テストケース | base-ui | solid | 備考 |
|---|---|---|---|
| Conformance テスト | あり | **なし** | 欠落 |
| loaded 時にイメージ表示 | (暗黙) | あり | OK |
| error 時に非表示 | (暗黙) | あり | OK |
| onLoadingStatusChange コールバック | (暗黙) | あり | OK |
| Fallback との連携 | (暗黙) | あり | OK |
| Enter アニメーション (data-starting-style) | あり | **なし** | 欠落（機能自体がない） |
| Exit アニメーション (data-ending-style) | あり | **なし** | 欠落（機能自体がない） |

### AvatarFallback.test.tsx

| テストケース | base-ui | solid | 備考 |
|---|---|---|---|
| Conformance テスト | あり | **なし** | 欠落 |
| loaded 時に非表示 | あり | あり | OK |
| error 時に表示 | あり | あり | OK |
| delay prop | あり | **なし** | 欠落（機能自体がない） |
| loading 中にfallback維持+image非表示 | あり | **なし** | 欠落 |
| image切替時のregression | あり | **なし** | 欠落 |

---

## 7. 重要度別サマリ

### HIGH
1. **AvatarImage のアニメーション/トランジション未実装** — `useTransitionStatus` 相当がなく、`data-starting-style`/`data-ending-style` が機能しない
2. **AvatarFallback の `delay` prop 欠落** — フリッカー防止機能がない

### MEDIUM
3. AvatarRoot / AvatarFallback の prop スプレッドが不完全 — `id`, `ref`, `aria-*` 等が転送されない
4. AvatarImage の props 分割代入パターンが `omitProps` と不一致
5. `createEffect` → `createRenderEffect` の検討

### LOW
6. `render` prop が定義のみで未実装（Root, Fallback）
7. `AvatarImageState.transitionStatus` の型が React版と不一致
8. `stateAttributesMapping` が Root で未使用

### テスト欠落（8件）
- Conformance テスト（全コンポーネント）
- アニメーションテスト（enter/exit）
- delay prop テスト
- loading 中の挙動テスト
- image/fallback 切替のリグレッションテスト
