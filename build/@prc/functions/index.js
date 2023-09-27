!function(){"use strict";var e={n:function(t){var n=t&&t.__esModule?function(){return t.default}:function(){return t};return e.d(n,{a:n}),n},d:function(t,n){for(var l in n)e.o(n,l)&&!e.o(t,l)&&Object.defineProperty(t,l,{enumerable:!0,get:n[l]})},o:function(e,t){return Object.prototype.hasOwnProperty.call(e,t)}},t=window.wp.apiFetch,n=e.n(t);function l(e,t=25){return new Promise((l=>{const r={};n()({path:`/wp/v2/${e}?per_page=${t}`}).then((t=>{for(let n=0;n<t.length;n++){const l=t[n].slug.replace(`${e.toLowerCase()}_`,"");r[t[n].id]={id:t[n].id,name:t[n].name,parent:t[n].parent,slug:l}}l(r)}))}))}function r(e,t){window.prcFunctions[e]||(window.prcFunctions[e]=t)}window.prcFunctions={},r("getTerms",l),r("getTermsByLetter",(function(e,t){return new Promise((l=>{n()({path:`/prc-api/v2/blocks/helpers/get-taxonomy-by-letter/?taxonomy=${e}&letter=${t}`}).then((e=>{l(e)}))}))})),r("getTermsAsOptions",(function(e,t,n="slug",r=!0){return new Promise((a=>{l(e,t).then((e=>{const t=[];Object.keys(e).forEach((l=>{const r=e[l],a=r[n];let o=r.name;void 0!==r.parent&&0!==r.parent&&(o=` -- ${o}`),t.push({value:a,label:o})})),!1!==r&&t.sort(((e,t)=>e.label>t.label?1:-1)),a(t)}))}))})),r("getTermsAsTree",(function(e){return new Promise((t=>{l(e).then((e=>{const n=[],l=Object.keys(e).map((t=>e[t]));l.filter((e=>0===e.parent)).forEach((e=>{const t=l.filter((t=>t.parent===e.id)),r=[];t.forEach((e=>{r.push({name:e.name,id:e.id})})),n.push({name:e.name,id:e.id,children:r})})),t(n)}))}))})),r("ifMatchSetAttribute",(function(e,t,n,l,r){e===t&&r({[n]:l})})),r("randomId",(function(){return`_${Math.random().toString(36).substr(2,9)}`})),r("mailChimpInterests",[{label:"Weekly roundup of all new publications",value:"xyz"},{label:"Quarterly update from the president",value:"xyz"},{label:"--",value:!1},{label:"Global attitudes & trends (twice a month)",value:"xyz"},{label:"Internet, science & tech (monthly)",value:"xyz"},{label:"Daily briefing of media news",value:"xyz"},{label:"Race & ethnicity (monthly)",value:"xyz"},{label:"Religion & public life - Weekly newsletter",value:"xyz"},{label:"Religion & public life - Daily religion headlines",value:"xyz"},{label:"Social & demographic trends (monthly)",value:"xyz"},{label:"Methodological research (quarterly)",value:"xyz"},{label:"U.S. politics & policy (monthly)",value:"xyz"},{label:"--",value:!1},{label:"SELECT ALL",value:"select-all"},{label:"--",value:!1},{label:"Mini-course - U.S. Immigration",value:"xxx"},{label:"Mini-course - U.S. Census",value:"xxxx"},{label:"Mini-course - Muslims and Islam",value:"xxxxx"}]),r("arrayToCSV",(function(e,t){if(void 0===e||0===e.length)return!1;const n="object"!=typeof e?JSON.parse(e):e,l=e=>void 0!==e?e:"";let r="";void 0!==t&&(r+=`${l(t.title)}\n\t\t\t${l(t.subtitle)}\n\n\t\t\t`),console.log({array:n});for(let e=0;e<n.length;e+=1){let t="";for(let l=0;l<n[e].length;l+=1)l>0&&(t+=","),n[e][l].indexOf(",")>-1?t+=`"${n[e][l]}"`:t+=n[e][l];r+=`${t}\n\t\t`}return void 0!==t&&(r+=`\n\t\t${l(t.note)}\n\t\t${l(t.source)}\n\t\t${l(t.tag)}`),r})),r("tableToArray",(function(e){const t=e.querySelectorAll("tr"),n=[];for(let e=0;e<t.length;e+=1){const l=t[e].querySelectorAll("td, th"),r=[];for(let e=0;e<l.length;e+=1){const t=l[e];r.push(t.innerText)}n.push(r)}return n})),r("wpRestApiTermsToTree",(function(e,t=[]){const n=t=>{const l=e.find((e=>e.id===t));return 0===l.parent?l:n(l.parent,e)},l=[];if(!e)return l;const r=Object.keys(e).map((t=>e[t]));r.filter((e=>0===e.parent)).forEach((e=>{const t=r.filter((t=>t.parent===e.id)),n=[];t.forEach((e=>{n.push({name:e.name,id:e.id,meta:e.meta})})),n.sort(((e,t)=>e.name>t.name?1:-1)),l.push({name:e.name,id:e.id,meta:e.meta,children:n})}));let a=l;if(0<t.length){const e=[];t.forEach((t=>{const r=n(t),a=l.findIndex((e=>e.id===r.id));e.push(l[a])})),a=e}return a})),console.log("Loading @prc/functions...",window.prcFunctions)}();