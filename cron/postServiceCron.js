const cronJob = require('cron').CronJob;
const _ = require('lodash');
const models = require('../models');
const logger = require('../logger');
const mongoose = require('mongoose');
const Client = mongoose.model('Client');
const ServiceInfo = mongoose.model('ServiceInfo');
const FrequencyType = require('../constant').FrequencyType;
const ServiceStatus = require('../constant').ServiceStatus;
const InvoiceInfo = mongoose.model('InvoiceInfo');
const InvoiceStatus = require('../constant').InvoiceStatus;

const MONGO_URI = require('../secret').MONGO_URI;

if (!MONGO_URI) {
  throw new Error('You must provide a MongoLab URI');
}

mongoose.Promise = global.Promise;
mongoose.connect(MONGO_URI);
mongoose.connection
  .once('open', () => console.log('Connected to MongoLab instance.'))
  .on('error', error => console.log('Error connecting to MongoLab:', error));

const toAusTime = function (date) {
  return new Date(date.getTime() + 3600000 * 10);
}

// everyday 1:05 am
//var schedule = '0 5 1 * * *';
//var schedule = '*/5 * * * * *';
var schedule = '0 0 1 * * *';
var job = new cronJob(schedule, function () {
  try {
    logger.info("start [Post Service] Job...");
    let p = ServiceInfo.find({
      status: ServiceStatus.Pending,
      serviceDate: {
        $lte: new Date(),
      }
    }).exec();

    p.then(function (r) {
      _.forEach(r, function (service) {
        if (service.isConfirmed) {
          if (service.invoiceNeeded) {
            let invoice = new InvoiceInfo({
              status: InvoiceStatus.Pending,
              clientId: service.clientId,
              clientRef: service.clientRef,
              clientName: service.clientName,
              tel: service.tel,
              email: service.email,
              address: service.address,
              suburb: service.suburb,
              price: service.price,
              paymentType: service.paymentType,
              invoiceNeeded: service.invoiceNeeded,
              invoiceTitle: service.invoiceTitle,
              serviceDate: service.serviceDate,
              serviceStartTime: service.serviceStartTime,
              teamId: service.teamId,
              notes: service.notes,
              jobDetail: service.jobDetail,
              creatorId: "auto",
            });

            let p1 = invoice.save();
            p1.then(function (r) {
            }).catch(function (e) {
              throw e;
            });
          }
          service.status = ServiceStatus.Completed;
        } else {
          service.status = ServiceStatus.Cancelled;
        }
        let p = service.save();
        p.then(function (r) {
        }).catch(function (e) {
          throw e;
        });
      });
    }).catch(function (e) {
      throw e;
    });
  } catch (e) {
    logger.error(e);
  };
});

job.start();
module.exports = job;
