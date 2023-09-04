const express = require('express');
const passport = require('passport')
const LocalPassport = require('passport-local')
const User = require('../models/User');
const router = express.Router();

passport.use( new LocalPassport( {
    usernameField: 'usernameOrEmail',
    passwordField: 'password'
},(usernameOrEmail, password, done) => {
        User.findOne({
            $or: [{username: usernameOrEmail}, {email: usernameOrEmail}]
        }, (err, user) => {
            console.log('the user is: ', user);
            if (err) return done(err)
            if(!user) {
                console.log("Incorrect username or email");
                return done(null,false, { message: "Incorrect username or email"} )
            }
            console.log(password);
            if(!user.isValidPassword(password)) {
                return done(null, false, { message: "Incorrect password"})
            }
            console.log(user);
            if(user) return done(null, user)
        })
    })
)

// serialize user
passport.serializeUser((user, done) => {
    done(null, user.id)
})

// deserialize user
passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user)
    })
})

// console the user data from the request body and authenticate user
router.post("/login", (req, res, next) => {
    console.log(req.body);
    passport.authenticate('local', (err, user, info) => {
        if(err) {
            console.log(err);
            console.log("Error authenticating user");
            return next(err)
        }
        if(!user) return res.redirect('/login')
        req.logIn(user, (err) => {
            if(err) return next(err)
            return res.redirect('/profile')
        })
    })(req, res, next)
})

router.get("/login", (req, res, next) => {
    const errorMessage = req.flash('error');
    console.log(errorMessage);
    res.render("login", null,)
})

module.exports = router;