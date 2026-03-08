# AlertDialog コンポーネント レビューレポート

**対象**: `packages/solid/src/alert-dialog/`
**比較元**: `../base-ui/packages/react/src/alert-dialog/`
**日付**: 2026-03-06

---

## 1. ファイル構成比較

| ファイル | base-ui (React) | solid-base-ui (Solid) | 備考 |
|---|---|---|---|
| `index.ts` | あり | あり | 同等 |
| `index.parts.ts` | あり | あり | 同等 |
| `handle.ts` | あり | あり | 実装に差異あり |
| `root/AlertDialogRoot.tsx` | あり | あり | 実装アプローチが異なる |
| `root/AlertDialogRoot.test.tsx` | あり (793行) | あり (4テスト) | テスト数に大きな差 |
| `root/AlertDialogRoot.spec.tsx` | あり (型テスト) | **なし** | 欠落 |

サブコンポーネント（Backdrop, Close, Description, Popup, Portal, Title, Trigger, Viewport）は Dialog から再エクスポートされており、Solid版もReact版も同じパターン。

---

## 2. AlertDialogRoot レビュー

### 2.1 実装比較

#### 良い点
- Dialog コンポーネントのラッパーとして正しく設計されている
- `modal={true}`, `role="alertdialog"`, `disablePointerDismissal={true}` の3つの固定プロパティが正しく設定
- 型定義で `modal`, `role`, `disablePointerDismissal` を Props から Omit している
- Solid 2 Context 構文を使用（Dialog 側に委譲）

#### 問題点

**[HIGH] handle.ts の実装差異**
- React版:
  ```ts
  new DialogHandle<Payload>(new DialogStore<Payload>({
    modal: true,
    disablePointerDismissal: true,
    role: 'alertdialog',
  }));
  ```
  → DialogStore に alert-dialog 固有の設定を渡して Handle を構築
- Solid版:
  ```ts
  return createDialogHandle<Payload>();
  ```
  → 汎用の `createDialogHandle` をそのまま呼び出し。**`modal`, `disablePointerDismissal`, `role` が設定されない**
- これにより、handle経由でダイアログを制御する際に alert-dialog の制約（外部クリックで閉じない等）が Handle 側に反映されない可能性がある
- ただし、Root で `disablePointerDismissal={true}` 等を強制しているため、Root経由では正しく動作する

**[MEDIUM] DialogStore ベースの状態管理の欠如**
- React版: `AlertDialogRoot` は独自に `DialogStore` を作成し、`useDialogRoot` フックで状態管理
  - `useControlledProp`, `useSyncedValue`, `useContextCallback` で制御可能な状態同期
  - ネストされたダイアログのサポート（`parentDialogRootContext`）
  - `onOpenChangeComplete` コールバックのサポート
- Solid版: `DialogRoot` コンポーネントにそのまま委譲
  - これ自体は正しいアプローチだが、`DialogRoot` 側の実装品質に依存
  - `onOpenChangeComplete` の対応状況は DialogRoot 次第

**[LOW] `actionsRef` の型差異**
- React版: `React.RefObject<AlertDialogRoot.Actions | null>`
- Solid版: `AlertDialogRootActionsRef` (= `DialogRootActionsRef`)
- Solid独自のref型を使用。動作に影響なし

**[LOW] `ChangeEventDetails` の `preventUnmountOnClose` 欠落の可能性**
- React版の `AlertDialogRootChangeEventDetails` には `preventUnmountOnClose()` メソッドが含まれる
- Solid版は `DialogRootChangeEventDetails` をそのまま使用。`preventUnmountOnClose` の有無は Dialog 側の実装次第

---

## 3. テストカバレッジ比較

| テストケース | base-ui | solid | 備考 |
|---|---|---|---|
| ARIA属性 (role, labelledby, describedby) | あり | あり | OK |
| onOpenChange: open/close | あり | **なし** | 欠落 |
| onOpenChange: reason (trigger-press, close-press) | あり | **なし** | 欠落 |
| onOpenChange: reason (escape-key) | あり | あり | OK |
| 外部クリックで閉じない | あり | あり | OK |
| actionsRef: unmount | あり | **なし** | 欠落 |
| 複数トリガー (Root内) | あり (3テスト) | **なし** | 欠落 |
| 複数デタッチドトリガー | あり (3テスト) | **なし** | 欠落 |
| Handle: open/close | あり | **なし** | 欠落 |
| Handle: payload | あり | あり (handle経由テスト) | OK |
| Handle: openWithPayload | あり | **なし** | 欠落 |
| Handle: backdrop クリックでの非閉じ | あり | **なし** | 欠落 |
| モーダル動作 (inert) | あり | **なし** | 欠落 |
| onOpenChangeComplete (アニメなし) | あり | **なし** | 欠落 |
| onOpenChangeComplete (アニメあり) | あり (2テスト) | **なし** | 欠落 |
| Conformance テスト | あり (`popupConformanceTests`) | **なし** | 欠落 |
| 型テスト (spec.tsx) | あり | **なし** | 欠落 |

### Solid版の独自テスト（base-uiにない）
- handle 経由の detached trigger テスト（payload表示とClose動作）

---

## 4. 重要度別サマリ

### HIGH
1. **`createAlertDialogHandle` が alert-dialog 固有設定を渡していない** — Handle 経由の制御時に modal/disablePointerDismissal/role が設定されない

### MEDIUM
2. DialogStore ベースの状態管理パターンの違い（Solid版は DialogRoot に完全委譲）

### LOW
3. `preventUnmountOnClose` の対応状況要確認
4. 型テスト欠落

### テスト欠落（14件）
- onOpenChange の open/close コールバック、reason の検証
- actionsRef（unmount/close）
- 複数トリガー（Root内/デタッチド）
- Handle の imperative API テスト
- モーダル動作、アニメーション完了コールバック
- Conformance / 型テスト
