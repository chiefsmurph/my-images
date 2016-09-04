var pg = require('pg');
var express = require('express');
var app = express();
var server = require('http').Server(app);

var port = process.env.PORT || 5000;
server.listen(port);

console.log('listening on ' + port);

app.use(express.static(__dirname + '/public'));

pg.connect(process.env.DATABASE_URL + "?ssl=true", function(err, client, done) {
  var queryText = 'CREATE TABLE users (id serial primary key, url, timestamp timestamp default current_timestamp )';
  client.query(queryText, function(err, result) {

    done();
    users = result.rows;

  });
});
