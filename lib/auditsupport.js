/**
 * Created by lilixin on 16/5/9.
 */
var fs = require('fs');
var path = require('path');
var Utils =require('./utils');
var excloudeDb = ['','visitor','user','settings','livehost','videos','images','docs','category'];
var Engine = require('tingodb')();
var map = {};
var audioMapPath = path.resolve(__dirname,'../audit.map');
if(fs.existsSync(audioMapPath)){
    map = JSON.parse(fs.readFileSync(audioMapPath));
}
var getRouteName = function(req){
    var parts = req.path.split('/');
    return parts[1]||'index';
}
var syncMap = function () {
    fs.writeFileSync(audioMapPath,JSON.stringify(map));
};
var recordModify = function (routePath,db) {
    if(/_$/.test(db)){
        db=db.substr(0,db.length-1);
    }
    if(!map[routePath]) map[routePath] = [];
    if(map[routePath].indexOf(db)<0){
        map[routePath].push(db);
    }
    syncMap();
}
module.exports = function(app){
    var db= app.get('db');
    var oldFn = db.collection;
    return function (req,res,next){
        var routeName = getRouteName(req);
        if(req.query.audit==1){
            if(req.session && req.session.user && (req.session.user.role==0||req.session.user.role==1)) {
           // res.json(map[routeName]);
            var dbs = map[routeName];
            if(dbs){
                delete map[routeName];
                dbs.forEach(function (dbName) {
                    var  dbPath = path.resolve('./public/data',dbName);
                    if(fs.existsSync(dbPath+'_old')){
                        fs.unlinkSync(dbPath+'_old');
                    }
                    /*
                    db.collection(dbName).rename(dbName+'_old',function () {
                        db.collection(dbName+'_').rename(dbName);
                        res.json({success:true});
                    });
                    */
                    fs.renameSync(dbPath,dbPath+'_old');
                    //db.collection(dbName+'_').rename(dbName);
                    //db.rename(dbName+'_',dbName);
                   fs.renameSync(dbPath+'_',dbPath);
                    fs.unlinkSync(dbPath+'_old');
                    
                    //Utils.copyFileSync(path.resolve('./public/data',dbName+'_'))
                });

                var emptys = [];
                    dbs.forEach(function (dbName) {
                    for(var s in map){

                        var index = map[s].indexOf(dbName);
                        if(index>-1){
                            map[s].splice(index,1);
                        }
                        if(map[s].length==0) emptys.push(s);
                    }
                });
                emptys.forEach(function (s) {
                   delete map[s];
                });

            }

            //copy file db file
            syncMap();
            db.close(function () {
                app.set('db',new Engine.Db('./public/data', {}));
                res.json('success');
            });

            return;
            }
        }
        var oldRender = res.render;
        res.render = function () {

                var auditRoutes = [];
                var auditUrl = null;
                for(var s in map){
                    auditRoutes.push(s);
                    console.log(s+'|'+routeName);
                    if(routeName==s) res.locals['audit_url'] = '/'+routeName+'?audit=1';
                }
                res.locals['audit_list'] = auditRoutes;

            oldRender.apply(res,Array.prototype.slice.call(arguments,0));
            console.log('render:'+JSON.stringify(res.locals));
        };
       
        db.collection = function () {
            var params = Array.prototype.slice.call(arguments,0);
            if(excloudeDb.indexOf(params[0])>0){
                return oldFn.apply(this,params);
            }
            console.log('request path:'+req.routePath+',db:'+params[0]);
            if(req.session && req.session.user&&(req.session.user.edit||req.session.user.audit)) {
                if (!/_$/.test(params[0]) && fs.existsSync(path.resolve('./public/data', params[0]) + '_')) {
                    params[0] = params[0] + '_';
                }
            }
            var collect =  oldFn.apply(this,params);
            var modifMethod = {};
            ['remove','insert','save','update'].forEach(function (fn) {
                modifMethod[fn] = collect[fn];
                collect[fn] = function () {
                    recordModify(routeName,collect.collectionName);
                    var args = Array.prototype.slice.call(arguments,0);
                    if(!/_$/.test(collect.collectionName)){
                        if (!fs.existsSync(path.resolve('./public/data', collect.collectionName) + '_')) {
                            Utils.copyFileSync(path.resolve('./public/data', collect.collectionName),path.resolve('./public/data', collect.collectionName)+'_');
                        }
                        return  modifMethod[fn].apply(db.collection(collect.collectionName+'_'),args);
                    }
                    return modifMethod[fn].apply(collect,args);
                };
            });
            return collect;
        };
        next();
    }
};
