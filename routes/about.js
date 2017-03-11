/**
 * Created by kinov on 2016/3/28.
 */
module.exports=function(router,app){
    var db=app.get('db');
    router.get('/leaders', function(req, res, next) {
        db.collection('article').findOne({key:'current'},function(err,article) {
            // data.data['article']="<p style=\"font-size: 16px; font-family: \"Microsoft Yahei\">";
            res.render('index/aboutSC-current', {article:article});
        })
    });
    router.get('/history', function(req, res, next) {
        db.collection('article').findOne({key:'history'},function(err,article) {
            // data.data['article']="<p style=\"font-size: 16px; font-family: \"Microsoft Yahei\">";
            res.render('index/aboutSC-history', {article:article});
        })
    });
    router.get('/past-leaders', function(req, res, next) {
        db.collection('article').findOne({key:'pastleader'},function(err,article) {
            // data.data['article']="<p style=\"font-size: 16px; font-family: \"Microsoft Yahei\">";
            res.render('index/aboutSC-pastleaders', {article:article});
        });
    });
    router.get('/president', function(req, res, next) {

        db.collection('article').findOne({key:'president'},function(err,article) {
            //  res.json(article);
            //data.data['article']="<p style=\"font-size: 16px; font-family: \"Microsoft Yahei\">";
            res.render('index/aboutSC-president', {article:article});
        })
    })

}