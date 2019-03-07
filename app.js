const express = require('express');
const app = express();
const fs = require('fs');
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: true });

// Auth0 setup
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const Auth0Strategy = require('passport-auth0');

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
        failureRedirect: '/failure'
    }),
    function(req,res) {
        res.redirect('/dashboard');
    }
);

app.get('/dashboard', function(req, res, next) {
    res.sendFile(__dirname + '/views/dashboard.html', {
        user: req.user
    });
})

app.get('/failure', function(req, res, next) {
        res.send('failure');
})

app.get('/public/api.json', function(req, res) {
    res.sendFile(__dirname + '/public/api.json');
});

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


app.use(express.static('public'))

app.listen(process.env.PORT || 3000);




// const express = require('express');
// const fs = require('fs');
// const app = express();
// const bodyParser = require('body-parser')

// var urlencodedParser = bodyParser.urlencoded({ extended: true });

// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());

// app.get('/', function(req, res) {
//     res.sendFile(__dirname + '/index.html');
// });

// app.get('/public/api.json', function(req, res) {
//     res.sendFile(__dirname + '/public/api.json');
// });

// app.post('/index', urlencodedParser, function(req, res) {
//     console.log(req.body);
//     res.status(200).send(req.body);
//     const data = {}
//     data.table = 
//     [{
//         status: req.body.status,
//         voucher: req.body.voucher,
//         value: req.body.value
//     }];
//     fs.writeFile ("public/api.json", JSON.stringify(data), function(err) {
//         if (err) throw err;
//         console.log('api.json created');
//         }
//     );
// });


// app.listen(process.env.PORT || 3000);
