/**
 * Created by kinov on 2016/3/30.
 */
var multer  = require('multer');
var upload = multer({ dest: 'uploads/' });
var fs = require('fs');
var path = require('path');
module.exports = function(router,app){
    router.post('/',upload.single('pic'),function(req,res){
        var file = req.file;
        var ext = file.originalname.substring(file.originalname.lastIndexOf('.'));
        var url = '/uploads/images/'+file.filename+ext;
        fs.rename(file.path,path.join(__dirname,'../public'+url),function(err,ret){
            res.json({success:true,url:url});
        });
    });
}