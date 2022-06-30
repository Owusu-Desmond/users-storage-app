const express = require('express');
const home = require('./routes/home');
const path = require('path');
const PORT = 8080;

const app = express()

app.use('/', home);

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hjs');
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, (err) => {
    if (err) console.log(err);;
    console.log(`App running in http://localhost:${PORT}`);
});