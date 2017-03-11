/**
 * Created by paki on 2016/10/26.
 */
module.exports = function(router,app) {
    var db = app.get('db');
  //  var mdb = app.get('mdb');
    var async = require('async');
    router.get('/', function (req, res) {
        // db.createCollection("test");
        // db.collection('test',{safe:true},function(errcollection,collection){
        //     if(!errcollection){
        //         console.log('111');
        //         console.log(errcollection);
        //    //     return collection;
        //     }else{
        //         console.log('222');
        //     //    return -1;
        //     }
        // });
        var tablelist = ['visitor'];
        var tasklist = [];
        tablelist.forEach(function (e) {
            var table = e;
            var fn = function (callback) {
                db.collection(table).find({}).toArray(function (err, ret) {
                    if (err) {
                        console.log(err);

                    } else {
                        ret.forEach(function (e, i) {
                            ret[i]['id'] = ret[i]['_id'].id;
                            delete(ret[i]['_id']);
                        })
                        mdb.collection(table).insertMany(ret, function (err, result) {
                            if (err)console.log(err);
                            else console.log(result);
                            callback()
                        })
                    }
                });
            }
            tasklist.push(fn);

        })
        if (tasklist.length > 0) {
            async.series(tasklist, function (err, results) {
                res.json('success');
            })
        }


        //collection.insertMany([
        //    {a : 1}, {a : 2}, {a : 3}
        //], function(err, result) {
        //    if(err)console.log(err);
        //    else console.log(result);
        //    collection.find({}).toArray(function (err, ret) {
        //        if (err)console.log(err);
        //        console.log(ret);
        //        res.json(ret);
        //    })
        //})


    })

    app.get('/last10',function(req,res){
        db.collection('visitor').find({}).limit(10).sort({_id:-1}).toArray(function(err,ret){
            if(err)console.log(err);
            else res.json(ret);
        })
    })
}
