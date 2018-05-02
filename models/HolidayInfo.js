const _ = require('lodash');
const mongoose = require('mongoose');
const http = require("http");
const Schema = mongoose.Schema;
const logger = require('../logger');
const HolidayInfoSchema = new Schema({
  title: { type: String, default: "" },
  start: { type: String, default: "" },
});

HolidayInfoSchema.statics.loadHolidayData = function () {
  http.get('http://www.webcal.fi/cal.php?id=136&format=json&start_year=2018&end_year=next_year&tz=Australia%2FSydney', (resp) => {
    let data = '';

    // A chunk of data has been recieved.
    resp.on('data', (chunk) => {
      data += chunk;
    });

    // The whole response has been received. Print out the result.
    resp.on('end', () => {
      let HolidayInfo = mongoose.model('HolidayInfo');
      let list = JSON.parse(data);
      list = _.map(list, function (v) {
        return new HolidayInfo({
          title: v.name,
          start: v.date,
        });
      });
      let remove = HolidayInfo.collection.remove({});

      remove.then(function () {
        let save = HolidayInfo.collection.insert(list);
        save.then(function (r) {
          // saved
        }).catch(function (e) {
          throw e;
        });
      }).catch(function (e) {
        throw e;
      });
    });

  }).on("error", (e) => {
    logger.error(e);
    throw e;
  });
}

module.exports = mongoose.model('HolidayInfo', HolidayInfoSchema);
