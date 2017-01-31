var express = require('express');
var morgan = require('morgan');
var path = require('path');
var httpProxy = require('http-proxy');

var proxy = httpProxy.createProxyServer();
var app = express();
var mustachex = require('mustachex');

var isProduction = process.env.NODE_ENV === 'production';
var port = isProduction ? process.env.PORT : 8000;

app.use(express.static(__dirname + '/web/assets'));
app.use(morgan('common'));
app.engine('html', mustachex.express);
app.set('view engine', 'html');
app.set('views', __dirname + '/web/partials');

// We only want to run the workflow proxying in development.
if (!isProduction) {
    var bundleCode = require('./web/dev-server/bundle-code.js');
    bundleCode();

    // We want to proxy any requests sent to localhost:8000/build
    // to the webpack-dev-server.
    app.all('/build/*', function(req, res) {
        proxy.web(req, res, {
            target: 'http://localhost:8080/'
        });
    });
}

// Catch any errors from the proxy in order to not crash the server.
// Example: connecting to server when webpack is building.
proxy.on('error', function(e) {
    console.log('Could not connect to proxy, please try again...');
});

// Matches the /admin route.
app.get(/\/admin/, function(req, res) {
    res.render('calendar-admin');
})

// Actual app code. A catch-all for everything except /admin.
// We catch any route first, and then let our front-end routing do the work.
app.get(/^((?!\/admin).)*$/, function(req, res) {
    res.render('index');
});

app.listen(port, function() {
    console.log('App listening on port 8000.');
});