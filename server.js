  //
// # SimplestServer
//
// by Rick Kozak

const dbUrl = 'mongodb://user8165:pswd8165@ds161021.mlab.com:61021/prog8165';

//require statements -- this adds external modules from node_modules or our own defined modules
const http = require('http');
const path = require('path');
//express related
const express = require('express');
const bodyParser = require('body-parser');
//session
const session = require('express-session');  
const mongoSession = require('connect-mongodb-session')(session);
const passport = require('passport');
const userAuth = require('./userAuth.js');
//database
const mongoose = require('mongoose');
const Post = require('./models/Post.js');

//
// ## SimpleServer `SimpleServer(obj)`
//
// Creates a new instance of SimpleServer with the following options:
//  * `port` - The HTTP port to listen on. If `process.env.PORT` is set, _it overrides this value_.
//
var router = express();
var server = http.createServer(router);

//establish connection to our mongodb instance
//use your own mongodb instance here
mongoose.connect(dbUrl);
//create a sessions collection as well
var mongoSessionStore = new mongoSession({
    uri: dbUrl,
    collection: 'sessions'
});

//tell the router (ie. express) where to find static files
router.use(express.static(path.resolve(__dirname, 'client')));
//tell the router to parse JSON data for us and put it into req.body
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
//add session support
router.use(session({
  secret: process.env.SESSION_SECRET || 'mySecretKey', 
  store: mongoSessionStore,
  resave: true,
  saveUninitialized: false
}));
//add passport for authentication support
router.use(passport.initialize());
router.use(passport.session());
userAuth.init(passport);

//tell the router how to handle a get request to the root 
router.get('/', function(req, res){
  console.log('client requests root');
  //use sendfile to send our signin.html file
  res.sendFile(path.join(__dirname, 'client/view','signin.html'));
});

//tell the router how to handle a get request to the signin page
router.get('/signin', function(req, res){
  console.log('client requests signin');
  res.redirect('/');
});

//tell the router how to handle a post request from the signin page
router.post('/signin', function(req, res, next) {
  //tell passport to attempt to authenticate the login
  passport.authenticate('login', function(err, user, info) {
    //callback returns here
    if (err){
      //if error, say error
      res.json({isValid: false, message: 'internal error'});
    } else if (!user) {
      //if no user, say invalid login
      res.json({isValid: false, message: 'try again'});
    } else {
      //log this user in
      req.logIn(user, function(err){
        if (!err)
          //send a message to the client to say so
          res.json({isValid: true, message: 'welcome ' + user.email});
      });
    }
  })(req, res, next);
});

//tell the router how to handle a get request to the join page
router.get('/join', function(req, res){
  console.log('client requests join');
  res.sendFile(path.join(__dirname, 'client/view', 'join.html'));
});

//tell the router how to handle a post request to the join page
router.post('/join', function(req, res, next) {
  passport.authenticate('signup', function(err, user, info) {
    if (err){
      res.json({isValid: false, message: 'internal error'});    
    } else if (!user) {
      res.json({isValid: false, message: 'try again'});
    } else {
      //log this user in since they've just joined
      req.logIn(user, function(err){
        if (!err)
          //send a message to the client to say so
          res.json({isValid: true, message: 'welcome ' + user.email});
      });
    }
  })(req, res, next);
});

//tell the router how to handle a get request to the posts page
//only do this if this is an authenticated user
router.get('/posts', userAuth.isAuthenticated, function(req, res){
  console.log('client requests posts.html');
  //use sendfile to send our posts.html file
  res.sendFile(path.join(__dirname, 'client/view','posts.html'));
})

//tell the router how to handle a post request to /posts
//only do this if this is an authenticated user
router.post('/posts', userAuth.isAuthenticated, function(req, res){
  console.log('client requests posts list');
  
  //go find all the posts in the database
  Post.find({})
  .then(function(paths){
    //send them to the client in JSON format
    res.json(paths);
  })
});

//tell the router how to handle a post request to /incrLike
router.post('/incrLike', function(req, res){
  console.log('increment like for ' + req.body.id);

  //go get the post record
  Post.findById(req.body.id)
  .then(function(post){
    //increment the like count
    post.likeCount++;
    //save the record back to the database
    return post.save(post);
  })
  .then(function(post){
    //a successful save returns back the updated object
    res.json({id: req.body.id, count: post.likeCount});  
  })
  .catch(function(err){
    console.log(err);
  })
});

//set up the HTTP server and start it running
server.listen(process.env.PORT || 3000, process.env.IP || '0.0.0.0', function(){
  var addr = server.address();
  console.log('Server listening at', addr.address + ':' + addr.port);
});











