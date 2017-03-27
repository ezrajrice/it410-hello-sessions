'use strict';
// http://james.darktech.org/api/grade/hello-sessions/ezrajrice/it410-hello-sessions
// include modules
var bodyParser          = require('body-parser');
var cookieParser        = require('cookie-parser');
var express             = require('express');
var LocalStrategy       = require('passport-local').Strategy;
var passport            = require('passport');
var session             = require('express-session');

// initialize express app
var app = express();

// tell passport to use a local strategy and tell it how to validate a username and password
passport.use(new LocalStrategy(function(username, password, done) {
    if (username && password === 'pass') return done(null, { username: username });
    return done(null, false);
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
            return res.send(req.authInfo);
        }
        return res.sendStatus(401);
    }
);

app.put('/',
    function(req, res) {
        var key = req.query.key;
        var val = req.query.value;
        if (!req.user) return res.sendStatus(401);
        console.log(req.authInfo);
        req.authInfo.set(key, val);
        return res.send(req.authInfo);
    }
);

app.delete('/',
    function(req, res) {
        if (!req.user) return res.sendStatus(401);
        delete req.authInfo[req.query.key];
        return res.send(req.authInfo);
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
        return res.status(200).send(req.authInfo);
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