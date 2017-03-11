/**
 * Created by huanghy on 2016/3/31.
 */
module.exports=function(router,app){
    var db=app.get('db');
    var settings = require('../lib/settings')(app);
    router.get('/', function (req, res, next) {
        db.collection('course').find({}).sort({_id:-1}).toArray(function (err, ret) {
            if(ret.length==0){
                ret.push({title:'默认标题',lecturer:'默认讲师',amount:'默认数量',duration:'默认时长',level:'默认级别',_id:'0'});
            }
            //res.send(ret);
            res.render('index/course', {course: ret});
        });
    });
    router.get('/:id', function (req, res, next) {
        var async = require('async');
        async.parallel({
            courses:function(callback){
                db.collection('course').find({},{limit:4}).toArray(function (err, ret) {
                    callback(err,ret);
                });
            },
            course:function(callback){
                db.collection('course').findOne({_id:req.params.id}, function (err, ret) {
                    callback(err,ret);
                });
            }
          /*  index_config:function (callback) {
                settings.getSettings('index_config',function (err,ret) {
                    callback(err,((ret||{}).value)||{});
                });
            }*/
        },function(err,restult){
            console.log('index');
            console.log(err);
            res.render('index/course-single', restult);
        });

    });
    router.put('/:id',function(req, res, next){
        if(req.params.id == "0"){
            db.collection('course').insert(req.body,{w:1},function(err,ret){
                if(err==null){
                    res.json({success:true,new:ret});
                }else{
                    res.json({errors:err.message});
                }
            });
        }else {
            db.collection('course').update({_id: req.params.id}, {$set: req.body}, function (err, ret) {
                res.json({success: true});
            })
        }
    })
        .delete('/:id',function (req,res) {
            db.collection('course').remove({_id:req.params.id},function (err,ret) {
                if(err){
                    res.json({success:false,errors:err.message});
                }else{
                    res.json({success:true});
                }
            });
        });
    router.get('/search/:q',function (req,res) {
        if(req.params.q=='all'){
            db.collection('course').find({}).sort({_id:-1}).toArray(function (err, ret) {
                if(err){
                    res.json({success:false,errors:err.message});
                }else{
                    res.json({success:true,course:ret});
                }
            })
        }else{
            db.collection('course').find({$or:[{title:{$regex:req.params.q}},{lecturer:{$regex:req.params.q}},{level:{$regex:req.params.q}}]}).sort({_id:-1}).toArray(function (err, ret) {
                if(err){
                    res.json({success:false,errors:err.message});
                }else{
                    res.json({success:true,course:ret});
                }
            })
        }


    })
}