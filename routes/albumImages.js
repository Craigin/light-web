/**
 * Created by huanghy on 2016/4/7.
 */
module.exports=function(router,app){
    var db=app.get('db');
    router.put('/:id',function(req,res){
        if(req.params.id == "0"){
            db.collection('album_images').insert(req.body,{w:1},function(err,ret){
                if(err==null){
                    res.json({success:true,new:ret});
                }else{
                    res.json({errors:err.message});
                }
            });
        }else{
            db.collection('album_images').update({_id:req.params.id},{$set:req.body},function(err,ret){
                if(err==null){
                    res.json({success:true});
                }else{
                    res.json({errors:err.message});
                }
            });
        }
    })
        .delete('/:id',function (req,res) {
            db.collection('album_images').remove({_id:req.params.id},function (err,ret) {
                if(err){
                    res.json({success:false,errors:err.message});
                }else{
                    res.json({success:true});
                }
            });
        });
}