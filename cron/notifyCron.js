var cronJob = require('cron').CronJob;
const _ = require('lodash');
var models = require('../models');
const mongoose = require('mongoose');
const Client = mongoose.model('Client');
const Notification = mongoose.model('Notification');

const MONGO_URI = require('../secret').MONGO_URI;

if (!MONGO_URI) {
  throw new Error('You must provide a MongoLab URI');
}

mongoose.Promise = global.Promise;
mongoose.connect(MONGO_URI);
mongoose.connection
  .once('open', () => console.log('Connected to MongoLab instance.'))
  .on('error', error => console.log('Error connecting to MongoLab:', error));

var job = new cronJob('*/5 * * * * *', function () {
  console.log("start Notify Job...");
  let p = Client.find({ isActive: true }).exec();
  p.then(function (r) {
    _.forEach(r, function (c) {
      Notification.UpdateBirthdayNotify(c);
      Notification.UpdateCleanNotify(c);
    });
  }).catch(function (e) {
    console.error(e);
  });
});

job.start();
