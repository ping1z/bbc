const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InvoiceHistorySchema = new Schema({
  clientId: String,
  clientRef: String,
  clientName: String,
  tel: String,
  email: String,
  address: String,
  suburb: String,
  price: Number,
  paymentType: { type: String, default: "cash" },
  invoiceTitle: String,
  invoiceDate: { type: Date, default: Date.now },
  invoiceYM: String,
  items: {
    type: Array,
    default: []
  },
  total: Number,
  gst: Number,
  creatorId: { type: String, default: "auto" },
  createdTime: { type: Date, default: Date.now },
  lastModifiedTime: { type: Date, default: Date.now },
});

module.exports = mongoose.model('InvoiceHistory', InvoiceHistorySchema);
