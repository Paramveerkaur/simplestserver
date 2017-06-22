const passport = require('passport')  
const LocalStrategy = require('passport-local').Strategy
const User = require('./models/User.js');

passport.use(new LocalStrategy(  
  function(username, password, done) {
    User.findOne({email: username}, function (err, user) {
      if (err) {
        return done(err)
      }
      if (!user) {
        return done(null, false)
      }
      if (password !== user.password  ) {
        return done(null, false)
      }
      return done(null, user)
    })
  }
))