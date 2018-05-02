const _ = require('lodash');
const router = require('express').Router();
const auth = require('./auth');
const USER_ROLES = require('./constant').USER_ROLES;
const logger = require('./logger');
const mongoose = require('mongoose');
const ServiceInfo = mongoose.model('ServiceInfo');
const ServiceStatus = require('./models/ServiceInfo').ServiceStatus;
const Notification = mongoose.model('Notification');
const NotificationType = require('./models/Notification').NotificationType;
const NotificationStatus = require('./models/Notification').NotificationStatus;
const HolidayInfo = mongoose.model('HolidayInfo');

router.get('/history/:clientId*', auth.ensureLoggedIn(),
  function (req, res) {
    let clientId = req.params.clientId;
    let p = ServiceInfo.find({
      clientId: clientId,
      status: ServiceStatus.Completed,
    }).exec();

    p.then(function (r) {
      res.send(r);
    }).catch(function (e) {
      logger.error(e);;
      res.send(500, e);
    });
  }
);

router.get('/notify/getNotifications', auth.ensureLoggedIn(),
  function (req, res) {
    let p = Notification.find({
      status: NotificationStatus.Unconfirmed,
    }).exec();

    p.then(function (r) {
      res.send(r);
    }).catch(function (e) {
      logger.error(e);
      res.send(500, e);
    });
  }
);

router.get('/notify/getNotificationGroups', auth.ensureLoggedIn(),
  function (req, res) {
    let groups = {
      birthday: [],
      clean: [],
    }
    let p = Notification.find({
      status: NotificationStatus.Unconfirmed,
    }).exec();

    p.then(function (r) {
      _.forEach(r, function (n) {
        if (n.type == NotificationType.Birthday) {
          groups.birthday.push(n);
        } else {
          groups.clean.push(n);
        }
      });
      res.send(groups);
    }).catch(function (e) {
      logger.error(e);
      res.send(500, e);
    });
  }
);

router.post('/saveOneOffService', auth.ensureLoggedIn(),
  function (req, res) {
    if (!req.user.roles[USER_ROLES.ROLE_ADMIN] && !req.user.roles[USER_ROLES.ROLE_MANAGER]) {
      res.send(500, "Action not allowed.");
      return;
    }

    let sInfo = new ServiceInfo(req.body.serviceInfo);
    let p = ServiceInfo.findByIdAndUpdate(sInfo._id, sInfo, { upsert: true });

    p.then(function (r) {
      res.send("SUCCESS");
    }).catch(function (e) {
      logger.error(e);
      res.send(500, e);
    });
  }
);

router.get('/listServiceByPeriod/:st/:et*', auth.ensureLoggedIn(),
  function (req, res) {
    let st = new Date(parseInt(req.params.st));
    let et = new Date(parseInt(req.params.et));
    let p = ServiceInfo.find({
      serviceDate: {
        $gte: st,
        $lte: et,
      }
    }).exec();

    p.then(function (r) {
      res.send(r);
    }).catch(function (e) {
      logger.error(e);
      res.send(500, e);
    });
  }
);

router.get('/getPublicHolidays', auth.ensureLoggedIn(),
  function (req, res) {
    //HolidayInfo.loadHolidayData();
    let p = HolidayInfo.find({}).exec();

    p.then(function (r) {
      res.send(r);
    }).catch(function (e) {
      logger.error(e);
      res.send(500, e);
    });
  }
);

module.exports = router;
