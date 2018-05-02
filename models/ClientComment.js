const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ClientCommentSchema = new Schema({
  clientId: String,
  authorId: { type: String, default: "" },
  authorName: { type: String, default: "" },
  authorTitle: { type: String, default: "" },
  createdTime: { type: Date, default: Date.now },
  content: String,
});

module.exports = mongoose.model('ClientComment', ClientCommentSchema);
