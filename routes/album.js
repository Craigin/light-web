/**
 * Created by kinov on 2016/3/28.
 */
module.exports=function(router,app){
    var db=app.get('db');
    router.get('/:category',function(req,res){
        db.collection('album').find({category:req.params.category}).sort({_id:-1}).toArray(function(err,ret){
            if(ret.length==0){
                ret.push({covertit:'默认标题',coverUrl:'/index/images/default.jpg',_id:'0'});
            }
            res.render('index/album', {album:ret});
        });
    });
    router.get('/:category/:id',function(req,res){
        var async = require('async');
        async.parallel({
            album:function(callback){
                db.collection('album').findOne({_id:req.params.id},function(err,ret){
                    callback(err,ret);
                });
            },
            albumImages:function(callback){
                db.collection('album_images').find({key:req.params.id}).sort({_id:-1}).toArray(function(err,ret){
                    if(ret.length==0){
                        ret.push({imgtit:'默认标题',imgurl:'/index/images/default.jpg',_id:'0'});
                    }
                    callback(err,ret);
                });
            }
        },function(err,restult){
            res.render('index/gallery-album', restult);
        });
    });
    router.put('/:id',function(req,res){
        if(req.params.id == "0"){
            db.collection('album').insert(req.body,{w:1},function(err,ret){
                if(err==null){
                    res.json({success:true,new:ret});
                }else{
                    res.json({errors:err.message});
                }
            });
        }else{
            db.collection('album').update({_id:req.params.id},{$set:req.body},function(err,ret){
                if(err==null){
                    res.json({success:true});
                }else{
                    res.json({errors:err.message});
                }
            });
        }
    })
        .delete('/:id',function (req,res) {
            db.collection('album').remove({_id:req.params.id},function (err,ret) {
                if(err){
                    res.json({success:false,errors:err.message});
                }else{
                    res.json({success:true});
                }
            });
        });
}