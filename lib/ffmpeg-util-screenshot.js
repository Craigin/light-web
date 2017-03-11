/**
 * Created by paki on 2016/3/28.
 */


module.exports = function(){
    var ffmpeg = require('fluent-ffmpeg');
    return{
        screenshot:function(input,output,callback){
            ffmpeg(input)
                .videoCodec('mjpeg')
                .noAudio()
                .outputOptions(['-ss','0.001','-vframes','1','-s','340*340'])
                .on('error',function(err){
                    console.log(err);
                    callback(err)
                    //  res.send(err);
                })
                .on('end', function() {
                    // console.log('112');
                    ffmpeg(input)
                        .ffprobe(function(err, data) {
                            if (err) throw err;
                            console.log('************************************************');
                            // console.log(data);
                            duration=Math.round(data.streams[0].duration);
                            console.log(data.streams);
                            if(typeof callback=='function')
                                callback(null,duration);
                        })


                }).save( output);

        }
    }
}