const express = require('express');
const home = require('./routes/home');
const register = require('./routes/register');
const mongoose = require('mongoose');
const path = require('path');
const PORT = 8080;

// connection to database 
mongoose.connect("mongodb//localhost/users_storage", (err, data) => {
    if (err) {
        console.log("Could not connect to database");
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
app.use('/register', register)
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, (err) => {
    if (err) console.log(err);;
    console.log(`App running in http://localhost:${PORT}`);
});