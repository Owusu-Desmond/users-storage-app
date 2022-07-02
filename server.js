const express = require('express');
const home = require('./routes/home');
const register = require('./routes/register');
const login = require('./routes/login');
const mongoose = require('mongoose');
const path = require('path');
const MongoDB_URL = "mongodb+srv://desmond:desmond@cluster0.xcbpx.mongodb.net/?retryWrites=true&w=majority";

// connection to database 
mongoose.connect(MongoDB_URL || "mongodb://localhost/users_storage", (err, data) => {
    if (err) {
        console.log(err);
        return
    }
    else console.log("Connection to database sucessfull");
})

const app = express()
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hjs');

app.use(express.json());
app.use(express.urlencoded({extended : false}))
app.use('/', home);
app.use('/register', register),
app.use('/login', login),
app.use(express.static(path.join(__dirname, 'public')));

app.listen(process.env.PORT || 8080, (err) => {
    if (err) console.log(err);
});