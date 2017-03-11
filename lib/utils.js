/**
 * Created by lilixin on 16/5/9.
 */
var fs = require('fs');
module.exports = {
    copyFileSync:function (srcFile,destFile) {
        var BUF_LENGTH = 64*1024;
        var buff = new Buffer(BUF_LENGTH);
        var fdr = fs.openSync(srcFile, 'r');
        var fdw = fs.openSync(destFile, 'w');
        var bytesRead = 1;
        var  pos = 0;
        while( bytesRead > 0){
            bytesRead = fs.readSync(fdr, buff, 0, BUF_LENGTH, pos);
            fs.writeSync(fdw,buff,0,bytesRead);
            pos += bytesRead;
        }
        fs.closeSync(fdr);
        fs.closeSync(fdw);
    }
}