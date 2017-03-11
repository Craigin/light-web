var formidable = require('formidable'),
    fs = require('fs'),
    TITLE = 'formidable上传示例',
    AVATAR_UPLOAD_IMG = '/uploads/images/',
    AVATAR_UPLOAD_VIDEO = '/uploads/videos/';

module.exports=function(router,app) {
  /* GET home page. */
  var db = app.get('db');
  var settings = require('../lib/settings')(app);
  router.get('/', function (req, res, next) {
    var async = require('async');
    async.parallel({
      activities:function(callback){
        db.collection('activity').find({},{limit:4}).sort({event_time:-1}).toArray(function(err,ret){
            callback(err,ret);
        });
      },
      news:function(callback){
        db.collection('news').find({},{limit:6}).toArray(function(err,ret){
          callback(err,ret);
        });
      },
      notices:function(callback){
        db.collection('notices').find({},{limit:10}).sort({time:-1}).toArray(function(err,ret){
          callback(err,ret);
        });
      },
      links:function(callback){
        db.collection('slide').findOne({key:'links'},function(err,ret){
          callback(err,ret.content);
        });
      },
      slides:function(callback){
        db.collection('slide').findOne({key:'index'},function(err,ret){
          callback(err,ret.content);
        });
      },
      index_config:function (callback) {
            settings.getSettings('index_config',function (err,ret) {
                callback(err,((ret||{}).value)||{});
            });
      }
    },function(err,restult){
      if(restult.index_config.webstatus==1){
     res.render('index/index', restult);
      }else{
        res.render('index/warning', restult);
      }
    });

  });

  /* GET home page. */


  router.get('/notice/:noticeid', function (req, res, next) {
    db.collection('notices').findOne({_id:req.params.noticeid}, function (err, article) {
      res.render('index/notice', {article:article});
    });
  });
  router.put('/notice/:noticeid', function (req, res, next) {
     db.collection('notices').update({_id:req.params.noticeid},{$set:req.body},function(err,ret){
         res.json({success:true});
     });
  });


  router.get('/faculty', function (req, res, next) {
    db.collection('article').findOne({key:'faculty'},function(err,article) {
      // data.data['article']="<p style=\"font-size: 16px; font-family: \"Microsoft Yahei\">";
      res.render('index/faculty-setting', {article:article});
    })
  });
  router.get('/gallery-album', function (req, res, next) {
    db.collection('page_data').findOne({page: 'index'}, function (err, data) {
      res.render('index/gallery-album', {data: data.data});
    });
  });
  router.get('/admin/calendar', function (req, res, next) {
    res.render('admin/calendar', {title: '视智云后台管理系统'});
  });
  router.get('/admin/help', function (req, res, next) {
    res.render('admin/help', {title: '使用帮助'});
  });
  router.put('/data/:page/:block', function (req, res) {
    var collection = db.collection('page_data');
    collection.findOne({page: req.params.page}, function (err, data) {

      if (err) {
        res.send('error:' + err);
      } else {
        if (!data) {
          var data = {};
          data[req.params.block] = req.body;
          var r = {page: req.params.page, data: data};
          collection.insert(r, {w: 1}, function (err) {
            if (err) {
              res.send('error:' + err);
            } else {
              res.send('update success');
            }
          });

        } else {
          data['data'][req.params.block] = req.body;
          //collection.save(data);
          collection.update({page: req.params.page}, {$set: {data: data['data']}});
          collection.findOne({page: req.params.page}, function (err, data) {
            res.send(JSON.stringify(data));
          });
        }
      }
    });
  });
}