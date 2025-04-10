# Tampermonkey スクリプト開発テンプレート (Vite + TypeScript + Docker 版)

このリポジトリは、Vite, TypeScript, Docker を使用して Tampermonkey Userscript を開発するためのテンプレートです。効率的で型安全、かつ環境差異のない一貫した開発ワークフローを実現します。

[English](./README.md)

## ✨ クイックスタート (開発者向け)

**前提条件:** Docker および Docker Compose がインストールされていること。

1.  **クローンまたはテンプレート利用:**
    - GitHub 上で "Use this template" ボタンをクリックするか、
    - リポジトリをクローン: `git clone git@github.com:0xfab0131/browser-shortcuts.git`
    - `cd browser-shortcuts`
2.  **依存関係のインストール (Docker イメージ構築):**
    ```bash
    make build # 一度ビルドしてイメージを準備
    # または dev サーバー起動でもビルドされます:
    # make dev
    ```
3.  **初期化 (任意 - 新規スクリプト作成時):**
    ```bash
    make init # 対話形式のプロンプトに従ってください
    ```
4.  **開発 (ホットリロード、GM\_\* API 不可):**
    ```bash
    make dev
    ```
    - コンソール URL から `....proxy.user.js` を Tampermonkey にインストール。
    - `./src` 内のファイルを編集。変更はホットリロードされます。
    - **制限:** `GM_*` API (例: `GM_setClipboard`) はここでは**動作しない**可能性が高いです。
5.  **GM\_\* API のテスト (手動更新):**
    ```bash
    make build
    ```
    - Tampermonkey でプロキシスクリプトを無効化/削除。
    - 生成された `dist/tampermonkey-scripts.user.js` を手動インストール。
    - 対象ページで GM 機能をテスト。
    - 繰り返す場合: コード編集 → `make build` → Tampermonkey スクリプト更新。

## ⭐ 特徴

- **Docker による一貫した開発環境**
- **Makefile による簡略化されたワークフロー** (`make dev`, `make init`, `make build`, `make remove`)
- **Vite による高速な開発サーバーとビルド**
- **TypeScript による型安全な開発**
- **`src/keybindings.ts` でのキーバインド集中管理**
- **スクリプト例:**
  - ページ情報コピー (`Ctrl+Alt+U` / `Ctrl+Alt+I`)
  - LibreChat 新規プロンプト (`Ctrl+Alt+L`)
- **`vite-plugin-monkey` による簡単な Userscript メタデータ管理**
- **ローカルでのホットリロードによる効率的な開発フロー** (GM\_\* API を除く部分、Docker ボリュームマウント経由)
- **スクリプト開発に適した明確なプロジェクト構造**
- **`make dev` 時のポート競合検出**

## 🚀 詳細な使い方

### 前提条件

- Docker ([Docker のインストール](https://docs.docker.com/engine/install/))
- Docker Compose ([Docker Compose のインストール](https://docs.docker.com/compose/install/))
- Tampermonkey ブラウザ拡張機能

### Makefile コマンド

- `make help`: 利用可能なコマンドを表示します。
- `make dev`: 開発サーバーを起動します (UI/ロジック開発用、GM API は動作しない可能性大)。
- `make stop`: 開発サーバーコンテナを停止します。
- `make logs`: 開発サーバーコンテナのログを追跡表示します。
- `make init`: `src/template.user.ts` を基に対話的に新しいスクリプトを初期化します。
- `make remove`: `src` ディレクトリからスクリプトファイルを対話的に削除します。
- `make build`: `dist` ディレクトリに本番用ユーザースクリプトをビルドします (GM API テストに必要)。
- `make clean`: `dist` ディレクトリを削除し、オプションで node_modules/コンテナも削除します。
- `make rebuild`: Docker イメージを強制的に再ビルドし、開発サーバーを再起動します。

### 開発ワークフロー解説

このプロジェクトでは、Vite 開発プロキシ環境での `GM_*` API アクセスに関する制限のため、**2 段階の開発アプローチ**を採用しています。

1.  **フェーズ 1: コアロジック・UI 開発 (`make dev`)**

    - `GM_setClipboard`, `GM_notification`, `GM_xmlHttpRequest` などを**直接使用しない**機能の開発には `make dev` を使用します。
    - コンソール URL から `*.proxy.user.js` スクリプトを Tampermonkey にインストールします。
    - `./src` 内の `.ts` ファイルを編集します。変更はブラウザにホットリロードされ、迅速な UI とロジックのイテレーションが可能です。
    - **重要:** `GM_*` API を使用するコードに取り組む際は、実行すると `ReferenceError` が発生する可能性が高いため、このフェーズ中は呼び出しを一時的に `console.log` に置き換えるか、コメントアウトしてください。

2.  **フェーズ 2: GM API テスト・最終デバッグ (`make build`)**
    - `GM_*` API を含む機能をテストまたはデバッグする必要がある場合：
      a. **`make build`** を実行します。これにより、最終的なユーザースクリプトが `./dist` に生成されます。
      b. Tampermonkey ダッシュボードで、開発用 `*.proxy.user.js` スクリプトを**無効化または削除**します。
      c. 生成された **`dist/tampermonkey-scripts.user.js`** （または `dist/main.user.js`）ファイルを手動で Tampermonkey にインストールします。
      d. 対象ページをリロードし、`GM_*` 機能の動作をテストします。
      e. 修正が必要な場合：`./src` 内のコードを編集し、**再度ステップ (a) (`make build`) を実行**し、Tampermonkey 内のスクリプトを**手動で更新**（通常、インストール済みスクリプトを編集して新しいコードを貼り付け、保存）します。

### 本番用スクリプトのビルド

- `make build` を実行します。最終的なインストール可能なスクリプトは `./dist` ディレクトリ (`<package名>.user.js` と `<package名>.meta.js`) に生成されます。
- `.user.js` ファイルを Tampermonkey に手動でインストールできます。
- **自動更新:** もし `dist` フォルダの内容をホスティング（例: GitHub Pages や raw コミットアクセス経由）し、ホストされた `.user.js` の URL からスクリプトをインストールした場合、スクリプトのメタデータに定義された `@updateURL`（`.meta.js` を指す）を使用して Tampermonkey が自動的に更新をチェックします。

## 📁 プロジェクト構造

```
browser-shortcuts/
├── dist/             # ビルド出力ディレクトリ (make build で作成)
├── src/
│   ├── main.ts       # メインエントリーポイント (他のスクリプトを import)
│   ├── copy-page-info.ts # 機能スクリプト例
│   ├── librechat-new.ts  # LibreChat スクリプト例
│   ├── template.user.ts # `make init` 用テンプレート
│   └── keybindings.ts  # キーバインド設定ファイル
├── .dockerignore     # Docker ビルドコンテキストから除外するファイル
├── .gitignore        # Git 除外設定
├── Dockerfile        # dev および build 用の Docker イメージを定義
├── docker-compose.yml # 開発サービスを定義
├── Makefile          # 簡単なコマンドを提供 (dev, build, init, remove など)
├── package.json      # プロジェクト設定
├── README.md         # ドキュメント (英語)
├── README.ja.md      # このドキュメント (日本語)
├── tsconfig.json     # TypeScript 設定
└── vite.config.ts    # Vite 設定 (Userscript メタデータ含む)
```

## 🛡️ セキュリティ上の注意点

- **権限の最小化:** `vite.config.ts` (`userscript.grant`) では、スクリプトに必要な `GM_*` 権限のみを付与してください。
- **外部ライブラリ:** 外部ライブラリを使用する場合は注意が必要です。信頼できるソースからのものであることを確認してください。
- **機密情報:** スクリプトに機密データを直接保存しないでください。Tampermonkey の安全なストレージ (`GM_setValue`/`GM_getValue`) を使用してください。

## ❤️ プロジェクトへの支援

このテンプレートが役立つと感じたり、これを使って開発されたスクリプトを利用したりする場合は、ぜひサポートをご検討ください！

- **⭐ GitHub でリポジトリにスターを付ける**
- **(任意) 開発者を支援する:**
  - [![GitHub Sponsors](https://img.shields.io/github/sponsors/0xfab0131?style=social)](https://github.com/sponsors/0xfab0131)
  - _[他の寄付リンクがあればここに追加 (例: Patreon, Ko-fi)]_

あなたのサポートが、このプロジェクトの維持と改善に繋がります。ありがとうございます！🙏

## 📜 ライセンス

リポジトリルートにある LICENSE ファイル (`git@github.com:0xfab0131/browser-shortcuts.git`) を参照してください。
