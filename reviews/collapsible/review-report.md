# Collapsible コンポーネント レビューレポート

**対象**: `packages/solid/src/collapsible/`
**比較元**: `../base-ui/packages/react/src/collapsible/`
**日付**: 2026-03-06

---

## 1. ファイル構成比較

| ファイル | base-ui (React) | solid-base-ui (Solid) | 備考 |
|---|---|---|---|
| `index.ts` | あり | あり | 同等 |
| `index.parts.ts` | あり | あり | 同等 |
| `root/CollapsibleRoot.tsx` | あり | あり | |
| `root/useCollapsibleRoot.ts` | あり | **なし** | Solid版はRoot直接実装 |
| `root/CollapsibleRootContext.ts` | あり | あり | |
| `root/stateAttributesMapping.ts` | あり | あり | |
| `root/CollapsibleRoot.test.tsx` | あり | あり (140行) | |
| `trigger/CollapsibleTrigger.tsx` | あり | あり | |
| `trigger/CollapsibleTriggerDataAttributes.ts` | あり | あり | |
| `trigger/CollapsibleTrigger.test.tsx` | あり | あり (38行) | |
| `panel/CollapsiblePanel.tsx` | あり | あり | |
| `panel/useCollapsiblePanel.ts` | あり | **なし** | 欠落 (重要) |
| `panel/CollapsiblePanelDataAttributes.ts` | あり | あり | |
| `panel/CollapsiblePanelCssVars.ts` | あり | あり | |
| `panel/CollapsiblePanel.test.tsx` | あり | あり (65行) | |

---

## 2. CollapsibleRoot レビュー

### 2.1 良い点
- Controlled/Uncontrolled 状態管理が正しく実装
- `onOpenChange` にイベント詳細（reason, cancel）をサポート
- `data-open` / `data-closed` / `data-disabled` を正しく設定
- Context を Solid 2 構文で提供
- Context 値がリアクティブ（Accessor 形式）

### 2.2 問題点

**[HIGH] `useCollapsibleRoot` フックの不在 — アニメーション基盤の完全欠如**

React版の `useCollapsibleRoot` は以下を提供する中核フック:
- `mounted` / `setMounted` — アニメーション中にパネルをDOMに維持
- `visible` / `setVisible` — CSS keyframe アニメーション用の可視性管理
- `transitionStatus` — `"idle"` | `"starting"` | `"ending"` のトランジション状態
- `height` / `width` / `setDimensions` — パネルのサイズ測定（CSS変数に反映）
- `animationTypeRef` — CSS transition / CSS animation / none の検出
- `transitionDimensionRef` — width vs height のどちらがトランジションしているか
- `abortControllerRef` — アニメーションキャンセル制御
- `runOnceAnimationsFinish` — アニメーション完了検知（MutationObserver + RAF）

Solid版にはこれらが一切なく、以下に影響:
1. **Accordion, Dialog 等の全ての Collapsible 依存コンポーネントでアニメーションが動作しない**
2. `--collapsible-panel-height` / `--collapsible-panel-width` CSS変数が常に `"auto"` 固定
3. `data-starting-style` / `data-ending-style` が付与されない
4. 閉じるアニメーション中にパネルが即座にアンマウントされる

**[MEDIUM] `onOpenChange` のシグネチャ差異**
- React版: `onOpenChange(open, eventDetails)` — Root レベルの `handleTrigger` がイベント詳細を自動生成
- Solid版: `onOpenChange(nextOpen, event, trigger, reason)` — 展開された引数形式
- Context を通じて渡されるので、AccordionItem 等の利用側に影響

**[LOW] `CollapsibleRootContext` の提供値差異**
- React版: `useCollapsibleRoot` の戻り値すべて（17+ プロパティ）+ onOpenChange + state + transitionStatus
- Solid版: `open`, `disabled`, `panelId`, `setPanelId`, `onOpenChange`, `state` の6つのみ
- Panel 側でアニメーション関連の値にアクセスできない

---

## 3. CollapsibleTrigger レビュー

### 3.1 良い点
- `aria-expanded`, `aria-controls` の正しい設定
- disabled 状態のハンドリング（prop + context disabled）
- クリックでの toggle 動作

### 3.2 問題点

**[MEDIUM] `useButton` フックの不使用**
- React版: `useButton({ disabled, focusableWhenDisabled: true, native: nativeButton })` を使用
  - `focusableWhenDisabled` でdisabled時もフォーカス可能
  - `nativeButton` 切り替えによる span/button レンダリング
- Solid版: `<button>` 固定で手動実装
  - `focusableWhenDisabled` の挙動がない
  - `nativeButton` prop がない（常にネイティブボタン）

**[LOW] 手動 prop 転送**
- `onClick` のみ転送。その他の HTML属性は `omitProps` + spread で処理すべき

---

## 4. CollapsiblePanel レビュー

### 4.1 良い点
- `keepMounted` / `hiddenUntilFound` の3モード（unmount / hidden / until-found）サポート
- `<Show>` コンポーネントでの条件レンダリング
- CSS変数（`--collapsible-panel-height`, `--collapsible-panel-width`）の定義

### 4.2 問題点

**[HIGH] `useCollapsiblePanel` フック相当の不在**
- React版の `useCollapsiblePanel` が提供する機能:
  - パネルのサイズ測定（`scrollHeight`/`scrollWidth` 読み取り）
  - アニメーション中の `data-starting-style` / `data-ending-style` 属性の制御
  - `hidden` 属性のタイミング制御（アニメーション完了後に設定）
  - `requestAnimationFrame` ベースの同期的なサイズ更新
  - `beforetoggle` / `toggle` イベントハンドリング（`hidden="until-found"` 対応）
- Solid版: これらが全て欠如
  - CSS変数は常に `"auto"` 固定
  - スムーズな開閉アニメーションが不可能

**[MEDIUM] `data-open` / `data-closed` の設定方法**
- React版: `stateAttributesMapping` 経由で自動設定
- Solid版: `getCollapsibleOpenDataAttributes` 関数で直接設定
- 機能的には同等だが、`transitionStatus` 関連の属性が欠落

---

## 5. テストカバレッジ比較

### CollapsibleRoot.test.tsx

| テストケース | base-ui | solid | 備考 |
|---|---|---|---|
| ARIA属性 (trigger↔panel 関連付け) | あり | あり | OK |
| カスタム panel ID | あり | あり | OK |
| disabled 伝播 | あり | あり | OK |
| onOpenChange + キャンセル | あり | あり | OK |
| Controlled 状態 | あり | あり | OK |
| Uncontrolled トグル | あり | あり | OK |
| Conformance テスト | あり | **なし** | 欠落 |
| アニメーション (starting/ending style) | あり | **なし** | 欠落（機能なし） |
| パネルサイズ CSS変数 | あり | **なし** | 欠落（機能なし） |

### CollapsibleTrigger.test.tsx

| テストケース | base-ui | solid | 備考 |
|---|---|---|---|
| ボタンレンダリング + トグル | あり | あり | OK |
| nativeButton=false | あり | あり (ただし限定的) | |
| Conformance テスト | あり | **なし** | 欠落 |

### CollapsiblePanel.test.tsx

| テストケース | base-ui | solid | 備考 |
|---|---|---|---|
| keepMounted: 閉じても DOM に維持 | あり | あり | OK |
| 閉じた時にアンマウント | あり | あり | OK |
| hiddenUntilFound | あり | **なし** | 欠落 |
| アニメーション完了後のアンマウント | あり | **なし** | 欠落 |
| CSS変数の更新 | あり | **なし** | 欠落 |
| Conformance テスト | あり | **なし** | 欠落 |

---

## 6. 重要度別サマリ

### HIGH
1. **`useCollapsibleRoot` アニメーション基盤の完全欠如** — mounted/visible/transitionStatus/dimensions が全てない。Accordion, Dialog 等の全 Collapsible 依存コンポーネントに波及
2. **`useCollapsiblePanel` の不在** — パネルサイズ測定、アニメーション属性制御、hidden タイミング制御がない

### MEDIUM
3. Trigger の `useButton` 不使用 — `focusableWhenDisabled` / `nativeButton` 切り替えなし
4. `onOpenChange` シグネチャの差異（引数展開形式）
5. Context 提供値の不足（アニメーション関連）

### LOW
6. `data-starting-style` / `data-ending-style` が `CollapsiblePanelDataAttributes` enum に定義されているが機能しない
7. Conformance テストの欠落

### テスト欠落（8件）
- Conformance テスト（Root, Trigger, Panel）
- アニメーション関連テスト全般
- CSS変数更新テスト
- hiddenUntilFound テスト

### 影響範囲
**Collapsible はアニメーション基盤として他コンポーネントから使われるため、この欠如は以下に波及:**
- Accordion (Panel)
- Dialog (Popup)
- AlertDialog (Popup)
- Drawer
- Menu
- Popover
- Tooltip
- その他ポップアップ系コンポーネント
