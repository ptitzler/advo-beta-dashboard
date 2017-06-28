var express = require('express')
var app = express()
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var redis = require('redis');
var async = require('async');
var redis_url = process.env.REDIS_URL || 'redis://localhost:6379';
var redisClient = redis.createClient(redis_url);

// template report
var latestReport = {
  funnel: {
    users: 0,
    baskets: 0,
    orders:0
  },
  lastHour: {
    sumItems:0,
    sumOrders: 0
  }
}

// fetch data from Redis
var generateLatestReport  = function(callback) {
  async.series([
    function(done) {
      redisClient.hgetall('funnel', done);
    }
  ], function(err, results) {
    if (!err) {
      var funnel = results[0];
      latestReport.funnel.users = parseInt(funnel.login_count);
      latestReport.funnel.baskets = parseInt(funnel.basket_count);
      latestReport.funnel.orders = parseInt(funnel.checkout_count);
      latestReport.lastHour.sumItems = parseInt(funnel.basket_total);
      latestReport.lastHour.sumOrders = parseInt(funnel.checkout_total);
    }
    callback(null, latestReport);
  });
}

// serve out static content
app.use(express.static('public'))

// on connection send the user the latest report
io.on('connection', function(socket) {
  socket.emit('report', latestReport);
});

// every minute calculate latest stats and broadcast to everyone
setInterval(function() {
  generateLatestReport(function(err, data) {
    io.local.emit('report', latestReport);
  });
}, 1000);


// get cloudfoundry config
var cfenv = require('cfenv'),
  appEnv = cfenv.getAppEnv();

// listen
server.listen(appEnv.port, '0.0.0.0', function () {
  console.log('Example app listening on port', appEnv.port);
  console.log('URL', appEnv.url);
})

// deployment tracker
require('cf-deployment-tracker-client').track();
