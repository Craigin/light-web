/**
 * Created by paki on 2016/3/28.
 */
module.exports=function(router,app){
    var db = app.get('db');
    var pagesize=20;
    router.get('/category/:type',function(req,res){
        db.collection('category').findOne({tId:req.params.type*1},function(err,ret){
           res.json({categorys:ret.child||[]});
        });
    });
    router.get('/images/:category/:compare',function(req,res){
       var ccompareId =  req.params.compare||0;
        db.collection('images').find({"category": req.params.category,"_id":{$lt:req.params.compare}}).sort( {"_id": -1 }).limit(pagesize).toArray(function(err,ret){

            res.json({images:ret});

        });
    });
    router.get('/videos/:category/:compare',function(req,res){
        var ccompareId =  req.params.compare||0;
        db.collection('videos').find({"category": req.params.category,"_id":{$lt:req.params.compare}}).sort( {"_id": -1 }).limit(pagesize).toArray(function(err,ret){

          //  console.log(ret);
            res.json({videos:ret});

        });
    });
    router.get('/docs/:category/:compare',function(req,res){
        var ccompareId =  req.params.compare||0;
        db.collection('docs').find({"category": req.params.category,"_id":{$lt:req.params.compare}}).sort( {"_id": -1 }).limit(pagesize).toArray(function(err,ret){

            //  console.log(ret);
            res.json({docs:ret});

        });
    });
};