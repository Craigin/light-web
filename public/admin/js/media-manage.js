/**
 * Created by admin on 2016/3/16.
 */
$(function(){
// setTimeout(function () {
//     $('.media-content-box img').css('height',$('.media-content-box img').width());
// },300)

    $(".media-box").find(".media-tit").hide();
    mediaContentBox();

    $('.media-content').delegate('.delbox span .glyphicon-ok','click',function(){
        var parent=$(this).parents('.media-content-box');
        var that=$(this);
       // alert($('.delete-box .delete-id').val());
        $.ajax({
            type:"get",
            url: "/admin/media/delete/"+tid+'/'+$(this).parents('.media-box').attr('media_id'),
            success:function(data){

                if(data=='success'){
                    $('.delete-box').modal('hide');
                   //alert('删除成功');
                    _toastr("文件删除成功！","top-right","success",false);
                  //  $('.tab-pane.active ul li').eq(0).click();
                    parent.remove();
                    var type=that.parents('.media-box').attr('mtype');
                    var index=that.parents('.media-box').attr('index');
                    if(type=='video'){
                        currentVideos.splice(index,1);
                    }else if(type=='image'){
                        currentImages.splice(index,1);
                    }else if(type=='docs'){
                        currentDOCS.splice(index,1);
                    }

                }
            }
        })

    })
    $('.bounced-close').click(function(){
        $('.bounced-hid').hide();
    });
    $('.delete-btn').click(function(){
        $(this).parents('.media-box').parents('.media-content-box').remove();
    });
    $('.upload-hd').click(function(){
        $(this).siblings('.upload-bd').show();
    });
    $('.upload-bd .panel-heading li,.panel-bottom button').click(function(){
        $('.upload-bd').hide();
    });
    $('.add-menu').click(function(){
        $(this).siblings("ul").append('<div style="margin-top: 2px;"><input type="text" class="form-control input-menu" placeholder="请输入目录名称"><button class="pull-right" style="margin-left: 5px;margin-right: 5px;margin-top: 3px;" type="button"><i class="glyphicon glyphicon-ok"></i></button><button class="pull-right" style="margin-top: 3px;" type="button"><i class="glyphicon glyphicon-remove bounced-close"></i></button></div>');
    });
    //$('.media-tabs').find('.glyphicon-ok').click(function () {
    $('.media-tabs').delegate('.glyphicon-ok','click',function () {
        var item= $(this).parent().siblings('input');

        if(item.val()==''){
            _toastr('请输入文件夹名称！',"top-right","error",false);
            return false;
        }
        $.ajax({
            type:"post",
            url: "/admin/dir/add",
            data:{
                tId:$('.tab-one li.active').attr('tid'),
                name:item.val()
            },
            success:function(data){
                //          	var o= jQuery.parseJSON(data);
                //          	console.log(o);
                console.log(data);
                if(data){
                    //alert('123');
                    item.parents("ul").append('<li class="" cid="'+data.cid+'"><a href="javascript:void(0)" data-toggle="tab" aria-expanded="true"> '+item.val()+'<i class="fa fa-trash-o delete-cat pull-right" data-toggle="modal" data-target=".delete-box" style="cursor: pointer"></i></a></li>');
                    //item.parents("ul").append('<li><a href="#tab_1d" data-toggle="tab">'+item.val()+'</a></li>');
                    item.parent().remove();
                }
            }
        });
    })
    $('.media-tabs').delegate('.glyphicon-remove','click',function () {

        $(this).parent().parent().remove();

    })

    var i = 0;
    $(".media-content-box input[type='checkbox']").click(function(){
        if($(this).is(':checked')){
            $(this).parents(".media-content-box").unbind('mouseenter mouseleave');
            $(this).parents('.media-content-box').css("border","1px solid #3899ec");
            $('.media-content h4 button,.media-content h4 span').show();
            $('.media-content h4 span i').html(++i);
        }
        else{
            $('.media-content h4 span i').html(--i);
            mediaContentBox();
            //$('.media-content h4 button,.media-content h4 span').hide();
            if(i==0){
                $('.media-content h4 button,.media-content h4 span').hide();
            }
        }
    });
    $('.btn-delete').click(function(){
        if(confirm("确定删除这些文件吗？")){
            alert("成功删除！");
            $(".media-content-box input:checked").parents('.media-content-box').remove();
            $('.media-content h4 button,.media-content h4 span').hide();
            i= 0;
            $('.media-content h4 span i').html(i);
        }
        else{
            console.log("未删除！");
        }
    })

    //loadmore

    var loadMore=function(){
        var cateid= $('.tab-content .tab-pane.active li.active').attr('cid');
        var typeid=$('.tab-one li.active').attr('tid');
        if(typeid==1){
            $.get('/resources_admin/images/'+cateid+'/'+$('.media-content').find('.media-box').eq(-1).attr('media_id'),function(data){
                currentImages=currentImages.concat.apply(currentImages,data.images);
                Widget.renderFile( 'blocks/media-image.ejs',{images:currentImages},$('.media-content'));

            });
        }else if(typeid==2){
            $.get('/resources_admin/videos/'+cateid+'/'+$('.media-content').find('.media-box').eq(-1).attr('media_id'),function(data){
                currentVideos=currentVideos.concat.apply(currentVideos,data.videos);
                Widget.renderFile( 'blocks/media-video.ejs',{videos:currentVideos},$('.media-content'));

            });
        }else{
            $.get('/resources_admin/docs/'+cateid+'/'+$('.media-content').find('.media-box').eq(-1).attr('media_id'),function(data){
                currentDOCS=currentDOCS.concat.apply(currentDOCS,data.docs);
                Widget.renderFile( 'blocks/media-docs.ejs',{docs:currentDOCS},$('.media-content'));

            });
        }
    };
    $('.media-content').on('scroll',function(ev){
       // alert($(this)[0].scrollHeight);

            viewH =$(this).height(),//可见高度
            contentH =$(this).get(0).scrollHeight,//内容高度
            scrollTop =$(this).scrollTop();//滚动高度
        //if(contentH - viewH - scrollTop <= 100) { //到达底部100px时,加载新内容
      //  console.log(scrollTop+'*********'+contentH+'********'+viewH);
        if(contentH - viewH - scrollTop <= 100){
           // alert('123');
            loadMore();
        }
    });

    //重命名操作
    //$('.media-ope li span').click(function(){
    //    $(this).siblings('.bounced-hid').show();
    //});

    $('.media-content').on('click','.media-ope li span',function(){
        //alert(tid+'----'+cid);
        $('.media-content ').find('.bounced-hid').hide();
        $(this).siblings('.bounced-hid').show();
    })
    $('.media-content').on('click','.bounced-close',function(){

        $(this).closest('.bounced-hid').hide();

    })
    $('.media-content').delegate('.edit span .glyphicon-ok','click',function(){
        var item = $(this);
        var name=$(this).parent().prev().val();
        var mid=$(this).parents('.media-box').attr('media_id');
       // alert(oName);
        if(name=='')return;
        var url = '/admin/media/rename/'+tid+'/'+mid+'/'+name;
        $.get(url,function(data){
            //alert(data);
            if(data.success==true){
                //alert('123');
                _toastr("文件重命名成功！","top-right","success",false);
                $('.media-content ').find('.bounced-hid').hide();
                item.parents('.media-box').find('.media-tit').text(name);
            }else{
                _toastr(data.err,"top-right","error",false);

            }
        })
    })



    //图片预览
    $('.media-content').on('click','.media-image li .glyphicon-zoom-in',function(){
        var src = $(this).parent().siblings().children('.download-btn').attr('href');
        $('.img-show-box img').attr('src',src);

    })



});
function mediaContentBox(){

    $('.media-content').on('mouseenter','.media-content-box',function(ev){
        $(this).find(".media-tit,.media-ope,.checkbox").show();
        $(this).css("border","1px solid #3899ec");
    });
    $('.media-content').on('mouseleave','.media-content-box',function(ev){
        $(this).find(".media-tit,.media-ope,.checkbox").hide();
        $(this).css("border","1px solid #ddd");
    });
}