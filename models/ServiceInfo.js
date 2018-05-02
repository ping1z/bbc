const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const logger = require('../logger');
const JobDetailSchema = require('./JobDetail');
const FrequencyType = require('../constant').FrequencyType;
const ServiceStatus = require('../constant').ServiceStatus;

const ServiceInfoSchema = new Schema({
  status: { type: Number, default: ServiceStatus.Pending },
  isConfirmed: { type: Boolean, default: false },
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
  serviceDate: { type: Date, default: Date.now },
  serviceStartTime: { type: String, default: "10:00" },
  teamId: String,
  notes: String,
  jobDetail: JobDetailSchema,
  creatorId: String,
  createdTime: { type: Date, default: Date.now },
  lastModifiedTime: { type: Date, default: Date.now },
});

ServiceInfoSchema.statics.findLastRegularService = function (clientId, cb) {
  try {
    let ServiceInfo = mongoose.model('ServiceInfo');

    let p = ServiceInfo.findOne({
      clientId: clientId,
      "jobDetail.frequency": { $ne: FrequencyType.WhenNeed },
    }).sort([['serviceDate', -1]]).exec();

    p.then(function (r) {
      cb && cb(r);
    }).catch(function (e) {
      throw e;
    });
  } catch (e) {
    logger.error(e);
    throw e;
  }
}

module.exports.ServiceStatus = ServiceStatus;
module.exports.ServiceInfoSchema = mongoose.model('ServiceInfo', ServiceInfoSchema);
