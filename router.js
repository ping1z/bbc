var router = require('express').Router();
var auth = require('./auth');
var Staff = require('./models/Staff');
var USER_ROLES = require('./constant').USER_ROLES;

router.get("/", auth.ensureLoggedIn(),
  function (req, res) {
    res.render("index", {user: req.user});
  });

router.get('/login', function (req, res) {
  res.render("login");
});

router.post('/login',
  auth.authenticate('local', { failureRedirect: '/login' }),
  function (req, res) {
    res.redirect('/');
});

router.get('/logout',auth.ensureLoggedIn(),
  function(req, res){
    req.logout();
    res.redirect('/');
});

router.get("/test",
  function (req, res) {
    const mongoose = require('mongoose');
    const InvoiceHistory = mongoose.model('InvoiceHistory');
    var p = InvoiceHistory.findOne({ "_id": "5ae6b3de29abba82d8eed66d" }).exec();
    const Util = require('./util');
    p.then(function (iHistory) {
      let data = {
        subject: '[Invoice] #' + iHistory.invoiceYM + ' - That Clean Girl Service',
        invoice: iHistory,
      }
      //res.send(Util.generateHtml("/tmpl/invoice_pdf.ejs", data));
      var pdfHtml = Util.generateHtml("/tmpl/invoice_email.ejs", data);
      let pdfName = '#Invoice-' + iHistory.invoiceYM + '_' + iHistory.clientId
          + '_' + Util.toAusDateStr(iHistory.createdTime) + '.pdf';
      //Util.generatePDF(pdfHtml, pdfName, function (e, filePath) {
        res.send(pdfHtml);
      //});
    }).catch(function (e) {
      console.log(e);
      res.send(500, e);
    });
    
  });

module.exports = router;