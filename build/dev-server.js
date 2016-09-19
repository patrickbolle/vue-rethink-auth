//Imports
const express = require('express');
const bodyParser = require('body-parser');
const webpack = require('webpack');
const config = require('./webpack.dev.conf.js');
const _ = require('lodash');
const sockio = require("socket.io");

const app = express();
const router = express.Router();
const compiler = webpack(config);
const jsonParser = bodyParser.json();

// Import this at the top of index.js
var User = require('./models/user.js');
const LocalStrategy = require('passport-local').Strategy;

// import necessary modules for Passport
var passport = require('passport');
app.use(jsonParser);
app.use(require('express-session')({
    secret: 'keyboard cat'
}));
app.use(passport.initialize());
app.use(passport.session());

// handle fallback for HTML5 history API
app.use(require('connect-history-api-fallback')());
// serve webpack bundle output
app.use(require('webpack-dev-middleware')(compiler, {
  publicPath: config.output.publicPath,
  stats: {
    colors: true,
    chunks: false
  }
}));
// enable hot-reload and state-preserving
// compilation error display
app.use(require('webpack-hot-middleware')(compiler));

// Pass just the user id to the passport middleware
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

// Reading your user base ont he user.id
passport.deserializeUser(function(id, done) {
  User.get(id).run().then(function(user) {
    done(null, user.public());
  });
});

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
},
  function(email, password, done) {
    User.filter({'email': email}).run()
    .then(function(users) {
      // Was a user found?
      if (users.length) {
        // Attempt authenticating with the supplied password
        if (users[0].authenticate(password)) {
          User.get(users[0].id).run().then(function(user) {
            done(null, user.public());
          });
        }
        // Supplied password incorrect
        else {
          setTimeout(function() {
            done("Sorry, your password is incorrect", false);
          }, 3000);
        }
      }
      // No user was found
      else {
        setTimeout(function() {
          return done("Sorry, no account was found for that email", false);
        }, 3000);
      }
    });
}));

//ROUTES
app.post('/signup', function(req, res) {
  var user = new User({
    email: req.query.email,
    password: req.query.password
  });
  user.save().then(function(result) {
    res.send(result);
    console.log("Worked");
  }).error(handleError(res));
  // User.filter({ email: req.body.email }).count().run()
  // .delay(3000)
  // .then(function(count) {
  //   if (count === 0) { return true; }
  //   throw new Error("A user is already registered with that email address");
  // })
  // .then(function() {
  //   var user = new User({
  //       email: req.body.email,
  //       hash: req.body.password
  //   });
  //   user.saveAll().then(function(result) {
  //     return result;
  //   });
  // })
  // .then(function() {
  //     req.login(req.body, function(err) {
  //     if (err) { throw new Error(err); }
  //     res.send({ loggedin: true });
  //   });
  // })
  // .catch(function(err) { res.json({ 'error': err.message }); });
});

app.post('/login', passport.authenticate('local'), function(req, res) {
  res.json({ loggedin: true });
  console.log(res);
});

function handleError(res) {
    return function(error) {
        return res.send(500, {error: error.message});
    }
}

//Server port
app.use('/api', router)
app.listen(8090, 'localhost', function (err) {
  if (err) {
    console.log(err)
    return
  }
  console.log('Listening at http://localhost:8090')
})
