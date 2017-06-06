/**
 * Module dependencies.
 */
var express = require('express'),
    path = require('path'),
    http = require('http');

var app = express();

// Point static path to dist
app.use(express.static(path.join(__dirname, './')));

/**
 * Create HTTP server.
 */
var server = http.createServer(app);

app.route('/rest/compass/update').post(function (req, res){
  res.json({ ok: true });
});

/**
 * Expose
 */

module.exports = app;

function listen () {
  server.listen(3001, () => {
    console.log(`
    ------------
       Server Started!
    ------------
  `);
  });
}

listen();