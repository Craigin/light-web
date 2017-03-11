/**
 * New node file
 */
var FFMPEG = require('./modules/ffmpeg/ffmpeg-util');
var ffmpegPath = 'ffmpeg';
var ffmpegParams = {};
ffmpegParams.input = 'e:/work/coredata/voddata/ts/girl.ts'; //文件地址，必填
ffmpegParams.output = 'e:/work/test.mp4'; //转码后文件地址，必填
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
	}
});


