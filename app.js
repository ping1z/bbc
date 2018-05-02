var express = require('express');
var mongoose = require('mongoose');
var models = require('./models');
var logger = require('./logger');
var app = express();
var port = process.env.PORT || 3000;

const MONGO_URI = require('./secret').MONGO_URI;

if (!MONGO_URI) {
  throw new Error('You must provide a MongoLab URI');
}

mongoose.Promise = global.Promise;
mongoose.connect(MONGO_URI);
mongoose.connection
  .once('open', () => logger.info('Connected to MongoLab instance.'))
  .on('error', error => logger.error('Error connecting to MongoLab:', error));

//initialize authorization module
var auth = require('./auth');
auth.init(app);

//initalize router module
var router = require('./router');
var api = require('./api');
var serviceAPI = require('./serviceAPI');
app.use('/', router);
app.use('/api', api);
app.use('/api/service', serviceAPI);

app.set('view engine', 'ejs');

app.use('/public', express.static('public'))

app.listen(port, function () {
  logger.info('bbc listening on port 3000!');
})
