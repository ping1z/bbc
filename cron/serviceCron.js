var cronJob = require('cron').CronJob;
const _ = require('lodash');
var models = require('../models');
const mongoose = require('mongoose');
const Client = mongoose.model('Client');
const ServiceInfo = mongoose.model('ServiceInfo');
const FrequencyType = require('../constant').FrequencyType;
const ServiceStatus = require('../constant').ServiceStatus;
const Util = require('../util');

const MONGO_URI = require('../secret').MONGO_URI;

if (!MONGO_URI) {
  throw new Error('You must provide a MongoLab URI');
}

mongoose.Promise = global.Promise;
mongoose.connect(MONGO_URI);
mongoose.connection
  .once('open', () => console.log('Connected to MongoLab instance.'))
  .on('error', error => console.log('Error connecting to MongoLab:', error));

// every month
var job = new cronJob('*/5 * * * * *', function () {
  console.log("start Service Job...");
  let p = Client.find({ isActive: true }).exec();
  p.then(function (r) {
    _.forEach(r, function (c) {
      let frequencyType = c.jobDetail.frequency;
      if (frequencyType == FrequencyType.WhenNeed) {
        return;
      }
      let teamId = "";
      let today = Util.toAusTime(new Date());
      ServiceInfo.findLastRegularService(c._id, function (ls) {
        let nsd = c.serviceDate;
        if (ls != null) {
          if (frequencyType == FrequencyType.Weekly) {
            nsd = ls.serviceDate.setDate(ls.serviceDate.getDate() + 7);
          } else if (frequencyType == FrequencyType.Fortnightly) {
            nsd = ls.serviceDate.setDate(ls.serviceDate.getDate() + 14);
          } else if (frequencyType == FrequencyType.Monthly) {
            nsd = ls.serviceDate.setMonth(ls.serviceDate.getMonth() + 1);
          } else if (frequencyType == FrequencyType.TwiceAWeek) {
            nsd = ls.serviceDate.setDate(ls.serviceDate.getDate() + 3);
          }
          teamId = ls.teamId;
        }

        if (nsd > today
          && nsd <= today.setDate(today.getDate() + 14)) {
          let nst = c.serviceTime;

          let service = new ServiceInfo({
            status: ServiceStatus.Pending,
            isConfirmed: false,
            clientId: c._id,
            clientRef: c.ref,
            clientName: c.name,
            tel: c.tel,
            email: c.email,
            address: c.address,
            suburb: c.suburb,
            price: c.price,
            paymentType: c.paymentType,
            invoiceNeeded: c.invoiceNeeded,
            invoiceTitle: c.invoiceTitle,
            serviceDate: nsd,
            serviceStartTime: nst,
            teamId: teamId,
            notes: c.notes,
            jobDetail: c.jobDetail,
            creatorId: "auto",
          });

          let p1 = service.save();

          p1.then(function (r) {
            //cb && cb(r);
          }).catch(function (e) {
            throw e;
          });
        }
      })
    });
  }).catch(function (e) {
    console.error(e);
  });
});

job.start();
//module.exports = job;
