const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const InvoiceStatus = require('../constant').InvoiceStatus;

const InvoiceInfoSchema = new Schema({
  status: { type: Number, default: InvoiceStatus.Pending },
  clientId: String,
  clientRef: String,
  clientName: String,
  tel: String,
  email: String,
  address: String,
  suburb: String,
  price: Number,
  paymentType: { type: String, default: "cash" },
  invoiceNeeded: Boolean,
  invoiceTitle: String,
  serviceDate: Date,
  serviceStartTime: String,
  creatorId: String,
  createdTime: { type: Date, default: Date.now },
  lastModifiedTime: { type: Date, default: Date.now },
});

module.exports = mongoose.model('InvoiceInfo', InvoiceInfoSchema);
