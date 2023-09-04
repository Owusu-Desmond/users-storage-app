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

// console the user data from the request body and authenticate user
router.post("/login", (req, res, next) => {
    const { usernameOrEmail } = req.body;

    // Store the input value in the session
    req.session.previousUsernameOrEmail = usernameOrEmail;

    passport.authenticate('local', (err, user, info) => {
        if(err) {
            console.log(err);
            console.log("Error authenticating user");
            return next(err)
        }
        if(!user) {
            req.flash('error', info.message)
            return res.redirect('/login')
        }
        req.logIn(user, (err) => {
            if(err) return next(err)
            // Clear the stored input value in the session
            delete req.session.previousUsernameOrEmail;
            return res.redirect('/dashboard')
        })
    })(req, res, next)
})

// user dashboard
router.get("/dashboard", (req, res, next) => {
    if(!req.isAuthenticated()) return res.redirect('/login')
    res.render("dashboard", {user: req.user})
})

// get login page
router.get("/login", (req, res, next) => {
    if(req.isAuthenticated()) return res.redirect('/dashboard')
    const error = req.flash('error')
    const usernameOrEmail = req.session.previousUsernameOrEmail;
    delete req.session.previousUsernameOrEmail;
    res.render("login", {error: error, usernameOrEmail: usernameOrEmail})  
})

// logout user
router.post("/logout", (req, res, next) => {
    req.logout( (err) => {
        if(err) return next(err)
        return res.redirect('/login')
    }
    )
})

router.post('/register', (req, res , next) => {
    User.create(req.body, (err ,user) => {
        if(err){
            console.log(err);
            return next(err)
        }
        res.redirect('/login')
    })
}) 

router.get("/register", (req, res, next) => {
    res.render("register", null);
})

module.exports = router;