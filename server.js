//
// # SimplestServer
//
// by Rick Kozak

var http = require('http');
var path = require('path');
var express = require('express');

//
// ## SimpleServer `SimpleServer(obj)`
//
// Creates a new instance of SimpleServer with the following options:
//  * `port` - The HTTP port to listen on. If `process.env.PORT` is set, _it overrides this value_.
//
var router = express();
var server = http.createServer(router);

//establish connection to our mongodb instance
var mongoose = require('mongoose');
var Post = require('./models/Post.js');
mongoose.connect('mongodb://user8165:pswd8165@ds161021.mlab.com:61021/prog8165');


var post = new Post({ 
  image: './img/glyphicons-halflings-white.png',
  comment: 'cool glphicon',
  likeCount: 0,
  feedbackCount: 0
});
post.save(function (err) {
  if (err) {
    console.log(err);
  } else {
    console.log('posted');
  }
});

router.use(express.static(path.resolve(__dirname, 'client')));

router.get('/', function(req, res){
  console.log('client requests posts.html');
  res.sendfile(path.join(__dirname, 'client/view','posts.html'));
});

router.post('/posts', function(req, res){
  console.log('client requests posts list');
  
  //Post.find({})
  //.then(function(paths){
  //  res.json(paths);
  //})
  
  res.json([
    {image: 'img/test.jpg', comment: 'test message 1'},
    {image: 'img/test.jpg', comment: 'test message 2'}
  ]);
});

server.listen(process.env.PORT || 3000, process.env.IP || '0.0.0.0', function(){
  var addr = server.address();
  console.log('Server listening at', addr.address + ':' + addr.port);
});
