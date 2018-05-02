var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();

// Configuration for passport-local module
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy;

//bcrypt for passwaord encryption
//var bcrypt = require('bcrypt');
var Staff = require('mongoose').model('Staff');

// local login
// we are using named strategies since we have one for login and one for signup
// by default, if there was no name, it would just be called "local"
var Authorize = function () {
  // by default, usernameField is username, here we change parameters - usernameField
  //  is userIdentity. It could be one of username, email, telephone.
  passport.use("local", new LocalStrategy({
    usernameField: 'userIdentity',
    passwordField: 'password',
  },
    function (userIdentity, password, done) {
      Staff.findOne({ 'email': userIdentity, 'password': password }, 'name occupation', function (err, user) {
        if (err) { return done(err); }
        if (!user) {
          return done(null, false, { message: 'Incorrect userIdentity.' });
        }
        console.log('%s : %s', user.username, user.email);
        //var match =bcrypt.compareSync(password, user.password); // true 
        //if (!match) {
        //return done(null, false, { message: 'Incorrect password.' });
        //}
        return done(null, user);
      });
    }
  ));

  // used to serialize the user for the session.
  passport.serializeUser(function (user, cb) {
    cb(null, user.id);
  });

  // used to deserialize the user
  passport.deserializeUser(function (key, cb) {
    Staff.findById(key, function (err, user) {
      if (err) { return cb(err); }
      cb(null, user);
    });
  });
  console.log("Authorize init.");
}

Authorize.prototype.init = function (app) {
  app.use(require('body-parser').urlencoded({ extended: true }));
  app.use(require('express-session')({ secret: 'bbclean1234', save: false, saveUninitialized: false }));
  app.use(passport.initialize());
  app.use(passport.session());
};
Authorize.prototype.ensureLoggedIn = function (options) {
  
  if( !options) {
    options = {}
  }
  if (typeof options == 'string') {
    options = { redirectTo: options }
  }


  var url = options.redirectTo || '/login';
  var setReturnTo = (options.setReturnTo === undefined) ? true : options.setReturnTo;

  return function (req, res, next) {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      if (setReturnTo && req.session) {
        req.session.returnTo = req.originalUrl || req.url;
      }
      return res.redirect(url);
    }
    next();
  }
};

Authorize.prototype.authenticate = function (type, opt) {
  return passport.authenticate(type, opt);
};

Authorize.prototype.generateHash = function (password, callback) {
  callback && callback(null, password);
  // bcrypt.hash(password, 10, function(err, hash) {
  //   callback && callback(err,hash);   
  // });
}

// expose this function to our app using module.exports
module.exports = new Authorize();
