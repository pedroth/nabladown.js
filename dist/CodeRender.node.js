!function(e){var n={};function t(r){if(n[r])return n[r].exports;var u=n[r]={i:r,l:!1,exports:{}};return e[r].call(u.exports,u,u.exports,t),u.l=!0,u.exports}t.m=e,t.c=n,t.d=function(e,n,r){t.o(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:r})},t.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},t.t=function(e,n){if(1&n&&(e=t(e)),8&n)return e;if(4&n&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(t.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&n&&"string"!=typeof e)for(var u in e)t.d(r,u,function(n){return e[n]}.bind(null,u));return r},t.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(n,"a",n),n},t.o=function(e,n){return Object.prototype.hasOwnProperty.call(e,n)},t.p="",t(t.s=12)}([function(e,n,t){"use strict";t.d(n,"f",(function(){return f})),t.d(n,"h",(function(){return s})),t.d(n,"b",(function(){return p})),t.d(n,"e",(function(){return m})),t.d(n,"g",(function(){return v})),t.d(n,"c",(function(){return h})),t.d(n,"a",(function(){return y})),t.d(n,"d",(function(){return b}));var r=t(7),u=t.n(r),i=t(8),o=t.n(i),c=t(1),a=t.n(c);function l(e,n){var t;if("undefined"==typeof Symbol||null==e[Symbol.iterator]){if(Array.isArray(e)||(t=function(e,n){if(!e)return;if("string"==typeof e)return d(e,n);var t=Object.prototype.toString.call(e).slice(8,-1);"Object"===t&&e.constructor&&(t=e.constructor.name);if("Map"===t||"Set"===t)return Array.from(e);if("Arguments"===t||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t))return d(e,n)}(e))||n&&e&&"number"==typeof e.length){t&&(e=t);var r=0,u=function(){};return{s:u,n:function(){return r>=e.length?{done:!0}:{done:!1,value:e[r++]}},e:function(e){throw e},f:u}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var i,o=!0,c=!1;return{s:function(){t=e[Symbol.iterator]()},n:function(){var e=t.next();return o=e.done,e},e:function(e){c=!0,i=e},f:function(){try{o||null==t.return||t.return()}finally{if(c)throw i}}}}function d(e,n){(null==n||n>e.length)&&(n=e.length);for(var t=0,r=new Array(n);t<n;t++)r[t]=e[t];return r}function f(e,n){return{left:e,right:n}}function s(e){var n=a()(e);return{next:function(){return s(n.slice(1))},peek:function(){return n[0]},hasNext:function(){return n.length>=1},isEmpty:function(){return 0===n.length},toString:function(){return n.map((function(e){return"string"==typeof e?e:JSON.stringify(e)})).join("")},filter:function(e){return s(n.filter(e))},log:function(){for(var e=s(n);e.hasNext();)console.log(e.peek()),e=e.next()}}}function p(e,n){return function(t){if(0===e)return t;if(n(t))return p(e-1,n)(t.next());throw new Error("Caught error while eating ".concat(e," symbols"),t.toString())}}function m(){for(var e=null,n=arguments.length,t=new Array(n),r=0;r<n;r++)t[r]=arguments[r];for(var u=0;u<t.length;u++)try{return t[u]()}catch(n){e=n}throw e}function v(e){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:k();return function(t){for(var r=0;r<e.length;r++)if(e[r].predicate(t))return e[r].value(t);return n}}function h(e){var n,t=eval,r=null==e||null===(n=e.attributes.src)||void 0===n?void 0:n.textContent;return r?fetch(r).then((function(e){return e.text()})).then((function(e){t(e)})):new Promise((function(n,r){t(e.innerText),n(!0)}))}function y(e){return g.apply(this,arguments)}function g(){return(g=o()(u.a.mark((function e(n){var t,r,i;return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:t=l(n),e.prev=1,t.s();case 3:if((r=t.n()).done){e.next=9;break}return i=r.value,e.next=7,i();case 7:e.next=3;break;case 9:e.next=14;break;case 11:e.prev=11,e.t0=e.catch(1),t.e(e.t0);case 14:return e.prev=14,t.f(),e.finish(14);case 17:case"end":return e.stop()}}),e,null,[[1,11,14,17]])})))).apply(this,arguments)}function b(e){return"HTMLParagraphElement"===e.constructor.name}function k(){return document.createElement("div")}},function(e,n){e.exports=require("@babel/runtime/helpers/esm/toConsumableArray")},function(e,n){e.exports=require("@babel/runtime/helpers/esm/getPrototypeOf")},function(e,n){e.exports=require("@babel/runtime/helpers/esm/classCallCheck")},function(e,n){e.exports=require("@babel/runtime/helpers/esm/createClass")},function(e,n){e.exports=require("@babel/runtime/helpers/esm/inherits")},function(e,n){e.exports=require("@babel/runtime/helpers/esm/possibleConstructorReturn")},function(e,n){e.exports=require("@babel/runtime/regenerator")},function(e,n){e.exports=require("@babel/runtime/helpers/esm/asyncToGenerator")},function(e,n,t){"use strict";t.r(n),t.d(n,"render",(function(){return y})),t.d(n,"composeRender",(function(){return g})),t.d(n,"Render",(function(){return b}));var r=t(1),u=t.n(r),i=t(4),o=t.n(i),c=t(3),a=t.n(c),l=t(5),d=t.n(l),f=t(6),s=t.n(f),p=t(2),m=t.n(p),v=t(0);function h(e){var n=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],(function(){}))),!0}catch(e){return!1}}();return function(){var t,r=m()(e);if(n){var u=m()(this).constructor;t=Reflect.construct(r,arguments,u)}else t=r.apply(this,arguments);return s()(this,t)}}function y(e){return(new b).render(e)}function g(){for(var e=function(e){d()(t,e);var n=h(t);function t(){return a()(this,t),n.apply(this,arguments)}return t}(b),n=arguments.length,t=new Array(n),r=0;r<n;r++)t[r]=arguments[r];return t.forEach((function(n){Object.getOwnPropertyNames(n.prototype).filter((function(e){return"constructor"!==e})).forEach((function(t){e.prototype[t]=n.prototype[t]}))})),e}var b=function(){function e(){a()(this,e)}return o()(e,[{key:"render",value:function(e){var n=this.renderProgram(e),t=document.createElement("div");return n.forEach((function(e){return t.appendChild(e)})),t}},{key:"renderProgram",value:function(e){if(null===e.expression&&null===e.program)return[];var n=this.renderExpression(e.expression),t=this.renderProgram(e.program);return[n].concat(u()(t))}},{key:"renderExpression",value:function(e){return this.renderStatement(e.Statement)}},{key:"renderStatement",value:function(e){var n=this;return Object(v.g)([{predicate:function(e){return!!e.Title},value:function(e){return n.renderTitle(e.Title)}},{predicate:function(e){return!!e.List},value:function(e){return n.renderList(e.List)}},{predicate:function(e){return!!e.Seq},value:function(e){return n.renderSeq(e.Seq)}}])(e)}},{key:"renderTitle",value:function(e){var n=e.level,t=e.Seq,r=document.createElement("h".concat(n));return r.innerHTML=this.renderSeq(t).innerHTML,r}},{key:"renderList",value:function(e){var n=this,t=document.createElement("ul");return e.list.map((function(e){t.innerHTML+=n.renderListItem(e).innerHTML})),t}},{key:"renderListItem",value:function(e){var n=document.createElement("div"),t=this.renderSeq(e.Seq),r=document.createElement("li");return r.innerHTML+=t.innerHTML,n.appendChild(r),e.children.length>0&&n.appendChild(this.renderList({type:"list",list:e.children})),n}},{key:"renderSeq",value:function(e){var n=document.createElement("p");return this.renderAuxSeq(e).forEach((function(e){Object(v.d)(e)?n.innerHTML+=e.innerText:n.appendChild(e)})),n}},{key:"renderAuxSeq",value:function(e){if(e.isEmpty)return[];var n=this.renderSeqTypes(e.SeqTypes),t=this.renderAuxSeq(e.Seq);return[n].concat(u()(t))}},{key:"renderSeqTypes",value:function(e){var n=this;return Object(v.g)([{predicate:function(e){return!!e.Text},value:function(e){return n.renderText(e.Text)}},{predicate:function(e){return!!e.Formula},value:function(e){return n.renderFormula(e.Formula)}},{predicate:function(e){return!!e.Html},value:function(e){return n.renderHtml(e.Html)}},{predicate:function(e){return!!e.Code},value:function(e){return n.renderCode(e.Code)}},{predicate:function(e){return!!e.Link},value:function(e){return n.renderLink(e.Link)}},{predicate:function(e){return!!e.Media},value:function(e){return n.renderMedia(e.Media)}},{predicate:function(e){return!!e.Italic},value:function(e){return n.renderItalic(e.Italic)}},{predicate:function(e){return!!e.Bold},value:function(e){return n.renderBold(e.Bold)}}])(e)}},{key:"renderText",value:function(e){var n=e.text,t=document.createElement("p");return t.innerHTML=n,t}},{key:"renderItalic",value:function(e){var n=e.SeqTypes,t=document.createElement("em");return t.innerHTML=this.renderSeqTypes(n).innerHTML,t}},{key:"renderBold",value:function(e){var n=e.SeqTypes,t=document.createElement("strong");return t.innerHTML=this.renderSeqTypes(n).innerHTML,t}},{key:"renderAnyBut",value:function(e){var n=e.textArray,t=document.createElement("p");return t.innerHTML=n.join(""),t}},{key:"renderFormula",value:function(e){var n=e.equation,t=document.createElement("span");return t.innerHTML=n,t}},{key:"renderHtml",value:function(e){var n=e.html,t=document.createElement("div");t.innerHTML=n;var r=Array.from(t.getElementsByTagName("script")).map((function(e){return function(){return Object(v.c)(e)}}));return Object(v.a)(r),t}},{key:"renderCode",value:function(e){var n=this;return Object(v.g)([{predicate:function(e){return!!e.LineCode},value:function(e){return n.renderLineCode(e.LineCode)}},{predicate:function(e){return!!e.BlockCode},value:function(e){return n.renderBlockCode(e.BlockCode)}}])(e)}},{key:"renderLineCode",value:function(e){var n=e.code,t=document.createElement("code");return t.innerText=n,t}},{key:"renderBlockCode",value:function(e){var n=e.code,t=e.language,r=""===t?"plaintext":t,u=document.createElement("pre"),i=document.createElement("code");return i.setAttribute("class","language-".concat(r)),i.innerText=n,u.appendChild(i),u}},{key:"renderLink",value:function(e){var n=e.LinkStat,t=e.link,r=document.createElement("a");r.setAttribute("href",t),t.includes("http")&&r.setAttribute("target","_blank");var u=this.renderLinkStat(n);return r.appendChild(u),r}},{key:"renderMedia",value:function(e){var n=e.LinkStat,t=e.link,r=document.createElement("div");r.setAttribute("style","display: flex; flex-grow: 1; flex-direction: column");var u=this.getMediaElementFromSrc(t),i=this.renderLinkStat(n);return r.appendChild(u),r.appendChild(i),r}},{key:"getMediaElementFromSrc",value:function(e){return Object(v.g)([this.getVideoPredicateValue(),this.getAudioPredicateValue(),this.getImagePredicateValue(),this.getEmbeddedPredicateValue()])(e)}},{key:"getVideoPredicateValue",value:function(){return{predicate:function(e){return[".mp4",".ogg",".avi"].some((function(n){return e.includes(n)}))},value:function(e){var n=document.createElement("video");return n.setAttribute("src",e),n.setAttribute("controls",""),n}}}},{key:"getAudioPredicateValue",value:function(){return{predicate:function(e){return[".mp3",".ogg",".wav"].some((function(n){return e.includes(n)}))},value:function(e){var n=document.createElement("audio");return n.setAttribute("src",e),n.setAttribute("controls",""),n}}}},{key:"getImagePredicateValue",value:function(){return{predicate:function(e){return[".apng",".avif",".gif",".jpg",".jpeg",".jfif",".pjpeg",".pjp",".png",".svg",".webp"].some((function(n){return e.includes(n)}))},value:function(e){var n=document.createElement("img");return n.setAttribute("src",e),n}}}},{key:"getEmbeddedPredicateValue",value:function(){return{predicate:function(e){return[".youtube.com","youtu.be"].some((function(n){return e.includes(n)}))},value:function(e){var n=document.createElement("iframe"),t=Object(v.e)((function(){return e.split("v=")[1].split("&")[0]}),(function(){return e.split(".be/")[1]}));return n.setAttribute("src","https://www.youtube-nocookie.com/embed/"+t),n.setAttribute("frameborder",0),n.setAttribute("height","315"),n.setAttribute("allow","fullscreen; clipboard-write; encrypted-media; picture-in-picture"),n}}}},{key:"renderLinkStat",value:function(e){var n=document.createElement("span");return this.renderAuxLinkStat(e).forEach((function(e){Object(v.d)(e)?n.innerHTML+=e.innerText:n.appendChild(e)})),n}},{key:"renderAuxLinkStat",value:function(e){if(e.isEmpty)return[];var n=this.renderLinkTypes(e.LinkType),t=this.renderAuxLinkStat(e.LinkStat);return[n].concat(u()(t))}},{key:"renderLinkTypes",value:function(e){var n=this;return Object(v.g)([{predicate:function(e){return!!e.AnyBut},value:function(e){return n.renderAnyBut(e.AnyBut)}},{predicate:function(e){return!!e.Formula},value:function(e){return n.renderFormula(e.Formula)}},{predicate:function(e){return!!e.Code},value:function(e){return n.renderCode(e.Code)}},{predicate:function(e){return!!e.Html},value:function(e){return n.renderHtml(e.Html)}},{predicate:function(e){return!!e.Italic},value:function(e){return n.renderItalic(e.Italic)}},{predicate:function(e){return!!e.Bold},value:function(e){return n.renderBold(e.Bold)}},{predicate:function(e){return!!e.Single},value:function(e){return n.renderSingle(e.Single)}}])(e)}},{key:"renderSingle",value:function(e){return this.renderText(e)}}]),e}()},function(e,n){e.exports=require("highlight.js")},,function(e,n,t){"use strict";t.r(n),t.d(n,"render",(function(){return y})),t.d(n,"Render",(function(){return g}));var r=t(3),u=t.n(r),i=t(4),o=t.n(i),c=t(5),a=t.n(c),l=t(6),d=t.n(l),f=t(2),s=t.n(f),p=t(9),m=(t(14),t(10)),v=t.n(m);function h(e){var n=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],(function(){}))),!0}catch(e){return!1}}();return function(){var t,r=s()(e);if(n){var u=s()(this).constructor;t=Reflect.construct(r,arguments,u)}else t=r.apply(this,arguments);return d()(this,t)}}function y(e){return(new g).render(e)}var g=function(e){a()(t,e);var n=h(t);function t(){return u()(this,t),n.apply(this,arguments)}return o()(t,[{key:"renderLineCode",value:function(e){var n=e.code;return this.getHighlightedCodeElem(n,"",!0)}},{key:"renderBlockCode",value:function(e){var n=e.code,t=e.language;return this.getHighlightedCodeElem(n,t)}},{key:"getHighlightedCodeElem",value:function(e,n){var t=arguments.length>2&&void 0!==arguments[2]&&arguments[2],r=n&&""!==n.trim()?n:"plaintext",u=t?document.createElement("span"):document.createElement("pre"),i="\n      border-style: solid;\n      border-width: thin;\n      border-radius: 6px;\n      box-sizing: border-box;\n      background-color: #232323;\n      border: hidden;\n      font-size: 85%;\n     ";i+=t?"padding: .2em .4em; color: orange;":"padding: .2em .4em; overflow: auto;",u.setAttribute("style",i);var o=document.createElement("code");return o.setAttribute("class","language-".concat(r)),o.innerHTML=v.a.highlight(r,e).value,u.appendChild(o),u}}]),t}(p.Render)},,function(e,n){e.exports=require("highlight.js/styles/railscasts.css")}]);
//# sourceMappingURL=CodeRender.node.js.map