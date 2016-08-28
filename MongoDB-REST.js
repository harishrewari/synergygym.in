/**
 * Created by harish on 19/8/16.
 */

var express = require('express');
var morgan = require('/home/harish/.npm-global/lib/node_modules/morgan');
var bodyparser = require('/home/harish/.npm-global/lib/node_modules/body-parser');
var MongoClient =require('/home/harish/.npm-global/lib/node_modules/mongodb').MongoClient,
    assert= require('/home/harish/.npm-global/lib/node_modules/assert');
//HTTPServer host address
var hostname = 'localhost';
var port = '3000';
//Connection URL for mongoserver
var url = 'mongodb://localhost:27017/devices';

MongoClient.connect(url,function (err,db) {
   assert.equal(err,null);
    console.log("Successfully connected to Database server");

    var app = express();
    app.use(morgan('dev'));

    var deviceRouter=express.Router();
    deviceRouter.use(bodyparser.json());


    deviceRouter.route('/:deviceId')
        .get(function (req,res,next) {
            var collection = db.collection(req.params.deviceId);
            collection.find({}).toArray(function (err,docs) {
               assert.equal(err,null);
                res.json(docs)
                console.log(req.params.deviceId);
            });

        })
        .post(function (req,res,next) {
            var collection = db.collection(req.params.deviceId);
            collection.insertOne(req.body,function (err,result) {
                assert.equal(err,null);
                res.json(result);
            })

        });

function auth (req, res, next) {
    console.log(req.headers);
    var authHeader = req.headers.authorization;
    if (!authHeader) {
        var err = new Error('You are not authenticated!');
        err.status = 401;
        next(err);
        return;
    }

    var auth = new Buffer(authHeader.split(' ')[1], 'base64').toString().split(':');
    var user = auth[0];
    var pass = auth[1];
    if (user == 'admin' && pass == 'password') {
        next(); // authorized
    } else {
        var err = new Error('You are not authenticated!');
        err.status = 401;
        next(err);
    }
}

    app.use(auth);
    app.use('/devices',deviceRouter);

    app.use(express.static(__dirname+'/public'));
    app.use(function(err,req,res,next) {
            res.writeHead(err.status || 500, {
            'WWW-Authenticate': 'Basic',
            'Content-Type': 'text/plain'
        });
        res.end(err.message);
	});

    app.listen(port,hostname,function () {
        console.log('Server is running at '+ hostname+':'+port);
    });


});


