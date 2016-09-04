var express = require('express');
var app = express();
var server = require('http').Server(app);

var port = process.env.PORT || 5000;
server.listen(port);

console.log('listening on ' + port);

app.use(express.static(__dirname + '/public'));
