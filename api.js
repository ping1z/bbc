const router = require('express').Router();
const auth = require('./auth');
const USER_ROLES = require('./constant').USER_ROLES;
const Util = require('./util');
const mongoose = require('mongoose');
const Client = mongoose.model('Client');
const ClientComment = mongoose.model('ClientComment');
const Notification = mongoose.model('Notification');
const InvoiceInfo = mongoose.model('InvoiceInfo');
const InvoiceHistory = mongoose.model('InvoiceHistory');
const InvoiceStatus = require('./constant').InvoiceStatus;
const logger = require('./logger');

router.get('/menuInfo', auth.ensureLoggedIn(),
  function (req, res) {
    var components = [];

    var client = {
      id: "topMenu1",
      name: "Client Management",
      modules: [
        {
          id: "dashboard",
          name: "dashboard",
          url: "",
          isSubModule: false,
        },
        {
          id: "client-list",
          name: "Client List",
          url: "",
          isSubModule: false,
        }
      ]
    };

    if (req.user.roles[USER_ROLES.ROLE_ADMIN]) {
      client.modules.push({
        id: "invoice-list",
        name: "Invoice",
        url: "",
        isSubModule: false,
      });
    }
    components.push(client);

    var staff = {
      id: "topMenu2",
      name: "Staff Management",
      modules: [
        {
          id: "staff-list",
          name: "Staff List",
          url: "",
        }
      ]
    }

    if (req.user.roles[USER_ROLES.ROLE_ADMIN]) {
      components.push(staff);
    }

    res.send(components);
  }
);

router.get('/userProfile', auth.ensureLoggedIn(),
  function (req, res) {
    res.send(req.user);
  }
);

router.get('/client/getClientInfo/:clientId*', auth.ensureLoggedIn(),
  function (req, res) {
    let clientId = req.params.clientId;
    var p = Client.findOne({ _id: clientId }).exec();
    p.then(function (r) {
      res.send(r);
    }).catch(function (e) {
      logger.error(e);
      res.send(500, e);
    });
  }
);

router.get('/client/getClientList', auth.ensureLoggedIn(),
  function (req, res) {
    let clientId = req.params.clientId;
    var p = Client.find({ "available": true }).exec();

    p.then(function (r) {
      res.send(r);
    }).catch(function (e) {
      logger.error(e);
      res.send(500, e);
    });
  }
);

router.get('/client/createClient', auth.ensureLoggedIn(),
  function (req, res) {
    var p = Client.createClient();

    p.then(function (r) {
      res.send(r);
    }).catch(function (e) {
      logger.error(e);
      res.send(500, e);
    });
  }
);

router.get('/client/deleteClientInfo/:clientId*', auth.ensureLoggedIn(),
  function (req, res) {
    if (!req.user.roles[USER_ROLES.ROLE_ADMIN]) {
      logger.error(req.user.name + ": Action not allowed.");
      res.send(500, "Action not allowed.");
      return;
    }
    var p = Client.findByIdAndRemove(req.params.clientId);
    p.then(function (r) {
      res.send(r);
    }).catch(function (e) {
      logger.error(e);
      res.send(500, e);
    });
  }
);

router.post('/client/updateClientInfo', auth.ensureLoggedIn(),
  function (req, res) {
    if (!req.user.roles[USER_ROLES.ROLE_ADMIN] && !req.user.roles[USER_ROLES.ROLE_MANAGER]) {
      logger.error(req.user.name + ": Action not allowed.");
      res.send(500, "Action not allowed.");
      return;
    }
    let c = req.body.clientInfo;
    var p = Client.updateInfo(c._id, {
      name: c.name,
      tel: c.tel,
      email: c.email,
      birthday: c.birthday,
      address: c.address,
      suburb: c.suburb,
      isActive: c.isActive,
      startDate: c.startDate,
      startPrice: c.startPrice,
      serviceDate: c.serviceDate,
      serviceTime: c.serviceTime,
      price: c.price,
      rotations: c.startDate,
      notes: c.notes,
    });
    p.then(function (r) {
      if (r.isActive) {
        try {
          Notification.UpdateBirthdayNotify(r);
        } catch (e) {
          res.send(500, e);
        }
      }
      res.send(r);
    }).catch(function (e) {
      logger.error(e);
      res.send(500, e);
    });
  }
);

router.post('/client/updateClientJobDetail', auth.ensureLoggedIn(),
  function (req, res) {
    if (!req.user.roles[USER_ROLES.ROLE_ADMIN] && !req.user.roles[USER_ROLES.ROLE_MANAGER]) {
      logger.error(req.user.name + ": Action not allowed.");
      res.send(500, "Action not allowed.");
      return;
    }
    let _id = req.body._id;
    let jobDetail = req.body.jobDetail;
    let p = Client.updateInfo(_id, {
      jobDetail: jobDetail,
    });
    p.then(function (r) {
      res.send(r);
    }).catch(function (e) {
      logger.error(e);
      res.send(500, e);
    });
  }
);

router.post('/client/updateClientReminderInfo', auth.ensureLoggedIn(),
  function (req, res) {
    if (!req.user.roles[USER_ROLES.ROLE_ADMIN] && !req.user.roles[USER_ROLES.ROLE_MANAGER]) {
      logger.error(req.user.name + ": Action not allowed.");
      res.send(500, "Action not allowed.");
      return;
    }
    let _id = req.body._id;
    let reminderInfo = req.body.reminderInfo;
    let p = Client.updateInfo(_id, {
      reminderInfo: reminderInfo,
    });
    p.then(function (r) {
      if (r.isActive) {
        try {
          Notification.UpdateCleanNotify(r);
        } catch (e) {
          logger.error(e);
          res.send(500, e);
        }
      }
      res.send(r);
    }).catch(function (e) {
      logger.error(e);
      res.send(500, e);
    });
  }
);

router.post('/client/updateClientPaymentInfo', auth.ensureLoggedIn(),
  function (req, res) {
    if (!req.user.roles[USER_ROLES.ROLE_ADMIN] && !req.user.roles[USER_ROLES.ROLE_MANAGER]) {
      logger.error(req.user.name + ": Action not allowed.");
      res.send(500, "Action not allowed.");
      return;
    }
    let _id = req.body._id;
    let clientInfo = req.body.clientInfo;
    let p = Client.updateInfo(clientInfo._id, {
      paymentType: clientInfo.paymentType,
      invoiceNeeded: clientInfo.invoiceNeeded,
      invoiceTitle: clientInfo.invoiceTitle,
    });
    p.then(function (r) {
      res.send(r);
    }).catch(function (e) {
      logger.error(e);
      res.send(500, e);
    });
  }
);

router.post('/client/saveFullClientInfo', auth.ensureLoggedIn(),
  function (req, res) {
    if (!req.user.roles[USER_ROLES.ROLE_ADMIN] && !req.user.roles[USER_ROLES.ROLE_MANAGER]) {
      logger.error(req.user.name + ": Action not allowed.");
      res.send(500, "Action not allowed.");
      return;
    }
    var c = req.body.fullClientInfo;

    let p = Client.updateInfo(c._id, {
      name: c.name,
      tel: c.tel,
      email: c.email,
      birthday: c.birthday,
      address: c.address,
      suburb: c.suburb,
      isActive: c.isActive,
      startDate: c.startDate,
      startPrice: c.startPrice,
      serviceDate: c.serviceDate,
      serviceTime: c.serviceTime,
      price: c.price,
      rotations: c.startDate,
      notes: c.notes,
      jobDetail: c.jobDetail,
      reminderInfo: c.reminderInfo,
      paymentType: c.paymentType,
      invoiceNeeded: c.invoiceNeeded,
      invoiceTitle: c.invoiceTitle,
    });

    p.then(function (r) {
      if (r.isActive) {
        try {
          Notification.UpdateBirthdayNotify(r);
          Notification.UpdateCleanNotify(r);

        } catch (e) {
          res.send(500, e);
        }
      }
      res.send(r);
    }).catch(function (e) {
      logger.error(e);
      res.send(500, e);
    });
  }
);

router.get('/client/getClientComments/:clientId*', auth.ensureLoggedIn(),
  function (req, res) {
    let clientId = req.params.clientId;
    let p = ClientComment.find({ clientId: clientId }).exec();

    p.then(function (r) {
      res.send(r);
    }).catch(function (e) {
      logger.error(e);
      res.send(500, e);
    });
  }
);

router.post('/client/postClientComment', auth.ensureLoggedIn(),
  function (req, res) {
    let comment = new ClientComment({
      clientId: req.body.clientId,
      content: req.body.content,
      authorId: req.user._id,
      authorName: req.user.name,
      authorTitle: req.user.title,
    })
    let p = comment.save();

    p.then(function (r) {
      res.send(r);
    }).catch(function (e) {
      logger.error(e);
      res.send(500, e);
    });
  }
);

router.post('/client/deleteClientComment', auth.ensureLoggedIn(),
  function (req, res) {
    let comment = req.body.comment;
    let user = req.user;
    // TO-DO not admin or author 
    if (!req.user.roles[USER_ROLES.ROLE_ADMIN]) {
      logger.error(req.user.name + ": Action not allowed.");
      res.send(500, "Action not allowed.");
      return;
    }
    var p = ClientComment.findByIdAndRemove(comment._id);
    p.then(function (r) {
      res.send(r);
    }).catch(function (e) {
      logger.error(e);
      res.send(500, e);
    });
  }
);

router.get('/invoice/getMonthlyInvoice/:YMStr', auth.ensureLoggedIn(),
  function (req, res) {
    //HolidayInfo.loadHolidayData();
    // ymStr: yyyy-mm
    let ymStr = req.params.YMStr;
    let st = new Date(ymStr);
    st = Util.toAusTime(new Date(ymStr));
    let et = new Date(ymStr);
    et.setUTCMonth(st.getUTCMonth() + 1);
    et = Util.toAusTime(et);

    let p = InvoiceInfo.find({
      serviceDate: {
        $gte: st,
        $lt: et,
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

router.get('/invoice/getInvoiceHistory/:YMStr', auth.ensureLoggedIn(),
  function (req, res) {
    //HolidayInfo.loadHolidayData();
    // ymStr: yyyy-mm
    let ymStr = req.params.YMStr;

    let p = InvoiceHistory.find({}
    ).sort({
      invoiceYM: -1,
    }).exec();

    p.then(function (r) {
      res.send(r);
    }).catch(function (e) {
      logger.error(e);
      res.send(500, e);
    });
  }
);


router.post('/invoice/sendInvoice/', auth.ensureLoggedIn(),
  function (req, res) {
    //HolidayInfo.loadHolidayData();
    // ymStr: yyyy-mm
    let iHistory = new InvoiceHistory(req.body.invoiceHistory);

    let p = iHistory.save();

    p.then(function (r) {
      let or = [];
      for (var i = 0; i < iHistory.items.length; i++) {
        or[i] = {
          _id: iHistory.items[i].invoiceId,
        }
      }
      let p1 = InvoiceInfo.updateMany({
        $or: or
      }, {
          status: InvoiceStatus.Sent,
        });

      p1.then(function (r) {

        let data = {
          subject: '[Invoice] #' + iHistory.invoiceYM + ' - Bubble Bubble Cleaning Service',
          invoice: iHistory,
        }
        let pdfHtml = Util.generateHtml("/tmpl/invoice_pdf.ejs", data);
        let pdfName = '#Invoice-' + iHistory.invoiceYM + '_' + iHistory.clientId
          + '_' + Util.toAusDateStr(iHistory.createdTime) + '.pdf';
        Util.generatePDF(pdfHtml, pdfName, function (e, filePath) {
          if (e) throw e;
          let attachments = [{
            filename: 'invoice_header.png',
            path: __dirname + '/public/images/invoice_header.PNG',
            cid: 'invoice.header.image' //same cid value as in the html img src
          },
          {   // file on disk as an attachment
            filename: pdfName,
            path: filePath // stream this file
          },
          ];
          let emailHtml = Util.generateHtml("/tmpl/invoice_email.ejs", data);
          Util.sendEmail(iHistory.email, data.subject, emailHtml, attachments, function (e, r) {
            if (e) throw e;
            res.send("OK");
          })
        });
      }).catch(function (e) {
        throw e;
      });
    }).catch(function (e) {
      logger.error(e);
      res.send(500, e);
    });
  }
);

router.get("/client/previewClientInfo/:clientId*", auth.ensureLoggedIn(),
  function (req, res) {
    let clientId = req.params.clientId;
    var p = Client.findOne({ _id: clientId }).exec();
    p.then(function (r) {
      let data = {
        subject: "Client Info Confirmation",
        clientInfo: r,
        jobDetail: r.jobDetail,
        headerImage: "/public/images/invoice_header.PNG",
      };
      let html = Util.generateHtml("/tmpl/client_preview.ejs", data);
      res.send(html);
    }).catch(function (e) {
      logger.error(e);
      res.send(500, e);
    });
  });

router.get("/client/confirmClientInfo/:clientId*", auth.ensureLoggedIn(),
  function (req, res) {
    let clientId = req.params.clientId;
    var p = Client.findOne({ _id: clientId }).exec();
    p.then(function (client) {
      let data = {
        subject: "Client Info Confirmation",
        clientInfo: client,
        jobDetail: client.jobDetail,
        headerImage: "cid:header.image",
      };
      let pdfHtml = Util.generateHtml("/tmpl/client_pdf.ejs", data);
      let pdfName = '#' + client.ref + ':' + Util.toAusDateStr(client.lastModifiedTime) + '.pdf';
      Util.generatePDF(pdfHtml, pdfName, function (e, filePath) {
        if (e) throw e;
        let attachments = [{
          filename: 'header.png',
          path: __dirname + '/public/images/invoice_header.PNG',
          cid: 'header.image' //same cid value as in the html img src
        },
        {   // file on disk as an attachment
          filename: pdfName,
          path: filePath // stream this file
        },
        ];
        let emailHtml = Util.generateHtml("/tmpl/client_preview.ejs", data);
        //res.send(emailHtml);
        Util.sendEmail(client.email, data.subject, emailHtml, attachments, function (e, r) {
          if (e) throw e;
          res.send("OK");
        });
      });
    }).catch(function (e) {
      logger.error(e);
      res.send(500, e);
    });
  });
module.exports = router;
