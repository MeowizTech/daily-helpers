# Daily Helpers

日常のちょっとした「迷い」と「面倒」を片付ける、SwiftUI 製のミニツール集アプリ。

買い物のコスパ比較・食材ストックの管理・献立などの決定を、1 つのアプリの中から選んで使える。

## 技術スタック

| 項目 | 内容 |
| --- | --- |
| 言語 | Swift |
| UI フレームワーク | SwiftUI (`@main` + `WindowGroup`) |
| 想定プラットフォーム | macOS（`InsetListStyle` / `minWidth: 400, minHeight: 600` などデスクトップ前提の指定あり） |
| 外部依存 | なし（標準フレームワークのみ） |
| 永続化 | なし（現状すべて `@State` のインメモリ保持） |

## 機能

### 買い物比較（`UnitPriceView.swift`）

商品 A / B の「価格」と「量（g・ml）」を入力すると、**100g（100ml）あたりの単価**を計算してどちらがお得か判定する。

- 単価は `価格 ÷ 量 × 100` で算出
- 安い方をオレンジでハイライトし、「商品 A がお得！」と結論を表示
- 4 つの値すべてが 0 より大きいときのみ結果を表示（未入力時はプレースホルダ）

### ストック管理（`StockListView.swift`）

食材・日用品の在庫を一覧管理する。

- 品目名 / 個数 / 賞味期限を保持する `StockItem`（`Identifiable`, `Codable`）
- 期限切れの品目は日付を赤字で表示
- スワイプ削除（`onDelete`）に対応
- 起動時は卵・牛乳・納豆のサンプルデータ入り

### 決定ルーレット（`DecisionView.swift`）

選択肢の中から 1 つをランダムに選ぶ。「今日何食べる？」を終わらせるやつ。

- 初期選択肢は 中華 / 和食 / イタリアン / コンビニ
- 選択肢の追加・削除に対応
- 「スタート！」で 1.5 秒の "考え中..." 演出をはさみ、`randomElement()` で結果を spring アニメーション付きで表示

## ファイル構成

```
.
├── DailyHelpersApp.swift   # アプリのエントリポイント（@main）。MainMenuView を表示
├── MainMenuView.swift      # 3 機能へのハブ画面 + メニューボタン（MenuButtonView）
├── UnitPriceView.swift     # 買い物比較（ComparisonCard / ResultView / ResultValue を内包）
├── StockListView.swift     # ストック管理（StockItem モデルを内包）
└── DecisionView.swift      # 決定ルーレット
```

`NavigationView` + `NavigationLink` によるスタック遷移で、メインメニューから各機能へ移動する。

## セットアップ

このリポジトリには **Xcode プロジェクト（`.xcodeproj`）も `Package.swift` も含まれていない**ため、ビルドするには自分でプロジェクトを用意する必要がある。

1. Xcode で新規プロジェクトを作成（App / Interface: SwiftUI / Language: Swift）
2. 生成された `ContentView.swift` と `〜App.swift` を削除
3. このリポジトリの `.swift` ファイル 5 つをすべてターゲットに追加
4. Run（⌘R）

## 既知の課題

現状のコードはそのままではビルドが通らない。着手する場合はここから。

- **型宣言が不正**: `struct MainMenuView: some View` のように、プロトコル準拠部分が `View` ではなく `some View` になっている（`MainMenuView` / `MenuButtonView` / `UnitPriceView` / `ComparisonCard` / `ResultView` / `ResultValue` / `StockListView` / `DecisionView`）。正しくは `: View`。
- **`MenuButtonView` が未完成**: `title` / `icon` / `color` のプロパティ宣言と `var body` / `Button { }` の開始部分が欠落しており、括弧の対応も崩れている。
- **`ResultView` の `body` が非 View 構文**: `if` の各分岐が `return` されておらず、ViewBuilder として成立していない。また `let diff = abs(unit1 - unit2)` は宣言のみで未使用。
- **戻るボタンが未実装**: 各画面のヘッダーにある `chevron.left` は `Button(action: {})` の空アクション。`@Environment(\.dismiss)` を使うか、`NavigationView` 標準の戻るボタンに任せる。
- **データが揮発する**: ストック品目・ルーレットの選択肢はアプリ終了で消える。`StockItem` は `Codable` 準拠済みなので、`UserDefaults` や JSON ファイルへの保存を足せる。
- **API が古い**: `NavigationView` は非推奨（`NavigationStack` 推奨）。`PreviewProvider` も `#Preview` マクロに置き換え可能。

## ライセンス

未定。
