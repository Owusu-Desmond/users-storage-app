const express = require('express');
const User = require('../models/User');
const router = express.Router();

// create a post response after login user
router.post('/', (req, res, next) => {
    // check if user already exist
    const email = req.body.email;
    const password = req.body.password;
    User.find({ email: email }, (err, users) => {
        if (err) {
            res.json(
                {
                    configuration: "fail",
                    error: err,
                }
            )
            return;
        }
        // login validation
        if (users.length === 0) {
            const data = {
                emailError: "Email address is not registered!",
                email: email,
            }
            res.render('login', data)
        } else if (password !== users[0].password) {
            const data = {
                passwordError: "Password do not match with email!",
                email: email,
            }
            res.render('login', data)
        }else{
            res.send(`Hello ${users[0].username}, you are almost there, we are in the process of creating your storage for you.`)
        }
    })
})

router.get("/", (req, res, next) => {
    res.render("login", null);
})


module.exports = router;