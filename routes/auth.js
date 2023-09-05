const express = require('express');
const passport = require('passport')
const LocalPassport = require('passport-local')
const MagicLinkStrategy = require('passport-magic-link').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const sendgrid = require('@sendgrid/mail');
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

sendgrid.setApiKey(process.env['SENDGRID_API_KEY'])

// Magic Link Strategy for passport
// send email with token to user, verify user after token is sent
passport.use(new MagicLinkStrategy({
        secret: 'random secret',
        userFields: ['email'],
        tokenField: 'token',
        verifyUserAfterToken: true
    }, function send (user, token) {
        let link = 'localhost:8080/register/email/verify?token=' + token
        const message = {
            to: user.email,
            from: process.env['EMAIL'],
            subject: "SignUp to User Storage App",
            text: 'Hello! Click the link below to finish signing in to Todos.\r\n\r\n' + link,
            html: '<h3>Hello!</h3><p>Click the link below to finish signing in to Todos.</p><p><a href="' + link + '">Sign Up</a></p>',
        }
        return sendgrid.send(message)
    }, function verify (user) {
        return User.findOne({email: user.email}).then((user) => {
            if(!user) {
                return User.create({
                    username: user.username,
                    email: user.email,
                    password: user.password
                })
            }
            // if user exists, reject the promise
            return Promise.reject(new Error('User already exists'))
        })
    }
))

// Google Strategy for passport
passport.use(
    new GoogleStrategy(
      {
        clientID: process.env['GOOGLE_CLIENT_ID'],
        clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
        callbackURL: process.env['GOOGLE_CALLBACK_URL']
      }, (accessToken, refreshToken, profile, done) => {
        User.findOne({ googleId: profile.id }, (err, user) => {
          if (err) return done(err);
          if (user) return done(null, user);
          const newUser = new User({
            googleId: profile.id,
            username: profile.displayName,
            email: profile.emails[0].value,s
          });
          newUser.save(err => {
            if (err) return done(err);
            done(null, newUser);
          });
        });
      }
    )
);

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

router.post('/register', passport.authenticate('magiclink', {
        action: 'requestToken',
        failureRedirect: '/register',
    }), (req, res, next) => {
        res.redirect('/register/email/check')
    }
)

router.get('/register/email/check', (req, res, next) => {
    res.render('check_email')
})

router.get('/login/email/verify', passport.authenticate('magiclink', {
    successReturnToOrRedirect: '/',
    failureRedirect: '/login'
}));

router.get("/register", (req, res, next) => {
    res.render("register", null);
})


// Route to initiate Google OAuth authentication
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));


// Callback route to handle Google OAuth callback
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    res.redirect('/dashboard')
  });

module.exports = router;