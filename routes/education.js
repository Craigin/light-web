/**
 * Created by kinov on 2016/3/28.
 */
module.exports=function(router,app){
    var db=app.get('db');
    router.get('/', function (req, res, next) {
        db.collection('article').findOne({key: 'education'}, function (err, data) {
            res.render('index/edu-regular', {article: data});
        });
    });
    router.get('/graduate', function (req, res, next) {
        db.collection('article').findOne({key: 'graduate'}, function (err, data) {
            res.render('index/edu-graduate', {article: data});
        });
    });

}