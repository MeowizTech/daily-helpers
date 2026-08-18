# Daily Helpers

日常のちょっとした「迷い」と「面倒」を片付ける、SwiftUI 製のミニツール集アプリ。

買い物のコスパ比較・食材ストックの管理・献立などの決定を、1 つのアプリの中から選んで使える。

## 技術スタック

| 項目 | 内容 |
| --- | --- |
| 言語 | Swift |
| UI フレームワーク | SwiftUI (`@main` + `WindowGroup` + `NavigationStack`) |
| 対応プラットフォーム | macOS 13.0+ / iOS 16.0+（両ターゲットで型チェック確認済み） |
| 外部依存 | なし（標準フレームワークのみ） |
| 永続化 | なし（現状すべて `@State` のインメモリ保持） |

最低要件は `NavigationStack` と `toolbar(_:for:)` に由来する。それより前の OS を対象にする場合はこの 2 つを差し替える必要がある。

## 機能

### 買い物比較（`UnitPriceView.swift`）

商品 A / B の「価格」と「量（g・ml）」を入力すると、**100g（100ml）あたりの単価**を計算してどちらがお得か判定する。

- 単価は `価格 ÷ 量 × 100` で算出
- 安い方をオレンジでハイライトし、「商品 A がお得！」と結論を表示
- 4 つの値すべてが 0 より大きいときのみ結果を表示（未入力時はプレースホルダ）

### ストック管理（`StockListView.swift`）

食材・日用品の在庫を一覧管理する。

- 品目名 / 個数 / 賞味期限を保持する `StockItem`（`Identifiable`, `Codable`）
- ヘッダーの ＋ ボタンから追加シート（`AddStockItemView`）を開き、品目名・個数・賞味期限（任意）を指定して登録
- 期限切れの品目は日付を赤字で表示
- スワイプ削除（`onDelete`）に対応
- 起動時は卵・牛乳・納豆のサンプルデータ入り

### 決定ルーレット（`DecisionView.swift`）

選択肢の中から 1 つをランダムに選ぶ。「今日何食べる？」を終わらせるやつ。

- 初期選択肢は 中華 / 和食 / イタリアン / コンビニ
- 選択肢の追加（重複・空白のみは弾く）・削除に対応
- 「スタート！」で 1.5 秒の "考え中..." 演出をはさみ、`randomElement()` で結果を spring アニメーション付きで表示

## ファイル構成

```
.
├── DailyHelpersApp.swift   # アプリのエントリポイント（@main）。MainMenuView を表示
├── MainMenuView.swift      # 3 機能へのハブ画面 + メニューボタン（MenuButtonView）
├── UnitPriceView.swift     # 買い物比較（ComparisonCard / ResultView / ResultValue を内包）
├── StockListView.swift     # ストック管理（StockItem モデル / AddStockItemView を内包）
└── DecisionView.swift      # 決定ルーレット
```

`NavigationStack` + `NavigationLink` によるスタック遷移で、メインメニューから各機能へ移動する。各画面は独自のヘッダー（戻る `chevron.left` + タイトル）を持つため、標準のナビゲーションバーは `.toolbar(.hidden)` で隠している。戻る操作は `@Environment(\.dismiss)` 経由。

## セットアップ

このリポジトリには **Xcode プロジェクト（`.xcodeproj`）も `Package.swift` も含まれていない**ため、ビルドするには自分でプロジェクトを用意する必要がある。

1. Xcode で新規プロジェクトを作成（App / Interface: SwiftUI / Language: Swift）
2. 生成された `ContentView.swift` と `〜App.swift` を削除
3. このリポジトリの `.swift` ファイル 5 つをすべてターゲットに追加
4. Deployment Target を macOS 13.0（または iOS 16.0）以上に設定
5. Run（⌘R）

### Xcode なしで型チェックだけしたい場合

```sh
SDK=$(xcrun --show-sdk-path --sdk macosx)
swiftc -typecheck -sdk "$SDK" -target arm64-apple-macos13.0 *.swift
```

`#Preview` マクロの展開には Xcode のマクロプラグインサーバが必要なため、環境によっては `#Preview` 部分のみ展開に失敗することがある。その場合もアプリ本体のコードには影響しない。

## 今後の課題

- **データが揮発する**: ストック品目・ルーレットの選択肢はアプリ終了で消える。`StockItem` は `Codable` 準拠済みなので、`UserDefaults` や JSON ファイルへの保存を足せる。
- **ストック品目を編集できない**: 追加と削除のみ対応。個数の増減や期限の変更には未対応。
- **単価比較が 2 商品固定**: 3 つ以上の比較や、単位（g / ml / 個）の切り替えには未対応。
- **テストがない**: 単価計算（`ResultView` の `p / w * 100`）はロジックを型から切り出せば単体テストしやすい。

## ライセンス

未定。
