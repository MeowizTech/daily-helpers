import SwiftUI

struct UnitPriceView: View {
    @Environment(\.dismiss) private var dismiss

    @State private var price1: String = ""
    @State private var weight1: String = ""
    @State private var price2: String = ""
    @State private var weight2: String = ""

    var body: some View {
        VStack(spacing: 25) {
            HStack {
                Button(action: { dismiss() }) {
                    Image(systemName: "chevron.left")
                        .font(.title2)
                }
                .buttonStyle(PlainButtonStyle())
                Spacer()
                Text("買い物比較")
                    .font(.headline)
                Spacer()
                Spacer().frame(width: 32)
            }
            .padding()

            VStack(spacing: 20) {
                ComparisonCard(title: "商品 A", price: $price1, weight: $weight1, color: .blue)
                ComparisonCard(title: "商品 B", price: $price2, weight: $weight2, color: .green)
            }
            .padding(.horizontal)

            ResultView(price1: price1, weight1: weight1, price2: price2, weight2: weight2)

            Spacer()
        }
        .background(Color.secondary.opacity(0.05).ignoresSafeArea())
        .toolbar(.hidden)
    }
}

struct ComparisonCard: View {
    let title: String
    @Binding var price: String
    @Binding var weight: String
    let color: Color

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(.subheadline)
                .foregroundColor(color)
                .bold()

            HStack {
                VStack(alignment: .leading) {
                    Text("価格 (円)")
                        .font(.caption)
                        .opacity(0.6)
                    TextField("例: 450", text: $price)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                }

                VStack(alignment: .leading) {
                    Text("量 (g/ml)")
                        .font(.caption)
                        .opacity(0.6)
                    TextField("例: 200", text: $weight)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                }
            }
        }
        .padding()
        .background(Color.secondary.opacity(0.1))
        .cornerRadius(15)
        .shadow(radius: 2)
    }
}

struct ResultView: View {
    let price1: String
    let weight1: String
    let price2: String
    let weight2: String

    var body: some View {
        let p1 = Double(price1) ?? 0
        let w1 = Double(weight1) ?? 0
        let p2 = Double(price2) ?? 0
        let w2 = Double(weight2) ?? 0

        if p1 > 0 && w1 > 0 && p2 > 0 && w2 > 0 {
            let unit1 = p1 / w1 * 100
            let unit2 = p2 / w2 * 100

            VStack(spacing: 15) {
                Text("100g/ml あたりの価格")
                    .font(.caption)
                    .opacity(0.7)

                HStack(spacing: 40) {
                    ResultValue(label: "商品 A", value: unit1, isCheaper: unit1 < unit2)
                    ResultValue(label: "商品 B", value: unit2, isCheaper: unit2 < unit1)
                }

                Text(unit1 < unit2 ? "商品 A がお得！" : (unit2 < unit1 ? "商品 B がお得！" : "どちらも同じです"))
                    .font(.headline)
                    .foregroundColor(unit1 == unit2 ? .primary : .orange)
                    .padding(.top, 10)
            }
            .padding()
            .frame(maxWidth: .infinity)
            .background(Color.orange.opacity(0.1))
            .cornerRadius(15)
            .padding(.horizontal)
        } else {
            Text("価格と量を入力して比較してください")
                .font(.caption)
                .opacity(0.5)
                .padding()
        }
    }
}

struct ResultValue: View {
    let label: String
    let value: Double
    let isCheaper: Bool

    var body: some View {
        VStack {
            Text(label)
                .font(.caption2)
            Text(String(format: "%.1f 円", value))
                .font(.system(size: 24, weight: .bold, design: .rounded))
                .foregroundColor(isCheaper ? .orange : .primary)
            if isCheaper {
                Text("安い!")
                    .font(.caption2)
                    .bold()
                    .foregroundColor(.orange)
            }
        }
    }
}

#Preview {
    UnitPriceView()
}
