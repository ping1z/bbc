const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StaffSchema = new Schema({
  email: String,
  password: String,
  isActive: Boolean,
  roles: Schema.Types.Mixed,
  staffId: String,
  name: String,
  personalId: String,
  avatar: String,
  gender: Number,
  tel: String,
  birthday: { type: Date, default: Date.now },
  address: String,
  emergencyContact: {
    name: String,
    tel: String,
    address: String
  },
  department: String,
  team: String,
  title: String,
});

module.exports = mongoose.model('Staff', StaffSchema);
