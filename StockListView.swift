import SwiftUI

struct StockItem: Identifiable, Codable {
    var id = UUID()
    var name: String
    var quantity: Int
    var expiryDate: Date?
}

struct StockListView: some View {
    @State private var items: [StockItem] = [
        StockItem(name: "卵", quantity: 6, expiryDate: Date().addingTimeInterval(86400 * 3)),
        StockItem(name: "牛乳", quantity: 1, expiryDate: Date().addingTimeInterval(86400 * 5)),
        StockItem(name: "納豆", quantity: 3, expiryDate: Date().addingTimeInterval(86400 * 7))
    ]
    @State private var showingAddItem = false
    @State private var newItemName = ""
    
    var body: some View {
        VStack(spacing: 0) {
            HStack {
                Button(action: {}) {
                    Image(systemName: "chevron.left")
                        .font(.title2)
                }
                .buttonStyle(PlainButtonStyle())
                Spacer()
                Text("ストック管理")
                    .font(.headline)
                Spacer()
                Button(action: { showingAddItem.toggle() }) {
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
    }
    
    func deleteItems(at offsets: IndexSet) {
        items.remove(atOffsets: offsets)
    }
}
