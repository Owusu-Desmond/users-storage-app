const express = require('express');
const passport = require('passport')
const LocalPassport = require('passport-local')
const MagicLinkStrategy = require('passport-magic-link').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const nodemailer = require('nodemailer');
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

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env['EMAIL'],
      pass: process.env['EMAIL_PASSWORD']
    }
});

// Magic Link Strategy for passport
passport.use(new MagicLinkStrategy({
    secret: 'random secret',
    userFields: ['username', 'email', 'password'],
    tokenField: 'token',
    verifyUserAfterToken: true,
    passReqToCallbacks: true
}, async (req, user, token) => {
    let link = `http://localhost:8080/register/email/verify?token=${token}`;
    const mailOptions = {
        from: process.env['EMAIL'],
        to: user.email,
        subject: 'Sign Up to User Storage App',
        text: `Hello! Click the link below to finish signing in to Todos.\r\n\r\n${link}`,
        html: `<p>Hello! Click the link below to finish signing in to Todos.</p><p><a href="${link}">Sign Up</a></p>`,
    };
    return new Promise( async (resolve, reject) => {
        try {
            // Store the input value in the session
            req.session.previousUsername = user.username;
            req.session.previousEmail = user.email;

            const existingUser = await User.findOne({
                $or: [{ username: user.username }, { email: user.email }],
            });
            
            if (existingUser) {
                if (existingUser.username === user.username) {
                    req.flash('error', 'Username already exists');
                }
                if (existingUser.email === user.email) {
                    req.flash('error', 'Email already exists');
                }
                reject();
            } else {
                transporter.sendMail(mailOptions, (err, info) => {
                    if (err) {
                        req.flash('error', 'Error sending email');
                        console.log('Error sending email: ' + err.message);
                        reject();
                    } else {
                        req.flash('success', `Email sent to ${user.email}`);
                        console.log("Email sent: " + info.response);
                        resolve();
                    }
                });
            }
        } catch (err) {
            reject(err);
        }
    })
}, async (req, user) => {
        try {
            const newUser = new User({
                username: user.username,
                email: user.email,
                password: user.password
            });
    
            await newUser.save();
            return newUser;
        } catch (err) {
            req.flash('error', 'Error creating user');
            throw err;
        }
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
            email: profile.emails[0].value
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
        failureFlash: true,
        successFlash: true,

    }), (req, res, next) => {
        if (req.flash('success').length > 0) return res.redirect('/register/email/check');
        res.redirect('/register')
    }
)

router.get('/register/email/check', (req, res, next) => {
    if(req.isAuthenticated()) return res.redirect('./dashboard')
    res.render('check_email')
})

router.get('/register/email/verify', passport.authenticate('magiclink', {
    successReturnToOrRedirect: '/dashboard',
    failureRedirect: '/register',
    failureFlash: true
}))

router.get("/register", (req, res, next) => {
    if(req.isAuthenticated()) return res.redirect('./dashboard')
    const error = req.flash('error')
    const username = req.session.previousUsername;
    const email = req.session.previousEmail;
    delete req.session.previousUsername;
    delete req.session.previousEmail;
    res.render("register", {error: error, username: username, email: email})
})

// Route to initiate Google OAuth authentication
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));


// Callback route to handle Google OAuth callback
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    if(req.isAuthenticated()) return res.redirect('./dashboard')
    res.redirect('/dashboard')
});

module.exports = router;