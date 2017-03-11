/**
 * Created by paki on 2016/6/24.
 */
module.exports = function(app){
    var http = require('http');
    var fs = require('fs');
    var path = require('path');
    var generateMixed=function(n) {
        var jschars = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
        var res = "";
        for(var i = 0; i < n ; i ++) {
            var id = Math.ceil(Math.random()*35);
            res += jschars[id];
        }
        return res;
    }
    var Downloader = function () {
        this.downloading = false;
        this.downloadTask = [];
    };

    Downloader.prototype.download = function(remoteUrl,localFile,callback){
        var task =  Array.prototype.slice.call(arguments,0);
       console.log('22222222222222222222');
        console.log(typeof task[2]);
        this.downloadTask.push(task);
        if(!this.downloading){
            this.doDownload(this.downloadTask.shift());
        }
    };
    Downloader.prototype.doDownload = function (params) {
        this.downloading=true;
        var me = this;
        var file = fs.createWriteStream(params[1]);
        var request = http.get(params[0], function(response) {
            response.pipe(file);
            file.on('finish',function () {
                console.log('download completed :'+params[0]);
                if(me.downloadTask.length==0){
                    me.downloading=false;
                }else{
                    me.doDownload(me.downloadTask.shift());
                }
                if(typeof params[2]!='undefined')
                    params[2]();
            });
        });
    };

    var downLoader = new Downloader();

    var saveFile = function (url,callback) {
        if(url.trim().length==0) return;
        console.log('1111111111111111111');
        console.log(typeof callback);
        /*
         var file = fs.createWriteStream(path.join('media',new Buffer(url).toString('base64')+path.parse(url).ext));
         var request = http.get(url, function(response) {
         response.pipe(file);
         console.log('download '+url);
         });*/
        var tarPath=path.join('public/fileimport/videos',generateMixed(32)+path.parse(url).ext);
        downLoader.download(url,tarPath,function(){
            console.log()
            callback(tarPath)});
    };

    return {
        download:function(srcpath,callback){
            saveFile(srcpath,callback);
        }
    }
};