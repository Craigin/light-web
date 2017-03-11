/**
 * Created by kinov on 2016/3/28.
 */
module.exports=function(router,app){
    //视频剪辑
    router.post('/', function(req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "origin, content-type, accept, authorization");
        res.setHeader("Access-Control-Allow-Credentials", "true");
//console.log(req.body);
        res.send('success');
        var goalDirPath = 'public/uploads/videos/';
        var collection=db.collection('media_data');
        ffmpeg(goalDirPath+req.body.source)
            .videoCodec('copy')
            .audioCodec('copy')
            .output(goalDirPath+req.body.name)
            .outputOptions(
                [
                    '-ss',
                    req.body.sTime,
                    '-t',
                    req.body.dTime
                ]
            )
            .on('error',function(err){
                //res.send(err);
                console.log(err);
                console.log(this._getArguments().join(' '));
            })
            .on('end', function() {
                console.log('Finished cuttask');
                newPath=goalDirPath+req.body.name;
                ffmpeg(newPath)
                    .videoCodec('mjpeg')
                    .noAudio()
                    .outputOptions(['-ss','0.001','-vframes','1','-s','340*340'])
                    .on('error',function(err){
                        //  console.log(err);
                        //  res.send(err);
                    })
                    .on('end', function() {
                        // console.log('112');


                        collection.findOne({},function(err,data){
                            data['videos'].push({'name':req.body.name,'dir':'/uploads/vedios/','dur':req.body.dTime,'pic': '/uploads/images/'+req.body.name.slice(0,-3)+'jpg'});
                            //console.log(data);
                            collection.update({},{$set:{videos:data['videos']}},function(err){
                                if(err)console.log(err);
                            })
                        })
                    }).save( 'public/uploads/images/'+req.body.name.slice(0,-3)+'jpg');
            }).run();

    });

};