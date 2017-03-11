/**
 * Created by kinov on 2016/3/28.
 */
module.exports = function(router,app){
    /***********paki************/

    /* GET home page. */
    router.get('/', function(req, res) {
        res.render('index/upload', { title: TITLE });
    });

    router.post('/:type', function(req, res) {
        console.log(req.body);
        var newPath,picPath,fileData,duration,formData,list=[];
        var form = new formidable.IncomingForm();   //创建上传表单
        form.encoding = 'utf-8';		//设置编辑
        if(req.params.type=='images'){
            form.uploadDir = 'public' + AVATAR_UPLOAD_IMG;	 //设置上传目录
        }else{
            form.uploadDir = 'public' + AVATAR_UPLOAD_VIDEO;
        }
        form.keepExtensions = true;	 //保留后缀
        form.maxFieldsSize = 10  * 1024;//文件大小
        // form.maxFields = 2;
        form.parse(req, function(err, fields, files) {
                formData=fields;
                console.log(formData);
                if (err) {
                    res.locals.error = err;
                    console.log(err);
                    res.send(err);
                    return;
                }


                // var avatarName = Math.random() + '.mp4' ;
                newPath = form.uploadDir + files.Filedata.name;
                fileData=files.Filedata;

                // console.log(fileData);

                //console.log(files.Filedata.path);
                fs.renameSync(files.Filedata.path, newPath);  //重命名
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
                res.send('success');
                //var picName='.tb_'+req.params.name+'.jpg';


                if(req.params.type=='videos'){
                    /*********获取时长信息*************/
                    ffmpeg(newPath)
                        .ffprobe(function(err, data) {
                            if (err) throw err;
                            console.log('************************************************');
                            // console.log(data);
                            duration=Math.round(data.streams[0].duration);

                        })

                    /*********获取时长信息*************/

                    picPath = 'public' + AVATAR_UPLOAD_IMG + fileData.name.slice(0,-3)+'jpg';
                    if(fileData.name.indexOf('.mp4')<0){

                        var FFMPEG = require('../node_modules/ffmpeg/ffmpeg-util');
                        var ffmpegPath = 'ffmpeg';
                        var ffmpegParams = {};
                        ffmpegParams.input = newPath; //文件地址，必填
                        ffmpegParams.output = newPath.slice(0,-3)+'mp4'; //转码后文件地址，必填
                        ffmpegParams.vb = '800k'; //视频码率
                        ffmpegParams.channels = 1; //音轨通道数
                        ffmpegParams.size = '480x320'; //视频尺寸
                        ffmpegParams.ab = '64k'; //音频码率
                        ffmpegParams.fps = 10; //视频帧率
                        ffmpegParams.freq = '22050'; //音频采样率

                        console.log(ffmpegParams);
                        var executor = new FFMPEG();
                        executor.execute(ffmpegPath,ffmpegParams,function(err,data){
                            if(err){
                                console.log(err);
                            }
                            if(data){
                                console.log(data);
                                newPath=ffmpegParams.output;
                                ffmpeg(ffmpegParams.output)
                                    .videoCodec('mjpeg')
                                    .noAudio()
                                    .outputOptions(['-ss','0.001','-vframes','1','-s','340*340'])
                                    .on('error',function(err){
                                        console.log(err.message);
                                        //res.send(err);
                                    })
                                    .on('end', function() {
                                        // console.log('112');
                                        var collection=db.collection('media_vedios');
                                        var data={'name':fileData.name.slice(0,-3)+'mp4','dir':'/uploads/vedios/','dur':duration,'pic':AVATAR_UPLOAD_IMG + fileData.name.slice(0,-3)+'jpg'};
                                        collection.insert(data,{w:1},function(err){
                                            if(err){
                                                console.log('error:'+err);
                                            }else{
                                                console.log('vedio upload successfully!');
                                            }
                                        });
                                        //collection.findOne({},function(err,data){
                                        //  data['videos'].push({'name':fileData.name.slice(0,-3)+'mp4','dir':'/uploads/vedios/','dur':duration,'pic':AVATAR_UPLOAD_IMG + fileData.name.slice(0,-3)+'jpg'});
                                        //  console.log(data);
                                        //  collection.update({},{$set:{videos:data['videos']}},function(err){
                                        //    if(!err){
                                        //      collection.findOne({},function(err,info){
                                        //        res.send(info);
                                        //      })
                                        //
                                        //    }
                                        //  })
                                        //})
                                    }).save(picPath);
                            }
                        });


                    }else{
                        ffmpeg(newPath)
                            .videoCodec('mjpeg')
                            .noAudio()
                            .outputOptions(['-ss','0.001','-vframes','1','-s','340*340'])
                            .on('error',function(err){
                                console.log(err.message);
                                // res.send(err);
                            })
                            .on('end', function() {
                                var collection=db.collection('media_vedios');
                                var data={'name':fileData.name.slice(0,-3)+'mp4','dir':'/uploads/vedios/','dur':duration,'pic':AVATAR_UPLOAD_IMG + fileData.name.slice(0,-3)+'jpg'};
                                collection.insert(data,{w:1},function(err){
                                    if(err){
                                        console.log('error:'+err);
                                    }else{
                                        console.log('vedio upload successfully!');
                                    }
                                });
                                //console.log('112');
                                //var collection=db.collection('media_data');
                                //
                                //collection.findOne({},function(err,data){
                                //  data['videos'].push({'name':fileData.name,'dir':'/uploads/vedios/','dur':duration,'pic':AVATAR_UPLOAD_IMG + fileData.name.slice(0,-3)+'jpg'});
                                //  console.log(data);
                                //  collection.update({},{$set:{videos:data['videos']}},function(err){
                                //    if(!err){
                                //      collection.findOne({},function(err,info){
                                //        res.send(info);
                                //      })
                                //
                                //    }
                                //  })
                                //})
                            }).save(picPath);
                    }

                }else if(req.params.type=='images'){
                    var collection=db.collection('media_images');
                    list.push(formData.dir);
                    var data={'name':fileData.name,'url':'/uploads/images/'+fileData.name,'dir':list};
                    collection.insert(data,{w:1},function(err){
                        if(err){
                            console.log('error:'+err);
                        }else{
                            console.log('image upload successfully!');
                        }
                    });
                }
            });
        /*
         var data=
         {"files": [

         {
         "picture1.jpg": true
         },
         {
         "name": "picture1.jpg",
         "size": 902604,
         "url": "http:\/\/example.org\/files\/picture1.jpg",
         "thumbnailUrl": "http:\/\/example.org\/files\/thumbnail\/picture1.jpg",
         "deleteUrl": "http:\/\/example.org\/files\/picture1.jpg",
         "deleteType": "DELETE"
         },
         {
         "name": "picture2.jpg",
         "size": 841946,
         "error": "Filetype not allowed"
         }
         ]};
         */


    });

}