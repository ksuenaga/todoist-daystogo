# Todoist Days To Go

Todoistのタスク一覧に、締切/期日までの残り日数を表示するユーザースクリプトです。

![表示例](screenshot.png)

## 機能

- タスクの日付表示の右側に「○日前」「○日後」などを表示
- 残り日数に応じた色分け
  - 🔴 過去/今日: 赤色
  - 🟠 3日以内: オレンジ色
  - 🔵 1週間以内: 青色
  - ⚫ それ以上: グレー

## インストール

### 1. Tampermonkey をインストール

Chrome ウェブストアから [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) をインストールしてください。

### 2. ユーザースクリプトをインストール

以下のいずれかの方法でインストールできます：

#### 方法A: 直接インストール

1. [todoist-days-to-go.user.js](./todoist-days-to-go.user.js) を開く
2. 「Raw」ボタンをクリック
3. Tampermonkey のインストール画面が表示されるので「インストール」をクリック

#### 方法B: 手動インストール

1. Tampermonkey のダッシュボードを開く（ブラウザのツールバーアイコン → ダッシュボード）
2. 「+」タブをクリックして新しいスクリプトを作成
3. [todoist-days-to-go.user.js](./todoist-days-to-go.user.js) の内容をコピー&ペースト
4. Ctrl+S (Cmd+S) で保存

## 使い方

インストール後、Todoistを開くと自動的に動作します。

## カスタマイズ

スクリプト冒頭の `CONFIG` オブジェクトで設定を変更できます：

```javascript
const CONFIG = {
    // 表示形式: 'before' = "○日前/○日後", 'after' = "あと○日", 'D-' = "D-○"
    format: 'before',
    // 更新間隔（分）
    updateInterval: 1000,
    // デバッグモード（コンソールにログを出力）
    debug: false
};
```

### 表示形式の例

| format | 過去 | 今日 | 未来 |
|--------|------|------|------|
| `'before'` | 3日前 | 今日 | 3日後 |
| `'after'` | 3日前 | 今日 | あと3日 |
| `'D-'` | 3日前 | 今日 | D-3 |

## トラブルシューティング

### バッジが表示されない場合

1. Tampermonkey が有効になっているか確認
2. todoist.com でスクリプトが有効になっているか確認（Tampermonkeyアイコン → 該当スクリプトにチェック）
3. ページをリロード
4. `CONFIG.debug = true` にしてコンソールログを確認

### Todoistの更新で動作しなくなった場合

TodoistのDOM構造が変更された可能性があります。Issue を立てていただければ対応します。

## 技術的な仕組み

1. MutationObserver でDOM変更を監視
2. タスク要素から日付情報を抽出（複数の方法でフォールバック）
3. 今日との日数差を計算
4. 日付表示の右側にバッジを追加

## ライセンス

MIT License

## 貢献

Issue や Pull Request を歓迎します！
