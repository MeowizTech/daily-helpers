import SwiftUI

struct DecisionView: some View {
    @State private var options: [String] = ["中華", "和食", "イタリアン", "コンビニ"]
    @State private var newOption: String = ""
    @State private var result: String? = nil
    @State private var isSpinning = false
    
    var body: some View {
        VStack(spacing: 20) {
            HStack {
                Button(action: {}) {
                    Image(systemName: "chevron.left")
                        .font(.title2)
                }
                .buttonStyle(PlainButtonStyle())
                Spacer()
                Text("決定ルーレット")
                    .font(.headline)
                Spacer()
                Spacer().frame(width: 32)
            }
            .padding()
            
            VStack {
                if let res = result {
                    Text("結果は...")
                        .font(.caption)
                    Text(res)
                        .font(.system(size: 48, weight: .black, design: .rounded))
                        .foregroundColor(.purple)
                        .padding()
                        .transition(.scale.combined(with: .opacity))
                } else {
                    Text("ボタンを押して決定！")
                        .font(.headline)
                        .foregroundColor(.secondary)
                        .frame(height: 100)
                }
            }
            .frame(height: 150)
            
            Button(action: spin) {
                Text(isSpinning ? "考え中..." : "スタート！")
                    .font(.title2)
                    .bold()
                    .foregroundColor(.white)
                    .padding()
                    .frame(maxWidth: .infinity)
                    .background(isSpinning ? Color.gray : Color.purple)
                    .cornerRadius(15)
            }
            .disabled(isSpinning || options.isEmpty)
            .padding(.horizontal)
            
            Divider().padding()
            
            VStack(alignment: .leading) {
                Text("選択肢")
                    .font(.caption)
                    .bold()
                
                HStack {
                    TextField("新しい選択肢", text: $newOption)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                    Button("追加") {
                        if !newOption.isEmpty {
                            options.append(newOption)
                            newOption = ""
                        }
                    }
                    .buttonStyle(BorderedButtonStyle())
                }
                
                ScrollView {
                    VStack(spacing: 8) {
                        ForEach(options, id: \.self) { option in
                            HStack {
                                Text(option)
                                Spacer()
                                Button(action: { options.removeAll(where: { $0 == option }) }) {
                                    Image(systemName: "xmark.circle.fill")
                                        .foregroundColor(.secondary)
                                }
                                .buttonStyle(PlainButtonStyle())
                            }
                            .padding(.horizontal)
                        }
                    }
                }
            }
            .padding(.horizontal)
            
            Spacer()
        }
        .background(Color.secondary.opacity(0.05).ignoresSafeArea())
    }
    
    func spin() {
        withAnimation {
            isSpinning = true
            result = nil
        }
        
        // Simulate spinning delay
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
            withAnimation(.spring()) {
                result = options.randomElement()
                isSpinning = false
            }
        }
    }
}
