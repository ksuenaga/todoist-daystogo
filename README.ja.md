# Todoist Days To Go

Todoistのタスク一覧に、締切/期日までの残り日数を表示するユーザースクリプトです。

[English](README.md) | 日本語 | [中文](README.zh.md)

![スクリーンショット](screenshot.png)

## 機能

- タスクの日付表示の右側に「○日前」「○日後」などを表示
- 残り日数に応じた色分け：
  - 🔴 過去/今日：赤色
  - 🟠 3日以内：オレンジ色
  - 🔵 1週間以内：青色
  - ⚫ それ以上：グレー
- **多言語対応**：日本語、英語、中国語

## インストール

### 1. Tampermonkey をインストール

Chrome ウェブストアから [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) をインストールしてください。

### 2. ユーザースクリプトをインストール

以下のいずれかの方法でインストールできます：

#### 方法A：直接インストール

1. [todoist-days-to-go.user.js](./todoist-days-to-go.user.js) を開く
2. 「Raw」ボタンをクリック
3. Tampermonkey のインストール画面が表示されるので「インストール」をクリック

#### 方法B：手動インストール

1. Tampermonkey のダッシュボードを開く（ブラウザのツールバーアイコン → ダッシュボード）
2. 「+」タブをクリックして新しいスクリプトを作成
3. [todoist-days-to-go.user.js](./todoist-days-to-go.user.js) の内容をコピー＆ペースト
4. Ctrl+S（Macの場合はCmd+S）で保存

## 使い方

インストール後、Todoistを開くと自動的に動作します。

## カスタマイズ

スクリプト冒頭の `CONFIG` オブジェクトで設定を変更できます：

```javascript
const CONFIG = {
    // 言語：'ja'（日本語）、'en'（英語）、'zh'（中国語）
    language: 'ja',
    // 表示形式：'before'、'after'、'D-'
    format: 'before',
    // 更新間隔（ミリ秒）
    updateInterval: 1000,
    // デバッグモード（コンソールにログを出力）
    debug: false
};
```

### 言語オプション

| language | 表示例 |
|----------|--------|
| `'ja'` | 3日前、今日、3日後 |
| `'en'` | 3d ago、Today、in 3d |
| `'zh'` | 3天前、今天、3天后 |

### 表示形式オプション

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