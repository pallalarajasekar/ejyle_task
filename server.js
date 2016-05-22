/**
 * Created by pallali on 20/5/16.
 */


var config = {
    port: 8966,
    viewPath: __dirname + '/views', //Template Engine
    publicPath: __dirname + '/public', //Public Folder (Javascript, CSS)
    sessionStore: true,
    socketIO: true
}


var MongoClient = require('mongodb').MongoClient;
var db = null
MongoClient.connect("mongodb://localhost:12346/database", function(err, database) {
    db = database;
    assert.equal(null, err);

});
var us = require('underscore');
var assert = require('assert');
var XPressIO = require('xpressio');
var xpress = new XPressIO(config).start();
var app = xpress.app;
var io = xpress.io;

var async = require("async");

app.get('/', function(req, res){
    res.render("index")
})

app.post('/search',function(req,res) {
    console.log(req.body);
    //var input=req.body.categoryid;
    //console.log(input);
    console.log(req.body.input);

    //var Pcid=req.body.input*1;


    var categoryID = req.body.input * 1;
    var data = null;

    db.collection('dataset').findOne({"CategoryId": categoryID}, {
        ParentCategoryId: 1,
        Name: 1,
        Keywords: 1,
        _id: 0
    }, function (err, docs) {

        data = docs;

        if (data && data.Keywords) {
            res.send(data);
        } else if (data) {

            var tempCategoryID = data.ParentCategoryId;
            async.until(
                function () {
                    return data.Keywords
                },

                function (callback) {
                    db.collection('dataset').findOne({"CategoryId": tempCategoryID}, {
                        ParentCategoryId: 1,
                        Name: 1,
                        Keywords: 1,
                        _id: 0
                    }, function (err, docs) {
                        if (!err && docs) {

                            if (docs.Keywords) {
                                data.Keywords = docs.Keywords;

                            } else {
                                tempCategoryID = docs.ParentCategoryId;
                            }
                            callback(null);


                        } else {
                            callback("KeyWordsNotFound");
                        }
                    })
                },
                function (err, n) {
                    res.send(data)
                }
            );


        } else {
            res.send("CATEGORY_NOT_FOUND")
        }

    });
    app.post('/count',function(req,res)
    {
      console.log(req.body);

    })

















   /* db.collection('dataset').findOne({"CategoryId":req.body.input*1},{ParentCategoryId:1,Name:1,Keywords:1,_id:0},function(err,docs) {

        //console.log(docs);
        //console.log([docs.ParentCategoryId]);
        //console.log([docs.Name]);
        //console.log([docs.Keywords]);

        var Pcid=docs.Keywords;

        async.until(function(){

            if (Pcid) {

                return docs;

            }
        },
            function(callback) {

                db.collection('dataset').findOne({"CategoryId": docs.ParentCategoryId}, {
                    ParentCategoryId: 1,
                    Name: 1,
                    Keywords: 1,
                    _id: 0
                }, function (err, doc) {

                    Pcid=doc.Keywords;
                })
                callback(null, Pcid);
            },
            function(err,n){
                console.log(docs);
                res.send(docs);
            }

        )


    })*/

     /*       db.collection('dataset').findOne({"CategoryId":docs.ParentCategoryId},{ParentCategoryId:1,Keywords:1,_id:0},function(err,doc) {

                if (doc.Keywords) {
                    docs.Keywords = doc.Keywords;
                    console.log(docs);
                    res.send(docs);
                }

                else{
                    db.collection('dataset').findOne({"CategoryId":doc.ParentCategoryId},{ParentCategoryId:1,Keywords:1,_id:0},function(err,docss){

                        if(docss.Keywords){

                            docs.Keywords=docss.Keywords;
                            console.log(docs);
                            res.send(docs);
                        }

                    })
                }
        })
        }

    });*/
})

