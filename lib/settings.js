/**
 * Created by kinov on 2016/4/5.
 */
module.exports = function(app){
    var db = app.get('db');
    return {
        getSettings:function(key,callback){
             db.collection('settings').findOne({key:key},callback);
        },
        saveSettings:function (key,value,callback) {
            
        }
    }
};