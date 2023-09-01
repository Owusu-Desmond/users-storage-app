const express = require('express');
const passport = require('passport')
const LocalPassport = require('passport-local')
const User = require('../models/User');
const router = express.Router();

passport.use( new LocalPassport( (usernameOrEmail, password, done) => {
        User.findOne({
            $or: [{username: usernameOrEmail}, {email: usernameOrEmail}]
        }, (err, user) => {
            if (err) return done(err)
            if(!user) {
                console.log("Incorrect username or email");
                return done(null,false, { message: "Incorrect username or email"} )
            }
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

router.post('/login', passport.authenticate('local', {
    successRedirect: '/profile',
    failureRedirect: '/home',
    failureFlash: true
}))

router.get("/login", (req, res, next) => {
    res.render("login", null,)
})

module.exports = router;