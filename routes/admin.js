/**
 * Created by kinov on 2016/3/28.
 */

module.exports = function(router,app){
    var Path = require('path');
    var videoHandler = require('../lib/videoUploadHandler');
    var db=app.get('db');
    router.use(function (req,res,next) {
        if(req.path=='/login'){
            next();
            return;
        }
        if (!req.session.user) {
            req.session.error='请先登录';
            res.redirect('/admin/login');
        }else {
            req.session.cookie.maxAge = 7200000;
            req.session.cookie.expires = new Date(Date.now()+7200000);
            next();
        }
    });
    var pagesize=app.get('pagesize');
    router.get('/', function(req, res, next) {
        var statistics = app.get('statistics');
        var async = app.get('async');
        async.parallel({
            web_config:function(callback){
                db.collection('settings').findOne({key:"index_config"},function(err,ret){
                    callback(err,ret);
                })
            },
            todayList:function(callback){
                statistics.getTodayData(function(a){
                    callback(null,a);
                });
            },
            info:function(callback){
                statistics.getinfo(function(a){
                    callback(null,a);
                    console.log(a);
                });
            },

        },function(err,result){
            res.render('admin/index',result);
        });
    });
    router.get('/status', function(req, res, next) {

        var statistics = app.get('statistics');
        var async = app.get('async');
        async.parallel({

            dayVisitorsList:function(callback){
                statistics.getTodayVisitors(function(a){
                    callback(null,a);
                });
            },
            dayNewVisitorsList:function(callback){
                statistics.getDayNewVisitors(function(a){
                    callback(null,a);
                });
            },
        },function(err,result){
            res.render('admin/data-stats',result);
        });

    });
    router.get('/system', function(req, res, next) {
        var async = require('async');
        async.parallel({
            users:function(callback){
                db.collection('user').find({"name":{"$ne":"admin"}}).toArray(function(err,ret){
                    callback(err,ret);
                })
            },
            seo:function(callback){
                db.collection('settings').findOne({key:'seo'},function(err,ret){
                    callback(err,(ret||{}).content);
                });
            }


        },function(err,restult){
            res.render('admin/system-set',restult);
        });
    });

    //seo保存
    router.post('/system/seo',function(req,res){
        var collection=db.collection('settings');
        collection.findOne({key: 'seo'}, function (err, data) {

            if (err) {
                res.send('error:' + err);
            } else {
                if (!data) {
                    var data = {
                        key:'seo',
                        content:req.body
                    };

                    collection.insert(data, {w: 1}, function (err) {
                        if (err) {
                            res.send('error:' + err);
                        } else {
                            res.send('success');
                        }
                    });

                } else {
                    var data = {
                        key:'seo',
                        content:req.body
                    };
                    collection.update({key:'seo'}, data,function (err,data) {
                        if (err) {
                            res.send('error:' + err);
                        } else {
                            res.send('success');
                        }

                    });


                }
            }

        });

    })

    //用户删除
    router.get('/user/del/:uid',function(req,res){
        db.collection('user').remove({'_id':req.params.uid*1}, {safe:true}, function(error, count){
            if(error)console.log(error);
            console.log(count);
            res.send('success');
        })
    })
    //修改用户密码
    router.get('/user/rpw/:uid/:npw',function(req,res){

        db.collection('user').update({'_id':req.params.uid*1},{$set:{'pw':req.params.npw}},function(err){
            if(err)console.log(err);
            res.send('success');

        })
    })
    router.post('/system/user/addone',function(req,res){
        var collection=db.collection('user');
        collection.findOne({name:req.body.username},function(err,ret){
            if(err){
                res.json({success:false,err:err.message});
            }else{
                if(ret!=null){
                    res.json({success:false,err:'该用户已存在！'})
                }else{
                    var data={
                        'name':req.body.username,
                        'pw':req.body.pw,
                        'role':req.body.role,
                        'mail':null,
                        'pic':null,
                        'status':0
                    };
                    collection.insert(data,{w:1},function(err){
                        if(err){
                            console.log(err);
                        }else{
                            res.json({success:true})
                        }
                    })
                }
            }

        })

    })

    router.post('/system/user/addmore',function(req,res){
        var collection=db.collection('user');
        collection.findOne({name: req.body.user_prefix+'1'},function(err,ret) {
            if(err){
                res.json({success:false,err:err.message});
            }else {
                if (ret != null) {
                    res.json({success: false, err: '用户名已存在！'})
                } else {
                    var name = req.body.user_prefix,
                        num = req.body.user_num,
                        count = 0;

                    for (var i = 1; i <= num; i++) {
                        var data = {
                            'name': name + i,
                            'pw': name + i,
                            'role': req.body.role,
                            'mail': null,
                            'pic': null,
                            'status': 0
                        };
                        collection.insert(data, {w: 1}, function (err) {
                            count++;
                            if (err) {
                                console.log(err);
                            } else if (count >= num) {
                                res.send({success: true});
                            }
                        })
                    }
                }
            }
        })
    })
    router.post('/system/user/update',function(req,res){
        var collection=db.collection('user');
        collection.findOne({name:req.body.oname},function(err,ret){
            if(err)console.log(err);
            ret.name= req.body.name;
            ret.mail=req.body.mail;
            ret.icon=ret.icon_store;
            collection.update({name:req.body.oname},ret,function(error,data){
                if(error){
                    res.json({success:false,err:error.message})
                }else{
                    var user={
                        username: ret.name,
                        password: ret.pw,
                        role:ret.role,
                        status:ret.status,
                        mail:ret.mail,
                        icon:ret.icon
                    };
                    req.session.user = user;
                    res.json({success:true})
                }
            })
        })

    })

    router.post('/system/user/update_pw',function(req,res){

        var collection=db.collection('user');
        collection.findOne({name:req.session.user.username},function(err,ret){
            if(err)console.log(err);
            if(ret.pw != req.body.pwo){
                res.json({success:false,err:"输入的旧密码信息错误！"})
            }else{
                collection.update({name:req.session.user.username},{$set:{pw:req.body.pw}},function(error,data){
                    if(error){
                        res.json({success:false,err:error.message})
                    }else{
                        res.json({success:true})
                    }
                })
            }

        })

    })
    router.get('/cms', function(req, res, next) {
        res.render('admin/content-manage', { user: req.session.user });
    });
    router.get('/media', function(req, res) {
        var async = require('async');
        async.parallel({
            cats:function(callback){
                db.collection('category').find({}).toArray(function(err,ret){
                    callback(err,ret);
                });
            },
            images:function(callback){
                db.collection('images').find({"category":"1"}).limit(pagesize).sort( { "_id": -1 } ).toArray(function(err,ret){
                    callback(err,ret);
                });
            },
            videos:function(callback){
                db.collection('videos').find({"category": "1"}).sort( {"_id": -1 }).limit(20).toArray(function(err,ret){
                    callback(err,ret);
                });
            },
            docs:function(callback){
                db.collection('docs').find({"category": "1"}).sort( {"_id": -1 }).limit(20).toArray(function(err,ret){
                    callback(err,ret);
                });
            },
            livehost:function(callback){
                db.collection('livehost').findOne({},function(err,ret){
                    callback(err,ret);
                });
            },
            user:function(callback){
                callback(null,req.session.user);
            }


        },function(err,restult){
            res.render('admin/media',restult);
        });
    });
    router.get('/sources/:tid/:cid',function(req,res){
        var dbName;
        switch ( req.params.tid*1){
            case 1:
                dbName='images';
                break;
            case 2:
                dbName='videos';
                break;
            default:
                dbName='docs';
        }
        db.collection(dbName).find({category:{$regex:req.params.cid}}).sort( {"_id": -1 }).limit(20).toArray(function(err,ret){
            if(err)console.log(err);
            if(ret.length>0){res.json(ret);}
            else{res.send('empty');}
        });
    });
    router.get('/calendar', function(req, res, next) {
        res.render('admin/calendar', { user: req.session.user });
    });
    router.post('/upload/:type', function(req, res) {
        var F_SHOT=require('../lib/ffmpeg-util-screenshot.js'),
            ffmpeg=require('fluent-ffmpeg'),
            formidable = require('formidable'),
            fs = require('fs'),
            AVATAR_UPLOAD_IMG = '/uploads/images/',
            AVATAR_UPLOAD_VIDEO = '/uploads/videos/',
            AVATAR_UPLOAD_DOCS = '/uploads/docs/';
        var newPath,picPath,fileData,duration,formData,list=[];
        var form = new formidable.IncomingForm();   //创建上传表单
        form.encoding = 'utf-8';		//设置编辑
        if(req.params.type=='images'){
            form.uploadDir = 'public' + AVATAR_UPLOAD_IMG;	 //设置上传目录
        }else if(req.params.type=='videos'){
            form.uploadDir = 'public' + AVATAR_UPLOAD_VIDEO;
        }else if(req.params.type=='docs'){
            form.uploadDir = 'public' + AVATAR_UPLOAD_DOCS;
        }
        form.keepExtensions = true;	 //保留后缀
        form.maxFieldsSize = 1024  * 1024;//文件大小
        // form.maxFields = 2;
        form.parse(req, function(err, fields, files) {
                formData=fields;
                if (err) {
                    res.locals.error = err;
                    console.log(err);
                    res.send(err);
                    return;
                }
                newPath = form.uploadDir + files.Filedata.name;
                fileData=files.Filedata;
            })
            .on('progress', function (bytesReceived, bytesExpected) {
                //在这里判断接受到数据是否超过最大，超过截断接受流
                //console.log(bytesReceived);
                //console.log(bytesExpected);
                //if(bytesReceived>form.maxFieldsSize){
                //  console.log('数据过大');
                //}
                // console.log(percent);
            })
            .on('end', function() {
                if(req.params.type=='videos'){
                    videoHandler(AVATAR_UPLOAD_VIDEO,'public'+AVATAR_UPLOAD_IMG,db,fileData,formData.dir,function (err,success) {
                        //res.json({success:success});
                        res.send('success');
                    });

                }else if(req.params.type=='images'){
                    var collection=db.collection('images');

                    ffmpeg(fileData.path)
                        .ffprobe(function(err, data) {
                            if (err) throw err;
                            var data={'name':Path.basename(fileData.name,Path.extname(fileData.name)),'url':fileData.path.substring(6).split('\\').join('/'),'category':formData.dir,size:data.streams[0].width+" * "+data.streams[0].height};
                            collection.insert(data,{w:1},function(err){
                                if(err){
                                    console.log('error:'+err);
                                }else{
                                    console.log('image upload successfully!');
                                    res.send('success');
                                }
                            });

                        })
                }else if(req.params.type=='docs'){
                    var collection=db.collection('docs');
                    var str = Path.extname(fileData.name).toLowerCase();
                    var type=str.substring(1);
                    var data={'name':Path.basename(fileData.name,Path.extname(fileData.name)),'url':fileData.path.substring(6).split('\\').join('/'),'category':formData.dir,'type':type};
                    collection.insert(data,{w:1},function(err){
                        if(err){
                            console.log('error:'+err);
                        }else{
                            console.log('docs upload successfully!');
                            res.send('success');
                        }
                    });
                }
            });
    });

//视频剪辑
    router.post('/cut', function(req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "origin, content-type, accept, authorization");
        res.setHeader("Access-Control-Allow-Credentials", "true");
        var goalDirPath = 'public/uploads/videos/';
        var input='public'+req.body.source;
        var jschars = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
        var str=generateMixed(32);
        var output=goalDirPath+'cut_'+str+'.mp4';
        var picoutput='public/uploads/images/'+'cut_'+str+'.jpg'
        var F_CUT=require('../lib/ffmpeg-util-cut.js');
        function generateMixed(n) {
            var res = "";
            for(var i = 0; i < n ; i ++) {
                var id = Math.ceil(Math.random()*35);
                res += jschars[id];
            }
            return res;
        }
        F_CUT().cut(input,output,req.body.sTime,req.body.dTime,picoutput,function(c){
            var collection=db.collection('videos');
            var list=[];
            var dir=req.body.cid?req.body.cid:'1';
            var data={'name':Path.basename(req.body.name,Path.extname(req.body.name)),'dir':'/uploads/videos/cut_'+str+'.mp4','dur':req.body.dTime,'pic':picoutput.substr(6),'category':dir,'status':1};
            collection.insert(data,{w:1},function(err){
                if(err){
                    console.log('error:'+err);
                }else{
                    console.log('cuttask successfully!');
                    res.send('success');
                }
            });
        });
    })
    //删除文件
    router.get('/media/delete/:type/:id',function(req, res) {
        var dbName;
        switch (req.params.type*1){
            case 1:
                dbName = 'images';
                break;
            case 2:
                dbName = 'videos';
                break;
            case 3:
                dbName = 'docs';
        }
        db.collection(dbName).remove({'_id':req.params.id*1}, {safe:true}, function(error, count){
            if(error)console.log(error);
            console.log(count);
            res.send('success');
        })
    })

    //文件重命名
    router.get('/media/rename/:type/:id/:nName',function(req, res) {
        // console.log(req.params.oName);

        switch (req.params.type*1){
            case 1:
                dbName = 'images';
                break;
            case 2:
                dbName = 'videos';
                break;
            case 3:
                dbName = 'docs';
                break;
        }
        var collection=db.collection(dbName);
        collection.findOne({name:req.params.nName},function(err,ret){
            if(err){
                res.json({success:false,err:err.message})
            }else{
                if(ret==null){
                    collection.update({'_id':req.params.id},{$set:{'name':req.params.nName}},function(err){
                        if(err)console.log(err);
                        res.json({success:true});
                    })
                }else{
                    res.json({success:false,err:'存在重命名文件!'})
                }
            }
        })


    })

    //登录验证
    router.route('/login')
        .get(function(req, res) {
            req.session.cookie.maxAge = 7200000;
            req.session.cookie.expires = new Date(Date.now()+7200000);
            res.render('admin/login', { title: '用户登录' });
        })
        .post(function(req, res) {
            var uname=req.body.username;
            //    console.log(name);
            db.collection('user').findOne({name:uname},function(err,data){
                if(err) {
                    console.log(err);
                }else if(data==null){
                    res.send('false');
                }else{
                    var user={
                        username: data.name,
                        role:data.role,
                        status:data.status,
                        icon:data.icon
                    }
                    console.log(user);
                    if(req.body.username === data.name && req.body.password === data.pw && data.status==1){
                        req.session.user = user;
                        res.send('success');
                    }else {
                        res.send('false');
                    }
                }
            })



        });

    //退出登录
    router.get('/logout',function(req,res){
        delete req.session.user;
        if(!req.session.user)res.send('success');
    })
    //目录操作
    router.post('/dir/add',function(req, res) {
        var collection=db.collection('category');
        collection.findOne({tId:parseInt(req.body.tId)},function(err,data){
            var r={id:data.last_cid+1,name:req.body.name};
            data.child.push(r);
            collection.update({tId:parseInt(req.body.tId)},{$set:{child:data.child,last_cid:data.last_cid+1}},function(err){
                if(!err){
                    console.log('add dir!');
                    res.json({cid: r.id});
                }
            })
        })
    });
    //删除目录
    router.get('/dir/delete/:tId/:cId',function(req, res) {
        var collection=db.collection('category');
        collection.findOne({tId:parseInt(req.params.tId)},function(err,data){
            data.child.forEach(function(e,i){
                if(e.id==req.params.cId){
                    data.child.splice(i,1);
                    return;
                }
            })
            collection.update({tId:parseInt(req.params.tId)},data,function(err,ret){
                if(err){
                    res.json({success:false,err:err.message})
                }else{
                    res.json({success:true})
                }
            })
        })
    })
    router.get('/edit/:mode',function (req,res) {
        if(req.params.mode=='1'){
            req.session.user.edit = false;
            req.session.user.audit = true;
        }else if(req.params.mode=='0'){
            req.session.user.edit = true;
            req.session.user.audit = true;
        }else if(req.params.mode=='2'){
            req.session.user.edit = true;
            req.session.user.audit = false;
        }else if(req.params.mode=='logoutEdit'){
            req.session.user.audit = false;
            req.session.user.edit = false;
            res.redirect('/admin/cms');
        }
        res.redirect('/');
    });
    router.get('/user/allow/:uid',function(req,res){
        db.collection('user').update({_id:req.params.uid},{$set:{status:1}},function (err,ret) {
            if(err){
                res.json({success:false})
            }else{
                res.json({success:true})
            }
        })
    })
    router.get('/user/forbid/:uid',function(req,res){
        db.collection('user').update({_id:req.params.uid},{$set:{status:0}},function (err,ret) {
            if(err){
                res.json({success:false})
            }else{
                res.json({success:true})
            }
        })
    })
    //设置网站状态
    router.get('/webstatus-set/:status',function(req,res){

        var collection=db.collection('settings');
        collection.update({key:'index_config'},{$set:{value:{webstatus:req.params.status*1}}},function (error,result) {
            if(error){
                res.json({success:false,err:err.message})
            }else{

                res.json({success:true})
            }
        })
    })
    //文件下载
    router.get('/download/',function(req,res){
        var fs = require('fs');
        var path=require('path');
        var stream = fs.createReadStream('public'+req.query.path);
        res.writeHead(200, {
            'Content-Type': 'application/force-download',
            'Content-Disposition': 'attachment; filename='+path.basename(req.query.path)
        });
        stream.pipe(res);
    })
    //用户头像上传
    router.post('/icon/', function(req, res) {
        var  formidable = require('formidable'),
            fs = require('fs');
        var newPath,picPath,fileData,duration,formData,list=[];
        var form = new formidable.IncomingForm();   //创建上传表单
        form.encoding = 'utf-8';		//设置编辑
        form.uploadDir = 'public/uploads/images' ;
        form.keepExtensions = true;	 //保留后缀
        form.maxFieldsSize = 1024  * 1024;//文件大小
        // form.maxFields = 2;
        form.parse(req, function(err, fields, files) {
                if (err) {
                    res.locals.error = err;
                    res.send(err);
                    return;
                }
                newPath = form.uploadDir + files.Filedata.name;
                fileData=files.Filedata;

            })
            .on('progress', function (bytesReceived, bytesExpected) {

            })
            .on('end', function() {

                var url=fileData.path.substring(6).split('\\').join('/');
                db.collection('user').update({name:req.session.user.username},{$set:{icon_store:url}},function(err,ret){
                    if(err)res.json({success:false,err:err.message})
                    else res.json({success:true,url:url})
                })
            })

    })

    router.post('/livehost/', function(req, res) {
        var collection=db.collection('livehost');
        collection.findOne({},function(err,ret){
            if(err){
                res.json({success:false,err:err.message});
            }else{
                if(ret!=null){
                    collection.update({},{host:req.body.host, accessid:req.body.accessid,port:req.body.port},function(err,ret){
                        if(err)res.json({success:false,err:err.message})
                        else res.json({success:true})
                    })
                }else{
                    var data={
                        'host':req.body.host,
                        'accessid':req.body.accessid,

                    };
                    collection.insert(data,{w:1},function(err){
                        if(err){
                            console.log(err);
                        }else{
                            res.json({success:true})
                        }
                    })
                }
            }

        })
    })

}