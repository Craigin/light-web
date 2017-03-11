/**
 * Created by paki on 2016/3/28.
 */

module.exports = function(){
    var ffmpeg = require('fluent-ffmpeg');
    var fffmpeg_cut=require('./ffmpeg-util-screenshot.js')
    return{
        cut:function(input,output,sTime,dTime,picoutput,callback){
            ffmpeg(input)
                .videoCodec('copy')
                .audioCodec('copy')
                .output(output)
                .outputOptions(
                    [
                        '-ss',
                       sTime,
                        '-t',
                        dTime,
                        '-movflags',
                        'faststart'
                    ]
                )
                .on('error',function(err){
                    //res.send(err);
                    console.log(err);
                    //  console.log(this._getArguments().join(' '));
                })
                .on('end', function() {
                   // console.log('Finished cuttask');


                    fffmpeg_cut().screenshot(output,picoutput,callback)


                }).run();
        }
    }
}

