const express = require('express');
const home = require('./routes/home');
const register = require('./routes/register')
const path = require('path');
const PORT = 8080;

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