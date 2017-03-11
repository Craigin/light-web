/**
 * Created by kinov on 2016/3/28.
 */
module.exports=function(router,app){
    var db = app.get('db');
    router.get('/category/:type',function(req,res){

        db.collection('category').findOne({tId:req.params.type*1},function(err,ret){
            var result = {categorys:ret.child||[]};
            if(req.params.type=='2'){
                result.categorys.push({id:'live',name:'直播'});
            }
           res.json(result);
        });
    });

    router.put('/category/:type',function(req,res){
        /*
        db.collection('category').update({id:req.body.id},{$set:req.body},function(req,ret){
            res.json({success:true});
        });*/
        db.collection('category').findOne({tId:req.params.type},function(err,ret){
            for(var i=0;i<ret.child.length;i++){
                if(ret.child[i].id==req.body.id) {
                    for(var s in req.body){
                        ret.child[i][s]= req.body[s];
                    }
                }
            }
            db.collection('category').update({tId:req.params.type},{$set:ret},function(err,result){
                res.json({success:true});
            });
        })
    });

    router.get('/:type/:category',function(req,res){
       var compareId =  req.query.compareId||0;
        var type = req.params.type;
        console.log('compare id:'+compareId);
        if(type=='videos'&&req.params.category=='live'){
            db.collection('livehost').findOne({},function(err,ret){
             if(err){
                 console.log(err.message);
                 return;
             }


            var request = require('request');
            var crypto = require('crypto');
            var datetime=new Date().getTime();
            var time=parseInt(datetime/1000);
            //var time=datetime;
            var accessId=ret.accessid;
            var code=accessId+time+'program';
           // var content = 'password'
            var md5 = crypto.createHash('md5');
            md5.update(code);
            code = md5.digest('hex');
            request.post(
                {
                    url:'http://'+ret.host+':'+ret.port+'/service/api/?do=program',
                 //   url:'http://192.168.1.219:81/service/api/?do=program',
                    form:{
                        time:time,
                        code:code
                    },
                    encoding:'utf8'
                },
                function(error, response, body){
                    if(response.statusCode == 200){
                        var list=[];
                        var data=JSON.parse(body);
                        //res.json(data);
                        for(var i=0;i<data.record.length;i++){
                       //     if(data.record[i].push_status=='2'){
                                var obj={
                                    name:data.record[i].name,
                                //    dir:'http://'+ret.host+':5080/hls/'+data.record[i].programid+'.m3u8',
                                    dir:data.record[i].url,
                                    pic:data.record[i].pic
                                //    pic:'http://'+ret.host+'/snaptshop/'+data.record[i].programid+'.jpg'
                                }
                                list.push(obj);
                      //      }
                        }
                        console.log(list);
                     res.json({images:list});
                    }else{
                        console.log(response.statusCode);
                    }
                }
            );
            })
        }else{
        var findParams = {category:req.params.category,_id:{$gt:compareId}};
        if(type=='videos') findParams['status']=1;
        db.collection(type).find(findParams).sort({_id:1}).limit(compareId>0?10:20).toArray(function(err,ret){
            if(ret)     res.json({images:ret});
            else res.json({images:[]});
            console.log(err);
        });
        }
    });
    
    
    
    router.delete('/images/:id',function(req,res){
       db.collection('images').remove({_id:req.params.id},function(req,ret){
           res.json({sucecss:true});
       })
    });
};