const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const JobDetailSchema = require('./JobDetail');
const ReminderInfoSchema = require('./ReminderInfo');

const JobDetail = mongoose.model('JobDetail', JobDetailSchema);
const ReminderInfo = mongoose.model('ReminderInfo', ReminderInfoSchema);

const ClientSchema = new Schema({
  ref: String,
  name: String,
  tel: String,
  email: String,
  birthday: { type: Date, default: new Date(null) },
  address: String,
  suburb: String,
  isActive: Boolean,
  startDate: { type: Date, default: Date.now },
  startPrice: Number,
  serviceDate: { type: Date, default: Date.now },
  serviceTime: {type: String, default: "10:00"},
  price: Number,
  notes: String,
  paymentType: {type: String, default: "cash"},
  invoiceNeeded: Boolean,
  invoiceTitle: String,
  jobDetail: {type: JobDetailSchema, default: new JobDetail()},
  reminderInfo: {type: ReminderInfoSchema, default: new ReminderInfo()},
  creatorId: String,
  createdTime: { type: Date, default: Date.now },
  lastModifiedTime: { type: Date, default: Date.now },
  available: Boolean,
});

var generateClientRef = function()
{
    randNum = ("00000000" + Math.random() * 99999999).slice(-8);
    ref = randNum.slice(0, 4) + '-' + randNum.slice(4);

    return ref;
}

ClientSchema.statics.createClient = function() {
  const Client = mongoose.model('Client');
  newClient = new Client();
  newClient.ref = generateClientRef();

  var promise = newClient.save();

  return promise;
};

ClientSchema.statics.updateInfo = function(id, updates) {
  const Client = mongoose.model('Client');
  updates.lastModifiedTime = Date.now();
  updates.available = true;
  return Client.findByIdAndUpdate(id, updates, {new: true});
}

module.exports = mongoose.model('Client', ClientSchema);