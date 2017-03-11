/**
 * Created by kinov on 2016/3/28.
 */
module.exports = function(router,app){
    var db = app.get('db');
    router.get('/', function (req, res, next) {
        db.collection('page_data').findOne({page: 'index'}, function (err, data) {
            res.render('index/maker', {data: data.data});
        });
    });
    router.get('/production', function (req, res, next) {
        db.collection('page_data').findOne({page: 'index'}, function (err, data) {
            res.render('index/maker-production', {data: data.data});
        });
    });
    router.get('/video/:videoid', function (req, res, next) {
        db.collection('maker').findOne({_id:req.params.videoid},function(err,ret){
            res.render('index/maker-video', {maker: ret});
        });
    });
}