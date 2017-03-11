(function(){
	var templateCache = {};
	window['Widget']=(function(){
		var index = 0;
		var instances = {};
		var widgetPath = '/index/widgets/';

		return {
			create:function(name,el,params,callback){
				var renderMode = 'overwrite';
				if($.isPlainObject(el)){
					if(el.mode) renderMode = el.mode;
					el = el.el;
				}
				if(typeof params == 'function'){
					callback=params;
					params = null;
				}
				params=params||{};

				var process = function(data){
					var script ='';
					var templates=[];
					templates.params={};
					var templateReg = /<template([^>]*)>([\s\S]+?)<\/template>/gi;
					var t;
					while(( t = templateReg.exec(data))!=null){
						templates.push(t[2]);
						var tplparams={};
						$(t[1].split(/\s+/)).each(function(i,n){
							if(n.trim().length>0){
								var kv = $.trim(n).split('=');
								tplparams[kv[0]]=(kv[1]||true).replace(/(^['"])|(['"]$)/gi, '');
								if(kv[0]=='id'){

									templates[tplparams[kv[0]]] = t[2];
									templates.params[tplparams[kv[0]]]=tplparams;
								}
							}
						});
						templates.params[templates.length-1] = tplparams;
					}

					var  temp = data.match(/<script([^>]*)>([\s\S]*)<\/script>/);
					if(temp) script = temp[2];
					if(el && renderMode=='overwrite' && templates.length>0) $(el).html(ejs.render(templates[0],params));
					var o = {exports:{}};
					if(script.length>0){
						eval('(function(module){'+script+'})(o);');
						if(o.exports){
							if(typeof o.exports == 'function') o.exports = o.exports();
							if(typeof o.exports.init == 'function') o.exports.init(el,params);
						}
					}
					if(typeof instances[name] =='undefined') instances[name] = {};

					o.exports.el = el;
					o.exports.index = index;
					o.exports.widgetId = name;

					instances[name][index++] =  o.exports;

					if(typeof callback == 'function') callback(o.exports);
				};
				var path= widgetPath+name+'.html';
				if(templateCache[path]){
					process(templateCache[path]);
				}else{
					$.get(widgetPath+name+'.html',function(data){
						templateCache[path] = data;
						process(data)
					});
				}
			},
			destroy:function(name,instanceIndex){
				var widget = instances[name][instanceIndex];
				if(!widget) return;
				delete instances[name][instanceIndex];
				if(typeof widget.destroy=='function') widget.destroy();

			},
			renderFile:function(templateFile,data,el,callback){
				var process = function(resp){
					templateCache[templateFile];
					var result = ejs.render(resp,data);
					if(typeof el=='function') el(result);
					else $(el).html(result);
					if(typeof callback=='function') callback();
				};
				if(templateCache[templateFile]) process(templateCache[templateFile]);
				else $.get(templateFile,process);

			}
		}
	})();
})();