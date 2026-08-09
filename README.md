# ことば島の大ぼうけん

小学生向けの、ブラウザで遊べるタイピング学習ゲームです。

小学1〜6年生の漢字を使った例文をローマ字で入力しながら島を探検します。正確さや速度に応じてスコアが増え、お宝を見つけたり、いきものと出会ったりします。iPadと外付けキーボードでの利用を主な対象としています。

**公開版:** [ことば島の大ぼうけんをプレイ](https://adventure-typing-9azkia6f2-ma38sus-projects.vercel.app/)

## 主な機能

- 1〜6年生、各6コースの段階的な問題
- 文章練習の前に遊べる、清音・濁音・半濁音・拗音の1文字ローマ字練習
- 漢字のルビと、小学校で学ぶヘボン式ローマ字の表示
- `shi / si`、`chi / ti`、文脈に応じた`n / nn`などの入力表記揺れ
- 正解位置、入力済みローマ字、間違えたキーの表示
- 苦手キー・得意キー・速度・正確さの記録
- 苦手キーを集中的に練習する復習モード
- コーススコアと累積GP（がんばりポイント）
- お宝・いきもの・コース限定レア報酬の図鑑
- 複数ユーザーの端末内登録と進捗比較
- 問題・コースごとの学習履歴
- 冒険者、歩行、休憩、発見などの演出と効果音

## 技術構成

- Vite
- React 19
- TypeScript
- React Router
- Vitest
- Oxlint
- CSS

学習記録とユーザー情報はサーバーへ送信せず、ブラウザの`localStorage`へ保存します。プロフィールごとに記録を分離し、旧形式のデータも移行処理を通して読み込みます。

## 開発

Node.jsを用意して、依存関係をインストールします。

```bash
npm install
npm run dev
```

通常は `http://localhost:5173/` で開発画面を確認できます。

## 検証

```bash
npm test
npm run lint
npm run build
```

テストでは、ローマ字入力の表記揺れ、スコア、グレード境界、報酬抽選、プロフィール保存と移行処理を確認しています。

本番ビルドは`dist/`へ出力されます。

## 素材

- 配信用画像：`public/`
- 編集用の高解像度素材：`artwork/`

配信用画像はiPadでの読み込み負荷を抑えるためWebPへ変換しています。高解像度PNGは配信対象外の`artwork/`に保管しています。

## Vercelへの公開（推奨）

このアプリはVite製のSPAとして、そのままVercelへ公開できます。Next.jsへの移行は不要です。

`vercel.json`に全画面を`index.html`へ戻すSPAリライトを設定しているため、`/play`や`/collection`を直接開いた場合や再読み込みした場合もReact Routerが処理します。

VercelでGitリポジトリを読み込み、次の設定でデプロイします。

```text
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
```

ローカルでVercel CLIを使う場合は、プロジェクトルートで`vercel`を実行します。高解像度の編集素材がデプロイへ混ざらないよう、`.vercelignore`で`artwork/`を除外しています。

GitHub Actionsでは、`main`へのpushとPull Requestごとにテスト、lint、本番ビルドを実行します。

## 主なソース

```text
src/
  App.tsx                    画面とゲーム進行
  questions.ts              学年・コース別の問題
  romajiVariants.ts          ローマ字入力候補の生成
  kanaPractice.ts            段階別の1文字ローマ字教材
  KanaPracticePage.tsx       ローマ字の島
  scoring.ts                 スコア計算
  ranks.ts                   探検家グレード
  rewards.ts                 お宝・いきもの・抽選条件
  domain.ts                  共通データ型
  game/gameRunReducer.ts     タイピング中の一時状態と状態遷移
  game/useGameRunState.ts    reducer操作用のReactフック
  game/courseConfig.ts       学年・コース共通設定
  pages/                     タイトル・図鑑・問題一覧などの画面
  components/game/           入力・冒険演出・結果表示などの部品
  storage/profileStorage.ts  ローカル保存と移行処理
```

`App.tsx`はプロフィール、保存済み統計、ルーティングとゲーム進行を接続するコンテナです。タイピング中の一時状態は`gameRunReducer`、画面表示は`pages/`と`components/game/`へ分割しています。
