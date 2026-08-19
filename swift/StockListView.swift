import SwiftUI

struct StockItem: Identifiable, Codable {
    var id = UUID()
    var name: String
    var quantity: Int
    var expiryDate: Date?
}

struct StockListView: View {
    @Environment(\.dismiss) private var dismiss

    @State private var items: [StockItem] = [
        StockItem(name: "卵", quantity: 6, expiryDate: Date().addingTimeInterval(86400 * 3)),
        StockItem(name: "牛乳", quantity: 1, expiryDate: Date().addingTimeInterval(86400 * 5)),
        StockItem(name: "納豆", quantity: 3, expiryDate: Date().addingTimeInterval(86400 * 7))
    ]
    @State private var showingAddItem = false

    var body: some View {
        VStack(spacing: 0) {
            HStack {
                Button(action: { dismiss() }) {
                    Image(systemName: "chevron.left")
                        .font(.title2)
                }
                .buttonStyle(PlainButtonStyle())
                Spacer()
                Text("ストック管理")
                    .font(.headline)
                Spacer()
                Button(action: { showingAddItem = true }) {
                    Image(systemName: "plus")
                        .font(.title2)
                }
                .buttonStyle(PlainButtonStyle())
            }
            .padding()
            .background(Color.secondary.opacity(0.05))

            List {
                ForEach(items) { item in
                    HStack {
                        VStack(alignment: .leading) {
                            Text(item.name)
                                .font(.headline)
                            if let expiry = item.expiryDate {
                                Text("期限: \(expiry, style: .date)")
                                    .font(.caption)
                                    .foregroundColor(expiry < Date() ? .red : .secondary)
                            }
                        }
                        Spacer()
                        Text("x \(item.quantity)")
                            .font(.subheadline)
                            .bold()
                    }
                    .padding(.vertical, 4)
                }
                .onDelete(perform: deleteItems)
            }
            .listStyle(InsetListStyle())
        }
        .toolbar(.hidden)
        .sheet(isPresented: $showingAddItem) {
            AddStockItemView { newItem in
                items.append(newItem)
            }
        }
    }

    private func deleteItems(at offsets: IndexSet) {
        items.remove(atOffsets: offsets)
    }
}

struct AddStockItemView: View {
    @Environment(\.dismiss) private var dismiss

    let onAdd: (StockItem) -> Void

    @State private var name = ""
    @State private var quantity = 1
    @State private var hasExpiryDate = false
    @State private var expiryDate = Date()

    private var trimmedName: String {
        name.trimmingCharacters(in: .whitespaces)
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            Text("ストックを追加")
                .font(.headline)

            VStack(alignment: .leading, spacing: 4) {
                Text("品目名")
                    .font(.caption)
                    .opacity(0.6)
                TextField("例: 卵", text: $name)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
            }

            Stepper("個数: \(quantity)", value: $quantity, in: 1...99)

            Toggle("賞味期限を設定", isOn: $hasExpiryDate)

            if hasExpiryDate {
                DatePicker("期限", selection: $expiryDate, displayedComponents: .date)
            }

            Spacer()

            HStack {
                Spacer()
                Button("キャンセル") { dismiss() }
                Button("追加") {
                    onAdd(StockItem(
                        name: trimmedName,
                        quantity: quantity,
                        expiryDate: hasExpiryDate ? expiryDate : nil
                    ))
                    dismiss()
                }
                .keyboardShortcut(.defaultAction)
                .disabled(trimmedName.isEmpty)
            }
        }
        .padding()
        .frame(minWidth: 320, minHeight: 300)
    }
}

#Preview {
    StockListView()
}
