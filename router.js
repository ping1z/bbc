var router = require('express').Router();
var auth = require('./auth');
var Staff = require('./models/Staff');
var USER_ROLES = require('./constant').USER_ROLES;

router.get("/", auth.ensureLoggedIn(),
  function (req, res) {
    res.render("index", { user: req.user });
  });

router.get('/login', function (req, res) {
  res.render("login");
});

router.post('/login',
  auth.authenticate('local', { failureRedirect: '/login' }),
  function (req, res) {
    res.redirect('/');
  });

router.get('/logout', auth.ensureLoggedIn(),
  function (req, res) {
    req.logout();
    res.redirect('/');
  });

module.exports = router;
