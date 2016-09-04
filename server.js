var express = require('express');
var app = express();
var server = require('http').Server(app);

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies


var dbRelated = require('./dbRelated');

var port = process.env.PORT || 5000;


server.listen(port);

console.log('listening on ' + port);

app.use(express.static(__dirname + '/public'));


// START

var allPosts = [];
function getAllPosts() {
  dbRelated.run('getAll', function(err, result) {
    if (!err) {
      console.log('refreshed database');
      allPosts = result.rows;
    } else {
      console.log(err);
    }
  });
}

(function createSunshineTable() {
  // dbRelated.query('ALTER TABLE sunshine ALTER COLUMN url TYPE varchar(200);', function(err, result) {
  //   console.log(err, result)
  // });
  dbRelated.run('createTable', function(err, result) {
    if (err && err.code === '42P07') {
      console.log('table already exists');

      //dbRelated.run('deleteAll', function(err, result) {
        //console.log('deletedall');
        getAllPosts();
      //});
    } else if (err) {
      console.log('error creating db...');
      console.log(err);
    } else {
      console.log('sunshine table created');
    }
  });
})();




app.post('/post', function(req, res, next) {
  console.log(req.body);
  var url = req.body.url;
  if (url) {
    dbRelated.addPost(url, function(err, result) {
      res.json({
        err: err,
        result: result
      });
      console.log(err, result);
      allPosts.push(result.rows[0]);
    });
  }
});

app.get('/posts', function(req, res, next) {
  res.json(allPosts);
});
