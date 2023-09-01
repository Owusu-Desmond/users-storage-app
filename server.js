const express = require('express');
const home = require('./routes/home');
const register = require('./routes/register');
const login = require('./routes/login');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');

var logger = require('morgan');
const path = require('path');

const session = require('express-session');
const passport = require('passport');

const MongodbStore = require('connect-mongodb-session')(session);
const mongoose = require('mongoose');

const app = express();

const store = new MongodbStore({
    uri: "mongodb://localhost/users_storage",
    collection: 'sessions'
});

// catch errors when session is not stored in database
store.on('error', (err) => {
    console.error(err);
})

// connection to database 
mongoose.connect("mongodb://localhost/users_storage", (err, data) => {
    if (err) {
        console.log(err);
        return
    }
    else console.log("Connection to database sucessfull");
})

// Configure express-session to use the MongoDBStore
app.use(session({ 
        secret: 'woot',
        resave: false, 
        saveUninitialized: false,
        store: store, // store session in database
        cookie: { maxAge: 1000 * 60 * 60 * 24 } // session expires after 24 hours
    })
);

app.use(logger('dev'));

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hjs');

// cookie parser: used to parse cookies
app.use(cookieParser());

// Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());

// flash messages
app.use(flash());

app.use(express.json());
app.use(express.urlencoded({extended : false}))
app.use('/', home);
app.use('/', register),
app.use('/', login),
app.use(express.static(path.join(__dirname, 'public')));


// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
  });

app.listen(process.env.PORT || 8080, (err) => {
    if (err) console.log(err);;
});