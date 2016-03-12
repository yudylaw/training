;!window['qcVideo']&&(function(global){var ns={modules:{},instances:{}},waiter={};function getMappingArgs(fn){var args=fn.toString().split('{')[0].replace(/\s|function|\(|\)/g,'').split(','),i=0;if(!args[0]){args=[];}
while(args[i]){args[i]=require(args[i]);i+=1;}
return args;}
function newInst(key,ifExist){if((ifExist?ns.instances[key]:!ns.instances[key])&&ns.modules[key]){ns.instances[key]=ns.modules[key].apply(window,getMappingArgs(ns.modules[key]));}}
function require(key){newInst(key,false);return ns.instances[key]||{};}
function loadJs(url){var el=document.createElement('script');el.setAttribute('type','text/javascript');el.setAttribute('src',url);el.setAttribute('async',true);document.getElementsByTagName("head")[0].appendChild(el);}
function core(key,target){if(!ns.modules[key]){ns.modules[key]=target;newInst(key,true);if(!!waiter[key]){var i=0;while(waiter[key][i]){waiter[key][i](require(key));i+=1;}
delete waiter[key];}}}
core.use=function(key,cb){cb=cb||function(){};if(ns.modules[key]){cb(require(key));}else{var config=require('config');if(config[key]){if(!waiter[key]){waiter[key]=[];loadJs(config[key]);}
waiter[key].push(cb);}}};core.get=function(key){return require(key);};core.loadJs=loadJs;global.qcVideo=core;})(window);;qcVideo('Base',function(util){var unique='base_'+(+new Date()),global=window,uuid=1,Base=function(){},debug=true,realConsole=global.console,console=realConsole||{},wrap=function(fn){return function(){if(debug){try{fn.apply(realConsole,[this.__get_class_info__()].concat(arguments));}catch(xe){}}}};Base.prototype.__get_class_info__=function(){var now=new Date();return now.getHours()+':'+now.getMinutes()+':'+now.getSeconds()+'>'+(this['className']||'BASE')+'>';};Base.setDebug=function(open){debug=!!open;};Base.filter_error=function(fn,name){if(util.type(fn)!='function'){return fn;}
return function(){try{return fn.apply(this,arguments);}catch(xe){var rep=qcVideo.get('BJ_REPORT');if(rep&&rep.push){if(xe.stack){xe.stack=(this.className||'')+'-'+(name||'constructor')+' '+xe.stack;}
rep.push(xe);}
throw new Error(xe.message||'');}};};Base.prototype.loop=Base.loop=function(){};Base.extend=function(protoProps,staticProps){protoProps=protoProps||{};var constructor=protoProps.hasOwnProperty('constructor')?protoProps.constructor:function(){return sup.apply(this,arguments);};constructor=Base.filter_error(constructor);var sup=this,kk;var Fn=function(){this.constructor=constructor;};if(protoProps){for(kk in protoProps){protoProps[kk]=Base.filter_error(protoProps[kk],kk);}}
Fn.prototype=sup.prototype;constructor.prototype=new Fn();util.merge(constructor.prototype,protoProps);util.merge(constructor,sup,true);util.merge(constructor,staticProps);util.merge(constructor,{__super__:sup.prototype});return constructor;};Base.prototype.log=wrap(console.log||Base.loop);Base.prototype.debug=wrap(console.debug||Base.loop);Base.prototype.error=wrap(console.error||Base.loop);Base.prototype.info=wrap(console.info||Base.loop);var eventCache={};var getUniqueId=function(){return this.__id||(this.__id=unique+(++uuid));};var initEvent=function(ctx,event){var id=getUniqueId.call(ctx);if(!eventCache.hasOwnProperty(id)){eventCache[id]={};}
if(event){if(!eventCache[id][event]){eventCache[id][event]=[];}}};Base.prototype.on=function(ctx,event,fn){initEvent(ctx,event);eventCache[getUniqueId.call(ctx)][event].push(fn);};Base.prototype.batchOn=function(ctx,ary){for(var i=0,j=ary.length;i<j;i++){this.on(ctx,ary[i]['event'],ary[i]['fn'])}};Base.prototype.fire=function(event,opt){var cache=eventCache[getUniqueId.call(this)];if(cache&&cache[event]){util.each(cache[event],function(fn){fn.call(global,opt);});}};Base.prototype.off=function(ctx,event,fn){initEvent(ctx);var find=-1,list=eventCache[getUniqueId.call(ctx)][event];util.each(list,function(handler,index){if(handler===fn){find=index;return false;}});if(find!==-1){list.splice(find,1);}};Base.instance=function(opt,staticOpt){return new(Base.extend(opt,staticOpt))();};return Base;});;qcVideo('tlsPwd',function(){function Now(){return+new Date();}
function addTlsScript(){var a=document.createElement('script');a.src='https://tls.qcloud.com/libs/encrypt.min.js';document.body.insertBefore(a,document.body.childNodes[0]);}
function getSigPwd(){try{return Encrypt.getRSAH1();}catch(e){}
return'';}
var getSigPwdStartTime;function fetchSigPwd(cb,start){var now=Now();if(start){getSigPwdStartTime=now;addTlsScript();}else{if(now-getSigPwdStartTime>5000){cb(null,'timeout');return;}}
var pwd=getSigPwd();if(pwd&&pwd.length>0){cb(pwd);}else{setTimeout(function(){fetchSigPwd(cb);},1000);}}
return function(cb){fetchSigPwd(function(pwd){cb(pwd);},true);};});;qcVideo('touristTlsLogin',function(tlsPwd){var global=window;function askJsonp(src){var a=document.createElement('script');a.src=src;document.body.insertBefore(a,document.body.childNodes[0]);}
function tlsGetUserSig_JsonPCallback(info){info=info||{};var ErrorCode=info['ErrorCode'];clear_jsonP();if(ErrorCode==0){_info['userSig']=info['UserSig'];_info.done(_info);}else{_info.done(null,ErrorCode);}}
function clear_jsonP(){global.tlsAnoLogin=null;global.tlsGetUserSig=null;}
function tlsAnoLogin_JsonPCallback(info){info=info||{};var ErrorCode=info['ErrorCode'];if(ErrorCode==0){_info['identifier']=info['Identifier'];_info['TmpSig']=info['TmpSig'];global.tlsGetUserSig=tlsGetUserSig_JsonPCallback;askJsonp('https://tls.qcloud.com/getusersig?tmpsig='+_info.TmpSig+'&identifier='+encodeURIComponent(_info.identifier)+'&accounttype='+_info['accountType']+'&sdkappid='+_info['sdkAppID']);}else{clear_jsonP();_info.done(null,ErrorCode);}}
var _info={};return function(sdkappid,accounttype,cb){_info={sdkAppID:sdkappid,appIDAt3rd:sdkappid,accountType:accounttype,identifier:'',userSig:'',done:cb};clear_jsonP();tlsPwd(function(pwd,error){if(error){_info.done(null,error);}
askJsonp('https://tls.qcloud.com/anologin?sdkappid='+_info['sdkAppID']+'&accounttype='+_info['accountType']+'&url=&passwd='+pwd);global.tlsAnoLogin=tlsAnoLogin_JsonPCallback;});};});;qcVideo('api',function(){var now=function(){return+new Date();},uuid=0,global=window,unique='qcvideo_'+now(),overTime=10000;var request=function(address,cbName,cb){return function(){global[cbName]=function(data){cb(data);delete global[cbName];};setTimeout(function(){if(typeof global[cbName]!=="undefined"){delete global[cbName];cb({'retcode':10000,'errmsg':'请求超时'});}},overTime);qcVideo.loadJs(address+(address.indexOf('?')>0?'&':'?')+'callback='+cbName);}};var hiSender=function(){var img=new Image();return function(src){img.onload=img.onerror=img.onabort=function(){img.onload=img.onerror=img.onabort=null;img=null;};img.src=src;};};var apdTime=function(url){return url+(url.indexOf('?')>0?'&':'?')+'_='+now();};return{request:function(address,cb){var cbName=unique+'_callback'+(++uuid);request(apdTime(address),cbName,cb)();},report:function(address){hiSender()(apdTime(address));}};});qcVideo('BJ_REPORT',function(){return(function(global){if(global.BJ_REPORT)return global.BJ_REPORT;var _error=[];var _config={id:0,uin:0,url:"",combo:1,ext:{},level:4,ignore:[],random:1,delay:1000,submit:null};var _isOBJByType=function(o,type){return Object.prototype.toString.call(o)==="[object "+(type||"Object")+"]";};var _isOBJ=function(obj){var type=typeof obj;return type==="object"&&!!obj;};var _isEmpty=function(obj){if(obj===null)return true;if(_isOBJByType(obj,'Number')){return false;}
return!obj;};var orgError=global.onerror;var _processError=function(errObj){try{if(errObj.stack){var url=errObj.stack.match("https?://[^\n]+");url=url?url[0]:"";var rowCols=url.match(":(\\d+):(\\d+)");if(!rowCols){rowCols=[0,0,0];}
var stack=_processStackMsg(errObj);return{msg:stack,rowNum:rowCols[1],colNum:rowCols[2],target:url.replace(rowCols[0],"")};}else{return errObj;}}catch(err){return errObj;}};var _processStackMsg=function(error){var stack=error.stack.replace(/\n/gi,"").split(/\bat\b/).slice(0,5).join("@").replace(/\?[^:]+/gi,"");var msg=error.toString();if(stack.indexOf(msg)<0){stack=msg+"@"+stack;}
return stack;};var _error_tostring=function(error,index){var param=[];var params=[];var stringify=[];if(_isOBJ(error)){error.level=error.level||_config.level;for(var key in error){var value=error[key];if(!_isEmpty(value)){if(_isOBJ(value)){try{value=JSON.stringify(value);}catch(err){value="[BJ_REPORT detect value stringify error] "+err.toString();}}
stringify.push(key+":"+value);param.push(key+"="+encodeURIComponent(value));params.push(key+"["+index+"]="+encodeURIComponent(value));}}}
return[params.join("&"),stringify.join(","),param.join("&")];};var _imgs=[];var _submit=function(url){if(_config.submit){_config.submit(url);}else{var _img=new Image();_imgs.push(_img);_img.src=url;}};var error_list=[];var comboTimeout=0;var _send=function(isReoprtNow){if(!_config.report)return;while(_error.length){var isIgnore=false;var error=_error.shift();var error_str=_error_tostring(error,error_list.length);if(_isOBJByType(_config.ignore,"Array")){for(var i=0,l=_config.ignore.length;i<l;i++){var rule=_config.ignore[i];if((_isOBJByType(rule,"RegExp")&&rule.test(error_str[1]))||(_isOBJByType(rule,"Function")&&rule(error,error_str[1]))){isIgnore=true;break;}}}
if(!isIgnore){if(_config.combo){error_list.push(error_str[0]);}else{_submit(_config.report+error_str[2]+"&_t="+(+new Date));}
_config.onReport&&(_config.onReport(_config.id,error));}}
var count=error_list.length;if(count){var comboReport=function(){clearTimeout(comboTimeout);_submit(_config.report+error_list.join("&")+"&count="+count+"&_t="+(+new Date));comboTimeout=0;error_list=[];};if(isReoprtNow){comboReport();}else if(!comboTimeout){comboTimeout=setTimeout(comboReport,_config.delay);}}};var report={push:function(msg){if(Math.random()>=_config.random){return report;}
_error.push(_isOBJ(msg)?_processError(msg):{msg:msg});_send();return report;},report:function(msg){msg&&report.push(msg);_send(true);return report;},info:function(msg){if(!msg){return report;}
if(_isOBJ(msg)){msg.level=2;}else{msg={msg:msg,level:2};}
report.push(msg);return report;},debug:function(msg){if(!msg){return report;}
if(_isOBJ(msg)){msg.level=1;}else{msg={msg:msg,level:1};}
report.push(msg);return report;},init:function(config){if(_isOBJ(config)){for(var key in config){_config[key]=config[key];}}
var id=parseInt(_config.id,10);if(id){_config.report=(_config.url||"//badjs2.qq.com/badjs")+"?id="+id+"&uin="+parseInt(_config.uin||(document.cookie.match(/\buin=\D+(\d+)/)||[])[1],10)+"&from="+encodeURIComponent(location.href)+"&ext="+JSON.stringify(_config.ext)+"&";}
return report;},__onerror__:global.onerror};typeof console!=="undefined"&&console.error&&setTimeout(function(){var err=((location.hash||'').match(/([#&])BJ_ERROR=([^&$]+)/)||[])[2];err&&console.error("BJ_ERROR",decodeURIComponent(err).replace(/(:\d+:\d+)\s*/g,'$1\n'));},0);return report;}(window));});qcVideo('css',function(){var css={};if(document.defaultView&&document.defaultView.getComputedStyle){css.getComputedStyle=function(a,b){var c,d,e;b=b.replace(/([A-Z]|^ms)/g,"-$1").toLowerCase();if((d=a.ownerDocument.defaultView)&&(e=d.getComputedStyle(a,null))){c=e.getPropertyValue(b)}
return c}}else if(document.documentElement.currentStyle){css.getComputedStyle=function(a,b){var c,d=a.currentStyle&&a.currentStyle[b],e=a.style;if(d===null&&e&&(c=e[b])){d=c}
return d}}
return{getWidth:function(e){return(css.getComputedStyle(e,'width')||"").toLowerCase().replace('px','')|0;},getHeight:function(e){return(css.getComputedStyle(e,'height')||"").toLowerCase().replace('px','')|0;},textAlign:function(e){e.style['text-align']='center';},getVisibleHeight:function(){var doc=document;var docE=doc.documentElement;var body=doc.body;return(docE&&docE.clientHeight)||(body&&body.offsetHeight)||window.innerHeight||0;},getVisibleWidth:function(){var doc=document;var docE=doc.documentElement;var body=doc.body;return(docE&&docE.clientWidth)||(body&&body.offsetWidth)||window.innerWidth||0;}};});;qcVideo('interval',function(){var git,stack={},length=0,gTime=16,uuid=0;function each(cb){for(var key in stack){if(false===cb.call(stack[key])){return;}}}
function tick(){var now=+new Date();each(function(){var me=this;!me.__time&&(me.__time=now);if(me.__time+me._ftp<=now&&me.status===1){me.__time=now;me._cb.call();}});}
function stop(){var start=0;each(function(){this.status===1&&(start+=1);});if(start===0||length===0){clearInterval(git);git=null;}}
function _start(){this.status=1;!git&&(git=setInterval(tick,gTime));}
function _pause(){this.status=0;this.__time=+new Date();stop();}
function _clear(){delete stack[this._id];length-=1;stop();}
return function(callback,time){length+=1;uuid+=1;return stack[uuid]={_id:uuid,_cb:callback,_ftp:time||gTime,start:_start,pause:_pause,clear:_clear};};})
if(typeof JSON!=='object'){JSON={};}
(function(){'use strict';function f(n){return n<10?'0'+n:n;}
if(typeof Date.prototype.toJSON!=='function'){Date.prototype.toJSON=function(){return isFinite(this.valueOf())?this.getUTCFullYear()+'-'+
f(this.getUTCMonth()+1)+'-'+
f(this.getUTCDate())+'T'+
f(this.getUTCHours())+':'+
f(this.getUTCMinutes())+':'+
f(this.getUTCSeconds())+'Z':null;};String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(){return this.valueOf();};}
var cx,escapable,gap,indent,meta,rep;function quote(string){escapable.lastIndex=0;return escapable.test(string)?'"'+string.replace(escapable,function(a){var c=meta[a];return typeof c==='string'?c:'\\u'+('0000'+a.charCodeAt(0).toString(16)).slice(-4);})+'"':'"'+string+'"';}
function str(key,holder){var i,k,v,length,mind=gap,partial,value=holder[key];if(value&&typeof value==='object'&&typeof value.toJSON==='function'){value=value.toJSON(key);}
if(typeof rep==='function'){value=rep.call(holder,key,value);}
switch(typeof value){case'string':return quote(value);case'number':return isFinite(value)?String(value):'null';case'boolean':case'null':return String(value);case'object':if(!value){return'null';}
gap+=indent;partial=[];if(Object.prototype.toString.apply(value)==='[object Array]'){length=value.length;for(i=0;i<length;i+=1){partial[i]=str(i,value)||'null';}
v=partial.length===0?'[]':gap?'[\n'+gap+partial.join(',\n'+gap)+'\n'+mind+']':'['+partial.join(',')+']';gap=mind;return v;}
if(rep&&typeof rep==='object'){length=rep.length;for(i=0;i<length;i+=1){if(typeof rep[i]==='string'){k=rep[i];v=str(k,value);if(v){partial.push(quote(k)+(gap?': ':':')+v);}}}}else{for(k in value){if(Object.prototype.hasOwnProperty.call(value,k)){v=str(k,value);if(v){partial.push(quote(k)+(gap?': ':':')+v);}}}}
v=partial.length===0?'{}':gap?'{\n'+gap+partial.join(',\n'+gap)+'\n'+mind+'}':'{'+partial.join(',')+'}';gap=mind;return v;}}
if(typeof JSON.stringify!=='function'){escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;meta={'\b':'\\b','\t':'\\t','\n':'\\n','\f':'\\f','\r':'\\r','"':'\\"','\\':'\\\\'};JSON.stringify=function(value,replacer,space){var i;gap='';indent='';if(typeof space==='number'){for(i=0;i<space;i+=1){indent+=' ';}}else if(typeof space==='string'){indent=space;}
rep=replacer;if(replacer&&typeof replacer!=='function'&&(typeof replacer!=='object'||typeof replacer.length!=='number')){throw new Error('JSON.stringify');}
return str('',{'':value});};}
if(typeof JSON.parse!=='function'){cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;JSON.parse=function(text,reviver){var j;function walk(holder,key){var k,v,value=holder[key];if(value&&typeof value==='object'){for(k in value){if(Object.prototype.hasOwnProperty.call(value,k)){v=walk(value,k);if(v!==undefined){value[k]=v;}else{delete value[k];}}}}
return reviver.call(holder,key,value);}
text=String(text);cx.lastIndex=0;if(cx.test(text)){text=text.replace(cx,function(a){return'\\u'+
('0000'+a.charCodeAt(0).toString(16)).slice(-4);});}
if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,'@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,']').replace(/(?:^|:|,)(?:\s*\[)+/g,''))){j=eval('('+text+')');return typeof reviver==='function'?walk({'':j},''):j;}
throw new SyntaxError('JSON.parse');};}}());qcVideo('JSON',function(){return JSON;});;qcVideo('LinkIm',function(Base,touristTlsLogin){return Base.extend({className:'LinkIm',checkLoginStatus:function(uniqueImVal){var s=this.link.checkLoginBarrage(uniqueImVal);return s!='0'?s:'uninit';},destroy:function(){delete this.link;delete this.im;},constructor:function(link,im,uniqueImVal,done,fail){var self=this;self.link=link;self.im=im;var roll=function(){var status=self.checkLoginStatus(uniqueImVal);if(status=='uninit'){setTimeout(roll,1000);}else{if(status=='fail'){touristTlsLogin(self.im['sdkAppID'],self.im['accountType'],function(info,error){if(!error){info['groupId']=self.im['groupId'];info['nickName']=self.im['nickName'];info['appId']=uniqueImVal;delete info.done;delete info.TmpSig;self.link.loginBarrage(info);done&&done();}else{fail&&fail('tlsLogin:'+error);}});}else{self.link.loginBarrage({'appId':uniqueImVal,'groupId':self.im['groupId'],'nickName':self.im['nickName']});done&&done();}}};roll();}});});;qcVideo('lStore',function(){var win=window,doc=win.document,localStorageName='localStorage',globalStorageName='globalStorage',storage,get,set,remove,clear,key_prefix='qc_video_love_',ok=false;set=get=remove=clear=function(){};try{if(localStorageName in win&&win[localStorageName]){storage=win[localStorageName];set=function(key,val){storage.setItem(key,val)};get=function(key){return storage.getItem(key)};remove=function(key){storage.removeItem(key)};clear=function(){storage.clear()};ok=true;}}
catch(e){}
try{if(!ok&&globalStorageName in win&&win[globalStorageName]){storage=win[globalStorageName][win.location.hostname];set=function(key,val){storage[key]=val};get=function(key){return storage[key]&&storage[key].value};remove=function(key){delete storage[key]};clear=function(){for(var key in storage){delete storage[key]}};ok=true;}}
catch(e){}
if(!ok&&doc.documentElement.addBehavior){function getStorage(){if(storage){return storage}
storage=doc.body.appendChild(doc.createElement('div'));storage.style.display='none';storage.setAttribute('data-store-js','');storage.addBehavior('#default#userData');storage.load(localStorageName);return storage;}
set=function(key,val){try{var storage=getStorage();storage.setAttribute(key,val);storage.save(localStorageName);}
catch(e){}};get=function(key){try{var storage=getStorage();return storage.getAttribute(key);}
catch(e){return'';}};remove=function(key){try{var storage=getStorage();storage.removeAttribute(key);storage.save(localStorageName);}
catch(e){}};clear=function(){try{var storage=getStorage();var attributes=storage.XMLDocument.documentElement.attributes;storage.load(localStorageName);for(var i=0,attr;attr=attributes[i];i++){storage.removeAttribute(attr.name);}
storage.save(localStorageName);}
catch(e){}}}
return{get:function(key){return get(key_prefix+key);},set:function(key,val){set(key_prefix+key,val);},remove:function(key){remove(key_prefix+key);},clear:clear};});;qcVideo('util',function(){var util={paramsToObject:function(link){var result={},pairs,pair,query,key,value;query=link||'';query=query.replace('?','');pairs=query.split('&');for(var i=0,j=pairs.length;i<j;i++){var keyVal=pairs[i];pair=keyVal.split('=');key=pair[0];value=pair.slice(1).join('=');result[decodeURIComponent(key)]=decodeURIComponent(value);}
return result;},each:function(opt,cb){var key=0,i,j;if(this.isArray(opt)){for(i=0,j=opt.length;i<j;i++){if(false===cb.call(opt[i],opt[i],i)){break;}}}else if(this.isPlainObject(opt)){for(key in opt){if(false===cb.call(opt[key],opt[key],key)){break;}}}}};var toString=Object.prototype.toString,hasOwn=Object.prototype.hasOwnProperty,class2type={'[object Boolean]':'boolean','[object Number]':'number','[object String]':'string','[object Function]':'function','[object Array]':'array','[object Date]':'date','[object RegExp]':'regExp','[object Object]':'object'},isWindow=function(obj){return obj&&typeof obj==="object"&&"setInterval"in obj;};util.type=function(obj){return obj==null?String(obj):class2type[toString.call(obj)]||"object";};util.isArray=Array.isArray||function(obj){return util.type(obj)==="array";};util.isPlainObject=function(obj){if(!obj||util.type(obj)!=="object"||obj.nodeType||isWindow(obj)){return false;}
if(obj.constructor&&!hasOwn.call(obj,"constructor")&&!hasOwn.call(obj.constructor.prototype,"isPrototypeOf")){return false;}
var key;for(key in obj){}
return key===undefined||hasOwn.call(obj,key);};util.merge=function(tar,sou,deep){var name,src,copy,clone,copyIsArray;for(name in sou){src=tar[name];copy=sou[name];if(tar!==copy){if(deep&&copy&&(util.isPlainObject(copy)||(copyIsArray=util.isArray(copy)))){if(copyIsArray){copyIsArray=false;clone=src&&util.isArray(src)?src:[];}else{clone=src&&util.isPlainObject(src)?src:{};}
tar[name]=util.merge(clone,copy,deep);}else if(copy!==undefined){tar[name]=copy;}}}
return tar;};util.capitalize=function(str){str=str||'';return str.charAt(0).toUpperCase()+str.slice(1);};util.convertTime=function(s){s=s|0;var h=3600,m=60;var hours=(s/h)|0;var minutes=(s-hours*h)/m|0;var sec=s-hours*h-minutes*m;hours=hours>0?(hours+':'):'';minutes=minutes>0?(minutes+':'):(hours>0?'00:':'');sec=sec>0?(sec+''):(hours.length>0||minutes.length>0?'00':'00:00:00');hours=hours.length==2?('0'+hours):hours;minutes=minutes.length==2?('0'+minutes):minutes;sec=sec.length==1?('0'+sec):sec;return hours+minutes+sec};util.fix2=function(num){return num.toFixed(2)-0;};util.fileType=function(src){if(src.indexOf('.mp4')>0){return'mp4'}
if(src.indexOf('.m3u8')>0){return'hls';}};util.loadImg=function(url,ready){var onReady,width,height,newWidth,newHeight,img=new Image();img.src=url;if(img.complete){ready.call(img);return;}
width=img.width;height=img.height;img.onerror=function(){onReady.end=true;img=img.onload=img.onerror=null;};onReady=function(){newWidth=img.width;newHeight=img.height;if(newWidth!==width||newHeight!==height||newWidth*newHeight>1024){ready.call(img);onReady.end=true;}};onReady();img.onload=function(){!onReady.end&&onReady();img=img.onload=img.onerror=null;};};util.resize=function(max,sou){var sRate=sou.width/sou.height;if(max.width<sou.width){sou.width=max.width;sou.height=sou.width/sRate;}
if(max.height<sou.height){sou.height=max.height;sou.width=sou.height*sRate;}
return sou;};return util;});;qcVideo('version',function(){var agent=navigator.userAgent;var v={IOS:!!agent.match(/iP(od|hone|ad)/i),ANDROID:!!(/Android/i).test(agent)};var dom=document.createElement("video"),h5Able={'probably':1,'maybe':1};dom=dom.canPlayType?dom:null;v.IS_MAC=window.navigator&&navigator.appVersion&&navigator.appVersion.indexOf("Mac")>-1;v.ABLE_H5_MP4=dom&&(dom.canPlayType("video/mp4")in h5Able);v.ABLE_H5_WEBM=dom&&(dom.canPlayType("video/webm")in h5Able);v.ABLE_H5_HLS=dom&&(dom.canPlayType("application/x-mpegURL")in h5Able);v.IS_MOBILE=v.IOS||v.ANDROID;v.ABLE_H5_APPLE_HLS=dom&&(dom.canPlayType("application/vnd.apple.mpegURL")in h5Able);v.FLASH_VERSION=-1;v.IS_IE=("ActiveXObject"in window);v.ABLE_FLASH=(function(){var swf;if(document.all)
try{swf=new ActiveXObject("ShockwaveFlash.ShockwaveFlash");if(swf){v.FLASH_VERSION=parseInt(swf.GetVariable("$version").split(" ")[1].split(",")[0]);return!0;}}catch(e){return!1;}
else
try{if(navigator.plugins&&navigator.plugins.length>0){swf=navigator.plugins["Shockwave Flash"];if(swf){var words=swf.description.split(" ");for(var i=0;i<words.length;++i){if(isNaN(parseInt(words[i])))continue;v.FLASH_VERSION=parseInt(words[i]);}
return!0;}}}catch(e){return!1;}
return!1;})();v.getFlashAble=function(){return v.ABLE_FLASH?(v.FLASH_VERSION<=10?'lowVersion':'able'):'';};var ableHlsJs=window.MediaSource&&window.MediaSource.isTypeSupported('video/mp4; codecs="avc1.42E01E,mp4a.40.2"')?true:false;if(v.ANDROID&&!v.ABLE_H5_HLS){if(agent.substr(agent.indexOf('Android')+8,1)>=4){}}
v.REQUIRE_HLS_JS=ableHlsJs&&!v.ABLE_H5_HLS&&!v.ABLE_H5_APPLE_HLS;v.getLivePriority=function(){if(v.IOS||v.ANDROID){return'h5';}
if(!v.ABLE_FLASH&&v.ABLE_H5_MP4){return'h5';}
return v.ABLE_FLASH?'flash':v.ABLE_H5_MP4?'h5':'';};v.getVodPriority=function(inWhiteAppId){if(v.IOS||v.ANDROID){return'h5';}
if(!v.ABLE_FLASH&&v.ABLE_H5_MP4){return'h5';}
return v.ABLE_FLASH?'flash':v.ABLE_H5_MP4?'h5':'';};v.PROTOCOL=(function(){try{var href=window.location.href;if(href.indexOf('https')===0){return'https';}}catch(xe){}
return'http';})();return v;});;qcVideo('config',function(version){var h5=version.PROTOCOL+'://imgcache.qq.com/open/qcloud/video/h5';var flash=version.PROTOCOL+'://imgcache.qq.com/open/qcloud/video/flash';return{'$':h5+'/zepto-v1.1.3.min.js?max_age=20000000','h5player':h5+'/h5player.js','flash':flash+'/video_player.swf?max_age=1800','Hls':h5+'/hls.release.js?max_age=20000000','h5css':h5+'/video.css?ver=0531&max_age=20000000',set:function(key,url){this[key]=url;}};});;qcVideo('constants',function(){return{SERVER_API:"http://play.video.qcloud.com/index.php",SERVER_API_PARAMS:{"file_id":1,"app_id":1,"player_id":1,"refer":1},TDBANK_REPORT_API:"http://tudg.qq.com/dataimport/ImportService",OK_CODE:'0',ERROR_CODE:{TIME_OUT:'10000',REQUIRE_PWD:'11046',ERROR_PW:'1003',REQUIRE_APP_ID:'11044',ERROR_APP_ID:'10008',REQUIRE_FID:'11045',ERROR_FID:'10008'},ERROR_MSG:{'10000':'\u8bf7\u6c42\u8d85\u65f6%2c\u8bf7\u68c0\u67e5\u7f51\u7edc\u8bbe\u7f6e','11046':'\u5bc6\u7801\u9519\u8bef\uff0c\u8bf7\u91cd\u65b0\u8f93\u5165','1003':'\u5bc6\u7801\u9519\u8bef\uff0c\u8bf7\u91cd\u65b0\u8f93\u5165','10008':'\u89c6\u9891\u6e90\u4e0d\u5b58\u5728'},DEFINITION_PRIORITY:{0:[210,10],1:[220,20],2:[230,30],4:[240,40]},JUST_MP4_DEFINITION_PRIORITY:{0:[10],1:[20],2:[30],4:[40]},ONLY_MP4_NO_TRANS:{0:[],1:[],2:[0],4:[]},RESOLUTION_PRIORITY:[2,1,0,4],DEFINITION_NAME:{0:'\u624b\u673a',1:'\u6807\u6e05',2:'\u9ad8\u6e05',4:'\u8d85\u6e05'},DEFINITION_NAME_NO:{0:1,1:2,2:3,4:4},DEFINITION_NO_NAME:{1:0,2:1,3:2,4:4},LOGO_LOCATION:{L_U:'0',L_D:'1',R_U:'2',R_D:'3'},PATCH_TYPE:{IMAGE:'0',MOVE:'1'},PATCH_LOC:{START:'0',PAUSE:'1',END:'2'},TAP:'tap',CLICK:'click',MP4:'mp4',HLS:'hls',FLV:'flv',UNICODE_WORD:{PLAY:'\u64ad\u653e',PAUSE:'\u6682\u505c',MUTE:'\u9759\u97f3',VOLUME:'\u97f3\u91cf',FULL_SCREEN:'\u5168\u5c4f',EXIT_FULL_SCREEN:'\u9000\u51fa\u5168\u5c4f',TIP_OPR_VOLUME:'\u6216\u7528\u952e\u76d8\u2191\u0020\u952e\u76d8\u2193',SETTING:'\u8bbe\u7f6e',TIP_REQUIRE_FLASH:'\u5f53\u524d\u6d4f\u89c8\u5668\u4e0d\u80fd\u652f\u6301\u89c6\u9891\u64ad\u653e\uff0c\u53ef\u4e0b\u8f7d\u6700\u65b0\u7684\u0051\u0051\u6d4f\u89c8\u5668\u6216\u8005\u5b89\u88c5\u0046\u004c\u0041\u0053\u0048\u5373\u53ef\u64ad\u653e',TIP_UPDATE_FLASH:'\u5f53\u524d\u6d4f\u89c8\u5668\u0066\u006c\u0061\u0073\u0068\u7248\u672c\u8fc7\u4f4e\uff0c\u53ef\u4e0b\u8f7d\u6700\u65b0\u7684\u0046\u004c\u0041\u0053\u0048\u7248\u672c\u8fdb\u884c\u64ad\u653e',TIP_CLICK_UPDATE_FLASH:'\u70b9\u51fb\u66f4\u65b0'},FIRE:'FIRE',EVENT:{OS_TIME_UPDATE:'OS_TIME_UPDATE',OS_PLAYING:'OS_PLAYING',OS_SEEKING:'OS_SEEKING',OS_PROGRESS:'OS_PROGRESS',OS_LOADED_META_DATA:'OS_LOADED_META_DATA',OS_PLAYER_END:'OS_PLAYER_END',OS_VIDEO_LOADING:'OS_VIDEO_LOADING',OS_ERROR:'OS_ERROR',OS_BLOCK:'OS_BLOCK',OS_PAUSE:'OS_PAUSE',OS_VOLUME_CHANGE:'OS_VOLUME_CHANGE',OS_RESIZE:'OS_RESIZE',OS_LAND_SCAPE_UI:'OS_LAND_SCAPE_UI',OS_PORTRAIT_UI:'OS_PORTRAIT_UI',UI_PAUSE:'UI_PAUSE',UI_PLAY:'UI_PLAY',UI_FULL_SCREEN:'UI_FULL_SCREEN',UI_QUIT_FULL_SCREEN:'UI_QUIT_FULL_SCREEN',UI_SET_PROGRESS:'UI_SET_PROGRESS',UI_SET_VOLUME:'UI_SET_VOLUME',UI_DRAG_PLAY:'UI_DRAG_PLAY',UI_PLUS_PLAY:'UI_PLUS_PLAY',UI_MINUS_PLAY:'UI_MINUS_PLAY',UI_SIMULATION_POSITION:'UI_SIMULATION_POSITION',UI_OPEN_SETTING:'UI_OPEN_SETTING',UI_CHOSE_DEFINITION:'UI_CHOSE_DEFINITION'},BAD_JS_REPORT_WHITE_APP_IDS:{"1251132611":1,"1251438353":1,"1251768344":1,"1251536981":1}};});;qcVideo('Error',function(){return{NET_ERROR:'\u0045\u0072\u0072\u006f\u0072\u003a\u0020\u89c6\u9891\u52a0\u8f7d\u5931\u8d25\u002c\u70b9\u51fb\u64ad\u653e\u6309\u94ae\u91cd\u65b0\u64ad\u653e'};});;qcVideo('FullScreenApi',function(version){var apiMap,specApi,browserApi,i,fullscreenAPI={};apiMap=[['requestFullscreen','exitFullscreen','fullscreenElement','fullscreenEnabled','fullscreenchange','fullscreenerror'],['webkitRequestFullscreen','webkitExitFullscreen','webkitFullscreenElement','webkitFullscreenEnabled','webkitfullscreenchange','webkitfullscreenerror'],['webkitRequestFullScreen','webkitCancelFullScreen','webkitCurrentFullScreenElement','webkitCancelFullScreen','webkitfullscreenchange','webkitfullscreenerror'],['mozRequestFullScreen','mozCancelFullScreen','mozFullScreenElement','mozFullScreenEnabled','mozfullscreenchange','mozfullscreenerror'],['msRequestFullscreen','msExitFullscreen','msFullscreenElement','msFullscreenEnabled','msFullscreenChange','msFullscreenError']];specApi=apiMap[0];for(i=0;i<apiMap.length;i++){if(apiMap[i][1]in document){browserApi=apiMap[i];break;}}
if(browserApi&&!version.IS_MOBILE){fullscreenAPI.supportFullScreen=true;for(i=0;i<browserApi.length;i++){fullscreenAPI[specApi[i]]=browserApi[i];}}else{fullscreenAPI.supportFullScreen=false;}
return fullscreenAPI;});;qcVideo('H5',function(constants,api,util,Base,config,startup_tpl,TDBankReporter){var $;return Base.extend({verifyDone:function(data){var me=this;util.merge(me.store,data,true);util.merge(me.store,{'parameter':me.option});var h5player=qcVideo.get('h5player');h5player['render'](me.store);me.sdklink.setSwf(h5player.mediaPlayer);delete me.sdklink;},getFinalVideos:function(o,source){if(o&&o.length){var map={},ai=0,al=o.length;for(;ai<al;ai++){map[o[ai].split('?')[0]]=o[ai];}
if(source&&source.length){var finalVideos=[],vi=0,vl=source.length,st;for(;vi<vl;vi++){st=source[vi]['url'].split('?')[0];if(map.hasOwnProperty(st)){source[vi]['url']=map[st];finalVideos.push(source[vi]);}}
return finalVideos;}}
return null;},addStyle:function(){var node=document.createElement("link");node.href=config.h5css;node.rel="stylesheet";node.media="screen";document.getElementsByTagName("head")[0].appendChild(node);},askDoor:function(firstTime,pass){var me=this,store=me.store,key,address=constants.SERVER_API+'?interface=Vod_Api_GetPlayInfo&1=1';for(key in constants.SERVER_API_PARAMS){if(store.hasOwnProperty(key)){address+='&'+key+'='+store[key];}}
if(pass!==undefined){address+='&pass='+pass;}
me.loading(true);api.request(address,function(ret){me.loading();var code=ret['retcode']+'',data=ret['data'];TDBankReporter.pushEvent('connectPlayCgiH5',{setting:{app_id:me.store.app_id}});if(code==constants.OK_CODE){if(me.store.videos&&me.store.videos.length){var finalVideos=me.getFinalVideos(me.store.videos,data.file_info.image_video.videoUrls);if(finalVideos){data.file_info.image_video.videoUrls=finalVideos;}}
me.verifyDone(data);}else{var isPwdError=code==constants.ERROR_CODE.REQUIRE_PWD||code==constants.ERROR_CODE.ERROR_PW;if(isPwdError&&firstTime){me.renderPWDPanel();}else{var errorMsg=constants.ERROR_MSG[code]||'';if(!errorMsg||!isPwdError){errorMsg+=' Code:('+code+')';}
me.erTip(errorMsg,isPwdError);}}});},className:'PlayerH5',$pwd:null,$out:null,option:{},constructor:function(_$,targetId,opt,eid,link){$=_$;var me=this;me.option=opt;me.sdklink=link;me.addStyle();me.store=util.merge({"$renderTo":$('#'+targetId),"sdk_method":eid+'_callback','keepArgs':{'targetId':targetId,'eid':eid,'refer':opt['refer']}},opt);var $out=me.$out=me.store.$renderTo.html(startup_tpl['main']({sure:'\u786e\u5b9a',errpass:'\u62b1\u6b49\uff0c\u5bc6\u7801\u9519\u8bef',enterpass:'\u8bf7\u8f93\u5165\u5bc6\u7801',videlocked:'\u8be5\u89c6\u9891\u5df2\u52a0\u5bc6'}));me.$pwd=$out.find('[data-area="pwd"]');me.$error=$out.find('[data-area="error"]');me.$loading=$out.find('[data-area="loading"]');$out.find('[data-area="main"]').css({width:me.store.width,height:me.store.height});me.$error.css({top:me.store.height/2});me.$loading.css({top:me.store.height/2});var third=opt['third_video'];if(!!third&&!!third['urls']&&!!third['duration']){var key,data={file_info:{duration:third['duration'],image_video:{videoUrls:[]}},player_info:{}};for(key in third['urls']){data.file_info.image_video.videoUrls.push({'definition':key,'url':third['urls'][key]});}
me.verifyDone(data);}
else{me.askDoor(true);}},loading:function(visible){},erTip:function(msg,pwdEr){if(pwdEr){this.$pwd.find('.txt').text(msg).css('visibility','visible');}else{this.$error.text(msg).show();}},sureHandler:function(){var me=this,$pwd=me.$pwd,pwd=$pwd.find('input[type="password"]').val()+'',able=pwd.length>0;$pwd.find('.txt').text(able?'':'\u62b1\u6b49\uff0c\u5bc6\u7801\u9519\u8bef').css('visibility',(able?'hidden':'visible'));if(able){me.askDoor(false,pwd);}},renderPWDPanel:function(){var me=this,cw=me.store.width,ch=me.store.height,$pwd=me.$pwd,$parent=$pwd.parent();$pwd.show().on('click','[tx-act]',function(e){var act=$(this).attr('tx-act'),handler=me[act+'Handler'];handler&&handler.call(me);e.stopPropagation();return false;});var pw=$pwd.width(),ph=$pwd.height(),fW=$parent.width();if(fW&&fW<=pw){$pwd.css({'left':'0px','top':'0px'}).width(fW);}else{$pwd.css({'left':(cw-pw)/2+'px','top':(ch-ph)/2+'px'});}}});});qcVideo("MD5",function(){'use strict';function safe_add(x,y){var lsw=(x&0xFFFF)+(y&0xFFFF),msw=(x>>16)+(y>>16)+(lsw>>16);return(msw<<16)|(lsw&0xFFFF);}
function bit_rol(num,cnt){return(num<<cnt)|(num>>>(32-cnt));}
function md5_cmn(q,a,b,x,s,t){return safe_add(bit_rol(safe_add(safe_add(a,q),safe_add(x,t)),s),b);}
function md5_ff(a,b,c,d,x,s,t){return md5_cmn((b&c)|((~b)&d),a,b,x,s,t);}
function md5_gg(a,b,c,d,x,s,t){return md5_cmn((b&d)|(c&(~d)),a,b,x,s,t);}
function md5_hh(a,b,c,d,x,s,t){return md5_cmn(b^c^d,a,b,x,s,t);}
function md5_ii(a,b,c,d,x,s,t){return md5_cmn(c^(b|(~d)),a,b,x,s,t);}
function binl_md5(x,len){x[len>>5]|=0x80<<(len%32);x[(((len+64)>>>9)<<4)+14]=len;var i,olda,oldb,oldc,oldd,a=1732584193,b=-271733879,c=-1732584194,d=271733878;for(i=0;i<x.length;i+=16){olda=a;oldb=b;oldc=c;oldd=d;a=md5_ff(a,b,c,d,x[i],7,-680876936);d=md5_ff(d,a,b,c,x[i+1],12,-389564586);c=md5_ff(c,d,a,b,x[i+2],17,606105819);b=md5_ff(b,c,d,a,x[i+3],22,-1044525330);a=md5_ff(a,b,c,d,x[i+4],7,-176418897);d=md5_ff(d,a,b,c,x[i+5],12,1200080426);c=md5_ff(c,d,a,b,x[i+6],17,-1473231341);b=md5_ff(b,c,d,a,x[i+7],22,-45705983);a=md5_ff(a,b,c,d,x[i+8],7,1770035416);d=md5_ff(d,a,b,c,x[i+9],12,-1958414417);c=md5_ff(c,d,a,b,x[i+10],17,-42063);b=md5_ff(b,c,d,a,x[i+11],22,-1990404162);a=md5_ff(a,b,c,d,x[i+12],7,1804603682);d=md5_ff(d,a,b,c,x[i+13],12,-40341101);c=md5_ff(c,d,a,b,x[i+14],17,-1502002290);b=md5_ff(b,c,d,a,x[i+15],22,1236535329);a=md5_gg(a,b,c,d,x[i+1],5,-165796510);d=md5_gg(d,a,b,c,x[i+6],9,-1069501632);c=md5_gg(c,d,a,b,x[i+11],14,643717713);b=md5_gg(b,c,d,a,x[i],20,-373897302);a=md5_gg(a,b,c,d,x[i+5],5,-701558691);d=md5_gg(d,a,b,c,x[i+10],9,38016083);c=md5_gg(c,d,a,b,x[i+15],14,-660478335);b=md5_gg(b,c,d,a,x[i+4],20,-405537848);a=md5_gg(a,b,c,d,x[i+9],5,568446438);d=md5_gg(d,a,b,c,x[i+14],9,-1019803690);c=md5_gg(c,d,a,b,x[i+3],14,-187363961);b=md5_gg(b,c,d,a,x[i+8],20,1163531501);a=md5_gg(a,b,c,d,x[i+13],5,-1444681467);d=md5_gg(d,a,b,c,x[i+2],9,-51403784);c=md5_gg(c,d,a,b,x[i+7],14,1735328473);b=md5_gg(b,c,d,a,x[i+12],20,-1926607734);a=md5_hh(a,b,c,d,x[i+5],4,-378558);d=md5_hh(d,a,b,c,x[i+8],11,-2022574463);c=md5_hh(c,d,a,b,x[i+11],16,1839030562);b=md5_hh(b,c,d,a,x[i+14],23,-35309556);a=md5_hh(a,b,c,d,x[i+1],4,-1530992060);d=md5_hh(d,a,b,c,x[i+4],11,1272893353);c=md5_hh(c,d,a,b,x[i+7],16,-155497632);b=md5_hh(b,c,d,a,x[i+10],23,-1094730640);a=md5_hh(a,b,c,d,x[i+13],4,681279174);d=md5_hh(d,a,b,c,x[i],11,-358537222);c=md5_hh(c,d,a,b,x[i+3],16,-722521979);b=md5_hh(b,c,d,a,x[i+6],23,76029189);a=md5_hh(a,b,c,d,x[i+9],4,-640364487);d=md5_hh(d,a,b,c,x[i+12],11,-421815835);c=md5_hh(c,d,a,b,x[i+15],16,530742520);b=md5_hh(b,c,d,a,x[i+2],23,-995338651);a=md5_ii(a,b,c,d,x[i],6,-198630844);d=md5_ii(d,a,b,c,x[i+7],10,1126891415);c=md5_ii(c,d,a,b,x[i+14],15,-1416354905);b=md5_ii(b,c,d,a,x[i+5],21,-57434055);a=md5_ii(a,b,c,d,x[i+12],6,1700485571);d=md5_ii(d,a,b,c,x[i+3],10,-1894986606);c=md5_ii(c,d,a,b,x[i+10],15,-1051523);b=md5_ii(b,c,d,a,x[i+1],21,-2054922799);a=md5_ii(a,b,c,d,x[i+8],6,1873313359);d=md5_ii(d,a,b,c,x[i+15],10,-30611744);c=md5_ii(c,d,a,b,x[i+6],15,-1560198380);b=md5_ii(b,c,d,a,x[i+13],21,1309151649);a=md5_ii(a,b,c,d,x[i+4],6,-145523070);d=md5_ii(d,a,b,c,x[i+11],10,-1120210379);c=md5_ii(c,d,a,b,x[i+2],15,718787259);b=md5_ii(b,c,d,a,x[i+9],21,-343485551);a=safe_add(a,olda);b=safe_add(b,oldb);c=safe_add(c,oldc);d=safe_add(d,oldd);}
return[a,b,c,d];}
function binl2rstr(input){var i,output='';for(i=0;i<input.length*32;i+=8){output+=String.fromCharCode((input[i>>5]>>>(i%32))&0xFF);}
return output;}
function rstr2binl(input){var i,output=[];output[(input.length>>2)-1]=undefined;for(i=0;i<output.length;i+=1){output[i]=0;}
for(i=0;i<input.length*8;i+=8){output[i>>5]|=(input.charCodeAt(i/8)&0xFF)<<(i%32);}
return output;}
function rstr_md5(s){return binl2rstr(binl_md5(rstr2binl(s),s.length*8));}
function rstr_hmac_md5(key,data){var i,bkey=rstr2binl(key),ipad=[],opad=[],hash;ipad[15]=opad[15]=undefined;if(bkey.length>16){bkey=binl_md5(bkey,key.length*8);}
for(i=0;i<16;i+=1){ipad[i]=bkey[i]^0x36363636;opad[i]=bkey[i]^0x5C5C5C5C;}
hash=binl_md5(ipad.concat(rstr2binl(data)),512+data.length*8);return binl2rstr(binl_md5(opad.concat(hash),512+128));}
function rstr2hex(input){var hex_tab='0123456789abcdef',output='',x,i;for(i=0;i<input.length;i+=1){x=input.charCodeAt(i);output+=hex_tab.charAt((x>>>4)&0x0F)+
hex_tab.charAt(x&0x0F);}
return output;}
function str2rstr_utf8(input){return unescape(encodeURIComponent(input));}
function raw_md5(s){return rstr_md5(str2rstr_utf8(s));}
function hex_md5(s){return rstr2hex(raw_md5(s));}
function raw_hmac_md5(k,d){return rstr_hmac_md5(str2rstr_utf8(k),str2rstr_utf8(d));}
function hex_hmac_md5(k,d){return rstr2hex(raw_hmac_md5(k,d));}
function md5(string,key,raw){if(!key){if(!raw){return hex_md5(string);}
return raw_md5(string);}
if(!raw){return hex_hmac_md5(key,string);}
return raw_hmac_md5(key,string);}
return{className:"MD5",md5:md5};});qcVideo('Player',function(util,Base,version,css,H5,Swf,SwfJsLink,constants,TDBankReporter,BJ_REPORT,config){var eidUuid=+new Date();var ableReportJsError=0;function getEid(){eidUuid+=1;return'video_'+eidUuid;}
function matchIfmWidth(opt,ele){ele.style.width='0px';ele.style.height='0px';var rate=opt.width/opt.height;var tempW=css.getVisibleWidth();var tempH=css.getVisibleHeight();if(opt.width>tempW||opt.height>tempH){if(opt.width>tempW){tempH=tempW/rate;}
if(opt.height>tempH){tempW=tempH*rate;}
if(tempW/tempH!==rate){tempH=tempW/rate;}
ele.style.width=(opt.width=tempW)+'px';ele.style.height=(opt.height=tempH)+'px';return false;}else{ele.style.width=opt.width+'px';ele.style.height=opt.height+'px';return true;}}
function setSuitableWH(opt,ele){var width=opt.width,height=opt.height,pW=css.getWidth(ele),pH=css.getHeight(ele),rate=width/height,minPix=4;if(pW<minPix&&ele.parentNode){var pEle=ele.parentNode;while(true){if(!pEle||pEle===document.body){pW=css.getVisibleWidth();pH=css.getVisibleHeight();break;}else{pW=css.getWidth(pEle);pH=css.getHeight(pEle);if(pW>minPix){break;}}
pEle=pEle.parentNode;}}
if(pH<minPix&&pW>minPix){pH=pW/rate;}
if(opt['match_page_width']){if(!matchIfmWidth(opt,ele)){return;}}
if(pW<minPix){pW=width;}
if(pH<minPix){pH=pW/rate;}
if(pW<width){width=pW;height=width/rate;}
if(pH<height){height=pH;width=height*rate;}
opt.width=width-0;opt.height=height-0;}
return Base.extend({className:'Player',verifyDone:function(targetId,opt,listener){var ele=document.getElementById(targetId);this.targetId=targetId;setSuitableWH(opt,ele);var inWhiteAppId=false;if(!!opt&&!!opt['app_id']){inWhiteAppId=!version.IS_MOBILE;opt.inWhiteHlsJs=inWhiteAppId;}
var ver=version.getVodPriority(inWhiteAppId),eid=getEid();var flashAble=version.getFlashAble();var link=new SwfJsLink(eid,listener);if(ver=='h5'){qcVideo.use('$',function($){if(version.REQUIRE_HLS_JS){qcVideo.use('Hls',function(mod){new H5($,targetId,opt,eid,link);});}else{new H5($,targetId,opt,eid,link);}});TDBankReporter.pushEvent('connectInitH5',{setting:{app_id:opt.app_id}});}else if(ver=='flash'){if(flashAble=='lowVersion'){ele.innerHTML=constants.UNICODE_WORD.TIP_UPDATE_FLASH+'<a target="_blank" style="color:blue;" href="http://www.macromedia.com/go/getflashplayer">'+constants.UNICODE_WORD.TIP_CLICK_UPDATE_FLASH+'</a>'}else{new Swf(targetId,eid,opt,link);TDBankReporter.pushEvent('connectInitFlash',{setting:{app_id:opt.app_id}});}}else{ele.innerText=constants.UNICODE_WORD.TIP_REQUIRE_FLASH;return;}
css.textAlign(ele);return link;},constructor:function(targetId,opt,listener){TDBankReporter.pushEvent('connectInit',{setting:{app_id:opt.app_id}});if(util.isPlainObject(targetId)){var tmp=opt;opt=targetId;targetId=tmp;}
ableReportJsError=ableReportJsError===0&&(opt&&(opt['app_id']in constants.BAD_JS_REPORT_WHITE_APP_IDS))?1:-1;if(ableReportJsError===1){BJ_REPORT.init({id:1067,uin:123,combo:0,delay:1000,url:"//badjs2.qq.com/badjs",ignore:[/Script error/i],level:4,random:1});}
opt['refer']=document.domain;if(!targetId||!document.getElementById(targetId)){alert("没有指定有效播放器容器！");}else if(!opt['app_id']||!opt['file_id']){var video=opt['third_video'];if(video){if(!video['duration']){return alert("缺少视频时长参数，请补齐duration；");}else if(!video['urls']){return alert("缺少视频地址信息，请补齐urls；");}else{return this.verifyDone(targetId,opt,listener);}}
alert("缺少参数，请补齐appId，file_id");}else{return this.verifyDone(targetId,opt,listener);}},remove:function(){if(this.targetId){document.getElementById(this.targetId).innerHTML='';}}});});;qcVideo('startup',function(Base,Player){return Base.instance({className:'startup',constructor:Base.loop,start:function(targetId,opt){new Player(targetId,opt);}});});qcVideo('startup_tpl',function(){return{'main':function(data){var __p=[],_p=function(s){__p.push(s)};_p('<div data-area="main" style="position: relative;background-color: #000;">\r\n\
           <div class="layer-password" data-area="pwd" style="display:none;z-index:5;">\r\n\
               <span class="tip" style="border: none;background-color: #242424;border-bottom: 1px solid #0073d0;position: relative;">');_p(data.videlocked);_p('</span>\r\n\
               <input class="password" placeholder="');_p(data.enterpass);_p('" type="password">\r\n\
               <span class="txt">');_p(data.errpass);_p('</span>\r\n\
               <div class="bottom">\r\n\
                   <a class="btn ok" href="#" tx-act="sure">');_p(data.sure);_p('</a>\r\n\
               </div>\r\n\
           </div>\r\n\
   \r\n\
           <div style="color: red;text-align: center;position: absolute;width: 99%;height: 50%;  font-size: 1rem;"\r\n\
           data-area="error" style="display:none;"> </div>\r\n\
           <div data-area="loading" style="text-align: center;position: absolute;width: 99%;height: 50%;font-size: 1rem;display:none;">loading....</div>\r\n\
    </div>');return __p.join("");},__escapeHtml:(function(){var a={"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;","/":"&#x2F;"},b=/[&<>'"\/]/g;return function(c){if(typeof c!=="string")return c;return c?c.replace(b,function(b){return a[b]||b}):""}})()}});;qcVideo('Swf',function(Base,config,JSON,LinkIm){var getHtmlCode=function(option,eid){var __=[],address=config.flash,_=function(str){__.push(str);};var flashvars='auto_play='+option.auto_play+'&version=1&refer='+option.refer+'&jscbid='+eid;var VMode=option.VMode||option.WMode||'window';flashvars+=!!option.disable_full_screen?'&disable_full_screen=1':'&disable_full_screen=0';flashvars+=!!option.debug?'&debug=1':'';if(option.file_id){flashvars+='&file_id='+option.file_id;}
if(option.app_id){flashvars+='&app_id='+option.app_id;}
if(option.definition!==undefined){flashvars+='&definition='+option.definition;}
if(option.player_id!==undefined){flashvars+='&player_id='+option.player_id;}
if(option.disable_drag!==undefined){flashvars+='&disable_drag='+option.disable_drag;}
if(option.stretch_full!==undefined){flashvars+='&stretch_full='+option.stretch_full;}
if(option.videos&&option.videos.length){flashvars+='&videos='+encodeURIComponent(JSON.stringify(option.videos));}
if(!!option.third_video){flashvars+='&third_video='+encodeURIComponent(JSON.stringify(option.third_video));}
if(option.skin){flashvars+='&skin='+encodeURIComponent(JSON.stringify(option.skin));}
if(option.stop_time){flashvars+='&stop_time='+option.stop_time;}
if(option.remember){flashvars+='&remember='+option.remember;}
if(option.capture){flashvars+='&capture='+option.capture;}
if(option.stretch_patch){flashvars+='&stretch_patch='+option.stretch_patch;}
_('<object data="'+address+'" id="'+eid+'_object" width="'+option.width+'px" height="'+option.height+'px"  style="background-color:#000000;" ');_('align="middle" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="http://fpdownload.macromedia.com/get/flashplayer/current/swflash.cab#version=9,0,0,0">');_('<param name="flashVars" value="'+flashvars+'"  />');_('<param name="src" value="'+address+'"  />');_('<param name="wmode" value="'+VMode+'"/>');_('<param name="quality" value="High"/>');_('<param name="allowScriptAccess" value="always"/>');_('<param name="allowNetworking" value="all"/>');_('<param name="allowFullScreen" value="true"/>');_('<embed style="background-color:#000000;"  id="'+eid+'_embed" width="'+option.width+'px" height="'+option.height+'px" flashvars="'+flashvars+'"');_('align="middle" pluginspage="http://www.macromedia.com/go/getflashplayer" type="application/x-shockwave-flash" allowfullscreen="true" bgcolor="#000000" quality="high"');_('src="'+address+'"');_('wmode="'+VMode+'" allowfullscreen="true" invokeurls="false" allownetworking="all" allowscriptaccess="always">');_('</object>');return __.join('');};return Base.extend({className:'PlayerSwf',option:null,constructor:function(targetId,eid,opt,context){document.getElementById(this.targetId=targetId).innerHTML=getHtmlCode(opt,eid);},remove:function(){if(this.linkIm){this.linkIm.destroy();this.linkIm=null;}
var node=document.getElementById(this.targetId)||{},parent=node.parentNode;if(node.parentNode&&(node.parentNode.tagName||'').toLowerCase()=='object'){node=parent;parent=node.parentNode;}
try{parent.removeChild(node);}catch(xe){}}});});;qcVideo('SwfJsLink',function(util,JSON,H5){var global=window;var cap=function(str){return str.replace(/(\w)/,function(v){return v.toUpperCase()});};var tryIt=function(fn){return function(){try{return fn.apply(this,arguments);}catch(xe){return'0';}};};var pixesToInt=function(str){return(str?str+'':'').replace('px','')|0;};var SwfJsLink=function(id,listeners){var me=this;me.id=id;me.tecGet=id+'_tecGet';me.operate=id+'_operate';me.source=id+'_source';me.barrage=id+'_barrage';me.close_barrage=id+'_close_barrage';me.login_barrage=id+'_login_barrage';me.check_login_barrage=id+'_check_login_barrage';me.listeners={};var type=util.type(listeners);if(!listeners||type=='function'){me.listeners['playStatus']=listeners||function(){};}
else if(type=='object'){util.merge(me.listeners,listeners)}
global[id+'_callback']=function(cmd){var cmds=cmd.split(':'),key=cmds[0];if(me.listeners.hasOwnProperty(key)){switch(key){case('playStatus'):me.listeners[key](cmds[1]);break;case('fullScreen'):me.listeners[key](cmds[1]=='1');break;case('dragPlay'):me.listeners[key](cmds[1]);break;}}}};util.each(['volume','duration','currentTime','clarity','allClaritys'],function(name){SwfJsLink.prototype['get'+cap(name)]=(function(name){return function(){try{var ret=this.getSwf()[this.tecGet](name);if(name=='currentTime'){ret=ret|0;}
return ret;}catch(xe){return'';}}})(name);});util.each(['seeking','suspended','playing','playEnd'],function(name){SwfJsLink.prototype['is'+cap(name)]=(function(name){return function(){try{var state=this.getSwf()[this.tecGet]('playState');if(state==name){return true;}}catch(xe){}
return false;}})(name)});util.merge(SwfJsLink.prototype,{setSwf:function(obj){this.swf=obj;this.tecGet='sdk_tecGet';this.operate='sdk_operate';this.source='sdk_source';this.barrage='sdk_barrage';this.close_barrage='sdk_close_barrage';},isJsPlayer:function(){return this.tecGet=='sdk_tecGet';},getSwf:function(){var me=this;if(!me.swf){try{var ctx1=document.getElementById(this.id+'_object');var ctx2=document.getElementById(this.id+'_embed');if(ctx1&&!!ctx1[this.tecGet]){this.swf=ctx1;}else if(ctx2&&!!ctx2[this.tecGet]){this.swf=ctx2;}}catch(xe){return{};}}
return this.swf;},resize:function(w,h){var swf=this.getSwf();if(swf){if(this.isJsPlayer()){this.getSwf()[this.operate]('resize',w,h);}else{swf.width=pixesToInt(w);swf.height=pixesToInt(h);}}},getWidth:function(){return pixesToInt(this.getSwf().width);},getHeight:function(){return pixesToInt(this.getSwf().height);},pause:tryIt(function(){return this.getSwf()[this.operate]('pause');}),resume:tryIt(function(){return this.getSwf()[this.operate]('resume');}),play:tryIt(function(time){return this.getSwf()[this.operate]('play',time|0);}),setClarity:tryIt(function(clarity){return this.getSwf()[this.operate]('clarity',-1,clarity);}),setFullScreen:tryIt(function(fullScreen){if(!!fullScreen){return this.getSwf()[this.operate]('openfullscreen');}else{return this.getSwf()[this.operate]('cancelfullscreen');}}),capture:tryIt(function(){return this.getSwf()[this.operate]('capture');}),changeVideo:tryIt(function(opt){if(this.isJsPlayer()){var args=this.getSwf()[this.source]();var link=this;opt.width=opt.width||args.width;opt.height=opt.height||args.height;opt.refer=args.refer;qcVideo.use('$',function(mod){new H5(mod,args['targetId'],opt,args['eid'],link);});}else{return this.getSwf()[this.source](opt['file_id'],opt['app_id']||'',!!opt.videos&&opt.videos.length?JSON.stringify(opt.videos):'',!!opt.third_video?JSON.stringify(opt.third_video):'',opt['auto_play']?1:0);}}),remove:tryIt(function(){var swf=this.getSwf();var parent=swf.parentNode;parent.removeChild(swf);if((parent.tagName||'').toLowerCase()=='object'){parent.parentNode.removeChild(parent);}}),isFullScreen:function(){try{return this.getSwf()[this.tecGet]('fullscreen')=="1";}catch(xe){}
return false;},addBarrage:tryIt(function(ary){if(ary&&ary.length>0){return this.getSwf()[this.barrage](JSON.stringify(ary));}}),closeBarrage:tryIt(function(){return this.getSwf()[this.close_barrage]();}),loginBarrage:tryIt(function(info){var m=info?JSON.stringify(info):'';return this.getSwf()[this.login_barrage](m);}),checkLoginBarrage:tryIt(function(appid){return this.getSwf()[this.check_login_barrage](appid);})});return SwfJsLink;});qcVideo('TDBankReporter',function(MD5,constants){var _platForm=6;var _storeInfo={};var _playId='';var _ifFirstPlaying=true;var _vid='';var _reportStep=2;var pushPlayEvent=function(event,storeInfo){_storeInfo=storeInfo||{};switch(event){case"playing":if(_ifFirstPlaying||_vid!=storeInfo.vid){_vid=storeInfo.vid;_playId=MD5.md5(new Date().getTime());_reportStep=2;_detectOS();sendReq();}
_ifFirstPlaying=false;break;case"seeking":break;case"playEnd":_ifFirstPlaying=true;break;case"suspended":break;case"connectInit":_reportStep=200;_platForm=0;sendReq();break;case"connectInitFlash":_reportStep=201;_platForm=0;sendReq();break;case"connectInitH5":_reportStep=202;_platForm=0;sendReq();break;case"connectPlayCgiH5":_reportStep=204;_platForm=0;sendReq();break;}}
var _detectOS=function(){var detect=function(){var sUserAgent=navigator.userAgent;if(/Android/i.test(sUserAgent))return"Android";if(/iPhone|iPad|iPod/i.test(sUserAgent))return"iOS";if(/Windows/i.test(sUserAgent))return"Windows";if(/Mac/i.test(sUserAgent))return"Mac";return"other";}
switch(detect()){case"Android":_platForm=4;break;case"iOS":_platForm=5;break;case"Windows":_platForm=6;break;case"Mac":_platForm=7;break;default:_platForm=6;}}
var _getReportData=function(){var dataArray=[_platForm,_storeInfo.setting?_storeInfo.setting.app_id:0,'',_storeInfo.vid||'',_playId||'','',0,'',0,'',_reportStep||2,encodeURIComponent(window.location.href)||'',0,];return dataArray.join(';');}
var http_img_sender=function(){var img=new Image();var sender=function(src){img.onload=img.onerror=img.onabort=function(){img.onload=img.onerror=img.onabort=null;img=null;};img.src=src;};return sender;};var sendReq=function(){var reqData=_getReportData();var url=constants.TDBANK_REPORT_API+'?m=dataImport&p=["100043","'+reqData+'"]';try{var sender=http_img_sender();sender(url);}catch(xe){}};_detectOS();return{className:'TDBankReporter',pushEvent:pushPlayEvent};});qcVideo.use("Player",function(mod){qcVideo.Player=mod;});;qcVideo('h5player',function($,Base,constants,util,MediaPlayer,version){var getSpecArgs=function(opt){return{disable_drag:!!opt['disable_drag'],stretch_full:!!opt['stretch_full'],stop_time:opt['stop_time']|0,remember:!!opt['remember'],stretch_patch:!!opt['stretch_patch'],disable_full_screen:!!opt['disable_full_screen'],hide_h5_setting:!!opt['hide_h5_setting']};};return Base.instance({className:'h5player',constructor:Base.loop,render:function(opt){Base.setDebug(opt['debug']);var parameter=opt.parameter||{},store={patch:{},videos:{},logo:{},setting:{width:opt.width,height:opt.height,$renderTo:opt.$renderTo,isAutoPlay:parameter['auto_play']==1,file_id:parameter['file_id'],app_id:parameter['app_id'],definition:parameter['definition'],resolution:undefined,inWhiteHlsJs:parameter['inWhiteHlsJs'],playbackRate:parameter['playbackRate']||1}},fileInfo=opt.file_info,video=fileInfo.image_video.videoUrls||[],player_info=opt.player_info,patch=player_info.patch_info||[];if(!version.ABLE_H5_HLS&&!version.ABLE_H5_APPLE_HLS&&(!version.REQUIRE_HLS_JS||!parameter['inWhiteHlsJs'])){constants.DEFINITION_PRIORITY=constants.JUST_MP4_DEFINITION_PRIORITY}
var resolution=player_info['resolution_type'];if(resolution!==undefined){store.setting.resolution=resolution;}
store.imgUrls=fileInfo.image_video.imgUrls;store.image_url=fileInfo.image_url;store.duration=fileInfo.duration|0;store.logo['url']=player_info['logo_pic'];store.logo['location']=player_info['logo_location'];store.logo['redirect']=player_info['logo_url'];store.customization=getSpecArgs(opt);store.keepArgs=opt.keepArgs;store.sdk_method=opt.sdk_method;store.vid=fileInfo.vid;$.each(patch,function(_,item){store.patch[item['location_type']|0]={'url':item['patch_url'],'redirect':item['patch_redirect_url'],'type':item['patch_type']};});var hasMoreFormat=false,sourceIsMp4=false;$.each(video,function(_,item){var def=item['definition']|0;if(def==0){if(item['url'].toLowerCase().indexOf('.mp4')>0){sourceIsMp4=true;}}else if(def>1){hasMoreFormat=true;}
store.videos[def]={'definition':def,'name':fileInfo['name']||'','url':item['url'],'height':item['vheight'],'width':item['vwidth']};});if(sourceIsMp4&&!hasMoreFormat){constants.DEFINITION_PRIORITY=constants.ONLY_MP4_NO_TRANS;opt['disable_drag']=true;store.customization=getSpecArgs(opt);}
this.mediaPlayer=new MediaPlayer(store);},destroy:function(){this.mediaPlayer.destroy();}});});;qcVideo('Bottom_container',function($,UICom,Drag,util,UiControl,constants,FullScreenApi,version){var volume_width=49;var undefined=undefined;var EVENT=constants.EVENT;var FIRE=constants.FIRE;var WORD=constants.UNICODE_WORD;var svg_info={play:{title:WORD.PLAY,method:'svg_bottom_play'},pause:{title:WORD.PAUSE,method:'svg_bottom_pause'},volume:{title:WORD.MUTE,method:'svg_bottom_volume'},mute_volume:{title:WORD.VOLUME,method:'svg_bottom_volume_mute'},full_volume:{title:WORD.VOLUME,method:'svg_bottom_volume_full'},fullscreen:{title:WORD.FULL_SCREEN,method:'svg_bottom_fullscreen'},quit_fullscreen:{title:WORD.EXIT_FULL_SCREEN,method:'svg_bottom_quit_fullscreen'}};return UICom.extend({className:'Bottom_container',init:function(){var me=this;me.subs={};me.$el.find('[sub-component]').each(function(){var $me=$(this);me.subs[$me.attr('sub-component')]=$me;});me.processDrag=(new Drag(me.subs['progress_pointer'],me.subs['progress_bg'])).on(Drag.EVENT_DRAG_STOP,function(){var p=this.getPercent();me.fire(FIRE,{event:EVENT.UI_DRAG_PLAY,value:{percent:p}});me._setSimulationPercent(p);});if(me.subs['volume_slider']){me.volumeDrag=(new Drag(me.subs['volume_slider'],me.subs['volume_bg'])).on(Drag.EVENT_DRAG_STOP,function(){me.fire(FIRE,{event:EVENT.UI_SET_VOLUME,value:{volume:this.getPercent()}});}).setMaxWidth(volume_width-4);}
$(window).on('keydown',function(e){var keyCode=e.keyCode;if(keyCode==38){if(me.volumeDrag){me.fire(FIRE,{event:EVENT.UI_SET_VOLUME,value:{volume:Math.min(1,me.volumeDrag.getPercent()+0.1)}});}}
else if(keyCode==40){if(me.volumeDrag){me.fire(FIRE,{event:EVENT.UI_SET_VOLUME,value:{volume:Math.max(0,me.volumeDrag.getPercent()-0.1)}});}}
else if(keyCode==39){me.fire(FIRE,{event:EVENT.UI_PLUS_PLAY,value:{}});}
else if(keyCode==37){me.fire(FIRE,{event:EVENT.UI_MINUS_PLAY,value:{}});}});if(!FullScreenApi.supportFullScreen){if(this.subs['fullscreen_btn']){this.subs['fullscreen_btn'].width(0).height(0).hide().empty();}
this.subs['setting'].css('right',5);}},enableFull:function(bool){this.subs['fullscreen_btn']&&this.subs['fullscreen_btn'][bool?'show':'hide']();},enableDrag:function(bool){this.processDrag.enAble(bool);var cursor=bool?'pointer':'default';this.subs['progress_load'].css('cursor',cursor);this.subs['progress_bg'].css('cursor',cursor);},catchControlStatusChange:function(s,obj){var m=UiControl.MODE,subs=this.subs;this.enable(true);switch(s){case(m.WAIT):this.enable(false);this.$el.show();this._setSvg(subs['play_btn'],'play');break;case(m.PLAY):this._setSvg(subs['play_btn'],'pause');break;case(m.PAUSE):this._setSvg(subs['play_btn'],'play');break;case(m.FULL):this._setSvg(subs['fullscreen_btn'],'quit_fullscreen');break;case(m.QUIT_FULL):this._setSvg(subs['fullscreen_btn'],'fullscreen');break;case(m.RESIZE):if(obj.offset.width>0){if(obj.offset.width<270){this.subs['time_duration'].hide();}else{this.subs['time_duration'].show();}}
break;case(m.END):this._setProgress({pPercent:0,lPercent:100});break;}},_setSvg:function($dom,name){if($dom.attr('now')!==name){var item=svg_info[name];$dom.attr({'title':item.title,'now':name}).find('svg').each(function(){var $svg=$(this),id=$svg.attr('svg-mode');if(id==item.method){$(this).width('100%').height('100%').show();}else{$(this).hide();}});}},_setSimulationPercent:function(percent){var me=this;setTimeout(function(){me.fire(FIRE,{event:EVENT.UI_SIMULATION_POSITION,value:{percent:percent}});},25);},_setProgress:function(obj){var me=this,subs=me.subs;if(subs){if(obj.lPercent!==undefined){var lPercent=(obj.lPercent||0)/100;if(me._lPercent!==lPercent){me._lPercent=lPercent;subs['progress_load'].css('width',(lPercent*100)+'%');}}
if(obj.pPercent!==undefined&&me.processDrag&&!me.processDrag.isMoving()){var pPercent=(obj.pPercent||0)/100;if(me._pPercent!==pPercent){me._pPercent=pPercent;subs['progress_play'].css('width',(pPercent*100)+'%');subs['progress_pointer'].css('left',pPercent*subs['progress_bg'].width());}}}},setTime:function(obj){var subs=this.subs;if(obj.currentTime!==undefined&&this.duration){subs['time_played'].html(util.convertTime(obj.currentTime));this._setProgress({pPercent:util.fix2(obj.currentTime/this.duration*100)});}
if(obj.duration!==undefined){this.duration=obj.duration;subs['time_duration'].html(' / '+util.convertTime(obj.duration));}
if(obj.loaded!==undefined&&this.duration){this._setProgress({lPercent:util.fix2(obj.loaded/this.duration*100)});}},setVolume:function(vPercent){var me=this,subs=me.subs;if(subs){if(vPercent==100){me._setSvg(subs['volume_mute'],'full_volume');}else if(vPercent==0){me._setSvg(subs['volume_mute'],'mute_volume');}else{me._setSvg(subs['volume_mute'],'volume');}
vPercent=((vPercent||0)/100)*volume_width;subs['volume_track'].width(vPercent);if(me.volumeDrag&&!me.volumeDrag.isMoving()){subs['volume_slider'].css('left',vPercent)}}},on_click_setting:function(){this.fire(FIRE,{event:EVENT.UI_OPEN_SETTING,value:{}});},on_click_play_btn:function($dom){this.fire(FIRE,{event:EVENT[$dom.attr('now')=='play'?'UI_PLAY':'UI_PAUSE'],value:{}});},on_click_volume_mute:function($dom){this.fire(FIRE,{event:EVENT.UI_SET_VOLUME,value:{volume:$dom.attr('now')in{'full_volume':true,'mute_volume':true}?0.5:0}});},on_click_fullscreen_btn:function($dom){this.fire(FIRE,{event:$dom.attr('now')=='fullscreen'?EVENT.UI_FULL_SCREEN:EVENT.UI_QUIT_FULL_SCREEN,value:{}});},_click_progress_handler:function(event){if(this.processDrag.isAble()){var $bg=this.subs['progress_bg'];var percent=((event.pageX-$bg.offset().left)/$bg.width()).toFixed(3)-0;this.debug('点击播放进度百分比=='+percent);this.fire(FIRE,{event:EVENT.UI_DRAG_PLAY,value:{percent:percent}});this._setSimulationPercent(percent);}},_click_volume_handler:function(event){var $bg=this.subs['volume_bg'];var percent=((event.pageX-$bg.offset().left)/$bg.width()).toFixed(3)-0;this.fire(FIRE,{event:EVENT.UI_SET_VOLUME,value:{volume:percent}});},on_click_progress_bg:function($d,e){this._click_progress_handler(e);},on_click_progress_play:function($d,e){this._click_progress_handler(e);},on_click_progress_load:function($d,e){this._click_progress_handler(e);},on_click_volume_bg:function($d,e){this._click_volume_handler(e);},on_click_volume_track:function($d,e){this._click_volume_handler(e);}});});;qcVideo('Center_container',function($,UICom,constants,UiControl,version){return UICom.extend({className:'Center_container',init:function(){var me=this;me.subs={};me.$el.find('[sub-component]').each(function(){var $me=$(this);me.subs[$me.attr('sub-component')]=$me;});me._fixButtonSize();me.subs['play'].on('mouseenter',function(){me.log('mouseenter',me.subs['play'].find('circle[data-opacity]'));me.subs['play'].find('circle[data-opacity]').attr('fill-opacity','0.8');}).on('mouseleave',function(){me.log('mouseleave',me.subs['play'].find('circle[data-opacity]'));me.subs['play'].find('circle[data-opacity]').attr('fill-opacity','0.5');});},catchControlStatusChange:function(s,data){var m=UiControl.MODE,subs=this.subs;subs['error'].hide();switch(s){case(m.WAIT):subs['play'].hide();subs['loading'].show();break;case(m.PLAY):subs['loading'].hide();subs['play'].hide();break;case(m.PAUSE):subs['loading'].hide();subs['play'].show();break;case(m.ERROR):subs['loading'].hide();subs['play'].hide();subs['error'].text(data.msg).show();break;case(m.FULL):this._fixButtonSize();break;case(m.QUIT_FULL):this._fixButtonSize();break;case(m.RESIZE):this._fixButtonSize();break;case(m.END):subs['loading'].hide();subs['play'].show();break;}},_fixButtonSize:function(){var me=this;var offset=me.store.getMainOffset();var max=version.IS_MOBILE?2000:75;var size=Math.min(Math.min(offset.width,offset.height)*0.3,max)/2;me.subs['play'].width(size*2).height(size*2).css({'margin':'-'+size+'px 0 0 -'+size+'px'});},on_click_play:function(){this.fire(constants.FIRE,{'event':constants.EVENT.UI_PLAY,'value':{}});}});});;qcVideo('Logo',function($,UICom){return UICom.extend({className:'Logo',init:function(){this._setLogo(this.store.getLogo());},_setLogo:function(obj){var html='';if(obj&&obj.url){var href=obj.redirect&&obj.redirect.length>10?obj.redirect:'javascript:void(0);';var style="position:absolute;z-index:20;";var loc=obj['location']=obj['location']|0;if(loc==0){style+='top:5px;left:5px;'}else if(loc==1){style+='bottom:5px;left:5px;'}else if(loc==2){style+='top:5px;right:5px;'}else if(loc==3){style+='bottom:5px;right:5px;'}
html='<a href="'+href+'" target="_blank"><img src="'+obj.url+'" style="'+style+'"/></a>';}
this.$el.html(html);this.$el.find('img').on('error',function(e){$(this).parent().remove();});}});});;qcVideo('Patch',function($,UICom,UiControl,util){return UICom.extend({className:'Patch',init:function(){this._show_start_patch=false;},catchControlStatusChange:function(s,data){var m=UiControl.MODE,me=this;me.$el.show();switch(s){case(m.WAIT):me.store.happenToSdk('playStatus:seeking');me._poster=null;me.$el.hide();break;case(m.PLAY):me._poster=null;me._show_start_patch=true;me.$el.html('');me.store.happenToSdk('playStatus:playing');break;case(m.PAUSE):if(!me._show_start_patch){me._show_start_patch=true;me._setPoster(me.store.getStartPatch());me.store.happenToSdk('playStatus:ready');}else{me._setPoster(me.store.getPausePatch());me.store.happenToSdk('playStatus:'+me.status.getSDKStatus());}
break;case(m.ERROR):me._poster=null;me.$el.html('');break;case(m.END):me._setPoster(me.store.getSopPatch());me.store.happenToSdk('playStatus:playEnd');break;case(m.RESIZE):if(me._poster){me._setPoster(me._poster);}
break;}},_setPoster:function(obj){if(obj&&obj.url){var me=this,$el=me.$el;var hasRedirect=obj.redirect&&obj.redirect.length>7;var link=hasRedirect?obj.redirect:'javascript:void(0);',style=!hasRedirect?'cursor: default;':'';me._poster=obj;var tpl=qcVideo.get('MediaPlayer_tpl');if(me.store.isCustomization('stretch_patch')){$el.html(tpl['patch_image']({'astyle':style,'istyle':'z-index: 31;position: absolute;top: 0;left: 0;width:100%;height:100%;border:none;','url':obj.url,'link':'javascript:void(0)'}));}else{util.loadImg(obj.url,function(){var offset=me.store.getMainOffset();var target=util.resize(offset,{width:this.width,height:this.height});$el.html(tpl['patch_image']({'astyle':style,'istyle':'z-index: 31;position: absolute;border:none'+';top: '+(offset.height>=target.height?(offset.height-target.height)/2+'px':'0px')+';left: '+(offset.width>=target.width?(offset.width-target.width)/2+'px':'0px')+';width:'+target.width+'px;height:'+target.height+'px','url':obj.url,'link':link}));});}}}});});;qcVideo('Setting',function($,UICom,constants){return UICom.extend({FULL_VIEW:false,className:'Setting',init:function(){var w=$(document.body).width();if(w>0&&w<500){this.FULL_VIEW=true;}
var data=[];var all=this.store.getUniqueNoDefinition();for(var key in all){data.push({'sdk_no':all[key]['resolutionNameNo'],'sdk_name':all[key]['resolutionName']});}
var tplObj=qcVideo.get('MediaPlayer_tpl');this.$el.append(tplObj['setting_definition']({name:'\u66f4\u6362\u6e05\u6670\u5ea6',values:data}));},show:function(obj){var me=this;var on='setting-definition-value-curr',off='setting-definition-value';me.$el.find('div[data-def]').each(function(){var $me=$(this);if($me.attr('data-def')==obj['currentDefinitionSdkNo']){$me.removeClass(off).addClass(on);}else{$me.addClass(off).removeClass(on);}});me.$el.show().css('opacity',0.8);},hide:function(){var me=this;me.$el.css('opacity',0);setTimeout(function(){me.$el.hide();},300)},on_click_definition:function($dom){if(!$dom.hasClass('setting-definition-value-curr')){this.hide();this.fire(constants.FIRE,{event:constants.EVENT.UI_CHOSE_DEFINITION,value:{value:$dom.attr('data-def')|0}});}},on_click_close:function(){this.hide();}});});;qcVideo('UICom',function(Base){var undefined=undefined;return Base.extend({className:'UICom',tapEvent:'click',destroy:function(){if(this.$el){this.$el.remove();delete this.$el;delete this.status;delete this.store;}},constructor:function(store,status,$el){var me=this;me.$el=$el;me.status=status;me.store=store;me.enable_tag=true;me.init();},init:Base.loop,visible:function(visible){if(this.$el){this.$el[visible?'show':'hide']();}},enable:function(enable){if(enable===undefined){return!!this.enable_tag;}
this.enable_tag=enable;},catchControlStatusChange:Base.loop,live:function(match,fn){var me=this,get=function(ctx,hand){return function(e){if(ctx.enable_tag){hand.call(ctx,this,e);}
e.stopPropagation();return false;};};me.$el.on(me.tapEvent,match,get(me,fn));}});});;qcVideo('Drag',function($){var Drag=function($el,$papa){var me=this;me.$papa=$papa;me.$el=$el;me.maxWidth=0;me._able=true;me[Drag.EVENT_DRAG_START]=me[Drag.EVENT_DRAG_STOP]=me[Drag.EVENT_DRAG_ING]=function(){};me.$el.on('dragstart',function(e){if(me._able){me._dragStartHandler.call(me,e);}}).on('drag',function(e){if(me._able){me._dragDragHandler.call(me,e);}}).on('dragend',function(e){if(me._able){me._dragEndHandler.call(me,e);}}).on('dragenter',function(e){e.preventDefault();}).on('dragover',function(e){e.preventDefault();});};$.extend(Drag.prototype,{_modifyPath:function(e){var diff=e.x-this._startX+this._sourceLeft;if(diff>=0&&diff<=this._maxWidth){this.$el.css('left',diff);}},_dragStartHandler:function(e){this.__moving=true;this._maxWidth=this.maxWidth||this.$papa.width();this._startX=e.x;this._sourceLeft=this.$el.position().left;this[Drag.EVENT_DRAG_START]();},_dragDragHandler:function(e){this._modifyPath(e);this[Drag.EVENT_DRAG_ING]();},_dragEndHandler:function(e){this._modifyPath(e);this[Drag.EVENT_DRAG_STOP]();this.__moving=false;},getPercent:function(){return this.$el.position().left/(this.maxWidth||this.$papa.width());},on:function(eventName,fn){this[eventName]=fn;return this;},isMoving:function(){return!!this.__moving;},setMaxWidth:function(w){this.maxWidth=w;return this;},enAble:function(able){this._able=able;},isAble:function(){return this._able;}});Drag.EVENT_DRAG_START='EVENT_DRAG_START';Drag.EVENT_DRAG_STOP='EVENT_DRAG_STOP';Drag.EVENT_DRAG_ING='EVENT_DRAG_ING';return Drag;});;qcVideo('MediaPlayer',function($,Base,UiControl,PlayerSystem,PlayerStore,MediaPlayer_tpl,Error,version,constants,FullScreenApi){var mainId='trump_main_unique_';var uuid=1;return Base.extend({system:!1,store:!1,control:!1,className:'MediaPlayer',destroy:function(){if(this.control){this.system.destroy();this.control.destroy();this.store.destroy();delete this.control;delete this.system;delete this.store;}},__filter_play:function(){var me=this;if(!me.system.isMetaDataRendered()){me.control.setWait();me.system.status.setSDKStatus('seeking');}},dragPlay:function(second){var me=this;me.playEndYet=false;me.whenReadyToPlay=true;me.__filter_play();me.system.play(second);},toPlay:function(second){var me=this;me.playEndYet=false;var url=this.video_data.url;var system=this.system;var status=system.status;this.whenReadyToPlay=true;this.__filter_play();if(status.getRunningStatus()==='error'){status.clear();status.setRememberKey(url);system.setUrl(url);}
system.play(second!==undefined?second:status.get_played());},tapEvent:'click',toPxNum:function(n){return(n||'').toLowerCase().replace('px','')|0;},ableToPlay:function(t){var me=this;var stop_time=me.store.getCustomization('stop_time');if(stop_time){if(me.system.status.get_played()>=stop_time){return false;}}
return true;},constructor:function(info){var me=this,mid=mainId+(uuid++),EVENT=constants.EVENT,setting=info.setting;if(!setting.width||!setting.height){var $p=setting.$renderTo.parent(),pw=$p.width(),ph=$p.height();setting.width=pw-me.toPxNum($p.css('padding-left'))-me.toPxNum($p.css('padding-right'));setting.height=ph-me.toPxNum($p.css('padding-top'))-me.toPxNum($p.css('padding-bottom'));}
var store=me.store=new PlayerStore(info),$container=setting.$renderTo.html(MediaPlayer_tpl['main']({width:setting.width,height:setting.height,'mainId':mid})).find('div'),system=me.system=new PlayerSystem($container),status=system.getStatus();var video=me.video_data=store.getVideoInfo(setting.resolution,setting.definition);var ableRemember=store.isCustomization('remember');status.setRememberKey(video.url);status.enableRemember(ableRemember);status.set_duration(store.getDuration());if(me.system.fileType===constants.HLS){ableRemember=false;store.setCustomization('disable_drag',true);}
store.store.mainId=mid;me.control=new UiControl(store,status,$container);me.control.enableDrag(!store.isCustomization('disable_drag'));me.control.enableFull(!store.isCustomization('disable_full_screen'));me.system.setUrl(video['url']);me.system.status.setRunningStatus('wait');status.setSDKStatus('suspended');me.batchOn(status,[{event:EVENT.OS_PROGRESS,fn:function(){me.control.setTime({loaded:status.get_loaded()});}},{event:EVENT.OS_TIME_UPDATE,fn:function(){var played=status.get_played();me.control.setTime({currentTime:played});if(!me.ableToPlay(played)){system.pause();}}},{event:EVENT.OS_BLOCK,fn:function(e){status.setRunningStatus('error');me.control.setError(Error.NET_ERROR);}},{event:EVENT.OS_PLAYER_END,fn:function(e){playEnd();}}]);var playEnd=function(){me.playEndYet=true;me.whenReadyToPlay=false;me.control.setEnd();status.setRunningStatus('end');status.setSDKStatus('playEnd');};if(FullScreenApi.supportFullScreen){var fullChange=function(){var isFull=me.system.isFullScreen($('#'+store.store.mainId));if(!isFull){me.system.setFullScreen(false,store.store.mainId);}
try{me.control.setFull(isFull);me.control.setResize();}catch(xe){}};$(document).on(FullScreenApi['fullscreenchange'],fullChange);$('#'+store.store.mainId).on(FullScreenApi['fullscreenchange'],fullChange);}
if(!version.IS_MOBILE){$container.on(me.tapEvent,function(e){if(status.getRunningStatus()=='play'){system.pause();}});}
me.batchOn(me.control,[{event:EVENT.UI_PLAY,fn:function(e){var time=e.time||status.get_played();if(me.playEndYet){time=0;}
if(!me.ableToPlay(time)){return;}
me.toPlay(time);}},{event:EVENT.UI_PAUSE,fn:function(e){system.pause();}},{event:EVENT.UI_SET_VOLUME,fn:function(e){system.volume(e.volume);}},{event:EVENT.UI_DRAG_PLAY,fn:function(e){var time=(e.percent*store.getDuration())|0;if(time&&!me.ableToPlay(time)){return;}
me.dragPlay(time);}},{event:EVENT.UI_FULL_SCREEN,fn:function(e){me.system.setFullScreen(true,mid);}},{event:EVENT.UI_QUIT_FULL_SCREEN,fn:function(e){me.system.setFullScreen(false,mid);}},{event:EVENT.UI_PLUS_PLAY,fn:function(e){var time=Math.min(status.get_played()+5,store.getDuration()-2);if(time&&!me.ableToPlay(time)){return;}
me.dragPlay(time);}},{event:EVENT.UI_MINUS_PLAY,fn:function(e){var time=Math.max(status.get_played()-5,0);if(time&&!me.ableToPlay(time)){return;}
me.dragPlay(time);}},{event:EVENT.UI_SIMULATION_POSITION,fn:function(e){me.control.setTime({loaded:status.start_duration(),currentTime:parseInt(e.percent*store.getDuration())});}},{event:EVENT.UI_OPEN_SETTING,fn:function(e){me.control.openSetting({'currentDefinitionSdkNo':me.video_data.resolutionNameNo});}},{event:EVENT.UI_CHOSE_DEFINITION,fn:function(e){me.switchClarity(e.value);}}]);var updateShowMode=function(end){if(version.IS_MOBILE){if(end){system.setShowMode(false);me.control.show();}else{system.setShowMode(true);me.control.hide();}}};me.batchOn(system,[{event:EVENT.OS_LAND_SCAPE_UI,fn:function(){}},{event:EVENT.OS_PORTRAIT_UI,fn:function(){}},{event:EVENT.OS_LOADED_META_DATA,fn:function(){if(me.whenReadyToPlay){if(me.switchPlayTime){setTimeout(function(){me.dragPlay(me.switchPlayTime);me.switchPlayTime=0;},10);}else{me.control.setPlay();}}else{system.pause();me.control.setPause();status.setSDKStatus('suspended');}}},{event:EVENT.OS_RESIZE,fn:function(e){me.control.setResize();}},{event:EVENT.OS_PLAYING,fn:function(e){me.control.setPlay();status.setSDKStatus('playing');updateShowMode(false);}},{event:EVENT.OS_SEEKING,fn:function(e){me.control.setWait();status.setSDKStatus('seeking');updateShowMode(false);}},{event:EVENT.OS_PAUSE,fn:function(e){var t=status.get_played();var a=store.getDuration();if(t>1&&a&&Math.abs(a-t)<2){return;}
if(me.ableToPlay(t)){status.setSDKStatus('suspended');}else{status.setSDKStatus('stop');}
me.control.setPause();updateShowMode(true);}},{event:EVENT.OS_VOLUME_CHANGE,fn:function(e){me.control.setVolume(e.volume);}},{event:EVENT.OS_PLAYER_END,fn:function(e){playEnd();updateShowMode(true);}},{event:EVENT.OS_BLOCK,fn:function(e){status.setRunningStatus('error');me.control.setError(Error.NET_ERROR);}}]);if(ableRemember){me.rememberPlay(status,system,info['duration']|0);}
system.setPlayRate(setting.playbackRate);me.whenReadyToPlay=false;if(setting.isAutoPlay&&!version.IS_MOBILE){setTimeout(function(){me.whenReadyToPlay=true;me.control.setWait();system.play();},10);}else{me.control.setPause();}},rememberPlay:function(status,system,duration){var lPlayed=status.get_local_played()-0;var lVolume=status.get_local_volume()-0;if(lVolume>0){system.volume(lVolume);}
if(lPlayed>0){if(duration==0||(lPlayed+5<duration)){this.whenReadyToPlay=true;this.debug('记忆播放位置:',lPlayed);this.system.setUrl(this.video_data['url']);this.system.play();}}},switchClarity:function(no){var me=this;var data=me.video_data;var system=me.system;if(data['resolutionNameNo']==no||!me.store.isInDefinition(no)){me.debug('当前不支持该清晰度切换',no);}else{me.debug('当前清晰度',no);var video=me.video_data=me.store.getVideoInfo(constants.DEFINITION_NO_NAME[no|0]);var played=system.status.get_played();me.whenReadyToPlay=true;system.status.clear();system.status.setRememberKey(video.url);system.setUrl(video['url']);system.play(played);me.switchPlayTime=played;this.__filter_play();}},sdk_tecGet:function(attr,st){if(!this.store){return;}
var status=this.system.status;switch(attr){case("volume"):return status.get_volume();case("duration"):return this.store.getDuration();case("currentTime"):return status.get_played();case("clarity"):return this.video_data.resolutionNameNo;break;case("allClaritys"):var key,all=this.store.getUniqueNoDefinition(),ret=[];for(key in all){ret.push(all[key].resolutionNameNo);}
return ret;case('playState'):return status.getSDKStatus();}},sdk_operate:function(method,a,b,c){if(!this.store){return;}
this.debug('operate',method);switch(method){case("resize"):var $main=$('#'+this.store.getIDMain());$main.width(a).height(b);$main.parent().width(a).height(b);this.control.setResize();break;case("pause"):this.system.pause();break;case("resume"):this.toPlay();break;case("play"):this.toPlay(a);break;case("clarity"):this.switchClarity(b);break;case("capture"):break;case("destroy"):this.destroy();break;}},sdk_source:function(){if(this.store){var ret=$.extend({},this.store.getKeepArgs(),this.store.getMainOffset());delete ret.width;delete ret.height;this.destroy();return ret;}},sdk_barrage:function(barrageAryStr){},sdk_close_barrage:function(){}});});qcVideo('MediaPlayer_tpl',function(){return{'main':function(data){var __p=[],_p=function(s){__p.push(s)};_p('<style>\r\n\
       #');_p(this.__escapeHtml(data.mainId));_p('{\r\n\
           width:100%;height:100%;margin: 0px auto;position:relative;background-color: #000;\r\n\
       }\r\n\
       </style>\r\n\
    <div id="');_p(this.__escapeHtml(data.mainId));_p('" style="width:');_p(this.__escapeHtml(data.width));_p('px;height:');_p(this.__escapeHtml(data.height));_p('px"></div>');return __p.join("");},'patch':function(data){var __p=[],_p=function(s){__p.push(s)};_p('<div component="patch"></div>');return __p.join("");},'patch_image':function(data){var __p=[],_p=function(s){__p.push(s)};_p('<a style="');_p(this.__escapeHtml(data.astyle));_p('" href="');_p(this.__escapeHtml(data.link));_p('" ');_p(this.__escapeHtml((data.link.indexOf('javascript')>-1?'':' target="_blank"')));_p('><img style="');_p(this.__escapeHtml(data.istyle));_p('" src="');_p(this.__escapeHtml(data.url));_p('"/></a>');return __p.join("");},'logo':function(data){var __p=[],_p=function(s){__p.push(s)};_p('<div class="');_p(this.__escapeHtml(data.nick));_p('control-module" component="logo"></div>');return __p.join("");},'setting':function(data){var __p=[],_p=function(s){__p.push(s)};_p('<div class="');_p(this.__escapeHtml(data.nick));_p('setting" component="setting" style="display:none;">\r\n\
           <div sub-component="close" class="');_p(this.__escapeHtml(data.nick));_p('setting-close">>></div>\r\n\
       </div>');return __p.join("");},'setting_definition':function(data){var __p=[],_p=function(s){__p.push(s)};_p('<!--更换清晰度-->\r\n\
       <div class="setting-definition">');_p(this.__escapeHtml(data.name));_p('</div>\r\n\
       <div class="setting-split-line"></div>\r\n\
       <div>');var value=data.values;for(var key in value){var one=value[key];_p('            <div sub-component="definition" class="');_p(this.__escapeHtml(one.selected?'setting-definition-value-curr':'setting-definition-value'));_p('" data-def="');_p(this.__escapeHtml(one['sdk_no']));_p('">');_p(this.__escapeHtml(one['sdk_name']));_p('</div>');}_p('    </div>');return __p.join("");},'center':function(data){var __p=[],_p=function(s){__p.push(s)};var i=data.nick;var dot=i+'spinner-dot '+i+'spinner-dot';_p('    <div component="center_container">\r\n\
           <div class="');_p(this.__escapeHtml(i));_p('error" sub-component="error">\r\n\
   \r\n\
           </div>\r\n\
           <div class="');_p(this.__escapeHtml(i));_p('spinner" sub-component="loading" style="min-width:22px;min-height:22px;max-width:100px;max-height:100px;">\r\n\
               <svg height="100%" version="1.1" viewBox="0 0 22 22" width="100%">\r\n\
                   <svg x="7" y="1"><circle class="');_p(this.__escapeHtml(dot));_p('-1" cx="4" cy="4" r="2"></circle></svg>\r\n\
                   <svg x="11" y="3"><circle class=');_p(this.__escapeHtml(dot));_p('-2" cx="4" cy="4" r="2"></circle></svg>\r\n\
                   <svg x="13" y="7"><circle class="');_p(this.__escapeHtml(dot));_p('-3" cx="4" cy="4" r="2"></circle></svg>\r\n\
                   <svg x="11" y="11"><circle class="');_p(this.__escapeHtml(dot));_p('-4" cx="4" cy="4" r="2"></circle></svg>\r\n\
                   <svg x="7" y="13"><circle class="');_p(this.__escapeHtml(dot));_p('-5" cx="4" cy="4" r="2"></circle></svg>\r\n\
                   <svg x="3" y="11"><circle class="');_p(this.__escapeHtml(dot));_p('-6" cx="4" cy="4" r="2"></circle></svg>\r\n\
                   <svg x="1" y="7"><circle class="');_p(this.__escapeHtml(dot));_p('-7" cx="4" cy="4" r="2"></circle></svg>\r\n\
                   <svg x="3" y="3"><circle class="');_p(this.__escapeHtml(dot));_p('-8" cx="4" cy="4" r="2"></circle></svg>\r\n\
               </svg>\r\n\
           </div>\r\n\
           <div class="');_p(this.__escapeHtml(i));_p('play-controller" sub-component="play" style="width: 98px;margin: -49px 0 0 -49px;">\r\n\
               <svg height="100%" version="1.1" viewBox="0 0 98 98" width="100%">\r\n\
                   <circle cx="49" cy="49" fill="#000" stroke="#fff" stroke-width="2" fill-opacity="0.5" r="48" data-opacity="true"></circle>\r\n\
                   <circle cx="-49" cy="49" fill-opacity="0" r="46.5" stroke="#fff"\r\n\
                           stroke-dasharray="293" stroke-dashoffset="-293.0008789998712" stroke-width="4"\r\n\
                           transform="rotate(-90)"></circle>\r\n\
                   <polygon fill="#fff" points="32,27 72,49 32,71"></polygon>\r\n\
               </svg>\r\n\
           </div>\r\n\
       </div>');return __p.join("");},'bottom':function(data){var __p=[],_p=function(s){__p.push(s)};var nick=data.nick;_p('    <!--底部控制栏-->\r\n\
       <div data-resize-module="bottom" class="');_p(this.__escapeHtml(nick));_p('control-bottom ');_p(this.__escapeHtml(nick));_p('control-bottom-flow" component="bottom_container" style="display:none;">\r\n\
           <div style="width:99%;height:36px;margin:0px auto;position:relative;  background: #000;">\r\n\
               <!--进度栏-->\r\n\
               <div class="');_p(this.__escapeHtml(nick));_p('progress-bar-container">\r\n\
                   <div class="');_p(this.__escapeHtml(nick));_p('progress-bar" aria-label="播放滑块" style="touch-action: none;');_p(this.__escapeHtml(data.version.IS_MOBILE?'display:none':''));_p('">\r\n\
                       <div class="');_p(this.__escapeHtml(nick));_p('progress-list" sub-component="progress_bg">\r\n\
                           <div class="');_p(this.__escapeHtml(nick));_p('play-progress ');_p(this.__escapeHtml(nick));_p('in-bg-color" style="/*transform: scaleX(0.001);*/width:1%;"\r\n\
                                sub-component="progress_play"></div>\r\n\
                           <div class="');_p(this.__escapeHtml(nick));_p('load-progress" style="/*transform: scaleX(0.001);*/width:1%;" sub-component="progress_load"></div>\r\n\
                       </div>\r\n\
                       <div class="');_p(this.__escapeHtml(nick));_p('scrubber-button ');_p(this.__escapeHtml(nick));_p('in-bg-color"\r\n\
                            style="left: 0px; height: 13px; " sub-component="progress_pointer" draggable="true"></div>\r\n\
                   </div>\r\n\
               </div>\r\n\
   \r\n\
               <div class="');_p(this.__escapeHtml(nick));_p('bottom-controls" style="');_p(this.__escapeHtml(data.version.IS_MOBILE?'border-top: solid 1px rgba(255, 255, 255, .2)':''));_p('">\r\n\
                   <!--播放-->\r\n\
                   <button class="');_p(this.__escapeHtml(nick));_p('button" style="width:36px;height:36px;float:left;" title="');_p(this.__escapeHtml(data.WORD.PLAY));_p('" sub-component="play_btn" now="play">\r\n\
                       <!--firefox:svg:animate not support--->\r\n\
                       <!--SVG底部 播放 按钮-->\r\n\
                       <svg svg-mode="svg_bottom_play" width="100%" height="100%" viewBox="0 0 36 36" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\r\n\
                           <path d="M11,10 L18,13.74 18,22.28 11,26 M18,13.74 L26,18 26,18 18,22.28" fill="#fff"></path>\r\n\
                       </svg>\r\n\
                       <!--SVG底部 暂停 按钮-->\r\n\
                       <svg svg-mode="svg_bottom_pause" style="width:0px;height:0px" width="100%" height="100%" viewBox="0 0 36 36" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\r\n\
                           <path d="M11,10 L17,10 17,26 11,26 M20,10 L26,10 26,26 20,26" fill="#fff"></path>\r\n\
                       </svg>\r\n\
                   </button>');if(data['is_max_screen']){_p('\r\n\
                       <!--静音-->\r\n\
                       <div class="');_p(this.__escapeHtml(nick));_p('volume-control" style="float:left;">\r\n\
                           <button class="');_p(this.__escapeHtml(nick));_p('button" style="width:36px;height:36px;" title="');_p(this.__escapeHtml(data.WORD.MUTE));_p('" sub-component="volume_mute" now="volume">\r\n\
                               <!--SVG底部 音量 按钮-->\r\n\
                               <svg svg-mode="svg_bottom_volume" width="100%" height="100%" viewBox="0 0 36 36" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\r\n\
                                   <path d="M12.39,15.54 L10,15.54 L10,20.44 L12.4,20.44 L17,25.50 L17,10.48 L12.39,15.54 Z" opacity="1" fill="#fff"></path>\r\n\
                                   <path d="M12.39,15.54 L10,15.54 L10,20.44 L12.4,20.44 L17,25.50 L17,10.48 L12.39,15.54 Z" opacity="1" fill="#fff"></path>\r\n\
                                   <path d="M22,17.99 C22,16.4 20.74,15.05 19,14.54 L19,21.44 C20.74,20.93 22,19.59 22,17.99 Z" opacity="1" fill="#fff"></path>\r\n\
                                   <path d="M22,17.99 C22,16.4 20.74,15.05 19,14.54 L19,21.44 C20.74,20.93 22,19.59 22,17.99 Z" opacity="1" fill="#fff"></path>\r\n\
                               </svg>\r\n\
   \r\n\
                               <!--SVG底部 音量静音 按钮-->\r\n\
                               <svg style="width:0px;height:0px" svg-mode="svg_bottom_volume_mute" width="100%" height="100%" viewBox="0 0 36 36" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\r\n\
                                   <path d="M12.39,15.54 L10,15.54 L10,20.44 L12.4,20.44 L17,25.50 L17,10.48 L12.39,15.54 Z" opacity="1" fill="#fff"></path>\r\n\
                                   <path d="M12.39,15.54 L10,15.54 L10,20.44 L12.4,20.44 L17,25.50 L17,10.48 L12.39,15.54 Z" opacity="1" fill="#fff"></path>\r\n\
                                   <path d="M19.63,15.92 L20.68,14.93 L22.81,16.94 L24.94,14.93 L26,15.92 L23.86,17.93 L26,19.93 L24.94,20.92 L22.81,18.92 L20.68,20.92 L19.63,19.93 L21.76,17.93 L19.63,15.92 Z" opacity="1" fill="#fff"></path>\r\n\
                                   <path d="M19.63,15.92 L20.68,14.93 L22.81,16.94 L24.94,14.93 L26,15.92 L23.86,17.93 L26,19.93 L24.94,20.92 L22.81,18.92 L20.68,20.92 L19.63,19.93 L21.76,17.93 L19.63,15.92 Z" opacity="1" fill="#fff"></path>\r\n\
                               </svg>\r\n\
   \r\n\
                               <!--SVG底部 音量满格 按钮-->\r\n\
                               <svg style="width:0px;height:0px" svg-mode="svg_bottom_volume_full" width="100%" height="100%" viewBox="0 0 36 36" version="1.1" xmlns="http://www.w3.org/2000/svg"\r\n\
                                    xmlns:xlink="http://www.w3.org/1999/xlink">\r\n\
                                   <path d="M12.39,15.54 L10,15.54 L10,20.44 L12.4,20.44 L17,25.50 L17,10.48 L12.39,15.54 Z" opacity="1" fill="#fff"></path>\r\n\
                                   <path d="M12.39,15.54 L10,15.54 L10,20.44 L12.4,20.44 L17,25.50 L17,10.48 L12.39,15.54 Z" opacity="1" fill="#fff"></path>\r\n\
                                   <path d="M22,17.99 C22,16.4 20.74,15.05 19,14.54 L19,21.44 C20.74,20.93 22,19.59 22,17.99 Z" opacity="1" fill="#fff"></path>\r\n\
                                   <path d="M22,17.99 C22,16.4 20.74,15.05 19,14.54 L19,21.44 C20.74,20.93 22,19.59 22,17.99 Z" opacity="1" fill="#fff"></path>\r\n\
                                   <path d="M19,24.31 L19,26 C22.99,25.24 26,21.94 26,18 C26,14.05 22.99,10.75 19,10 L19,11.68 C22.01,12.41 24.24,14.84 24.24,18 C24.24,21.15 22.01,23.58 19,24.31 Z" opacity="1" fill="#fff"></path>\r\n\
                                   <path d="M19,24.31 L19,26 C22.99,25.24 26,21.94 26,18 C26,14.05 22.99,10.75 19,10 L19,11.68 C22.01,12.41 24.24,14.84 24.24,18 C24.24,21.15 22.01,23.58 19,24.31 Z" opacity="1" fill="#fff"></path>\r\n\
                               </svg>\r\n\
                           </button>\r\n\
   \r\n\
                           <div class="');_p(this.__escapeHtml(nick));_p('volume-panel" title="');_p(this.__escapeHtml(data.WORD.TIP_OPR_VOLUME));_p('" style="">\r\n\
                               <div class="');_p(this.__escapeHtml(nick));_p('volume-slider" style="touch-action: none;" sub-component="volume_bg" >\r\n\
                                   <div class="');_p(this.__escapeHtml(nick));_p('volume-slider-track-after"></div>\r\n\
                                   <div class="');_p(this.__escapeHtml(nick));_p('volume-slider-track ');_p(this.__escapeHtml(nick));_p('in-bg-color" style="width: 24px;" sub-component="volume_track"></div>\r\n\
                                   <div class="');_p(this.__escapeHtml(nick));_p('volume-slider-handle" style="left: 24px;" sub-component="volume_slider" draggable="true"></div>\r\n\
                               </div>\r\n\
                           </div>\r\n\
                       </div>');}_p('\r\n\
                   <!--播放进度-->\r\n\
                   <div class="');_p(this.__escapeHtml(nick));_p('time-progress" style="float:left;">\r\n\
                       <span class="');_p(this.__escapeHtml(nick));_p('in-color" sub-component="time_played">00:00:00</span>\r\n\
                       <span sub-component="time_duration">--</span>\r\n\
                   </div>\r\n\
                   <!--全屏按钮-->\r\n\
                   <button class="');_p(this.__escapeHtml(nick));_p('button ');_p(this.__escapeHtml(nick));_p('control-left" style="right: 5px;" title="');_p(this.__escapeHtml(data.WORD.FULL_SCREEN));_p('" sub-component="fullscreen_btn" now="fullscreen">\r\n\
                       <!--SVG底部 全屏 按钮-->\r\n\
                       <svg svg-mode="svg_bottom_fullscreen" xmlns:xlink="http://www.w3.org/1999/xlink" height="100%" version="1.1" viewBox="0 0 36 36" width="100%">\r\n\
                           <defs>\r\n\
                               <path d="M7,16 L10,16 L10,13 L13,13 L13,10 L7,10 L7,16 Z" id="svg-full-1"></path>\r\n\
                               <path d="M23,10 L23,13 L26,13 L26,16 L29,16 L29,10 L23,10 Z" id="svg-full-2"></path>\r\n\
                               <path d="M23,23 L23,26 L29,26 L29,20 L26,20 L26,23 L23,23 Z" id="svg-full-3"></path>\r\n\
                               <path d="M10,20 L7,20 L7,26 L13,26 L13,23 L10,23 L10,20 Z" id="svg-full-4"></path>\r\n\
                           </defs>\r\n\
                           <use fill="#fff" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#svg-full-1"></use>\r\n\
                           <use fill="#fff" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#svg-full-2"></use>\r\n\
                           <use fill="#fff" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#svg-full-3"></use>\r\n\
                           <use fill="#fff" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#svg-full-4"></use>\r\n\
                       </svg>\r\n\
   \r\n\
                       <!--SVG底部 退出全屏 按钮-->\r\n\
                       <svg style="width:0px;height:0px" svg-mode="svg_bottom_quit_fullscreen" xmlns:xlink="http://www.w3.org/1999/xlink" height="100%" version="1.1" viewBox="0 0 36 36" width="100%">\r\n\
                           <defs>\r\n\
                               <path d="M13,10 L10,10 L10,13 L7,13 L7,16 L13,16 L13,10 Z" id="svg-quit-1"></path>\r\n\
                               <path d="M29,16 L29,13 L26,13 L26,10 L23,10 L23,16 L29,16 Z" id="svg-quit-2"></path>\r\n\
                               <path d="M29,23 L29,20 L23,20 L23,26 L26,26 L26,23 L29,23 Z" id="svg-quit-3"></path>\r\n\
                               <path d="M10,26 L13,26 L13,20 L7,20 L7,23 L10,23 L10,26 Z" id="svg-quit-4"></path>\r\n\
                           </defs>\r\n\
                           <use stroke="#000" stroke-opacity=".15" stroke-width="2px" xlink:href="#svg-quit-1"></use>\r\n\
                           <use stroke="#000" stroke-opacity=".15" stroke-width="2px" xlink:href="#svg-quit-2"></use>\r\n\
                           <use stroke="#000" stroke-opacity=".15" stroke-width="2px" xlink:href="#svg-quit-3"></use>\r\n\
                           <use stroke="#000" stroke-opacity=".15" stroke-width="2px" xlink:href="#svg-quit-4"></use>\r\n\
                           <use fill="#fff" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#svg-quit-1"></use>\r\n\
                           <use fill="#fff" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#svg-quit-2"></use>\r\n\
                           <use fill="#fff" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#svg-quit-3"></use>\r\n\
                           <use fill="#fff" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#svg-quit-4"></use>\r\n\
                       </svg>\r\n\
                   </button>\r\n\
   \r\n\
                   <!--设置-->\r\n\
                   <button class="');_p(this.__escapeHtml(nick));_p('button ');_p(this.__escapeHtml(nick));_p('control-left" style="right: 41px;" title="');_p(this.__escapeHtml(data.WORD.SETTING));_p('" sub-component="setting">\r\n\
                       <svg xmlns:xlink="http://www.w3.org/1999/xlink" height="100%" version="1.1" viewBox="0 0 36 36" width="100%">\r\n\
                           <defs>\r\n\
                               <path d="M27,19.35 L27,16.65 L24.61,16.65 C24.44,15.79 24.10,14.99 23.63,14.28 L25.31,12.60 L23.40,10.69 L21.72,12.37 C21.01,11.90 20.21,11.56 19.35,11.38 L19.35,9 L16.65,9 L16.65,11.38 C15.78,11.56 14.98,11.90 14.27,12.37 L12.59,10.69 L10.68,12.60 L12.36,14.28 C11.89,14.99 11.55,15.79 11.38,16.65 L9,16.65 L9,19.35 L11.38,19.35 C11.56,20.21 11.90,21.01 12.37,21.72 L10.68,23.41 L12.59,25.32 L14.28,23.63 C14.99,24.1 15.79,24.44 16.65,24.61 L16.65,27 L19.35,27 L19.35,24.61 C20.21,24.44 21.00,24.1 21.71,23.63 L23.40,25.32 L25.31,23.41 L23.62,21.72 C24.09,21.01 24.43,20.21 24.61,19.35 L27,19.35 Z M18,22.05 C15.76,22.05 13.95,20.23 13.95,18 C13.95,15.76 15.76,13.95 18,13.95 C20.23,13.95 22.05,15.76 22.05,18 C22.05,20.23 20.23,22.05 18,22.05 L18,22.05 Z"\r\n\
                                     id="svg-setting"></path>\r\n\
                           </defs>\r\n\
                           <use xlink:href="#svg-setting" fill="#fff"></use>\r\n\
                       </svg>\r\n\
                   </button>\r\n\
               </div>\r\n\
           </div>\r\n\
       </div>');return __p.join("");},'controller':function(data){var __p=[],_p=function(s){__p.push(s)};_p(this.style(data));_p('    <div h5-controller id="');_p(this.__escapeHtml(data.controller.id));_p('" style="position: absolute;top: 0px;left: 0px;width: 100%;height: 100%;z-index:3;">\r\n\
           <!--<div style="position:abolute;width:100%;height:100%;z-index:2" data-mask="video"></div>  -->');_p(this.center(data));_p('        ');_p(this.bottom(data));_p('        ');_p(this.patch(data));_p('        ');_p(this.logo(data));_p('        ');_p(this.setting(data));_p('    </div>');return __p.join("");},'video':function(data){var __p=[],_p=function(s){__p.push(s)};_p('<div style="position: relative;width: 100%;height: 100%;  overflow: hidden;-webkit-box-sizing: border-box;box-sizing: border-box;">\r\n\
           <video\r\n\
           oncontextmenu="return false;"\r\n\
           preload="none"\r\n\
           x-webkit-airplay="true"\r\n\
           webkit-playsinline="true"\r\n\
           id="');_p(data.vid);_p('" width="100%" height="100%"\r\n\
           style="z-index: 1;overflow: hidden;box-sizing: border-box;position: absolute;top: -200%;left: 0px;">\r\n\
               <source src=\'');_p(data.url);_p('\' type="');_p(data.type);_p('"/>\r\n\
           </video>\r\n\
       </div>');return __p.join("");},'style':function(data){var __p=[],_p=function(s){__p.push(s)};_p('<style>');_p(this.style_center(data));_p('        ');_p(this.style_bottom(data));_p('        ');_p(this.style_setting(data));_p('    </style>');return __p.join("");},'style_setting':function(data){var __p=[],_p=function(s){__p.push(s)};_p('.');_p(this.__escapeHtml(data.nick));_p('setting{z-index: 200;/*height: 100%;*/position: absolute;top: 0px;opacity: 0;width: 100%;color: #fff;font-size: 1rem;display:none;background-color:#000;text-align: center;}\r\n\
      .');_p(this.__escapeHtml(data.nick));_p('setting-close{top: 45%;right: 2px;font-size: 2em;display: inline-block;padding: 3px;position: absolute;cursor: pointer;opacity: 0.6;}\r\n\
      .');_p(this.__escapeHtml(data.nick));_p('setting-close:hover{opacity: 1;}\r\n\
      .');_p(this.__escapeHtml(data.nick));_p('setting .setting-split-line{width: 90%;height: 1px;background-color: rgb(0,160,233);border: none;margin: 0px auto;margin-bottom: 10px;}\r\n\
      .');_p(this.__escapeHtml(data.nick));_p('setting .setting-definition{width: 100%;margin: 1em 0;font-size:1.5em;}\r\n\
      .');_p(this.__escapeHtml(data.nick));_p('setting .setting-definition-value-curr,.');_p(this.__escapeHtml(data.nick));_p('setting .setting-definition-value{font-size: 1.5em;display: inline-block;padding:2px 0.5em;}\r\n\
      .');_p(this.__escapeHtml(data.nick));_p('setting .setting-definition-value:hover{color: rgb(0,160,233);}\r\n\
      .');_p(this.__escapeHtml(data.nick));_p('setting .setting-definition-value{cursor: pointer;}\r\n\
      .');_p(this.__escapeHtml(data.nick));_p('setting .setting-definition-value-curr{cursor: default;border: 2px solid rgb(0,160,233);border-radius: 2px;color: rgb(0,160,233);}');return __p.join("");},'style_center':function(data){var __p=[],_p=function(s){__p.push(s)};var nick=data.nick;_p('\r\n\
       .');_p(this.__escapeHtml(nick));_p('control-module{position: absolute;top: 0px;left: 0px;}\r\n\
   \r\n\
       .');_p(this.__escapeHtml(nick));_p('play-controller{\r\n\
         position: absolute;\r\n\
         left: 50%;\r\n\
         top: 50%;\r\n\
         display:none;\r\n\
         z-index: 101;\r\n\
         cursor: pointer;\r\n\
       }\r\n\
   \r\n\
       /**转菊花开始**/\r\n\
       .');_p(this.__escapeHtml(nick));_p('spinner {\r\n\
           position: absolute;\r\n\
           left: 45%;\r\n\
           top: 45%;\r\n\
           width: 10%;\r\n\
           height: 10%;\r\n\
           z-index: 102;\r\n\
       }\r\n\
       .');_p(this.__escapeHtml(nick));_p('error {\r\n\
             position: absolute;\r\n\
             left: 0;\r\n\
             top: 45%;\r\n\
             width: 100%;\r\n\
             height: 20%;\r\n\
             z-index: 102;\r\n\
             display: none;\r\n\
             text-align: center;\r\n\
             font-size: 1rem;\r\n\
             color: red;\r\n\
       }');var keyFrames=['@keyframes','@-moz-keyframes','@-webkit-keyframes'];var i=0;for(var i=0;i<keyFrames.length;i++){_p('        ');_p(this.__escapeHtml(keyFrames[i]));_p(' ');_p(this.__escapeHtml(nick));_p('spinner-dot-fade {\r\n\
               0% {\r\n\
                   opacity: .5;\r\n\
                   -moz-transform: scale(1.2,1.2);\r\n\
                   -ms-transform: scale(1.2,1.2);\r\n\
                   -webkit-transform: scale(1.2,1.2);\r\n\
                   transform: scale(1.2,1.2)\r\n\
               }\r\n\
   \r\n\
               50% {\r\n\
                   opacity: .15;\r\n\
                   -moz-transform: scale(.9,.9);\r\n\
                   -ms-transform: scale(.9,.9);\r\n\
                   -webkit-transform: scale(.9,.9);\r\n\
                   transform: scale(.9,.9)\r\n\
               }\r\n\
   \r\n\
               to {\r\n\
                   opacity: .15;\r\n\
                   -moz-transform: scale(.85,.85);\r\n\
                   -ms-transform: scale(.85,.85);\r\n\
                   -webkit-transform: scale(.85,.85);\r\n\
                   transform: scale(.85,.85)\r\n\
               }\r\n\
           }');}
_p('\r\n\
   \r\n\
      .');_p(this.__escapeHtml(nick));_p('spinner-dot {\r\n\
          -moz-animation: ');_p(this.__escapeHtml(nick));_p('spinner-dot-fade .8s ease infinite;\r\n\
          -webkit-animation: ');_p(this.__escapeHtml(nick));_p('spinner-dot-fade .8s ease infinite;\r\n\
          animation: ');_p(this.__escapeHtml(nick));_p('spinner-dot-fade .8s ease infinite;\r\n\
          opacity: 0;\r\n\
          /*fill: #1275cf;*/\r\n\
          fill: #fff;\r\n\
          -moz-transform-origin: 4px 4px;\r\n\
          -ms-transform-origin: 4px 4px;\r\n\
          -webkit-transform-origin: 4px 4px;\r\n\
          transform-origin: 4px 4px\r\n\
      }');var i=0,j=7;for(;i<7;i++){_p('            .');_p(this.__escapeHtml(nick));_p('spinner-dot-');_p(this.__escapeHtml(i+1));_p(' { -moz-animation-delay: .');_p(this.__escapeHtml(i+1));_p('s; -webkit-animation-delay: .');_p(this.__escapeHtml(i+1));_p('s; animation-delay: .');_p(this.__escapeHtml(i+1));_p('s }');}
_p('   /**转菊花结束**/');return __p.join("");},'style_bottom':function(data){var __p=[],_p=function(s){__p.push(s)};var i='#'+data.controller.id;var nick=data.nick;_p('        ');_p(this.__escapeHtml(i));_p(' button, ');_p(this.__escapeHtml(i));_p(' svg { margin: 0px; padding: 0px; }\r\n\
   \r\n\
           .');_p(this.__escapeHtml(nick));_p('control-bottom {\r\n\
               position: absolute;\r\n\
               text-shadow: 0 0 2px rgba(0, 0, 0, .5);\r\n\
               bottom: 0;\r\n\
               height: 36px;\r\n\
               width: 100%;\r\n\
               z-index: 61;\r\n\
               text-align: left;\r\n\
               direction: ltr;\r\n\
               font-size: 11px;\r\n\
           }\r\n\
   \r\n\
           .');_p(this.__escapeHtml(nick));_p('control-left{width:36px;height:36px;position: absolute;z-index: 3;bottom: 0px; }\r\n\
   \r\n\
           .');_p(this.__escapeHtml(nick));_p('control-bottom, .');_p(this.__escapeHtml(nick));_p('scrubber-button,.');_p(this.__escapeHtml(nick));_p('setting {\r\n\
               -moz-transition: opacity .25s cubic-bezier(0.0, 0.0, 0.2, 1);\r\n\
               -webkit-transition: opacity .25s cubic-bezier(0.0, 0.0, 0.2, 1);\r\n\
               transition: opacity .25s cubic-bezier(0.0, 0.0, 0.2, 1);\r\n\
           }\r\n\
   \r\n\
           .');_p(this.__escapeHtml(nick));_p('progress-bar-container {\r\n\
               display: block;\r\n\
               position: absolute;\r\n\
               width: 100%;\r\n\
               bottom: 36px;\r\n\
               height: 5px;\r\n\
           }\r\n\
   \r\n\
           .');_p(this.__escapeHtml(nick));_p('progress-bar-container:hover{height:15px; }\r\n\
           .');_p(this.__escapeHtml(nick));_p('progress-bar-container:hover .');_p(this.__escapeHtml(nick));_p('scrubber-button{ top: 1px; height: 15px;width: 15px;}\r\n\
   \r\n\
           .');_p(this.__escapeHtml(nick));_p('progress-bar {\r\n\
               position: absolute;\r\n\
               bottom: 0;\r\n\
               left: 0;\r\n\
               width: 100%;\r\n\
               height: 100%;\r\n\
               z-index: 31;\r\n\
               outline: none;\r\n\
           }\r\n\
   \r\n\
           .');_p(this.__escapeHtml(nick));_p('progress-list {\r\n\
               cursor: pointer;\r\n\
               z-index: 39;\r\n\
               background: rgba(255, 255, 255, .2);\r\n\
               height: 100%;\r\n\
               -moz-transform: scaleY(0.6);\r\n\
               -ms-transform: scaleY(0.6);\r\n\
               -webkit-transform: scaleY(0.6);\r\n\
               transform: scaleY(0.6);\r\n\
               -moz-transition: -moz-transform .1s cubic-bezier(0.4, 0.0, 1, 1);\r\n\
               -webkit-transition: -webkit-transform .1s cubic-bezier(0.4, 0.0, 1, 1);\r\n\
               -ms-transition: -ms-transform .1s cubic-bezier(0.4, 0.0, 1, 1);\r\n\
               transition: transform .1s cubic-bezier(0.4, 0.0, 1, 1);\r\n\
           }\r\n\
   \r\n\
           .');_p(this.__escapeHtml(nick));_p('load-progress, .');_p(this.__escapeHtml(nick));_p('play-progress {\r\n\
               cursor: pointer;\r\n\
               position: absolute;\r\n\
               left: 0;\r\n\
               bottom: 0;\r\n\
               width: 100%;\r\n\
               height: 100%;\r\n\
               -moz-transform-origin: 0 0;\r\n\
               -ms-transform-origin: 0 0;\r\n\
               -webkit-transform-origin: 0 0;\r\n\
               transform-origin: 0 0;\r\n\
           }\r\n\
   \r\n\
           .');_p(this.__escapeHtml(nick));_p('play-progress { z-index: 34; }\r\n\
   \r\n\
           .');_p(this.__escapeHtml(nick));_p('load-progress { z-index: 33; background: rgba(255, 255, 255, .4); }\r\n\
   \r\n\
           .');_p(this.__escapeHtml(nick));_p('scrubber-button {\r\n\
               height: 13px;\r\n\
               width: 13px;\r\n\
               z-index: 43;\r\n\
               top: -4px;\r\n\
               position: absolute;\r\n\
               margin-left: -6.5px;\r\n\
               border-radius: 6.5px;\r\n\
               opacity: 0;\r\n\
               cursor: e-resize;\r\n\
               -moz-transition: -moz-transform .1s cubic-bezier(0.0, 0.0, 0.2, 1);\r\n\
               -webkit-transition: -webkit-transform .1s cubic-bezier(0.0, 0.0, 0.2, 1);\r\n\
               -ms-transition: -ms-transform .1s cubic-bezier(0.0, 0.0, 0.2, 1);\r\n\
               transition: transform .1s cubic-bezier(0.0, 0.0, 0.2, 1);\r\n\
           }\r\n\
   \r\n\
   \r\n\
           .');_p(this.__escapeHtml(nick));_p('bottom-controls { height: 36px; line-height: 36px; text-align: left; direction: ltr;  position: relative;overflow: hidden; }\r\n\
   \r\n\
           .');_p(this.__escapeHtml(nick));_p('button {\r\n\
   \r\n\
               border: none;\r\n\
               background-color: transparent;\r\n\
               padding: 0;\r\n\
               color: inherit;\r\n\
               text-align: inherit;\r\n\
               font-family: inherit;\r\n\
               cursor: default;\r\n\
               line-height: inherit;\r\n\
               cursor: pointer;\r\n\
               opacity: 0.7;\r\n\
   \r\n\
           }\r\n\
   \r\n\
           .');_p(this.__escapeHtml(nick));_p('in-bg-color { background: #1275cf; }\r\n\
   \r\n\
           .');_p(this.__escapeHtml(nick));_p('in-color { color: #1275cf; }\r\n\
   \r\n\
           .');_p(this.__escapeHtml(nick));_p('volume-control { display: inline-block; }\r\n\
   \r\n\
           .');_p(this.__escapeHtml(nick));_p('volume-panel{\r\n\
               display: inline-block;\r\n\
               width: 49px;\r\n\
               height: 36px;\r\n\
               -moz-transition: width .2s cubic-bezier(0.4, 0.0, 1, 1);\r\n\
               -webkit-transition: width .2s cubic-bezier(0.4, 0.0, 1, 1);\r\n\
               transition: width .2s cubic-bezier(0.4, 0.0, 1, 1);\r\n\
               cursor: pointer;\r\n\
               overflow: hidden;\r\n\
               outline: 0;\r\n\
               padding-right: 4px;\r\n\
           }\r\n\
   \r\n\
           .');_p(this.__escapeHtml(nick));_p('volume-slider { height: 100%; position: relative; }\r\n\
   \r\n\
           .');_p(this.__escapeHtml(nick));_p('volume-slider-track{\r\n\
               position: absolute;\r\n\
               display: block;\r\n\
               top: 50%;\r\n\
               left: 0;\r\n\
               height: 3px;\r\n\
               margin-top: -1.5px;\r\n\
           }\r\n\
   \r\n\
           .');_p(this.__escapeHtml(nick));_p('volume-slider-track-after {\r\n\
                 content: \'\';\r\n\
                 width: 49px;\r\n\
                 background: rgba(255, 255, 255, .2);\r\n\
                 position: absolute;\r\n\
                 top: 50%;\r\n\
                 left: 0;\r\n\
                 height: 3px;\r\n\
                 margin-top: -1.5px;\r\n\
           }\r\n\
   \r\n\
           .');_p(this.__escapeHtml(nick));_p('volume-slider-handle {\r\n\
               position: absolute;\r\n\
               top: 50%;\r\n\
               width: 4px;\r\n\
               height: 13px;\r\n\
               margin-top: -6.5px;\r\n\
               background: #fff;\r\n\
               cursor: e-resize;\r\n\
                opacity: 0.7;\r\n\
           }\r\n\
   \r\n\
           .');_p(this.__escapeHtml(nick));_p('time-progress { color: #ddd; display: inline-block; vertical-align: top; }\r\n\
   \r\n\
           .');_p(this.__escapeHtml(nick));_p('control-bottom { opacity: 0.5; }\r\n\
           .');_p(this.__escapeHtml(nick));_p('scrubber-button { opacity: 0; }\r\n\
   \r\n\
           .');_p(this.__escapeHtml(nick));_p('control-bottom-flow:hover, .');_p(this.__escapeHtml(nick));_p('control-bottom-stick:hover,\r\n\
           .');_p(this.__escapeHtml(nick));_p('control-bottom-flow:hover .');_p(this.__escapeHtml(nick));_p('scrubber-button,\r\n\
           .');_p(this.__escapeHtml(nick));_p('control-bottom-stick .');_p(this.__escapeHtml(nick));_p('scrubber-button,\r\n\
           .');_p(this.__escapeHtml(nick));_p('control-bottom-stick:hover .');_p(this.__escapeHtml(nick));_p('scrubber-button { opacity: 1; }');return __p.join("");},__escapeHtml:(function(){var a={"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;","/":"&#x2F;"},b=/[&<>'"\/]/g;return function(c){if(typeof c!=="string")return c;return c?c.replace(b,function(b){return a[b]||b}):""}})()}});;qcVideo('PlayerStatus',function(Base,constants,lStore){var blockTime=25000,EVENT=constants.EVENT,undefined=undefined;return Base.extend({className:'PlayerStatus',clear:function(){var me=this;me._start_duration=0;me.played=0;me.duration=0;me.loaded=0;me.loaded_overtime=0;me.errorCode=0;},start_duration:function(second){if(second!==undefined){this._start_duration=second;}else{return this._start_duration;}},check:function(){var me=this;if(me.__isMaybeBlockStatus()){if(me.played>=me.duration&&me.duration>0){me.fire(EVENT.OS_PLAYER_END);}
var dif=+new Date()-me.status_start;if(dif>blockTime&&me.__getStatusValue()===me.status_value&&!me.inCache(me.played)){me.debug('overtime',dif);me.fire(EVENT.OS_BLOCK);}}},constructor:function(){var me=this;me.clear();me.remember=false;},enableRemember:function(bool){this.remember=bool;},setRememberKey:function(key){this.rememberKey=key;},destroy:function(){},__getStatusValue:function(){return this.played+':'+this.loaded+':'+this.duration;},__isMaybeBlockStatus:function(){return this.status==='play'||this.status==='load';},setRunningStatus:function(status){this.status=status;this.status_start=+new Date();this.status_value=this.__getStatusValue();},getRunningStatus:function(){return this.status;},setSDKStatus:function(s){this._sdk_status=s;},getSDKStatus:function(){return this._sdk_status;},set_duration:function(num){this.duration=num-0;},set_loaded:function(num){this.loaded=num-0;this.fire(EVENT.OS_PROGRESS);},get_loaded:function(){return this.loaded|0+this._start_duration;},set_played:function(num){this.played=num-0;this.fire(EVENT.OS_TIME_UPDATE);if(this.remember){lStore.set(this.rememberKey+'_played',this.get_played());this.get_local_played();}},set_volume:function(num){this._volume=num;if(this.remember){lStore.set('volume',num);this.get_local_volume();}},get_volume:function(){return this._volume||(lStore.get('volume')|0)||0.5;},get_local_volume:function(){return lStore.get('volume');},get_local_played:function(){return lStore.get(this.rememberKey+'_played');},get_played:function(){return this.played|0+this._start_duration;},inCache:function(second){var loaded=this.get_loaded();var start=this.start_duration();this.debug(loaded,start,second);if(this.loaded>0&&second<=loaded+5&&second>=start){this.debug('in mem');return true;}
this.debug('out mem');return false;}});});;qcVideo('PlayerStore',function($,Base,util,constants,TDBankReporter){var undefined=undefined;return Base.extend({className:'PlayerStore',constructor:function(store){this.store=store;},destroy:function(){delete this.store;},_getPoster:function(pos){var image_url=this.store.image_url,imgs=this.store.imgUrls,patch=this.store.patch,maxSize=0,maxPosition=0,tempSize=0;if(patch&&patch[pos]&&patch[pos]['url']){return patch[pos];}
if(pos==constants.PATCH_LOC.START&&image_url&&image_url.indexOf('p.qpic.cn')==-1){return{url:image_url,type:pos,redirect:''}}
if(image_url&&imgs&&imgs.length>0&&pos==constants.PATCH_LOC.START){var user_choose_url=image_url.substring(0,image_url.lastIndexOf('/'));for(var i=0,j=imgs.length;i<j;i++){tempSize=(imgs[i]['vheight']|0)*(imgs[i]['vwidth']|0);if(tempSize>maxSize&&imgs[i].url.indexOf(user_choose_url)!=-1){maxSize=tempSize;maxPosition=i;}}
return{url:imgs[maxPosition].url,type:pos,redirect:''};}
return!1;},happenToSdk:function(arg){var me=this;if(me.__happen_last_time_status!=arg){var playStatus=arg.split(':')[1];TDBankReporter.pushEvent(playStatus,me.store);me.__happen_last_time_status=arg;window[this.store.sdk_method](arg);}},isCustomization:function(n){return this.store.customization[n]==true;},getCustomization:function(n){return this.store.customization[n];},setCustomization:function(k,v){return this.store.customization[k]=v;},getDuration:function(){return this.store.duration;},getLogo:function(){return this.store.logo;},getIDMain:function(){return this.store.mainId;},getMainOffset:function(){var $main=$('#'+this.store.mainId);var offset=$main.offset();offset.width=$main.width();offset.height=$main.height();return offset;},getStartPatch:function(){return this._getPoster(constants.PATCH_LOC.START|0);},getPausePatch:function(){return this._getPoster(constants.PATCH_LOC.PAUSE|0);},getSopPatch:function(){return this._getPoster(constants.PATCH_LOC.END|0);},getAllDefinition:function(){var ret={},pir=constants.DEFINITION_PRIORITY,def,ind;for(def in this.store.videos){for(ind in pir){$.each(pir[ind],function(_,i){if(def==i){ret[def]={'resolution':ind,'resolutionName':constants.DEFINITION_NAME[ind],'resolutionNameNo':constants.DEFINITION_NAME_NO[ind]};return false;}});}}
return ret;},getUniqueNoDefinition:function(){var all=this.getAllDefinition();var ret={};var unique={};for(var key in all){if(!unique[all[key]['resolutionNameNo']]){unique[all[key]['resolutionNameNo']]=true;ret[key]=all[key];}}
return ret;},isInDefinition:function(no){if(no!==undefined){var all=this.getAllDefinition();for(var k in all){if(all[k]['resolutionNameNo']==no){return true;}}}
return false;},getKeepArgs:function(){return this.store.keepArgs;},getVideoInfo:function(res,def){var me=this,rst,videos=me.store.videos,resolutionPriority=constants.RESOLUTION_PRIORITY,getRstFromDefPriority=function(res){var arr=constants.DEFINITION_PRIORITY[res];if(arr&&arr.length>0){return videos[arr[0]]||videos[arr[1]]||null;}};var all=this.getAllDefinition();me.debug(':get video:resource=='+res+';definition=='+def);if(def!==undefined){rst=videos[def|0];if(!all[def]){rst=null;}}
if(!rst&&res!==undefined){rst=getRstFromDefPriority(res|0);}
if(!rst){for(var i=0,j=resolutionPriority.length;i<j;i++){rst=getRstFromDefPriority(resolutionPriority[i]);if(rst){break;}}}
if(rst){var map=me.getAllDefinition()[rst['definition']];me.debug(':getVideoInfo result:清晰度=='+map['resolution']+';名称=='+map['resolutionName']+';sdk清晰度'+map['resolutionNameNo']);return util.merge({resolution:map['resolution'],resolutionName:map['resolutionName'],resolutionNameNo:map['resolutionNameNo']},rst);}}});});;qcVideo('PlayerSystem',function($,Base,interval,constants,util,FullScreenApi,version,JSON){var EVENT=constants.EVENT;var undefined=undefined;var getId=function(){return'video_id_'+(+new Date());};var EventAry='loadstart,suspend,abort,error,emptied,stalled,loadedmetadata,loadeddata,canplay,canplaythrough,playing,waiting,seeking,seeked,ended,durationchange,timeupdate,progress,play,pause,ratechange,volumechange'.split(',');var orientationMap={};var orientationChange=function(){var key;switch(window.orientation){case 180:for(key in orientationMap){if(orientationMap[key]&&orientationMap[key]['happenResize']){orientationMap[key]['happenResize'](true);}}
break;case 90:for(key in orientationMap){if(orientationMap[key]&&orientationMap[key]['happenResize']){orientationMap[key]['happenResize'](false);}}
break;}};if(window.addEventListener){window.addEventListener("onorientationchange"in window?"orientationchange":"resize",orientationChange,false);}
return Base.extend({className:'PlayerSystem',constructor:function($renderTo){var me=this;me.$renderTo=$renderTo;var PlayerStatus=qcVideo.get('PlayerStatus');me.status=new PlayerStatus();me.timeTask=interval(function(){me.status.check();},1000);},happenResize:function(isLandScape){this.fire(isLandScape?EVENT.OS_LAND_SCAPE_UI:EVENT.OS_PORTRAIT_UI);},destroy:function(){delete orientationMap[this.__system_id];this.callMethod('pause');this.video.src='';delete this.video;this.$video.off().remove();delete this.$renderTo;this.timeTask.clear();delete this.$renderTo;this.status.destroy();delete this.status;},getStatus:function(){return this.status;},callMethod:function(mtd){try{if(mtd=='play'){this.has_call_play=true;}
this.video[mtd]();this.status.setRunningStatus(mtd);}catch(xe){this.debug(xe);}},__getBuffer:function(){var end=0;try{for(var i=0,j=this.video.buffered.length;i<j;i++){end=this.video.buffered.end(i)|0;}}catch(e){}
return end;},_status_ary:[],_bind:function(){var me=this;var metadataDone=function(){me.metadatadone=true;if(me._seek_time>1&&me.video.currentTime<1){me.video.currentTime=me._seek_time;}
if(me._volume){me.video.volume=this._volume;}
me._seek_time=0;me.fire(EVENT.OS_LOADED_META_DATA);};var getHandler=function(event){return function(e){me.debug(event,me.has_call_play);if(!me.has_call_play){return;}
switch(event){case('loadedmetadata'):metadataDone();break;case('error'):me.debug(event,e);me.fire(EVENT.OS_BLOCK);break;case('seeking'):me.fire(EVENT.OS_SEEKING);break;case('seeked'):me.fire(EVENT.OS_PLAYING);break;case('playing'):me.fire(EVENT.OS_PLAYING);break;case('pause'):me.fire(EVENT.OS_PAUSE);break;case('progress'):if(!me.metadatadone){metadataDone();}
me.status.set_loaded(me.__getBuffer());break;case('timeupdate'):me.status.set_played(me.video.currentTime|0);break;case('ended'):me.fire(EVENT.OS_PLAYER_END);break;}};};$.each(EventAry,function(_,event){me.$video.on(event,getHandler(event));});},setUrl:function(src){var me=this;var $renderTo=me.$renderTo;var type=me.fileType=util.fileType(src);me.__system_id=getId();orientationMap[me.__system_id]=me;var tpl={vid:me.__system_id,width:$renderTo.width(),height:$renderTo.height(),url:src,type:type==constants.MP4?'video/mp4':type==constants.HLS?'application/x-mpegURL':'video/flv'};me.metadatadone=false;me.has_call_play=false;me._seek_time=0;me.timeTask.start();me.status.clear();if(me.$video){$.each(EventAry,function(_,event){me.$video.off(event);});me.video.src='';if(me._hls){me._hls.detachMedia(me.video);}
me.callMethod('pause');me.$video.remove();}
var tplObj=qcVideo.get('MediaPlayer_tpl');$renderTo.prepend(tplObj['video'](tpl));me.video=(me.$video=$('#'+tpl.vid)).get(0);me._bind();me._toPlayOrPauseView(false);if(version.REQUIRE_HLS_JS&&type==constants.HLS){var Hls=qcVideo.get('Hls');me._hls=new Hls();me._hls.loadSource(src);me._hls.attachMedia(me.video);}},isFullScreen:function($dom){var zIndex=$dom.css('z-index');return zIndex>10000;},setPlayRate:function(rate){if(this.video){try{this.video.playbackRate=rate;}catch(xe){}}},setFullScreen:function(isFull,targetID){var me=this;var $main=$('#'+targetID),$win=$(window);var target=isFull?$main.get(0):document;if(isFull){var offset=$main.offset();target[FullScreenApi['requestFullscreen']]();setTimeout(function(){if(me.isFullScreen($main)){me.__offset=offset;$main.width($win.width());$main.height($win.height());me.fire(EVENT.OS_RESIZE,{});}},250);}else{target[FullScreenApi['exitFullscreen']]();if(me.__offset){$main.width(me.__offset.width);$main.height(me.__offset.height);}}},setShowMode:function(sourceMode){if(sourceMode){this.video.setAttribute('controls','controls');}else{this.video.removeAttribute('controls');}},_toPlayOrPauseView:function(isPlay){var w='-200%';if(isPlay){w=0;}
this.$video.css('top',w);},isMetaDataRendered:function(){return this.metadatadone;},play:function(time){if(this.video){if(time!==undefined){try{this.video.currentTime=this._seek_time=time-this.status.start_duration();}catch(xe){this.log(xe);}}
this.callMethod('play');}
this._toPlayOrPauseView(true);},pause:function(){if(this.video){this.callMethod('pause');}},volume:function(volume){if(volume!==undefined){if(this.video){this._volume=this.video.volume=volume;this.status.set_volume(volume);this.fire(EVENT.OS_VOLUME_CHANGE,{'volume':volume});}}else{return this.video.volume;}}});});;qcVideo('UiControl',function($,Base,util,constants,version){var id='qvideo_control_'+(+new Date())+'_';var uid=1;var bottomLeft=10;var MODE;var UiControl=Base.extend({className:'UiControl',destroy:function(){var me=this;delete me.store;delete me.status;if(me.children){for(var name in me.children){me.children[name].destroy();}
delete me.children;}
if(me.$el){me.$el.remove();me.$el=null;}},__ableShowUi:function(){return!this.__on_ui;},__ableHideUi:function(){return this.__on_ui&&this.status.getSDKStatus()=='playing'&&!this.__hover_controller&&(+new Date()-this.__show_ui_time>2000);},__delayHideUi:function(){var me=this;if(me.status.getSDKStatus()=='playing'&&!me.__hover_controller){me.__show_ui_time=+new Date();if(me.__hide_ui_tid){clearTimeout(me.__hide_ui_tid);me.__hide_ui_tid=null;}
me.__hide_ui_tid=setTimeout(function(){if(me.__ableHideUi()){me.__on_ui=false;me.children['Bottom_container'].$el.hide();me.log('hide');}},2080);}},enterPlayerUi:function(){if(this.__ableShowUi()){this.__on_ui=true;this.children['Bottom_container'].$el.show();this.log('show');}
this.__delayHideUi();},leavePlayerUi:function(){this.__delayHideUi();},slidePlayerUi:function(){if(this.__ableShowUi()){this.__on_ui=true;this.children['Bottom_container'].$el.show();this.log('show');}
this.__delayHideUi();},constructor:function(store,status,$renderTo){var me=this;me.store=store;me.status=status;me.children={};var width=$renderTo.width();var height=$renderTo.height();uid+=1;var tpl=qcVideo.get('MediaPlayer_tpl');$renderTo.append(tpl['controller']({'is_max_screen':width>500,'width':width,'height':height,'version':version,'nick':'trump-','controller':{'left':bottomLeft,'width':width-2*bottomLeft-2,'id':id+uid},'WORD':constants.UNICODE_WORD}));$renderTo.find('[component]').each(function(){var $me=$(this),component=util.capitalize($me.attr('component')),UICom=qcVideo.get(component);me.children[component]=new UICom(store,status,$me);me.on(me.children[component],constants.FIRE,function(obj){me.fire(obj.event,obj.value);});me.children[component].live('[sub-component]',function(dom,e){if(this.enable()){var $dom=$(dom),method='on_click_'+$dom.attr('sub-component');if(util.type(this[method])=='function'){this[method]($dom,e);}}});});me.$el=$renderTo.find('div[h5-controller]');if(!version.IS_MOBILE){$renderTo.off('mouseenter').off('mouseleave').off('mousemove').on('mouseenter',function(e){me.enterPlayerUi();}).on('mouseleave',function(){me.leavePlayerUi();}).on('mousemove',function(){me.slidePlayerUi();});}
me.children['Bottom_container'].$el.on('mouseenter',function(e){me.__hover_controller=true;}).on('mouseleave',function(e){me.__hover_controller=false;});me.setViewMode(height);this.setWait();this.setTime({duration:me.store.getDuration()});this.setResize();if(me.store.isCustomization('hide_h5_setting')){me.$el.find('[sub-component="setting"]').hide();}},setViewMode:function(height){var me=this;var sourceH=36;var $settingEl=this.children['Setting'].$el;if(version.IS_MOBILE&&height>0){$settingEl.show();var rate=sourceH/height;var askRate=1/4;var zoom=1;if(rate!=askRate){zoom=height*askRate/sourceH;}
this.children['Bottom_container'].$el.css('zoom',zoom);setTimeout(function(){var h=$settingEl.height();var ch=me.$el.height()||1;var rate=h/ch;var size='1rem';if(rate<0.3){size='2rem';}else if(rate<0.5){size='1.5rem';}else if(rate>0.9){size='0.5rem';}
me.log(h,height,ch,rate,size);$settingEl.css('font-size',size).height('100%').hide();},300);}else{$settingEl.height('100%')}},show:function(){this.$el.show();},hide:function(){this.$el.hide();},eachChild:function(fn){for(var i in this.children){fn(this.children[i]);}},setWait:function(){this.eachChild(function(son){son.catchControlStatusChange(MODE.WAIT);});},setPlay:function(){this.eachChild(function(son){son.catchControlStatusChange(MODE.PLAY);});},setPause:function(){this.eachChild(function(son){son.catchControlStatusChange(MODE.PAUSE);});},setEnd:function(){this.eachChild(function(son){son.catchControlStatusChange(MODE.END);});},setError:function(msg){this.eachChild(function(son){son.catchControlStatusChange(MODE.ERROR,{'msg':msg});});},openSetting:function(obj){this.children['Setting'].show(obj);},setFull:function(isFull){var me=this;if(isFull){me.eachChild(function(son){son.catchControlStatusChange(MODE.FULL);});}else{me.eachChild(function(son){son.catchControlStatusChange(MODE.QUIT_FULL);});}},setResize:function(){var offset=this.store.getMainOffset();this.eachChild(function(son){son.catchControlStatusChange(MODE.RESIZE,{'offset':offset});});},setTime:function(obj){this.children['Bottom_container'].setTime(obj);},setVolume:function(percent){this.children['Bottom_container'].setVolume(percent*100);},enableDrag:function(bool){this.children['Bottom_container'].enableDrag(bool);},enableFull:function(bool){this.children['Bottom_container'].enableFull(bool);}});MODE=UiControl.MODE={WAIT:'wait',READY:'ready',PAUSE:'pause',PLAY:'play',BLOCK:'block',ERROR:'error',END:'end',FULL:'full',QUIT_FULL:'quitfull',RESIZE:'RESIZE'};return UiControl;});/*  |xGv00|5fa57fbb4702a22227fa35280efb04dc */