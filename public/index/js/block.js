$(function(){
	
	$('body').on('mouseenter','.block',function() {
		if ($(this).hasClass('editing')) {
			return true;
		}
		$(this).css("border", "2px dashed #6f7a9f");
		if ($(this).hasClass('article')) {
			$(this).append('<ul class="block-btn"><li class="btn-setting"><i class="fa fa-cog"></i>编辑</li></ul>');
		}else{
			$(this).append('<ul class="block-btn"><li class="btn-setting"><i class="fa fa-cog"></i>修改</li></ul>');
		}
		var bockid = $(this).attr("blockid");
		var me = this;

		if($(me).parents().hasClass('blocklist')){
			$(me).find('.block-btn').append('<li class="btn-add">新增</li>');
		}
		$(".btn-setting").one('click',function(){

			console.log(bockid);
			if(typeof bockid != "undefined"){

				if($(me).hasClass('article')){
					if(!$(me).data('initblock')){
						$(me).data('initblock',true);
						$(me).addClass('editing');
						Widget.create(bockid,{el:me,mode:'none'},{articleid:$(me).attr('articleid'),saveCallback:$(me).attr('save-callback')});
						//以下settimeout优化contenditable
						setTimeout(function(){
							$(me).find('[field][contenteditable]').each(function() {
								// 干掉IE http之类地址自动加链接
								try {
									document.execCommand("AutoUrlDetect", false, false);
								} catch (e) {}

								$(this).one('paste', function(e) {
									e.preventDefault();
									var text = null;

									if(window.clipboardData && clipboardData.setData) {
										// IE
										text = window.clipboardData.getData('text');
									} else {
										text = (e.originalEvent || e).clipboardData.getData('text/plain') || prompt('在这里输入文本');
									}
									if (document.body.createTextRange) {
										if (document.selection) {
											textRange = document.selection.createRange();
											console.log(textRange);
										} else if (window.getSelection) {
											sel = window.getSelection();
											console.log(sel);
											var range = sel.getRangeAt(0);

											// 创建临时元素，使得TextRange可以移动到正确的位置
											var tempEl = document.createElement("span");
											tempEl.innerHTML = "&#FEFF;";
											range.deleteContents();
											range.insertNode(tempEl);
											textRange = document.body.createTextRange();
											textRange.moveToElementText(tempEl);
											tempEl.parentNode.removeChild(tempEl);
										}
										textRange.text = text;
										textRange.collapse(false);
										textRange.select();
									} else {
										// Chrome之类浏览器
										document.execCommand("insertText", false, text);
									}
								});
								// 去除Crtl+b/Ctrl+i/Ctrl+u等快捷键
								$(this).on('keydown', function(e) {
									// e.metaKey for mac
									if (e.ctrlKey || e.metaKey) {
										switch(e.keyCode){
											case 66: //ctrl+B or ctrl+b
											case 98:
											case 73: //ctrl+I or ctrl+i
											case 105:
											case 85: //ctrl+U or ctrl+u
											case 117: {
												e.preventDefault();
												break;
											}
										}
									}
								});
								// $(this).focus(function(){
								// 	console.log('focus');
								// 	var conhtml = $(this).text();
								// 	if(conhtml.indexOf('默认')>=0){
								// 		console.log("默认");
								// 		$(this).html("&nbsp;");
								// 	}else{
								// 		console.log('无默认');
								// 	}
                                //
								// })
							});
						},100)

					}
					return;
				}




				// if(bockid == "teacherOutstanding"){
				// 	bName = $(this).parent().attr("tagid");
				// 	console.log(bName);
				// }
				//if(bockid == "article"){
				//	artId = $(this).parent().attr("articleid");
				//	console.log(artId);
				//}
				$('.bs-example-modal-lg').one('show.bs.modal',function(ev){
					var me = this;
					if(typeof pageData != "undefined"){

						Widget.create(bockid,$(this).find('.modal-body'),{blockid:bockid,data:pageData},function(widget){
							$(me).on('save.bs.modal',widget.save);
							$('.bs-example-modal-lg').one('hide.bs.modal',function(ev){
								$(me).off('save.bs.modal',widget.save);
								Widget.destroy(bockid,widget.id);
							});
						});
					}else {
						Widget.create(bockid,$(this).find('.modal-body'),{blockid:bockid},function(widget){
							$(me).on('save.bs.modal',widget.save);
							$('.bs-example-modal-lg').one('hide.bs.modal',function(ev){
								$(me).off('save.bs.modal',widget.save);
								Widget.destroy(bockid,widget.id);
							});
						});
					}

				});
				$('.bs-example-modal-lg').modal();
			}else {
				///$('.bs-example-modal-lg').modal('toggle');
				$(this).trigger('block.setting');
			}
			/*
			 $('.Warehouse').one('show.bs.modal',function(ev){
			 var me = this;
			 var wareid = "wareHouseImg";
			 Widget.create(wareid,$(this).find('.modal-content'),{blockid:wareid,data:pageData},function(widget){
			 //$(me).on('save.bs.modal',widget.save);
			 //$('.bs-example-modal-lg').one('hide.bs.modal',function(ev){
			 //	$(me).off('save.bs.modal',widget.save);
			 //});
			 });
			 });*/
		})

	});

	$('body').on('mouseleave','.block',function(){
		if($(this).hasClass('editing')) return;
		$(this).css("border-color","transparent");
		$(this).find(".block-btn").remove();
	});

	$('.modal').delegate('.Warehouse-item','click',function(){
		$(this).css("border-color","#6F7A9F").siblings().css("border-color","transparent");
	});
	$('.modal .btn-save').on('click',function(ev){
		$(this).parents('.modal').trigger('save.bs.modal');
	});
	$('body').on('mouseenter','.blocklist',function (ev) {
		if($(this).find(".block").css("visibility")=="visible") return;
		if($(this).find(".block").length == 1 && $(this).find(".block").attr("articleid")==0){
			$(this).append('<div class="add-first"><span class="btn-add"><i class="fa fa-plus"></i>新增</span></div>');
			$('.btn-add').show();
		}
	});
	$('body').on('mouseleave','.blocklist',function (ev) {
		$('.add-first').remove();
	});
	$('body').on('click',".add-first .btn-add",function () {
		$(this).parent().hide();
	})
		// $(lme).append('<div class="blocklist-btn" style="width:80px;height: 100%;"><button type="button" data-toggle="tooltip" data-placement="bottom" title="点击新增一条记录"><i class="fa fa-plus"></i></button></div>')
		$(".blocklist").on("click",".btn-add",function(){
			var lme = $(this).parents('.blocklist');
			if($(lme).find(".block").attr("articleid") == "0"){
				//alert("请先修改默认内容，再添加新数据");
				var row = $(lme).find(".block:first");
				row.css('visibility','visible');
				var bockid = $(row).attr("blockid");
				if(!$(row).data('initblock')){
					$(row).data('initblock',true);
					$(row).addClass('editing');
					$(row).on('article-sync',function(ev,resp){
						$(row).attr("articleid",resp.new[0]._id);
					});
					Widget.create(bockid,{el:row,mode:'none'},{articleid:$(row).attr('articleid'),saveCallback:$(row).attr('save-callback')},function (widget) {
						widget.el.find('.btn-del').hide();
						var oldClose= widget.close;
						widget.close=function (cancel) {
							oldClose.call(widget,cancel);
							if(cancel){
								if($(row).siblings('.block').length==0){
									$(row).attr('articleid','0');
									$(row).css('visibility','hidden');
								}else $(row).remove();
							}
						}
					});
				}


			}else{
				$('body,html').animate({scrollTop:0},550);
				var row = $(lme).find(".block:first").clone(true);
				var bockid = $(row).attr("blockid");
				$(row).attr("articleid","0");
				$(row).find('[field]').each(function(i,n){
					if($(this).is('[date-field]')||$(this).find('img,[date-field]').length>0){
						$(this).find('img').attr('src','/index/images/default.jpg');
					}else{
						$(this).html("默认");
					}
				});
				$(row).find(".content").html("默认内容");
				$(lme).prepend(row);
				if(!$(row).data('initblock')){
					$(row).data('initblock',true);
					$(row).addClass('editing');
					$(row).on('article-sync',function(ev,resp){
						$(row).attr("articleid",resp.new[0]._id);
					});
					Widget.create(bockid,{el:row,mode:'none'},{articleid:$(row).attr('articleid'),saveCallback:$(row).attr('save-callback')},function (widget) {
						widget.el.find('.btn-del').hide();
						var oldClose= widget.close;
						widget.close=function (cancel) {
							oldClose.call(widget,cancel);
							if(cancel){
								if($(row).siblings('.block').length==0){
									$(row).attr('articleid','0');
									$(row).css('visibility','hidden');
								}else $(row).remove();
							}
						}

					});
				}
				setTimeout(function(){
					$(row).find('[contenteditable]').each(function() {
						$(this).focus(function(){
							console.log('focus');
							var conhtml = $(this).text();
							if(conhtml.indexOf('默认')>=0){
								console.log("默认");
								$(this).html("&nbsp;");
							}else{
								console.log('无默认');
							}
						})
					})
				},100)
			}

		})




	$('body').on('mouseenter','.block.editing',function (ev) {
		var isize = $(this).find("[field] img").attr('data-size');
		if(isize == undefined) isize = '暂无';
		if($(this).find(".media-imgvideo").length>0){
			$(this).find(".media-imgvideo").append('<div class="overlay"><div class="expand"><i class="fa fa-picture-o picture-btn"></i><i class="fa fa-video-camera video-btn"></i></div><p>图片尺寸：'+isize+'</p></div>');
		}else{
			$(this).find("[field] img").after('<div class="overlay"><span class="expand"><i class="fa fa-picture-o picture-btn"></i></span><p>图片尺寸：'+isize+'</p></div>');
		}
		var me=this;
		$(this).find('.picture-btn').on('click',function (ev) {
			ev.stopPropagation();
			ev.preventDefault();
			$(me).trigger('image.click',$(me).find('[field] img'));
		})
		$(this).find('.video-btn').on('click',function (ev) {
			ev.stopPropagation();
			ev.preventDefault();
			$(this).parents('.media-imgvideo').find('#promote-video').trigger('block.setting');
		})
	});
	$('body').on('mouseleave','.block.editing',function (ev) {
		$(this).find('.overlay').remove();
	});

	$('body').on('field.update','[date-field]',function (ev,date) {
		if($(this).is('[date-field]') || $(this).is('[date-field]') && $(this).find('.date-label').length>0){
			$(this).find('.month').html(moment(date).format('MM')+'月');
			$(this).find('.date-number').html(moment(date).format('DD'));
			$(this).parents('.block').find('.time').contents().last()[0].textContent = moment(date).format('hh:mma');
			//$(this).parents('.event-item').find('.time').contents().last().prop('textContent',moment(date).format('hh:mma'));
		}
	});



});


