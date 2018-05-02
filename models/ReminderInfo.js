const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReminderInfoSchema = new Schema({
  ovenDate: Date,
  blindsDate: Date,
  fridgeDate: Date,
  wardrobesDate: Date,
  rangeHoodDate: Date,
  windowsDate: Date,
  pantryDate: Date,
  carpetDate: Date,
  kitchenDate: Date,
  others: String,
});

module.exports = ReminderInfoSchema;
