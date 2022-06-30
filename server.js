const express =  require('express');
const home = require('./routes/home')
const app = express()

app.use('/', home);

app.listen(8080);
console.log("App running in http://localhost:8080");