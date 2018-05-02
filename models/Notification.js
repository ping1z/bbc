const _ = require('lodash');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Util = require('../util');
const logger = require('../logger');
const NotificationType = {
  Birthday: "birthday",
  Clean: "clean",
}

const NotificationStatus = {
  Unconfirmed: "unconfirmed",
  Confirmed: "confirmed",
}

const NotificationSchema = new Schema({
  type: String,
  status: { type: String, default: NotificationStatus.Unconfirmed },
  clientId: String,
  clientName: String,
  tel: String,
  email: String,
  address: String,
  suburb: String,
  date: Date,
  items: {
    type: Array,
    default: []
  },
  title: String,
  createdTime: { type: Date, default: Date.now },
});

const updateBirthdayNotify = function (client) {
  let Notification = mongoose.model('Notification');

  client.birthday.setUTCFullYear(new Date().getUTCFullYear());
  let birthday = Util.toAusTime(client.birthday);
  let today = Util.toAusTime(new Date());

  if (birthday.getMonth() == today.getMonth()) {
    let nInfo = new Notification({
      clientId: client._id,
      type: NotificationType.Birthday,
      status: NotificationStatus.Unconfirmed,
      date: birthday,
      title: "Birthday - " + client.name,
      clientName: client.name,
      tel: client.tel,
      email: client.email,
      address: client.address,
      suburb: client.suburb,
    });
    let p = nInfo.save();
    p.then(function (r) {
      // saved
    }).catch(function (e) {
      throw e;
    });
  }
};

NotificationSchema.statics.UpdateBirthdayNotify = function (client) {
  try {
    let Notification = mongoose.model('Notification');

    let p = Notification.updateMany({
      clientId: client._id,
      type: NotificationType.Birthday,
      status: NotificationStatus.Unconfirmed,
    }, { status: NotificationStatus.Confirmed });

    p.then(function (r) {
      updateBirthdayNotify(client);
    }).catch(function (e) {
      throw e;
    });
  } catch (e) {
    console.log(e);
    throw e;
  }
}

const UpdateCleanNotify = function (client) {
  let Notification = mongoose.model('Notification');
  let rInfo = client.reminderInfo;
  let nInfoList = {};
  for (let key in rInfo) {
    if (_.endsWith(key, "Date") && rInfo[key] != null) {
      date = rInfo[key];
      let today = Util.toAusTime(new Date());
      if (date.getUTCFullYear() == today.getUTCFullYear()
        && date.getUTCMonth() == today.getUTCMonth()) {
        let dateMD = date.getUTCMonth() + "-" + date.getUTCDay();
        let nInfo;
        if (nInfoList[dateMD]) {
          nInfo = nInfoList[dateMD];
        } else {
          nInfo = new Notification({
            clientId: client._id,
            type: NotificationType.Clean,
            status: NotificationStatus.Unconfirmed,
            date: date,
            title: "Clean - " + client.name,
            clientName: client.name,
            tel: client.tel,
            email: client.email,
            address: client.address,
            suburb: client.suburb,
          });
        }
        itemKey = key.substring(0, key.length - 4);
        nInfo.items.push(itemKey);
        nInfo.title += " " + itemKey;
        nInfoList[dateMD] = nInfo;
      }
    }
  }

  let p = Notification.collection.insert(_.values(nInfoList));

  p.then(function (r) {
    // saved
  }).catch(function (e) {
    throw e;
  });
}

NotificationSchema.statics.UpdateCleanNotify = function (client) {
  try {
    let Notification = mongoose.model('Notification');

    let p = Notification.updateMany({
      clientId: client._id,
      type: NotificationType.Clean,
      status: NotificationStatus.Unconfirmed,
    }, { status: NotificationStatus.Confirmed });

    p.then(function (r) {
      UpdateCleanNotify(client);
    }).catch(function (e) {
      throw e;
    });
  } catch (e) {
    logger.error(e);
    throw e;
  }
}

module.exports.NotificationType = NotificationType;
module.exports.NotificationStatus = NotificationStatus;
module.exports.NotificationSchema = mongoose.model('Notification', NotificationSchema);
