require('./config.js');
var express = require('express');
var app = express();
var elasticsearch_client = require('./'+libs_path+'elasticCon.js');
var csv_parser = require('./'+libs_path+'csvParser.js');

var bodyParser = require('body-parser');

var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    next();
});
app.post('/search', urlencodedParser,function (req, res) {
    var word = req.body.word? req.body.word : null;

    elasticsearch_client.search(word,1,function(data) {
        res.end(data)
    });
});

app.get('/search',function (req, res) {

    var word = req.query.word? req.query.word : null;
    var page = req.query.page && req.query.page>0 ? req.query.page : 1;

    elasticsearch_client.search(word,page,function(data) {
        res.end(data)
    });
});

var server = app.listen(app_port,app_address, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log("Our app listening at http://%s:%s", host, port)
});

elasticsearch_client.deploy(csv_parser.parser);