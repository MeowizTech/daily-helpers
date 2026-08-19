# Daily Helpers

日常のちょっとした「迷い」と「面倒」を片付ける、モバイル前提の Web アプリ。

買い物のコスパ比較・食材ストックの管理・献立などの決定を、1 つのアプリの中から選んで使える。
PWA なのでホーム画面に追加でき、一度開けばオフラインでも動く。

## 技術スタック

| 項目 | 内容 |
| --- | --- |
| ビルド | Vite 7 |
| UI | React 19 + TypeScript（strict） |
| スタイル | Tailwind CSS v4（`@theme` でトークン定義） |
| ルーティング | 自前のハッシュルーター（`src/lib/router.ts`、依存ゼロ） |
| 永続化 | localStorage |
| Lint / Format | Biome |
| テスト | Vitest + Testing Library（happy-dom） |
| オフライン | 自前の Service Worker（`public/sw.js`、依存ゼロ） |
| アイコン | `scripts/generate-icons.mjs` で PNG を生成（依存ゼロ） |

### なぜ Next.js ではないか

3 機能すべてがクライアント完結で、サーバ側の処理・データ取得・認証が一切ない。
Next.js を使っても SSR / Server Actions は出番がなく、フレームワークの JS だけ増える。
モバイル回線での初回表示を優先して Vite + SPA を選んだ。

同じ理由で、ルーターと Service Worker はライブラリを入れず数十行の自前実装にしている
（`react-router` / `vite-plugin-pwa` は 4 画面のこの規模には過剰）。

### バンドルサイズ

初回ロードで取得する分の合計は **約 70KB（gzip）**。うち約 66KB が React 本体。

`react` / `react-dom` を `preact/compat` にエイリアスすると **約 19KB（gzip）** まで落ちる（実測）。
ただしその場合 `@testing-library/react` が本物の react-dom を掴んでテストが 26 件失敗するため、
`@testing-library/preact` への差し替えが併せて必要になる。現状は React のまま。

## 機能

### 買い物比較（`src/features/unit-price/`）

商品 A / B の「価格」と「量」から **100 単位あたりの価格**を出し、どちらが割安かを判定する。

- 結論（「商品A が 20% 割安」）を画面最上部に置く。買い物中に見たいのは単価そのものより、どちらを取るか
- 全角数字（`４５０`）と桁区切り（`1,280`）を受け付ける。スマホの日本語入力を想定
- 0・負数・非数値は「未入力」として扱い、4 つ揃うまで結果を出さない
- `inputMode="decimal"` で数値キーパッドを出す

### ストック管理（`src/features/stock/`）

食材・日用品の在庫を、期限が近い順に並べて管理する。

- 期限は `Date` ではなく `YYYY-MM-DD` 文字列で保持し、タイムゾーン差の影響を受けないようにしている
- 残り日数を日本語で表示（`今日が期限` / `明日が期限` / `4日前に期限切れ` / `あと6日`）
- 期限切れは赤、3 日以内は橙。色だけに頼らないよう左端のバーと文言も併せて変える
- 個数の増減、削除、追加に対応。品目名が長い場合は省略表示＋`title` で全文を保持
- localStorage の内容は読み込み時に検証し、壊れた要素だけ捨てて残りは活かす

### 決定ルーレット（`src/features/decision/`）

選択肢の中から 1 つをランダムに選ぶ。「今日何食べる？」を終わらせるやつ。

- 結果を画面の主役として最大サイズで表示
- 追加時に前後の空白と連続空白を正規化し、重複・空・上限（20 個）は理由付きで弾く
- 1.2 秒の「考え中…」演出を挟む。`prefers-reduced-motion: reduce` の環境では即座に結果を出す

### メニュー（`src/features/menu/`）

3 機能のうち時間で状況が変わるのはストックだけなので、**期限が迫っている品目を主役として最上部に出す**。
急ぐものがなければ 1 行に落とし、道具の一覧は補助として下に並べる。

## 設計方針

### 色の役割

```
無彩色 (bg / surface / line / fg / ink)  = 構造と操作（CTA も無彩色）
彩度のある色 (ok / warn / danger)        = 状態のみ
```

「色が付いていたら、それは状態を示している」と 1 文で説明できる状態を保つ。
ネイティブ版は機能ごとに青・緑・紫を割り当てていたが、その色は意味を持っていなかったため廃止した。

トークンは `src/index.css` の `@theme` に定義し、ダークモードは `prefers-color-scheme` で同じ変数名を上書きする。
Web フォントは読み込まず system font stack を使う（転送量とレイアウトシフトの回避）。

Tailwind のクラス走査は `@source` で `src/` に限定している。自動検出のままだと
`scripts/` のコメントや識別子（`filter: none` / `CRC_TABLE` など）をクラス名として拾い、
使われない CSS が 1.2KB ほど混ざる。

### アイコン

`scripts/generate-icons.mjs` が図形を直接ラスタライズして PNG を書き出す（`node:zlib` のみ、依存ゼロ）。
SVG ラスタライザを環境に前提できないため、変換ツールを挟まず生成器そのものをリポジトリに置いている。

図案は「3 本の横線（持ち物のリスト）＋ 最下段の琥珀色の点（期限の警告）」。
このアプリで最初に見せたい情報がストックの期限であることを、そのまま形にしている。

| ファイル | 用途 | 形式 |
| --- | --- | --- |
| `icon-192.png` / `icon-512.png` | manifest の `purpose: any` | 角丸・外側は透明（RGBA） |
| `icon-maskable-512.png` | manifest の `purpose: maskable` | 全面塗り・前景は中央 90%（RGB） |
| `apple-touch-icon.png` | iOS のホーム画面 | 全面塗り（RGB、透明チャンネルなし） |
| `icon.svg` | favicon | ベクター |

- 4x4 のスーパーサンプリングで縁を滑らかにし、乗算済みアルファで平均してから戻すことで透明部分のフリンジを避ける
- 全面が不透明なものは RGB で書き出す（Apple は touch icon の透明を推奨していない）
- maskable の前景は中心から最大 0.31（安全域の半径は 0.4）に収めている

図案を変えたら `npm run icons` で再生成する。

### ディレクトリ構成

```
src/
├── main.tsx                    # エントリポイント + Service Worker 登録
├── App.tsx                     # ルートによる画面切り替え
├── index.css                   # デザイントークン（@theme）
├── lib/
│   ├── router.ts               # ハッシュルーター
│   └── use-local-storage.ts    # localStorage 同期 state
├── components/                 # 画面をまたぐ UI（Screen / Field / EmptyState）
└── features/
    ├── menu/
    ├── unit-price/             # unit-price.ts（純関数）+ *-screen.tsx（UI）
    ├── stock/
    └── decision/
```

各 feature は「ロジックの純関数モジュール」と「画面コンポーネント」に分ける。
計算・判定・バリデーションは純関数側に置き、そこを単体テストの対象にする。

## 開発

```sh
npm install
npm run dev        # 開発サーバ
npm test           # 単体 + レンダリングテスト（63 件）
npm run typecheck  # tsc --noEmit
npm run check      # Biome（lint + format 自動修正）
npm run build      # 型チェック → 本番ビルド
npm run preview    # ビルド結果の確認
npm run icons      # PWA アイコン PNG の再生成
```

Service Worker は本番ビルドでのみ登録されるため、オフライン動作の確認は `npm run build && npm run preview` で行う。

## 未確認・未対応

- **ブラウザでの目視確認をしていない**。型チェック・Biome・テスト 63 件・本番ビルドは通っているが、
  実機やブラウザでの表示・PWA インストールは未検証
- ストックの品目名・期限の編集は未対応（追加・削除・個数の増減のみ）
- 単価比較は 2 商品固定。単位（g / ml / 個）の切り替えにも未対応

## ネイティブ版（`swift/`）

もとは SwiftUI の macOS / iOS アプリだった。そのソースは `swift/` に残している。

Web 版への移植で意図的に変えた点:

| | SwiftUI 版 | Web 版 |
| --- | --- | --- |
| メニュー | 3 機能を均等なカードで並べる | 期限が近いストックを主役に、道具は補助 |
| 機能色 | 青 / 緑 / 紫（意味なし） | 廃止。色は状態のみに使う |
| 期限の型 | `Date?` | `YYYY-MM-DD` 文字列（タイムゾーン非依存） |
| 永続化 | なし | localStorage |
| 個数の編集 | 不可 | 増減ボタン |

`swift/` 側のビルド方法は git 履歴の `1e02c40` 時点の README を参照。

## ライセンス

未定。
