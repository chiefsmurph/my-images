var express = require('express');
var app = express();
var server = require('http').Server(app);

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

var cookieParser = require('cookie-parser');
app.use(cookieParser());

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

      dbRelated.run('deleteAll', function(err, result) {
        console.log('deletedall');
        getAllPosts();
      });
    } else if (err) {
      console.log('error creating db...');
      console.log(err);
    } else {
      console.log('sunshine table created');
    }
  });
})();

app.get('/posts', function(req, res, next) {
  res.json(allPosts);
});



// ADMIN

var auth = function(req, res, next) {
  console.log('authorizing');
  console.log(req.cookies, process.env.adminPwd);
  if (req.cookies.pwd === process.env.adminPwd) {
    console.log('pass')
    return next();
  } else {
    console.log('dail')
    return res.status(400);
  }
};


app.post('/post', auth, function(req, res, next) {
  console.log(req.body);
  var url = req.body.url;
  if (url) {
    dbRelated.addPost(url, function(err, result) {
      res.json( (err ? false : true) );
      if (!err) {
        console.log('successfully added ' + url);
      } else {
        console.log('failed to add ' + url);
      }
      allPosts.push(result.rows[0]);
    });
  }
});

app.use('/admin', auth, function(req, res) {
  res.sendfile(__dirname + '/public/admin.html');
});

app.get('/verify/:pass', function(req, res) {
  console.log('setting')
    res.cookie('pwd', req.params.pass);
    res.redirect('/admin');
});



// S3 FILE UPLOADS

const aws = require('aws-sdk');

var S3_BUCKET = process.env.S3_BUCKET;

app.get('/sign-s3', (req, res) => {
  const s3 = new aws.S3();
  const fileName = req.query['file-name'];
  const fileType = req.query['file-type'];
  const s3Params = {
    Bucket: S3_BUCKET,
    Key: fileName,
    Expires: 60,
    ContentType: fileType,
    ACL: 'public-read'
  };

  s3.getSignedUrl('putObject', s3Params, (err, data) => {
    if(err){
      console.log(err);
      return res.end();
    }
    const returnData = {
      signedRequest: data,
      url: `https://${S3_BUCKET}.s3.amazonaws.com/${fileName}`
    };
    res.write(JSON.stringify(returnData));
    res.end();
  });
});
