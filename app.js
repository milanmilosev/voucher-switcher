const express = require('express');
const app = express();
const fs = require('fs');
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: true });

// Auth0 setup
const session = require('express-session');
const passport = require('passport');
const Auth0Strategy = require('passport-auth0');

// Allow CORS
app.use(cors());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", '*');
    res.header("Access-Control-Allow-Credentials", true);
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');

    next();
});


const myVars = {
    domain: 'dev-w6903s3t.eu.auth0.com',
    clientID: 'Rt19ColVsHJtS6rgc88tpLyXFqshf6UV',
    clientSecret: 'juYpnWztsSeNXhGuv5IHJipmxsQRKhH1Q7Hja6kamycKckEjtn87jXouL8IV0Ug3',
    callbackURL: 'https://voucher-switcher.herokuapp.com/callback'
}

const strategy = new Auth0Strategy(
    {
        domain: myVars.domain,
        clientID: myVars.clientID,
        clientSecret: myVars.clientSecret,
        callbackURL: myVars.callbackURL
    },
    function(accessToken, refreshToken, extraParam, profile, done) {
        return done(null, profile);
    }
)

passport.use(strategy);

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function (user,done) {
    done(null, user);
})

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(
    session({
        secret: 'juYpnWztsSeNXhGuv5IHJipmxsQRKhH1Q7Hja6kamycKckEjtn87jXouL8IV0Ug3',
        resave: true,
        saveUninitialized: true
    })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(function (req,res, next) {
    res.locals.loggedIn = false;

    if (req.session.passport && typeof req.session.passport.user != 'undefined') {
        res.locals.loggedIn = true;
    }

    next();
});



app.get('/', function(req, res) {
    res.sendFile(__dirname + '/views/index.html');
});

app.get('/login', passport.authenticate('auth0', 
    {
        clientID: myVars.clientID,
        domain: myVars.domain,
        redirectUri: myVars.callbackURL,
        responseType: 'code',
        audience: 'https://dev-w6903s3t.eu.auth0.com/api/v2/',
        scope: 'openid profile' }),
        function(req, res) {
            res.redirect('/dashboard');
        }
);

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
})

app.get('/callback',
    passport.authenticate('auth0', {
        failureRedirect: '/failure.html'
    }),
    function(req,res) {
        res.sendFile(__dirname + '/views/dashboard.html');
    }
);

app.get('/failure', function(req, res, next) {
    res.sendFile(__dirname + '/views/failure.html');
})

app.get('/public/api.json', function(req, res) {
    res.sendFile(__dirname + '/public/api.json');
});

app.get('/public/style.css', function(req, res) {
    res.sendFile(__dirname + '/public/style.css');
});

app.get('/public/lp-hero.png', function(req, res) {
    res.sendFile(__dirname + '/public/lp-hero.png');
});

app.use(express.static('public'));

app.post('/views/dashboard', urlencodedParser, function(req, res) {
    console.log(req.body);
    res.status(200).send(req.body);
    const data = {}
    data.table = 
    [{
        status: req.body.status,
        voucher: req.body.voucher,
        value: req.body.value
    }];
    fs.writeFile ("public/api.json", JSON.stringify(data), function(err) {
        if (err) throw err;
        console.log('api.json created');
        }
    );
});


app.listen(process.env.PORT || 3000);