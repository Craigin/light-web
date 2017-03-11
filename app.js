var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
//var Engine = require('tingodb')();
//var mongo=require('mongodb');
//var server = new mongo.Server('localhost', '27017', {auto_reconnect: true});
//var db = new mongo.Db('data', server, {safe: true});
//db.open(function (err) {
//    if (err) {
//        console.log(err);
//    }
//    else {
//        console.log('mongodb has opened');
//
//    }
//
//});

var Engine = require('tingodb')({cacheMaxObjSize:1024*1024,cacheSize:1024*1024});
var fs = require('fs');
var session = require('express-session');
var app = express();
var db = new Engine.Db('./public/data', {});
var generateMixed=function(n) {
    var jschars = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
    var res = "";
    for(var i = 0; i < n ; i ++) {
        var id = Math.ceil(Math.random()*35);
        res += jschars[id];
    }
    return res;
}
app.set('db',db);
//app.set('mdb',mdb);
var pagesize=35;
app.set('pagesize',pagesize);
app.set('async',require('async'));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('statistics',require('./lib/statistics.js')(app))
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.set('port', process.env.PORT || 80);
var server = app.listen(app.get('port'), function() {
    console.log(server.address().port);
});
server.setTimeout(1000*60*20);
server.on('timeout', function(){
    console.log('超时了');
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    cookie: { maxAge: 7200000,expires: new Date(Date.now() + 7200000)  },
    rolling:true,
    secret:"test",
    resave:true,
    saveUninitialized:true
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'static')));
app.use(express.static(path.join(__dirname, 'views')));
var settings = require('./lib/settings.js')(app);
app.use(function(req,res,next){

    settings.getSettings('site_config',function (err,ret) {
        
        if(ret!=null) {
            res.locals = {site_config:ret.value};
        }else{
            res.locals = {site_config:{}};
        }
       res.locals['user'] = req.session.user||{};
       res.locals['moment'] = require('moment'); 
        
       // res.send(res.locals);
       next();
    });
});

var statistics = require('./lib/statistics.js')(app);
app.use(function(req,res,next){
   //var data = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
  //  console.log('========================================');
   // console.log(req.headers);
   //  console.log('8888888888888888888888888888888888888');
   //  console.log(req);
   // var arr=data.split(':');
    //var uIp=arr[arr.length-1];
   // console.log(uIp);
    var date=new Date();
    var expireDays=365,Cookies={};
    //将date设置为10天以后的时间
    date.setTime((Math.floor(date.getTime()/86400000)+1)*86400000-8*3600000-1);
    req.headers.cookie && req.headers.cookie.split(';').forEach(function( Cookie ) {
        var parts = Cookie.split('=');
        Cookies[ parts[ 0 ].trim() ] = ( parts[ 1 ] || '' ).trim();
    });
    if(!Cookies.userId){
        var uid=generateMixed(32);
        statistics.settings(true,uid);
        res.setHeader("Set-Cookie", ['userId='+uid+'; Expires='+date.toGMTString()]+';path=/');
    }else{
        var uid=Cookies.userId;
        statistics.settings(false,uid);
    }

    //res.setHeader('Expires',date.toGMTString());

  //  statistics.getWeekVisitors();
    //statistics.getinfo();
   // console.log('========================================');

    next();

})

app.use(require('./lib/auditsupport')(app));
fs.readdirSync(path.join(__dirname,'routes')).forEach(function(file,i){
     if(/\.js$/.test(file)){
        var router = express.Router();
        var path =  file.substring(0,file.length-3);
         require('./routes/'+path)(router,app);
       app.use('/'+((path=='index')?'':path),router);
     }
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
