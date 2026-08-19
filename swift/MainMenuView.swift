import SwiftUI

struct MainMenuView: View {
    var body: some View {
        NavigationStack {
            ZStack {
                Color.secondary.opacity(0.05).ignoresSafeArea()

                VStack(spacing: 30) {
                    Text("Daily Helpers")
                        .font(.system(size: 40, weight: .bold, design: .rounded))
                        .padding(.top, 40)

                    VStack(spacing: 20) {
                        NavigationLink(destination: UnitPriceView()) {
                            MenuButtonView(title: "買い物比較", icon: "cart.fill", color: .blue)
                        }
                        .buttonStyle(PlainButtonStyle())

                        NavigationLink(destination: StockListView()) {
                            MenuButtonView(title: "ストック管理", icon: "archivebox.fill", color: .green)
                        }
                        .buttonStyle(PlainButtonStyle())

                        NavigationLink(destination: DecisionView()) {
                            MenuButtonView(title: "決定ルーレット", icon: "dice.fill", color: .purple)
                        }
                        .buttonStyle(PlainButtonStyle())
                    }
                    .padding(.horizontal, 40)

                    Spacer()
                }
            }
            .toolbar(.hidden)
        }
        .frame(minWidth: 400, minHeight: 600)
    }
}

struct MenuButtonView: View {
    let title: String
    let icon: String
    let color: Color

    var body: some View {
        HStack {
            Image(systemName: icon)
                .font(.title2)
                .foregroundColor(color)
            Text(title)
                .font(.headline)
                .foregroundColor(.primary)
            Spacer()
            Image(systemName: "chevron.right")
                .font(.caption)
                .foregroundColor(.secondary)
                .opacity(0.5)
        }
        .padding()
        .frame(maxWidth: .infinity)
        .background(Color.secondary.opacity(0.1))
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(color.opacity(0.3), lineWidth: 1)
        )
    }
}

#Preview {
    MainMenuView()
}
