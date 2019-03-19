const express = require('express');
const router = express.Router();
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const Auth0Strategy = require('passport-auth0');
const urlencodedParser = bodyParser.urlencoded({ extended: true });
const AWS = require('aws-sdk');

require('dotenv').config({ path: 'process.env' })


// AWS config
AWS.config.update({ 
    accessKeyId: process.env.AWS_ACCESSKEY, 
    secretAccessKey: process.env.AWS_SECRET_ACCESSKEY
});

const myVars = {
    domain: process.env.CLIENT_DOMAIN,
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.REDIRECT_URI || 'http://localhost:3000/callback'
}

const strategy = new Auth0Strategy({
        domain: myVars.domain,
        clientID: myVars.clientID,
        clientSecret: myVars.clientSecret,
        callbackURL: myVars.callbackURL
    },
    function(accessToken, refreshToken, extraParam, profile, done) {
        return done(null, profile);
    }
)

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

router.use(
    session({
        secret: myVars.clientSecret,
        resave: true,
        saveUninitialized: true
    })
);


passport.use(strategy);
passport.serializeUser(function(user, done) { done(null, user); });
passport.deserializeUser(function (user,done) { done(null, user); })

router.use(
    session({
        secret: myVars.clientSecret,
        resave: true,
        saveUninitialized: true
    })
);

router.use(passport.initialize());
router.use(passport.session());

router.use(function (req,res, next) {
    res.locals.loggedIn = false;

    if (req.session.passport && typeof req.session.passport.user != 'undefined') {
        res.locals.loggedIn = true;
    }

    next();
});

// Perform the login, after login Auth0 will redirect to callback
router.get('/login', passport.authenticate('auth0', 
    {
        clientID: myVars.clientID,
        domain: myVars.domain,
        redirectUri: myVars.callbackURL,
        responseType: 'code',
        audience: 'https://dev-w6903s3t.eu.auth0.com/api/v2/',
        scope: 'openid profile'
    }),
    function(req, res) {
        res.redirect(path.join(__dirname, '../views/dashboard.html'));
    }
);

// Perform the final stage of authentication and redirect to previously requested URL or '/dashboard'
router.get('/callback',
    passport.authenticate('auth0', {
        failureRedirect: '/failure.html'
    }),
    function(req,res) {
        res.sendFile(path.join(__dirname, '../views/dashboard.html'));
    }
);

router.post('/views/dashboard', urlencodedParser, function(req, res) {
    console.log(req.body);
    res.status(200).send(req.body);
    const data = {}
    data.table = 
    [{
        status: req.body.status,
        voucher: req.body.voucher,
        value: !isNaN(req.body.value) ? req.body.value : 'value is NaN'
    }];

    const S3 = new AWS.S3();

    const param = {
        Bucket: 'voucher-switcher',
        Key: 'api.json',
        Body: JSON.stringify(data),
        ContentType: 'application/json',
        ACL:'public-read'
    };

    S3.putObject(param).promise()
    .then(data => {
      console.log('complete:PUT Object',data);
       callback(null, data);
    })
    .catch(err => {
      console.log('failure:PUT Object', err);
       callback(err);
    });
});

module.exports = router;