var cronJob = require('cron').CronJob;
var models = require('../models');
const mongoose = require('mongoose');
const HolidayInfo = mongoose.model('HolidayInfo');

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
  console.log("start Holiday Job...");
  HolidayInfo.loadHolidayData();
});

job.start();

module.exports = job;
