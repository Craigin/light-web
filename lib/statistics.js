/**
 * Created by paki on 2016/4/14.
 */
var async = require('async');


module.exports = function(app){
    var db = function(){return app.get('db')};
    var count=0;
   // var collection = db().collection('visitor');
    
    // var getTimeRange=function(time){
    //
    //     //console.log(time);
    //     var minTime = parseInt(time/86400)*86400-8*3600;
    //     var maxTime = minTime+86399;
    //     //console.log(minTime+'-----'+maxTime);
    //     return [minTime,maxTime];
    // }


    var formatDate=function(time) {
        var year=time.getFullYear();
        var month=time.getMonth()+1;
        var date=time.getDate();
        var hour=time.getHours();
        var minute=time.getMinutes();
        var second=time.getSeconds();
        return [year+"-"+month+"-"+date,hour,minute];
    }

    var getDayRange=function(time,type,format){
        if(type=='today'){
            var minTime = Math.floor(time/86400000)*86400000-9*3600000;
            var maxTime=time-3600000;
        }else if(type=='yesterday'){
            var minTime = Math.floor(time/86400000-1)*86400000-8*3600000;
            var maxTime=Math.floor(time/86400000)*86400000-8*3600000;
            // console.log('**************');
            // console.log(maxTime);
            // console.log(format(maxTime));
        }
        var data=[];
        for(var timestamp=minTime;timestamp<=maxTime;timestamp=timestamp+3600*1000){
            if(format){
            var item=formatDate(new Date(timestamp+3600000));
            data.push(item)
            }else{
                data.push(timestamp+8*3600000);
            }
            //console.log(timestamp);
        }
        return data;

    }


    var getWeekRange=function(time,format){

        var maxTime = Math.floor(time/86400000);
        var data=[];
        for(var i=maxTime;i>=maxTime-6;i--){
            if(format){
                var item=formatDate(new Date(i*86400000-8*3600000));
                data.unshift(item)
            }else{
                data.unshift(i*86400000);
            }
            //console.log(timestamp);
        }
        return data;
    }
    var getMonthRange=function(time,format){

        var maxTime = Math.floor(time/86400000);
        var data=[];
        for(var i=maxTime;i>=maxTime-30;i=i-3){
            if(format){
                var item=formatDate(new Date(i*86400000));
                data.unshift(item)
            }else{
                data.unshift(i*86400000);
            }
            //console.log(timestamp);
        }
        return data;
    }
    var getViewByHour = function(time,callback){
        db().collection('visitor').find({day:time[0],hour:time[1]}).toArray(function(err,ret){

            if(err){return err.message}
            var counts = 0;
            for(var i=0;i<ret.length;i++){
                counts+=ret[i].views;
            }
            if(typeof callback == 'function'){
                callback(counts);
            }

        })
    }

    var getViews = function(timeArr,type,callback){
        if(type=='hour'){
            var  data=[];
            var count = 0;
            async.whilst(function() {
                    return count < timeArr.length
                },
                function(cb){

                           db().collection('visitor').findOne({day:timeArr[count][0],hour:timeArr[count][1]},function(err,ret){

                                        count++;
                               if(ret){
                                   data.push(ret.views)
                               }else{
                                   data.push(0)
                               }
                              // var item=[[timeArr[count].day,timeArr[count].hour],counts];

                               //console.log(data);

                               setTimeout(cb, 10);
                            });
                },
                function(err) {
                    // 3s have passed
                    callback(data);
                   //console.log(data)
                });

        }else if(type=='week'||'month'){
            var  data=[];
            var count = 0;
            async.whilst(function() {
                    return count < timeArr.length
                },
                function(cb){

                    // console.log('count:'+count);

                    db().collection('visitor').find({day:timeArr[count][0]}).toArray(function(err,ret){

                        count++;
                        var counts = 0;
                        if(ret != null){
                            for(var j=0;j<ret.length;j++){
                                counts+=ret[j].views;
                            }
                        }
                        data.push(counts);
                        setTimeout(cb, 10);
                    });
                },
                function(err) {
                    // 3s have passed
                    callback(data);
                    //console.log(data)
                });
        }else{
            return false;
        }
    }

    var getVisitors = function(timeArr,type,callback){
        if(type=='hour'){
            var  data=[],list=[];
            var count = 0;
            async.whilst(function() {
                    return count < timeArr.length
                },
                function(cb){
                    db().collection('visitor').findOne({day:timeArr[count][0],hour:timeArr[count][1]},function(err,ret){

                        count++;
                        if(ret != null){
                                //console.log()
                                data.push(ret.Ips.length);


                        }else{
                            data.push(0);
                        }
                        // var item=[[timeArr[count].day,timeArr[count].hour],counts];

                        //console.log(data);
                        setTimeout(cb, 10);
                    });
                },
                function(err) {
                    // 3s have passed
                    callback(data);
                    console.log(data)
                });

        }else if(type=='week'||'month'){
            console.log('666666666666666666');
            var  data=[],list=[];
            var count = 0;
            async.whilst(function() {
                    return count < timeArr.length
                },
                function(cb){
                    db().collection('visitor').find({day:timeArr[count][0]}).toArray(function(err,ret){

                        count++;
                        list=[];
                        var num=0;
                        if(ret != null){
                            for(var i=0;i<ret.length;i++){
                                num+=ret[i].Ips.length;

                            }
                            data.push(num);
                        }
                        // var item=[[timeArr[count].day,timeArr[count].hour],counts];

                        //console.log(data);
                        setTimeout(cb, 10);
                    });
                },
                function(err) {
                    console.log(data)
                    callback(data);

                });
        }else{
            return false;
        }
    }

    var getNewVisitors = function(timeArr,type,callback){
        if(type=='hour'){
            var  data=[],list=[];
            var count = 0;
            async.whilst(function() {
                    return count < timeArr.length
                },
                function(cb){
                    db().collection('visitor').findOne({day:timeArr[count][0],hour:timeArr[count][1]},function(err,ret){

                        count++;
                        list=[];
                        if(ret){
                            data.push(ret.newVisitor);
                        }else{
                            data.push(0);
                        }
                        // var item=[[timeArr[count].day,timeArr[count].hour],counts];

                        //console.log(data);
                        setTimeout(cb, 10);
                    });
                },
                function(err) {
                    // 3s have passed
                    callback(data);
                    //console.log(data)
                });

        }else if(type=='week'||'month'){
            console.log('666666666666666666');
            var  data=[],list=[];
            var count = 0;
            async.whilst(function() {
                    return count < timeArr.length
                },
                function(cb){
                    db().collection('visitor').find({day:timeArr[count][0],newVisitor:true}).toArray(function(err,ret){

                        count++;
                        list=[];
                        if(ret != null){
                            for(var i=0;i<ret.length;i++){
                                list.push(ret[i].ip);
                            }
                            var set=new Set(list);
                        }
                        // var item=[[timeArr[count].day,timeArr[count].hour],counts];
                        data.push(set.size);
                        //console.log(data);
                        setTimeout(cb, 10);
                    });
                },
                function(err) {
                    console.log(data)
                    callback(data);

                });
        }else{
            return false;
        }
    }

    var getTotalVisitors=function(timeArr,newVisitor,callback){
        var  data1=[],data2=[],list=[],data_all={};
        var count = 1;
        async.whilst(function() {
                return count < 2*timeArr.length-1
            },
            function(cb){
                if(count<timeArr.length){
                    db().collection('visitor').find({timestamp:{$gt:timeArr[count]*1,$lt:timeArr[0]*1},newVisitor:true}).toArray(function(err,ret){

                        count++;
                        list=[];
                        if(ret != null){
                            for(var i=0;i<ret.length;i++){
                                list.push(ret[i].ip);
                            }
                            var set=new Set(list);
                        }
                        // var item=[[timeArr[count].day,timeArr[count].hour],counts];
                        data1.push(set.size);
                        //console.log(data);
                        setTimeout(cb, 10);
                    });
                }else{
                    db().collection('visitor').find({timestamp:{$gt:timeArr[count-3]*1,$lt:timeArr[0]*1}}).toArray(function(err,ret){

                        count++;
                        list=[];
                        if(ret != null){
                            for(var i=0;i<ret.length;i++){
                                list.push(ret[i].ip);
                            }
                            var set=new Set(list);
                        }
                        // var item=[[timeArr[count].day,timeArr[count].hour],counts];
                        data2.push(set.size);
                        console.log(data2);
                        setTimeout(cb, 10);
                    });
                }

            },
            function(err) {
                // 3s have passed
                // return data;
                // console.log(data)
                data_all={
                    data_new:data1,
                    data_total:data2
                };
                callback(data_all);
            });
    };

    var getInfo=function(callback){
        db().collection('visitor').find().toArray(function(err,ret){
            if(err)console.log(err);
            if( ret){

                var num=0,visitors;
                var list=[],maxVisitors=0;

                    for(var i=0;i<ret.length;i++){

                        num+=ret[i].views;
                        var max=ret[i].Ips.length;
                        if(maxVisitors<max)maxVisitors=max;


                    }


             //   var maxVisitors=Math.Max.Apply(Math,list);


                var data={
                    views:num,
                    visitors:ret[ret.length-1].Ips.length,
                    maxVisitors:maxVisitors
                }
                if(typeof callback=='function')callback(data);
                // var item=[[timeArr[count].day,timeArr[count].hour],counts];

            }
        })
    }

    return {
        settings:function(newVisitor,uid,callback){
                    console.log(newVisitor)
                    var nowTime= formatDate(new Date());

                    db().collection('visitor').findOne({day:nowTime[0],hour:nowTime[1]},function(err,ret) {
                        //  console.log(ret);
                        if (err) {
                            console.log(err);
                        } else{
                            if (!ret) {
                            console.log('*******************************');
                            console.log('insert');
                            if(newVisitor){var newNum=1;}else{var newNum=0;}
                            var data = {day:nowTime[0],hour:nowTime[1],views:1,newVisitor:newNum,Ips:[uid]};
                            db().collection('visitor').insert(data,{w:1},function(err,ret){
                                if(err)console.log(err);
                               // console.log('insert');
                               // if(typeof  callback=='function')callback();
                                //console.log(ret);
                            });
                        } else {
                            console.log('*******************************');

                            if(newVisitor){var newNum=ret.newVisitor+1;}else{var newNum=ret.newVisitor}
                                console.log('update'+newNum);

                                var Ips=ret.Ips;
                                if(Ips.indexOf(uid)<0)
                                Ips.push(uid);
                            db().collection('visitor').update({day:nowTime[0],hour:nowTime[1]},{$set:{newVisitor:newNum,views:ret.views+1,Ips:Ips}},function(err,ret){
                                if(err)console.log(err);
                                console.log(ret);
                            });
                        }
                        }
                    })
                },
        getTodayData:function(cb){
            var time = new Date(),
                timeArr = getDayRange(time,'today',true),
                ret=[];
            time.setTime((Math.floor(time.getTime()/3600000))*3600000);
            //console.log(timeArr);
            var timestamps=getDayRange(time,'today',false);
          //  console.log(new Date().getTime());
           getViews(timeArr,'hour',function(data){
        //       console.log(new Date().getTime());
                for(var i=0;i<timestamps.length;i++){
                    ret.push([timestamps[i],data[i]])
                }
               console.log(ret);
               if(typeof  cb == 'function')cb(ret);
            });



        },
        getYesterdayData:function(cb){
            var time = new Date(),
                timeArr = getDayRange(time,'yesterday',true),
                ret=[];
            time.setTime((Math.floor(time.getTime()/3600000))*3600000);
            //console.log(timeArr);
            var timestamps=getDayRange(time,'yesterday',false);
            getViews(timeArr,'hour',function(data){
                for(var i=0;i<timestamps.length;i++){
                    ret.push([timestamps[i],data[i]])
                }
                console.log(ret);
                if(typeof  cb == 'function')cb(ret);
            });



        },
        getWeekData:function(cb){
            var time = new Date(),
                timeArr = getWeekRange(time,true),
                ret=[];
            time.setTime((Math.floor(time.getTime()/3600000))*3600000);
            var timestamps=getWeekRange(time,false);
            //console.log(timeArr);
            getViews(timeArr,'week',function(data){
                for(var i=0;i<timestamps.length;i++){
                    ret.push([timestamps[i],data[i]])
                }
                //console.log(ret);
                if(typeof  cb == 'function')cb(ret);
            });
        },
        getMonthData:function(cb){
            var time = new Date(),
                timeArr = getMonthRange(time,true),
                ret=[];
            time.setTime((Math.floor(time.getTime()/3600000))*3600000);
            var timestamps=getMonthRange(time,false);
            //console.log(timeArr);
            getViews(timeArr,'month',function(data){
                for(var i=0;i<timestamps.length;i++){
                    ret.push([timestamps[i],data[i]])
                }
                //console.log(ret);
                if(typeof  cb == 'function')cb(ret);
            });
        },
        getDayNewVisitors:function(cb){
            var time = new Date(),
                timeArr = getDayRange(time,'today',true),
                ret=[];
            time.setTime((Math.floor(time.getTime()/3600000))*3600000);
            //console.log(timeArr);
            var timestamps=getDayRange(time,'today',false);
            getNewVisitors(timeArr,'hour',function(data){
                for(var i=0;i<timestamps.length;i++){
                    ret.push([timestamps[i],data[i]])
                }
         //       console.log(ret);
                if(typeof  cb == 'function')cb(ret);
            });
        },
        getWeekNewVisitors:function(cb){
            var time = new Date(),
                timeArr = getWeekRange(time,true),
                ret=[];
          //  console.log(timeArr);
            var timestamps=getWeekRange(time,false);

             getNewVisitors(timeArr,'week',function(data){
                for(var i=0;i<timestamps.length;i++){
                    ret.push([timestamps[i],data[i]])
                }
            //    console.log(ret);
                if(typeof  cb == 'function')cb(ret);
             });
        },
        getMonthNewVisitors:function(cb){
            var time = new Date(),
                timeArr = getMonthRange(time,true),
                ret=[];
            //console.log(timeArr);
            var timestamps=getMonthRange(time,false);
            getNewVisitors(timeArr,'month',function(data){
                for(var i=0;i<timestamps.length;i++){
                    ret.push([timestamps[i],data[i]])
                }
             //   console.log(ret);
                if(typeof  cb == 'function')cb(ret);
            });
        },
        getTodayVisitors:function(cb){
            var time = new Date(),
                timeArr = getDayRange(time,'today',true),
                ret=[];
            time.setTime((Math.floor(time.getTime()/3600000))*3600000);
            //console.log(timeArr);
            var timestamps=getDayRange(time,'today',false);
            getVisitors(timeArr,'hour',function(data){
                for(var i=0;i<timestamps.length;i++){
                    ret.push([timestamps[i],data[i]])
                }
               // console.log(ret);
                if(typeof  cb == 'function')cb(ret);
            });
        },
        getYesterdayVisitors:function(cb){
            var time = new Date(),
                timeArr = getDayRange(time,'yesterday',true),
                ret=[];
            time.setTime((Math.floor(time.getTime()/3600000))*3600000);
            //console.log(timeArr);
            var timestamps=getDayRange(time,'yesterday',false);
            getVisitors(timeArr,'hour',function(data){
                for(var i=0;i<timestamps.length;i++){
                    ret.push([timestamps[i],data[i]])
                }
                // console.log(ret);
                if(typeof  cb == 'function')cb(ret);
            });
        },
        getWeekVisitors:function(cb){
            var time = new Date(),
                timeArr = getWeekRange(time,true),
                ret=[];
            time.setTime((Math.floor(time.getTime()/3600000))*3600000);
            //console.log(timeArr);
            var timestamps=getWeekRange(time,false);

            getVisitors(timeArr,'week',function(data){
                for(var i=0;i<timestamps.length;i++){
                    ret.push([timestamps[i],data[i]])
                }
            //    console.log(ret);
                if(typeof  cb == 'function')cb(ret);
            });
        },
        getMonthVisitors:function(cb){
            var time = new Date(),
                timeArr = getMonthRange(time,true),
                ret=[];
            time.setTime((Math.floor(time.getTime()/3600000))*3600000);
            //console.log(timeArr);
            var timestamps=getMonthRange(time,false);
            getVisitors(timeArr,'month',function(data){
                for(var i=0;i<timestamps.length;i++){
                    ret.push([timestamps[i],data[i]])
                }

                console.log(ret);
                if(typeof  cb == 'function')cb(ret);
            });
        },

        getPieData:function(cb){
            var time = new Date(),
                 daytime=time-86400000,
                weektime=time-7*86400000,
                monthtime=time-30*86400000
                time_arr=[time.valueOf(),daytime,weektime,monthtime];
            console.log(time_arr);
            getTotalVisitors(time_arr,true,function(data){
                console.log(data);
                if(typeof  cb == 'function')cb(data);
            });
        },
        getinfo:function (cb) {
            getInfo(function(ret){
                if(typeof  cb == 'function')cb(ret);
            })
        }


    }
};