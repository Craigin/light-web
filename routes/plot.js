/**
 * Created by paki on 2016/5/13.
 */

module.exports = function(router,app) {
    var db = app.get('db');
    var statistics = app.get('statistics');
    router.get('/status/:type', function (req, res, next) {
            if(req.params.type=='todayVisitors'){
                    statistics.getTodayVisitors(function(a){
                        if(a){
                            res.json({success:true,data:a});
                        }else{
                            res.json({success:false});
                        }

                    });
            }else if(req.params.type=='yesterdayVisitors'){
                statistics.getYesterdayVisitors(function(a){
                    if(a){
                        res.json({success:true,data:a});
                    }else{
                        res.json({success:false});
                    }

                });
            }else if(req.params.type=='weekVisitors'){
                statistics.getWeekVisitors(function(a){
                    if(a){
                        res.json({success:true,data:a});
                    }else{
                        res.json({success:false});
                    }

                });
            }else if(req.params.type=='monthVisitors'){
                statistics.getMonthVisitors(function(a){
                    if(a){
                        res.json({success:true,data:a});
                    }else{
                        res.json({success:false});
                    }

                });
            }
    })

    router.get('/index/:type', function (req, res, next) {
        if(req.params.type=='today'){
            statistics.getTodayData(function(a){
                if(a){
                    res.json({success:true,data:a});
                }else{
                    res.json({success:false});
                }

            });
        }else if(req.params.type=='yesterday'){
            statistics.getYesterdayData(function(a){
                if(a){
                    res.json({success:true,data:a});
                }else{
                    res.json({success:false});
                }

            });
        }else if(req.params.type=='week'){
            statistics.getWeekData(function(a){
                if(a){
                    res.json({success:true,data:a});
                }else{
                    res.json({success:false});
                }

            });
        }else if(req.params.type=='month'){
            statistics.getMonthData(function(a){
                if(a){
                    res.json({success:true,data:a});
                }else{
                    res.json({success:false});
                }

            });
        }
    })



}
