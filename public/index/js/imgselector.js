/**
 * Created by kinov on 2016/3/15.
 */

var ImageSelector = (function(){
    var el = '#img-selector-dlg';
    var init=false;
    var navTmpl,listTmpl;
    var currentImages = [];
    var type=-1;
    var refresh=function(data){

        if(data)
               $(el).find('.image-list').append($(ejs.render(listTmpl,{images:data})));
        else  $(el).find('.image-list').html($(ejs.render(listTmpl,{images:currentImages})));
    };
    var formatData=function(data,append){
        var startIndex=0;
        if(append){
            startIndex = currentImages.length;
        }else{
            currentImages=[];
        }
        $(data).each(function(i,n){
            n['dataIndex'] = startIndex++;
            if(type==2){
                n.size = n.name;
                n.url = n.pic;
                n.videoUrl = n.dir;
            }
            if(type==3){
                n.size = n.name;
                n.docUrl = n.durl;
            }
            currentImages.push(n);
        });
        return data;
    }
    var loadImage=function(cateid,compareId){
        compareId=compareId||0;
        var resource = 'images';
        if(type==2) resource = 'videos';
        if(type==3) resource = 'docs';
        $.get('/resources/'+resource+'/'+cateid+'?compareId='+compareId,function(data){
           var images = formatData(data.images,compareId);
            refresh(compareId?images:null);
        });
    };
    var loadMore=function(){
        loadImage($(el).find('ul.nav li.active:first').attr('_id'),currentImages[currentImages.length-1]['_id']);
    };
    var clickHandler=null;

    return{
        open:function(callback,options){
            
            var options=options||{};

            if(typeof options == 'string') options={type:options};
            if(!options.type) options.type = '1';
            
            
            clickHandler = function(url){
                if(typeof callback=='function'){
                    if(url){
                        callback(url);
                    }else {
                        callback(currentImages[$(this).attr('dataindex') * 1]);
                    }
                }
                $(el).find(".nice-upload").val("");
                $(el).modal('hide');
            };
            $(el).one('show.bs.modal',function(ev){
                if(!init){
                init=true;
                //generate  template from dom
                navTmpl = $(el).find('ul.nav').html().replace(/&lt;/g,'<').replace(/&gt;/g,'>');
                $(el).find('ul.nav').html('');
                listTmpl = $(el).find('.image-list').html().replace(/&lt;/g,'<').replace(/&gt;/g,'>');
                $(el).find('.image-list').html('');
                $(el).find('ul.nav').on('click','li',function(ev){
                    ev.preventDefault();
                    $(el).find('ul.nav li').removeClass('active');
                    $(this).addClass('active');
                    loadImage(categorys[$(this).attr('dataindex')]['id']);
                });
                $(el).find('.image-list').on('click','[dataindex]',function(ev){
                    clickHandler.call(this);
                });

                //load category
                $(el).find('.image-list').on('scroll',function(ev){
                    if($(this).height()+$(this).scrollTop()>=$(this)[0].scrollHeight){
                        //alert('scroll bottom');
                        loadMore();
                    }
                });
                $(el).find('.nice-upload').on('niceupload.success',function(ev,data){
                    clickHandler(data);
                });
            }
                if(options.type!=type) {
                    type = options.type;
                    $.get('/resources/category/'+type, function (data) {
                        $(el).find('ul.nav').html(ejs.render(navTmpl, data));
                        categorys = data.categorys;
                        $(el).find('ul.nav li:first').trigger('click');
                    });

                    if(type==2){
                        $(el).find('.modal-body').removeClass('noimg');
                        $(el).find('.modal-title').html('请选择视频');
                        $(el).find('.upload-outer').hide();
                    }else if(type==3){
                        $(el).find('.modal-body').addClass('noimg');
                        $(el).find('.modal-title').html('请选择文件');
                        $(el).find('.upload-outer').hide();
                    }else{
                        $(el).find('.modal-body').removeClass('noimg');
                        $(el).find('.modal-title').html('请选择图片');
                        $(el).find('.upload-outer').show();
                    }
                }
            });
            $(el).modal();
        }
    }
})();
//
//ImageSelector.open(function(data){
//    alert(JSON.stringify(data));
//});