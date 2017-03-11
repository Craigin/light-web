/**
 * New node file
 */
var ffmpeg;
var ffmpeg_path;
var FFMPEG = function(){
	ffmpeg = require('fluent-ffmpeg');
	ffmpeg_path = process.env.ffmpeg_path;
	
};


FFMPEG.prototype.execute = function(ffmpegPath,ffmpegParams,callback){
	
	var command = ffmpeg();
	if(!ffmpegPath){
		command.setFfmpegPath(ffmpeg_path);
	}
	if(!ffmpegParams.input){
		if(callback)callback('[input] no found');
	}
	if(!ffmpegParams.output){
		if(callback)callback('[output] no found');
	}
	
	console.log(ffmpegParams);
	
	command.input(ffmpegParams.input);
	
	command.audioCodec('aac');
	if(ffmpegParams.channels){
		command.withAudioChannels(ffmpegParams.channels);
	}
	if(ffmpegParams.ab){
		command.withAudioBitrate(ffmpegParams.ab);
	}
	if(ffmpegParams.freq){
		command.withAudioFrequency(ffmpegParams.freq);
	}
	
	command.videoCodec('libx264');
	if(ffmpegParams.vb){
		command.withVideoBitrate(ffmpegParams.vb);
	}
	if(ffmpegParams.fps){
		command.withFps(ffmpegParams.fps);
	}
	if(ffmpegParams.size){
		command.withSize(ffmpegParams.size);
	}
	command.toFormat('mp4');
	
	command.output(ffmpegParams.output);
	
	command.on('end',function(){
//		console.log('stream close');
		if(callback)callback(null,"complete");
	})
	.on('error',function(err){
//		console.log(err);
		if(callback)callback(err);
		command.kill('SIGKILL');
	})
	.on('start',function(cmd){
//		console.log(cmd);
		if(callback)callback(null,"start");
		command.ffmpegProc.stderr.on('data',function(data){
				console.log(data.toString());
		});
	}).run();
};

module.exports = FFMPEG;