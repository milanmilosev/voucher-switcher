const express = require('express');
const fs = require('fs');
const app = express();
const bodyParser = require('body-parser')

var urlencodedParser = bodyParser.urlencoded({ extended: true });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.post('/index', urlencodedParser, function(req, res) {
    console.log(req.body);
    res.status(200).send(req.body);
    const data = {}
    data.table = 
    [{
        status: req.body.status,
        voucher: req.body.voucher,
        value: req.body.value
    }];
    fs.writeFile ("api/api.json", JSON.stringify(data), function(err) {
        if (err) throw err;
        console.log('api.json created');
        }
    );
});


app.listen(process.env.PORT || 3000);
