/**
 * Created by kinov on 2016/3/28.
 */
module.exports=function(router,app){
    var db = app.get('db');
    router
        .put('/:key',function(req,res){
        var identify = 'key';
        if(/^\d+$/i.test(req.params.key)) identify='_id';
        var condiction = {};
        condiction[identify] = req.params.key;
        db.collection('article').findOne(condiction,function(err,result){
            if(err==null) {
                var article = req.body;
                if (result == null) {
                    article['key'] = req.params.key;
                    db.collection('article').insert(article, {w: 1}, function (err, ret) {
                        if(err==null){
                            res.json({success:true});
                        }else{
                            res.json({errors:err.message});
                        }
                    });
                } else {
                     db.collection('article').update(condiction,{$set:article},function(err,ret){
                         if(err==null){
                             res.json({success:true});
                         }else{
                             res.json({errors:err.message});
                         }
                     });
                }
            }else{
                res.error(err);
            }
        });
    })
        .delete('/:id',function (req,res) {
            var identify = 'key';
            if(/^\d+$/i.test(req.params.key)) identify='_id';
            var condiction = {};
            condiction[identify] = req.params.key;

          db.collection('article').remove(condiction,function (err,ret) {
              if(err){
                  res.json({success:false,errors:err.message});
              }else{
                  res.json({success:true});
              }
          })
    });
}