/**
 * Created by kinov on 2016/3/30.
 */
$(function(){
    window['NiceUpload']={};
    var uploadFile=function(url,name,file,callback){
        callback=callback||{};
        var formData = new FormData();
        formData.append(name,file);
        $.ajax({
            url:url,
            method:'post',
            contentType: false,
            cache: false,
            processData: false,
            data: formData,
            xhr: function() {
                var myXhr = $.ajaxSettings.xhr();
                if(myXhr.upload){
                    myXhr.upload.addEventListener('progress',callback.progress||function(){}, false);
                }
                return myXhr;
            },
            success:callback.success||function(){}
        });
    };
    var basename=function(path){
        var temp = path.replace('/','\\').split('\\');
        return temp[temp.length-1].substring(0,temp[temp.length-1].lastIndexOf('.'));
    };
    var dumpInfo = function(obj){
        for(var s in obj){
            console.log(s+"："+obj[s]);
        }
    }

    makeUpload = function(n){
        $(n).wrap('<div class="fancy-file-upload fancy-file-primary">')
            .before('<i class="fa fa-upload"></i>')
            .after('<input type="text" class="form-control" placeholder="未选择任何图片" readonly="" /><span class="button">请选择图片</span>')
            .addClass('form-control')
            .on('change',function(ev){
                $(this).next('input').val(this.value);
                var uploadUrl = $(this).attr('upload-url');
                var me = this;
                var callback ={
                    progress:function(ev) {
                        var percent = Math.round(ev.loaded * 100 / ev.total);
                        // console.log(percent);
                        // $(progress).css('width', percent + '%');
                        // progress.tooltip('destroy');
                        // progress.tooltip({title: percent + '%', placement: 'top', animation: false});
                        // progress.tooltip('show');
                        $(me).trigger('niceupload.progress', [percent]);
                    },
                    success:function(data){
                        $(me).trigger('niceupload.success',[data]);
                        $(me).next('input').val(data.url);
                        // $(progress).tooltip('destroy');
                    }
                };

                if(uploadUrl){
                    if($(this).attr('image-size') && $(this).cropbox){
                        var temp = $(this).attr('image-size').split('x');
                        var imgWidth = temp[0]*1;
                        var imgHeight = temp[1]*1;
                        var cropper ;
                        $(this).parent('.fancy-file-upload').popover('destroy');
                        var reader = new FileReader();

                        reader.onload = function(e) {
                            $('<img>').one('load',function(ev){
                                var originWidth = $(this).prop('width');
                                var originHeight = $(this).prop('height');

                                if(originHeight==imgHeight && imgWidth==originWidth){
                                    uploadFile(uploadUrl,$(me).attr('name'),$(me)[0].files[0],callback);
                                    return;
                                };
                                me.files = [];

                                originWidth = Math.max(Math.min(originWidth,640),imgWidth+60);
                                originHeight = Math.max( Math.min(originHeight,480),imgHeight+60);
                                var marginLeft = (originWidth - imgWidth)/2-15;
                                var marginTop =  (originHeight-imgHeight)/2;
                                $(me).parent('.fancy-file-upload').popover({
                                    template:'<div class="popover" style="max-width: none;width: '+originWidth+'px;height: '+originHeight+'px"><div class="arrow"></div><div class="popover-content" style="width:100%;height: 100%"></div></div>',
                                    container:'body',html:true,
                                    content:'<div class="imageBox" style="width: 100%;height: 100%" ><div class="thumbBox" style="width: '+imgWidth+'px;height:'+imgHeight+'px;margin-top: '+marginTop+'px;margin-left: '+marginLeft+'px" ></div></div><button style="display: block;position: absolute;bottom: 2px;" class="btn btn-primary btn-cut">裁剪并上传</button>',
                                    placement:'auto bottom'});
                                $(me).parent('.fancy-file-upload').popover('show');
                                var $popover = $(me).parent('.fancy-file-upload').data('bs.popover').$tip;
                                var cropbox = $popover.find('.imageBox');
                                cropper = cropbox.cropbox({
                                    imgSrc : $(this).prop('src'),
                                    thumbBox: '.thumbBox',
                                    spinner: '.spinner'
                                });

                                $popover.on('click','.btn-cut',function(){
                                    var blob = cropper.getBlob();
                                    var fileName = basename($(me).val());
                                    fileName+='.'+blob.type.split('/')[1];
                                    //dumpInfo(blob);
                                    uploadFile(uploadUrl,$(me).attr('name'),new File([blob],fileName,{type:blob.type}),callback);
                                    $(me).parent('.fancy-file-upload').popover('destroy');
                                });

                            }).attr('src', e.target.result);
                            /*
                             var cropbox = $popover.find('.imageBox');
                            cropper = cropbox.cropbox({
                                imgSrc : e.target.result,

                                thumbBox: '.thumbBox',
                                spinner: '.spinner'
                            });
                            $(this).parent('.fancy-file-upload').popover({container:'body',html:true,content:'<div class="imageBox"><div class="thumbBox" style="width: '+imgWidth+'px;height:'+imgHeight+'px;"></div></div><button class="btn btn-primary btn-cut">裁剪并上传</button>',placement:'auto bottom'});
                            $(this).parent('.fancy-file-upload').popover('show');
                            var $popover = $(this).parent('.fancy-file-upload').data('bs.popover').$tip;
                            $popover.css('max-width','600px');
                            $popover.css('height','600px');
                             $popover.on('click','.btn-cut',function(){
                             var blob = cropper.getBlob();
                             var fileName = basename($(me).val());
                             fileName+='.'+blob.type.split('/')[1];
                             //dumpInfo(blob);
                             uploadFile(uploadUrl,$(me).attr('name'),new File([blob],fileName,{type:blob.type}),callback);
                             $(me).parent('.fancy-file-upload').popover('destroy');
                             });
                             */
                        };
                        reader.readAsDataURL(this.files[0]);
                    }else{
                        uploadFile(uploadUrl,$(this).attr('name'),$(this)[0].files[0],callback);
                    }
                }
            });
        var progress = $('<div style="height: 2px;font-size: 1px;background:lightskyblue;position: absolute;bottom: 0px">&nbsp;</div>').appendTo($(n).parent('.fancy-file-upload'));
    };


    $('input:file.nice-upload').each(function(i,n){
         makeUpload(n);
    });


    NiceUpload.uploadFile = uploadFile;
});
