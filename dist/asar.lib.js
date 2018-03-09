!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e(require("path"),require("fs"),require("fs"),require("os"),require("crypto"),require("constants")):"function"==typeof define&&define.amd?define("asar.lib",["path","fs","fs","os","crypto","constants"],e):"object"==typeof exports?exports["asar.lib"]=e(require("path"),require("fs"),require("fs"),require("os"),require("crypto"),require("constants")):t["asar.lib"]=e(t.path,t.fs,t["fs"],t.os,t.crypto,t.constants)}(this,function(t,e,r,i,n,s){return function(t){var e={};function r(i){if(e[i])return e[i].exports;var n=e[i]={i:i,l:!1,exports:{}};return t[i].call(n.exports,n,n.exports,r),n.l=!0,n.exports}return r.m=t,r.c=e,r.d=function(t,e,i){r.o(t,e)||Object.defineProperty(t,e,{configurable:!1,enumerable:!0,get:i})},r.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return r.d(e,"a",e),e},r.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},r.p="",r(r.s=4)}([function(t,e){t.exports=require("path")},function(t,e){t.exports=require("fs")},function(t,e,r){"use strict";var i="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},n=r(0),s=r(1),o=parseInt("0777",8);function a(t,e,r,h){"function"==typeof e?(r=e,e={}):e&&"object"===(void 0===e?"undefined":i(e))||(e={mode:e});var u=e.mode,c=e.fs||s;void 0===u&&(u=o&~process.umask()),h||(h=null);var f=r||function(){};t=n.resolve(t),c.mkdir(t,u,function(r){if(!r)return f(null,h=h||t);switch(r.code){case"ENOENT":a(n.dirname(t),e,function(r,i){r?f(r,i):a(t,e,f,i)});break;default:c.stat(t,function(t,e){t||!e.isDirectory()?f(r,h):f(null,h)})}})}t.exports=a.mkdirp=a.mkdirP=a,a.sync=function t(e,r,a){r&&"object"===(void 0===r?"undefined":i(r))||(r={mode:r});var h=r.mode,u=r.fs||s;void 0===h&&(h=o&~process.umask()),a||(a=null),e=n.resolve(e);try{u.mkdirSync(e,h),a=a||e}catch(i){switch(i.code){case"ENOENT":t(e,r,a=t(n.dirname(e),r,a));break;default:var c;try{c=u.statSync(e)}catch(t){throw i}if(!c.isDirectory())throw i}}return a}},function(t,e,r){"use strict";var i=function(){function t(t,e){for(var r=0;r<e.length;r++){var i=e[r];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(t,i.key,i)}}return function(e,r,i){return r&&t(e.prototype,r),i&&t(e,i),e}}();var n=process.versions.electron?r(9):r(1),s=r(0),o=r(10),a=r(15).UINT64,h=function(){function t(e){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this.src=s.resolve(e),this.header={files:{}},this.offset=a(0)}return i(t,[{key:"searchNodeFromDirectory",value:function(t){var e=this.header,r=t.split(s.sep),i=!0,n=!1,o=void 0;try{for(var a,h=r[Symbol.iterator]();!(i=(a=h.next()).done);i=!0){var u=a.value;"."!==u&&(e=e.files[u])}}catch(t){n=!0,o=t}finally{try{!i&&h.return&&h.return()}finally{if(n)throw o}}return e}},{key:"searchNodeFromPath",value:function(t){if(!(t=s.relative(this.src,t)))return this.header;var e=s.basename(t),r=this.searchNodeFromDirectory(s.dirname(t));return null==r.files&&(r.files={}),null==r.files[e]&&(r.files[e]={}),r.files[e]}},{key:"insertDirectory",value:function(t,e){var r=this.searchNodeFromPath(t);return e&&(r.unpacked=e),r.files={},r.files}},{key:"insertFile",value:function(t,e,r,i,h){var u=this,c=this.searchNodeFromPath(s.dirname(t)),f=this.searchNodeFromPath(t);if(e||c.unpacked)return f.size=r.stat.size,f.unpacked=!0,void process.nextTick(h);var p=function(){var e=r.transformed?r.transformed.stat.size:r.stat.size;if(e>4294967295)throw new Error(t+": file size can not be larger than 4.2GB");return f.size=e,f.offset=u.offset.toString(),"win32"!==process.platform&&64&r.stat.mode&&(f.executable=!0),u.offset.add(a(e)),h()},l=i.transform&&i.transform(t);return l?o.file(function(e,i){if(e)return p();var s=n.createWriteStream(i);return n.createReadStream(t).pipe(l).pipe(s),s.on("close",function(){return r.transformed={path:i,stat:n.lstatSync(i)},p()})}):process.nextTick(p)}},{key:"insertLink",value:function(t,e){var r=s.relative(n.realpathSync(this.src),n.realpathSync(t));if(".."===r.substr(0,2))throw new Error(t+": file links out of the package");return this.searchNodeFromPath(t).link=r,r}},{key:"listFiles",value:function(){var t=[];return function e(r,i){if(i.files)return function(){var n=[];for(var o in i.files){var a=s.join(r,o);t.push(a),n.push(e(a,i.files[o]))}return n}()}("/",this.header),t}},{key:"getNode",value:function(t){var e=this.searchNodeFromDirectory(s.dirname(t)),r=s.basename(t);return r?e.files[r]:e}},{key:"getFile",value:function(t,e){e=void 0===e||e;var r=this.getNode(t);return r.link&&e?this.getFile(r.link):r}}]),t}();t.exports=h},function(t,e,r){"use strict";var i=r(1),n=r(0),s=(r(5),r(2)),o=(r(3),r(18));t.exports.statFile=function(t,e,r){return o.readFilesystemSync(t).getFile(e,r)},t.exports.listPackage=function(t){return o.readFilesystemSync(t).listFiles()},t.exports.extractFile=function(t,e){var r=o.readFilesystemSync(t);return o.readFileSync(r,e,r.getFile(e))},t.exports.extractAll=function(t,e){var r=o.readFilesystemSync(t),a=r.listFiles(),h="win32"===process.platform;return s.sync(e),a.map(function(t){t=t.substr(1);var a=n.join(e,t),u=r.getFile(t,h);if(u.files)s.sync(a);else if(u.link){var c=n.dirname(n.join(e,u.link)),f=n.dirname(a),p=n.relative(f,c);!function(){try{i.unlinkSync(a)}catch(t){}}();var l=n.join(p,n.basename(u.link));i.symlinkSync(l,a)}else{var d=o.readFileSync(r,t,u);i.writeFileSync(a,d)}})},t.exports.uncache=function(t){return o.uncacheFilesystem(t)},t.exports.uncacheAll=function(){o.uncacheAll()}},function(t,e,r){"use strict";t.exports=d,d.Minimatch=_;var i={sep:"/"};try{i=r(0)}catch(t){}var n=d.GLOBSTAR=_.GLOBSTAR={},s=r(6),o={"!":{open:"(?:(?!(?:",close:"))[^/]*?)"},"?":{open:"(?:",close:")?"},"+":{open:"(?:",close:")+"},"*":{open:"(?:",close:")*"},"@":{open:"(?:",close:")"}},a="[^/]",h=a+"*?",u="(?:(?!(?:\\/|^)(?:\\.{1,2})($|\\/)).)*?",c="(?:(?!(?:\\/|^)\\.).)*?",f="().*{}+?[]^$\\!".split("").reduce(function(t,e){return t[e]=!0,t},{});var p=/\/+/;function l(t,e){t=t||{},e=e||{};var r={};return Object.keys(e).forEach(function(t){r[t]=e[t]}),Object.keys(t).forEach(function(e){r[e]=t[e]}),r}function d(t,e,r){if("string"!=typeof e)throw new TypeError("glob pattern string required");return r||(r={}),!(!r.nocomment&&"#"===e.charAt(0))&&(""===e.trim()?""===t:new _(e,r).match(t))}function _(t,e){if(!(this instanceof _))return new _(t,e);if("string"!=typeof t)throw new TypeError("glob pattern string required");e||(e={}),t=t.trim(),"/"!==i.sep&&(t=t.split(i.sep).join("/")),this.options=e,this.set=[],this.pattern=t,this.regexp=null,this.negate=!1,this.comment=!1,this.empty=!1,this.make()}function y(t,e){if(e||(e=this instanceof _?this.options:{}),void 0===(t=void 0===t?this.pattern:t))throw new TypeError("undefined pattern");return e.nobrace||!t.match(/\{.*\}/)?[t]:s(t)}d.filter=function(t,e){return e=e||{},function(r,i,n){return d(r,t,e)}},d.defaults=function(t){if(!t||!Object.keys(t).length)return d;var e=d,r=function(r,i,n){return e.minimatch(r,i,l(t,n))};return r.Minimatch=function(r,i){return new e.Minimatch(r,l(t,i))},r},_.defaults=function(t){return t&&Object.keys(t).length?d.defaults(t).Minimatch:_},_.prototype.debug=function(){},_.prototype.make=function(){if(this._made)return;var t=this.pattern,e=this.options;if(!e.nocomment&&"#"===t.charAt(0))return void(this.comment=!0);if(!t)return void(this.empty=!0);this.parseNegate();var r=this.globSet=this.braceExpand();e.debug&&(this.debug=console.error);this.debug(this.pattern,r),r=this.globParts=r.map(function(t){return t.split(p)}),this.debug(this.pattern,r),r=r.map(function(t,e,r){return t.map(this.parse,this)},this),this.debug(this.pattern,r),r=r.filter(function(t){return-1===t.indexOf(!1)}),this.debug(this.pattern,r),this.set=r},_.prototype.parseNegate=function(){var t=this.pattern,e=!1,r=0;if(this.options.nonegate)return;for(var i=0,n=t.length;i<n&&"!"===t.charAt(i);i++)e=!e,r++;r&&(this.pattern=t.substr(r));this.negate=e},d.braceExpand=function(t,e){return y(t,e)},_.prototype.braceExpand=y,_.prototype.parse=function(t,e){if(t.length>65536)throw new TypeError("pattern is too long");var r=this.options;if(!r.noglobstar&&"**"===t)return n;if(""===t)return"";var i,s="",u=!!r.nocase,c=!1,p=[],l=[],d=!1,_=-1,y=-1,g="."===t.charAt(0)?"":r.dot?"(?!(?:^|\\/)\\.{1,2}(?:$|\\/))":"(?!\\.)",m=this;function w(){if(i){switch(i){case"*":s+=h,u=!0;break;case"?":s+=a,u=!0;break;default:s+="\\"+i}m.debug("clearStateChar %j %j",i,s),i=!1}}for(var b,S=0,x=t.length;S<x&&(b=t.charAt(S));S++)if(this.debug("%s\t%s %s %j",t,S,s,b),c&&f[b])s+="\\"+b,c=!1;else switch(b){case"/":return!1;case"\\":w(),c=!0;continue;case"?":case"*":case"+":case"@":case"!":if(this.debug("%s\t%s %s %j <-- stateChar",t,S,s,b),d){this.debug("  in class"),"!"===b&&S===y+1&&(b="^"),s+=b;continue}m.debug("call clearStateChar %j",i),w(),i=b,r.noext&&w();continue;case"(":if(d){s+="(";continue}if(!i){s+="\\(";continue}p.push({type:i,start:S-1,reStart:s.length,open:o[i].open,close:o[i].close}),s+="!"===i?"(?:(?!(?:":"(?:",this.debug("plType %j %j",i,s),i=!1;continue;case")":if(d||!p.length){s+="\\)";continue}w(),u=!0;var E=p.pop();s+=E.close,"!"===E.type&&l.push(E),E.reEnd=s.length;continue;case"|":if(d||!p.length||c){s+="\\|",c=!1;continue}w(),s+="|";continue;case"[":if(w(),d){s+="\\"+b;continue}d=!0,y=S,_=s.length,s+=b;continue;case"]":if(S===y+1||!d){s+="\\"+b,c=!1;continue}if(d){var k=t.substring(y+1,S);try{RegExp("["+k+"]")}catch(t){var I=this.parse(k,v);s=s.substr(0,_)+"\\["+I[0]+"\\]",u=u||I[1],d=!1;continue}}u=!0,d=!1,s+=b;continue;default:w(),c?c=!1:!f[b]||"^"===b&&d||(s+="\\"),s+=b}d&&(k=t.substr(y+1),I=this.parse(k,v),s=s.substr(0,_)+"\\["+I[0],u=u||I[1]);for(E=p.pop();E;E=p.pop()){var B=s.slice(E.reStart+E.open.length);this.debug("setting tail",s,E),B=B.replace(/((?:\\{2}){0,64})(\\?)\|/g,function(t,e,r){return r||(r="\\"),e+e+r+"|"}),this.debug("tail=%j\n   %s",B,B,E,s);var j="*"===E.type?h:"?"===E.type?a:"\\"+E.type;u=!0,s=s.slice(0,E.reStart)+j+"\\("+B}w(),c&&(s+="\\\\");var O=!1;switch(s.charAt(0)){case".":case"[":case"(":O=!0}for(var F=l.length-1;F>-1;F--){var z=l[F],N=s.slice(0,z.reStart),A=s.slice(z.reStart,z.reEnd-8),L=s.slice(z.reEnd-8,z.reEnd),M=s.slice(z.reEnd);L+=M;var R=N.split("(").length-1,q=M;for(S=0;S<R;S++)q=q.replace(/\)[+*?]?/,"");var P="";""===(M=q)&&e!==v&&(P="$");var T=N+A+M+P+L;s=T}""!==s&&u&&(s="(?=.)"+s);O&&(s=g+s);if(e===v)return[s,u];if(!u)return t.replace(/\\(.)/g,"$1");var U=r.nocase?"i":"";try{var C=new RegExp("^"+s+"$",U)}catch(t){return new RegExp("$.")}return C._glob=t,C._src=s,C};var v={};d.makeRe=function(t,e){return new _(t,e||{}).makeRe()},_.prototype.makeRe=function(){if(this.regexp||!1===this.regexp)return this.regexp;var t=this.set;if(!t.length)return this.regexp=!1,this.regexp;var e=this.options,r=e.noglobstar?h:e.dot?u:c,i=e.nocase?"i":"",s=t.map(function(t){return t.map(function(t){return t===n?r:"string"==typeof t?t.replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&"):t._src}).join("\\/")}).join("|");s="^(?:"+s+")$",this.negate&&(s="^(?!"+s+").*$");try{this.regexp=new RegExp(s,i)}catch(t){this.regexp=!1}return this.regexp},d.match=function(t,e,r){var i=new _(e,r=r||{});return t=t.filter(function(t){return i.match(t)}),i.options.nonull&&!t.length&&t.push(e),t},_.prototype.match=function(t,e){if(this.debug("match",t,this.pattern),this.comment)return!1;if(this.empty)return""===t;if("/"===t&&e)return!0;var r=this.options;"/"!==i.sep&&(t=t.split(i.sep).join("/"));t=t.split(p),this.debug(this.pattern,"split",t);var n,s,o=this.set;for(this.debug(this.pattern,"set",o),s=t.length-1;s>=0&&!(n=t[s]);s--);for(s=0;s<o.length;s++){var a=o[s],h=t;r.matchBase&&1===a.length&&(h=[n]);var u=this.matchOne(h,a,e);if(u)return!!r.flipNegate||!this.negate}return!r.flipNegate&&this.negate},_.prototype.matchOne=function(t,e,r){var i=this.options;this.debug("matchOne",{this:this,file:t,pattern:e}),this.debug("matchOne",t.length,e.length);for(var s=0,o=0,a=t.length,h=e.length;s<a&&o<h;s++,o++){this.debug("matchOne loop");var u,c=e[o],f=t[s];if(this.debug(e,c,f),!1===c)return!1;if(c===n){this.debug("GLOBSTAR",[e,c,f]);var p=s,l=o+1;if(l===h){for(this.debug("** at the end");s<a;s++)if("."===t[s]||".."===t[s]||!i.dot&&"."===t[s].charAt(0))return!1;return!0}for(;p<a;){var d=t[p];if(this.debug("\nglobstar while",t,p,e,l,d),this.matchOne(t.slice(p),e.slice(l),r))return this.debug("globstar found match!",p,a,d),!0;if("."===d||".."===d||!i.dot&&"."===d.charAt(0)){this.debug("dot detected!",t,p,e,l);break}this.debug("globstar swallow a segment, and continue"),p++}return!(!r||(this.debug("\n>>> no match, partial?",t,p,e,l),p!==a))}if("string"==typeof c?(u=i.nocase?f.toLowerCase()===c.toLowerCase():f===c,this.debug("string match",c,f,u)):(u=f.match(c),this.debug("pattern match",c,f,u)),!u)return!1}if(s===a&&o===h)return!0;if(s===a)return r;if(o===h)return s===a-1&&""===t[s];throw new Error("wtf?")}},function(t,e,r){"use strict";var i=r(7),n=r(8);t.exports=function(t){if(!t)return[];"{}"===t.substr(0,2)&&(t="\\{\\}"+t.substr(2));return function t(e,r){var s=[];var o=n("{","}",e);if(!o||/\$$/.test(o.pre))return[e];var h=/^-?\d+\.\.-?\d+(?:\.\.-?\d+)?$/.test(o.body);var u=/^[a-zA-Z]\.\.[a-zA-Z](?:\.\.-?\d+)?$/.test(o.body);var f=h||u;var y=o.body.indexOf(",")>=0;if(!f&&!y)return o.post.match(/,.*\}/)?(e=o.pre+"{"+o.body+a+o.post,t(e)):[e];var v;if(f)v=o.body.split(/\.\./);else if(1===(v=function t(e){if(!e)return[""];var r=[];var i=n("{","}",e);if(!i)return e.split(",");var s=i.pre;var o=i.body;var a=i.post;var h=s.split(",");h[h.length-1]+="{"+o+"}";var u=t(a);a.length&&(h[h.length-1]+=u.shift(),h.push.apply(h,u));r.push.apply(r,h);return r}(o.body)).length&&1===(v=t(v[0],!1).map(p)).length){var g=o.post.length?t(o.post,!1):[""];return g.map(function(t){return o.pre+v[0]+t})}var m=o.pre;var g=o.post.length?t(o.post,!1):[""];var w;if(f){var b=c(v[0]),S=c(v[1]),x=Math.max(v[0].length,v[1].length),E=3==v.length?Math.abs(c(v[2])):1,k=d,I=S<b;I&&(E*=-1,k=_);var B=v.some(l);w=[];for(var j=b;k(j,S);j+=E){var O;if(u)"\\"===(O=String.fromCharCode(j))&&(O="");else if(O=String(j),B){var F=x-O.length;if(F>0){var z=new Array(F+1).join("0");O=j<0?"-"+z+O.slice(1):z+O}}w.push(O)}}else w=i(v,function(e){return t(e,!1)});for(var N=0;N<w.length;N++)for(var A=0;A<g.length;A++){var L=m+w[N]+g[A];(!r||f||L)&&s.push(L)}return s}(function(t){return t.split("\\\\").join(s).split("\\{").join(o).split("\\}").join(a).split("\\,").join(h).split("\\.").join(u)}(t),!0).map(f)};var s="\0SLASH"+Math.random()+"\0",o="\0OPEN"+Math.random()+"\0",a="\0CLOSE"+Math.random()+"\0",h="\0COMMA"+Math.random()+"\0",u="\0PERIOD"+Math.random()+"\0";function c(t){return parseInt(t,10)==t?parseInt(t,10):t.charCodeAt(0)}function f(t){return t.split(s).join("\\").split(o).join("{").split(a).join("}").split(h).join(",").split(u).join(".")}function p(t){return"{"+t+"}"}function l(t){return/^-?0\d/.test(t)}function d(t,e){return t<=e}function _(t,e){return t>=e}},function(t,e,r){"use strict";t.exports=function(t,e){for(var r=[],n=0;n<t.length;n++){var s=e(t[n],n);i(s)?r.push.apply(r,s):r.push(s)}return r};var i=Array.isArray||function(t){return"[object Array]"===Object.prototype.toString.call(t)}},function(t,e,r){"use strict";function i(t,e,r){t instanceof RegExp&&(t=n(t,r)),e instanceof RegExp&&(e=n(e,r));var i=s(t,e,r);return i&&{start:i[0],end:i[1],pre:r.slice(0,i[0]),body:r.slice(i[0]+t.length,i[1]),post:r.slice(i[1]+e.length)}}function n(t,e){var r=e.match(t);return r?r[0]:null}function s(t,e,r){var i,n,s,o,a,h=r.indexOf(t),u=r.indexOf(e,h+1),c=h;if(h>=0&&u>0){for(i=[],s=r.length;c>=0&&!a;)c==h?(i.push(c),h=r.indexOf(t,c+1)):1==i.length?a=[i.pop(),u]:((n=i.pop())<s&&(s=n,o=u),u=r.indexOf(e,c+1)),c=h<u&&h>=0?h:u;i.length&&(a=[s,o])}return a}t.exports=i,i.range=s},function(t,e){t.exports=r},function(t,e,r){"use strict";var i=r(1),n=r(0),s=(r(11),r(12)),o=i.exists||n.exists,a=i.existsSync||n.existsSync,h=r(13),u=r(14),f=h(),p="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",l=/XXXXXX/,d=3,_=u.O_CREAT|u.O_EXCL|u.O_RDWR,y=448,v=384,g=[],m=!1,w=!1;function b(t){var e=[],r=null;try{r=s.randomBytes(t)}catch(e){r=s.pseudoRandomBytes(t)}for(var i=0;i<t;i++)e.push(p[r[i]%p.length]);return e.join("")}function S(t,e){if("function"==typeof t){var r=t;t=e||{},e=r}else void 0===t&&(t={});return[t,e]}function x(t){if(t.name)return n.join(t.dir||f,t.name);if(t.template)return t.template.replace(l,b(6));var e=[t.prefix||"tmp-",process.pid,b(12),t.postfix||""].join("");return n.join(t.dir||f,e)}function E(t,e){var r=S(t,e),i=r[0],n=r[1],s=i.tries||d;return isNaN(s)||s<0?n(new Error("Invalid tries")):i.template&&!i.template.match(l)?n(new Error("Invalid template provided")):void function t(){var e=x(i);o(e,function(r){if(r)return s-- >0?t():n(new Error("Could not get a unique tmp filename, max tries reached "+e));n(null,e)})}()}function k(t){var e=S(t)[0],r=e.tries||d;if(isNaN(r)||r<0)throw new Error("Invalid tries");if(e.template&&!e.template.match(l))throw new Error("Invalid template provided");do{var i=x(e);if(!a(i))return i}while(r-- >0);throw new Error("Could not get a unique tmp filename, max tries reached")}function I(t){var e=[t];do{for(var r=e.pop(),s=!1,o=i.readdirSync(r),a=0,h=o.length;a<h;a++){var u=n.join(r,o[a]);i.lstatSync(u).isDirectory()?(s||(s=!0,e.push(r)),e.push(u)):i.unlinkSync(u)}s||i.rmdirSync(r)}while(0!==e.length)}function B(t,e,r){var n=O(function(t){try{i.closeSync(t[0])}catch(t){if(t.errno!=-u.EBADF&&t.errno!=-c.ENOENT)throw t}i.unlinkSync(t[1])},[e,t]);return r.keep||g.unshift(n),n}function j(t,e){var r=O(e.unsafeCleanup?I:i.rmdirSync.bind(i),t);return e.keep||g.unshift(r),r}function O(t,e){var r=!1;return function(){if(!r){var i=g.indexOf(t);i>=0&&g.splice(i,1),r=!0,t(e)}}}function F(){if(!w||m)for(var t=0,e=g.length;t<e;t++)try{g[t].call(null)}catch(t){}}var z=process.versions.node.split(".").map(function(t){return parseInt(t,10)});0===z[0]&&(z[1]<9||9===z[1]&&z[2]<5)&&process.addListener("uncaughtException",function(t){throw w=!0,F(),t}),process.addListener("exit",function(t){t&&(w=!0),F()}),t.exports.tmpdir=f,t.exports.dir=function(t,e){var r=S(t,e),n=r[0],s=r[1];E(n,function(t,e){if(t)return s(t);i.mkdir(e,n.mode||y,function(t){if(t)return s(t);s(null,e,j(e,n))})})},t.exports.dirSync=function(t){var e=S(t)[0],r=k(e);return i.mkdirSync(r,e.mode||y),{name:r,removeCallback:j(r,e)}},t.exports.file=function(t,e){var r=S(t,e),n=r[0],s=r[1];n.postfix=void 0===n.postfix?".tmp":n.postfix,E(n,function(t,e){if(t)return s(t);i.open(e,_,n.mode||v,function(t,r){if(t)return s(t);s(null,e,r,B(e,r,n))})})},t.exports.fileSync=function(t){var e=S(t)[0];e.postfix=e.postfix||".tmp";var r=k(e),n=i.openSync(r,_,e.mode||v);return{name:r,fd:n,removeCallback:B(r,n,e)}},t.exports.tmpName=E,t.exports.tmpNameSync=k,t.exports.setGracefulCleanup=function(){m=!0}},function(t,e){t.exports=require("os")},function(t,e){t.exports=require("crypto")},function(t,e,r){"use strict";var i="win32"===process.platform,n=i?/[^:]\\$/:/.\/$/;t.exports=function(){var t;return t=i?process.env.TEMP||process.env.TMP||(process.env.SystemRoot||process.env.windir)+"\\temp":process.env.TMPDIR||process.env.TMP||process.env.TEMP||"/tmp",n.test(t)&&(t=t.slice(0,-1)),t}},function(t,e){t.exports=require("constants")},function(t,e,r){"use strict";e.UINT32=r(16),e.UINT64=r(17)},function(t,e,r){"use strict";var i;!function(r){n(Math.pow(36,5)),n(Math.pow(16,7)),n(Math.pow(10,9)),n(Math.pow(2,30)),n(36),n(16),n(10),n(2);function n(t,e){return this instanceof n?(this._low=0,this._high=0,this.remainder=null,void 0===e?o.call(this,t):"string"==typeof t?a.call(this,t,e):void s.call(this,t,e)):new n(t,e)}function s(t,e){return this._low=0|t,this._high=0|e,this}function o(t){return this._low=65535&t,this._high=t>>>16,this}function a(t,e){var r=parseInt(t,e||10);return this._low=65535&r,this._high=r>>>16,this}n.prototype.fromBits=s,n.prototype.fromNumber=o,n.prototype.fromString=a,n.prototype.toNumber=function(){return 65536*this._high+this._low},n.prototype.toString=function(t){return this.toNumber().toString(t||10)},n.prototype.add=function(t){var e=this._low+t._low,r=e>>>16;return r+=this._high+t._high,this._low=65535&e,this._high=65535&r,this},n.prototype.subtract=function(t){return this.add(t.clone().negate())},n.prototype.multiply=function(t){var e,r,i=this._high,n=this._low,s=t._high,o=t._low;return e=(r=n*o)>>>16,e+=i*o,e&=65535,e+=n*s,this._low=65535&r,this._high=65535&e,this},n.prototype.div=function(t){if(0==t._low&&0==t._high)throw Error("division by zero");if(0==t._high&&1==t._low)return this.remainder=new n(0),this;if(t.gt(this))return this.remainder=this.clone(),this._low=0,this._high=0,this;if(this.eq(t))return this.remainder=new n(0),this._low=1,this._high=0,this;for(var e=t.clone(),r=-1;!this.lt(e);)e.shiftLeft(1,!0),r++;for(this.remainder=this.clone(),this._low=0,this._high=0;r>=0;r--)e.shiftRight(1),this.remainder.lt(e)||(this.remainder.subtract(e),r>=16?this._high|=1<<r-16:this._low|=1<<r);return this},n.prototype.negate=function(){var t=1+(65535&~this._low);return this._low=65535&t,this._high=~this._high+(t>>>16)&65535,this},n.prototype.equals=n.prototype.eq=function(t){return this._low==t._low&&this._high==t._high},n.prototype.greaterThan=n.prototype.gt=function(t){return this._high>t._high||!(this._high<t._high)&&this._low>t._low},n.prototype.lessThan=n.prototype.lt=function(t){return this._high<t._high||!(this._high>t._high)&&this._low<t._low},n.prototype.or=function(t){return this._low|=t._low,this._high|=t._high,this},n.prototype.and=function(t){return this._low&=t._low,this._high&=t._high,this},n.prototype.not=function(){return this._low=65535&~this._low,this._high=65535&~this._high,this},n.prototype.xor=function(t){return this._low^=t._low,this._high^=t._high,this},n.prototype.shiftRight=n.prototype.shiftr=function(t){return t>16?(this._low=this._high>>t-16,this._high=0):16==t?(this._low=this._high,this._high=0):(this._low=this._low>>t|this._high<<16-t&65535,this._high>>=t),this},n.prototype.shiftLeft=n.prototype.shiftl=function(t,e){return t>16?(this._high=this._low<<t-16,this._low=0,e||(this._high&=65535)):16==t?(this._high=this._low,this._low=0):(this._high=this._high<<t|this._low>>16-t,this._low=this._low<<t&65535,e||(this._high&=65535)),this},n.prototype.rotateLeft=n.prototype.rotl=function(t){var e=this._high<<16|this._low;return e=e<<t|e>>>32-t,this._low=65535&e,this._high=e>>>16,this},n.prototype.rotateRight=n.prototype.rotr=function(t){var e=this._high<<16|this._low;return e=e>>>t|e<<32-t,this._low=65535&e,this._high=e>>>16,this},n.prototype.clone=function(){return new n(this._low,this._high)},void 0===(i=function(){return n}.apply(e,[]))||(t.exports=i)}()},function(t,e,r){"use strict";var i;!function(r){var n={16:o(Math.pow(16,5)),10:o(Math.pow(10,5)),2:o(Math.pow(2,5))},s={16:o(16),10:o(10),2:o(2)};function o(t,e,r,i){return this instanceof o?(this.remainder=null,"string"==typeof t?u.call(this,t,e):void 0===e?h.call(this,t):void a.apply(this,arguments)):new o(t,e,r,i)}function a(t,e,r,i){return void 0===r?(this._a00=65535&t,this._a16=t>>>16,this._a32=65535&e,this._a48=e>>>16,this):(this._a00=0|t,this._a16=0|e,this._a32=0|r,this._a48=0|i,this)}function h(t){return this._a00=65535&t,this._a16=t>>>16,this._a32=0,this._a48=0,this}function u(t,e){e=e||10,this._a00=0,this._a16=0,this._a32=0,this._a48=0;for(var r=n[e]||new o(Math.pow(e,5)),i=0,s=t.length;i<s;i+=5){var a=Math.min(5,s-i),h=parseInt(t.slice(i,i+a),e);this.multiply(a<5?new o(Math.pow(e,a)):r).add(new o(h))}return this}o.prototype.fromBits=a,o.prototype.fromNumber=h,o.prototype.fromString=u,o.prototype.toNumber=function(){return 65536*this._a16+this._a00},o.prototype.toString=function(t){var e=s[t=t||10]||new o(t);if(!this.gt(e))return this.toNumber().toString(t);for(var r=this.clone(),i=new Array(64),n=63;n>=0&&(r.div(e),i[n]=r.remainder.toNumber().toString(t),r.gt(e));n--);return i[n-1]=r.toNumber().toString(t),i.join("")},o.prototype.add=function(t){var e=this._a00+t._a00,r=e>>>16,i=(r+=this._a16+t._a16)>>>16,n=(i+=this._a32+t._a32)>>>16;return n+=this._a48+t._a48,this._a00=65535&e,this._a16=65535&r,this._a32=65535&i,this._a48=65535&n,this},o.prototype.subtract=function(t){return this.add(t.clone().negate())},o.prototype.multiply=function(t){var e=this._a00,r=this._a16,i=this._a32,n=this._a48,s=t._a00,o=t._a16,a=t._a32,h=t._a48,u=e*s,c=u>>>16,f=(c+=e*o)>>>16;c&=65535,f+=(c+=r*s)>>>16;var p=(f+=e*a)>>>16;return f&=65535,p+=(f+=r*o)>>>16,f&=65535,p+=(f+=i*s)>>>16,p+=e*h,p&=65535,p+=r*a,p&=65535,p+=i*o,p&=65535,p+=n*s,this._a00=65535&u,this._a16=65535&c,this._a32=65535&f,this._a48=65535&p,this},o.prototype.div=function(t){if(0==t._a16&&0==t._a32&&0==t._a48){if(0==t._a00)throw Error("division by zero");if(1==t._a00)return this.remainder=new o(0),this}if(t.gt(this))return this.remainder=this.clone(),this._a00=0,this._a16=0,this._a32=0,this._a48=0,this;if(this.eq(t))return this.remainder=new o(0),this._a00=1,this._a16=0,this._a32=0,this._a48=0,this;for(var e=t.clone(),r=-1;!this.lt(e);)e.shiftLeft(1,!0),r++;for(this.remainder=this.clone(),this._a00=0,this._a16=0,this._a32=0,this._a48=0;r>=0;r--)e.shiftRight(1),this.remainder.lt(e)||(this.remainder.subtract(e),r>=48?this._a48|=1<<r-48:r>=32?this._a32|=1<<r-32:r>=16?this._a16|=1<<r-16:this._a00|=1<<r);return this},o.prototype.negate=function(){var t=1+(65535&~this._a00);return this._a00=65535&t,t=(65535&~this._a16)+(t>>>16),this._a16=65535&t,t=(65535&~this._a32)+(t>>>16),this._a32=65535&t,this._a48=~this._a48+(t>>>16)&65535,this},o.prototype.equals=o.prototype.eq=function(t){return this._a48==t._a48&&this._a00==t._a00&&this._a32==t._a32&&this._a16==t._a16},o.prototype.greaterThan=o.prototype.gt=function(t){return this._a48>t._a48||!(this._a48<t._a48)&&(this._a32>t._a32||!(this._a32<t._a32)&&(this._a16>t._a16||!(this._a16<t._a16)&&this._a00>t._a00))},o.prototype.lessThan=o.prototype.lt=function(t){return this._a48<t._a48||!(this._a48>t._a48)&&(this._a32<t._a32||!(this._a32>t._a32)&&(this._a16<t._a16||!(this._a16>t._a16)&&this._a00<t._a00))},o.prototype.or=function(t){return this._a00|=t._a00,this._a16|=t._a16,this._a32|=t._a32,this._a48|=t._a48,this},o.prototype.and=function(t){return this._a00&=t._a00,this._a16&=t._a16,this._a32&=t._a32,this._a48&=t._a48,this},o.prototype.xor=function(t){return this._a00^=t._a00,this._a16^=t._a16,this._a32^=t._a32,this._a48^=t._a48,this},o.prototype.not=function(){return this._a00=65535&~this._a00,this._a16=65535&~this._a16,this._a32=65535&~this._a32,this._a48=65535&~this._a48,this},o.prototype.shiftRight=o.prototype.shiftr=function(t){return(t%=64)>=48?(this._a00=this._a48>>t-48,this._a16=0,this._a32=0,this._a48=0):t>=32?(t-=32,this._a00=65535&(this._a32>>t|this._a48<<16-t),this._a16=this._a48>>t&65535,this._a32=0,this._a48=0):t>=16?(t-=16,this._a00=65535&(this._a16>>t|this._a32<<16-t),this._a16=65535&(this._a32>>t|this._a48<<16-t),this._a32=this._a48>>t&65535,this._a48=0):(this._a00=65535&(this._a00>>t|this._a16<<16-t),this._a16=65535&(this._a16>>t|this._a32<<16-t),this._a32=65535&(this._a32>>t|this._a48<<16-t),this._a48=this._a48>>t&65535),this},o.prototype.shiftLeft=o.prototype.shiftl=function(t,e){return(t%=64)>=48?(this._a48=this._a00<<t-48,this._a32=0,this._a16=0,this._a00=0):t>=32?(t-=32,this._a48=this._a16<<t|this._a00>>16-t,this._a32=this._a00<<t&65535,this._a16=0,this._a00=0):t>=16?(t-=16,this._a48=this._a32<<t|this._a16>>16-t,this._a32=65535&(this._a16<<t|this._a00>>16-t),this._a16=this._a00<<t&65535,this._a00=0):(this._a48=this._a48<<t|this._a32>>16-t,this._a32=65535&(this._a32<<t|this._a16>>16-t),this._a16=65535&(this._a16<<t|this._a00>>16-t),this._a00=this._a00<<t&65535),e||(this._a48&=65535),this},o.prototype.rotateLeft=o.prototype.rotl=function(t){if(0==(t%=64))return this;if(t>=32){var e=this._a00;if(this._a00=this._a32,this._a32=e,e=this._a48,this._a48=this._a16,this._a16=e,32==t)return this;t-=32}var r=this._a48<<16|this._a32,i=this._a16<<16|this._a00,n=r<<t|i>>>32-t,s=i<<t|r>>>32-t;return this._a00=65535&s,this._a16=s>>>16,this._a32=65535&n,this._a48=n>>>16,this},o.prototype.rotateRight=o.prototype.rotr=function(t){if(0==(t%=64))return this;if(t>=32){var e=this._a00;if(this._a00=this._a32,this._a32=e,e=this._a48,this._a48=this._a16,this._a16=e,32==t)return this;t-=32}var r=this._a48<<16|this._a32,i=this._a16<<16|this._a00,n=r>>>t|i<<32-t,s=i>>>t|r<<32-t;return this._a00=65535&s,this._a16=s>>>16,this._a32=65535&n,this._a48=n>>>16,this},o.prototype.clone=function(){return new o(this._a00,this._a16,this._a32,this._a48)},void 0===(i=function(){return o}.apply(e,[]))||(t.exports=i)}()},function(t,e,r){"use strict";var i="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t};r(1);var n=r(0),s=r(2),o=r(19),a=r(3),h={},u=function t(e,r,o,a,h,u){for(var c=function(i){var c=a[i];if(!c.unpack){var f=h[c.filename].transformed,p=fs.createReadStream(f?f.path:c.filename);return p.pipe(o,{end:!1}),p.on("error",u),{v:p.on("end",function(){return t(e,r,o,a.slice(i+1),h,u)})}}var l=n.relative(r.src,c.filename);try{!function(t,e,r){var i=n.join(e,r),o=n.join(t,r),a=fs.readFileSync(i),h=fs.statSync(i);s.sync(n.dirname(o)),fs.writeFileSync(o,a,{mode:h.mode})}(e+".unpacked",r.src,l)}catch(t){return{v:u(t)}}return{v:t(e,r,o,a.slice(1),h,u)}},f=0;f<a.length;f++){var p=c(f);if("object"===(void 0===p?"undefined":i(p)))return p.v}return o.end(),u(null)};t.exports.writeFilesystem=function(t,e,r,i,n){var s=void 0,a=void 0;try{var h=o.createEmpty();h.writeString(JSON.stringify(e.header)),a=h.toBuffer();var c=o.createEmpty();c.writeUInt32(a.length),s=c.toBuffer()}catch(t){return n(t)}var f=fs.createWriteStream(t);return f.on("error",n),f.write(s),f.write(a,function(){return u(t,e,f,r,i,n)})},t.exports.readArchiveHeaderSync=function(t){var e=fs.openSync(t,"r"),r=void 0,i=void 0;try{var n=new Buffer(8),s=this.checkFileSignature(t,null);if(8!==fs.readSync(e,n,0,8,s))throw new Error("Unable to read header size");if(r=o.createFromBuffer(n).createIterator().readUInt32(),i=new Buffer(r),fs.readSync(e,i,0,r,s+8)!==r)throw new Error("Unable to read header")}finally{fs.closeSync(e)}var a=o.createFromBuffer(i).createIterator().readString();return{header:JSON.parse(a),headerSize:r}},t.exports.readFilesystemSync=function(t){if(!h[t]){var e=this.readArchiveHeaderSync(t),r=new a(t);r.header=e.header,r.headerSize=e.headerSize,h[t]=r}return h[t]},t.exports.uncacheFilesystem=function(t){return!!h[t]&&(h[t]=void 0,!0)},t.exports.uncacheAll=function(){h={}},t.exports.readFileSync=function(t,e,r){var i=new Buffer(r.size);if(r.size<=0)return i;if(r.unpacked)i=fs.readFileSync(n.join(t.src+".unpacked",e));else{var s=fs.openSync(t.src,"r");try{var o=8+t.headerSize+parseInt(r.offset);fs.readSync(s,i,0,r.size,o)}finally{fs.closeSync(s)}}return i},t.exports.checkFileSignature=function(t,e){var r=fs.openSync(t,"r"),i=Buffer.alloc(12),n=fs.fstatSync(r).size;if(n>12){fs.readSync(r,i,0,12,n-12);var s=[i.readUIntLE(0,6),i.readUIntLE(6,1),i.readUIntLE(7,5)],o=s[0],a=s[1],h=s[2];return fs.closeSync(r),h===o>>a?n-o-12:e}}},function(t,e,r){"use strict";var i=r(20);t.exports={createEmpty:function(){return new i},createFromBuffer:function(t){return new i(t)}}},function(t,e,r){"use strict";var i=function(t,e){return t+(e-t%e)%e},n=function(){function t(t){this.payload=t.header,this.payloadOffset=t.headerSize,this.readIndex=0,this.endIndex=t.getPayloadSize()}return t.prototype.readBool=function(){return 0!==this.readInt()},t.prototype.readInt=function(){return this.readBytes(4,Buffer.prototype.readInt32LE)},t.prototype.readUInt32=function(){return this.readBytes(4,Buffer.prototype.readUInt32LE)},t.prototype.readInt64=function(){return this.readBytes(8,Buffer.prototype.readInt64LE)},t.prototype.readUInt64=function(){return this.readBytes(8,Buffer.prototype.readUInt64LE)},t.prototype.readFloat=function(){return this.readBytes(4,Buffer.prototype.readFloatLE)},t.prototype.readDouble=function(){return this.readBytes(8,Buffer.prototype.readDoubleLE)},t.prototype.readString=function(){return this.readBytes(this.readInt()).toString()},t.prototype.readBytes=function(t,e){var r=this.getReadPayloadOffsetAndAdvance(t);return null!=e?e.call(this.payload,r,t):this.payload.slice(r,r+t)},t.prototype.getReadPayloadOffsetAndAdvance=function(t){if(t>this.endIndex-this.readIndex)throw this.readIndex=this.endIndex,new Error("Failed to read data with length of "+t);var e=this.payloadOffset+this.readIndex;return this.advance(t),e},t.prototype.advance=function(t){var e=i(t,4);this.endIndex-this.readIndex<e?this.readIndex=this.endIndex:this.readIndex+=e},t}(),s=function(){function t(t){t?this.initFromBuffer(t):this.initEmpty()}return t.prototype.initEmpty=function(){this.header=new Buffer(0),this.headerSize=4,this.capacityAfterHeader=0,this.writeOffset=0,this.resize(64),this.setPayloadSize(0)},t.prototype.initFromBuffer=function(t){this.header=t,this.headerSize=t.length-this.getPayloadSize(),this.capacityAfterHeader=9007199254740992,this.writeOffset=0,this.headerSize>t.length&&(this.headerSize=0),this.headerSize!==i(this.headerSize,4)&&(this.headerSize=0),0===this.headerSize&&(this.header=new Buffer(0))},t.prototype.createIterator=function(){return new n(this)},t.prototype.toBuffer=function(){return this.header.slice(0,this.headerSize+this.getPayloadSize())},t.prototype.writeBool=function(t){return this.writeInt(t?1:0)},t.prototype.writeInt=function(t){return this.writeBytes(t,4,Buffer.prototype.writeInt32LE)},t.prototype.writeUInt32=function(t){return this.writeBytes(t,4,Buffer.prototype.writeUInt32LE)},t.prototype.writeInt64=function(t){return this.writeBytes(t,8,Buffer.prototype.writeInt64LE)},t.prototype.writeUInt64=function(t){return this.writeBytes(t,8,Buffer.prototype.writeUInt64LE)},t.prototype.writeFloat=function(t){return this.writeBytes(t,4,Buffer.prototype.writeFloatLE)},t.prototype.writeDouble=function(t){return this.writeBytes(t,8,Buffer.prototype.writeDoubleLE)},t.prototype.writeString=function(t){var e=Buffer.byteLength(t,"utf8");return!!this.writeInt(e)&&this.writeBytes(t,e)},t.prototype.setPayloadSize=function(t){return this.header.writeUInt32LE(t,0)},t.prototype.getPayloadSize=function(){return this.header.readUInt32LE(0)},t.prototype.writeBytes=function(t,e,r){var n=i(e,4),s=this.writeOffset+n;s>this.capacityAfterHeader&&this.resize(Math.max(2*this.capacityAfterHeader,s)),null!=r?r.call(this.header,t,this.headerSize+this.writeOffset):this.header.write(t,this.headerSize+this.writeOffset,e);var o=this.headerSize+this.writeOffset+e;return this.header.fill(0,o,o+n-e),this.setPayloadSize(s),this.writeOffset=s,!0},t.prototype.resize=function(t){t=i(t,64),this.header=Buffer.concat([this.header,new Buffer(t)]),this.capacityAfterHeader=t},t}();t.exports=s}])});