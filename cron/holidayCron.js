const cronJob = require('cron').CronJob;
const models = require('../models');
const logger = require('../logger');
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
//var schedule = '0 0 0 0 * *';
//var schedule = '0 0 1 * * *';
var schedule = '0 0 1 * * *';
var job = new cronJob(schedule, function () {
  logger.info("start [Holiday] Job...");
  try{
    HolidayInfo.loadHolidayData();
  }catch (e){
    logger.error(e);
  }
});

job.start();
module.exports = job;
