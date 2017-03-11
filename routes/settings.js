/**
 * Created by kinov on 2016/4/5.
 */
module.exports=function(router,app){
    var db = app.get('db');
    router.get('/',function(req,res){

    });
    router.put('/:key',function(req,res){
        db.collection('settings').findOne({key:req.params.key},function (err,ret) {

            if(ret==null){
                db.collection('settings').insert({key:req.params.key,value:req.body},{w:1},function (err,ret) {
                    if(err){
                        res.json({
                            success:false,
                            errors:err.message
                        });
                    }else{
                        res.json({success:true});
                    }
                });
            }else{
                
                var obj = ret['value'];
                for(var s in req.body){
                    obj[s] = req.body[s];
                }
                console.log('update:'+JSON.stringify(obj));
                db.collection('settings').update({_id:ret['_id']},{$set:{value:obj}},function (err,ret) {
                    if(err){
                        res.json({
                            success:false,
                            errors:err.message
                        });
                    }else{
                        res.json({success:true});
                    }
                });
            }
        });
    });
}