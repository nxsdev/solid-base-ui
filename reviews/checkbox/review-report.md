# Checkbox コンポーネント レビューレポート

**対象**: `packages/solid/src/checkbox/`
**比較元**: `../base-ui/packages/react/src/checkbox/`
**日付**: 2026-03-06

---

## 1. ファイル構成比較

| ファイル | base-ui (React) | solid-base-ui (Solid) | 備考 |
|---|---|---|---|
| `index.ts` | あり | あり | 同等 |
| `index.parts.ts` | あり | あり | 同等 |
| `root/CheckboxRoot.tsx` | あり (473行) | あり (285行) | |
| `root/CheckboxRootContext.ts` | あり | あり | |
| `root/CheckboxRootDataAttributes.ts` | あり | あり | |
| `root/CheckboxRoot.test.tsx` | あり (1072行) | あり (216行) | テスト数に大幅な差 |
| `indicator/CheckboxIndicator.tsx` | あり | あり | |
| `indicator/CheckboxIndicator.test.tsx` | あり (294行) | あり (94行) | |
| `indicator/CheckboxIndicatorDataAttributes.ts` | あり | あり | |
| `utils/useStateAttributesMapping.ts` | あり | **なし** | Solid版は直接属性設定 |

---

## 2. CheckboxRoot レビュー

### 2.1 良い点
- hidden `<input type="checkbox">` でフォーム統合を維持
- `uncheckedValue` による unchecked 時の送信値サポート
- `indeterminate` 状態のサポート
- CheckboxGroup Context との連携
- `nativeButton` による ID の帰属先制御
- キーボード（Enter, Space）でのトグル
- 包括的な data attributes（checked, unchecked, indeterminate, disabled, readonly 等）

### 2.2 問題点

**[HIGH] Field 統合の欠如**
- React版: `useFieldRootContext`, `useFieldControl` で Field.Root/Field.Label/Field.Description と統合
  - touched, dirty, filled, focused 状態の自動追跡
  - validation mode（onBlur, onChange, onSubmit）のサポート
  - `aria-labelledby`, `aria-describedby` の自動設定
- Solid版: Field 関連のコンテキスト統合なし
  - data-touched, data-dirty, data-filled, data-focused は props から手動で取得する前提

**[MEDIUM] props 分割代入パターン**
- CheckboxRoot 内で props を直接アクセス (`props.xxx`) しているのは良い
- ただし一部で props を `omitProps` ではなく手動で個別転送

**[MEDIUM] Indicator のアニメーション/トランジション未実装**
- React版: `useTransitionStatus` + `useOpenChangeComplete` で checked/indeterminate 表示のアニメーション
  - `data-starting-style`, `data-ending-style` が機能
  - `keepMounted` + `mounted` で閉じるアニメーション後にアンマウント
- Solid版: `<Show>` + `<Dynamic>` で即座にマウント/アンマウント
  - アニメーションサポートなし
  - `keepMounted` はサポートされている

**[LOW] Context の設計差異**
- React版: `CheckboxRootContext` は `CheckboxRoot.State` をそのまま渡す（plain object）
- Solid版: Accessor を使ったリアクティブ値として渡す（正しいSolid化）

---

## 3. CheckboxIndicator レビュー

### 3.1 良い点
- `keepMounted` prop のサポート
- `render` prop による柔軟なレンダリング
- Root からの状態 data attributes の継承

### 3.2 問題点

**[HIGH] `data-starting-style` / `data-ending-style` が動作しない**
- React版ではトランジションステータスをマッピングして付与
- Solid版はこれらの属性を持つが、トランジション管理がないため常に付与されない

**[LOW] `CheckboxIndicatorDataAttributes` に `startingStyle`/`endingStyle` がない**
- React版には `TransitionStatusDataAttributes` から `startingStyle`, `endingStyle` が含まれる
- Solid版のenum にはこれらがない（実装もないため整合はしている）

---

## 4. テストカバレッジ比較

### CheckboxRoot.test.tsx

| テストケース | base-ui | solid | 備考 |
|---|---|---|---|
| ARIA属性 (role, aria-checked 等) | あり | (暗黙的) | |
| Uncontrolled トグル | あり | あり | OK |
| Controlled 状態 | あり | あり | OK |
| Enter / Space キー | あり | あり | OK |
| onCheckedChange キャンセル | あり | あり | OK |
| disabled | あり | あり | OK |
| readOnly | あり | あり | OK |
| required | あり | あり | OK |
| indeterminate → トグルブロック | あり | あり | OK |
| name/value hidden input | あり | あり | OK |
| uncheckedValue hidden input | あり | あり | OK |
| inputRef | あり | あり | OK |
| ラベル関連付け (for) | あり | あり | OK |
| nativeButton id 関連付け | あり | あり | OK |
| カスタム role | (不明) | あり | Solid独自 |
| ネイティブHTMLバリデーション | あり | **なし** | 欠落 |
| FormData 送信テスト | あり | **なし** | 欠落 |
| ネイティブcheckboxとの一致テスト | あり | **なし** | 欠落 |
| Field.Root 統合 | あり (多数) | **なし** | 欠落（機能自体がない） |
| Field.Label 統合 | あり | **なし** | 欠落 |
| Field.Description 統合 | あり | **なし** | 欠落 |
| Validation mode テスト | あり (3種) | **なし** | 欠落 |
| CheckboxGroup 統合 | あり | **なし** | 別テストで一部カバー |
| Conformance テスト | あり | **なし** | 欠落 |

### CheckboxIndicator.test.tsx

| テストケース | base-ui | solid | 備考 |
|---|---|---|---|
| unchecked 時の非表示 | あり | あり | OK |
| checked 時の表示 | あり | あり | OK |
| indeterminate 時の表示 | あり | あり | OK |
| extra props spread | あり | あり | OK |
| keepMounted | あり | あり | OK |
| state data attributes | あり | あり | OK |
| リアクティブ状態変化 | (暗黙的) | あり | Solid独自 |
| data-starting-style on mount | あり | **なし** | 欠落 |
| data-ending-style on unmount | あり | **なし** | 欠落 |
| アニメーション完了後の削除 | あり | **なし** | 欠落 |
| Conformance テスト | あり | **なし** | 欠落 |

---

## 5. 重要度別サマリ

### HIGH
1. **Field 統合の欠如** — Field.Root, Field.Label, Field.Description との連携がない。validation mode もなし
2. **Indicator のアニメーション/トランジション未実装** — `data-starting-style`/`data-ending-style` が機能しない

### MEDIUM
3. CheckboxGroup の `parent` checkbox ロジック未実装（後述の checkbox-group レポートを参照）
4. ネイティブ HTML バリデーションの欠如
5. FormData 送信テストの欠落

### LOW
6. `useStateAttributesMapping` ユーティリティの不在（直接属性設定で代替）
7. Conformance テスト全般の欠落

### テスト欠落（15件以上）
- フォームバリデーション、FormData送信
- Field 統合テスト全般（touched, dirty, filled, focused, valid, invalid）
- Indicator のアニメーションテスト
- Conformance テスト
