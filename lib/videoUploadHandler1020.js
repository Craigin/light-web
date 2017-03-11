/**
 * Created by lilixin on 16/4/13.
 */
var FFMPEG =require('./ffmpeg-util.js');
var F_SHOT = require('./ffmpeg-util-screenshot.js');
var path = require('path');
module.exports = function (videoRoot,imageRoot,db,fileData,category,callback) {
   var picPath = imageRoot + fileData.name.substring(0,fileData.name.lastIndexOf('.'))+'.jpg';
    var collection=db.collection('videos');
    var executor = new FFMPEG();
    function transcode(inputPath,outputPath,insertId){
        executor.execute(inputPath, outputPath, function (err, ret) {
            if (ret == 'complete') {
                var status = err ? -1 : 1;
                F_SHOT().screenshot(outputPath,picPath,function(err,d) {
                    data['dur'] = d;
                    collection.update({'_id': insertId}, {$set: {status: status,dur:d}}, function (err, ret) {
                        collection.findOne({status: 0, type: 'transcoding'}, function (err, ret) {
                            if (err)console.log(err);

                            if (ret) {
                                insertId = ret._id;
                                console.log('next task');
                                transcode(ret.origin, 'public' + ret.dir, ret._id)
                            }
                        })
                    });

                })
            }
        });

    }

    //console.log(fileData.name);

    var data={'name':path.basename(fileData.name,path.extname(fileData.name)),'origin':fileData.path,'dir':'/uploads/videos/'+path.basename(fileData.path,path.extname(fileData.path))+'.mp4',
        'pic':picPath.substr(6),'category':category,'status':0};
    var collection = db.collection('videos');
   // console.log(fileData.path+','+picPath);
   //  F_SHOT().screenshot(fileData.path,picPath,function(err,d){
   //      data['dur']=d;
        var insertId;
        if(path.extname(fileData.path).toLowerCase()!='.mp4'){
            data['type'] = 'transcoding';

                    var inputPath = fileData.path; //文件地址，必填
                    var outputPath = fileData.path.substring(0, fileData.path.lastIndexOf('.')) + '.mp4'; //转码后文件地址，必填
                    data['status'] = 0;

                    collection.insert(data,{w:1},function(err,ret){
                        if(err){
                            console.log('error:'+err);
                        }else{
                            console.log('vedio upload successfully2!');
                            callback(null,true);
                            insertId=ret[0]['_id'];
                            transcode(inputPath,outputPath,insertId);
                        } 
                    });


        }else{
            F_SHOT().screenshot(fileData.path,picPath,function(err,d) {
                data['dur'] = d;
                data['status'] = 1;
                collection.insert(data, {w: 1}, function (err, ret) {
                    if (err) {
                        console.log('error:' + err);
                    } else {
                        console.log(fileData);
                        //console.log('vedio upload successfully!');
                        callback(null, true);
                    }
                });

            })
        }


 //   });


}