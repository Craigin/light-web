/**
 * Created by kinov on 2016/3/28.
 */
module.exports = function(router,app){
    var db=app.get('db');
    router.get('/:type', function(req, res, next) {
      
        db.collection('activity').find({type:req.params.type}).sort({event_time:1}).toArray(function(err,ret){
            // res.send(ret);
            if(ret.length==0){
                ret.push({title:'默认活动标题',content:'默认内容',_id:'0',place:'默认地点'});
            }
            res.render('index/xiaoyuanhuodong-jiangzuo', {activities:ret,activity_type:req.params.type});
        });

    })
        .put('/:id',function(req,res){
            if(req.params.id == "0"){
                db.collection('activity').insert(req.body,{w:1},function(err,ret){
                    if(err==null){
                        res.json({success:true,new:ret});
                    }else{
                        res.json({errors:err.message});
                    }
                });
            }else{
                db.collection('activity').update({_id:req.params.id},{$set:req.body},function(err,ret){
                    if(err==null){
                        res.json({success:true});
                    }else{
                        res.json({errors:err.message});
                    }
                });
            }

        })
        .delete('/:id',function (req,res) {
            db.collection('activity').remove({_id:req.params.id},function (err,ret) {
                if(err){
                    res.json({success:false,errors:err.message});
                }else{
                    res.json({success:true});
                }
            });
        });
}