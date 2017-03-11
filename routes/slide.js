/**
 * Created by kinov on 2016/3/28.
 */
module.exports=function(router,app){
    var db = app.get('db');
    router.put('/:slideid',function(req,res){
        db.collection('slide').update({key:req.params.slideid},{$set:{content:req.body.content}},function(err,ret){
            if(err==null){
                res.json({success:true})
            }else{
                res.json({errors:err.message});
            }
        });

    });
}