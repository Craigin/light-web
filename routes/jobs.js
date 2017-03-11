/**
 * Created by huanghy on 2016/3/29.
 */

module.exports = function(router,app){
    var db = app.get('db');
    router.get('/', function(req, res, next) {
        db.collection('jobs').find({}).sort({_id:-1}).toArray(function(err,ret){
            if(ret.length==0){
                ret.push({title:'默认标题',content:'默认内容',_id:'0'});
            }
            res.render('index/jobs', {jobs: ret});
        });

    });
    router.get('/:jobsid', function(req, res, next) {
        db.collection('jobs').findOne({_id:req.params.jobsid},function(err,ret){
            res.render('index/job-single', {jobs: ret});
        });

    });
    router.put('/:jobsid',function(req,res){
        if(req.params.jobsid == "0"){
            db.collection('jobs').insert(req.body,{w:1},function(err,ret){
                if(err==null){
                    res.json({success:true,new:ret});
                }else{
                    res.json({errors:err.message});
                }
            });
        }else {
            db.collection('jobs').update({_id: req.params.jobsid}, {$set: req.body}, function (err, ret) {
                if (err == null) {
                    res.json({success: true});
                } else {
                    res.json({errors: err.message});
                }
            });
        }
    })
        .delete('/:id',function (req,res) {
            db.collection('jobs').remove({_id:req.params.id},function (err,ret) {
                if(err){
                    res.json({success:false,errors:err.message});
                }else{
                    res.json({success:true});
                }
            });
        });
}