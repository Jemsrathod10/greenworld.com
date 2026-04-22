// models/StockHistory.js
const stockHistorySchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  previousStock: Number,
  newStock: Number,
  changeAmount: Number,
  reason: { type: String, enum: ['sale', 'restock', 'adjustment'] },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
}); 