const express = require('express');
const User = require('../models/User');
const router = express.Router();

// create a response for the homepage
router.post('/', (req, res, next) => {
    const username = req.body.username;
    const email = req.body.email;
    // check if email already registered
    User.find({ email: email }, (err, users) => {
        const data = {
            email: email,
            emailError: "Email address already registered please login",
        }
        // send error to user when there is error
        console.log(users);
        if (users.length !== 0) {
            res.render('register', data);
            return;
        }
    })  
    // check if username has taken by another user
    User.find({ username: username }, (err, users) => {
        const data = {
            username: username,
            usernameError: "Username already taken by another user",
        }
        // send error to user when there is error
        if (err) {
            res.send(err);
        }
        if (users.length !== 0) {
            res.render('register', data);
        }
        return;
    })
    // register user if email and username do not exist
    User.create(req.body, (err, user) => {
        if (err) {
            res.json(
                {
                    configuration: 'fail',
                    error: err,
                }
            );
            return;
        }
        console.log(user);
        // when there is no error
        res.send(`Hello ${username}, you are almost there, we are in the process of creating your storage for you.`)
    })
})

router.get("/", (req, res, next) => {
    res.render("register", null);
})

module.exports = router;