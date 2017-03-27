'use strict';
// http://james.darktech.org/api/grade/hello-sessions/ezrajrice/it410-hello-sessions
// include modules
var bodyParser          = require('body-parser');
var cookieParser        = require('cookie-parser');
var express             = require('express');
var LocalStrategy       = require('passport-local').Strategy;
var passport            = require('passport');
var session             = require('express-session');

// session db
var users = {};

// initialize express app
var app = express();

// tell passport to use a local strategy and tell it how to validate a username and password
passport.use(new LocalStrategy(function(username, password, done) {
    if (users[username] && users[username].password === password) {
        return done(null, { username: username });
    } else {
        users[username] = {password: password, pairs: {}};
    }
    return done(null, { username: username });
}));

// tell passport how to turn a user into serialized data that will be stored with the session
passport.serializeUser(function(user, done) {
    done(null, user.username);
});

// tell passport how to go from the serialized data back to the user
passport.deserializeUser(function(id, done) {
    done(null, { username: id });
});

// tell the express app what middleware to use
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({ secret: 'secret key', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// home page
app.get('/', 
    function (req, res) {
        if (req.user) {
            var username = req.user.username;
            return res.send(users[username].pairs);
        }
        return res.sendStatus(401);
    }
);

app.put('/',
    function(req, res) {
        if (!req.user) return res.sendStatus(401);
        var key = req.query.key;
        var val = req.query.value;
        var username = req.user.username;
        users[username].pairs[key] = val;
        return res.send(users[username].pairs);
    }
);

app.delete('/',
    function(req, res) {
        if (!req.user) return res.sendStatus(401);
        var key = req.query.key;
        var username = req.user.username;
        delete users[username].pairs[key];
        return res.send(users[username].pairs);
    }
);

// Health endpoint
app.get('/health',
    function(req, res) {
        return res.sendStatus(200);
    }
);

// Login route
app.post('/login',
    passport.authenticate('local'),
    function(req, res) {
        console.log(users);
        var username = req.user.username;
        return res.status(200).send(users[username].pairs);
    }
);

// Logout Route
app.get('/logout',
    function(req, res) {
        req.logout();
        return res.status(200).send(req.body);
    }
);

// start the server listening
app.listen(3000);