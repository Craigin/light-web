/**
 * Created by kinov on 2016/3/28.
 */
module.exports = function(router,app){
    var db=app.get('db');
    router.get('/', function (req, res, next) {
        db.collection('article').findOne({key: 'teachers'}, function (err, article) {

            res.render('index/teacher-team', {article:article});
        });
    });
    router.get('/leader', function (req, res, next) {
        db.collection('teachers').find({}).toArray(function(err,ret){
            if(ret.length==0){
                ret.push({title:'默认标题',content:'默认内容',_id:'0',url:'/index/images/default.jpg'});
            }
            res.render('index/teacher-leader', {teachers: ret});
        });
    }).put('/:id',function(req,res){
        if(req.params.id == "0"){
            db.collection('teachers').insert(req.body,{w:1},function(err,ret){
                if(err==null){
                    res.json({success:true,new:ret});
                }else{
                    res.json({errors:err.message});
                }
            });
        }else {
            db.collection('teachers').update({_id: req.params.id}, {$set: req.body}, function (err, ret) {
                res.json({success: true});
            })
        }
    })
        .delete('/:id',function (req,res) {
            db.collection('teachers').remove({_id:req.params.id},function (err,ret) {
                if(err){
                    res.json({success:false,errors:err.message});
                }else{
                    res.json({success:true});
                }
            });
        });
    router.get('/excellence', function (req, res, next) {
        db.collection('article').findOne({key: 'excellence'}, function (err, data) {
            res.render('index/teacher-outstanding', {article: data});
        });
    });
}