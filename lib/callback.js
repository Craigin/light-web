/**
 * Created by paki on 2016/10/24.
 */
module.exports = function(url){
    return function(){
        connect(url);
    }
}