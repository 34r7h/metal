var gzippo = require('gzippo');
var express = require('express');
var app = express();
app.use(require('prerender-node').set('prerenderToken', 'ipMxPbev4DV5j1W9P7Mq'));
//var prerender = require('prerender-node').set('prerenderServiceUrl', 'http://blooming-brushlands-2690.herokuapp.com/');
//app.use(prerender);
app.use(express.logger('dev'));
app.use(gzippo.staticGzip("" + __dirname + "/dist"));
app.listen(process.env.PORT || 5000);