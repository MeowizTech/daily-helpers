import SwiftUI

struct MainMenuView: some View {
    var body: some View {
        NavigationView {
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
                        
                        NavigationLink(destination: StockListView()) {
                            MenuButtonView(title: "ストック管理", icon: "archivebox.fill", color: .green)
                        }
                        
                        NavigationLink(destination: DecisionView()) {
                            MenuButtonView(title: "決定ルーレット", icon: "dice.fill", color: .purple)
                        }
                    }
                    .padding(.horizontal, 40)
                    
                    Spacer()
                }
            }
            .navigationTitle("")
            .navigationBarHidden(true)
        }
        .frame(minWidth: 400, minHeight: 600)
    }
}

struct MenuButtonView: some View {
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
        .buttonStyle(PlainButtonStyle())
    }
}

struct MainMenuView_Previews: PreviewProvider {
    static var previews: some View {
        MainMenuView()
    }
}
