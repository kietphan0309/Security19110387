require('dotenv').config();
const fs = require('fs')
const https = require('https')
const path = require('path')
const express = require('express')
const helmet = require('helmet')
const passport = require('passport')
const { Strategy } = require('passport-google-oauth2')
const session = require('express-session')
const PORT = 3000
const config = {
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET
}

const AUTH_OPTIONS = {
    callbackURL: '/auth/google/callback',
    clientID: config.CLIENT_ID,
    clientSecret: config.CLIENT_SECRET
}
function verifyCallback(accessToken, refreshToken, profile, done) {
    done(null, profile)
}
passport.use(new Strategy(AUTH_OPTIONS, verifyCallback));

passport.serializeUser((user, done) => {
    done(null, user.id)
})
passport.deserializeUser((id, done) => {
    done(null, id)
})

const app = express();

app.use(helmet())
app.use(session({
    name: 'session',
    secret: '19110387PhanNguyenChuKiet',
    resave: true,
    saveUninitialized: true,
    cookie: { secure: true }
}))

app.use(passport.initialize())
app.use(passport.session())

const checkLoggedIn = ((req, res, next) => {
    const isLoggedIn = req.isAuthenticated() && req.user
    if (!isLoggedIn) {
        return res.status(401).json({
            error: 'You must log in'
        })
    }
    next()
})

app.get('/auth/google',
    passport.authenticate('google', {
        scope: ['email'],
    })
)

app.get('/auth/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/failure',
        successRedirect: '/',
        session: true,
    }),
    (req, res) => {
    }
)

app.get('/auth/logout', (req, res) => {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
})

app.get('/secret', checkLoggedIn, (req, res) => {
    return res.send("Your personal secret value is 42");
})
app.get('/failure', (req, res) => {
    return res.send('Failed to log in')
})

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,  'index.html'))
})

https.createServer({
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
}, app).listen(PORT, () => {
})
