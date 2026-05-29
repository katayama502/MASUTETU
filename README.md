# ます鉄（益田市電鉄）

益田市の店舗・作家・ランドマーク情報を、ブラウザ上の独自すごろく体験として紹介するプロトタイプです。

## コンセプト

- サイコロで盤面を移動し、停止したマスに紐づく店舗・作家情報を即時表示します。
- 第三者の商標・キャラクター・カード名・UI表現を使わず、名称・演出・アイテム・勝利条件を独自設計しています。
- フェーズ1はJSON + Netlifyなどの静的配信を想定し、将来的にFirestore / Supabaseなどへ差し替えられるデータ分離構成です。

## 技術構成

- 依存関係なしの静的HTML/CSS/JavaScript
- 店舗データ: `src/data/spots.json`
- 盤面: CSS/SVGで描画するオリジナル抽象マップ

## 開発コマンド

```bash
npm run dev
npm run check:data
npm run build
```


## Netlifyで公開する

このリポジトリは `netlify.toml` を同梱しているため、Netlifyに接続すると以下の設定で静的公開できます。

- Build command: `npm run build`
- Publish directory: `dist`
- Node.js: `22`

### Git連携で公開する手順

1. Netlifyで「Add new site」→「Import an existing project」を選びます。
2. このGitリポジトリを選択します。
3. Build command が `npm run build`、Publish directory が `dist` になっていることを確認します。
4. Deployを実行します。

### 手元でNetlify用ビルドを確認する

```bash
npm run check:data
npm run build
python3 -m http.server 8888 -d dist
```

その後、`http://localhost:8888/` を開くと、Netlifyに配置される成果物と同じ内容を確認できます。`dist/` にはNetlifyのドラッグ&ドロップ公開でも使える `_headers` と `_redirects` も生成されます。

## データ更新方針

1. `src/data/spots.json` に店舗・作家・ランドマーク情報を追加します。
2. Pull Requestで掲載同意・画像権利・リンク先を確認します。
3. 更新頻度が高くなった段階で、同じデータ形状を保ったままBaaS読み込みへ移行します。

## 権利・運用チェック

- 既存ゲームのタイトル、キャラクター、カード名、セリフ、画面構成、画像素材は使用しません。
- 実在店舗情報は掲載同意と撤去依頼時のSLAを前提に運用します。
- 画像や作家情報は提供元・許諾範囲を記録してから公開します。
