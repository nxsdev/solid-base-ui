# CheckboxGroup コンポーネント レビューレポート

**対象**: `packages/solid/src/checkbox-group/`
**比較元**: `../base-ui/packages/react/src/checkbox-group/`
**日付**: 2026-03-06

---

## 1. ファイル構成比較

| ファイル | base-ui (React) | solid-base-ui (Solid) | 備考 |
|---|---|---|---|
| `index.ts` | あり | あり | |
| `index.parts.ts` | あり | **なし** | React版はparts形式 |
| `CheckboxGroup.tsx` | あり | あり | |
| `CheckboxGroupContext.ts` | あり | あり | |
| `CheckboxGroupDataAttributes.ts` | あり | あり | |
| `CheckboxGroup.test.tsx` | あり (702行) | あり (5テスト) | テスト数に大幅な差 |
| `useCheckboxGroupParent.ts` | あり | **なし** | 欠落 |
| `useCheckboxGroupParent.test.tsx` | あり (259行) | **なし** | 欠落 |

---

## 2. CheckboxGroup 実装レビュー

### 2.1 良い点
- Controlled/Uncontrolled パターンが正しく実装
- `onValueChange` でイベント詳細（reason, cancel）をサポート
- Context 経由で子 Checkbox に value/disabled を伝播
- `role="group"` を正しく設定
- `data-disabled` 属性のサポート
- Solid 2 Context 構文を使用

### 2.2 問題点

**[HIGH] `useCheckboxGroupParent` フックの欠如**
- React版: parent checkbox 機能を提供
  - parent checkbox をクリックすると全子チェックボックスが toggle
  - 一部の子が checked の場合、parent は `indeterminate` (mixed) 状態
  - `aria-controls` で子のIDを列挙
  - disabled な子チェックボックスの扱い（checked disabled は uncheck 不可）
  - mixed → all → none → mixed のサイクルロジック
- Solid版: この機能が完全に欠如。`parent` prop のサポートなし

**[HIGH] Field 統合の欠如**
- React版: `useFieldRootContext`, `useFieldControl` で統合
  - `validationMode` (onBlur, onChange, onSubmit) のサポート
  - `aria-labelledby`, `aria-describedby` の自動設定
  - Field.Label / Field.Description との連携
  - フォームバリデーション（native HTML validation, custom validation）
- Solid版: Field 統合なし

**[MEDIUM] props 分割代入によるリアクティビティの問題**
```tsx
const elementProps = createMemo(() => {
  const {
    render: _render,
    disabled: _disabled,
    value: _value,
    defaultValue: _defaultValue,
    onValueChange: _onValueChange,
    ...rest
  } = props;
  void _render;
  // ...
  return rest;
});
```
- `createMemo` 内ではあるが、`omitProps` パターンに統一すべき
- `void` で未使用変数を抑制するのは冗長

**[MEDIUM] `allValues` prop の欠如**
- React版: `allValues` prop で全てのチェックボックス値を宣言的に指定可能
  - parent checkbox がすべての子を認識するために使用
- Solid版: この prop が存在しない

**[MEDIUM] Context の設計差異**
- React版: `CheckboxGroupContext` は `value`, `defaultValue`, `setValue`, `allValues`, `parent`, `disabled`, `validation`, `registerControlRef` を含む
- Solid版: `value`, `setGroupValue`, `disabled` の3つのみ
- `parent`, `validation`, `registerControlRef` が欠落
- Context の `useCheckboxGroupContext` が optional 形式（`null` を返す可能性）— これはReact版と同様の設計

**[LOW] `aria-labelledby` / `aria-describedby` の欠如**
- React版: `useFieldControlValidation` 経由で自動設定
- Solid版: なし

---

## 3. テストカバレッジ比較

| テストケース | base-ui | solid | 備考 |
|---|---|---|---|
| Conformance テスト | あり | **なし** | 欠落 |
| Controlled value トグル | あり | あり | OK |
| onValueChange コールバック | あり | あり | OK |
| defaultValue（uncontrolled） | あり | あり | OK |
| disabled: 全体 | あり | あり | OK |
| disabled: data-disabled | あり | あり | OK |
| disabled: 優先度（個別 vs グループ） | あり | **なし** | 欠落 |
| Field: validationMode=onSubmit | あり | **なし** | 欠落 |
| Field: validationMode=onChange | あり | **なし** | 欠落 |
| Field: validationMode=onBlur | あり | **なし** | 欠落 |
| Field: 外部制御値変更時のrevalidate | あり | **なし** | 欠落 |
| Field.Label: 暗黙的関連付け | あり | **なし** | 欠落 |
| Field.Label: 明示的関連付け | あり | **なし** | 欠落 |
| Field.Description | あり | **なし** | 欠落 |
| Form: 送信時の値 | あり | **なし** | 欠落 |
| Form: group バリデーション | あり | **なし** | 欠落 |
| Form: エラー時のフォーカス | あり | **なし** | 欠落 |
| Form: parent 除外 | あり | **なし** | 欠落 |
| useCheckboxGroupParent: 親トグル | あり | **なし** | 欠落（機能なし） |
| useCheckboxGroupParent: mixed 状態 | あり | **なし** | 欠落 |
| useCheckboxGroupParent: aria-controls | あり | **なし** | 欠落 |
| useCheckboxGroupParent: disabled 子の扱い | あり | **なし** | 欠落 |
| useCheckboxGroupParent: サイクルロジック | あり | **なし** | 欠落 |

---

## 4. 重要度別サマリ

### HIGH
1. **`useCheckboxGroupParent` の欠如** — parent checkbox 機能（全選択/全解除/mixed状態）がない
2. **Field 統合の欠如** — バリデーション、ラベル/説明の自動関連付けがない

### MEDIUM
3. `allValues` prop の欠如
4. Context 提供値の不足（parent, validation, registerControlRef）
5. props 分割代入パターンの非統一

### LOW
6. `aria-labelledby` / `aria-describedby` の自動設定なし
7. `index.parts.ts` の欠如

### テスト欠落（20件以上）
- Conformance テスト
- Field 統合テスト全般
- Form 統合テスト全般
- useCheckboxGroupParent テスト全般
- disabled 優先度テスト
