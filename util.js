const nodemailer = require('nodemailer');
const ejs = require('ejs');
const _ = require('lodash');
const fs = require('fs');
const pdf = require('html-pdf');
const Secret = require('./secret');

const toAusTime = function (date) {
  return new Date(date.getTime() + 3600000 * 10);
}
module.exports.toAusTime = toAusTime;

const toAusDateStr = function (date) {
  date = new Date(date.getTime() + 3600000 * 10);
  return date.getUTCFullYear() + "-" + (date.getUTCMonth() + 1) + "-" + date.getUTCDate();
}
module.exports.toAusDateStr = toAusDateStr;

module.exports.sendEmail = function (to, subject, html, attachments, cb) {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: Secret.EMAIL.user,
      pass: Secret.EMAIL.pass,
    }
  });

  const mailOptions = {
    from: Secret.EMAIL.user, // sender address
    to: to, // list of receivers
    subject: subject, // Subject line
    html: html,
    attachments: attachments,
  };

  transporter.sendMail(mailOptions, function (err, info) {
    cb && cb(err, info);
  });
}

module.exports.generateHtml = function (tmplPath, data) {
  data = _.assignIn({
    toAusDateStr: function(d){
      //return d;
      d = toAusTime(new Date(d));
      return d.getUTCFullYear() + "-" + (d.getUTCMonth() + 1) + "-" + d.getUTCDate();
    },
    formatMoney: function (n) {
      return Number(n).toFixed(2).replace(/./g, function (c, i, a) {
        return i && c !== "." && ((a.length - i) % 3 === 0) ? ',' + c : c;
      });
    }
  }, data);

  var html = fs.readFileSync(__dirname + "/views/" + tmplPath, 'utf8');
  return ejs.render(html, data, null);
}

module.exports.generatePDF = function (html, fileName, cb) {
  let filePath = __dirname + '/pdf/' + fileName;
  let options = {
    "format": "A4",
    "orientation": "portrait",
    "border": {
      "top": "0.5in",            // default is 0, units: mm, cm, in, px
      "right": "0.5in",
      "bottom": "0.5in",
      "left": "0.5in"
    },
  }
  pdf.create(html, options).toFile(filePath, function (err, res) {
    cb && cb(err, filePath);
  });
}