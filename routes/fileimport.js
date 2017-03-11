/**
 * Created by paki on 2016/6/24.
 */
module.exports=function(router,app){
    var downloader = require('../lib/httpdownload.js')(app);
    var F_SHOT = require('../lib/ffmpeg-util-screenshot.js');
    var request = require('request');
    var db = app.get('db');
    var path = require('path');
    var fs = require('fs');
    router.get('/',function(req,res){
        F_SHOT().screenshot('public\\fileimport\\HFRGHAI6RU4X27IUQTQMER5MYF2ZTI17.MP4','public/fileimport/imgs/15SBQV3731XNYV1H3QMDBFSWCOQ3WFVJ.jpg',function(err,d) {
            if(err)console.log(err);
        })
    })
    router.post('/import',function(req,res){
        var data=JSON.parse(req.body.data);
        var tasklist=data.files;
        for(var i=0;i<tasklist.length;i++){
            var name=path.basename(tasklist[i],path.extname(tasklist[i]));
            downloader.download('http://'+data.host+'/'+encodeURIComponent(tasklist[i]),function(videopath){
                console.log('videopath:'+videopath);
                console.log('name:'+tasklist[i]);
                var picPath='public/fileimport/imgs/'+path.basename(videopath,path.extname(videopath))+'.jpg';
                var ret={'name':name,'origin':videopath,'dir':'/fileimport/videos/'+path.basename(videopath),
                    'pic':picPath.substr(6),'category':data.cid,'status':1};
                videopath=videopath.split('\\').join('/');
                if( fs.existsSync(videopath) ) {
                    F_SHOT().screenshot(videopath, picPath, function (err, d) {
                        ret['dur'] = d;
                        db.collection('videos').insert(ret, {w: 1}, function (err, ret) {
                            if (err) {
                                console.log('error:' + err);
                            } else {
                                console.log('-----------------download-------------------------');
                                console.log('success!');
                                res.json({success: true});
                            }
                        });

                    })
                }else{
                    console.log('video not found');
                }
            })
        }
    })
    router.post('/list',function(req,res){
        request.post(
            {
                url:'http://'+req.body.host+'/login',
                form:{
                    user:req.body.user,
                    pass:req.body.pass
                },
                encoding:'utf8'
            },
            function(error, response, body){
                if(typeof response!='undefined') {
                    if (response.statusCode == 200) {

                        var data = JSON.parse(body);
                        if (data.result) {
                            request.post(
                                {
                                    url: 'http://' + req.body.host + '/lubo/list.lua',
                                    form: {
                                        session: data.session
                                    },
                                    encoding: 'utf8'
                                },
                                function (error, resp, result) {
                                    if (resp.statusCode == 200) {
                                        var ret = JSON.parse(result);
                                        if (ret.result) {
                                            var files = ret.files;
                                            for (var val in files) {
                                                ret.files[val]['pic'] = 'http://' + req.body.host + '/cut/photo/?path=' + ret.files[val].fullname;
                                            }
                                            res.json({
                                                success: true,
                                                files: files,
                                                host: req.body.host,
                                                session: data.session
                                            });
                                        } else {
                                            res.json({success: false});
                                        }
                                    } else {
                                        res.json({success: false});
                                    }
                                })
                        } else {
                            res.json({success: false});
                        }
                    } else {
                        console.log(response.statusCode);
                    }
                }else{
                    res.json({success: false});
                }
            }
        );



    })
}
