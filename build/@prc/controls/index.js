(()=>{"use strict";var e={n:t=>{var n=t&&t.__esModule?()=>t.default:()=>t;return e.d(n,{a:n}),n},d:(t,n)=>{for(var r in n)e.o(n,r)&&!e.o(t,r)&&Object.defineProperty(t,r,{enumerable:!0,get:n[r]})},o:(e,t)=>Object.prototype.hasOwnProperty.call(e,t)};const t=window.React,n=window.ReactDOM;function r(e,t,n){return(e=e.slice()).splice(n<0?e.length+n:n,0,e.splice(t,1)[0]),e}function i(e){const t=window.getComputedStyle(e);return Math.max(parseInt(t["margin-top"],10),parseInt(t["margin-bottom"],10))+e.getBoundingClientRect().height}function s(e,t=0,n=0){e&&(null!==t&&null!==n?e.style.transform=`translate(${n}px, ${t}px)`:e.style.removeProperty("transform"))}function a(e,t,n){e&&(e.style.transition=`transform ${t}ms${n?` ${n}`:""}`)}const o=e=>{let t=[],n=null;const r=(...r)=>{t=r,n||(n=requestAnimationFrame((()=>{n=null,e(...t)})))};return r.cancel=()=>{n&&cancelAnimationFrame(n)},r};function l(e,t){const n=["input","textarea","select","option","optgroup","video","audio","button","a"],r=["button","link","checkbox","tab"];for(;e!==t;){if(e.getAttribute("data-movable-handle"))return!1;if(n.includes(e.tagName.toLowerCase()))return!0;const t=e.getAttribute("role");if(t&&r.includes(t.toLowerCase()))return!0;if("label"===e.tagName.toLowerCase()&&e.hasAttribute("for"))return!0;e.tagName&&(e=e.parentElement)}return!1}const c=200,u=10,d=10;class h extends t.Component{constructor(e){super(e),this.listRef=t.createRef(),this.ghostRef=t.createRef(),this.topOffsets=[],this.itemTranslateOffsets=[],this.initialYOffset=0,this.lastScroll=0,this.lastYOffset=0,this.lastListYOffset=0,this.needle=-1,this.afterIndex=-2,this.state={itemDragged:-1,itemDraggedOutOfBounds:-1,selectedItem:-1,initialX:0,initialY:0,targetX:0,targetY:0,targetHeight:0,targetWidth:0,liveText:"",scrollingSpeed:0,scrollWindow:!1},this.doScrolling=()=>{const{scrollingSpeed:e,scrollWindow:t}=this.state,n=this.listRef.current;window.requestAnimationFrame((()=>{t?window.scrollTo(window.pageXOffset,window.pageYOffset+1.5*e):n.scrollTop+=e,0!==e&&this.doScrolling()}))},this.getChildren=()=>this.listRef&&this.listRef.current?Array.from(this.listRef.current.children):(console.warn("No items found in the List container. Did you forget to pass & spread the `props` param in renderList?"),[]),this.calculateOffsets=()=>{this.topOffsets=this.getChildren().map((e=>e.getBoundingClientRect().top)),this.itemTranslateOffsets=this.getChildren().map((e=>i(e)))},this.getTargetIndex=e=>this.getChildren().findIndex((t=>t===e.target||t.contains(e.target))),this.onMouseOrTouchStart=e=>{this.dropTimeout&&this.state.itemDragged>-1&&(window.clearTimeout(this.dropTimeout),this.finishDrop());const t=(n=e).touches&&n.touches.length||n.changedTouches&&n.changedTouches.length;var n;if(!t&&0!==e.button)return;const r=this.getTargetIndex(e);if(-1===r||this.props.values[r]&&this.props.values[r].disabled)return void(-1!==this.state.selectedItem&&(this.setState({selectedItem:-1}),this.finishDrop()));const i=this.getChildren()[r],s=i.querySelector("[data-movable-handle]");if((!s||s.contains(e.target))&&!l(e.target,i)){if(e.preventDefault(),this.props.beforeDrag&&this.props.beforeDrag({elements:this.getChildren(),index:r}),t){const e={passive:!1};i.style.touchAction="none",document.addEventListener("touchend",this.schdOnEnd,e),document.addEventListener("touchmove",this.schdOnTouchMove,e),document.addEventListener("touchcancel",this.schdOnEnd,e)}else{document.addEventListener("mousemove",this.schdOnMouseMove),document.addEventListener("mouseup",this.schdOnEnd);const e=this.getChildren()[this.state.itemDragged];e&&e.style&&(e.style.touchAction="")}this.onStart(i,t?e.touches[0].clientX:e.clientX,t?e.touches[0].clientY:e.clientY,r)}},this.getYOffset=()=>{const e=this.listRef.current?this.listRef.current.scrollTop:0;return window.pageYOffset+e},this.onStart=(e,t,n,r)=>{this.state.selectedItem>-1&&(this.setState({selectedItem:-1}),this.needle=-1);const i=e.getBoundingClientRect(),s=window.getComputedStyle(e);this.calculateOffsets(),this.initialYOffset=this.getYOffset(),this.lastYOffset=window.pageYOffset,this.lastListYOffset=this.listRef.current.scrollTop,this.setState({itemDragged:r,targetX:i.left-parseInt(s["margin-left"],10),targetY:i.top-parseInt(s["margin-top"],10),targetHeight:i.height,targetWidth:i.width,initialX:t,initialY:n})},this.onMouseMove=e=>{e.cancelable&&e.preventDefault(),this.onMove(e.clientX,e.clientY)},this.onTouchMove=e=>{e.cancelable&&e.preventDefault(),this.onMove(e.touches[0].clientX,e.touches[0].clientY)},this.onWheel=e=>{this.state.itemDragged<0||(this.lastScroll=this.listRef.current.scrollTop+=e.deltaY,this.moveOtherItems())},this.onMove=(e,t)=>{if(-1===this.state.itemDragged)return null;s(this.ghostRef.current,t-this.state.initialY,this.props.lockVertically?0:e-this.state.initialX),this.autoScrolling(t,t-this.state.initialY),this.moveOtherItems()},this.moveOtherItems=()=>{const e=this.ghostRef.current.getBoundingClientRect(),t=e.top+e.height/2,n=i(this.getChildren()[this.state.itemDragged]),r=this.getYOffset();this.initialYOffset!==r&&(this.topOffsets=this.topOffsets.map((e=>e-(r-this.initialYOffset))),this.initialYOffset=r),this.isDraggedItemOutOfBounds()&&this.props.removableByMove?this.afterIndex=this.topOffsets.length+1:this.afterIndex=function(e,t){let n,r=0,i=e.length-1;for(;r<=i;){if(n=Math.floor((i+r)/2),!e[n+1]||e[n]<=t&&e[n+1]>=t)return n;e[n]<t&&e[n+1]<t?r=n+1:i=n-1}return-1}(this.topOffsets,t),this.animateItems(-1===this.afterIndex?0:this.afterIndex,this.state.itemDragged,n)},this.autoScrolling=(e,t)=>{const{top:n,bottom:r,height:i}=this.listRef.current.getBoundingClientRect(),s=window.innerHeight||document.documentElement.clientHeight;if(r>s&&s-e<c&&t>d)this.setState({scrollingSpeed:Math.min(Math.round((c-(s-e))/u),Math.round((t-d)/u)),scrollWindow:!0});else if(n<0&&e<c&&t<-10)this.setState({scrollingSpeed:Math.max(Math.round((c-e)/-10),Math.round((t+d)/u)),scrollWindow:!0});else if(this.state.scrollWindow&&0!==this.state.scrollingSpeed&&this.setState({scrollingSpeed:0,scrollWindow:!1}),i+20<this.listRef.current.scrollHeight){let i=0;e-n<c&&t<-10?i=Math.max(Math.round((c-(e-n))/-10),Math.round((t+d)/u)):r-e<c&&t>d&&(i=Math.min(Math.round((c-(r-e))/u),Math.round((t-d)/u))),this.state.scrollingSpeed!==i&&this.setState({scrollingSpeed:i})}},this.animateItems=(e,t,n,r=!1)=>{this.getChildren().forEach(((i,o)=>{if(a(i,this.props.transitionDuration),t===o&&r){if(t===e)return s(i,null);s(i,t<e?this.itemTranslateOffsets.slice(t+1,e+1).reduce(((e,t)=>e+t),0):-1*this.itemTranslateOffsets.slice(e,t).reduce(((e,t)=>e+t),0))}else s(i,t<e&&o>t&&o<=e?-n:o<t&&t>e&&o>=e?n:null)}))},this.isDraggedItemOutOfBounds=()=>{const e=this.getChildren()[this.state.itemDragged].getBoundingClientRect(),t=this.ghostRef.current.getBoundingClientRect();return Math.abs(e.left-t.left)>t.width?(-1===this.state.itemDraggedOutOfBounds&&this.setState({itemDraggedOutOfBounds:this.state.itemDragged}),!0):(this.state.itemDraggedOutOfBounds>-1&&this.setState({itemDraggedOutOfBounds:-1}),!1)},this.onEnd=e=>{e.cancelable&&e.preventDefault(),document.removeEventListener("mousemove",this.schdOnMouseMove),document.removeEventListener("touchmove",this.schdOnTouchMove),document.removeEventListener("mouseup",this.schdOnEnd),document.removeEventListener("touchup",this.schdOnEnd),document.removeEventListener("touchcancel",this.schdOnEnd);const t=this.props.removableByMove&&this.isDraggedItemOutOfBounds();!t&&this.props.transitionDuration>0&&-2!==this.afterIndex&&o((()=>{a(this.ghostRef.current,this.props.transitionDuration,"cubic-bezier(.2,1,.1,1)"),this.afterIndex<1&&0===this.state.itemDragged?s(this.ghostRef.current,0,0):s(this.ghostRef.current,-(window.pageYOffset-this.lastYOffset)-(this.listRef.current.scrollTop-this.lastListYOffset)+(this.state.itemDragged<this.afterIndex?this.itemTranslateOffsets.slice(this.state.itemDragged+1,this.afterIndex+1).reduce(((e,t)=>e+t),0):-1*this.itemTranslateOffsets.slice(this.afterIndex<0?0:this.afterIndex,this.state.itemDragged).reduce(((e,t)=>e+t),0)),0)}))(),this.dropTimeout=window.setTimeout(this.finishDrop,t||-2===this.afterIndex?0:this.props.transitionDuration)},this.finishDrop=()=>{const e=this.props.removableByMove&&this.isDraggedItemOutOfBounds();(e||this.afterIndex>-2&&this.state.itemDragged!==this.afterIndex)&&this.props.onChange({oldIndex:this.state.itemDragged,newIndex:e?-1:Math.max(this.afterIndex,0),targetRect:this.ghostRef.current.getBoundingClientRect()}),this.getChildren().forEach((e=>{a(e,0),s(e,null),e.style.touchAction=""})),this.setState({itemDragged:-1,scrollingSpeed:0}),this.afterIndex=-2,this.lastScroll>0&&(this.listRef.current.scrollTop=this.lastScroll,this.lastScroll=0)},this.onKeyDown=e=>{const t=this.state.selectedItem,n=this.getTargetIndex(e);if(!l(e.target,e.currentTarget)&&-1!==n){if(" "===e.key&&(e.preventDefault(),t===n?(t!==this.needle&&(this.getChildren().forEach((e=>{a(e,0),s(e,null)})),this.props.onChange({oldIndex:t,newIndex:this.needle,targetRect:this.getChildren()[this.needle].getBoundingClientRect()}),this.getChildren()[this.needle].focus()),this.setState({selectedItem:-1,liveText:this.props.voiceover.dropped(t+1,this.needle+1)}),this.needle=-1):(this.setState({selectedItem:n,liveText:this.props.voiceover.lifted(n+1)}),this.needle=n,this.calculateOffsets())),("ArrowDown"===e.key||"j"===e.key)&&t>-1&&this.needle<this.props.values.length-1){e.preventDefault();const n=i(this.getChildren()[t]);this.needle++,this.animateItems(this.needle,t,n,!0),this.setState({liveText:this.props.voiceover.moved(this.needle+1,!1)})}if(("ArrowUp"===e.key||"k"===e.key)&&t>-1&&this.needle>0){e.preventDefault();const n=i(this.getChildren()[t]);this.needle--,this.animateItems(this.needle,t,n,!0),this.setState({liveText:this.props.voiceover.moved(this.needle+1,!0)})}"Escape"===e.key&&t>-1&&(this.getChildren().forEach((e=>{a(e,0),s(e,null)})),this.setState({selectedItem:-1,liveText:this.props.voiceover.canceled(t+1)}),this.needle=-1),("Tab"===e.key||"Enter"===e.key)&&t>-1&&e.preventDefault()}},this.schdOnMouseMove=o(this.onMouseMove),this.schdOnTouchMove=o(this.onTouchMove),this.schdOnEnd=o(this.onEnd)}componentDidMount(){this.calculateOffsets(),document.addEventListener("touchstart",this.onMouseOrTouchStart,{passive:!1,capture:!1}),document.addEventListener("mousedown",this.onMouseOrTouchStart)}componentDidUpdate(e,t){t.scrollingSpeed!==this.state.scrollingSpeed&&0===t.scrollingSpeed&&this.doScrolling()}componentWillUnmount(){document.removeEventListener("touchstart",this.onMouseOrTouchStart),document.removeEventListener("mousedown",this.onMouseOrTouchStart),this.dropTimeout&&window.clearTimeout(this.dropTimeout),this.schdOnMouseMove.cancel(),this.schdOnTouchMove.cancel(),this.schdOnEnd.cancel()}render(){const e={userSelect:"none",WebkitUserSelect:"none",MozUserSelect:"none",msUserSelect:"none",boxSizing:"border-box",position:"relative"},r={...e,top:this.state.targetY,left:this.state.targetX,width:this.state.targetWidth,height:this.state.targetHeight,position:"fixed",marginTop:0};return t.createElement(t.Fragment,null,this.props.renderList({children:this.props.values.map(((t,n)=>{const r=n===this.state.itemDragged,i=n===this.state.selectedItem,s={key:n,tabIndex:this.props.values[n]&&this.props.values[n].disabled?-1:0,"aria-roledescription":this.props.voiceover.item(n+1),onKeyDown:this.onKeyDown,style:{...e,visibility:r?"hidden":void 0,zIndex:i?5e3:0}};return this.props.renderItem({value:t,props:s,index:n,isDragged:!1,isSelected:i,isOutOfBounds:!1})})),isDragged:this.state.itemDragged>-1,props:{ref:this.listRef}}),this.state.itemDragged>-1&&n.createPortal(this.props.renderItem({value:this.props.values[this.state.itemDragged],props:{ref:this.ghostRef,style:r,onWheel:this.onWheel},index:this.state.itemDragged,isDragged:!0,isSelected:!1,isOutOfBounds:this.state.itemDraggedOutOfBounds>-1}),this.props.container||document.body),t.createElement("div",{"aria-live":"assertive",role:"log","aria-atomic":"true",style:{position:"absolute",width:"1px",height:"1px",margin:"-1px",border:"0px",padding:"0px",overflow:"hidden",clip:"rect(0px, 0px, 0px, 0px)",clipPath:"inset(100%)"}},this.state.liveText))}}h.defaultProps={transitionDuration:300,lockVertically:!1,removableByMove:!1,voiceover:{item:e=>`You are currently at a draggable item at position ${e}. Press space bar to lift.`,lifted:e=>`You have lifted item at position ${e}. Press j to move down, k to move up, space bar to drop and escape to cancel.`,moved:(e,t)=>`You have moved the lifted item ${t?"up":"down"} to position ${e}. Press j to move down, k to move up, space bar to drop and escape to cancel.`,dropped:(e,t)=>`You have dropped the item. It has moved from position ${e} to ${t}.`,canceled:e=>`You have cancelled the movement. The item has returned to its starting position of ${e}.`}};const p=h;function f(){return f=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},f.apply(this,arguments)}function m(e){var t=Object.create(null);return function(n){return void 0===t[n]&&(t[n]=e(n)),t[n]}}var g=/^((children|dangerouslySetInnerHTML|key|ref|autoFocus|defaultValue|defaultChecked|innerHTML|suppressContentEditableWarning|suppressHydrationWarning|valueLink|abbr|accept|acceptCharset|accessKey|action|allow|allowUserMedia|allowPaymentRequest|allowFullScreen|allowTransparency|alt|async|autoComplete|autoPlay|capture|cellPadding|cellSpacing|challenge|charSet|checked|cite|classID|className|cols|colSpan|content|contentEditable|contextMenu|controls|controlsList|coords|crossOrigin|data|dateTime|decoding|default|defer|dir|disabled|disablePictureInPicture|disableRemotePlayback|download|draggable|encType|enterKeyHint|form|formAction|formEncType|formMethod|formNoValidate|formTarget|frameBorder|headers|height|hidden|high|href|hrefLang|htmlFor|httpEquiv|id|inputMode|integrity|is|keyParams|keyType|kind|label|lang|list|loading|loop|low|marginHeight|marginWidth|max|maxLength|media|mediaGroup|method|min|minLength|multiple|muted|name|nonce|noValidate|open|optimum|pattern|placeholder|playsInline|poster|preload|profile|radioGroup|readOnly|referrerPolicy|rel|required|reversed|role|rows|rowSpan|sandbox|scope|scoped|scrolling|seamless|selected|shape|size|sizes|slot|span|spellCheck|src|srcDoc|srcLang|srcSet|start|step|style|summary|tabIndex|target|title|translate|type|useMap|value|width|wmode|wrap|about|datatype|inlist|prefix|property|resource|typeof|vocab|autoCapitalize|autoCorrect|autoSave|color|incremental|fallback|inert|itemProp|itemScope|itemType|itemID|itemRef|on|option|results|security|unselectable|accentHeight|accumulate|additive|alignmentBaseline|allowReorder|alphabetic|amplitude|arabicForm|ascent|attributeName|attributeType|autoReverse|azimuth|baseFrequency|baselineShift|baseProfile|bbox|begin|bias|by|calcMode|capHeight|clip|clipPathUnits|clipPath|clipRule|colorInterpolation|colorInterpolationFilters|colorProfile|colorRendering|contentScriptType|contentStyleType|cursor|cx|cy|d|decelerate|descent|diffuseConstant|direction|display|divisor|dominantBaseline|dur|dx|dy|edgeMode|elevation|enableBackground|end|exponent|externalResourcesRequired|fill|fillOpacity|fillRule|filter|filterRes|filterUnits|floodColor|floodOpacity|focusable|fontFamily|fontSize|fontSizeAdjust|fontStretch|fontStyle|fontVariant|fontWeight|format|from|fr|fx|fy|g1|g2|glyphName|glyphOrientationHorizontal|glyphOrientationVertical|glyphRef|gradientTransform|gradientUnits|hanging|horizAdvX|horizOriginX|ideographic|imageRendering|in|in2|intercept|k|k1|k2|k3|k4|kernelMatrix|kernelUnitLength|kerning|keyPoints|keySplines|keyTimes|lengthAdjust|letterSpacing|lightingColor|limitingConeAngle|local|markerEnd|markerMid|markerStart|markerHeight|markerUnits|markerWidth|mask|maskContentUnits|maskUnits|mathematical|mode|numOctaves|offset|opacity|operator|order|orient|orientation|origin|overflow|overlinePosition|overlineThickness|panose1|paintOrder|pathLength|patternContentUnits|patternTransform|patternUnits|pointerEvents|points|pointsAtX|pointsAtY|pointsAtZ|preserveAlpha|preserveAspectRatio|primitiveUnits|r|radius|refX|refY|renderingIntent|repeatCount|repeatDur|requiredExtensions|requiredFeatures|restart|result|rotate|rx|ry|scale|seed|shapeRendering|slope|spacing|specularConstant|specularExponent|speed|spreadMethod|startOffset|stdDeviation|stemh|stemv|stitchTiles|stopColor|stopOpacity|strikethroughPosition|strikethroughThickness|string|stroke|strokeDasharray|strokeDashoffset|strokeLinecap|strokeLinejoin|strokeMiterlimit|strokeOpacity|strokeWidth|surfaceScale|systemLanguage|tableValues|targetX|targetY|textAnchor|textDecoration|textRendering|textLength|to|transform|u1|u2|underlinePosition|underlineThickness|unicode|unicodeBidi|unicodeRange|unitsPerEm|vAlphabetic|vHanging|vIdeographic|vMathematical|values|vectorEffect|version|vertAdvY|vertOriginX|vertOriginY|viewBox|viewTarget|visibility|widths|wordSpacing|writingMode|x|xHeight|x1|x2|xChannelSelector|xlinkActuate|xlinkArcrole|xlinkHref|xlinkRole|xlinkShow|xlinkTitle|xlinkType|xmlBase|xmlns|xmlnsXlink|xmlLang|xmlSpace|y|y1|y2|yChannelSelector|z|zoomAndPan|for|class|autofocus)|(([Dd][Aa][Tt][Aa]|[Aa][Rr][Ii][Aa]|x)-.*))$/,v=m((function(e){return g.test(e)||111===e.charCodeAt(0)&&110===e.charCodeAt(1)&&e.charCodeAt(2)<91})),y=function(){function e(e){var t=this;this._insertTag=function(e){var n;n=0===t.tags.length?t.insertionPoint?t.insertionPoint.nextSibling:t.prepend?t.container.firstChild:t.before:t.tags[t.tags.length-1].nextSibling,t.container.insertBefore(e,n),t.tags.push(e)},this.isSpeedy=void 0===e.speedy||e.speedy,this.tags=[],this.ctr=0,this.nonce=e.nonce,this.key=e.key,this.container=e.container,this.prepend=e.prepend,this.insertionPoint=e.insertionPoint,this.before=null}var t=e.prototype;return t.hydrate=function(e){e.forEach(this._insertTag)},t.insert=function(e){this.ctr%(this.isSpeedy?65e3:1)==0&&this._insertTag(function(e){var t=document.createElement("style");return t.setAttribute("data-emotion",e.key),void 0!==e.nonce&&t.setAttribute("nonce",e.nonce),t.appendChild(document.createTextNode("")),t.setAttribute("data-s",""),t}(this));var t=this.tags[this.tags.length-1];if(this.isSpeedy){var n=function(e){if(e.sheet)return e.sheet;for(var t=0;t<document.styleSheets.length;t++)if(document.styleSheets[t].ownerNode===e)return document.styleSheets[t]}(t);try{n.insertRule(e,n.cssRules.length)}catch(e){}}else t.appendChild(document.createTextNode(e));this.ctr++},t.flush=function(){this.tags.forEach((function(e){return e.parentNode&&e.parentNode.removeChild(e)})),this.tags=[],this.ctr=0},e}(),b=Math.abs,w=String.fromCharCode,x=Object.assign;function k(e){return e.trim()}function C(e,t,n){return e.replace(t,n)}function O(e,t){return e.indexOf(t)}function S(e,t){return 0|e.charCodeAt(t)}function E(e,t,n){return e.slice(t,n)}function I(e){return e.length}function D(e){return e.length}function T(e,t){return t.push(e),e}var A=1,R=1,M=0,P=0,_=0,$="";function L(e,t,n,r,i,s,a){return{value:e,root:t,parent:n,type:r,props:i,children:s,line:A,column:R,length:a,return:""}}function B(e,t){return x(L("",null,null,"",null,null,0),e,{length:-e.length},t)}function Y(){return _=P>0?S($,--P):0,R--,10===_&&(R=1,A--),_}function z(){return _=P<M?S($,P++):0,R++,10===_&&(R=1,A++),_}function F(){return S($,P)}function N(){return P}function W(e,t){return E($,e,t)}function j(e){switch(e){case 0:case 9:case 10:case 13:case 32:return 5;case 33:case 43:case 44:case 47:case 62:case 64:case 126:case 59:case 123:case 125:return 4;case 58:return 3;case 34:case 39:case 40:case 91:return 2;case 41:case 93:return 1}return 0}function H(e){return A=R=1,M=I($=e),P=0,[]}function X(e){return $="",e}function U(e){return k(W(P-1,G(91===e?e+2:40===e?e+1:e)))}function q(e){for(;(_=F())&&_<33;)z();return j(e)>2||j(_)>3?"":" "}function V(e,t){for(;--t&&z()&&!(_<48||_>102||_>57&&_<65||_>70&&_<97););return W(e,N()+(t<6&&32==F()&&32==z()))}function G(e){for(;z();)switch(_){case e:return P;case 34:case 39:34!==e&&39!==e&&G(_);break;case 40:41===e&&G(e);break;case 92:z()}return P}function K(e,t){for(;z()&&e+_!==57&&(e+_!==84||47!==F()););return"/*"+W(t,P-1)+"*"+w(47===e?e:z())}function Z(e){for(;!j(F());)z();return W(e,P)}var J="-ms-",Q="-moz-",ee="-webkit-",te="comm",ne="rule",re="decl",ie="@keyframes";function se(e,t){for(var n="",r=D(e),i=0;i<r;i++)n+=t(e[i],i,e,t)||"";return n}function ae(e,t,n,r){switch(e.type){case"@layer":if(e.children.length)break;case"@import":case re:return e.return=e.return||e.value;case te:return"";case ie:return e.return=e.value+"{"+se(e.children,r)+"}";case ne:e.value=e.props.join(",")}return I(n=se(e.children,r))?e.return=e.value+"{"+n+"}":""}function oe(e){return X(le("",null,null,null,[""],e=H(e),0,[0],e))}function le(e,t,n,r,i,s,a,o,l){for(var c=0,u=0,d=a,h=0,p=0,f=0,m=1,g=1,v=1,y=0,b="",x=i,k=s,E=r,D=b;g;)switch(f=y,y=z()){case 40:if(108!=f&&58==S(D,d-1)){-1!=O(D+=C(U(y),"&","&\f"),"&\f")&&(v=-1);break}case 34:case 39:case 91:D+=U(y);break;case 9:case 10:case 13:case 32:D+=q(f);break;case 92:D+=V(N()-1,7);continue;case 47:switch(F()){case 42:case 47:T(ue(K(z(),N()),t,n),l);break;default:D+="/"}break;case 123*m:o[c++]=I(D)*v;case 125*m:case 59:case 0:switch(y){case 0:case 125:g=0;case 59+u:-1==v&&(D=C(D,/\f/g,"")),p>0&&I(D)-d&&T(p>32?de(D+";",r,n,d-1):de(C(D," ","")+";",r,n,d-2),l);break;case 59:D+=";";default:if(T(E=ce(D,t,n,c,u,i,o,b,x=[],k=[],d),s),123===y)if(0===u)le(D,t,E,E,x,s,d,o,k);else switch(99===h&&110===S(D,3)?100:h){case 100:case 108:case 109:case 115:le(e,E,E,r&&T(ce(e,E,E,0,0,i,o,b,i,x=[],d),k),i,k,d,o,r?x:k);break;default:le(D,E,E,E,[""],k,0,o,k)}}c=u=p=0,m=v=1,b=D="",d=a;break;case 58:d=1+I(D),p=f;default:if(m<1)if(123==y)--m;else if(125==y&&0==m++&&125==Y())continue;switch(D+=w(y),y*m){case 38:v=u>0?1:(D+="\f",-1);break;case 44:o[c++]=(I(D)-1)*v,v=1;break;case 64:45===F()&&(D+=U(z())),h=F(),u=d=I(b=D+=Z(N())),y++;break;case 45:45===f&&2==I(D)&&(m=0)}}return s}function ce(e,t,n,r,i,s,a,o,l,c,u){for(var d=i-1,h=0===i?s:[""],p=D(h),f=0,m=0,g=0;f<r;++f)for(var v=0,y=E(e,d+1,d=b(m=a[f])),w=e;v<p;++v)(w=k(m>0?h[v]+" "+y:C(y,/&\f/g,h[v])))&&(l[g++]=w);return L(e,t,n,0===i?ne:o,l,c,u)}function ue(e,t,n){return L(e,t,n,te,w(_),E(e,2,-2),0)}function de(e,t,n,r){return L(e,t,n,re,E(e,0,r),E(e,r+1,-1),r)}var he=function(e,t,n){for(var r=0,i=0;r=i,i=F(),38===r&&12===i&&(t[n]=1),!j(i);)z();return W(e,P)},pe=new WeakMap,fe=function(e){if("rule"===e.type&&e.parent&&!(e.length<1)){for(var t=e.value,n=e.parent,r=e.column===n.column&&e.line===n.line;"rule"!==n.type;)if(!(n=n.parent))return;if((1!==e.props.length||58===t.charCodeAt(0)||pe.get(n))&&!r){pe.set(e,!0);for(var i=[],s=function(e,t){return X(function(e,t){var n=-1,r=44;do{switch(j(r)){case 0:38===r&&12===F()&&(t[n]=1),e[n]+=he(P-1,t,n);break;case 2:e[n]+=U(r);break;case 4:if(44===r){e[++n]=58===F()?"&\f":"",t[n]=e[n].length;break}default:e[n]+=w(r)}}while(r=z());return e}(H(e),t))}(t,i),a=n.props,o=0,l=0;o<s.length;o++)for(var c=0;c<a.length;c++,l++)e.props[l]=i[o]?s[o].replace(/&\f/g,a[c]):a[c]+" "+s[o]}}},me=function(e){if("decl"===e.type){var t=e.value;108===t.charCodeAt(0)&&98===t.charCodeAt(2)&&(e.return="",e.value="")}};function ge(e,t){switch(function(e,t){return 45^S(e,0)?(((t<<2^S(e,0))<<2^S(e,1))<<2^S(e,2))<<2^S(e,3):0}(e,t)){case 5103:return ee+"print-"+e+e;case 5737:case 4201:case 3177:case 3433:case 1641:case 4457:case 2921:case 5572:case 6356:case 5844:case 3191:case 6645:case 3005:case 6391:case 5879:case 5623:case 6135:case 4599:case 4855:case 4215:case 6389:case 5109:case 5365:case 5621:case 3829:return ee+e+e;case 5349:case 4246:case 4810:case 6968:case 2756:return ee+e+Q+e+J+e+e;case 6828:case 4268:return ee+e+J+e+e;case 6165:return ee+e+J+"flex-"+e+e;case 5187:return ee+e+C(e,/(\w+).+(:[^]+)/,ee+"box-$1$2"+J+"flex-$1$2")+e;case 5443:return ee+e+J+"flex-item-"+C(e,/flex-|-self/,"")+e;case 4675:return ee+e+J+"flex-line-pack"+C(e,/align-content|flex-|-self/,"")+e;case 5548:return ee+e+J+C(e,"shrink","negative")+e;case 5292:return ee+e+J+C(e,"basis","preferred-size")+e;case 6060:return ee+"box-"+C(e,"-grow","")+ee+e+J+C(e,"grow","positive")+e;case 4554:return ee+C(e,/([^-])(transform)/g,"$1"+ee+"$2")+e;case 6187:return C(C(C(e,/(zoom-|grab)/,ee+"$1"),/(image-set)/,ee+"$1"),e,"")+e;case 5495:case 3959:return C(e,/(image-set\([^]*)/,ee+"$1$`$1");case 4968:return C(C(e,/(.+:)(flex-)?(.*)/,ee+"box-pack:$3"+J+"flex-pack:$3"),/s.+-b[^;]+/,"justify")+ee+e+e;case 4095:case 3583:case 4068:case 2532:return C(e,/(.+)-inline(.+)/,ee+"$1$2")+e;case 8116:case 7059:case 5753:case 5535:case 5445:case 5701:case 4933:case 4677:case 5533:case 5789:case 5021:case 4765:if(I(e)-1-t>6)switch(S(e,t+1)){case 109:if(45!==S(e,t+4))break;case 102:return C(e,/(.+:)(.+)-([^]+)/,"$1"+ee+"$2-$3$1"+Q+(108==S(e,t+3)?"$3":"$2-$3"))+e;case 115:return~O(e,"stretch")?ge(C(e,"stretch","fill-available"),t)+e:e}break;case 4949:if(115!==S(e,t+1))break;case 6444:switch(S(e,I(e)-3-(~O(e,"!important")&&10))){case 107:return C(e,":",":"+ee)+e;case 101:return C(e,/(.+:)([^;!]+)(;|!.+)?/,"$1"+ee+(45===S(e,14)?"inline-":"")+"box$3$1"+ee+"$2$3$1"+J+"$2box$3")+e}break;case 5936:switch(S(e,t+11)){case 114:return ee+e+J+C(e,/[svh]\w+-[tblr]{2}/,"tb")+e;case 108:return ee+e+J+C(e,/[svh]\w+-[tblr]{2}/,"tb-rl")+e;case 45:return ee+e+J+C(e,/[svh]\w+-[tblr]{2}/,"lr")+e}return ee+e+J+e+e}return e}var ve=[function(e,t,n,r){if(e.length>-1&&!e.return)switch(e.type){case re:e.return=ge(e.value,e.length);break;case ie:return se([B(e,{value:C(e.value,"@","@"+ee)})],r);case ne:if(e.length)return function(e,t){return e.map(t).join("")}(e.props,(function(t){switch(function(e,t){return(e=/(::plac\w+|:read-\w+)/.exec(e))?e[0]:e}(t)){case":read-only":case":read-write":return se([B(e,{props:[C(t,/:(read-\w+)/,":-moz-$1")]})],r);case"::placeholder":return se([B(e,{props:[C(t,/:(plac\w+)/,":"+ee+"input-$1")]}),B(e,{props:[C(t,/:(plac\w+)/,":-moz-$1")]}),B(e,{props:[C(t,/:(plac\w+)/,J+"input-$1")]})],r)}return""}))}}],ye=function(e){var t=e.key;if("css"===t){var n=document.querySelectorAll("style[data-emotion]:not([data-s])");Array.prototype.forEach.call(n,(function(e){-1!==e.getAttribute("data-emotion").indexOf(" ")&&(document.head.appendChild(e),e.setAttribute("data-s",""))}))}var r,i,s=e.stylisPlugins||ve,a={},o=[];r=e.container||document.head,Array.prototype.forEach.call(document.querySelectorAll('style[data-emotion^="'+t+' "]'),(function(e){for(var t=e.getAttribute("data-emotion").split(" "),n=1;n<t.length;n++)a[t[n]]=!0;o.push(e)}));var l,c,u,d,h=[ae,(d=function(e){l.insert(e)},function(e){e.root||(e=e.return)&&d(e)})],p=(c=[fe,me].concat(s,h),u=D(c),function(e,t,n,r){for(var i="",s=0;s<u;s++)i+=c[s](e,t,n,r)||"";return i});i=function(e,t,n,r){l=n,se(oe(e?e+"{"+t.styles+"}":t.styles),p),r&&(f.inserted[t.name]=!0)};var f={key:t,sheet:new y({key:t,container:r,nonce:e.nonce,speedy:e.speedy,prepend:e.prepend,insertionPoint:e.insertionPoint}),nonce:e.nonce,inserted:a,registered:{},insert:i};return f.sheet.hydrate(o),f},be={animationIterationCount:1,aspectRatio:1,borderImageOutset:1,borderImageSlice:1,borderImageWidth:1,boxFlex:1,boxFlexGroup:1,boxOrdinalGroup:1,columnCount:1,columns:1,flex:1,flexGrow:1,flexPositive:1,flexShrink:1,flexNegative:1,flexOrder:1,gridRow:1,gridRowEnd:1,gridRowSpan:1,gridRowStart:1,gridColumn:1,gridColumnEnd:1,gridColumnSpan:1,gridColumnStart:1,msGridRow:1,msGridRowSpan:1,msGridColumn:1,msGridColumnSpan:1,fontWeight:1,lineHeight:1,opacity:1,order:1,orphans:1,tabSize:1,widows:1,zIndex:1,zoom:1,WebkitLineClamp:1,fillOpacity:1,floodOpacity:1,stopOpacity:1,strokeDasharray:1,strokeDashoffset:1,strokeMiterlimit:1,strokeOpacity:1,strokeWidth:1},we=/[A-Z]|^ms/g,xe=/_EMO_([^_]+?)_([^]*?)_EMO_/g,ke=function(e){return 45===e.charCodeAt(1)},Ce=function(e){return null!=e&&"boolean"!=typeof e},Oe=m((function(e){return ke(e)?e:e.replace(we,"-$&").toLowerCase()})),Se=function(e,t){switch(e){case"animation":case"animationName":if("string"==typeof t)return t.replace(xe,(function(e,t,n){return Ie={name:t,styles:n,next:Ie},t}))}return 1===be[e]||ke(e)||"number"!=typeof t||0===t?t:t+"px"};function Ee(e,t,n){if(null==n)return"";if(void 0!==n.__emotion_styles)return n;switch(typeof n){case"boolean":return"";case"object":if(1===n.anim)return Ie={name:n.name,styles:n.styles,next:Ie},n.name;if(void 0!==n.styles){var r=n.next;if(void 0!==r)for(;void 0!==r;)Ie={name:r.name,styles:r.styles,next:Ie},r=r.next;return n.styles+";"}return function(e,t,n){var r="";if(Array.isArray(n))for(var i=0;i<n.length;i++)r+=Ee(e,t,n[i])+";";else for(var s in n){var a=n[s];if("object"!=typeof a)null!=t&&void 0!==t[a]?r+=s+"{"+t[a]+"}":Ce(a)&&(r+=Oe(s)+":"+Se(s,a)+";");else if(!Array.isArray(a)||"string"!=typeof a[0]||null!=t&&void 0!==t[a[0]]){var o=Ee(e,t,a);switch(s){case"animation":case"animationName":r+=Oe(s)+":"+o+";";break;default:r+=s+"{"+o+"}"}}else for(var l=0;l<a.length;l++)Ce(a[l])&&(r+=Oe(s)+":"+Se(s,a[l])+";")}return r}(e,t,n);case"function":if(void 0!==e){var i=Ie,s=n(e);return Ie=i,Ee(e,t,s)}}if(null==t)return n;var a=t[n];return void 0!==a?a:n}var Ie,De=/label:\s*([^\s;\n{]+)\s*(;|$)/g,Te=!!t.useInsertionEffect&&t.useInsertionEffect,Ae=Te||function(e){return e()},Re=(Te||t.useLayoutEffect,t.createContext("undefined"!=typeof HTMLElement?ye({key:"css"}):null));Re.Provider;var Me=t.createContext({}),Pe=function(e,t,n){var r=e.key+"-"+t.name;!1===n&&void 0===e.registered[r]&&(e.registered[r]=t.styles)},_e=v,$e=function(e){return"theme"!==e},Le=function(e){return"string"==typeof e&&e.charCodeAt(0)>96?_e:$e},Be=function(e,t,n){var r;if(t){var i=t.shouldForwardProp;r=e.__emotion_forwardProp&&i?function(t){return e.__emotion_forwardProp(t)&&i(t)}:i}return"function"!=typeof r&&n&&(r=e.__emotion_forwardProp),r},Ye=function(e){var t=e.cache,n=e.serialized,r=e.isStringTag;return Pe(t,n,r),Ae((function(){return function(e,t,n){Pe(e,t,n);var r=e.key+"-"+t.name;if(void 0===e.inserted[t.name]){var i=t;do{e.insert(t===i?"."+r:"",i,e.sheet,!0),i=i.next}while(void 0!==i)}}(t,n,r)})),null},ze=function e(n,r){var i,s,a=n.__emotion_real===n,o=a&&n.__emotion_base||n;void 0!==r&&(i=r.label,s=r.target);var l=Be(n,r,a),c=l||Le(o),u=!c("as");return function(){var d=arguments,h=a&&void 0!==n.__emotion_styles?n.__emotion_styles.slice(0):[];if(void 0!==i&&h.push("label:"+i+";"),null==d[0]||void 0===d[0].raw)h.push.apply(h,d);else{h.push(d[0][0]);for(var p=d.length,m=1;m<p;m++)h.push(d[m],d[0][m])}var g,v=(g=function(e,n,r){var i,a,d,p,f=u&&e.as||o,m="",g=[],v=e;if(null==e.theme){for(var y in v={},e)v[y]=e[y];v.theme=t.useContext(Me)}"string"==typeof e.className?(i=n.registered,a=g,d=e.className,p="",d.split(" ").forEach((function(e){void 0!==i[e]?a.push(i[e]+";"):p+=e+" "})),m=p):null!=e.className&&(m=e.className+" ");var b=function(e,t,n){if(1===e.length&&"object"==typeof e[0]&&null!==e[0]&&void 0!==e[0].styles)return e[0];var r=!0,i="";Ie=void 0;var s=e[0];null==s||void 0===s.raw?(r=!1,i+=Ee(n,t,s)):i+=s[0];for(var a=1;a<e.length;a++)i+=Ee(n,t,e[a]),r&&(i+=s[a]);De.lastIndex=0;for(var o,l="";null!==(o=De.exec(i));)l+="-"+o[1];var c=function(e){for(var t,n=0,r=0,i=e.length;i>=4;++r,i-=4)t=1540483477*(65535&(t=255&e.charCodeAt(r)|(255&e.charCodeAt(++r))<<8|(255&e.charCodeAt(++r))<<16|(255&e.charCodeAt(++r))<<24))+(59797*(t>>>16)<<16),n=1540483477*(65535&(t^=t>>>24))+(59797*(t>>>16)<<16)^1540483477*(65535&n)+(59797*(n>>>16)<<16);switch(i){case 3:n^=(255&e.charCodeAt(r+2))<<16;case 2:n^=(255&e.charCodeAt(r+1))<<8;case 1:n=1540483477*(65535&(n^=255&e.charCodeAt(r)))+(59797*(n>>>16)<<16)}return(((n=1540483477*(65535&(n^=n>>>13))+(59797*(n>>>16)<<16))^n>>>15)>>>0).toString(36)}(i)+l;return{name:c,styles:i,next:Ie}}(h.concat(g),n.registered,v);m+=n.key+"-"+b.name,void 0!==s&&(m+=" "+s);var w=u&&void 0===l?Le(f):c,x={};for(var k in e)u&&"as"===k||w(k)&&(x[k]=e[k]);return x.className=m,x.ref=r,t.createElement(t.Fragment,null,t.createElement(Ye,{cache:n,serialized:b,isStringTag:"string"==typeof f}),t.createElement(f,x))},(0,t.forwardRef)((function(e,n){var r=(0,t.useContext)(Re);return g(e,r,n)})));return v.displayName=void 0!==i?i:"Styled("+("string"==typeof o?o:o.displayName||o.name||"Component")+")",v.defaultProps=n.defaultProps,v.__emotion_real=v,v.__emotion_base=o,v.__emotion_styles=h,v.__emotion_forwardProp=l,Object.defineProperty(v,"toString",{value:function(){return"."+s}}),v.withComponent=function(t,n){return e(t,f({},r,n,{shouldForwardProp:Be(v,n,!0)})).apply(void 0,h)},v}}.bind();["a","abbr","address","area","article","aside","audio","b","base","bdi","bdo","big","blockquote","body","br","button","canvas","caption","cite","code","col","colgroup","data","datalist","dd","del","details","dfn","dialog","div","dl","dt","em","embed","fieldset","figcaption","figure","footer","form","h1","h2","h3","h4","h5","h6","head","header","hgroup","hr","html","i","iframe","img","input","ins","kbd","keygen","label","legend","li","link","main","map","mark","marquee","menu","menuitem","meta","meter","nav","noscript","object","ol","optgroup","option","output","p","param","picture","pre","progress","q","rp","rt","ruby","s","samp","script","section","select","small","source","span","strong","style","sub","summary","sup","table","tbody","td","textarea","tfoot","th","thead","time","title","tr","track","u","ul","var","video","wbr","circle","clipPath","defs","ellipse","foreignObject","g","image","line","linearGradient","mask","path","pattern","polygon","polyline","radialGradient","rect","stop","svg","text","tspan"].forEach((function(e){ze[e]=ze(e)}));const Fe=window.wp.i18n,Ne=window.wp.components,We=window.prcIcons,je=window.CSV;var He=e.n(je);function Xe(e,t="td"){return e.map((e=>({content:e,tag:t})))}function Ue(e,t="td"){return"th"===t?Xe(e,t):e.map((e=>({cells:Xe(e,t)})))}function qe(e,t,n,r,i){const s=new FileReader;s.onload=()=>{!function(e,t,n,r,i){const s=new(He())(e,{header:!1}).parse(),a=Ue(s.shift(),"th"),o=(Ue(s),s.reduce(((e,t)=>{const n={};return t.forEach(((e,t)=>{n[a[t].content]=e})),n.value=n[a[0].content].toLowerCase().replace(/\s/g,"-").replace(/[^a-zA-Z0-9-]/g,""),n.label=n[a[0].content],e.push(n),e}),[]));console.log({data:o}),n(o),"function"==typeof i?i(o):"function"==typeof r&&r({[t]:o.filter((e=>!e.disabled)).map((e=>({label:e.label,value:e.value})))})}(s.result,t,n,r,i)},Array.from(e).forEach((e=>s.readAsBinaryString(e)))}const Ve=({children:e})=>{const[n,r]=(0,t.useState)(!1);return(0,t.createElement)(Ne.Button,{style:{width:"100%"},onClick:()=>r(!n)},(0,t.createElement)(We.Icon,{icon:"ellipsis-vertical"}),n&&(0,t.createElement)(Ne.Popover,{placement:"top-end"},(0,t.createElement)("div",{style:{display:"flex",flexDirection:"column",width:"200px"}},e)))},Ge=ze.div`
	grid-column: span 2;
`,Ke=ze.table((e=>({borderSpacing:0,borderCollapse:"collapse",width:"100%",textAlign:"left",overflow:"scroll",backgroundColor:"#FFF",boxShadow:e.isDragged?"0 0 10px rgba(0,0,0,0.1)":"none",cursor:e.isDragged?"grabbing":void 0,marginBottom:"24px"}))),Ze=ze.tr((e=>({cursor:e.isDragged?"grabbing":"grab",backgroundColor:e.isDragged||e.isSelected?"#EEE":"#fff","&:nth-of-type(odd)":{backgroundColor:"#F1F1F1"}}))),Je=ze.span`
	width: 100%;
	display: flex;
	justify-content: space-between;
`;var Qe,et;window.prcControls={},Qe="Sorter",et=function({options:e,setAttributes:n,attribute:i,onChange:s,clientId:a,canEdit:o,isRemovable:l,hasSetActive:c}){const[u,d]=(0,t.useState)(e),[h,f]=(0,t.useState)(""),m=(0,t.useRef)(null),g=(e,t,r)=>{"function"==typeof s?s(e,t,r):"function"==typeof n&&n({[i]:e.map((e=>({label:e.label,value:e.value,isActive:e.isActive||!1,disabled:e.disabled||!1})))})};return(0,t.createElement)(t.Fragment,null,(0,t.createElement)(Ne.PanelRow,null,(0,t.createElement)(p,{values:u,onChange:({oldIndex:e,newIndex:t})=>{const n=r(u,e,t);d(n),g(n,e,t)},renderList:({children:e,props:n,isDragged:r})=>(0,t.createElement)(Ke,{isDragged:r},(0,t.createElement)("thead",null,(0,t.createElement)("tr",null,(0,t.createElement)("th",null,"Label"),(0,t.createElement)("th",null,"Value"),(0,t.createElement)("th",null))),(0,t.createElement)("tbody",{...n},e)),renderItem:({value:e,props:n,index:i,isDragged:s,isSelected:a})=>{const o=(0,t.createElement)(Ze,{...n,key:n.key,isDragged:s,isSelected:a},(0,t.createElement)("td",null,(0,t.createElement)(Ne.__experimentalInputControl,{name:"label",value:e.label,disabled:e.disabled,onChange:e=>{u[i].label=e;const t=r(u,i,i);d(t),g(t,i,i)}})),(0,t.createElement)("td",null,(0,t.createElement)(Ne.__experimentalInputControl,{name:"value",value:e.value,disabled:e.disabled,onChange:e=>{u[i].value=e;const t=r(u,i,i);d(t),g(t,i,i)}})),(0,t.createElement)("td",{style:{textAlign:"center"}},(0,t.createElement)(Ve,null,(0,t.createElement)(Ne.Button,{type:"button",onClick:({oldIndex:e,newIndex:t})=>{u[i].disabled=!u[i].disabled;const n=r(u,e,t);d(n),g(n,e,t)}},e.disabled?(0,t.createElement)(Je,null,"Item is hidden"," ",(0,t.createElement)(We.Icon,{icon:"eye-slash"})):(0,t.createElement)(Je,null,"Item is visible"," ",(0,t.createElement)(We.Icon,{icon:"eye"}))),c&&(0,t.createElement)(Ne.Button,{onClick:({oldIndex:e,newIndex:t})=>{u[i].isActive=!u[i].isActive;const n=r(u,e,t);d(n),g(n,e,t)}},e.isActive?(0,t.createElement)(Je,null,"Item is active"," ",(0,t.createElement)(We.Icon,{icon:"check"})):(0,t.createElement)(Je,null,"Item is not active"," ",(0,t.createElement)(We.Icon,{icon:"xmark"}))),l&&(0,t.createElement)(Ne.Button,{isDestructive:!0,onClick:({oldIndex:e,newIndex:t})=>{const n=function(e,t){return(e=e.slice()).splice(t,1),e}(u,i);d(n),g(n,e,t)}},(0,t.createElement)(Je,null,"Remove Item"," ",(0,t.createElement)(We.Icon,{icon:"trash"}))))));return s?(0,t.createElement)(Ke,{isDragged:s},(0,t.createElement)("tbody",null,o)):o}})),(0,t.createElement)(Ne.PanelRow,null,(0,t.createElement)(Ne.__experimentalInputControl,{style:{width:"100%"},value:h,placeholder:"A new option ...",isPressEnterToChange:!0,onChange:e=>{f(e)}})),(0,t.createElement)(Ne.PanelRow,null,(0,t.createElement)(Ne.Button,{style:{width:"100%",marginBottom:"24px"},type:"button",variant:"secondary",onClick:()=>{const e=h.toLowerCase().replace(/\s/g,"-").replace(/[^a-zA-Z0-9-]/g,""),t=[...u,{label:h,value:e}];d(t),"function"==typeof s?s(t):"function"==typeof n&&n({[i]:t.map((e=>({label:e.label,value:e.value})))}),f("")}},"Add New Option")),(0,t.createElement)(Ne.PanelRow,null,(0,t.createElement)(Ge,null,"Generating a select's options via CSV will take the first column of a CSV and generate them as the labels for their respsective options.")),(0,t.createElement)(Ne.PanelRow,null,(0,t.createElement)(Ne.Button,{variant:"primay",onClick:()=>{m.current.click()}},(0,Fe.__)("Import options from CSV","prc-block-library")),(0,t.createElement)("input",{ref:m,type:"file",accept:"text/csv",onChange:e=>{qe(e.target.files,i,d,n,s)},style:{display:"none"}}),(0,t.createElement)(Ne.DropZone,{onFilesDrop:e=>{qe(e,i,d,n,s)}})),(0,t.createElement)(Ne.PanelRow,null,(0,t.createElement)(Ne.Button,{style:{width:"100%"},type:"button",className:"is-secondary is-destructive",onClick:()=>{d([]),"function"==typeof s?s([]):"function"==typeof n&&n({[i]:[]})}},"Remove All Options")))},window.prcControls[Qe]||(window.prcControls[Qe]=et),console.log("Loading @prc/controls...",window.prcControls)})();
//# sourceMappingURL=index.js.map