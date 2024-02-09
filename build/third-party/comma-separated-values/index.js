(()=>{var t={114:function(t,e){var n,r;n=function(){"use strict";var t=["|","^"],e=[",",";","\t","|","^"],n=["\r\n","\r","\n"];var r=Array.isArray||function(t){return"[object Array]"===toString.call(t)};function i(t){return"string"==typeof t}function o(t,e){return function(t){return null!=t}(t)?t:e}function c(t,e){for(var n=0,r=t.length;n<r&&!1!==e(t[n],n);n+=1);}function a(t){return t.replace(/"/g,'\\"')}function u(t){return"attrs["+t+"]"}function s(t,e){return isNaN(Number(t))?function(t){return 0==t||1==t}(t)?"Boolean("+u(e)+" == true)":"String("+u(e)+")":"Number("+u(e)+")"}function l(t,e,n,o){var l=[];return 3==arguments.length?(e?r(e)?c(n,(function(n,r){i(e[r])?e[r]=e[r].toLowerCase():t[e[r]]=e[r],l.push("deserialize[cast["+r+"]]("+u(r)+")")})):c(n,(function(t,e){l.push(s(t,e))})):c(n,(function(t,e){l.push(u(e))})),l="return ["+l.join(",")+"]"):(e?r(e)?c(n,(function(n,r){i(e[r])?e[r]=e[r].toLowerCase():t[e[r]]=e[r],l.push('"'+a(o[r])+'": deserialize[cast['+r+"]]("+u(r)+")")})):c(n,(function(t,e){l.push('"'+a(o[e])+'": '+s(t,e))})):c(n,(function(t,e){l.push('"'+a(o[e])+'": '+u(e))})),l="return {"+l.join(",")+"}"),new Function("attrs","deserialize","cast",l)}function f(e,n){var r,i=0;return c(n,(function(n){var o,c=n;-1!=t.indexOf(n)&&(c="\\"+c),(o=e.match(new RegExp(c,"g")))&&o.length>i&&(i=o.length,r=n)})),r||n[0]}var h=function(){function t(t,c){if(c||(c={}),r(t))this.mode="encode";else{if(!i(t))throw new Error("Incompatible format!");this.mode="parse"}this.data=t,this.options={header:o(c.header,!1),cast:o(c.cast,!0)};var a=c.lineDelimiter||c.line,u=c.cellDelimiter||c.delimiter;this.isParser()?(this.options.lineDelimiter=a||f(this.data,n),this.options.cellDelimiter=u||f(this.data,e),this.data=function(t,e){return t.slice(-e.length)!=e&&(t+=e),t}(this.data,this.options.lineDelimiter)):this.isEncoder()&&(this.options.lineDelimiter=a||"\r\n",this.options.cellDelimiter=u||",")}function a(t,e,n,r,i){t(new e(n,r,i))}function u(t){return r(t)?"array":function(t){var e=typeof t;return"function"===e||"object"===e&&!!t}(t)?"object":i(t)?"string":null==t?"null":"primitive"}return t.prototype.set=function(t,e){return this.options[t]=e},t.prototype.isParser=function(){return"parse"==this.mode},t.prototype.isEncoder=function(){return"encode"==this.mode},t.prototype.parse=function(t){if("parse"==this.mode){if(0===this.data.trim().length)return[];var e,n,i,o=this.data,c=this.options,u=c.header,s={cell:"",line:[]},f=this.deserialize;t||(i=[],t=function(t){i.push(t)}),1==c.lineDelimiter.length&&(w=b);var h,p,d,g=o.length,m=c.cellDelimiter.charCodeAt(0),y=c.lineDelimiter.charCodeAt(c.lineDelimiter.length-1);for(v(),h=0,p=0;h<g;h++)d=o.charCodeAt(h),e.cell&&(e.cell=!1,34==d)?e.escaped=!0:e.escaped&&34==d?e.quote=!e.quote:(e.escaped&&e.quote||!e.escaped)&&(d==m?(b(s.cell+o.slice(p,h)),p=h+1):d==y&&(w(s.cell+o.slice(p,h)),p=h+1,(s.line.length>1||""!==s.line[0])&&A(),s.line=[]));return i||this}function v(){e={escaped:!1,quote:!1,cell:!0}}function b(t){s.line.push(e.escaped?t.slice(1,-1).replace(/""/g,'"'):t),s.cell="",v()}function w(t){b(t.slice(0,1-c.lineDelimiter.length))}function A(){u?r(u)?(n=l(f,c.cast,s.line,u),(A=function(){a(t,n,s.line,f,c.cast)})()):u=s.line:(n||(n=l(f,c.cast,s.line)),(A=function(){a(t,n,s.line,f,c.cast)})())}},t.prototype.deserialize={string:function(t){return String(t)},number:function(t){return Number(t)},boolean:function(t){return Boolean(t)}},t.prototype.serialize={object:function(t){var e=this,n=Object.keys(t),r=Array(n.length);return c(n,(function(n,i){r[i]=e[u(t[n])](t[n])})),r},array:function(t){var e=this,n=Array(t.length);return c(t,(function(t,r){n[r]=e[u(t)](t)})),n},string:function(t){return'"'+String(t).replace(/"/g,'""')+'"'},null:function(t){return""},primitive:function(t){return t}},t.prototype.encode=function(t){if("encode"==this.mode){if(0==this.data.length)return"";var e,n,o=this.data,a=this.options,s=a.header,l=o[0],f=this.serialize,h=0;t||(n=Array(o.length),t=function(t,e){n[e+h]=t}),s&&(r(s)||(s=e=Object.keys(l)),t(g(f.array(s)),0),h=1);var p,d=u(l);return"array"==d?(r(a.cast)?(p=Array(a.cast.length),c(a.cast,(function(t,e){i(t)?p[e]=t.toLowerCase():(p[e]=t,f[t]=t)}))):(p=Array(l.length),c(l,(function(t,e){p[e]=u(t)}))),c(o,(function(e,n){var r=Array(p.length);c(e,(function(t,e){r[e]=f[p[e]](t)})),t(g(r),n)}))):"object"==d&&(e=Object.keys(l),r(a.cast)?(p=Array(a.cast.length),c(a.cast,(function(t,e){i(t)?p[e]=t.toLowerCase():(p[e]=t,f[t]=t)}))):(p=Array(e.length),c(e,(function(t,e){p[e]=u(l[t])}))),c(o,(function(n,r){var i=Array(e.length);c(e,(function(t,e){i[e]=f[p[e]](n[t])})),t(g(i),r)}))),n?n.join(a.lineDelimiter):this}function g(t){return t.join(a.cellDelimiter)}},t.prototype.forEach=function(t){return this[this.mode](t)},t}();return h.parse=function(t,e){return new h(t,e).parse()},h.encode=function(t,e){return new h(t,e).encode()},h.forEach=function(t,e,n){return 2==arguments.length&&(n=e),new h(t,e).forEach(n)},h},void 0===(r=n.apply(e,[]))||(t.exports=r)}},e={};function n(r){var i=e[r];if(void 0!==i)return i.exports;var o=e[r]={exports:{}};return t[r].call(o.exports,o,o.exports,n),o.exports}n.n=t=>{var e=t&&t.__esModule?()=>t.default:()=>t;return n.d(e,{a:e}),e},n.d=(t,e)=>{for(var r in e)n.o(e,r)&&!n.o(t,r)&&Object.defineProperty(t,r,{enumerable:!0,get:e[r]})},n.o=(t,e)=>Object.prototype.hasOwnProperty.call(t,e),(()=>{"use strict";var t;t=n(114),window.CSV||(window.CSV=t)})()})();