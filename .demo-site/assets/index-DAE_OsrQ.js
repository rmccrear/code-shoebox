(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))a(n);new MutationObserver(n=>{for(const i of n)if(i.type==="childList")for(const u of i.addedNodes)u.tagName==="LINK"&&u.rel==="modulepreload"&&a(u)}).observe(document,{childList:!0,subtree:!0});function l(n){const i={};return n.integrity&&(i.integrity=n.integrity),n.referrerPolicy&&(i.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?i.credentials="include":n.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function a(n){if(n.ep)return;n.ep=!0;const i=l(n);fetch(n.href,i)}})();function Fr(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}var Ir={exports:{}},Wi={};/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Eh=Symbol.for("react.transitional.element"),Th=Symbol.for("react.fragment");function Pr(e,t,l){var a=null;if(l!==void 0&&(a=""+l),t.key!==void 0&&(a=""+t.key),"key"in t){l={};for(var n in t)n!=="key"&&(l[n]=t[n])}else l=t;return t=l.ref,{$$typeof:Eh,type:e,key:a,ref:t!==void 0?t:null,props:l}}Wi.Fragment=Th;Wi.jsx=Pr;Wi.jsxs=Pr;Ir.exports=Wi;var o=Ir.exports,ef={exports:{}},L={};/**
 * @license React
 * react.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var ns=Symbol.for("react.transitional.element"),wh=Symbol.for("react.portal"),Mh=Symbol.for("react.fragment"),_h=Symbol.for("react.strict_mode"),jh=Symbol.for("react.profiler"),Ch=Symbol.for("react.consumer"),Oh=Symbol.for("react.context"),Rh=Symbol.for("react.forward_ref"),Ah=Symbol.for("react.suspense"),Nh=Symbol.for("react.memo"),tf=Symbol.for("react.lazy"),zh=Symbol.for("react.activity"),co=Symbol.iterator;function Dh(e){return e===null||typeof e!="object"?null:(e=co&&e[co]||e["@@iterator"],typeof e=="function"?e:null)}var lf={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},af=Object.assign,nf={};function Ta(e,t,l){this.props=e,this.context=t,this.refs=nf,this.updater=l||lf}Ta.prototype.isReactComponent={};Ta.prototype.setState=function(e,t){if(typeof e!="object"&&typeof e!="function"&&e!=null)throw Error("takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,e,t,"setState")};Ta.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")};function uf(){}uf.prototype=Ta.prototype;function is(e,t,l){this.props=e,this.context=t,this.refs=nf,this.updater=l||lf}var us=is.prototype=new uf;us.constructor=is;af(us,Ta.prototype);us.isPureReactComponent=!0;var so=Array.isArray;function ic(){}var ie={H:null,A:null,T:null,S:null},cf=Object.prototype.hasOwnProperty;function cs(e,t,l){var a=l.ref;return{$$typeof:ns,type:e,key:t,ref:a!==void 0?a:null,props:l}}function Hh(e,t){return cs(e.type,t,e.props)}function ss(e){return typeof e=="object"&&e!==null&&e.$$typeof===ns}function Uh(e){var t={"=":"=0",":":"=2"};return"$"+e.replace(/[=:]/g,function(l){return t[l]})}var oo=/\/+/g;function yu(e,t){return typeof e=="object"&&e!==null&&e.key!=null?Uh(""+e.key):t.toString(36)}function Lh(e){switch(e.status){case"fulfilled":return e.value;case"rejected":throw e.reason;default:switch(typeof e.status=="string"?e.then(ic,ic):(e.status="pending",e.then(function(t){e.status==="pending"&&(e.status="fulfilled",e.value=t)},function(t){e.status==="pending"&&(e.status="rejected",e.reason=t)})),e.status){case"fulfilled":return e.value;case"rejected":throw e.reason}}throw e}function Xl(e,t,l,a,n){var i=typeof e;(i==="undefined"||i==="boolean")&&(e=null);var u=!1;if(e===null)u=!0;else switch(i){case"bigint":case"string":case"number":u=!0;break;case"object":switch(e.$$typeof){case ns:case wh:u=!0;break;case tf:return u=e._init,Xl(u(e._payload),t,l,a,n)}}if(u)return n=n(e),u=a===""?"."+yu(e,0):a,so(n)?(l="",u!=null&&(l=u.replace(oo,"$&/")+"/"),Xl(n,t,l,"",function(r){return r})):n!=null&&(ss(n)&&(n=Hh(n,l+(n.key==null||e&&e.key===n.key?"":(""+n.key).replace(oo,"$&/")+"/")+u)),t.push(n)),1;u=0;var c=a===""?".":a+":";if(so(e))for(var s=0;s<e.length;s++)a=e[s],i=c+yu(a,s),u+=Xl(a,t,l,i,n);else if(s=Dh(e),typeof s=="function")for(e=s.call(e),s=0;!(a=e.next()).done;)a=a.value,i=c+yu(a,s++),u+=Xl(a,t,l,i,n);else if(i==="object"){if(typeof e.then=="function")return Xl(Lh(e),t,l,a,n);throw t=String(e),Error("Objects are not valid as a React child (found: "+(t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t)+"). If you meant to render a collection of children, use an array instead.")}return u}function Ln(e,t,l){if(e==null)return e;var a=[],n=0;return Xl(e,a,"","",function(i){return t.call(l,i,n++)}),a}function kh(e){if(e._status===-1){var t=e._result;t=t(),t.then(function(l){(e._status===0||e._status===-1)&&(e._status=1,e._result=l)},function(l){(e._status===0||e._status===-1)&&(e._status=2,e._result=l)}),e._status===-1&&(e._status=0,e._result=t)}if(e._status===1)return e._result.default;throw e._result}var ro=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)},qh={map:Ln,forEach:function(e,t,l){Ln(e,function(){t.apply(this,arguments)},l)},count:function(e){var t=0;return Ln(e,function(){t++}),t},toArray:function(e){return Ln(e,function(t){return t})||[]},only:function(e){if(!ss(e))throw Error("React.Children.only expected to receive a single React element child.");return e}};L.Activity=zh;L.Children=qh;L.Component=Ta;L.Fragment=Mh;L.Profiler=jh;L.PureComponent=is;L.StrictMode=_h;L.Suspense=Ah;L.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=ie;L.__COMPILER_RUNTIME={__proto__:null,c:function(e){return ie.H.useMemoCache(e)}};L.cache=function(e){return function(){return e.apply(null,arguments)}};L.cacheSignal=function(){return null};L.cloneElement=function(e,t,l){if(e==null)throw Error("The argument must be a React element, but you passed "+e+".");var a=af({},e.props),n=e.key;if(t!=null)for(i in t.key!==void 0&&(n=""+t.key),t)!cf.call(t,i)||i==="key"||i==="__self"||i==="__source"||i==="ref"&&t.ref===void 0||(a[i]=t[i]);var i=arguments.length-2;if(i===1)a.children=l;else if(1<i){for(var u=Array(i),c=0;c<i;c++)u[c]=arguments[c+2];a.children=u}return cs(e.type,n,a)};L.createContext=function(e){return e={$$typeof:Oh,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null},e.Provider=e,e.Consumer={$$typeof:Ch,_context:e},e};L.createElement=function(e,t,l){var a,n={},i=null;if(t!=null)for(a in t.key!==void 0&&(i=""+t.key),t)cf.call(t,a)&&a!=="key"&&a!=="__self"&&a!=="__source"&&(n[a]=t[a]);var u=arguments.length-2;if(u===1)n.children=l;else if(1<u){for(var c=Array(u),s=0;s<u;s++)c[s]=arguments[s+2];n.children=c}if(e&&e.defaultProps)for(a in u=e.defaultProps,u)n[a]===void 0&&(n[a]=u[a]);return cs(e,i,n)};L.createRef=function(){return{current:null}};L.forwardRef=function(e){return{$$typeof:Rh,render:e}};L.isValidElement=ss;L.lazy=function(e){return{$$typeof:tf,_payload:{_status:-1,_result:e},_init:kh}};L.memo=function(e,t){return{$$typeof:Nh,type:e,compare:t===void 0?null:t}};L.startTransition=function(e){var t=ie.T,l={};ie.T=l;try{var a=e(),n=ie.S;n!==null&&n(l,a),typeof a=="object"&&a!==null&&typeof a.then=="function"&&a.then(ic,ro)}catch(i){ro(i)}finally{t!==null&&l.types!==null&&(t.types=l.types),ie.T=t}};L.unstable_useCacheRefresh=function(){return ie.H.useCacheRefresh()};L.use=function(e){return ie.H.use(e)};L.useActionState=function(e,t,l){return ie.H.useActionState(e,t,l)};L.useCallback=function(e,t){return ie.H.useCallback(e,t)};L.useContext=function(e){return ie.H.useContext(e)};L.useDebugValue=function(){};L.useDeferredValue=function(e,t){return ie.H.useDeferredValue(e,t)};L.useEffect=function(e,t){return ie.H.useEffect(e,t)};L.useEffectEvent=function(e){return ie.H.useEffectEvent(e)};L.useId=function(){return ie.H.useId()};L.useImperativeHandle=function(e,t,l){return ie.H.useImperativeHandle(e,t,l)};L.useInsertionEffect=function(e,t){return ie.H.useInsertionEffect(e,t)};L.useLayoutEffect=function(e,t){return ie.H.useLayoutEffect(e,t)};L.useMemo=function(e,t){return ie.H.useMemo(e,t)};L.useOptimistic=function(e,t){return ie.H.useOptimistic(e,t)};L.useReducer=function(e,t,l){return ie.H.useReducer(e,t,l)};L.useRef=function(e){return ie.H.useRef(e)};L.useState=function(e){return ie.H.useState(e)};L.useSyncExternalStore=function(e,t,l){return ie.H.useSyncExternalStore(e,t,l)};L.useTransition=function(){return ie.H.useTransition()};L.version="19.2.4";ef.exports=L;var b=ef.exports;const ll=Fr(b);var sf={exports:{}},Fi={},of={exports:{}},rf={};/**
 * @license React
 * scheduler.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */(function(e){function t(M,z){var R=M.length;M.push(z);e:for(;0<R;){var Q=R-1>>>1,ce=M[Q];if(0<n(ce,z))M[Q]=z,M[R]=ce,R=Q;else break e}}function l(M){return M.length===0?null:M[0]}function a(M){if(M.length===0)return null;var z=M[0],R=M.pop();if(R!==z){M[0]=R;e:for(var Q=0,ce=M.length,se=ce>>>1;Q<se;){var be=2*(Q+1)-1,ht=M[be],de=be+1,Ue=M[de];if(0>n(ht,R))de<ce&&0>n(Ue,ht)?(M[Q]=Ue,M[de]=R,Q=de):(M[Q]=ht,M[be]=R,Q=be);else if(de<ce&&0>n(Ue,R))M[Q]=Ue,M[de]=R,Q=de;else break e}}return z}function n(M,z){var R=M.sortIndex-z.sortIndex;return R!==0?R:M.id-z.id}if(e.unstable_now=void 0,typeof performance=="object"&&typeof performance.now=="function"){var i=performance;e.unstable_now=function(){return i.now()}}else{var u=Date,c=u.now();e.unstable_now=function(){return u.now()-c}}var s=[],r=[],p=1,y=null,m=3,g=!1,x=!1,_=!1,A=!1,d=typeof setTimeout=="function"?setTimeout:null,f=typeof clearTimeout=="function"?clearTimeout:null,h=typeof setImmediate<"u"?setImmediate:null;function v(M){for(var z=l(r);z!==null;){if(z.callback===null)a(r);else if(z.startTime<=M)a(r),z.sortIndex=z.expirationTime,t(s,z);else break;z=l(r)}}function T(M){if(_=!1,v(M),!x)if(l(s)!==null)x=!0,j||(j=!0,F());else{var z=l(r);z!==null&&N(T,z.startTime-M)}}var j=!1,E=-1,O=5,C=-1;function w(){return A?!0:!(e.unstable_now()-C<O)}function X(){if(A=!1,j){var M=e.unstable_now();C=M;var z=!0;try{e:{x=!1,_&&(_=!1,f(E),E=-1),g=!0;var R=m;try{t:{for(v(M),y=l(s);y!==null&&!(y.expirationTime>M&&w());){var Q=y.callback;if(typeof Q=="function"){y.callback=null,m=y.priorityLevel;var ce=Q(y.expirationTime<=M);if(M=e.unstable_now(),typeof ce=="function"){y.callback=ce,v(M),z=!0;break t}y===l(s)&&a(s),v(M)}else a(s);y=l(s)}if(y!==null)z=!0;else{var se=l(r);se!==null&&N(T,se.startTime-M),z=!1}}break e}finally{y=null,m=R,g=!1}z=void 0}}finally{z?F():j=!1}}}var F;if(typeof h=="function")F=function(){h(X)};else if(typeof MessageChannel<"u"){var H=new MessageChannel,K=H.port2;H.port1.onmessage=X,F=function(){K.postMessage(null)}}else F=function(){d(X,0)};function N(M,z){E=d(function(){M(e.unstable_now())},z)}e.unstable_IdlePriority=5,e.unstable_ImmediatePriority=1,e.unstable_LowPriority=4,e.unstable_NormalPriority=3,e.unstable_Profiling=null,e.unstable_UserBlockingPriority=2,e.unstable_cancelCallback=function(M){M.callback=null},e.unstable_forceFrameRate=function(M){0>M||125<M?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):O=0<M?Math.floor(1e3/M):5},e.unstable_getCurrentPriorityLevel=function(){return m},e.unstable_next=function(M){switch(m){case 1:case 2:case 3:var z=3;break;default:z=m}var R=m;m=z;try{return M()}finally{m=R}},e.unstable_requestPaint=function(){A=!0},e.unstable_runWithPriority=function(M,z){switch(M){case 1:case 2:case 3:case 4:case 5:break;default:M=3}var R=m;m=M;try{return z()}finally{m=R}},e.unstable_scheduleCallback=function(M,z,R){var Q=e.unstable_now();switch(typeof R=="object"&&R!==null?(R=R.delay,R=typeof R=="number"&&0<R?Q+R:Q):R=Q,M){case 1:var ce=-1;break;case 2:ce=250;break;case 5:ce=1073741823;break;case 4:ce=1e4;break;default:ce=5e3}return ce=R+ce,M={id:p++,callback:z,priorityLevel:M,startTime:R,expirationTime:ce,sortIndex:-1},R>Q?(M.sortIndex=R,t(r,M),l(s)===null&&M===l(r)&&(_?(f(E),E=-1):_=!0,N(T,R-Q))):(M.sortIndex=ce,t(s,M),x||g||(x=!0,j||(j=!0,F()))),M},e.unstable_shouldYield=w,e.unstable_wrapCallback=function(M){var z=m;return function(){var R=m;m=z;try{return M.apply(this,arguments)}finally{m=R}}}})(rf);of.exports=rf;var Bh=of.exports,ff={exports:{}},He={};/**
 * @license React
 * react-dom.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Yh=b;function df(e){var t="https://react.dev/errors/"+e;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var l=2;l<arguments.length;l++)t+="&args[]="+encodeURIComponent(arguments[l])}return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function Qt(){}var De={d:{f:Qt,r:function(){throw Error(df(522))},D:Qt,C:Qt,L:Qt,m:Qt,X:Qt,S:Qt,M:Qt},p:0,findDOMNode:null},Gh=Symbol.for("react.portal");function Xh(e,t,l){var a=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:Gh,key:a==null?null:""+a,children:e,containerInfo:t,implementation:l}}var Za=Yh.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function Ii(e,t){if(e==="font")return"";if(typeof t=="string")return t==="use-credentials"?t:""}He.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=De;He.createPortal=function(e,t){var l=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)throw Error(df(299));return Xh(e,t,null,l)};He.flushSync=function(e){var t=Za.T,l=De.p;try{if(Za.T=null,De.p=2,e)return e()}finally{Za.T=t,De.p=l,De.d.f()}};He.preconnect=function(e,t){typeof e=="string"&&(t?(t=t.crossOrigin,t=typeof t=="string"?t==="use-credentials"?t:"":void 0):t=null,De.d.C(e,t))};He.prefetchDNS=function(e){typeof e=="string"&&De.d.D(e)};He.preinit=function(e,t){if(typeof e=="string"&&t&&typeof t.as=="string"){var l=t.as,a=Ii(l,t.crossOrigin),n=typeof t.integrity=="string"?t.integrity:void 0,i=typeof t.fetchPriority=="string"?t.fetchPriority:void 0;l==="style"?De.d.S(e,typeof t.precedence=="string"?t.precedence:void 0,{crossOrigin:a,integrity:n,fetchPriority:i}):l==="script"&&De.d.X(e,{crossOrigin:a,integrity:n,fetchPriority:i,nonce:typeof t.nonce=="string"?t.nonce:void 0})}};He.preinitModule=function(e,t){if(typeof e=="string")if(typeof t=="object"&&t!==null){if(t.as==null||t.as==="script"){var l=Ii(t.as,t.crossOrigin);De.d.M(e,{crossOrigin:l,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0})}}else t==null&&De.d.M(e)};He.preload=function(e,t){if(typeof e=="string"&&typeof t=="object"&&t!==null&&typeof t.as=="string"){var l=t.as,a=Ii(l,t.crossOrigin);De.d.L(e,l,{crossOrigin:a,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,type:typeof t.type=="string"?t.type:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0,referrerPolicy:typeof t.referrerPolicy=="string"?t.referrerPolicy:void 0,imageSrcSet:typeof t.imageSrcSet=="string"?t.imageSrcSet:void 0,imageSizes:typeof t.imageSizes=="string"?t.imageSizes:void 0,media:typeof t.media=="string"?t.media:void 0})}};He.preloadModule=function(e,t){if(typeof e=="string")if(t){var l=Ii(t.as,t.crossOrigin);De.d.m(e,{as:typeof t.as=="string"&&t.as!=="script"?t.as:void 0,crossOrigin:l,integrity:typeof t.integrity=="string"?t.integrity:void 0})}else De.d.m(e)};He.requestFormReset=function(e){De.d.r(e)};He.unstable_batchedUpdates=function(e,t){return e(t)};He.useFormState=function(e,t,l){return Za.H.useFormState(e,t,l)};He.useFormStatus=function(){return Za.H.useHostTransitionStatus()};He.version="19.2.4";function mf(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(mf)}catch(e){console.error(e)}}mf(),ff.exports=He;var Qh=ff.exports;/**
 * @license React
 * react-dom-client.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Ee=Bh,hf=b,Vh=Qh;function S(e){var t="https://react.dev/errors/"+e;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var l=2;l<arguments.length;l++)t+="&args[]="+encodeURIComponent(arguments[l])}return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function pf(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function Tn(e){var t=e,l=e;if(e.alternate)for(;t.return;)t=t.return;else{e=t;do t=e,t.flags&4098&&(l=t.return),e=t.return;while(e)}return t.tag===3?l:null}function yf(e){if(e.tag===13){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function gf(e){if(e.tag===31){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function fo(e){if(Tn(e)!==e)throw Error(S(188))}function Zh(e){var t=e.alternate;if(!t){if(t=Tn(e),t===null)throw Error(S(188));return t!==e?null:e}for(var l=e,a=t;;){var n=l.return;if(n===null)break;var i=n.alternate;if(i===null){if(a=n.return,a!==null){l=a;continue}break}if(n.child===i.child){for(i=n.child;i;){if(i===l)return fo(n),e;if(i===a)return fo(n),t;i=i.sibling}throw Error(S(188))}if(l.return!==a.return)l=n,a=i;else{for(var u=!1,c=n.child;c;){if(c===l){u=!0,l=n,a=i;break}if(c===a){u=!0,a=n,l=i;break}c=c.sibling}if(!u){for(c=i.child;c;){if(c===l){u=!0,l=i,a=n;break}if(c===a){u=!0,a=i,l=n;break}c=c.sibling}if(!u)throw Error(S(189))}}if(l.alternate!==a)throw Error(S(190))}if(l.tag!==3)throw Error(S(188));return l.stateNode.current===l?e:t}function vf(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e;for(e=e.child;e!==null;){if(t=vf(e),t!==null)return t;e=e.sibling}return null}var ue=Object.assign,Jh=Symbol.for("react.element"),kn=Symbol.for("react.transitional.element"),ka=Symbol.for("react.portal"),Zl=Symbol.for("react.fragment"),bf=Symbol.for("react.strict_mode"),uc=Symbol.for("react.profiler"),Sf=Symbol.for("react.consumer"),Nt=Symbol.for("react.context"),os=Symbol.for("react.forward_ref"),cc=Symbol.for("react.suspense"),sc=Symbol.for("react.suspense_list"),rs=Symbol.for("react.memo"),Vt=Symbol.for("react.lazy"),oc=Symbol.for("react.activity"),Kh=Symbol.for("react.memo_cache_sentinel"),mo=Symbol.iterator;function Aa(e){return e===null||typeof e!="object"?null:(e=mo&&e[mo]||e["@@iterator"],typeof e=="function"?e:null)}var $h=Symbol.for("react.client.reference");function rc(e){if(e==null)return null;if(typeof e=="function")return e.$$typeof===$h?null:e.displayName||e.name||null;if(typeof e=="string")return e;switch(e){case Zl:return"Fragment";case uc:return"Profiler";case bf:return"StrictMode";case cc:return"Suspense";case sc:return"SuspenseList";case oc:return"Activity"}if(typeof e=="object")switch(e.$$typeof){case ka:return"Portal";case Nt:return e.displayName||"Context";case Sf:return(e._context.displayName||"Context")+".Consumer";case os:var t=e.render;return e=e.displayName,e||(e=t.displayName||t.name||"",e=e!==""?"ForwardRef("+e+")":"ForwardRef"),e;case rs:return t=e.displayName||null,t!==null?t:rc(e.type)||"Memo";case Vt:t=e._payload,e=e._init;try{return rc(e(t))}catch{}}return null}var qa=Array.isArray,D=hf.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,J=Vh.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,Ml={pending:!1,data:null,method:null,action:null},fc=[],Jl=-1;function Tt(e){return{current:e}}function Me(e){0>Jl||(e.current=fc[Jl],fc[Jl]=null,Jl--)}function te(e,t){Jl++,fc[Jl]=e.current,e.current=t}var Et=Tt(null),sn=Tt(null),al=Tt(null),bi=Tt(null);function Si(e,t){switch(te(al,t),te(sn,e),te(Et,null),t.nodeType){case 9:case 11:e=(e=t.documentElement)&&(e=e.namespaceURI)?br(e):0;break;default:if(e=t.tagName,t=t.namespaceURI)t=br(t),e=Bm(t,e);else switch(e){case"svg":e=1;break;case"math":e=2;break;default:e=0}}Me(Et),te(Et,e)}function da(){Me(Et),Me(sn),Me(al)}function dc(e){e.memoizedState!==null&&te(bi,e);var t=Et.current,l=Bm(t,e.type);t!==l&&(te(sn,e),te(Et,l))}function xi(e){sn.current===e&&(Me(Et),Me(sn)),bi.current===e&&(Me(bi),bn._currentValue=Ml)}var gu,ho;function Sl(e){if(gu===void 0)try{throw Error()}catch(l){var t=l.stack.trim().match(/\n( *(at )?)/);gu=t&&t[1]||"",ho=-1<l.stack.indexOf(`
    at`)?" (<anonymous>)":-1<l.stack.indexOf("@")?"@unknown:0:0":""}return`
`+gu+e+ho}var vu=!1;function bu(e,t){if(!e||vu)return"";vu=!0;var l=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var a={DetermineComponentFrameRoot:function(){try{if(t){var y=function(){throw Error()};if(Object.defineProperty(y.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(y,[])}catch(g){var m=g}Reflect.construct(e,[],y)}else{try{y.call()}catch(g){m=g}e.call(y.prototype)}}else{try{throw Error()}catch(g){m=g}(y=e())&&typeof y.catch=="function"&&y.catch(function(){})}}catch(g){if(g&&m&&typeof g.stack=="string")return[g.stack,m.stack]}return[null,null]}};a.DetermineComponentFrameRoot.displayName="DetermineComponentFrameRoot";var n=Object.getOwnPropertyDescriptor(a.DetermineComponentFrameRoot,"name");n&&n.configurable&&Object.defineProperty(a.DetermineComponentFrameRoot,"name",{value:"DetermineComponentFrameRoot"});var i=a.DetermineComponentFrameRoot(),u=i[0],c=i[1];if(u&&c){var s=u.split(`
`),r=c.split(`
`);for(n=a=0;a<s.length&&!s[a].includes("DetermineComponentFrameRoot");)a++;for(;n<r.length&&!r[n].includes("DetermineComponentFrameRoot");)n++;if(a===s.length||n===r.length)for(a=s.length-1,n=r.length-1;1<=a&&0<=n&&s[a]!==r[n];)n--;for(;1<=a&&0<=n;a--,n--)if(s[a]!==r[n]){if(a!==1||n!==1)do if(a--,n--,0>n||s[a]!==r[n]){var p=`
`+s[a].replace(" at new "," at ");return e.displayName&&p.includes("<anonymous>")&&(p=p.replace("<anonymous>",e.displayName)),p}while(1<=a&&0<=n);break}}}finally{vu=!1,Error.prepareStackTrace=l}return(l=e?e.displayName||e.name:"")?Sl(l):""}function Wh(e,t){switch(e.tag){case 26:case 27:case 5:return Sl(e.type);case 16:return Sl("Lazy");case 13:return e.child!==t&&t!==null?Sl("Suspense Fallback"):Sl("Suspense");case 19:return Sl("SuspenseList");case 0:case 15:return bu(e.type,!1);case 11:return bu(e.type.render,!1);case 1:return bu(e.type,!0);case 31:return Sl("Activity");default:return""}}function po(e){try{var t="",l=null;do t+=Wh(e,l),l=e,e=e.return;while(e);return t}catch(a){return`
Error generating stack: `+a.message+`
`+a.stack}}var mc=Object.prototype.hasOwnProperty,fs=Ee.unstable_scheduleCallback,Su=Ee.unstable_cancelCallback,Fh=Ee.unstable_shouldYield,Ih=Ee.unstable_requestPaint,We=Ee.unstable_now,Ph=Ee.unstable_getCurrentPriorityLevel,xf=Ee.unstable_ImmediatePriority,Ef=Ee.unstable_UserBlockingPriority,Ei=Ee.unstable_NormalPriority,ep=Ee.unstable_LowPriority,Tf=Ee.unstable_IdlePriority,tp=Ee.log,lp=Ee.unstable_setDisableYieldValue,wn=null,Fe=null;function Ft(e){if(typeof tp=="function"&&lp(e),Fe&&typeof Fe.setStrictMode=="function")try{Fe.setStrictMode(wn,e)}catch{}}var Ie=Math.clz32?Math.clz32:ip,ap=Math.log,np=Math.LN2;function ip(e){return e>>>=0,e===0?32:31-(ap(e)/np|0)|0}var qn=256,Bn=262144,Yn=4194304;function xl(e){var t=e&42;if(t!==0)return t;switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return e&261888;case 262144:case 524288:case 1048576:case 2097152:return e&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return e&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return e}}function Pi(e,t,l){var a=e.pendingLanes;if(a===0)return 0;var n=0,i=e.suspendedLanes,u=e.pingedLanes;e=e.warmLanes;var c=a&134217727;return c!==0?(a=c&~i,a!==0?n=xl(a):(u&=c,u!==0?n=xl(u):l||(l=c&~e,l!==0&&(n=xl(l))))):(c=a&~i,c!==0?n=xl(c):u!==0?n=xl(u):l||(l=a&~e,l!==0&&(n=xl(l)))),n===0?0:t!==0&&t!==n&&!(t&i)&&(i=n&-n,l=t&-t,i>=l||i===32&&(l&4194048)!==0)?t:n}function Mn(e,t){return(e.pendingLanes&~(e.suspendedLanes&~e.pingedLanes)&t)===0}function up(e,t){switch(e){case 1:case 2:case 4:case 8:case 64:return t+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function wf(){var e=Yn;return Yn<<=1,!(Yn&62914560)&&(Yn=4194304),e}function xu(e){for(var t=[],l=0;31>l;l++)t.push(e);return t}function _n(e,t){e.pendingLanes|=t,t!==268435456&&(e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0)}function cp(e,t,l,a,n,i){var u=e.pendingLanes;e.pendingLanes=l,e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0,e.expiredLanes&=l,e.entangledLanes&=l,e.errorRecoveryDisabledLanes&=l,e.shellSuspendCounter=0;var c=e.entanglements,s=e.expirationTimes,r=e.hiddenUpdates;for(l=u&~l;0<l;){var p=31-Ie(l),y=1<<p;c[p]=0,s[p]=-1;var m=r[p];if(m!==null)for(r[p]=null,p=0;p<m.length;p++){var g=m[p];g!==null&&(g.lane&=-536870913)}l&=~y}a!==0&&Mf(e,a,0),i!==0&&n===0&&e.tag!==0&&(e.suspendedLanes|=i&~(u&~t))}function Mf(e,t,l){e.pendingLanes|=t,e.suspendedLanes&=~t;var a=31-Ie(t);e.entangledLanes|=t,e.entanglements[a]=e.entanglements[a]|1073741824|l&261930}function _f(e,t){var l=e.entangledLanes|=t;for(e=e.entanglements;l;){var a=31-Ie(l),n=1<<a;n&t|e[a]&t&&(e[a]|=t),l&=~n}}function jf(e,t){var l=t&-t;return l=l&42?1:ds(l),l&(e.suspendedLanes|t)?0:l}function ds(e){switch(e){case 2:e=1;break;case 8:e=4;break;case 32:e=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:e=128;break;case 268435456:e=134217728;break;default:e=0}return e}function ms(e){return e&=-e,2<e?8<e?e&134217727?32:268435456:8:2}function Cf(){var e=J.p;return e!==0?e:(e=window.event,e===void 0?32:Fm(e.type))}function yo(e,t){var l=J.p;try{return J.p=e,t()}finally{J.p=l}}var gl=Math.random().toString(36).slice(2),je="__reactFiber$"+gl,Xe="__reactProps$"+gl,wa="__reactContainer$"+gl,hc="__reactEvents$"+gl,sp="__reactListeners$"+gl,op="__reactHandles$"+gl,go="__reactResources$"+gl,jn="__reactMarker$"+gl;function hs(e){delete e[je],delete e[Xe],delete e[hc],delete e[sp],delete e[op]}function Kl(e){var t=e[je];if(t)return t;for(var l=e.parentNode;l;){if(t=l[wa]||l[je]){if(l=t.alternate,t.child!==null||l!==null&&l.child!==null)for(e=wr(e);e!==null;){if(l=e[je])return l;e=wr(e)}return t}e=l,l=e.parentNode}return null}function Ma(e){if(e=e[je]||e[wa]){var t=e.tag;if(t===5||t===6||t===13||t===31||t===26||t===27||t===3)return e}return null}function Ba(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e.stateNode;throw Error(S(33))}function ia(e){var t=e[go];return t||(t=e[go]={hoistableStyles:new Map,hoistableScripts:new Map}),t}function we(e){e[jn]=!0}var Of=new Set,Rf={};function Hl(e,t){ma(e,t),ma(e+"Capture",t)}function ma(e,t){for(Rf[e]=t,e=0;e<t.length;e++)Of.add(t[e])}var rp=RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"),vo={},bo={};function fp(e){return mc.call(bo,e)?!0:mc.call(vo,e)?!1:rp.test(e)?bo[e]=!0:(vo[e]=!0,!1)}function ai(e,t,l){if(fp(t))if(l===null)e.removeAttribute(t);else{switch(typeof l){case"undefined":case"function":case"symbol":e.removeAttribute(t);return;case"boolean":var a=t.toLowerCase().slice(0,5);if(a!=="data-"&&a!=="aria-"){e.removeAttribute(t);return}}e.setAttribute(t,""+l)}}function Gn(e,t,l){if(l===null)e.removeAttribute(t);else{switch(typeof l){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(t);return}e.setAttribute(t,""+l)}}function Mt(e,t,l,a){if(a===null)e.removeAttribute(l);else{switch(typeof a){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(l);return}e.setAttributeNS(t,l,""+a)}}function at(e){switch(typeof e){case"bigint":case"boolean":case"number":case"string":case"undefined":return e;case"object":return e;default:return""}}function Af(e){var t=e.type;return(e=e.nodeName)&&e.toLowerCase()==="input"&&(t==="checkbox"||t==="radio")}function dp(e,t,l){var a=Object.getOwnPropertyDescriptor(e.constructor.prototype,t);if(!e.hasOwnProperty(t)&&typeof a<"u"&&typeof a.get=="function"&&typeof a.set=="function"){var n=a.get,i=a.set;return Object.defineProperty(e,t,{configurable:!0,get:function(){return n.call(this)},set:function(u){l=""+u,i.call(this,u)}}),Object.defineProperty(e,t,{enumerable:a.enumerable}),{getValue:function(){return l},setValue:function(u){l=""+u},stopTracking:function(){e._valueTracker=null,delete e[t]}}}}function pc(e){if(!e._valueTracker){var t=Af(e)?"checked":"value";e._valueTracker=dp(e,t,""+e[t])}}function Nf(e){if(!e)return!1;var t=e._valueTracker;if(!t)return!0;var l=t.getValue(),a="";return e&&(a=Af(e)?e.checked?"true":"false":e.value),e=a,e!==l?(t.setValue(e),!0):!1}function Ti(e){if(e=e||(typeof document<"u"?document:void 0),typeof e>"u")return null;try{return e.activeElement||e.body}catch{return e.body}}var mp=/[\n"\\]/g;function ct(e){return e.replace(mp,function(t){return"\\"+t.charCodeAt(0).toString(16)+" "})}function yc(e,t,l,a,n,i,u,c){e.name="",u!=null&&typeof u!="function"&&typeof u!="symbol"&&typeof u!="boolean"?e.type=u:e.removeAttribute("type"),t!=null?u==="number"?(t===0&&e.value===""||e.value!=t)&&(e.value=""+at(t)):e.value!==""+at(t)&&(e.value=""+at(t)):u!=="submit"&&u!=="reset"||e.removeAttribute("value"),t!=null?gc(e,u,at(t)):l!=null?gc(e,u,at(l)):a!=null&&e.removeAttribute("value"),n==null&&i!=null&&(e.defaultChecked=!!i),n!=null&&(e.checked=n&&typeof n!="function"&&typeof n!="symbol"),c!=null&&typeof c!="function"&&typeof c!="symbol"&&typeof c!="boolean"?e.name=""+at(c):e.removeAttribute("name")}function zf(e,t,l,a,n,i,u,c){if(i!=null&&typeof i!="function"&&typeof i!="symbol"&&typeof i!="boolean"&&(e.type=i),t!=null||l!=null){if(!(i!=="submit"&&i!=="reset"||t!=null)){pc(e);return}l=l!=null?""+at(l):"",t=t!=null?""+at(t):l,c||t===e.value||(e.value=t),e.defaultValue=t}a=a??n,a=typeof a!="function"&&typeof a!="symbol"&&!!a,e.checked=c?e.checked:!!a,e.defaultChecked=!!a,u!=null&&typeof u!="function"&&typeof u!="symbol"&&typeof u!="boolean"&&(e.name=u),pc(e)}function gc(e,t,l){t==="number"&&Ti(e.ownerDocument)===e||e.defaultValue===""+l||(e.defaultValue=""+l)}function ua(e,t,l,a){if(e=e.options,t){t={};for(var n=0;n<l.length;n++)t["$"+l[n]]=!0;for(l=0;l<e.length;l++)n=t.hasOwnProperty("$"+e[l].value),e[l].selected!==n&&(e[l].selected=n),n&&a&&(e[l].defaultSelected=!0)}else{for(l=""+at(l),t=null,n=0;n<e.length;n++){if(e[n].value===l){e[n].selected=!0,a&&(e[n].defaultSelected=!0);return}t!==null||e[n].disabled||(t=e[n])}t!==null&&(t.selected=!0)}}function Df(e,t,l){if(t!=null&&(t=""+at(t),t!==e.value&&(e.value=t),l==null)){e.defaultValue!==t&&(e.defaultValue=t);return}e.defaultValue=l!=null?""+at(l):""}function Hf(e,t,l,a){if(t==null){if(a!=null){if(l!=null)throw Error(S(92));if(qa(a)){if(1<a.length)throw Error(S(93));a=a[0]}l=a}l==null&&(l=""),t=l}l=at(t),e.defaultValue=l,a=e.textContent,a===l&&a!==""&&a!==null&&(e.value=a),pc(e)}function ha(e,t){if(t){var l=e.firstChild;if(l&&l===e.lastChild&&l.nodeType===3){l.nodeValue=t;return}}e.textContent=t}var hp=new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));function So(e,t,l){var a=t.indexOf("--")===0;l==null||typeof l=="boolean"||l===""?a?e.setProperty(t,""):t==="float"?e.cssFloat="":e[t]="":a?e.setProperty(t,l):typeof l!="number"||l===0||hp.has(t)?t==="float"?e.cssFloat=l:e[t]=(""+l).trim():e[t]=l+"px"}function Uf(e,t,l){if(t!=null&&typeof t!="object")throw Error(S(62));if(e=e.style,l!=null){for(var a in l)!l.hasOwnProperty(a)||t!=null&&t.hasOwnProperty(a)||(a.indexOf("--")===0?e.setProperty(a,""):a==="float"?e.cssFloat="":e[a]="");for(var n in t)a=t[n],t.hasOwnProperty(n)&&l[n]!==a&&So(e,n,a)}else for(var i in t)t.hasOwnProperty(i)&&So(e,i,t[i])}function ps(e){if(e.indexOf("-")===-1)return!1;switch(e){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var pp=new Map([["acceptCharset","accept-charset"],["htmlFor","for"],["httpEquiv","http-equiv"],["crossOrigin","crossorigin"],["accentHeight","accent-height"],["alignmentBaseline","alignment-baseline"],["arabicForm","arabic-form"],["baselineShift","baseline-shift"],["capHeight","cap-height"],["clipPath","clip-path"],["clipRule","clip-rule"],["colorInterpolation","color-interpolation"],["colorInterpolationFilters","color-interpolation-filters"],["colorProfile","color-profile"],["colorRendering","color-rendering"],["dominantBaseline","dominant-baseline"],["enableBackground","enable-background"],["fillOpacity","fill-opacity"],["fillRule","fill-rule"],["floodColor","flood-color"],["floodOpacity","flood-opacity"],["fontFamily","font-family"],["fontSize","font-size"],["fontSizeAdjust","font-size-adjust"],["fontStretch","font-stretch"],["fontStyle","font-style"],["fontVariant","font-variant"],["fontWeight","font-weight"],["glyphName","glyph-name"],["glyphOrientationHorizontal","glyph-orientation-horizontal"],["glyphOrientationVertical","glyph-orientation-vertical"],["horizAdvX","horiz-adv-x"],["horizOriginX","horiz-origin-x"],["imageRendering","image-rendering"],["letterSpacing","letter-spacing"],["lightingColor","lighting-color"],["markerEnd","marker-end"],["markerMid","marker-mid"],["markerStart","marker-start"],["overlinePosition","overline-position"],["overlineThickness","overline-thickness"],["paintOrder","paint-order"],["panose-1","panose-1"],["pointerEvents","pointer-events"],["renderingIntent","rendering-intent"],["shapeRendering","shape-rendering"],["stopColor","stop-color"],["stopOpacity","stop-opacity"],["strikethroughPosition","strikethrough-position"],["strikethroughThickness","strikethrough-thickness"],["strokeDasharray","stroke-dasharray"],["strokeDashoffset","stroke-dashoffset"],["strokeLinecap","stroke-linecap"],["strokeLinejoin","stroke-linejoin"],["strokeMiterlimit","stroke-miterlimit"],["strokeOpacity","stroke-opacity"],["strokeWidth","stroke-width"],["textAnchor","text-anchor"],["textDecoration","text-decoration"],["textRendering","text-rendering"],["transformOrigin","transform-origin"],["underlinePosition","underline-position"],["underlineThickness","underline-thickness"],["unicodeBidi","unicode-bidi"],["unicodeRange","unicode-range"],["unitsPerEm","units-per-em"],["vAlphabetic","v-alphabetic"],["vHanging","v-hanging"],["vIdeographic","v-ideographic"],["vMathematical","v-mathematical"],["vectorEffect","vector-effect"],["vertAdvY","vert-adv-y"],["vertOriginX","vert-origin-x"],["vertOriginY","vert-origin-y"],["wordSpacing","word-spacing"],["writingMode","writing-mode"],["xmlnsXlink","xmlns:xlink"],["xHeight","x-height"]]),yp=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function ni(e){return yp.test(""+e)?"javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')":e}function zt(){}var vc=null;function ys(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var $l=null,ca=null;function xo(e){var t=Ma(e);if(t&&(e=t.stateNode)){var l=e[Xe]||null;e:switch(e=t.stateNode,t.type){case"input":if(yc(e,l.value,l.defaultValue,l.defaultValue,l.checked,l.defaultChecked,l.type,l.name),t=l.name,l.type==="radio"&&t!=null){for(l=e;l.parentNode;)l=l.parentNode;for(l=l.querySelectorAll('input[name="'+ct(""+t)+'"][type="radio"]'),t=0;t<l.length;t++){var a=l[t];if(a!==e&&a.form===e.form){var n=a[Xe]||null;if(!n)throw Error(S(90));yc(a,n.value,n.defaultValue,n.defaultValue,n.checked,n.defaultChecked,n.type,n.name)}}for(t=0;t<l.length;t++)a=l[t],a.form===e.form&&Nf(a)}break e;case"textarea":Df(e,l.value,l.defaultValue);break e;case"select":t=l.value,t!=null&&ua(e,!!l.multiple,t,!1)}}}var Eu=!1;function Lf(e,t,l){if(Eu)return e(t,l);Eu=!0;try{var a=e(t);return a}finally{if(Eu=!1,($l!==null||ca!==null)&&(fu(),$l&&(t=$l,e=ca,ca=$l=null,xo(t),e)))for(t=0;t<e.length;t++)xo(e[t])}}function on(e,t){var l=e.stateNode;if(l===null)return null;var a=l[Xe]||null;if(a===null)return null;l=a[t];e:switch(t){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(a=!a.disabled)||(e=e.type,a=!(e==="button"||e==="input"||e==="select"||e==="textarea")),e=!a;break e;default:e=!1}if(e)return null;if(l&&typeof l!="function")throw Error(S(231,t,typeof l));return l}var kt=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),bc=!1;if(kt)try{var Na={};Object.defineProperty(Na,"passive",{get:function(){bc=!0}}),window.addEventListener("test",Na,Na),window.removeEventListener("test",Na,Na)}catch{bc=!1}var It=null,gs=null,ii=null;function kf(){if(ii)return ii;var e,t=gs,l=t.length,a,n="value"in It?It.value:It.textContent,i=n.length;for(e=0;e<l&&t[e]===n[e];e++);var u=l-e;for(a=1;a<=u&&t[l-a]===n[i-a];a++);return ii=n.slice(e,1<a?1-a:void 0)}function ui(e){var t=e.keyCode;return"charCode"in e?(e=e.charCode,e===0&&t===13&&(e=13)):e=t,e===10&&(e=13),32<=e||e===13?e:0}function Xn(){return!0}function Eo(){return!1}function Qe(e){function t(l,a,n,i,u){this._reactName=l,this._targetInst=n,this.type=a,this.nativeEvent=i,this.target=u,this.currentTarget=null;for(var c in e)e.hasOwnProperty(c)&&(l=e[c],this[c]=l?l(i):i[c]);return this.isDefaultPrevented=(i.defaultPrevented!=null?i.defaultPrevented:i.returnValue===!1)?Xn:Eo,this.isPropagationStopped=Eo,this}return ue(t.prototype,{preventDefault:function(){this.defaultPrevented=!0;var l=this.nativeEvent;l&&(l.preventDefault?l.preventDefault():typeof l.returnValue!="unknown"&&(l.returnValue=!1),this.isDefaultPrevented=Xn)},stopPropagation:function(){var l=this.nativeEvent;l&&(l.stopPropagation?l.stopPropagation():typeof l.cancelBubble!="unknown"&&(l.cancelBubble=!0),this.isPropagationStopped=Xn)},persist:function(){},isPersistent:Xn}),t}var Ul={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},eu=Qe(Ul),Cn=ue({},Ul,{view:0,detail:0}),gp=Qe(Cn),Tu,wu,za,tu=ue({},Cn,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:vs,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return"movementX"in e?e.movementX:(e!==za&&(za&&e.type==="mousemove"?(Tu=e.screenX-za.screenX,wu=e.screenY-za.screenY):wu=Tu=0,za=e),Tu)},movementY:function(e){return"movementY"in e?e.movementY:wu}}),To=Qe(tu),vp=ue({},tu,{dataTransfer:0}),bp=Qe(vp),Sp=ue({},Cn,{relatedTarget:0}),Mu=Qe(Sp),xp=ue({},Ul,{animationName:0,elapsedTime:0,pseudoElement:0}),Ep=Qe(xp),Tp=ue({},Ul,{clipboardData:function(e){return"clipboardData"in e?e.clipboardData:window.clipboardData}}),wp=Qe(Tp),Mp=ue({},Ul,{data:0}),wo=Qe(Mp),_p={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},jp={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},Cp={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function Op(e){var t=this.nativeEvent;return t.getModifierState?t.getModifierState(e):(e=Cp[e])?!!t[e]:!1}function vs(){return Op}var Rp=ue({},Cn,{key:function(e){if(e.key){var t=_p[e.key]||e.key;if(t!=="Unidentified")return t}return e.type==="keypress"?(e=ui(e),e===13?"Enter":String.fromCharCode(e)):e.type==="keydown"||e.type==="keyup"?jp[e.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:vs,charCode:function(e){return e.type==="keypress"?ui(e):0},keyCode:function(e){return e.type==="keydown"||e.type==="keyup"?e.keyCode:0},which:function(e){return e.type==="keypress"?ui(e):e.type==="keydown"||e.type==="keyup"?e.keyCode:0}}),Ap=Qe(Rp),Np=ue({},tu,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),Mo=Qe(Np),zp=ue({},Cn,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:vs}),Dp=Qe(zp),Hp=ue({},Ul,{propertyName:0,elapsedTime:0,pseudoElement:0}),Up=Qe(Hp),Lp=ue({},tu,{deltaX:function(e){return"deltaX"in e?e.deltaX:"wheelDeltaX"in e?-e.wheelDeltaX:0},deltaY:function(e){return"deltaY"in e?e.deltaY:"wheelDeltaY"in e?-e.wheelDeltaY:"wheelDelta"in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0}),kp=Qe(Lp),qp=ue({},Ul,{newState:0,oldState:0}),Bp=Qe(qp),Yp=[9,13,27,32],bs=kt&&"CompositionEvent"in window,Ja=null;kt&&"documentMode"in document&&(Ja=document.documentMode);var Gp=kt&&"TextEvent"in window&&!Ja,qf=kt&&(!bs||Ja&&8<Ja&&11>=Ja),_o=" ",jo=!1;function Bf(e,t){switch(e){case"keyup":return Yp.indexOf(t.keyCode)!==-1;case"keydown":return t.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function Yf(e){return e=e.detail,typeof e=="object"&&"data"in e?e.data:null}var Wl=!1;function Xp(e,t){switch(e){case"compositionend":return Yf(t);case"keypress":return t.which!==32?null:(jo=!0,_o);case"textInput":return e=t.data,e===_o&&jo?null:e;default:return null}}function Qp(e,t){if(Wl)return e==="compositionend"||!bs&&Bf(e,t)?(e=kf(),ii=gs=It=null,Wl=!1,e):null;switch(e){case"paste":return null;case"keypress":if(!(t.ctrlKey||t.altKey||t.metaKey)||t.ctrlKey&&t.altKey){if(t.char&&1<t.char.length)return t.char;if(t.which)return String.fromCharCode(t.which)}return null;case"compositionend":return qf&&t.locale!=="ko"?null:t.data;default:return null}}var Vp={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function Co(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t==="input"?!!Vp[e.type]:t==="textarea"}function Gf(e,t,l,a){$l?ca?ca.push(a):ca=[a]:$l=a,t=Yi(t,"onChange"),0<t.length&&(l=new eu("onChange","change",null,l,a),e.push({event:l,listeners:t}))}var Ka=null,rn=null;function Zp(e){Lm(e,0)}function lu(e){var t=Ba(e);if(Nf(t))return e}function Oo(e,t){if(e==="change")return t}var Xf=!1;if(kt){var _u;if(kt){var ju="oninput"in document;if(!ju){var Ro=document.createElement("div");Ro.setAttribute("oninput","return;"),ju=typeof Ro.oninput=="function"}_u=ju}else _u=!1;Xf=_u&&(!document.documentMode||9<document.documentMode)}function Ao(){Ka&&(Ka.detachEvent("onpropertychange",Qf),rn=Ka=null)}function Qf(e){if(e.propertyName==="value"&&lu(rn)){var t=[];Gf(t,rn,e,ys(e)),Lf(Zp,t)}}function Jp(e,t,l){e==="focusin"?(Ao(),Ka=t,rn=l,Ka.attachEvent("onpropertychange",Qf)):e==="focusout"&&Ao()}function Kp(e){if(e==="selectionchange"||e==="keyup"||e==="keydown")return lu(rn)}function $p(e,t){if(e==="click")return lu(t)}function Wp(e,t){if(e==="input"||e==="change")return lu(t)}function Fp(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}var et=typeof Object.is=="function"?Object.is:Fp;function fn(e,t){if(et(e,t))return!0;if(typeof e!="object"||e===null||typeof t!="object"||t===null)return!1;var l=Object.keys(e),a=Object.keys(t);if(l.length!==a.length)return!1;for(a=0;a<l.length;a++){var n=l[a];if(!mc.call(t,n)||!et(e[n],t[n]))return!1}return!0}function No(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function zo(e,t){var l=No(e);e=0;for(var a;l;){if(l.nodeType===3){if(a=e+l.textContent.length,e<=t&&a>=t)return{node:l,offset:t-e};e=a}e:{for(;l;){if(l.nextSibling){l=l.nextSibling;break e}l=l.parentNode}l=void 0}l=No(l)}}function Vf(e,t){return e&&t?e===t?!0:e&&e.nodeType===3?!1:t&&t.nodeType===3?Vf(e,t.parentNode):"contains"in e?e.contains(t):e.compareDocumentPosition?!!(e.compareDocumentPosition(t)&16):!1:!1}function Zf(e){e=e!=null&&e.ownerDocument!=null&&e.ownerDocument.defaultView!=null?e.ownerDocument.defaultView:window;for(var t=Ti(e.document);t instanceof e.HTMLIFrameElement;){try{var l=typeof t.contentWindow.location.href=="string"}catch{l=!1}if(l)e=t.contentWindow;else break;t=Ti(e.document)}return t}function Ss(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t&&(t==="input"&&(e.type==="text"||e.type==="search"||e.type==="tel"||e.type==="url"||e.type==="password")||t==="textarea"||e.contentEditable==="true")}var Ip=kt&&"documentMode"in document&&11>=document.documentMode,Fl=null,Sc=null,$a=null,xc=!1;function Do(e,t,l){var a=l.window===l?l.document:l.nodeType===9?l:l.ownerDocument;xc||Fl==null||Fl!==Ti(a)||(a=Fl,"selectionStart"in a&&Ss(a)?a={start:a.selectionStart,end:a.selectionEnd}:(a=(a.ownerDocument&&a.ownerDocument.defaultView||window).getSelection(),a={anchorNode:a.anchorNode,anchorOffset:a.anchorOffset,focusNode:a.focusNode,focusOffset:a.focusOffset}),$a&&fn($a,a)||($a=a,a=Yi(Sc,"onSelect"),0<a.length&&(t=new eu("onSelect","select",null,t,l),e.push({event:t,listeners:a}),t.target=Fl)))}function bl(e,t){var l={};return l[e.toLowerCase()]=t.toLowerCase(),l["Webkit"+e]="webkit"+t,l["Moz"+e]="moz"+t,l}var Il={animationend:bl("Animation","AnimationEnd"),animationiteration:bl("Animation","AnimationIteration"),animationstart:bl("Animation","AnimationStart"),transitionrun:bl("Transition","TransitionRun"),transitionstart:bl("Transition","TransitionStart"),transitioncancel:bl("Transition","TransitionCancel"),transitionend:bl("Transition","TransitionEnd")},Cu={},Jf={};kt&&(Jf=document.createElement("div").style,"AnimationEvent"in window||(delete Il.animationend.animation,delete Il.animationiteration.animation,delete Il.animationstart.animation),"TransitionEvent"in window||delete Il.transitionend.transition);function Ll(e){if(Cu[e])return Cu[e];if(!Il[e])return e;var t=Il[e],l;for(l in t)if(t.hasOwnProperty(l)&&l in Jf)return Cu[e]=t[l];return e}var Kf=Ll("animationend"),$f=Ll("animationiteration"),Wf=Ll("animationstart"),Pp=Ll("transitionrun"),e0=Ll("transitionstart"),t0=Ll("transitioncancel"),Ff=Ll("transitionend"),If=new Map,Ec="abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");Ec.push("scrollEnd");function vt(e,t){If.set(e,t),Hl(t,[e])}var wi=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)},lt=[],Pl=0,xs=0;function au(){for(var e=Pl,t=xs=Pl=0;t<e;){var l=lt[t];lt[t++]=null;var a=lt[t];lt[t++]=null;var n=lt[t];lt[t++]=null;var i=lt[t];if(lt[t++]=null,a!==null&&n!==null){var u=a.pending;u===null?n.next=n:(n.next=u.next,u.next=n),a.pending=n}i!==0&&Pf(l,n,i)}}function nu(e,t,l,a){lt[Pl++]=e,lt[Pl++]=t,lt[Pl++]=l,lt[Pl++]=a,xs|=a,e.lanes|=a,e=e.alternate,e!==null&&(e.lanes|=a)}function Es(e,t,l,a){return nu(e,t,l,a),Mi(e)}function kl(e,t){return nu(e,null,null,t),Mi(e)}function Pf(e,t,l){e.lanes|=l;var a=e.alternate;a!==null&&(a.lanes|=l);for(var n=!1,i=e.return;i!==null;)i.childLanes|=l,a=i.alternate,a!==null&&(a.childLanes|=l),i.tag===22&&(e=i.stateNode,e===null||e._visibility&1||(n=!0)),e=i,i=i.return;return e.tag===3?(i=e.stateNode,n&&t!==null&&(n=31-Ie(l),e=i.hiddenUpdates,a=e[n],a===null?e[n]=[t]:a.push(t),t.lane=l|536870912),i):null}function Mi(e){if(50<nn)throw nn=0,Xc=null,Error(S(185));for(var t=e.return;t!==null;)e=t,t=e.return;return e.tag===3?e.stateNode:null}var ea={};function l0(e,t,l,a){this.tag=e,this.key=l,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=t,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=a,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function Ke(e,t,l,a){return new l0(e,t,l,a)}function Ts(e){return e=e.prototype,!(!e||!e.isReactComponent)}function Ht(e,t){var l=e.alternate;return l===null?(l=Ke(e.tag,t,e.key,e.mode),l.elementType=e.elementType,l.type=e.type,l.stateNode=e.stateNode,l.alternate=e,e.alternate=l):(l.pendingProps=t,l.type=e.type,l.flags=0,l.subtreeFlags=0,l.deletions=null),l.flags=e.flags&65011712,l.childLanes=e.childLanes,l.lanes=e.lanes,l.child=e.child,l.memoizedProps=e.memoizedProps,l.memoizedState=e.memoizedState,l.updateQueue=e.updateQueue,t=e.dependencies,l.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext},l.sibling=e.sibling,l.index=e.index,l.ref=e.ref,l.refCleanup=e.refCleanup,l}function ed(e,t){e.flags&=65011714;var l=e.alternate;return l===null?(e.childLanes=0,e.lanes=t,e.child=null,e.subtreeFlags=0,e.memoizedProps=null,e.memoizedState=null,e.updateQueue=null,e.dependencies=null,e.stateNode=null):(e.childLanes=l.childLanes,e.lanes=l.lanes,e.child=l.child,e.subtreeFlags=0,e.deletions=null,e.memoizedProps=l.memoizedProps,e.memoizedState=l.memoizedState,e.updateQueue=l.updateQueue,e.type=l.type,t=l.dependencies,e.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext}),e}function ci(e,t,l,a,n,i){var u=0;if(a=e,typeof e=="function")Ts(e)&&(u=1);else if(typeof e=="string")u=cy(e,l,Et.current)?26:e==="html"||e==="head"||e==="body"?27:5;else e:switch(e){case oc:return e=Ke(31,l,t,n),e.elementType=oc,e.lanes=i,e;case Zl:return _l(l.children,n,i,t);case bf:u=8,n|=24;break;case uc:return e=Ke(12,l,t,n|2),e.elementType=uc,e.lanes=i,e;case cc:return e=Ke(13,l,t,n),e.elementType=cc,e.lanes=i,e;case sc:return e=Ke(19,l,t,n),e.elementType=sc,e.lanes=i,e;default:if(typeof e=="object"&&e!==null)switch(e.$$typeof){case Nt:u=10;break e;case Sf:u=9;break e;case os:u=11;break e;case rs:u=14;break e;case Vt:u=16,a=null;break e}u=29,l=Error(S(130,e===null?"null":typeof e,"")),a=null}return t=Ke(u,l,t,n),t.elementType=e,t.type=a,t.lanes=i,t}function _l(e,t,l,a){return e=Ke(7,e,a,t),e.lanes=l,e}function Ou(e,t,l){return e=Ke(6,e,null,t),e.lanes=l,e}function td(e){var t=Ke(18,null,null,0);return t.stateNode=e,t}function Ru(e,t,l){return t=Ke(4,e.children!==null?e.children:[],e.key,t),t.lanes=l,t.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},t}var Ho=new WeakMap;function st(e,t){if(typeof e=="object"&&e!==null){var l=Ho.get(e);return l!==void 0?l:(t={value:e,source:t,stack:po(t)},Ho.set(e,t),t)}return{value:e,source:t,stack:po(t)}}var ta=[],la=0,_i=null,dn=0,nt=[],it=0,ml=null,bt=1,St="";function Rt(e,t){ta[la++]=dn,ta[la++]=_i,_i=e,dn=t}function ld(e,t,l){nt[it++]=bt,nt[it++]=St,nt[it++]=ml,ml=e;var a=bt;e=St;var n=32-Ie(a)-1;a&=~(1<<n),l+=1;var i=32-Ie(t)+n;if(30<i){var u=n-n%5;i=(a&(1<<u)-1).toString(32),a>>=u,n-=u,bt=1<<32-Ie(t)+n|l<<n|a,St=i+e}else bt=1<<i|l<<n|a,St=e}function ws(e){e.return!==null&&(Rt(e,1),ld(e,1,0))}function Ms(e){for(;e===_i;)_i=ta[--la],ta[la]=null,dn=ta[--la],ta[la]=null;for(;e===ml;)ml=nt[--it],nt[it]=null,St=nt[--it],nt[it]=null,bt=nt[--it],nt[it]=null}function ad(e,t){nt[it++]=bt,nt[it++]=St,nt[it++]=ml,bt=t.id,St=t.overflow,ml=e}var Ce=null,ne=null,G=!1,nl=null,ot=!1,Tc=Error(S(519));function hl(e){var t=Error(S(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?"text":"HTML",""));throw mn(st(t,e)),Tc}function Uo(e){var t=e.stateNode,l=e.type,a=e.memoizedProps;switch(t[je]=e,t[Xe]=a,l){case"dialog":q("cancel",t),q("close",t);break;case"iframe":case"object":case"embed":q("load",t);break;case"video":case"audio":for(l=0;l<gn.length;l++)q(gn[l],t);break;case"source":q("error",t);break;case"img":case"image":case"link":q("error",t),q("load",t);break;case"details":q("toggle",t);break;case"input":q("invalid",t),zf(t,a.value,a.defaultValue,a.checked,a.defaultChecked,a.type,a.name,!0);break;case"select":q("invalid",t);break;case"textarea":q("invalid",t),Hf(t,a.value,a.defaultValue,a.children)}l=a.children,typeof l!="string"&&typeof l!="number"&&typeof l!="bigint"||t.textContent===""+l||a.suppressHydrationWarning===!0||qm(t.textContent,l)?(a.popover!=null&&(q("beforetoggle",t),q("toggle",t)),a.onScroll!=null&&q("scroll",t),a.onScrollEnd!=null&&q("scrollend",t),a.onClick!=null&&(t.onclick=zt),t=!0):t=!1,t||hl(e,!0)}function Lo(e){for(Ce=e.return;Ce;)switch(Ce.tag){case 5:case 31:case 13:ot=!1;return;case 27:case 3:ot=!0;return;default:Ce=Ce.return}}function Bl(e){if(e!==Ce)return!1;if(!G)return Lo(e),G=!0,!1;var t=e.tag,l;if((l=t!==3&&t!==27)&&((l=t===5)&&(l=e.type,l=!(l!=="form"&&l!=="button")||Kc(e.type,e.memoizedProps)),l=!l),l&&ne&&hl(e),Lo(e),t===13){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(S(317));ne=Tr(e)}else if(t===31){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(S(317));ne=Tr(e)}else t===27?(t=ne,vl(e.type)?(e=Ic,Ic=null,ne=e):ne=t):ne=Ce?dt(e.stateNode.nextSibling):null;return!0}function Rl(){ne=Ce=null,G=!1}function Au(){var e=nl;return e!==null&&(Ye===null?Ye=e:Ye.push.apply(Ye,e),nl=null),e}function mn(e){nl===null?nl=[e]:nl.push(e)}var wc=Tt(null),ql=null,Dt=null;function Jt(e,t,l){te(wc,t._currentValue),t._currentValue=l}function Ut(e){e._currentValue=wc.current,Me(wc)}function Mc(e,t,l){for(;e!==null;){var a=e.alternate;if((e.childLanes&t)!==t?(e.childLanes|=t,a!==null&&(a.childLanes|=t)):a!==null&&(a.childLanes&t)!==t&&(a.childLanes|=t),e===l)break;e=e.return}}function _c(e,t,l,a){var n=e.child;for(n!==null&&(n.return=e);n!==null;){var i=n.dependencies;if(i!==null){var u=n.child;i=i.firstContext;e:for(;i!==null;){var c=i;i=n;for(var s=0;s<t.length;s++)if(c.context===t[s]){i.lanes|=l,c=i.alternate,c!==null&&(c.lanes|=l),Mc(i.return,l,e),a||(u=null);break e}i=c.next}}else if(n.tag===18){if(u=n.return,u===null)throw Error(S(341));u.lanes|=l,i=u.alternate,i!==null&&(i.lanes|=l),Mc(u,l,e),u=null}else u=n.child;if(u!==null)u.return=n;else for(u=n;u!==null;){if(u===e){u=null;break}if(n=u.sibling,n!==null){n.return=u.return,u=n;break}u=u.return}n=u}}function _a(e,t,l,a){e=null;for(var n=t,i=!1;n!==null;){if(!i){if(n.flags&524288)i=!0;else if(n.flags&262144)break}if(n.tag===10){var u=n.alternate;if(u===null)throw Error(S(387));if(u=u.memoizedProps,u!==null){var c=n.type;et(n.pendingProps.value,u.value)||(e!==null?e.push(c):e=[c])}}else if(n===bi.current){if(u=n.alternate,u===null)throw Error(S(387));u.memoizedState.memoizedState!==n.memoizedState.memoizedState&&(e!==null?e.push(bn):e=[bn])}n=n.return}e!==null&&_c(t,e,l,a),t.flags|=262144}function ji(e){for(e=e.firstContext;e!==null;){if(!et(e.context._currentValue,e.memoizedValue))return!0;e=e.next}return!1}function Al(e){ql=e,Dt=null,e=e.dependencies,e!==null&&(e.firstContext=null)}function Oe(e){return nd(ql,e)}function Qn(e,t){return ql===null&&Al(e),nd(e,t)}function nd(e,t){var l=t._currentValue;if(t={context:t,memoizedValue:l,next:null},Dt===null){if(e===null)throw Error(S(308));Dt=t,e.dependencies={lanes:0,firstContext:t},e.flags|=524288}else Dt=Dt.next=t;return l}var a0=typeof AbortController<"u"?AbortController:function(){var e=[],t=this.signal={aborted:!1,addEventListener:function(l,a){e.push(a)}};this.abort=function(){t.aborted=!0,e.forEach(function(l){return l()})}},n0=Ee.unstable_scheduleCallback,i0=Ee.unstable_NormalPriority,ge={$$typeof:Nt,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function _s(){return{controller:new a0,data:new Map,refCount:0}}function On(e){e.refCount--,e.refCount===0&&n0(i0,function(){e.controller.abort()})}var Wa=null,jc=0,pa=0,sa=null;function u0(e,t){if(Wa===null){var l=Wa=[];jc=0,pa=Fs(),sa={status:"pending",value:void 0,then:function(a){l.push(a)}}}return jc++,t.then(ko,ko),t}function ko(){if(--jc===0&&Wa!==null){sa!==null&&(sa.status="fulfilled");var e=Wa;Wa=null,pa=0,sa=null;for(var t=0;t<e.length;t++)(0,e[t])()}}function c0(e,t){var l=[],a={status:"pending",value:null,reason:null,then:function(n){l.push(n)}};return e.then(function(){a.status="fulfilled",a.value=t;for(var n=0;n<l.length;n++)(0,l[n])(t)},function(n){for(a.status="rejected",a.reason=n,n=0;n<l.length;n++)(0,l[n])(void 0)}),a}var qo=D.S;D.S=function(e,t){vm=We(),typeof t=="object"&&t!==null&&typeof t.then=="function"&&u0(e,t),qo!==null&&qo(e,t)};var jl=Tt(null);function js(){var e=jl.current;return e!==null?e:ee.pooledCache}function si(e,t){t===null?te(jl,jl.current):te(jl,t.pool)}function id(){var e=js();return e===null?null:{parent:ge._currentValue,pool:e}}var ja=Error(S(460)),Cs=Error(S(474)),iu=Error(S(542)),Ci={then:function(){}};function Bo(e){return e=e.status,e==="fulfilled"||e==="rejected"}function ud(e,t,l){switch(l=e[l],l===void 0?e.push(t):l!==t&&(t.then(zt,zt),t=l),t.status){case"fulfilled":return t.value;case"rejected":throw e=t.reason,Go(e),e;default:if(typeof t.status=="string")t.then(zt,zt);else{if(e=ee,e!==null&&100<e.shellSuspendCounter)throw Error(S(482));e=t,e.status="pending",e.then(function(a){if(t.status==="pending"){var n=t;n.status="fulfilled",n.value=a}},function(a){if(t.status==="pending"){var n=t;n.status="rejected",n.reason=a}})}switch(t.status){case"fulfilled":return t.value;case"rejected":throw e=t.reason,Go(e),e}throw Cl=t,ja}}function El(e){try{var t=e._init;return t(e._payload)}catch(l){throw l!==null&&typeof l=="object"&&typeof l.then=="function"?(Cl=l,ja):l}}var Cl=null;function Yo(){if(Cl===null)throw Error(S(459));var e=Cl;return Cl=null,e}function Go(e){if(e===ja||e===iu)throw Error(S(483))}var oa=null,hn=0;function Vn(e){var t=hn;return hn+=1,oa===null&&(oa=[]),ud(oa,e,t)}function Da(e,t){t=t.props.ref,e.ref=t!==void 0?t:null}function Zn(e,t){throw t.$$typeof===Jh?Error(S(525)):(e=Object.prototype.toString.call(t),Error(S(31,e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)))}function cd(e){function t(d,f){if(e){var h=d.deletions;h===null?(d.deletions=[f],d.flags|=16):h.push(f)}}function l(d,f){if(!e)return null;for(;f!==null;)t(d,f),f=f.sibling;return null}function a(d){for(var f=new Map;d!==null;)d.key!==null?f.set(d.key,d):f.set(d.index,d),d=d.sibling;return f}function n(d,f){return d=Ht(d,f),d.index=0,d.sibling=null,d}function i(d,f,h){return d.index=h,e?(h=d.alternate,h!==null?(h=h.index,h<f?(d.flags|=67108866,f):h):(d.flags|=67108866,f)):(d.flags|=1048576,f)}function u(d){return e&&d.alternate===null&&(d.flags|=67108866),d}function c(d,f,h,v){return f===null||f.tag!==6?(f=Ou(h,d.mode,v),f.return=d,f):(f=n(f,h),f.return=d,f)}function s(d,f,h,v){var T=h.type;return T===Zl?p(d,f,h.props.children,v,h.key):f!==null&&(f.elementType===T||typeof T=="object"&&T!==null&&T.$$typeof===Vt&&El(T)===f.type)?(f=n(f,h.props),Da(f,h),f.return=d,f):(f=ci(h.type,h.key,h.props,null,d.mode,v),Da(f,h),f.return=d,f)}function r(d,f,h,v){return f===null||f.tag!==4||f.stateNode.containerInfo!==h.containerInfo||f.stateNode.implementation!==h.implementation?(f=Ru(h,d.mode,v),f.return=d,f):(f=n(f,h.children||[]),f.return=d,f)}function p(d,f,h,v,T){return f===null||f.tag!==7?(f=_l(h,d.mode,v,T),f.return=d,f):(f=n(f,h),f.return=d,f)}function y(d,f,h){if(typeof f=="string"&&f!==""||typeof f=="number"||typeof f=="bigint")return f=Ou(""+f,d.mode,h),f.return=d,f;if(typeof f=="object"&&f!==null){switch(f.$$typeof){case kn:return h=ci(f.type,f.key,f.props,null,d.mode,h),Da(h,f),h.return=d,h;case ka:return f=Ru(f,d.mode,h),f.return=d,f;case Vt:return f=El(f),y(d,f,h)}if(qa(f)||Aa(f))return f=_l(f,d.mode,h,null),f.return=d,f;if(typeof f.then=="function")return y(d,Vn(f),h);if(f.$$typeof===Nt)return y(d,Qn(d,f),h);Zn(d,f)}return null}function m(d,f,h,v){var T=f!==null?f.key:null;if(typeof h=="string"&&h!==""||typeof h=="number"||typeof h=="bigint")return T!==null?null:c(d,f,""+h,v);if(typeof h=="object"&&h!==null){switch(h.$$typeof){case kn:return h.key===T?s(d,f,h,v):null;case ka:return h.key===T?r(d,f,h,v):null;case Vt:return h=El(h),m(d,f,h,v)}if(qa(h)||Aa(h))return T!==null?null:p(d,f,h,v,null);if(typeof h.then=="function")return m(d,f,Vn(h),v);if(h.$$typeof===Nt)return m(d,f,Qn(d,h),v);Zn(d,h)}return null}function g(d,f,h,v,T){if(typeof v=="string"&&v!==""||typeof v=="number"||typeof v=="bigint")return d=d.get(h)||null,c(f,d,""+v,T);if(typeof v=="object"&&v!==null){switch(v.$$typeof){case kn:return d=d.get(v.key===null?h:v.key)||null,s(f,d,v,T);case ka:return d=d.get(v.key===null?h:v.key)||null,r(f,d,v,T);case Vt:return v=El(v),g(d,f,h,v,T)}if(qa(v)||Aa(v))return d=d.get(h)||null,p(f,d,v,T,null);if(typeof v.then=="function")return g(d,f,h,Vn(v),T);if(v.$$typeof===Nt)return g(d,f,h,Qn(f,v),T);Zn(f,v)}return null}function x(d,f,h,v){for(var T=null,j=null,E=f,O=f=0,C=null;E!==null&&O<h.length;O++){E.index>O?(C=E,E=null):C=E.sibling;var w=m(d,E,h[O],v);if(w===null){E===null&&(E=C);break}e&&E&&w.alternate===null&&t(d,E),f=i(w,f,O),j===null?T=w:j.sibling=w,j=w,E=C}if(O===h.length)return l(d,E),G&&Rt(d,O),T;if(E===null){for(;O<h.length;O++)E=y(d,h[O],v),E!==null&&(f=i(E,f,O),j===null?T=E:j.sibling=E,j=E);return G&&Rt(d,O),T}for(E=a(E);O<h.length;O++)C=g(E,d,O,h[O],v),C!==null&&(e&&C.alternate!==null&&E.delete(C.key===null?O:C.key),f=i(C,f,O),j===null?T=C:j.sibling=C,j=C);return e&&E.forEach(function(X){return t(d,X)}),G&&Rt(d,O),T}function _(d,f,h,v){if(h==null)throw Error(S(151));for(var T=null,j=null,E=f,O=f=0,C=null,w=h.next();E!==null&&!w.done;O++,w=h.next()){E.index>O?(C=E,E=null):C=E.sibling;var X=m(d,E,w.value,v);if(X===null){E===null&&(E=C);break}e&&E&&X.alternate===null&&t(d,E),f=i(X,f,O),j===null?T=X:j.sibling=X,j=X,E=C}if(w.done)return l(d,E),G&&Rt(d,O),T;if(E===null){for(;!w.done;O++,w=h.next())w=y(d,w.value,v),w!==null&&(f=i(w,f,O),j===null?T=w:j.sibling=w,j=w);return G&&Rt(d,O),T}for(E=a(E);!w.done;O++,w=h.next())w=g(E,d,O,w.value,v),w!==null&&(e&&w.alternate!==null&&E.delete(w.key===null?O:w.key),f=i(w,f,O),j===null?T=w:j.sibling=w,j=w);return e&&E.forEach(function(F){return t(d,F)}),G&&Rt(d,O),T}function A(d,f,h,v){if(typeof h=="object"&&h!==null&&h.type===Zl&&h.key===null&&(h=h.props.children),typeof h=="object"&&h!==null){switch(h.$$typeof){case kn:e:{for(var T=h.key;f!==null;){if(f.key===T){if(T=h.type,T===Zl){if(f.tag===7){l(d,f.sibling),v=n(f,h.props.children),v.return=d,d=v;break e}}else if(f.elementType===T||typeof T=="object"&&T!==null&&T.$$typeof===Vt&&El(T)===f.type){l(d,f.sibling),v=n(f,h.props),Da(v,h),v.return=d,d=v;break e}l(d,f);break}else t(d,f);f=f.sibling}h.type===Zl?(v=_l(h.props.children,d.mode,v,h.key),v.return=d,d=v):(v=ci(h.type,h.key,h.props,null,d.mode,v),Da(v,h),v.return=d,d=v)}return u(d);case ka:e:{for(T=h.key;f!==null;){if(f.key===T)if(f.tag===4&&f.stateNode.containerInfo===h.containerInfo&&f.stateNode.implementation===h.implementation){l(d,f.sibling),v=n(f,h.children||[]),v.return=d,d=v;break e}else{l(d,f);break}else t(d,f);f=f.sibling}v=Ru(h,d.mode,v),v.return=d,d=v}return u(d);case Vt:return h=El(h),A(d,f,h,v)}if(qa(h))return x(d,f,h,v);if(Aa(h)){if(T=Aa(h),typeof T!="function")throw Error(S(150));return h=T.call(h),_(d,f,h,v)}if(typeof h.then=="function")return A(d,f,Vn(h),v);if(h.$$typeof===Nt)return A(d,f,Qn(d,h),v);Zn(d,h)}return typeof h=="string"&&h!==""||typeof h=="number"||typeof h=="bigint"?(h=""+h,f!==null&&f.tag===6?(l(d,f.sibling),v=n(f,h),v.return=d,d=v):(l(d,f),v=Ou(h,d.mode,v),v.return=d,d=v),u(d)):l(d,f)}return function(d,f,h,v){try{hn=0;var T=A(d,f,h,v);return oa=null,T}catch(E){if(E===ja||E===iu)throw E;var j=Ke(29,E,null,d.mode);return j.lanes=v,j.return=d,j}finally{}}}var Nl=cd(!0),sd=cd(!1),Zt=!1;function Os(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function Cc(e,t){e=e.updateQueue,t.updateQueue===e&&(t.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,callbacks:null})}function il(e){return{lane:e,tag:0,payload:null,callback:null,next:null}}function ul(e,t,l){var a=e.updateQueue;if(a===null)return null;if(a=a.shared,Z&2){var n=a.pending;return n===null?t.next=t:(t.next=n.next,n.next=t),a.pending=t,t=Mi(e),Pf(e,null,l),t}return nu(e,a,t,l),Mi(e)}function Fa(e,t,l){if(t=t.updateQueue,t!==null&&(t=t.shared,(l&4194048)!==0)){var a=t.lanes;a&=e.pendingLanes,l|=a,t.lanes=l,_f(e,l)}}function Nu(e,t){var l=e.updateQueue,a=e.alternate;if(a!==null&&(a=a.updateQueue,l===a)){var n=null,i=null;if(l=l.firstBaseUpdate,l!==null){do{var u={lane:l.lane,tag:l.tag,payload:l.payload,callback:null,next:null};i===null?n=i=u:i=i.next=u,l=l.next}while(l!==null);i===null?n=i=t:i=i.next=t}else n=i=t;l={baseState:a.baseState,firstBaseUpdate:n,lastBaseUpdate:i,shared:a.shared,callbacks:a.callbacks},e.updateQueue=l;return}e=l.lastBaseUpdate,e===null?l.firstBaseUpdate=t:e.next=t,l.lastBaseUpdate=t}var Oc=!1;function Ia(){if(Oc){var e=sa;if(e!==null)throw e}}function Pa(e,t,l,a){Oc=!1;var n=e.updateQueue;Zt=!1;var i=n.firstBaseUpdate,u=n.lastBaseUpdate,c=n.shared.pending;if(c!==null){n.shared.pending=null;var s=c,r=s.next;s.next=null,u===null?i=r:u.next=r,u=s;var p=e.alternate;p!==null&&(p=p.updateQueue,c=p.lastBaseUpdate,c!==u&&(c===null?p.firstBaseUpdate=r:c.next=r,p.lastBaseUpdate=s))}if(i!==null){var y=n.baseState;u=0,p=r=s=null,c=i;do{var m=c.lane&-536870913,g=m!==c.lane;if(g?(Y&m)===m:(a&m)===m){m!==0&&m===pa&&(Oc=!0),p!==null&&(p=p.next={lane:0,tag:c.tag,payload:c.payload,callback:null,next:null});e:{var x=e,_=c;m=t;var A=l;switch(_.tag){case 1:if(x=_.payload,typeof x=="function"){y=x.call(A,y,m);break e}y=x;break e;case 3:x.flags=x.flags&-65537|128;case 0:if(x=_.payload,m=typeof x=="function"?x.call(A,y,m):x,m==null)break e;y=ue({},y,m);break e;case 2:Zt=!0}}m=c.callback,m!==null&&(e.flags|=64,g&&(e.flags|=8192),g=n.callbacks,g===null?n.callbacks=[m]:g.push(m))}else g={lane:m,tag:c.tag,payload:c.payload,callback:c.callback,next:null},p===null?(r=p=g,s=y):p=p.next=g,u|=m;if(c=c.next,c===null){if(c=n.shared.pending,c===null)break;g=c,c=g.next,g.next=null,n.lastBaseUpdate=g,n.shared.pending=null}}while(!0);p===null&&(s=y),n.baseState=s,n.firstBaseUpdate=r,n.lastBaseUpdate=p,i===null&&(n.shared.lanes=0),yl|=u,e.lanes=u,e.memoizedState=y}}function od(e,t){if(typeof e!="function")throw Error(S(191,e));e.call(t)}function rd(e,t){var l=e.callbacks;if(l!==null)for(e.callbacks=null,e=0;e<l.length;e++)od(l[e],t)}var ya=Tt(null),Oi=Tt(0);function Xo(e,t){e=Gt,te(Oi,e),te(ya,t),Gt=e|t.baseLanes}function Rc(){te(Oi,Gt),te(ya,ya.current)}function Rs(){Gt=Oi.current,Me(ya),Me(Oi)}var tt=Tt(null),ft=null;function Kt(e){var t=e.alternate;te(me,me.current&1),te(tt,e),ft===null&&(t===null||ya.current!==null||t.memoizedState!==null)&&(ft=e)}function Ac(e){te(me,me.current),te(tt,e),ft===null&&(ft=e)}function fd(e){e.tag===22?(te(me,me.current),te(tt,e),ft===null&&(ft=e)):$t()}function $t(){te(me,me.current),te(tt,tt.current)}function Je(e){Me(tt),ft===e&&(ft=null),Me(me)}var me=Tt(0);function Ri(e){for(var t=e;t!==null;){if(t.tag===13){var l=t.memoizedState;if(l!==null&&(l=l.dehydrated,l===null||Wc(l)||Fc(l)))return t}else if(t.tag===19&&(t.memoizedProps.revealOrder==="forwards"||t.memoizedProps.revealOrder==="backwards"||t.memoizedProps.revealOrder==="unstable_legacy-backwards"||t.memoizedProps.revealOrder==="together")){if(t.flags&128)return t}else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return null;t=t.return}t.sibling.return=t.return,t=t.sibling}return null}var qt=0,k=null,P=null,pe=null,Ai=!1,ra=!1,zl=!1,Ni=0,pn=0,fa=null,s0=0;function re(){throw Error(S(321))}function As(e,t){if(t===null)return!1;for(var l=0;l<t.length&&l<e.length;l++)if(!et(e[l],t[l]))return!1;return!0}function Ns(e,t,l,a,n,i){return qt=i,k=t,t.memoizedState=null,t.updateQueue=null,t.lanes=0,D.H=e===null||e.memoizedState===null?Gd:Xs,zl=!1,i=l(a,n),zl=!1,ra&&(i=md(t,l,a,n)),dd(e),i}function dd(e){D.H=yn;var t=P!==null&&P.next!==null;if(qt=0,pe=P=k=null,Ai=!1,pn=0,fa=null,t)throw Error(S(300));e===null||ve||(e=e.dependencies,e!==null&&ji(e)&&(ve=!0))}function md(e,t,l,a){k=e;var n=0;do{if(ra&&(fa=null),pn=0,ra=!1,25<=n)throw Error(S(301));if(n+=1,pe=P=null,e.updateQueue!=null){var i=e.updateQueue;i.lastEffect=null,i.events=null,i.stores=null,i.memoCache!=null&&(i.memoCache.index=0)}D.H=Xd,i=t(l,a)}while(ra);return i}function o0(){var e=D.H,t=e.useState()[0];return t=typeof t.then=="function"?Rn(t):t,e=e.useState()[0],(P!==null?P.memoizedState:null)!==e&&(k.flags|=1024),t}function zs(){var e=Ni!==0;return Ni=0,e}function Ds(e,t,l){t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~l}function Hs(e){if(Ai){for(e=e.memoizedState;e!==null;){var t=e.queue;t!==null&&(t.pending=null),e=e.next}Ai=!1}qt=0,pe=P=k=null,ra=!1,pn=Ni=0,fa=null}function ze(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return pe===null?k.memoizedState=pe=e:pe=pe.next=e,pe}function he(){if(P===null){var e=k.alternate;e=e!==null?e.memoizedState:null}else e=P.next;var t=pe===null?k.memoizedState:pe.next;if(t!==null)pe=t,P=e;else{if(e===null)throw k.alternate===null?Error(S(467)):Error(S(310));P=e,e={memoizedState:P.memoizedState,baseState:P.baseState,baseQueue:P.baseQueue,queue:P.queue,next:null},pe===null?k.memoizedState=pe=e:pe=pe.next=e}return pe}function uu(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function Rn(e){var t=pn;return pn+=1,fa===null&&(fa=[]),e=ud(fa,e,t),t=k,(pe===null?t.memoizedState:pe.next)===null&&(t=t.alternate,D.H=t===null||t.memoizedState===null?Gd:Xs),e}function cu(e){if(e!==null&&typeof e=="object"){if(typeof e.then=="function")return Rn(e);if(e.$$typeof===Nt)return Oe(e)}throw Error(S(438,String(e)))}function Us(e){var t=null,l=k.updateQueue;if(l!==null&&(t=l.memoCache),t==null){var a=k.alternate;a!==null&&(a=a.updateQueue,a!==null&&(a=a.memoCache,a!=null&&(t={data:a.data.map(function(n){return n.slice()}),index:0})))}if(t==null&&(t={data:[],index:0}),l===null&&(l=uu(),k.updateQueue=l),l.memoCache=t,l=t.data[t.index],l===void 0)for(l=t.data[t.index]=Array(e),a=0;a<e;a++)l[a]=Kh;return t.index++,l}function Bt(e,t){return typeof t=="function"?t(e):t}function oi(e){var t=he();return Ls(t,P,e)}function Ls(e,t,l){var a=e.queue;if(a===null)throw Error(S(311));a.lastRenderedReducer=l;var n=e.baseQueue,i=a.pending;if(i!==null){if(n!==null){var u=n.next;n.next=i.next,i.next=u}t.baseQueue=n=i,a.pending=null}if(i=e.baseState,n===null)e.memoizedState=i;else{t=n.next;var c=u=null,s=null,r=t,p=!1;do{var y=r.lane&-536870913;if(y!==r.lane?(Y&y)===y:(qt&y)===y){var m=r.revertLane;if(m===0)s!==null&&(s=s.next={lane:0,revertLane:0,gesture:null,action:r.action,hasEagerState:r.hasEagerState,eagerState:r.eagerState,next:null}),y===pa&&(p=!0);else if((qt&m)===m){r=r.next,m===pa&&(p=!0);continue}else y={lane:0,revertLane:r.revertLane,gesture:null,action:r.action,hasEagerState:r.hasEagerState,eagerState:r.eagerState,next:null},s===null?(c=s=y,u=i):s=s.next=y,k.lanes|=m,yl|=m;y=r.action,zl&&l(i,y),i=r.hasEagerState?r.eagerState:l(i,y)}else m={lane:y,revertLane:r.revertLane,gesture:r.gesture,action:r.action,hasEagerState:r.hasEagerState,eagerState:r.eagerState,next:null},s===null?(c=s=m,u=i):s=s.next=m,k.lanes|=y,yl|=y;r=r.next}while(r!==null&&r!==t);if(s===null?u=i:s.next=c,!et(i,e.memoizedState)&&(ve=!0,p&&(l=sa,l!==null)))throw l;e.memoizedState=i,e.baseState=u,e.baseQueue=s,a.lastRenderedState=i}return n===null&&(a.lanes=0),[e.memoizedState,a.dispatch]}function zu(e){var t=he(),l=t.queue;if(l===null)throw Error(S(311));l.lastRenderedReducer=e;var a=l.dispatch,n=l.pending,i=t.memoizedState;if(n!==null){l.pending=null;var u=n=n.next;do i=e(i,u.action),u=u.next;while(u!==n);et(i,t.memoizedState)||(ve=!0),t.memoizedState=i,t.baseQueue===null&&(t.baseState=i),l.lastRenderedState=i}return[i,a]}function hd(e,t,l){var a=k,n=he(),i=G;if(i){if(l===void 0)throw Error(S(407));l=l()}else l=t();var u=!et((P||n).memoizedState,l);if(u&&(n.memoizedState=l,ve=!0),n=n.queue,ks(gd.bind(null,a,n,e),[e]),n.getSnapshot!==t||u||pe!==null&&pe.memoizedState.tag&1){if(a.flags|=2048,ga(9,{destroy:void 0},yd.bind(null,a,n,l,t),null),ee===null)throw Error(S(349));i||qt&127||pd(a,t,l)}return l}function pd(e,t,l){e.flags|=16384,e={getSnapshot:t,value:l},t=k.updateQueue,t===null?(t=uu(),k.updateQueue=t,t.stores=[e]):(l=t.stores,l===null?t.stores=[e]:l.push(e))}function yd(e,t,l,a){t.value=l,t.getSnapshot=a,vd(t)&&bd(e)}function gd(e,t,l){return l(function(){vd(t)&&bd(e)})}function vd(e){var t=e.getSnapshot;e=e.value;try{var l=t();return!et(e,l)}catch{return!0}}function bd(e){var t=kl(e,2);t!==null&&Ge(t,e,2)}function Nc(e){var t=ze();if(typeof e=="function"){var l=e;if(e=l(),zl){Ft(!0);try{l()}finally{Ft(!1)}}}return t.memoizedState=t.baseState=e,t.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:Bt,lastRenderedState:e},t}function Sd(e,t,l,a){return e.baseState=l,Ls(e,P,typeof a=="function"?a:Bt)}function r0(e,t,l,a,n){if(ou(e))throw Error(S(485));if(e=t.action,e!==null){var i={payload:n,action:e,next:null,isTransition:!0,status:"pending",value:null,reason:null,listeners:[],then:function(u){i.listeners.push(u)}};D.T!==null?l(!0):i.isTransition=!1,a(i),l=t.pending,l===null?(i.next=t.pending=i,xd(t,i)):(i.next=l.next,t.pending=l.next=i)}}function xd(e,t){var l=t.action,a=t.payload,n=e.state;if(t.isTransition){var i=D.T,u={};D.T=u;try{var c=l(n,a),s=D.S;s!==null&&s(u,c),Qo(e,t,c)}catch(r){zc(e,t,r)}finally{i!==null&&u.types!==null&&(i.types=u.types),D.T=i}}else try{i=l(n,a),Qo(e,t,i)}catch(r){zc(e,t,r)}}function Qo(e,t,l){l!==null&&typeof l=="object"&&typeof l.then=="function"?l.then(function(a){Vo(e,t,a)},function(a){return zc(e,t,a)}):Vo(e,t,l)}function Vo(e,t,l){t.status="fulfilled",t.value=l,Ed(t),e.state=l,t=e.pending,t!==null&&(l=t.next,l===t?e.pending=null:(l=l.next,t.next=l,xd(e,l)))}function zc(e,t,l){var a=e.pending;if(e.pending=null,a!==null){a=a.next;do t.status="rejected",t.reason=l,Ed(t),t=t.next;while(t!==a)}e.action=null}function Ed(e){e=e.listeners;for(var t=0;t<e.length;t++)(0,e[t])()}function Td(e,t){return t}function Zo(e,t){if(G){var l=ee.formState;if(l!==null){e:{var a=k;if(G){if(ne){t:{for(var n=ne,i=ot;n.nodeType!==8;){if(!i){n=null;break t}if(n=dt(n.nextSibling),n===null){n=null;break t}}i=n.data,n=i==="F!"||i==="F"?n:null}if(n){ne=dt(n.nextSibling),a=n.data==="F!";break e}}hl(a)}a=!1}a&&(t=l[0])}}return l=ze(),l.memoizedState=l.baseState=t,a={pending:null,lanes:0,dispatch:null,lastRenderedReducer:Td,lastRenderedState:t},l.queue=a,l=qd.bind(null,k,a),a.dispatch=l,a=Nc(!1),i=Gs.bind(null,k,!1,a.queue),a=ze(),n={state:t,dispatch:null,action:e,pending:null},a.queue=n,l=r0.bind(null,k,n,i,l),n.dispatch=l,a.memoizedState=e,[t,l,!1]}function Jo(e){var t=he();return wd(t,P,e)}function wd(e,t,l){if(t=Ls(e,t,Td)[0],e=oi(Bt)[0],typeof t=="object"&&t!==null&&typeof t.then=="function")try{var a=Rn(t)}catch(u){throw u===ja?iu:u}else a=t;t=he();var n=t.queue,i=n.dispatch;return l!==t.memoizedState&&(k.flags|=2048,ga(9,{destroy:void 0},f0.bind(null,n,l),null)),[a,i,e]}function f0(e,t){e.action=t}function Ko(e){var t=he(),l=P;if(l!==null)return wd(t,l,e);he(),t=t.memoizedState,l=he();var a=l.queue.dispatch;return l.memoizedState=e,[t,a,!1]}function ga(e,t,l,a){return e={tag:e,create:l,deps:a,inst:t,next:null},t=k.updateQueue,t===null&&(t=uu(),k.updateQueue=t),l=t.lastEffect,l===null?t.lastEffect=e.next=e:(a=l.next,l.next=e,e.next=a,t.lastEffect=e),e}function Md(){return he().memoizedState}function ri(e,t,l,a){var n=ze();k.flags|=e,n.memoizedState=ga(1|t,{destroy:void 0},l,a===void 0?null:a)}function su(e,t,l,a){var n=he();a=a===void 0?null:a;var i=n.memoizedState.inst;P!==null&&a!==null&&As(a,P.memoizedState.deps)?n.memoizedState=ga(t,i,l,a):(k.flags|=e,n.memoizedState=ga(1|t,i,l,a))}function $o(e,t){ri(8390656,8,e,t)}function ks(e,t){su(2048,8,e,t)}function d0(e){k.flags|=4;var t=k.updateQueue;if(t===null)t=uu(),k.updateQueue=t,t.events=[e];else{var l=t.events;l===null?t.events=[e]:l.push(e)}}function _d(e){var t=he().memoizedState;return d0({ref:t,nextImpl:e}),function(){if(Z&2)throw Error(S(440));return t.impl.apply(void 0,arguments)}}function jd(e,t){return su(4,2,e,t)}function Cd(e,t){return su(4,4,e,t)}function Od(e,t){if(typeof t=="function"){e=e();var l=t(e);return function(){typeof l=="function"?l():t(null)}}if(t!=null)return e=e(),t.current=e,function(){t.current=null}}function Rd(e,t,l){l=l!=null?l.concat([e]):null,su(4,4,Od.bind(null,t,e),l)}function qs(){}function Ad(e,t){var l=he();t=t===void 0?null:t;var a=l.memoizedState;return t!==null&&As(t,a[1])?a[0]:(l.memoizedState=[e,t],e)}function Nd(e,t){var l=he();t=t===void 0?null:t;var a=l.memoizedState;if(t!==null&&As(t,a[1]))return a[0];if(a=e(),zl){Ft(!0);try{e()}finally{Ft(!1)}}return l.memoizedState=[a,t],a}function Bs(e,t,l){return l===void 0||qt&1073741824&&!(Y&261930)?e.memoizedState=t:(e.memoizedState=l,e=Sm(),k.lanes|=e,yl|=e,l)}function zd(e,t,l,a){return et(l,t)?l:ya.current!==null?(e=Bs(e,l,a),et(e,t)||(ve=!0),e):!(qt&42)||qt&1073741824&&!(Y&261930)?(ve=!0,e.memoizedState=l):(e=Sm(),k.lanes|=e,yl|=e,t)}function Dd(e,t,l,a,n){var i=J.p;J.p=i!==0&&8>i?i:8;var u=D.T,c={};D.T=c,Gs(e,!1,t,l);try{var s=n(),r=D.S;if(r!==null&&r(c,s),s!==null&&typeof s=="object"&&typeof s.then=="function"){var p=c0(s,a);en(e,t,p,Pe(e))}else en(e,t,a,Pe(e))}catch(y){en(e,t,{then:function(){},status:"rejected",reason:y},Pe())}finally{J.p=i,u!==null&&c.types!==null&&(u.types=c.types),D.T=u}}function m0(){}function Dc(e,t,l,a){if(e.tag!==5)throw Error(S(476));var n=Hd(e).queue;Dd(e,n,t,Ml,l===null?m0:function(){return Ud(e),l(a)})}function Hd(e){var t=e.memoizedState;if(t!==null)return t;t={memoizedState:Ml,baseState:Ml,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:Bt,lastRenderedState:Ml},next:null};var l={};return t.next={memoizedState:l,baseState:l,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:Bt,lastRenderedState:l},next:null},e.memoizedState=t,e=e.alternate,e!==null&&(e.memoizedState=t),t}function Ud(e){var t=Hd(e);t.next===null&&(t=e.alternate.memoizedState),en(e,t.next.queue,{},Pe())}function Ys(){return Oe(bn)}function Ld(){return he().memoizedState}function kd(){return he().memoizedState}function h0(e){for(var t=e.return;t!==null;){switch(t.tag){case 24:case 3:var l=Pe();e=il(l);var a=ul(t,e,l);a!==null&&(Ge(a,t,l),Fa(a,t,l)),t={cache:_s()},e.payload=t;return}t=t.return}}function p0(e,t,l){var a=Pe();l={lane:a,revertLane:0,gesture:null,action:l,hasEagerState:!1,eagerState:null,next:null},ou(e)?Bd(t,l):(l=Es(e,t,l,a),l!==null&&(Ge(l,e,a),Yd(l,t,a)))}function qd(e,t,l){var a=Pe();en(e,t,l,a)}function en(e,t,l,a){var n={lane:a,revertLane:0,gesture:null,action:l,hasEagerState:!1,eagerState:null,next:null};if(ou(e))Bd(t,n);else{var i=e.alternate;if(e.lanes===0&&(i===null||i.lanes===0)&&(i=t.lastRenderedReducer,i!==null))try{var u=t.lastRenderedState,c=i(u,l);if(n.hasEagerState=!0,n.eagerState=c,et(c,u))return nu(e,t,n,0),ee===null&&au(),!1}catch{}finally{}if(l=Es(e,t,n,a),l!==null)return Ge(l,e,a),Yd(l,t,a),!0}return!1}function Gs(e,t,l,a){if(a={lane:2,revertLane:Fs(),gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null},ou(e)){if(t)throw Error(S(479))}else t=Es(e,l,a,2),t!==null&&Ge(t,e,2)}function ou(e){var t=e.alternate;return e===k||t!==null&&t===k}function Bd(e,t){ra=Ai=!0;var l=e.pending;l===null?t.next=t:(t.next=l.next,l.next=t),e.pending=t}function Yd(e,t,l){if(l&4194048){var a=t.lanes;a&=e.pendingLanes,l|=a,t.lanes=l,_f(e,l)}}var yn={readContext:Oe,use:cu,useCallback:re,useContext:re,useEffect:re,useImperativeHandle:re,useLayoutEffect:re,useInsertionEffect:re,useMemo:re,useReducer:re,useRef:re,useState:re,useDebugValue:re,useDeferredValue:re,useTransition:re,useSyncExternalStore:re,useId:re,useHostTransitionStatus:re,useFormState:re,useActionState:re,useOptimistic:re,useMemoCache:re,useCacheRefresh:re};yn.useEffectEvent=re;var Gd={readContext:Oe,use:cu,useCallback:function(e,t){return ze().memoizedState=[e,t===void 0?null:t],e},useContext:Oe,useEffect:$o,useImperativeHandle:function(e,t,l){l=l!=null?l.concat([e]):null,ri(4194308,4,Od.bind(null,t,e),l)},useLayoutEffect:function(e,t){return ri(4194308,4,e,t)},useInsertionEffect:function(e,t){ri(4,2,e,t)},useMemo:function(e,t){var l=ze();t=t===void 0?null:t;var a=e();if(zl){Ft(!0);try{e()}finally{Ft(!1)}}return l.memoizedState=[a,t],a},useReducer:function(e,t,l){var a=ze();if(l!==void 0){var n=l(t);if(zl){Ft(!0);try{l(t)}finally{Ft(!1)}}}else n=t;return a.memoizedState=a.baseState=n,e={pending:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:n},a.queue=e,e=e.dispatch=p0.bind(null,k,e),[a.memoizedState,e]},useRef:function(e){var t=ze();return e={current:e},t.memoizedState=e},useState:function(e){e=Nc(e);var t=e.queue,l=qd.bind(null,k,t);return t.dispatch=l,[e.memoizedState,l]},useDebugValue:qs,useDeferredValue:function(e,t){var l=ze();return Bs(l,e,t)},useTransition:function(){var e=Nc(!1);return e=Dd.bind(null,k,e.queue,!0,!1),ze().memoizedState=e,[!1,e]},useSyncExternalStore:function(e,t,l){var a=k,n=ze();if(G){if(l===void 0)throw Error(S(407));l=l()}else{if(l=t(),ee===null)throw Error(S(349));Y&127||pd(a,t,l)}n.memoizedState=l;var i={value:l,getSnapshot:t};return n.queue=i,$o(gd.bind(null,a,i,e),[e]),a.flags|=2048,ga(9,{destroy:void 0},yd.bind(null,a,i,l,t),null),l},useId:function(){var e=ze(),t=ee.identifierPrefix;if(G){var l=St,a=bt;l=(a&~(1<<32-Ie(a)-1)).toString(32)+l,t="_"+t+"R_"+l,l=Ni++,0<l&&(t+="H"+l.toString(32)),t+="_"}else l=s0++,t="_"+t+"r_"+l.toString(32)+"_";return e.memoizedState=t},useHostTransitionStatus:Ys,useFormState:Zo,useActionState:Zo,useOptimistic:function(e){var t=ze();t.memoizedState=t.baseState=e;var l={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return t.queue=l,t=Gs.bind(null,k,!0,l),l.dispatch=t,[e,t]},useMemoCache:Us,useCacheRefresh:function(){return ze().memoizedState=h0.bind(null,k)},useEffectEvent:function(e){var t=ze(),l={impl:e};return t.memoizedState=l,function(){if(Z&2)throw Error(S(440));return l.impl.apply(void 0,arguments)}}},Xs={readContext:Oe,use:cu,useCallback:Ad,useContext:Oe,useEffect:ks,useImperativeHandle:Rd,useInsertionEffect:jd,useLayoutEffect:Cd,useMemo:Nd,useReducer:oi,useRef:Md,useState:function(){return oi(Bt)},useDebugValue:qs,useDeferredValue:function(e,t){var l=he();return zd(l,P.memoizedState,e,t)},useTransition:function(){var e=oi(Bt)[0],t=he().memoizedState;return[typeof e=="boolean"?e:Rn(e),t]},useSyncExternalStore:hd,useId:Ld,useHostTransitionStatus:Ys,useFormState:Jo,useActionState:Jo,useOptimistic:function(e,t){var l=he();return Sd(l,P,e,t)},useMemoCache:Us,useCacheRefresh:kd};Xs.useEffectEvent=_d;var Xd={readContext:Oe,use:cu,useCallback:Ad,useContext:Oe,useEffect:ks,useImperativeHandle:Rd,useInsertionEffect:jd,useLayoutEffect:Cd,useMemo:Nd,useReducer:zu,useRef:Md,useState:function(){return zu(Bt)},useDebugValue:qs,useDeferredValue:function(e,t){var l=he();return P===null?Bs(l,e,t):zd(l,P.memoizedState,e,t)},useTransition:function(){var e=zu(Bt)[0],t=he().memoizedState;return[typeof e=="boolean"?e:Rn(e),t]},useSyncExternalStore:hd,useId:Ld,useHostTransitionStatus:Ys,useFormState:Ko,useActionState:Ko,useOptimistic:function(e,t){var l=he();return P!==null?Sd(l,P,e,t):(l.baseState=e,[e,l.queue.dispatch])},useMemoCache:Us,useCacheRefresh:kd};Xd.useEffectEvent=_d;function Du(e,t,l,a){t=e.memoizedState,l=l(a,t),l=l==null?t:ue({},t,l),e.memoizedState=l,e.lanes===0&&(e.updateQueue.baseState=l)}var Hc={enqueueSetState:function(e,t,l){e=e._reactInternals;var a=Pe(),n=il(a);n.payload=t,l!=null&&(n.callback=l),t=ul(e,n,a),t!==null&&(Ge(t,e,a),Fa(t,e,a))},enqueueReplaceState:function(e,t,l){e=e._reactInternals;var a=Pe(),n=il(a);n.tag=1,n.payload=t,l!=null&&(n.callback=l),t=ul(e,n,a),t!==null&&(Ge(t,e,a),Fa(t,e,a))},enqueueForceUpdate:function(e,t){e=e._reactInternals;var l=Pe(),a=il(l);a.tag=2,t!=null&&(a.callback=t),t=ul(e,a,l),t!==null&&(Ge(t,e,l),Fa(t,e,l))}};function Wo(e,t,l,a,n,i,u){return e=e.stateNode,typeof e.shouldComponentUpdate=="function"?e.shouldComponentUpdate(a,i,u):t.prototype&&t.prototype.isPureReactComponent?!fn(l,a)||!fn(n,i):!0}function Fo(e,t,l,a){e=t.state,typeof t.componentWillReceiveProps=="function"&&t.componentWillReceiveProps(l,a),typeof t.UNSAFE_componentWillReceiveProps=="function"&&t.UNSAFE_componentWillReceiveProps(l,a),t.state!==e&&Hc.enqueueReplaceState(t,t.state,null)}function Dl(e,t){var l=t;if("ref"in t){l={};for(var a in t)a!=="ref"&&(l[a]=t[a])}if(e=e.defaultProps){l===t&&(l=ue({},l));for(var n in e)l[n]===void 0&&(l[n]=e[n])}return l}function Qd(e){wi(e)}function Vd(e){console.error(e)}function Zd(e){wi(e)}function zi(e,t){try{var l=e.onUncaughtError;l(t.value,{componentStack:t.stack})}catch(a){setTimeout(function(){throw a})}}function Io(e,t,l){try{var a=e.onCaughtError;a(l.value,{componentStack:l.stack,errorBoundary:t.tag===1?t.stateNode:null})}catch(n){setTimeout(function(){throw n})}}function Uc(e,t,l){return l=il(l),l.tag=3,l.payload={element:null},l.callback=function(){zi(e,t)},l}function Jd(e){return e=il(e),e.tag=3,e}function Kd(e,t,l,a){var n=l.type.getDerivedStateFromError;if(typeof n=="function"){var i=a.value;e.payload=function(){return n(i)},e.callback=function(){Io(t,l,a)}}var u=l.stateNode;u!==null&&typeof u.componentDidCatch=="function"&&(e.callback=function(){Io(t,l,a),typeof n!="function"&&(cl===null?cl=new Set([this]):cl.add(this));var c=a.stack;this.componentDidCatch(a.value,{componentStack:c!==null?c:""})})}function y0(e,t,l,a,n){if(l.flags|=32768,a!==null&&typeof a=="object"&&typeof a.then=="function"){if(t=l.alternate,t!==null&&_a(t,l,n,!0),l=tt.current,l!==null){switch(l.tag){case 31:case 13:return ft===null?ki():l.alternate===null&&fe===0&&(fe=3),l.flags&=-257,l.flags|=65536,l.lanes=n,a===Ci?l.flags|=16384:(t=l.updateQueue,t===null?l.updateQueue=new Set([a]):t.add(a),Vu(e,a,n)),!1;case 22:return l.flags|=65536,a===Ci?l.flags|=16384:(t=l.updateQueue,t===null?(t={transitions:null,markerInstances:null,retryQueue:new Set([a])},l.updateQueue=t):(l=t.retryQueue,l===null?t.retryQueue=new Set([a]):l.add(a)),Vu(e,a,n)),!1}throw Error(S(435,l.tag))}return Vu(e,a,n),ki(),!1}if(G)return t=tt.current,t!==null?(!(t.flags&65536)&&(t.flags|=256),t.flags|=65536,t.lanes=n,a!==Tc&&(e=Error(S(422),{cause:a}),mn(st(e,l)))):(a!==Tc&&(t=Error(S(423),{cause:a}),mn(st(t,l))),e=e.current.alternate,e.flags|=65536,n&=-n,e.lanes|=n,a=st(a,l),n=Uc(e.stateNode,a,n),Nu(e,n),fe!==4&&(fe=2)),!1;var i=Error(S(520),{cause:a});if(i=st(i,l),an===null?an=[i]:an.push(i),fe!==4&&(fe=2),t===null)return!0;a=st(a,l),l=t;do{switch(l.tag){case 3:return l.flags|=65536,e=n&-n,l.lanes|=e,e=Uc(l.stateNode,a,e),Nu(l,e),!1;case 1:if(t=l.type,i=l.stateNode,(l.flags&128)===0&&(typeof t.getDerivedStateFromError=="function"||i!==null&&typeof i.componentDidCatch=="function"&&(cl===null||!cl.has(i))))return l.flags|=65536,n&=-n,l.lanes|=n,n=Jd(n),Kd(n,e,l,a),Nu(l,n),!1}l=l.return}while(l!==null);return!1}var Qs=Error(S(461)),ve=!1;function _e(e,t,l,a){t.child=e===null?sd(t,null,l,a):Nl(t,e.child,l,a)}function Po(e,t,l,a,n){l=l.render;var i=t.ref;if("ref"in a){var u={};for(var c in a)c!=="ref"&&(u[c]=a[c])}else u=a;return Al(t),a=Ns(e,t,l,u,i,n),c=zs(),e!==null&&!ve?(Ds(e,t,n),Yt(e,t,n)):(G&&c&&ws(t),t.flags|=1,_e(e,t,a,n),t.child)}function er(e,t,l,a,n){if(e===null){var i=l.type;return typeof i=="function"&&!Ts(i)&&i.defaultProps===void 0&&l.compare===null?(t.tag=15,t.type=i,$d(e,t,i,a,n)):(e=ci(l.type,null,a,t,t.mode,n),e.ref=t.ref,e.return=t,t.child=e)}if(i=e.child,!Vs(e,n)){var u=i.memoizedProps;if(l=l.compare,l=l!==null?l:fn,l(u,a)&&e.ref===t.ref)return Yt(e,t,n)}return t.flags|=1,e=Ht(i,a),e.ref=t.ref,e.return=t,t.child=e}function $d(e,t,l,a,n){if(e!==null){var i=e.memoizedProps;if(fn(i,a)&&e.ref===t.ref)if(ve=!1,t.pendingProps=a=i,Vs(e,n))e.flags&131072&&(ve=!0);else return t.lanes=e.lanes,Yt(e,t,n)}return Lc(e,t,l,a,n)}function Wd(e,t,l,a){var n=a.children,i=e!==null?e.memoizedState:null;if(e===null&&t.stateNode===null&&(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),a.mode==="hidden"){if(t.flags&128){if(i=i!==null?i.baseLanes|l:l,e!==null){for(a=t.child=e.child,n=0;a!==null;)n=n|a.lanes|a.childLanes,a=a.sibling;a=n&~i}else a=0,t.child=null;return tr(e,t,i,l,a)}if(l&536870912)t.memoizedState={baseLanes:0,cachePool:null},e!==null&&si(t,i!==null?i.cachePool:null),i!==null?Xo(t,i):Rc(),fd(t);else return a=t.lanes=536870912,tr(e,t,i!==null?i.baseLanes|l:l,l,a)}else i!==null?(si(t,i.cachePool),Xo(t,i),$t(),t.memoizedState=null):(e!==null&&si(t,null),Rc(),$t());return _e(e,t,n,l),t.child}function Ya(e,t){return e!==null&&e.tag===22||t.stateNode!==null||(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),t.sibling}function tr(e,t,l,a,n){var i=js();return i=i===null?null:{parent:ge._currentValue,pool:i},t.memoizedState={baseLanes:l,cachePool:i},e!==null&&si(t,null),Rc(),fd(t),e!==null&&_a(e,t,a,!0),t.childLanes=n,null}function fi(e,t){return t=Di({mode:t.mode,children:t.children},e.mode),t.ref=e.ref,e.child=t,t.return=e,t}function lr(e,t,l){return Nl(t,e.child,null,l),e=fi(t,t.pendingProps),e.flags|=2,Je(t),t.memoizedState=null,e}function g0(e,t,l){var a=t.pendingProps,n=(t.flags&128)!==0;if(t.flags&=-129,e===null){if(G){if(a.mode==="hidden")return e=fi(t,a),t.lanes=536870912,Ya(null,e);if(Ac(t),(e=ne)?(e=Gm(e,ot),e=e!==null&&e.data==="&"?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:ml!==null?{id:bt,overflow:St}:null,retryLane:536870912,hydrationErrors:null},l=td(e),l.return=t,t.child=l,Ce=t,ne=null)):e=null,e===null)throw hl(t);return t.lanes=536870912,null}return fi(t,a)}var i=e.memoizedState;if(i!==null){var u=i.dehydrated;if(Ac(t),n)if(t.flags&256)t.flags&=-257,t=lr(e,t,l);else if(t.memoizedState!==null)t.child=e.child,t.flags|=128,t=null;else throw Error(S(558));else if(ve||_a(e,t,l,!1),n=(l&e.childLanes)!==0,ve||n){if(a=ee,a!==null&&(u=jf(a,l),u!==0&&u!==i.retryLane))throw i.retryLane=u,kl(e,u),Ge(a,e,u),Qs;ki(),t=lr(e,t,l)}else e=i.treeContext,ne=dt(u.nextSibling),Ce=t,G=!0,nl=null,ot=!1,e!==null&&ad(t,e),t=fi(t,a),t.flags|=4096;return t}return e=Ht(e.child,{mode:a.mode,children:a.children}),e.ref=t.ref,t.child=e,e.return=t,e}function di(e,t){var l=t.ref;if(l===null)e!==null&&e.ref!==null&&(t.flags|=4194816);else{if(typeof l!="function"&&typeof l!="object")throw Error(S(284));(e===null||e.ref!==l)&&(t.flags|=4194816)}}function Lc(e,t,l,a,n){return Al(t),l=Ns(e,t,l,a,void 0,n),a=zs(),e!==null&&!ve?(Ds(e,t,n),Yt(e,t,n)):(G&&a&&ws(t),t.flags|=1,_e(e,t,l,n),t.child)}function ar(e,t,l,a,n,i){return Al(t),t.updateQueue=null,l=md(t,a,l,n),dd(e),a=zs(),e!==null&&!ve?(Ds(e,t,i),Yt(e,t,i)):(G&&a&&ws(t),t.flags|=1,_e(e,t,l,i),t.child)}function nr(e,t,l,a,n){if(Al(t),t.stateNode===null){var i=ea,u=l.contextType;typeof u=="object"&&u!==null&&(i=Oe(u)),i=new l(a,i),t.memoizedState=i.state!==null&&i.state!==void 0?i.state:null,i.updater=Hc,t.stateNode=i,i._reactInternals=t,i=t.stateNode,i.props=a,i.state=t.memoizedState,i.refs={},Os(t),u=l.contextType,i.context=typeof u=="object"&&u!==null?Oe(u):ea,i.state=t.memoizedState,u=l.getDerivedStateFromProps,typeof u=="function"&&(Du(t,l,u,a),i.state=t.memoizedState),typeof l.getDerivedStateFromProps=="function"||typeof i.getSnapshotBeforeUpdate=="function"||typeof i.UNSAFE_componentWillMount!="function"&&typeof i.componentWillMount!="function"||(u=i.state,typeof i.componentWillMount=="function"&&i.componentWillMount(),typeof i.UNSAFE_componentWillMount=="function"&&i.UNSAFE_componentWillMount(),u!==i.state&&Hc.enqueueReplaceState(i,i.state,null),Pa(t,a,i,n),Ia(),i.state=t.memoizedState),typeof i.componentDidMount=="function"&&(t.flags|=4194308),a=!0}else if(e===null){i=t.stateNode;var c=t.memoizedProps,s=Dl(l,c);i.props=s;var r=i.context,p=l.contextType;u=ea,typeof p=="object"&&p!==null&&(u=Oe(p));var y=l.getDerivedStateFromProps;p=typeof y=="function"||typeof i.getSnapshotBeforeUpdate=="function",c=t.pendingProps!==c,p||typeof i.UNSAFE_componentWillReceiveProps!="function"&&typeof i.componentWillReceiveProps!="function"||(c||r!==u)&&Fo(t,i,a,u),Zt=!1;var m=t.memoizedState;i.state=m,Pa(t,a,i,n),Ia(),r=t.memoizedState,c||m!==r||Zt?(typeof y=="function"&&(Du(t,l,y,a),r=t.memoizedState),(s=Zt||Wo(t,l,s,a,m,r,u))?(p||typeof i.UNSAFE_componentWillMount!="function"&&typeof i.componentWillMount!="function"||(typeof i.componentWillMount=="function"&&i.componentWillMount(),typeof i.UNSAFE_componentWillMount=="function"&&i.UNSAFE_componentWillMount()),typeof i.componentDidMount=="function"&&(t.flags|=4194308)):(typeof i.componentDidMount=="function"&&(t.flags|=4194308),t.memoizedProps=a,t.memoizedState=r),i.props=a,i.state=r,i.context=u,a=s):(typeof i.componentDidMount=="function"&&(t.flags|=4194308),a=!1)}else{i=t.stateNode,Cc(e,t),u=t.memoizedProps,p=Dl(l,u),i.props=p,y=t.pendingProps,m=i.context,r=l.contextType,s=ea,typeof r=="object"&&r!==null&&(s=Oe(r)),c=l.getDerivedStateFromProps,(r=typeof c=="function"||typeof i.getSnapshotBeforeUpdate=="function")||typeof i.UNSAFE_componentWillReceiveProps!="function"&&typeof i.componentWillReceiveProps!="function"||(u!==y||m!==s)&&Fo(t,i,a,s),Zt=!1,m=t.memoizedState,i.state=m,Pa(t,a,i,n),Ia();var g=t.memoizedState;u!==y||m!==g||Zt||e!==null&&e.dependencies!==null&&ji(e.dependencies)?(typeof c=="function"&&(Du(t,l,c,a),g=t.memoizedState),(p=Zt||Wo(t,l,p,a,m,g,s)||e!==null&&e.dependencies!==null&&ji(e.dependencies))?(r||typeof i.UNSAFE_componentWillUpdate!="function"&&typeof i.componentWillUpdate!="function"||(typeof i.componentWillUpdate=="function"&&i.componentWillUpdate(a,g,s),typeof i.UNSAFE_componentWillUpdate=="function"&&i.UNSAFE_componentWillUpdate(a,g,s)),typeof i.componentDidUpdate=="function"&&(t.flags|=4),typeof i.getSnapshotBeforeUpdate=="function"&&(t.flags|=1024)):(typeof i.componentDidUpdate!="function"||u===e.memoizedProps&&m===e.memoizedState||(t.flags|=4),typeof i.getSnapshotBeforeUpdate!="function"||u===e.memoizedProps&&m===e.memoizedState||(t.flags|=1024),t.memoizedProps=a,t.memoizedState=g),i.props=a,i.state=g,i.context=s,a=p):(typeof i.componentDidUpdate!="function"||u===e.memoizedProps&&m===e.memoizedState||(t.flags|=4),typeof i.getSnapshotBeforeUpdate!="function"||u===e.memoizedProps&&m===e.memoizedState||(t.flags|=1024),a=!1)}return i=a,di(e,t),a=(t.flags&128)!==0,i||a?(i=t.stateNode,l=a&&typeof l.getDerivedStateFromError!="function"?null:i.render(),t.flags|=1,e!==null&&a?(t.child=Nl(t,e.child,null,n),t.child=Nl(t,null,l,n)):_e(e,t,l,n),t.memoizedState=i.state,e=t.child):e=Yt(e,t,n),e}function ir(e,t,l,a){return Rl(),t.flags|=256,_e(e,t,l,a),t.child}var Hu={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function Uu(e){return{baseLanes:e,cachePool:id()}}function Lu(e,t,l){return e=e!==null?e.childLanes&~l:0,t&&(e|=$e),e}function Fd(e,t,l){var a=t.pendingProps,n=!1,i=(t.flags&128)!==0,u;if((u=i)||(u=e!==null&&e.memoizedState===null?!1:(me.current&2)!==0),u&&(n=!0,t.flags&=-129),u=(t.flags&32)!==0,t.flags&=-33,e===null){if(G){if(n?Kt(t):$t(),(e=ne)?(e=Gm(e,ot),e=e!==null&&e.data!=="&"?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:ml!==null?{id:bt,overflow:St}:null,retryLane:536870912,hydrationErrors:null},l=td(e),l.return=t,t.child=l,Ce=t,ne=null)):e=null,e===null)throw hl(t);return Fc(e)?t.lanes=32:t.lanes=536870912,null}var c=a.children;return a=a.fallback,n?($t(),n=t.mode,c=Di({mode:"hidden",children:c},n),a=_l(a,n,l,null),c.return=t,a.return=t,c.sibling=a,t.child=c,a=t.child,a.memoizedState=Uu(l),a.childLanes=Lu(e,u,l),t.memoizedState=Hu,Ya(null,a)):(Kt(t),kc(t,c))}var s=e.memoizedState;if(s!==null&&(c=s.dehydrated,c!==null)){if(i)t.flags&256?(Kt(t),t.flags&=-257,t=ku(e,t,l)):t.memoizedState!==null?($t(),t.child=e.child,t.flags|=128,t=null):($t(),c=a.fallback,n=t.mode,a=Di({mode:"visible",children:a.children},n),c=_l(c,n,l,null),c.flags|=2,a.return=t,c.return=t,a.sibling=c,t.child=a,Nl(t,e.child,null,l),a=t.child,a.memoizedState=Uu(l),a.childLanes=Lu(e,u,l),t.memoizedState=Hu,t=Ya(null,a));else if(Kt(t),Fc(c)){if(u=c.nextSibling&&c.nextSibling.dataset,u)var r=u.dgst;u=r,a=Error(S(419)),a.stack="",a.digest=u,mn({value:a,source:null,stack:null}),t=ku(e,t,l)}else if(ve||_a(e,t,l,!1),u=(l&e.childLanes)!==0,ve||u){if(u=ee,u!==null&&(a=jf(u,l),a!==0&&a!==s.retryLane))throw s.retryLane=a,kl(e,a),Ge(u,e,a),Qs;Wc(c)||ki(),t=ku(e,t,l)}else Wc(c)?(t.flags|=192,t.child=e.child,t=null):(e=s.treeContext,ne=dt(c.nextSibling),Ce=t,G=!0,nl=null,ot=!1,e!==null&&ad(t,e),t=kc(t,a.children),t.flags|=4096);return t}return n?($t(),c=a.fallback,n=t.mode,s=e.child,r=s.sibling,a=Ht(s,{mode:"hidden",children:a.children}),a.subtreeFlags=s.subtreeFlags&65011712,r!==null?c=Ht(r,c):(c=_l(c,n,l,null),c.flags|=2),c.return=t,a.return=t,a.sibling=c,t.child=a,Ya(null,a),a=t.child,c=e.child.memoizedState,c===null?c=Uu(l):(n=c.cachePool,n!==null?(s=ge._currentValue,n=n.parent!==s?{parent:s,pool:s}:n):n=id(),c={baseLanes:c.baseLanes|l,cachePool:n}),a.memoizedState=c,a.childLanes=Lu(e,u,l),t.memoizedState=Hu,Ya(e.child,a)):(Kt(t),l=e.child,e=l.sibling,l=Ht(l,{mode:"visible",children:a.children}),l.return=t,l.sibling=null,e!==null&&(u=t.deletions,u===null?(t.deletions=[e],t.flags|=16):u.push(e)),t.child=l,t.memoizedState=null,l)}function kc(e,t){return t=Di({mode:"visible",children:t},e.mode),t.return=e,e.child=t}function Di(e,t){return e=Ke(22,e,null,t),e.lanes=0,e}function ku(e,t,l){return Nl(t,e.child,null,l),e=kc(t,t.pendingProps.children),e.flags|=2,t.memoizedState=null,e}function ur(e,t,l){e.lanes|=t;var a=e.alternate;a!==null&&(a.lanes|=t),Mc(e.return,t,l)}function qu(e,t,l,a,n,i){var u=e.memoizedState;u===null?e.memoizedState={isBackwards:t,rendering:null,renderingStartTime:0,last:a,tail:l,tailMode:n,treeForkCount:i}:(u.isBackwards=t,u.rendering=null,u.renderingStartTime=0,u.last=a,u.tail=l,u.tailMode=n,u.treeForkCount=i)}function Id(e,t,l){var a=t.pendingProps,n=a.revealOrder,i=a.tail;a=a.children;var u=me.current,c=(u&2)!==0;if(c?(u=u&1|2,t.flags|=128):u&=1,te(me,u),_e(e,t,a,l),a=G?dn:0,!c&&e!==null&&e.flags&128)e:for(e=t.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&ur(e,l,t);else if(e.tag===19)ur(e,l,t);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break e;for(;e.sibling===null;){if(e.return===null||e.return===t)break e;e=e.return}e.sibling.return=e.return,e=e.sibling}switch(n){case"forwards":for(l=t.child,n=null;l!==null;)e=l.alternate,e!==null&&Ri(e)===null&&(n=l),l=l.sibling;l=n,l===null?(n=t.child,t.child=null):(n=l.sibling,l.sibling=null),qu(t,!1,n,l,i,a);break;case"backwards":case"unstable_legacy-backwards":for(l=null,n=t.child,t.child=null;n!==null;){if(e=n.alternate,e!==null&&Ri(e)===null){t.child=n;break}e=n.sibling,n.sibling=l,l=n,n=e}qu(t,!0,l,null,i,a);break;case"together":qu(t,!1,null,null,void 0,a);break;default:t.memoizedState=null}return t.child}function Yt(e,t,l){if(e!==null&&(t.dependencies=e.dependencies),yl|=t.lanes,!(l&t.childLanes))if(e!==null){if(_a(e,t,l,!1),(l&t.childLanes)===0)return null}else return null;if(e!==null&&t.child!==e.child)throw Error(S(153));if(t.child!==null){for(e=t.child,l=Ht(e,e.pendingProps),t.child=l,l.return=t;e.sibling!==null;)e=e.sibling,l=l.sibling=Ht(e,e.pendingProps),l.return=t;l.sibling=null}return t.child}function Vs(e,t){return e.lanes&t?!0:(e=e.dependencies,!!(e!==null&&ji(e)))}function v0(e,t,l){switch(t.tag){case 3:Si(t,t.stateNode.containerInfo),Jt(t,ge,e.memoizedState.cache),Rl();break;case 27:case 5:dc(t);break;case 4:Si(t,t.stateNode.containerInfo);break;case 10:Jt(t,t.type,t.memoizedProps.value);break;case 31:if(t.memoizedState!==null)return t.flags|=128,Ac(t),null;break;case 13:var a=t.memoizedState;if(a!==null)return a.dehydrated!==null?(Kt(t),t.flags|=128,null):l&t.child.childLanes?Fd(e,t,l):(Kt(t),e=Yt(e,t,l),e!==null?e.sibling:null);Kt(t);break;case 19:var n=(e.flags&128)!==0;if(a=(l&t.childLanes)!==0,a||(_a(e,t,l,!1),a=(l&t.childLanes)!==0),n){if(a)return Id(e,t,l);t.flags|=128}if(n=t.memoizedState,n!==null&&(n.rendering=null,n.tail=null,n.lastEffect=null),te(me,me.current),a)break;return null;case 22:return t.lanes=0,Wd(e,t,l,t.pendingProps);case 24:Jt(t,ge,e.memoizedState.cache)}return Yt(e,t,l)}function Pd(e,t,l){if(e!==null)if(e.memoizedProps!==t.pendingProps)ve=!0;else{if(!Vs(e,l)&&!(t.flags&128))return ve=!1,v0(e,t,l);ve=!!(e.flags&131072)}else ve=!1,G&&t.flags&1048576&&ld(t,dn,t.index);switch(t.lanes=0,t.tag){case 16:e:{var a=t.pendingProps;if(e=El(t.elementType),t.type=e,typeof e=="function")Ts(e)?(a=Dl(e,a),t.tag=1,t=nr(null,t,e,a,l)):(t.tag=0,t=Lc(null,t,e,a,l));else{if(e!=null){var n=e.$$typeof;if(n===os){t.tag=11,t=Po(null,t,e,a,l);break e}else if(n===rs){t.tag=14,t=er(null,t,e,a,l);break e}}throw t=rc(e)||e,Error(S(306,t,""))}}return t;case 0:return Lc(e,t,t.type,t.pendingProps,l);case 1:return a=t.type,n=Dl(a,t.pendingProps),nr(e,t,a,n,l);case 3:e:{if(Si(t,t.stateNode.containerInfo),e===null)throw Error(S(387));a=t.pendingProps;var i=t.memoizedState;n=i.element,Cc(e,t),Pa(t,a,null,l);var u=t.memoizedState;if(a=u.cache,Jt(t,ge,a),a!==i.cache&&_c(t,[ge],l,!0),Ia(),a=u.element,i.isDehydrated)if(i={element:a,isDehydrated:!1,cache:u.cache},t.updateQueue.baseState=i,t.memoizedState=i,t.flags&256){t=ir(e,t,a,l);break e}else if(a!==n){n=st(Error(S(424)),t),mn(n),t=ir(e,t,a,l);break e}else{switch(e=t.stateNode.containerInfo,e.nodeType){case 9:e=e.body;break;default:e=e.nodeName==="HTML"?e.ownerDocument.body:e}for(ne=dt(e.firstChild),Ce=t,G=!0,nl=null,ot=!0,l=sd(t,null,a,l),t.child=l;l;)l.flags=l.flags&-3|4096,l=l.sibling}else{if(Rl(),a===n){t=Yt(e,t,l);break e}_e(e,t,a,l)}t=t.child}return t;case 26:return di(e,t),e===null?(l=_r(t.type,null,t.pendingProps,null))?t.memoizedState=l:G||(l=t.type,e=t.pendingProps,a=Gi(al.current).createElement(l),a[je]=t,a[Xe]=e,Re(a,l,e),we(a),t.stateNode=a):t.memoizedState=_r(t.type,e.memoizedProps,t.pendingProps,e.memoizedState),null;case 27:return dc(t),e===null&&G&&(a=t.stateNode=Xm(t.type,t.pendingProps,al.current),Ce=t,ot=!0,n=ne,vl(t.type)?(Ic=n,ne=dt(a.firstChild)):ne=n),_e(e,t,t.pendingProps.children,l),di(e,t),e===null&&(t.flags|=4194304),t.child;case 5:return e===null&&G&&((n=a=ne)&&(a=K0(a,t.type,t.pendingProps,ot),a!==null?(t.stateNode=a,Ce=t,ne=dt(a.firstChild),ot=!1,n=!0):n=!1),n||hl(t)),dc(t),n=t.type,i=t.pendingProps,u=e!==null?e.memoizedProps:null,a=i.children,Kc(n,i)?a=null:u!==null&&Kc(n,u)&&(t.flags|=32),t.memoizedState!==null&&(n=Ns(e,t,o0,null,null,l),bn._currentValue=n),di(e,t),_e(e,t,a,l),t.child;case 6:return e===null&&G&&((e=l=ne)&&(l=$0(l,t.pendingProps,ot),l!==null?(t.stateNode=l,Ce=t,ne=null,e=!0):e=!1),e||hl(t)),null;case 13:return Fd(e,t,l);case 4:return Si(t,t.stateNode.containerInfo),a=t.pendingProps,e===null?t.child=Nl(t,null,a,l):_e(e,t,a,l),t.child;case 11:return Po(e,t,t.type,t.pendingProps,l);case 7:return _e(e,t,t.pendingProps,l),t.child;case 8:return _e(e,t,t.pendingProps.children,l),t.child;case 12:return _e(e,t,t.pendingProps.children,l),t.child;case 10:return a=t.pendingProps,Jt(t,t.type,a.value),_e(e,t,a.children,l),t.child;case 9:return n=t.type._context,a=t.pendingProps.children,Al(t),n=Oe(n),a=a(n),t.flags|=1,_e(e,t,a,l),t.child;case 14:return er(e,t,t.type,t.pendingProps,l);case 15:return $d(e,t,t.type,t.pendingProps,l);case 19:return Id(e,t,l);case 31:return g0(e,t,l);case 22:return Wd(e,t,l,t.pendingProps);case 24:return Al(t),a=Oe(ge),e===null?(n=js(),n===null&&(n=ee,i=_s(),n.pooledCache=i,i.refCount++,i!==null&&(n.pooledCacheLanes|=l),n=i),t.memoizedState={parent:a,cache:n},Os(t),Jt(t,ge,n)):(e.lanes&l&&(Cc(e,t),Pa(t,null,null,l),Ia()),n=e.memoizedState,i=t.memoizedState,n.parent!==a?(n={parent:a,cache:a},t.memoizedState=n,t.lanes===0&&(t.memoizedState=t.updateQueue.baseState=n),Jt(t,ge,a)):(a=i.cache,Jt(t,ge,a),a!==n.cache&&_c(t,[ge],l,!0))),_e(e,t,t.pendingProps.children,l),t.child;case 29:throw t.pendingProps}throw Error(S(156,t.tag))}function _t(e){e.flags|=4}function Bu(e,t,l,a,n){if((t=(e.mode&32)!==0)&&(t=!1),t){if(e.flags|=16777216,(n&335544128)===n)if(e.stateNode.complete)e.flags|=8192;else if(Tm())e.flags|=8192;else throw Cl=Ci,Cs}else e.flags&=-16777217}function cr(e,t){if(t.type!=="stylesheet"||t.state.loading&4)e.flags&=-16777217;else if(e.flags|=16777216,!Zm(t))if(Tm())e.flags|=8192;else throw Cl=Ci,Cs}function Jn(e,t){t!==null&&(e.flags|=4),e.flags&16384&&(t=e.tag!==22?wf():536870912,e.lanes|=t,va|=t)}function Ha(e,t){if(!G)switch(e.tailMode){case"hidden":t=e.tail;for(var l=null;t!==null;)t.alternate!==null&&(l=t),t=t.sibling;l===null?e.tail=null:l.sibling=null;break;case"collapsed":l=e.tail;for(var a=null;l!==null;)l.alternate!==null&&(a=l),l=l.sibling;a===null?t||e.tail===null?e.tail=null:e.tail.sibling=null:a.sibling=null}}function ae(e){var t=e.alternate!==null&&e.alternate.child===e.child,l=0,a=0;if(t)for(var n=e.child;n!==null;)l|=n.lanes|n.childLanes,a|=n.subtreeFlags&65011712,a|=n.flags&65011712,n.return=e,n=n.sibling;else for(n=e.child;n!==null;)l|=n.lanes|n.childLanes,a|=n.subtreeFlags,a|=n.flags,n.return=e,n=n.sibling;return e.subtreeFlags|=a,e.childLanes=l,t}function b0(e,t,l){var a=t.pendingProps;switch(Ms(t),t.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return ae(t),null;case 1:return ae(t),null;case 3:return l=t.stateNode,a=null,e!==null&&(a=e.memoizedState.cache),t.memoizedState.cache!==a&&(t.flags|=2048),Ut(ge),da(),l.pendingContext&&(l.context=l.pendingContext,l.pendingContext=null),(e===null||e.child===null)&&(Bl(t)?_t(t):e===null||e.memoizedState.isDehydrated&&!(t.flags&256)||(t.flags|=1024,Au())),ae(t),null;case 26:var n=t.type,i=t.memoizedState;return e===null?(_t(t),i!==null?(ae(t),cr(t,i)):(ae(t),Bu(t,n,null,a,l))):i?i!==e.memoizedState?(_t(t),ae(t),cr(t,i)):(ae(t),t.flags&=-16777217):(e=e.memoizedProps,e!==a&&_t(t),ae(t),Bu(t,n,e,a,l)),null;case 27:if(xi(t),l=al.current,n=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==a&&_t(t);else{if(!a){if(t.stateNode===null)throw Error(S(166));return ae(t),null}e=Et.current,Bl(t)?Uo(t):(e=Xm(n,a,l),t.stateNode=e,_t(t))}return ae(t),null;case 5:if(xi(t),n=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==a&&_t(t);else{if(!a){if(t.stateNode===null)throw Error(S(166));return ae(t),null}if(i=Et.current,Bl(t))Uo(t);else{var u=Gi(al.current);switch(i){case 1:i=u.createElementNS("http://www.w3.org/2000/svg",n);break;case 2:i=u.createElementNS("http://www.w3.org/1998/Math/MathML",n);break;default:switch(n){case"svg":i=u.createElementNS("http://www.w3.org/2000/svg",n);break;case"math":i=u.createElementNS("http://www.w3.org/1998/Math/MathML",n);break;case"script":i=u.createElement("div"),i.innerHTML="<script><\/script>",i=i.removeChild(i.firstChild);break;case"select":i=typeof a.is=="string"?u.createElement("select",{is:a.is}):u.createElement("select"),a.multiple?i.multiple=!0:a.size&&(i.size=a.size);break;default:i=typeof a.is=="string"?u.createElement(n,{is:a.is}):u.createElement(n)}}i[je]=t,i[Xe]=a;e:for(u=t.child;u!==null;){if(u.tag===5||u.tag===6)i.appendChild(u.stateNode);else if(u.tag!==4&&u.tag!==27&&u.child!==null){u.child.return=u,u=u.child;continue}if(u===t)break e;for(;u.sibling===null;){if(u.return===null||u.return===t)break e;u=u.return}u.sibling.return=u.return,u=u.sibling}t.stateNode=i;e:switch(Re(i,n,a),n){case"button":case"input":case"select":case"textarea":a=!!a.autoFocus;break e;case"img":a=!0;break e;default:a=!1}a&&_t(t)}}return ae(t),Bu(t,t.type,e===null?null:e.memoizedProps,t.pendingProps,l),null;case 6:if(e&&t.stateNode!=null)e.memoizedProps!==a&&_t(t);else{if(typeof a!="string"&&t.stateNode===null)throw Error(S(166));if(e=al.current,Bl(t)){if(e=t.stateNode,l=t.memoizedProps,a=null,n=Ce,n!==null)switch(n.tag){case 27:case 5:a=n.memoizedProps}e[je]=t,e=!!(e.nodeValue===l||a!==null&&a.suppressHydrationWarning===!0||qm(e.nodeValue,l)),e||hl(t,!0)}else e=Gi(e).createTextNode(a),e[je]=t,t.stateNode=e}return ae(t),null;case 31:if(l=t.memoizedState,e===null||e.memoizedState!==null){if(a=Bl(t),l!==null){if(e===null){if(!a)throw Error(S(318));if(e=t.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(S(557));e[je]=t}else Rl(),!(t.flags&128)&&(t.memoizedState=null),t.flags|=4;ae(t),e=!1}else l=Au(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=l),e=!0;if(!e)return t.flags&256?(Je(t),t):(Je(t),null);if(t.flags&128)throw Error(S(558))}return ae(t),null;case 13:if(a=t.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(n=Bl(t),a!==null&&a.dehydrated!==null){if(e===null){if(!n)throw Error(S(318));if(n=t.memoizedState,n=n!==null?n.dehydrated:null,!n)throw Error(S(317));n[je]=t}else Rl(),!(t.flags&128)&&(t.memoizedState=null),t.flags|=4;ae(t),n=!1}else n=Au(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=n),n=!0;if(!n)return t.flags&256?(Je(t),t):(Je(t),null)}return Je(t),t.flags&128?(t.lanes=l,t):(l=a!==null,e=e!==null&&e.memoizedState!==null,l&&(a=t.child,n=null,a.alternate!==null&&a.alternate.memoizedState!==null&&a.alternate.memoizedState.cachePool!==null&&(n=a.alternate.memoizedState.cachePool.pool),i=null,a.memoizedState!==null&&a.memoizedState.cachePool!==null&&(i=a.memoizedState.cachePool.pool),i!==n&&(a.flags|=2048)),l!==e&&l&&(t.child.flags|=8192),Jn(t,t.updateQueue),ae(t),null);case 4:return da(),e===null&&Is(t.stateNode.containerInfo),ae(t),null;case 10:return Ut(t.type),ae(t),null;case 19:if(Me(me),a=t.memoizedState,a===null)return ae(t),null;if(n=(t.flags&128)!==0,i=a.rendering,i===null)if(n)Ha(a,!1);else{if(fe!==0||e!==null&&e.flags&128)for(e=t.child;e!==null;){if(i=Ri(e),i!==null){for(t.flags|=128,Ha(a,!1),e=i.updateQueue,t.updateQueue=e,Jn(t,e),t.subtreeFlags=0,e=l,l=t.child;l!==null;)ed(l,e),l=l.sibling;return te(me,me.current&1|2),G&&Rt(t,a.treeForkCount),t.child}e=e.sibling}a.tail!==null&&We()>Ui&&(t.flags|=128,n=!0,Ha(a,!1),t.lanes=4194304)}else{if(!n)if(e=Ri(i),e!==null){if(t.flags|=128,n=!0,e=e.updateQueue,t.updateQueue=e,Jn(t,e),Ha(a,!0),a.tail===null&&a.tailMode==="hidden"&&!i.alternate&&!G)return ae(t),null}else 2*We()-a.renderingStartTime>Ui&&l!==536870912&&(t.flags|=128,n=!0,Ha(a,!1),t.lanes=4194304);a.isBackwards?(i.sibling=t.child,t.child=i):(e=a.last,e!==null?e.sibling=i:t.child=i,a.last=i)}return a.tail!==null?(e=a.tail,a.rendering=e,a.tail=e.sibling,a.renderingStartTime=We(),e.sibling=null,l=me.current,te(me,n?l&1|2:l&1),G&&Rt(t,a.treeForkCount),e):(ae(t),null);case 22:case 23:return Je(t),Rs(),a=t.memoizedState!==null,e!==null?e.memoizedState!==null!==a&&(t.flags|=8192):a&&(t.flags|=8192),a?l&536870912&&!(t.flags&128)&&(ae(t),t.subtreeFlags&6&&(t.flags|=8192)):ae(t),l=t.updateQueue,l!==null&&Jn(t,l.retryQueue),l=null,e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(l=e.memoizedState.cachePool.pool),a=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(a=t.memoizedState.cachePool.pool),a!==l&&(t.flags|=2048),e!==null&&Me(jl),null;case 24:return l=null,e!==null&&(l=e.memoizedState.cache),t.memoizedState.cache!==l&&(t.flags|=2048),Ut(ge),ae(t),null;case 25:return null;case 30:return null}throw Error(S(156,t.tag))}function S0(e,t){switch(Ms(t),t.tag){case 1:return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 3:return Ut(ge),da(),e=t.flags,e&65536&&!(e&128)?(t.flags=e&-65537|128,t):null;case 26:case 27:case 5:return xi(t),null;case 31:if(t.memoizedState!==null){if(Je(t),t.alternate===null)throw Error(S(340));Rl()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 13:if(Je(t),e=t.memoizedState,e!==null&&e.dehydrated!==null){if(t.alternate===null)throw Error(S(340));Rl()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 19:return Me(me),null;case 4:return da(),null;case 10:return Ut(t.type),null;case 22:case 23:return Je(t),Rs(),e!==null&&Me(jl),e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 24:return Ut(ge),null;case 25:return null;default:return null}}function em(e,t){switch(Ms(t),t.tag){case 3:Ut(ge),da();break;case 26:case 27:case 5:xi(t);break;case 4:da();break;case 31:t.memoizedState!==null&&Je(t);break;case 13:Je(t);break;case 19:Me(me);break;case 10:Ut(t.type);break;case 22:case 23:Je(t),Rs(),e!==null&&Me(jl);break;case 24:Ut(ge)}}function An(e,t){try{var l=t.updateQueue,a=l!==null?l.lastEffect:null;if(a!==null){var n=a.next;l=n;do{if((l.tag&e)===e){a=void 0;var i=l.create,u=l.inst;a=i(),u.destroy=a}l=l.next}while(l!==n)}}catch(c){W(t,t.return,c)}}function pl(e,t,l){try{var a=t.updateQueue,n=a!==null?a.lastEffect:null;if(n!==null){var i=n.next;a=i;do{if((a.tag&e)===e){var u=a.inst,c=u.destroy;if(c!==void 0){u.destroy=void 0,n=t;var s=l,r=c;try{r()}catch(p){W(n,s,p)}}}a=a.next}while(a!==i)}}catch(p){W(t,t.return,p)}}function tm(e){var t=e.updateQueue;if(t!==null){var l=e.stateNode;try{rd(t,l)}catch(a){W(e,e.return,a)}}}function lm(e,t,l){l.props=Dl(e.type,e.memoizedProps),l.state=e.memoizedState;try{l.componentWillUnmount()}catch(a){W(e,t,a)}}function tn(e,t){try{var l=e.ref;if(l!==null){switch(e.tag){case 26:case 27:case 5:var a=e.stateNode;break;case 30:a=e.stateNode;break;default:a=e.stateNode}typeof l=="function"?e.refCleanup=l(a):l.current=a}}catch(n){W(e,t,n)}}function xt(e,t){var l=e.ref,a=e.refCleanup;if(l!==null)if(typeof a=="function")try{a()}catch(n){W(e,t,n)}finally{e.refCleanup=null,e=e.alternate,e!=null&&(e.refCleanup=null)}else if(typeof l=="function")try{l(null)}catch(n){W(e,t,n)}else l.current=null}function am(e){var t=e.type,l=e.memoizedProps,a=e.stateNode;try{e:switch(t){case"button":case"input":case"select":case"textarea":l.autoFocus&&a.focus();break e;case"img":l.src?a.src=l.src:l.srcSet&&(a.srcset=l.srcSet)}}catch(n){W(e,e.return,n)}}function Yu(e,t,l){try{var a=e.stateNode;G0(a,e.type,l,t),a[Xe]=t}catch(n){W(e,e.return,n)}}function nm(e){return e.tag===5||e.tag===3||e.tag===26||e.tag===27&&vl(e.type)||e.tag===4}function Gu(e){e:for(;;){for(;e.sibling===null;){if(e.return===null||nm(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.tag===27&&vl(e.type)||e.flags&2||e.child===null||e.tag===4)continue e;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function qc(e,t,l){var a=e.tag;if(a===5||a===6)e=e.stateNode,t?(l.nodeType===9?l.body:l.nodeName==="HTML"?l.ownerDocument.body:l).insertBefore(e,t):(t=l.nodeType===9?l.body:l.nodeName==="HTML"?l.ownerDocument.body:l,t.appendChild(e),l=l._reactRootContainer,l!=null||t.onclick!==null||(t.onclick=zt));else if(a!==4&&(a===27&&vl(e.type)&&(l=e.stateNode,t=null),e=e.child,e!==null))for(qc(e,t,l),e=e.sibling;e!==null;)qc(e,t,l),e=e.sibling}function Hi(e,t,l){var a=e.tag;if(a===5||a===6)e=e.stateNode,t?l.insertBefore(e,t):l.appendChild(e);else if(a!==4&&(a===27&&vl(e.type)&&(l=e.stateNode),e=e.child,e!==null))for(Hi(e,t,l),e=e.sibling;e!==null;)Hi(e,t,l),e=e.sibling}function im(e){var t=e.stateNode,l=e.memoizedProps;try{for(var a=e.type,n=t.attributes;n.length;)t.removeAttributeNode(n[0]);Re(t,a,l),t[je]=e,t[Xe]=l}catch(i){W(e,e.return,i)}}var At=!1,ye=!1,Xu=!1,sr=typeof WeakSet=="function"?WeakSet:Set,Te=null;function x0(e,t){if(e=e.containerInfo,Zc=Zi,e=Zf(e),Ss(e)){if("selectionStart"in e)var l={start:e.selectionStart,end:e.selectionEnd};else e:{l=(l=e.ownerDocument)&&l.defaultView||window;var a=l.getSelection&&l.getSelection();if(a&&a.rangeCount!==0){l=a.anchorNode;var n=a.anchorOffset,i=a.focusNode;a=a.focusOffset;try{l.nodeType,i.nodeType}catch{l=null;break e}var u=0,c=-1,s=-1,r=0,p=0,y=e,m=null;t:for(;;){for(var g;y!==l||n!==0&&y.nodeType!==3||(c=u+n),y!==i||a!==0&&y.nodeType!==3||(s=u+a),y.nodeType===3&&(u+=y.nodeValue.length),(g=y.firstChild)!==null;)m=y,y=g;for(;;){if(y===e)break t;if(m===l&&++r===n&&(c=u),m===i&&++p===a&&(s=u),(g=y.nextSibling)!==null)break;y=m,m=y.parentNode}y=g}l=c===-1||s===-1?null:{start:c,end:s}}else l=null}l=l||{start:0,end:0}}else l=null;for(Jc={focusedElem:e,selectionRange:l},Zi=!1,Te=t;Te!==null;)if(t=Te,e=t.child,(t.subtreeFlags&1028)!==0&&e!==null)e.return=t,Te=e;else for(;Te!==null;){switch(t=Te,i=t.alternate,e=t.flags,t.tag){case 0:if(e&4&&(e=t.updateQueue,e=e!==null?e.events:null,e!==null))for(l=0;l<e.length;l++)n=e[l],n.ref.impl=n.nextImpl;break;case 11:case 15:break;case 1:if(e&1024&&i!==null){e=void 0,l=t,n=i.memoizedProps,i=i.memoizedState,a=l.stateNode;try{var x=Dl(l.type,n);e=a.getSnapshotBeforeUpdate(x,i),a.__reactInternalSnapshotBeforeUpdate=e}catch(_){W(l,l.return,_)}}break;case 3:if(e&1024){if(e=t.stateNode.containerInfo,l=e.nodeType,l===9)$c(e);else if(l===1)switch(e.nodeName){case"HEAD":case"HTML":case"BODY":$c(e);break;default:e.textContent=""}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;default:if(e&1024)throw Error(S(163))}if(e=t.sibling,e!==null){e.return=t.return,Te=e;break}Te=t.return}}function um(e,t,l){var a=l.flags;switch(l.tag){case 0:case 11:case 15:Ct(e,l),a&4&&An(5,l);break;case 1:if(Ct(e,l),a&4)if(e=l.stateNode,t===null)try{e.componentDidMount()}catch(u){W(l,l.return,u)}else{var n=Dl(l.type,t.memoizedProps);t=t.memoizedState;try{e.componentDidUpdate(n,t,e.__reactInternalSnapshotBeforeUpdate)}catch(u){W(l,l.return,u)}}a&64&&tm(l),a&512&&tn(l,l.return);break;case 3:if(Ct(e,l),a&64&&(e=l.updateQueue,e!==null)){if(t=null,l.child!==null)switch(l.child.tag){case 27:case 5:t=l.child.stateNode;break;case 1:t=l.child.stateNode}try{rd(e,t)}catch(u){W(l,l.return,u)}}break;case 27:t===null&&a&4&&im(l);case 26:case 5:Ct(e,l),t===null&&a&4&&am(l),a&512&&tn(l,l.return);break;case 12:Ct(e,l);break;case 31:Ct(e,l),a&4&&om(e,l);break;case 13:Ct(e,l),a&4&&rm(e,l),a&64&&(e=l.memoizedState,e!==null&&(e=e.dehydrated,e!==null&&(l=R0.bind(null,l),W0(e,l))));break;case 22:if(a=l.memoizedState!==null||At,!a){t=t!==null&&t.memoizedState!==null||ye,n=At;var i=ye;At=a,(ye=t)&&!i?Ot(e,l,(l.subtreeFlags&8772)!==0):Ct(e,l),At=n,ye=i}break;case 30:break;default:Ct(e,l)}}function cm(e){var t=e.alternate;t!==null&&(e.alternate=null,cm(t)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(t=e.stateNode,t!==null&&hs(t)),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}var oe=null,Be=!1;function jt(e,t,l){for(l=l.child;l!==null;)sm(e,t,l),l=l.sibling}function sm(e,t,l){if(Fe&&typeof Fe.onCommitFiberUnmount=="function")try{Fe.onCommitFiberUnmount(wn,l)}catch{}switch(l.tag){case 26:ye||xt(l,t),jt(e,t,l),l.memoizedState?l.memoizedState.count--:l.stateNode&&(l=l.stateNode,l.parentNode.removeChild(l));break;case 27:ye||xt(l,t);var a=oe,n=Be;vl(l.type)&&(oe=l.stateNode,Be=!1),jt(e,t,l),un(l.stateNode),oe=a,Be=n;break;case 5:ye||xt(l,t);case 6:if(a=oe,n=Be,oe=null,jt(e,t,l),oe=a,Be=n,oe!==null)if(Be)try{(oe.nodeType===9?oe.body:oe.nodeName==="HTML"?oe.ownerDocument.body:oe).removeChild(l.stateNode)}catch(i){W(l,t,i)}else try{oe.removeChild(l.stateNode)}catch(i){W(l,t,i)}break;case 18:oe!==null&&(Be?(e=oe,xr(e.nodeType===9?e.body:e.nodeName==="HTML"?e.ownerDocument.body:e,l.stateNode),Ea(e)):xr(oe,l.stateNode));break;case 4:a=oe,n=Be,oe=l.stateNode.containerInfo,Be=!0,jt(e,t,l),oe=a,Be=n;break;case 0:case 11:case 14:case 15:pl(2,l,t),ye||pl(4,l,t),jt(e,t,l);break;case 1:ye||(xt(l,t),a=l.stateNode,typeof a.componentWillUnmount=="function"&&lm(l,t,a)),jt(e,t,l);break;case 21:jt(e,t,l);break;case 22:ye=(a=ye)||l.memoizedState!==null,jt(e,t,l),ye=a;break;default:jt(e,t,l)}}function om(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null))){e=e.dehydrated;try{Ea(e)}catch(l){W(t,t.return,l)}}}function rm(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null&&(e=e.dehydrated,e!==null))))try{Ea(e)}catch(l){W(t,t.return,l)}}function E0(e){switch(e.tag){case 31:case 13:case 19:var t=e.stateNode;return t===null&&(t=e.stateNode=new sr),t;case 22:return e=e.stateNode,t=e._retryCache,t===null&&(t=e._retryCache=new sr),t;default:throw Error(S(435,e.tag))}}function Kn(e,t){var l=E0(e);t.forEach(function(a){if(!l.has(a)){l.add(a);var n=A0.bind(null,e,a);a.then(n,n)}})}function ke(e,t){var l=t.deletions;if(l!==null)for(var a=0;a<l.length;a++){var n=l[a],i=e,u=t,c=u;e:for(;c!==null;){switch(c.tag){case 27:if(vl(c.type)){oe=c.stateNode,Be=!1;break e}break;case 5:oe=c.stateNode,Be=!1;break e;case 3:case 4:oe=c.stateNode.containerInfo,Be=!0;break e}c=c.return}if(oe===null)throw Error(S(160));sm(i,u,n),oe=null,Be=!1,i=n.alternate,i!==null&&(i.return=null),n.return=null}if(t.subtreeFlags&13886)for(t=t.child;t!==null;)fm(t,e),t=t.sibling}var gt=null;function fm(e,t){var l=e.alternate,a=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:ke(t,e),qe(e),a&4&&(pl(3,e,e.return),An(3,e),pl(5,e,e.return));break;case 1:ke(t,e),qe(e),a&512&&(ye||l===null||xt(l,l.return)),a&64&&At&&(e=e.updateQueue,e!==null&&(a=e.callbacks,a!==null&&(l=e.shared.hiddenCallbacks,e.shared.hiddenCallbacks=l===null?a:l.concat(a))));break;case 26:var n=gt;if(ke(t,e),qe(e),a&512&&(ye||l===null||xt(l,l.return)),a&4){var i=l!==null?l.memoizedState:null;if(a=e.memoizedState,l===null)if(a===null)if(e.stateNode===null){e:{a=e.type,l=e.memoizedProps,n=n.ownerDocument||n;t:switch(a){case"title":i=n.getElementsByTagName("title")[0],(!i||i[jn]||i[je]||i.namespaceURI==="http://www.w3.org/2000/svg"||i.hasAttribute("itemprop"))&&(i=n.createElement(a),n.head.insertBefore(i,n.querySelector("head > title"))),Re(i,a,l),i[je]=e,we(i),a=i;break e;case"link":var u=Cr("link","href",n).get(a+(l.href||""));if(u){for(var c=0;c<u.length;c++)if(i=u[c],i.getAttribute("href")===(l.href==null||l.href===""?null:l.href)&&i.getAttribute("rel")===(l.rel==null?null:l.rel)&&i.getAttribute("title")===(l.title==null?null:l.title)&&i.getAttribute("crossorigin")===(l.crossOrigin==null?null:l.crossOrigin)){u.splice(c,1);break t}}i=n.createElement(a),Re(i,a,l),n.head.appendChild(i);break;case"meta":if(u=Cr("meta","content",n).get(a+(l.content||""))){for(c=0;c<u.length;c++)if(i=u[c],i.getAttribute("content")===(l.content==null?null:""+l.content)&&i.getAttribute("name")===(l.name==null?null:l.name)&&i.getAttribute("property")===(l.property==null?null:l.property)&&i.getAttribute("http-equiv")===(l.httpEquiv==null?null:l.httpEquiv)&&i.getAttribute("charset")===(l.charSet==null?null:l.charSet)){u.splice(c,1);break t}}i=n.createElement(a),Re(i,a,l),n.head.appendChild(i);break;default:throw Error(S(468,a))}i[je]=e,we(i),a=i}e.stateNode=a}else Or(n,e.type,e.stateNode);else e.stateNode=jr(n,a,e.memoizedProps);else i!==a?(i===null?l.stateNode!==null&&(l=l.stateNode,l.parentNode.removeChild(l)):i.count--,a===null?Or(n,e.type,e.stateNode):jr(n,a,e.memoizedProps)):a===null&&e.stateNode!==null&&Yu(e,e.memoizedProps,l.memoizedProps)}break;case 27:ke(t,e),qe(e),a&512&&(ye||l===null||xt(l,l.return)),l!==null&&a&4&&Yu(e,e.memoizedProps,l.memoizedProps);break;case 5:if(ke(t,e),qe(e),a&512&&(ye||l===null||xt(l,l.return)),e.flags&32){n=e.stateNode;try{ha(n,"")}catch(x){W(e,e.return,x)}}a&4&&e.stateNode!=null&&(n=e.memoizedProps,Yu(e,n,l!==null?l.memoizedProps:n)),a&1024&&(Xu=!0);break;case 6:if(ke(t,e),qe(e),a&4){if(e.stateNode===null)throw Error(S(162));a=e.memoizedProps,l=e.stateNode;try{l.nodeValue=a}catch(x){W(e,e.return,x)}}break;case 3:if(pi=null,n=gt,gt=Xi(t.containerInfo),ke(t,e),gt=n,qe(e),a&4&&l!==null&&l.memoizedState.isDehydrated)try{Ea(t.containerInfo)}catch(x){W(e,e.return,x)}Xu&&(Xu=!1,dm(e));break;case 4:a=gt,gt=Xi(e.stateNode.containerInfo),ke(t,e),qe(e),gt=a;break;case 12:ke(t,e),qe(e);break;case 31:ke(t,e),qe(e),a&4&&(a=e.updateQueue,a!==null&&(e.updateQueue=null,Kn(e,a)));break;case 13:ke(t,e),qe(e),e.child.flags&8192&&e.memoizedState!==null!=(l!==null&&l.memoizedState!==null)&&(ru=We()),a&4&&(a=e.updateQueue,a!==null&&(e.updateQueue=null,Kn(e,a)));break;case 22:n=e.memoizedState!==null;var s=l!==null&&l.memoizedState!==null,r=At,p=ye;if(At=r||n,ye=p||s,ke(t,e),ye=p,At=r,qe(e),a&8192)e:for(t=e.stateNode,t._visibility=n?t._visibility&-2:t._visibility|1,n&&(l===null||s||At||ye||Tl(e)),l=null,t=e;;){if(t.tag===5||t.tag===26){if(l===null){s=l=t;try{if(i=s.stateNode,n)u=i.style,typeof u.setProperty=="function"?u.setProperty("display","none","important"):u.display="none";else{c=s.stateNode;var y=s.memoizedProps.style,m=y!=null&&y.hasOwnProperty("display")?y.display:null;c.style.display=m==null||typeof m=="boolean"?"":(""+m).trim()}}catch(x){W(s,s.return,x)}}}else if(t.tag===6){if(l===null){s=t;try{s.stateNode.nodeValue=n?"":s.memoizedProps}catch(x){W(s,s.return,x)}}}else if(t.tag===18){if(l===null){s=t;try{var g=s.stateNode;n?Er(g,!0):Er(s.stateNode,!1)}catch(x){W(s,s.return,x)}}}else if((t.tag!==22&&t.tag!==23||t.memoizedState===null||t===e)&&t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break e;for(;t.sibling===null;){if(t.return===null||t.return===e)break e;l===t&&(l=null),t=t.return}l===t&&(l=null),t.sibling.return=t.return,t=t.sibling}a&4&&(a=e.updateQueue,a!==null&&(l=a.retryQueue,l!==null&&(a.retryQueue=null,Kn(e,l))));break;case 19:ke(t,e),qe(e),a&4&&(a=e.updateQueue,a!==null&&(e.updateQueue=null,Kn(e,a)));break;case 30:break;case 21:break;default:ke(t,e),qe(e)}}function qe(e){var t=e.flags;if(t&2){try{for(var l,a=e.return;a!==null;){if(nm(a)){l=a;break}a=a.return}if(l==null)throw Error(S(160));switch(l.tag){case 27:var n=l.stateNode,i=Gu(e);Hi(e,i,n);break;case 5:var u=l.stateNode;l.flags&32&&(ha(u,""),l.flags&=-33);var c=Gu(e);Hi(e,c,u);break;case 3:case 4:var s=l.stateNode.containerInfo,r=Gu(e);qc(e,r,s);break;default:throw Error(S(161))}}catch(p){W(e,e.return,p)}e.flags&=-3}t&4096&&(e.flags&=-4097)}function dm(e){if(e.subtreeFlags&1024)for(e=e.child;e!==null;){var t=e;dm(t),t.tag===5&&t.flags&1024&&t.stateNode.reset(),e=e.sibling}}function Ct(e,t){if(t.subtreeFlags&8772)for(t=t.child;t!==null;)um(e,t.alternate,t),t=t.sibling}function Tl(e){for(e=e.child;e!==null;){var t=e;switch(t.tag){case 0:case 11:case 14:case 15:pl(4,t,t.return),Tl(t);break;case 1:xt(t,t.return);var l=t.stateNode;typeof l.componentWillUnmount=="function"&&lm(t,t.return,l),Tl(t);break;case 27:un(t.stateNode);case 26:case 5:xt(t,t.return),Tl(t);break;case 22:t.memoizedState===null&&Tl(t);break;case 30:Tl(t);break;default:Tl(t)}e=e.sibling}}function Ot(e,t,l){for(l=l&&(t.subtreeFlags&8772)!==0,t=t.child;t!==null;){var a=t.alternate,n=e,i=t,u=i.flags;switch(i.tag){case 0:case 11:case 15:Ot(n,i,l),An(4,i);break;case 1:if(Ot(n,i,l),a=i,n=a.stateNode,typeof n.componentDidMount=="function")try{n.componentDidMount()}catch(r){W(a,a.return,r)}if(a=i,n=a.updateQueue,n!==null){var c=a.stateNode;try{var s=n.shared.hiddenCallbacks;if(s!==null)for(n.shared.hiddenCallbacks=null,n=0;n<s.length;n++)od(s[n],c)}catch(r){W(a,a.return,r)}}l&&u&64&&tm(i),tn(i,i.return);break;case 27:im(i);case 26:case 5:Ot(n,i,l),l&&a===null&&u&4&&am(i),tn(i,i.return);break;case 12:Ot(n,i,l);break;case 31:Ot(n,i,l),l&&u&4&&om(n,i);break;case 13:Ot(n,i,l),l&&u&4&&rm(n,i);break;case 22:i.memoizedState===null&&Ot(n,i,l),tn(i,i.return);break;case 30:break;default:Ot(n,i,l)}t=t.sibling}}function Zs(e,t){var l=null;e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(l=e.memoizedState.cachePool.pool),e=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(e=t.memoizedState.cachePool.pool),e!==l&&(e!=null&&e.refCount++,l!=null&&On(l))}function Js(e,t){e=null,t.alternate!==null&&(e=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==e&&(t.refCount++,e!=null&&On(e))}function yt(e,t,l,a){if(t.subtreeFlags&10256)for(t=t.child;t!==null;)mm(e,t,l,a),t=t.sibling}function mm(e,t,l,a){var n=t.flags;switch(t.tag){case 0:case 11:case 15:yt(e,t,l,a),n&2048&&An(9,t);break;case 1:yt(e,t,l,a);break;case 3:yt(e,t,l,a),n&2048&&(e=null,t.alternate!==null&&(e=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==e&&(t.refCount++,e!=null&&On(e)));break;case 12:if(n&2048){yt(e,t,l,a),e=t.stateNode;try{var i=t.memoizedProps,u=i.id,c=i.onPostCommit;typeof c=="function"&&c(u,t.alternate===null?"mount":"update",e.passiveEffectDuration,-0)}catch(s){W(t,t.return,s)}}else yt(e,t,l,a);break;case 31:yt(e,t,l,a);break;case 13:yt(e,t,l,a);break;case 23:break;case 22:i=t.stateNode,u=t.alternate,t.memoizedState!==null?i._visibility&2?yt(e,t,l,a):ln(e,t):i._visibility&2?yt(e,t,l,a):(i._visibility|=2,Ql(e,t,l,a,(t.subtreeFlags&10256)!==0||!1)),n&2048&&Zs(u,t);break;case 24:yt(e,t,l,a),n&2048&&Js(t.alternate,t);break;default:yt(e,t,l,a)}}function Ql(e,t,l,a,n){for(n=n&&((t.subtreeFlags&10256)!==0||!1),t=t.child;t!==null;){var i=e,u=t,c=l,s=a,r=u.flags;switch(u.tag){case 0:case 11:case 15:Ql(i,u,c,s,n),An(8,u);break;case 23:break;case 22:var p=u.stateNode;u.memoizedState!==null?p._visibility&2?Ql(i,u,c,s,n):ln(i,u):(p._visibility|=2,Ql(i,u,c,s,n)),n&&r&2048&&Zs(u.alternate,u);break;case 24:Ql(i,u,c,s,n),n&&r&2048&&Js(u.alternate,u);break;default:Ql(i,u,c,s,n)}t=t.sibling}}function ln(e,t){if(t.subtreeFlags&10256)for(t=t.child;t!==null;){var l=e,a=t,n=a.flags;switch(a.tag){case 22:ln(l,a),n&2048&&Zs(a.alternate,a);break;case 24:ln(l,a),n&2048&&Js(a.alternate,a);break;default:ln(l,a)}t=t.sibling}}var Ga=8192;function Yl(e,t,l){if(e.subtreeFlags&Ga)for(e=e.child;e!==null;)hm(e,t,l),e=e.sibling}function hm(e,t,l){switch(e.tag){case 26:Yl(e,t,l),e.flags&Ga&&e.memoizedState!==null&&sy(l,gt,e.memoizedState,e.memoizedProps);break;case 5:Yl(e,t,l);break;case 3:case 4:var a=gt;gt=Xi(e.stateNode.containerInfo),Yl(e,t,l),gt=a;break;case 22:e.memoizedState===null&&(a=e.alternate,a!==null&&a.memoizedState!==null?(a=Ga,Ga=16777216,Yl(e,t,l),Ga=a):Yl(e,t,l));break;default:Yl(e,t,l)}}function pm(e){var t=e.alternate;if(t!==null&&(e=t.child,e!==null)){t.child=null;do t=e.sibling,e.sibling=null,e=t;while(e!==null)}}function Ua(e){var t=e.deletions;if(e.flags&16){if(t!==null)for(var l=0;l<t.length;l++){var a=t[l];Te=a,gm(a,e)}pm(e)}if(e.subtreeFlags&10256)for(e=e.child;e!==null;)ym(e),e=e.sibling}function ym(e){switch(e.tag){case 0:case 11:case 15:Ua(e),e.flags&2048&&pl(9,e,e.return);break;case 3:Ua(e);break;case 12:Ua(e);break;case 22:var t=e.stateNode;e.memoizedState!==null&&t._visibility&2&&(e.return===null||e.return.tag!==13)?(t._visibility&=-3,mi(e)):Ua(e);break;default:Ua(e)}}function mi(e){var t=e.deletions;if(e.flags&16){if(t!==null)for(var l=0;l<t.length;l++){var a=t[l];Te=a,gm(a,e)}pm(e)}for(e=e.child;e!==null;){switch(t=e,t.tag){case 0:case 11:case 15:pl(8,t,t.return),mi(t);break;case 22:l=t.stateNode,l._visibility&2&&(l._visibility&=-3,mi(t));break;default:mi(t)}e=e.sibling}}function gm(e,t){for(;Te!==null;){var l=Te;switch(l.tag){case 0:case 11:case 15:pl(8,l,t);break;case 23:case 22:if(l.memoizedState!==null&&l.memoizedState.cachePool!==null){var a=l.memoizedState.cachePool.pool;a!=null&&a.refCount++}break;case 24:On(l.memoizedState.cache)}if(a=l.child,a!==null)a.return=l,Te=a;else e:for(l=e;Te!==null;){a=Te;var n=a.sibling,i=a.return;if(cm(a),a===l){Te=null;break e}if(n!==null){n.return=i,Te=n;break e}Te=i}}}var T0={getCacheForType:function(e){var t=Oe(ge),l=t.data.get(e);return l===void 0&&(l=e(),t.data.set(e,l)),l},cacheSignal:function(){return Oe(ge).controller.signal}},w0=typeof WeakMap=="function"?WeakMap:Map,Z=0,ee=null,B=null,Y=0,$=0,Ve=null,Pt=!1,Ca=!1,Ks=!1,Gt=0,fe=0,yl=0,Ol=0,$s=0,$e=0,va=0,an=null,Ye=null,Bc=!1,ru=0,vm=0,Ui=1/0,Li=null,cl=null,xe=0,sl=null,ba=null,Lt=0,Yc=0,Gc=null,bm=null,nn=0,Xc=null;function Pe(){return Z&2&&Y!==0?Y&-Y:D.T!==null?Fs():Cf()}function Sm(){if($e===0)if(!(Y&536870912)||G){var e=Bn;Bn<<=1,!(Bn&3932160)&&(Bn=262144),$e=e}else $e=536870912;return e=tt.current,e!==null&&(e.flags|=32),$e}function Ge(e,t,l){(e===ee&&($===2||$===9)||e.cancelPendingCommit!==null)&&(Sa(e,0),el(e,Y,$e,!1)),_n(e,l),(!(Z&2)||e!==ee)&&(e===ee&&(!(Z&2)&&(Ol|=l),fe===4&&el(e,Y,$e,!1)),wt(e))}function xm(e,t,l){if(Z&6)throw Error(S(327));var a=!l&&(t&127)===0&&(t&e.expiredLanes)===0||Mn(e,t),n=a?j0(e,t):Qu(e,t,!0),i=a;do{if(n===0){Ca&&!a&&el(e,t,0,!1);break}else{if(l=e.current.alternate,i&&!M0(l)){n=Qu(e,t,!1),i=!1;continue}if(n===2){if(i=t,e.errorRecoveryDisabledLanes&i)var u=0;else u=e.pendingLanes&-536870913,u=u!==0?u:u&536870912?536870912:0;if(u!==0){t=u;e:{var c=e;n=an;var s=c.current.memoizedState.isDehydrated;if(s&&(Sa(c,u).flags|=256),u=Qu(c,u,!1),u!==2){if(Ks&&!s){c.errorRecoveryDisabledLanes|=i,Ol|=i,n=4;break e}i=Ye,Ye=n,i!==null&&(Ye===null?Ye=i:Ye.push.apply(Ye,i))}n=u}if(i=!1,n!==2)continue}}if(n===1){Sa(e,0),el(e,t,0,!0);break}e:{switch(a=e,i=n,i){case 0:case 1:throw Error(S(345));case 4:if((t&4194048)!==t)break;case 6:el(a,t,$e,!Pt);break e;case 2:Ye=null;break;case 3:case 5:break;default:throw Error(S(329))}if((t&62914560)===t&&(n=ru+300-We(),10<n)){if(el(a,t,$e,!Pt),Pi(a,0,!0)!==0)break e;Lt=t,a.timeoutHandle=Ym(or.bind(null,a,l,Ye,Li,Bc,t,$e,Ol,va,Pt,i,"Throttled",-0,0),n);break e}or(a,l,Ye,Li,Bc,t,$e,Ol,va,Pt,i,null,-0,0)}}break}while(!0);wt(e)}function or(e,t,l,a,n,i,u,c,s,r,p,y,m,g){if(e.timeoutHandle=-1,y=t.subtreeFlags,y&8192||(y&16785408)===16785408){y={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:zt},hm(t,i,y);var x=(i&62914560)===i?ru-We():(i&4194048)===i?vm-We():0;if(x=oy(y,x),x!==null){Lt=i,e.cancelPendingCommit=x(fr.bind(null,e,t,i,l,a,n,u,c,s,p,y,null,m,g)),el(e,i,u,!r);return}}fr(e,t,i,l,a,n,u,c,s)}function M0(e){for(var t=e;;){var l=t.tag;if((l===0||l===11||l===15)&&t.flags&16384&&(l=t.updateQueue,l!==null&&(l=l.stores,l!==null)))for(var a=0;a<l.length;a++){var n=l[a],i=n.getSnapshot;n=n.value;try{if(!et(i(),n))return!1}catch{return!1}}if(l=t.child,t.subtreeFlags&16384&&l!==null)l.return=t,t=l;else{if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return!0;t=t.return}t.sibling.return=t.return,t=t.sibling}}return!0}function el(e,t,l,a){t&=~$s,t&=~Ol,e.suspendedLanes|=t,e.pingedLanes&=~t,a&&(e.warmLanes|=t),a=e.expirationTimes;for(var n=t;0<n;){var i=31-Ie(n),u=1<<i;a[i]=-1,n&=~u}l!==0&&Mf(e,l,t)}function fu(){return Z&6?!0:(Nn(0),!1)}function Ws(){if(B!==null){if($===0)var e=B.return;else e=B,Dt=ql=null,Hs(e),oa=null,hn=0,e=B;for(;e!==null;)em(e.alternate,e),e=e.return;B=null}}function Sa(e,t){var l=e.timeoutHandle;l!==-1&&(e.timeoutHandle=-1,V0(l)),l=e.cancelPendingCommit,l!==null&&(e.cancelPendingCommit=null,l()),Lt=0,Ws(),ee=e,B=l=Ht(e.current,null),Y=t,$=0,Ve=null,Pt=!1,Ca=Mn(e,t),Ks=!1,va=$e=$s=Ol=yl=fe=0,Ye=an=null,Bc=!1,t&8&&(t|=t&32);var a=e.entangledLanes;if(a!==0)for(e=e.entanglements,a&=t;0<a;){var n=31-Ie(a),i=1<<n;t|=e[n],a&=~i}return Gt=t,au(),l}function Em(e,t){k=null,D.H=yn,t===ja||t===iu?(t=Yo(),$=3):t===Cs?(t=Yo(),$=4):$=t===Qs?8:t!==null&&typeof t=="object"&&typeof t.then=="function"?6:1,Ve=t,B===null&&(fe=1,zi(e,st(t,e.current)))}function Tm(){var e=tt.current;return e===null?!0:(Y&4194048)===Y?ft===null:(Y&62914560)===Y||Y&536870912?e===ft:!1}function wm(){var e=D.H;return D.H=yn,e===null?yn:e}function Mm(){var e=D.A;return D.A=T0,e}function ki(){fe=4,Pt||(Y&4194048)!==Y&&tt.current!==null||(Ca=!0),!(yl&134217727)&&!(Ol&134217727)||ee===null||el(ee,Y,$e,!1)}function Qu(e,t,l){var a=Z;Z|=2;var n=wm(),i=Mm();(ee!==e||Y!==t)&&(Li=null,Sa(e,t)),t=!1;var u=fe;e:do try{if($!==0&&B!==null){var c=B,s=Ve;switch($){case 8:Ws(),u=6;break e;case 3:case 2:case 9:case 6:tt.current===null&&(t=!0);var r=$;if($=0,Ve=null,aa(e,c,s,r),l&&Ca){u=0;break e}break;default:r=$,$=0,Ve=null,aa(e,c,s,r)}}_0(),u=fe;break}catch(p){Em(e,p)}while(!0);return t&&e.shellSuspendCounter++,Dt=ql=null,Z=a,D.H=n,D.A=i,B===null&&(ee=null,Y=0,au()),u}function _0(){for(;B!==null;)_m(B)}function j0(e,t){var l=Z;Z|=2;var a=wm(),n=Mm();ee!==e||Y!==t?(Li=null,Ui=We()+500,Sa(e,t)):Ca=Mn(e,t);e:do try{if($!==0&&B!==null){t=B;var i=Ve;t:switch($){case 1:$=0,Ve=null,aa(e,t,i,1);break;case 2:case 9:if(Bo(i)){$=0,Ve=null,rr(t);break}t=function(){$!==2&&$!==9||ee!==e||($=7),wt(e)},i.then(t,t);break e;case 3:$=7;break e;case 4:$=5;break e;case 7:Bo(i)?($=0,Ve=null,rr(t)):($=0,Ve=null,aa(e,t,i,7));break;case 5:var u=null;switch(B.tag){case 26:u=B.memoizedState;case 5:case 27:var c=B;if(u?Zm(u):c.stateNode.complete){$=0,Ve=null;var s=c.sibling;if(s!==null)B=s;else{var r=c.return;r!==null?(B=r,du(r)):B=null}break t}}$=0,Ve=null,aa(e,t,i,5);break;case 6:$=0,Ve=null,aa(e,t,i,6);break;case 8:Ws(),fe=6;break e;default:throw Error(S(462))}}C0();break}catch(p){Em(e,p)}while(!0);return Dt=ql=null,D.H=a,D.A=n,Z=l,B!==null?0:(ee=null,Y=0,au(),fe)}function C0(){for(;B!==null&&!Fh();)_m(B)}function _m(e){var t=Pd(e.alternate,e,Gt);e.memoizedProps=e.pendingProps,t===null?du(e):B=t}function rr(e){var t=e,l=t.alternate;switch(t.tag){case 15:case 0:t=ar(l,t,t.pendingProps,t.type,void 0,Y);break;case 11:t=ar(l,t,t.pendingProps,t.type.render,t.ref,Y);break;case 5:Hs(t);default:em(l,t),t=B=ed(t,Gt),t=Pd(l,t,Gt)}e.memoizedProps=e.pendingProps,t===null?du(e):B=t}function aa(e,t,l,a){Dt=ql=null,Hs(t),oa=null,hn=0;var n=t.return;try{if(y0(e,n,t,l,Y)){fe=1,zi(e,st(l,e.current)),B=null;return}}catch(i){if(n!==null)throw B=n,i;fe=1,zi(e,st(l,e.current)),B=null;return}t.flags&32768?(G||a===1?e=!0:Ca||Y&536870912?e=!1:(Pt=e=!0,(a===2||a===9||a===3||a===6)&&(a=tt.current,a!==null&&a.tag===13&&(a.flags|=16384))),jm(t,e)):du(t)}function du(e){var t=e;do{if(t.flags&32768){jm(t,Pt);return}e=t.return;var l=b0(t.alternate,t,Gt);if(l!==null){B=l;return}if(t=t.sibling,t!==null){B=t;return}B=t=e}while(t!==null);fe===0&&(fe=5)}function jm(e,t){do{var l=S0(e.alternate,e);if(l!==null){l.flags&=32767,B=l;return}if(l=e.return,l!==null&&(l.flags|=32768,l.subtreeFlags=0,l.deletions=null),!t&&(e=e.sibling,e!==null)){B=e;return}B=e=l}while(e!==null);fe=6,B=null}function fr(e,t,l,a,n,i,u,c,s){e.cancelPendingCommit=null;do mu();while(xe!==0);if(Z&6)throw Error(S(327));if(t!==null){if(t===e.current)throw Error(S(177));if(i=t.lanes|t.childLanes,i|=xs,cp(e,l,i,u,c,s),e===ee&&(B=ee=null,Y=0),ba=t,sl=e,Lt=l,Yc=i,Gc=n,bm=a,t.subtreeFlags&10256||t.flags&10256?(e.callbackNode=null,e.callbackPriority=0,N0(Ei,function(){return Nm(),null})):(e.callbackNode=null,e.callbackPriority=0),a=(t.flags&13878)!==0,t.subtreeFlags&13878||a){a=D.T,D.T=null,n=J.p,J.p=2,u=Z,Z|=4;try{x0(e,t,l)}finally{Z=u,J.p=n,D.T=a}}xe=1,Cm(),Om(),Rm()}}function Cm(){if(xe===1){xe=0;var e=sl,t=ba,l=(t.flags&13878)!==0;if(t.subtreeFlags&13878||l){l=D.T,D.T=null;var a=J.p;J.p=2;var n=Z;Z|=4;try{fm(t,e);var i=Jc,u=Zf(e.containerInfo),c=i.focusedElem,s=i.selectionRange;if(u!==c&&c&&c.ownerDocument&&Vf(c.ownerDocument.documentElement,c)){if(s!==null&&Ss(c)){var r=s.start,p=s.end;if(p===void 0&&(p=r),"selectionStart"in c)c.selectionStart=r,c.selectionEnd=Math.min(p,c.value.length);else{var y=c.ownerDocument||document,m=y&&y.defaultView||window;if(m.getSelection){var g=m.getSelection(),x=c.textContent.length,_=Math.min(s.start,x),A=s.end===void 0?_:Math.min(s.end,x);!g.extend&&_>A&&(u=A,A=_,_=u);var d=zo(c,_),f=zo(c,A);if(d&&f&&(g.rangeCount!==1||g.anchorNode!==d.node||g.anchorOffset!==d.offset||g.focusNode!==f.node||g.focusOffset!==f.offset)){var h=y.createRange();h.setStart(d.node,d.offset),g.removeAllRanges(),_>A?(g.addRange(h),g.extend(f.node,f.offset)):(h.setEnd(f.node,f.offset),g.addRange(h))}}}}for(y=[],g=c;g=g.parentNode;)g.nodeType===1&&y.push({element:g,left:g.scrollLeft,top:g.scrollTop});for(typeof c.focus=="function"&&c.focus(),c=0;c<y.length;c++){var v=y[c];v.element.scrollLeft=v.left,v.element.scrollTop=v.top}}Zi=!!Zc,Jc=Zc=null}finally{Z=n,J.p=a,D.T=l}}e.current=t,xe=2}}function Om(){if(xe===2){xe=0;var e=sl,t=ba,l=(t.flags&8772)!==0;if(t.subtreeFlags&8772||l){l=D.T,D.T=null;var a=J.p;J.p=2;var n=Z;Z|=4;try{um(e,t.alternate,t)}finally{Z=n,J.p=a,D.T=l}}xe=3}}function Rm(){if(xe===4||xe===3){xe=0,Ih();var e=sl,t=ba,l=Lt,a=bm;t.subtreeFlags&10256||t.flags&10256?xe=5:(xe=0,ba=sl=null,Am(e,e.pendingLanes));var n=e.pendingLanes;if(n===0&&(cl=null),ms(l),t=t.stateNode,Fe&&typeof Fe.onCommitFiberRoot=="function")try{Fe.onCommitFiberRoot(wn,t,void 0,(t.current.flags&128)===128)}catch{}if(a!==null){t=D.T,n=J.p,J.p=2,D.T=null;try{for(var i=e.onRecoverableError,u=0;u<a.length;u++){var c=a[u];i(c.value,{componentStack:c.stack})}}finally{D.T=t,J.p=n}}Lt&3&&mu(),wt(e),n=e.pendingLanes,l&261930&&n&42?e===Xc?nn++:(nn=0,Xc=e):nn=0,Nn(0)}}function Am(e,t){(e.pooledCacheLanes&=t)===0&&(t=e.pooledCache,t!=null&&(e.pooledCache=null,On(t)))}function mu(){return Cm(),Om(),Rm(),Nm()}function Nm(){if(xe!==5)return!1;var e=sl,t=Yc;Yc=0;var l=ms(Lt),a=D.T,n=J.p;try{J.p=32>l?32:l,D.T=null,l=Gc,Gc=null;var i=sl,u=Lt;if(xe=0,ba=sl=null,Lt=0,Z&6)throw Error(S(331));var c=Z;if(Z|=4,ym(i.current),mm(i,i.current,u,l),Z=c,Nn(0,!1),Fe&&typeof Fe.onPostCommitFiberRoot=="function")try{Fe.onPostCommitFiberRoot(wn,i)}catch{}return!0}finally{J.p=n,D.T=a,Am(e,t)}}function dr(e,t,l){t=st(l,t),t=Uc(e.stateNode,t,2),e=ul(e,t,2),e!==null&&(_n(e,2),wt(e))}function W(e,t,l){if(e.tag===3)dr(e,e,l);else for(;t!==null;){if(t.tag===3){dr(t,e,l);break}else if(t.tag===1){var a=t.stateNode;if(typeof t.type.getDerivedStateFromError=="function"||typeof a.componentDidCatch=="function"&&(cl===null||!cl.has(a))){e=st(l,e),l=Jd(2),a=ul(t,l,2),a!==null&&(Kd(l,a,t,e),_n(a,2),wt(a));break}}t=t.return}}function Vu(e,t,l){var a=e.pingCache;if(a===null){a=e.pingCache=new w0;var n=new Set;a.set(t,n)}else n=a.get(t),n===void 0&&(n=new Set,a.set(t,n));n.has(l)||(Ks=!0,n.add(l),e=O0.bind(null,e,t,l),t.then(e,e))}function O0(e,t,l){var a=e.pingCache;a!==null&&a.delete(t),e.pingedLanes|=e.suspendedLanes&l,e.warmLanes&=~l,ee===e&&(Y&l)===l&&(fe===4||fe===3&&(Y&62914560)===Y&&300>We()-ru?!(Z&2)&&Sa(e,0):$s|=l,va===Y&&(va=0)),wt(e)}function zm(e,t){t===0&&(t=wf()),e=kl(e,t),e!==null&&(_n(e,t),wt(e))}function R0(e){var t=e.memoizedState,l=0;t!==null&&(l=t.retryLane),zm(e,l)}function A0(e,t){var l=0;switch(e.tag){case 31:case 13:var a=e.stateNode,n=e.memoizedState;n!==null&&(l=n.retryLane);break;case 19:a=e.stateNode;break;case 22:a=e.stateNode._retryCache;break;default:throw Error(S(314))}a!==null&&a.delete(t),zm(e,l)}function N0(e,t){return fs(e,t)}var qi=null,Vl=null,Qc=!1,Bi=!1,Zu=!1,tl=0;function wt(e){e!==Vl&&e.next===null&&(Vl===null?qi=Vl=e:Vl=Vl.next=e),Bi=!0,Qc||(Qc=!0,D0())}function Nn(e,t){if(!Zu&&Bi){Zu=!0;do for(var l=!1,a=qi;a!==null;){if(e!==0){var n=a.pendingLanes;if(n===0)var i=0;else{var u=a.suspendedLanes,c=a.pingedLanes;i=(1<<31-Ie(42|e)+1)-1,i&=n&~(u&~c),i=i&201326741?i&201326741|1:i?i|2:0}i!==0&&(l=!0,mr(a,i))}else i=Y,i=Pi(a,a===ee?i:0,a.cancelPendingCommit!==null||a.timeoutHandle!==-1),!(i&3)||Mn(a,i)||(l=!0,mr(a,i));a=a.next}while(l);Zu=!1}}function z0(){Dm()}function Dm(){Bi=Qc=!1;var e=0;tl!==0&&Q0()&&(e=tl);for(var t=We(),l=null,a=qi;a!==null;){var n=a.next,i=Hm(a,t);i===0?(a.next=null,l===null?qi=n:l.next=n,n===null&&(Vl=l)):(l=a,(e!==0||i&3)&&(Bi=!0)),a=n}xe!==0&&xe!==5||Nn(e),tl!==0&&(tl=0)}function Hm(e,t){for(var l=e.suspendedLanes,a=e.pingedLanes,n=e.expirationTimes,i=e.pendingLanes&-62914561;0<i;){var u=31-Ie(i),c=1<<u,s=n[u];s===-1?(!(c&l)||c&a)&&(n[u]=up(c,t)):s<=t&&(e.expiredLanes|=c),i&=~c}if(t=ee,l=Y,l=Pi(e,e===t?l:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),a=e.callbackNode,l===0||e===t&&($===2||$===9)||e.cancelPendingCommit!==null)return a!==null&&a!==null&&Su(a),e.callbackNode=null,e.callbackPriority=0;if(!(l&3)||Mn(e,l)){if(t=l&-l,t===e.callbackPriority)return t;switch(a!==null&&Su(a),ms(l)){case 2:case 8:l=Ef;break;case 32:l=Ei;break;case 268435456:l=Tf;break;default:l=Ei}return a=Um.bind(null,e),l=fs(l,a),e.callbackPriority=t,e.callbackNode=l,t}return a!==null&&a!==null&&Su(a),e.callbackPriority=2,e.callbackNode=null,2}function Um(e,t){if(xe!==0&&xe!==5)return e.callbackNode=null,e.callbackPriority=0,null;var l=e.callbackNode;if(mu()&&e.callbackNode!==l)return null;var a=Y;return a=Pi(e,e===ee?a:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),a===0?null:(xm(e,a,t),Hm(e,We()),e.callbackNode!=null&&e.callbackNode===l?Um.bind(null,e):null)}function mr(e,t){if(mu())return null;xm(e,t,!0)}function D0(){Z0(function(){Z&6?fs(xf,z0):Dm()})}function Fs(){if(tl===0){var e=pa;e===0&&(e=qn,qn<<=1,!(qn&261888)&&(qn=256)),tl=e}return tl}function hr(e){return e==null||typeof e=="symbol"||typeof e=="boolean"?null:typeof e=="function"?e:ni(""+e)}function pr(e,t){var l=t.ownerDocument.createElement("input");return l.name=t.name,l.value=t.value,e.id&&l.setAttribute("form",e.id),t.parentNode.insertBefore(l,t),e=new FormData(e),l.parentNode.removeChild(l),e}function H0(e,t,l,a,n){if(t==="submit"&&l&&l.stateNode===n){var i=hr((n[Xe]||null).action),u=a.submitter;u&&(t=(t=u[Xe]||null)?hr(t.formAction):u.getAttribute("formAction"),t!==null&&(i=t,u=null));var c=new eu("action","action",null,a,n);e.push({event:c,listeners:[{instance:null,listener:function(){if(a.defaultPrevented){if(tl!==0){var s=u?pr(n,u):new FormData(n);Dc(l,{pending:!0,data:s,method:n.method,action:i},null,s)}}else typeof i=="function"&&(c.preventDefault(),s=u?pr(n,u):new FormData(n),Dc(l,{pending:!0,data:s,method:n.method,action:i},i,s))},currentTarget:n}]})}}for(var Ju=0;Ju<Ec.length;Ju++){var Ku=Ec[Ju],U0=Ku.toLowerCase(),L0=Ku[0].toUpperCase()+Ku.slice(1);vt(U0,"on"+L0)}vt(Kf,"onAnimationEnd");vt($f,"onAnimationIteration");vt(Wf,"onAnimationStart");vt("dblclick","onDoubleClick");vt("focusin","onFocus");vt("focusout","onBlur");vt(Pp,"onTransitionRun");vt(e0,"onTransitionStart");vt(t0,"onTransitionCancel");vt(Ff,"onTransitionEnd");ma("onMouseEnter",["mouseout","mouseover"]);ma("onMouseLeave",["mouseout","mouseover"]);ma("onPointerEnter",["pointerout","pointerover"]);ma("onPointerLeave",["pointerout","pointerover"]);Hl("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));Hl("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));Hl("onBeforeInput",["compositionend","keypress","textInput","paste"]);Hl("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));Hl("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));Hl("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var gn="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),k0=new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(gn));function Lm(e,t){t=(t&4)!==0;for(var l=0;l<e.length;l++){var a=e[l],n=a.event;a=a.listeners;e:{var i=void 0;if(t)for(var u=a.length-1;0<=u;u--){var c=a[u],s=c.instance,r=c.currentTarget;if(c=c.listener,s!==i&&n.isPropagationStopped())break e;i=c,n.currentTarget=r;try{i(n)}catch(p){wi(p)}n.currentTarget=null,i=s}else for(u=0;u<a.length;u++){if(c=a[u],s=c.instance,r=c.currentTarget,c=c.listener,s!==i&&n.isPropagationStopped())break e;i=c,n.currentTarget=r;try{i(n)}catch(p){wi(p)}n.currentTarget=null,i=s}}}}function q(e,t){var l=t[hc];l===void 0&&(l=t[hc]=new Set);var a=e+"__bubble";l.has(a)||(km(t,e,2,!1),l.add(a))}function $u(e,t,l){var a=0;t&&(a|=4),km(l,e,a,t)}var $n="_reactListening"+Math.random().toString(36).slice(2);function Is(e){if(!e[$n]){e[$n]=!0,Of.forEach(function(l){l!=="selectionchange"&&(k0.has(l)||$u(l,!1,e),$u(l,!0,e))});var t=e.nodeType===9?e:e.ownerDocument;t===null||t[$n]||(t[$n]=!0,$u("selectionchange",!1,t))}}function km(e,t,l,a){switch(Fm(t)){case 2:var n=dy;break;case 8:n=my;break;default:n=lo}l=n.bind(null,t,l,e),n=void 0,!bc||t!=="touchstart"&&t!=="touchmove"&&t!=="wheel"||(n=!0),a?n!==void 0?e.addEventListener(t,l,{capture:!0,passive:n}):e.addEventListener(t,l,!0):n!==void 0?e.addEventListener(t,l,{passive:n}):e.addEventListener(t,l,!1)}function Wu(e,t,l,a,n){var i=a;if(!(t&1)&&!(t&2)&&a!==null)e:for(;;){if(a===null)return;var u=a.tag;if(u===3||u===4){var c=a.stateNode.containerInfo;if(c===n)break;if(u===4)for(u=a.return;u!==null;){var s=u.tag;if((s===3||s===4)&&u.stateNode.containerInfo===n)return;u=u.return}for(;c!==null;){if(u=Kl(c),u===null)return;if(s=u.tag,s===5||s===6||s===26||s===27){a=i=u;continue e}c=c.parentNode}}a=a.return}Lf(function(){var r=i,p=ys(l),y=[];e:{var m=If.get(e);if(m!==void 0){var g=eu,x=e;switch(e){case"keypress":if(ui(l)===0)break e;case"keydown":case"keyup":g=Ap;break;case"focusin":x="focus",g=Mu;break;case"focusout":x="blur",g=Mu;break;case"beforeblur":case"afterblur":g=Mu;break;case"click":if(l.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":g=To;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":g=bp;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":g=Dp;break;case Kf:case $f:case Wf:g=Ep;break;case Ff:g=Up;break;case"scroll":case"scrollend":g=gp;break;case"wheel":g=kp;break;case"copy":case"cut":case"paste":g=wp;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":g=Mo;break;case"toggle":case"beforetoggle":g=Bp}var _=(t&4)!==0,A=!_&&(e==="scroll"||e==="scrollend"),d=_?m!==null?m+"Capture":null:m;_=[];for(var f=r,h;f!==null;){var v=f;if(h=v.stateNode,v=v.tag,v!==5&&v!==26&&v!==27||h===null||d===null||(v=on(f,d),v!=null&&_.push(vn(f,v,h))),A)break;f=f.return}0<_.length&&(m=new g(m,x,null,l,p),y.push({event:m,listeners:_}))}}if(!(t&7)){e:{if(m=e==="mouseover"||e==="pointerover",g=e==="mouseout"||e==="pointerout",m&&l!==vc&&(x=l.relatedTarget||l.fromElement)&&(Kl(x)||x[wa]))break e;if((g||m)&&(m=p.window===p?p:(m=p.ownerDocument)?m.defaultView||m.parentWindow:window,g?(x=l.relatedTarget||l.toElement,g=r,x=x?Kl(x):null,x!==null&&(A=Tn(x),_=x.tag,x!==A||_!==5&&_!==27&&_!==6)&&(x=null)):(g=null,x=r),g!==x)){if(_=To,v="onMouseLeave",d="onMouseEnter",f="mouse",(e==="pointerout"||e==="pointerover")&&(_=Mo,v="onPointerLeave",d="onPointerEnter",f="pointer"),A=g==null?m:Ba(g),h=x==null?m:Ba(x),m=new _(v,f+"leave",g,l,p),m.target=A,m.relatedTarget=h,v=null,Kl(p)===r&&(_=new _(d,f+"enter",x,l,p),_.target=h,_.relatedTarget=A,v=_),A=v,g&&x)t:{for(_=q0,d=g,f=x,h=0,v=d;v;v=_(v))h++;v=0;for(var T=f;T;T=_(T))v++;for(;0<h-v;)d=_(d),h--;for(;0<v-h;)f=_(f),v--;for(;h--;){if(d===f||f!==null&&d===f.alternate){_=d;break t}d=_(d),f=_(f)}_=null}else _=null;g!==null&&yr(y,m,g,_,!1),x!==null&&A!==null&&yr(y,A,x,_,!0)}}e:{if(m=r?Ba(r):window,g=m.nodeName&&m.nodeName.toLowerCase(),g==="select"||g==="input"&&m.type==="file")var j=Oo;else if(Co(m))if(Xf)j=Wp;else{j=Kp;var E=Jp}else g=m.nodeName,!g||g.toLowerCase()!=="input"||m.type!=="checkbox"&&m.type!=="radio"?r&&ps(r.elementType)&&(j=Oo):j=$p;if(j&&(j=j(e,r))){Gf(y,j,l,p);break e}E&&E(e,m,r),e==="focusout"&&r&&m.type==="number"&&r.memoizedProps.value!=null&&gc(m,"number",m.value)}switch(E=r?Ba(r):window,e){case"focusin":(Co(E)||E.contentEditable==="true")&&(Fl=E,Sc=r,$a=null);break;case"focusout":$a=Sc=Fl=null;break;case"mousedown":xc=!0;break;case"contextmenu":case"mouseup":case"dragend":xc=!1,Do(y,l,p);break;case"selectionchange":if(Ip)break;case"keydown":case"keyup":Do(y,l,p)}var O;if(bs)e:{switch(e){case"compositionstart":var C="onCompositionStart";break e;case"compositionend":C="onCompositionEnd";break e;case"compositionupdate":C="onCompositionUpdate";break e}C=void 0}else Wl?Bf(e,l)&&(C="onCompositionEnd"):e==="keydown"&&l.keyCode===229&&(C="onCompositionStart");C&&(qf&&l.locale!=="ko"&&(Wl||C!=="onCompositionStart"?C==="onCompositionEnd"&&Wl&&(O=kf()):(It=p,gs="value"in It?It.value:It.textContent,Wl=!0)),E=Yi(r,C),0<E.length&&(C=new wo(C,e,null,l,p),y.push({event:C,listeners:E}),O?C.data=O:(O=Yf(l),O!==null&&(C.data=O)))),(O=Gp?Xp(e,l):Qp(e,l))&&(C=Yi(r,"onBeforeInput"),0<C.length&&(E=new wo("onBeforeInput","beforeinput",null,l,p),y.push({event:E,listeners:C}),E.data=O)),H0(y,e,r,l,p)}Lm(y,t)})}function vn(e,t,l){return{instance:e,listener:t,currentTarget:l}}function Yi(e,t){for(var l=t+"Capture",a=[];e!==null;){var n=e,i=n.stateNode;if(n=n.tag,n!==5&&n!==26&&n!==27||i===null||(n=on(e,l),n!=null&&a.unshift(vn(e,n,i)),n=on(e,t),n!=null&&a.push(vn(e,n,i))),e.tag===3)return a;e=e.return}return[]}function q0(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5&&e.tag!==27);return e||null}function yr(e,t,l,a,n){for(var i=t._reactName,u=[];l!==null&&l!==a;){var c=l,s=c.alternate,r=c.stateNode;if(c=c.tag,s!==null&&s===a)break;c!==5&&c!==26&&c!==27||r===null||(s=r,n?(r=on(l,i),r!=null&&u.unshift(vn(l,r,s))):n||(r=on(l,i),r!=null&&u.push(vn(l,r,s)))),l=l.return}u.length!==0&&e.push({event:t,listeners:u})}var B0=/\r\n?/g,Y0=/\u0000|\uFFFD/g;function gr(e){return(typeof e=="string"?e:""+e).replace(B0,`
`).replace(Y0,"")}function qm(e,t){return t=gr(t),gr(e)===t}function I(e,t,l,a,n,i){switch(l){case"children":typeof a=="string"?t==="body"||t==="textarea"&&a===""||ha(e,a):(typeof a=="number"||typeof a=="bigint")&&t!=="body"&&ha(e,""+a);break;case"className":Gn(e,"class",a);break;case"tabIndex":Gn(e,"tabindex",a);break;case"dir":case"role":case"viewBox":case"width":case"height":Gn(e,l,a);break;case"style":Uf(e,a,i);break;case"data":if(t!=="object"){Gn(e,"data",a);break}case"src":case"href":if(a===""&&(t!=="a"||l!=="href")){e.removeAttribute(l);break}if(a==null||typeof a=="function"||typeof a=="symbol"||typeof a=="boolean"){e.removeAttribute(l);break}a=ni(""+a),e.setAttribute(l,a);break;case"action":case"formAction":if(typeof a=="function"){e.setAttribute(l,"javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");break}else typeof i=="function"&&(l==="formAction"?(t!=="input"&&I(e,t,"name",n.name,n,null),I(e,t,"formEncType",n.formEncType,n,null),I(e,t,"formMethod",n.formMethod,n,null),I(e,t,"formTarget",n.formTarget,n,null)):(I(e,t,"encType",n.encType,n,null),I(e,t,"method",n.method,n,null),I(e,t,"target",n.target,n,null)));if(a==null||typeof a=="symbol"||typeof a=="boolean"){e.removeAttribute(l);break}a=ni(""+a),e.setAttribute(l,a);break;case"onClick":a!=null&&(e.onclick=zt);break;case"onScroll":a!=null&&q("scroll",e);break;case"onScrollEnd":a!=null&&q("scrollend",e);break;case"dangerouslySetInnerHTML":if(a!=null){if(typeof a!="object"||!("__html"in a))throw Error(S(61));if(l=a.__html,l!=null){if(n.children!=null)throw Error(S(60));e.innerHTML=l}}break;case"multiple":e.multiple=a&&typeof a!="function"&&typeof a!="symbol";break;case"muted":e.muted=a&&typeof a!="function"&&typeof a!="symbol";break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"defaultValue":case"defaultChecked":case"innerHTML":case"ref":break;case"autoFocus":break;case"xlinkHref":if(a==null||typeof a=="function"||typeof a=="boolean"||typeof a=="symbol"){e.removeAttribute("xlink:href");break}l=ni(""+a),e.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",l);break;case"contentEditable":case"spellCheck":case"draggable":case"value":case"autoReverse":case"externalResourcesRequired":case"focusable":case"preserveAlpha":a!=null&&typeof a!="function"&&typeof a!="symbol"?e.setAttribute(l,""+a):e.removeAttribute(l);break;case"inert":case"allowFullScreen":case"async":case"autoPlay":case"controls":case"default":case"defer":case"disabled":case"disablePictureInPicture":case"disableRemotePlayback":case"formNoValidate":case"hidden":case"loop":case"noModule":case"noValidate":case"open":case"playsInline":case"readOnly":case"required":case"reversed":case"scoped":case"seamless":case"itemScope":a&&typeof a!="function"&&typeof a!="symbol"?e.setAttribute(l,""):e.removeAttribute(l);break;case"capture":case"download":a===!0?e.setAttribute(l,""):a!==!1&&a!=null&&typeof a!="function"&&typeof a!="symbol"?e.setAttribute(l,a):e.removeAttribute(l);break;case"cols":case"rows":case"size":case"span":a!=null&&typeof a!="function"&&typeof a!="symbol"&&!isNaN(a)&&1<=a?e.setAttribute(l,a):e.removeAttribute(l);break;case"rowSpan":case"start":a==null||typeof a=="function"||typeof a=="symbol"||isNaN(a)?e.removeAttribute(l):e.setAttribute(l,a);break;case"popover":q("beforetoggle",e),q("toggle",e),ai(e,"popover",a);break;case"xlinkActuate":Mt(e,"http://www.w3.org/1999/xlink","xlink:actuate",a);break;case"xlinkArcrole":Mt(e,"http://www.w3.org/1999/xlink","xlink:arcrole",a);break;case"xlinkRole":Mt(e,"http://www.w3.org/1999/xlink","xlink:role",a);break;case"xlinkShow":Mt(e,"http://www.w3.org/1999/xlink","xlink:show",a);break;case"xlinkTitle":Mt(e,"http://www.w3.org/1999/xlink","xlink:title",a);break;case"xlinkType":Mt(e,"http://www.w3.org/1999/xlink","xlink:type",a);break;case"xmlBase":Mt(e,"http://www.w3.org/XML/1998/namespace","xml:base",a);break;case"xmlLang":Mt(e,"http://www.w3.org/XML/1998/namespace","xml:lang",a);break;case"xmlSpace":Mt(e,"http://www.w3.org/XML/1998/namespace","xml:space",a);break;case"is":ai(e,"is",a);break;case"innerText":case"textContent":break;default:(!(2<l.length)||l[0]!=="o"&&l[0]!=="O"||l[1]!=="n"&&l[1]!=="N")&&(l=pp.get(l)||l,ai(e,l,a))}}function Vc(e,t,l,a,n,i){switch(l){case"style":Uf(e,a,i);break;case"dangerouslySetInnerHTML":if(a!=null){if(typeof a!="object"||!("__html"in a))throw Error(S(61));if(l=a.__html,l!=null){if(n.children!=null)throw Error(S(60));e.innerHTML=l}}break;case"children":typeof a=="string"?ha(e,a):(typeof a=="number"||typeof a=="bigint")&&ha(e,""+a);break;case"onScroll":a!=null&&q("scroll",e);break;case"onScrollEnd":a!=null&&q("scrollend",e);break;case"onClick":a!=null&&(e.onclick=zt);break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"innerHTML":case"ref":break;case"innerText":case"textContent":break;default:if(!Rf.hasOwnProperty(l))e:{if(l[0]==="o"&&l[1]==="n"&&(n=l.endsWith("Capture"),t=l.slice(2,n?l.length-7:void 0),i=e[Xe]||null,i=i!=null?i[l]:null,typeof i=="function"&&e.removeEventListener(t,i,n),typeof a=="function")){typeof i!="function"&&i!==null&&(l in e?e[l]=null:e.hasAttribute(l)&&e.removeAttribute(l)),e.addEventListener(t,a,n);break e}l in e?e[l]=a:a===!0?e.setAttribute(l,""):ai(e,l,a)}}}function Re(e,t,l){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"img":q("error",e),q("load",e);var a=!1,n=!1,i;for(i in l)if(l.hasOwnProperty(i)){var u=l[i];if(u!=null)switch(i){case"src":a=!0;break;case"srcSet":n=!0;break;case"children":case"dangerouslySetInnerHTML":throw Error(S(137,t));default:I(e,t,i,u,l,null)}}n&&I(e,t,"srcSet",l.srcSet,l,null),a&&I(e,t,"src",l.src,l,null);return;case"input":q("invalid",e);var c=i=u=n=null,s=null,r=null;for(a in l)if(l.hasOwnProperty(a)){var p=l[a];if(p!=null)switch(a){case"name":n=p;break;case"type":u=p;break;case"checked":s=p;break;case"defaultChecked":r=p;break;case"value":i=p;break;case"defaultValue":c=p;break;case"children":case"dangerouslySetInnerHTML":if(p!=null)throw Error(S(137,t));break;default:I(e,t,a,p,l,null)}}zf(e,i,c,s,r,u,n,!1);return;case"select":q("invalid",e),a=u=i=null;for(n in l)if(l.hasOwnProperty(n)&&(c=l[n],c!=null))switch(n){case"value":i=c;break;case"defaultValue":u=c;break;case"multiple":a=c;default:I(e,t,n,c,l,null)}t=i,l=u,e.multiple=!!a,t!=null?ua(e,!!a,t,!1):l!=null&&ua(e,!!a,l,!0);return;case"textarea":q("invalid",e),i=n=a=null;for(u in l)if(l.hasOwnProperty(u)&&(c=l[u],c!=null))switch(u){case"value":a=c;break;case"defaultValue":n=c;break;case"children":i=c;break;case"dangerouslySetInnerHTML":if(c!=null)throw Error(S(91));break;default:I(e,t,u,c,l,null)}Hf(e,a,n,i);return;case"option":for(s in l)if(l.hasOwnProperty(s)&&(a=l[s],a!=null))switch(s){case"selected":e.selected=a&&typeof a!="function"&&typeof a!="symbol";break;default:I(e,t,s,a,l,null)}return;case"dialog":q("beforetoggle",e),q("toggle",e),q("cancel",e),q("close",e);break;case"iframe":case"object":q("load",e);break;case"video":case"audio":for(a=0;a<gn.length;a++)q(gn[a],e);break;case"image":q("error",e),q("load",e);break;case"details":q("toggle",e);break;case"embed":case"source":case"link":q("error",e),q("load",e);case"area":case"base":case"br":case"col":case"hr":case"keygen":case"meta":case"param":case"track":case"wbr":case"menuitem":for(r in l)if(l.hasOwnProperty(r)&&(a=l[r],a!=null))switch(r){case"children":case"dangerouslySetInnerHTML":throw Error(S(137,t));default:I(e,t,r,a,l,null)}return;default:if(ps(t)){for(p in l)l.hasOwnProperty(p)&&(a=l[p],a!==void 0&&Vc(e,t,p,a,l,void 0));return}}for(c in l)l.hasOwnProperty(c)&&(a=l[c],a!=null&&I(e,t,c,a,l,null))}function G0(e,t,l,a){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"input":var n=null,i=null,u=null,c=null,s=null,r=null,p=null;for(g in l){var y=l[g];if(l.hasOwnProperty(g)&&y!=null)switch(g){case"checked":break;case"value":break;case"defaultValue":s=y;default:a.hasOwnProperty(g)||I(e,t,g,null,a,y)}}for(var m in a){var g=a[m];if(y=l[m],a.hasOwnProperty(m)&&(g!=null||y!=null))switch(m){case"type":i=g;break;case"name":n=g;break;case"checked":r=g;break;case"defaultChecked":p=g;break;case"value":u=g;break;case"defaultValue":c=g;break;case"children":case"dangerouslySetInnerHTML":if(g!=null)throw Error(S(137,t));break;default:g!==y&&I(e,t,m,g,a,y)}}yc(e,u,c,s,r,p,i,n);return;case"select":g=u=c=m=null;for(i in l)if(s=l[i],l.hasOwnProperty(i)&&s!=null)switch(i){case"value":break;case"multiple":g=s;default:a.hasOwnProperty(i)||I(e,t,i,null,a,s)}for(n in a)if(i=a[n],s=l[n],a.hasOwnProperty(n)&&(i!=null||s!=null))switch(n){case"value":m=i;break;case"defaultValue":c=i;break;case"multiple":u=i;default:i!==s&&I(e,t,n,i,a,s)}t=c,l=u,a=g,m!=null?ua(e,!!l,m,!1):!!a!=!!l&&(t!=null?ua(e,!!l,t,!0):ua(e,!!l,l?[]:"",!1));return;case"textarea":g=m=null;for(c in l)if(n=l[c],l.hasOwnProperty(c)&&n!=null&&!a.hasOwnProperty(c))switch(c){case"value":break;case"children":break;default:I(e,t,c,null,a,n)}for(u in a)if(n=a[u],i=l[u],a.hasOwnProperty(u)&&(n!=null||i!=null))switch(u){case"value":m=n;break;case"defaultValue":g=n;break;case"children":break;case"dangerouslySetInnerHTML":if(n!=null)throw Error(S(91));break;default:n!==i&&I(e,t,u,n,a,i)}Df(e,m,g);return;case"option":for(var x in l)if(m=l[x],l.hasOwnProperty(x)&&m!=null&&!a.hasOwnProperty(x))switch(x){case"selected":e.selected=!1;break;default:I(e,t,x,null,a,m)}for(s in a)if(m=a[s],g=l[s],a.hasOwnProperty(s)&&m!==g&&(m!=null||g!=null))switch(s){case"selected":e.selected=m&&typeof m!="function"&&typeof m!="symbol";break;default:I(e,t,s,m,a,g)}return;case"img":case"link":case"area":case"base":case"br":case"col":case"embed":case"hr":case"keygen":case"meta":case"param":case"source":case"track":case"wbr":case"menuitem":for(var _ in l)m=l[_],l.hasOwnProperty(_)&&m!=null&&!a.hasOwnProperty(_)&&I(e,t,_,null,a,m);for(r in a)if(m=a[r],g=l[r],a.hasOwnProperty(r)&&m!==g&&(m!=null||g!=null))switch(r){case"children":case"dangerouslySetInnerHTML":if(m!=null)throw Error(S(137,t));break;default:I(e,t,r,m,a,g)}return;default:if(ps(t)){for(var A in l)m=l[A],l.hasOwnProperty(A)&&m!==void 0&&!a.hasOwnProperty(A)&&Vc(e,t,A,void 0,a,m);for(p in a)m=a[p],g=l[p],!a.hasOwnProperty(p)||m===g||m===void 0&&g===void 0||Vc(e,t,p,m,a,g);return}}for(var d in l)m=l[d],l.hasOwnProperty(d)&&m!=null&&!a.hasOwnProperty(d)&&I(e,t,d,null,a,m);for(y in a)m=a[y],g=l[y],!a.hasOwnProperty(y)||m===g||m==null&&g==null||I(e,t,y,m,a,g)}function vr(e){switch(e){case"css":case"script":case"font":case"img":case"image":case"input":case"link":return!0;default:return!1}}function X0(){if(typeof performance.getEntriesByType=="function"){for(var e=0,t=0,l=performance.getEntriesByType("resource"),a=0;a<l.length;a++){var n=l[a],i=n.transferSize,u=n.initiatorType,c=n.duration;if(i&&c&&vr(u)){for(u=0,c=n.responseEnd,a+=1;a<l.length;a++){var s=l[a],r=s.startTime;if(r>c)break;var p=s.transferSize,y=s.initiatorType;p&&vr(y)&&(s=s.responseEnd,u+=p*(s<c?1:(c-r)/(s-r)))}if(--a,t+=8*(i+u)/(n.duration/1e3),e++,10<e)break}}if(0<e)return t/e/1e6}return navigator.connection&&(e=navigator.connection.downlink,typeof e=="number")?e:5}var Zc=null,Jc=null;function Gi(e){return e.nodeType===9?e:e.ownerDocument}function br(e){switch(e){case"http://www.w3.org/2000/svg":return 1;case"http://www.w3.org/1998/Math/MathML":return 2;default:return 0}}function Bm(e,t){if(e===0)switch(t){case"svg":return 1;case"math":return 2;default:return 0}return e===1&&t==="foreignObject"?0:e}function Kc(e,t){return e==="textarea"||e==="noscript"||typeof t.children=="string"||typeof t.children=="number"||typeof t.children=="bigint"||typeof t.dangerouslySetInnerHTML=="object"&&t.dangerouslySetInnerHTML!==null&&t.dangerouslySetInnerHTML.__html!=null}var Fu=null;function Q0(){var e=window.event;return e&&e.type==="popstate"?e===Fu?!1:(Fu=e,!0):(Fu=null,!1)}var Ym=typeof setTimeout=="function"?setTimeout:void 0,V0=typeof clearTimeout=="function"?clearTimeout:void 0,Sr=typeof Promise=="function"?Promise:void 0,Z0=typeof queueMicrotask=="function"?queueMicrotask:typeof Sr<"u"?function(e){return Sr.resolve(null).then(e).catch(J0)}:Ym;function J0(e){setTimeout(function(){throw e})}function vl(e){return e==="head"}function xr(e,t){var l=t,a=0;do{var n=l.nextSibling;if(e.removeChild(l),n&&n.nodeType===8)if(l=n.data,l==="/$"||l==="/&"){if(a===0){e.removeChild(n),Ea(t);return}a--}else if(l==="$"||l==="$?"||l==="$~"||l==="$!"||l==="&")a++;else if(l==="html")un(e.ownerDocument.documentElement);else if(l==="head"){l=e.ownerDocument.head,un(l);for(var i=l.firstChild;i;){var u=i.nextSibling,c=i.nodeName;i[jn]||c==="SCRIPT"||c==="STYLE"||c==="LINK"&&i.rel.toLowerCase()==="stylesheet"||l.removeChild(i),i=u}}else l==="body"&&un(e.ownerDocument.body);l=n}while(l);Ea(t)}function Er(e,t){var l=e;e=0;do{var a=l.nextSibling;if(l.nodeType===1?t?(l._stashedDisplay=l.style.display,l.style.display="none"):(l.style.display=l._stashedDisplay||"",l.getAttribute("style")===""&&l.removeAttribute("style")):l.nodeType===3&&(t?(l._stashedText=l.nodeValue,l.nodeValue=""):l.nodeValue=l._stashedText||""),a&&a.nodeType===8)if(l=a.data,l==="/$"){if(e===0)break;e--}else l!=="$"&&l!=="$?"&&l!=="$~"&&l!=="$!"||e++;l=a}while(l)}function $c(e){var t=e.firstChild;for(t&&t.nodeType===10&&(t=t.nextSibling);t;){var l=t;switch(t=t.nextSibling,l.nodeName){case"HTML":case"HEAD":case"BODY":$c(l),hs(l);continue;case"SCRIPT":case"STYLE":continue;case"LINK":if(l.rel.toLowerCase()==="stylesheet")continue}e.removeChild(l)}}function K0(e,t,l,a){for(;e.nodeType===1;){var n=l;if(e.nodeName.toLowerCase()!==t.toLowerCase()){if(!a&&(e.nodeName!=="INPUT"||e.type!=="hidden"))break}else if(a){if(!e[jn])switch(t){case"meta":if(!e.hasAttribute("itemprop"))break;return e;case"link":if(i=e.getAttribute("rel"),i==="stylesheet"&&e.hasAttribute("data-precedence"))break;if(i!==n.rel||e.getAttribute("href")!==(n.href==null||n.href===""?null:n.href)||e.getAttribute("crossorigin")!==(n.crossOrigin==null?null:n.crossOrigin)||e.getAttribute("title")!==(n.title==null?null:n.title))break;return e;case"style":if(e.hasAttribute("data-precedence"))break;return e;case"script":if(i=e.getAttribute("src"),(i!==(n.src==null?null:n.src)||e.getAttribute("type")!==(n.type==null?null:n.type)||e.getAttribute("crossorigin")!==(n.crossOrigin==null?null:n.crossOrigin))&&i&&e.hasAttribute("async")&&!e.hasAttribute("itemprop"))break;return e;default:return e}}else if(t==="input"&&e.type==="hidden"){var i=n.name==null?null:""+n.name;if(n.type==="hidden"&&e.getAttribute("name")===i)return e}else return e;if(e=dt(e.nextSibling),e===null)break}return null}function $0(e,t,l){if(t==="")return null;for(;e.nodeType!==3;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!l||(e=dt(e.nextSibling),e===null))return null;return e}function Gm(e,t){for(;e.nodeType!==8;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!t||(e=dt(e.nextSibling),e===null))return null;return e}function Wc(e){return e.data==="$?"||e.data==="$~"}function Fc(e){return e.data==="$!"||e.data==="$?"&&e.ownerDocument.readyState!=="loading"}function W0(e,t){var l=e.ownerDocument;if(e.data==="$~")e._reactRetry=t;else if(e.data!=="$?"||l.readyState!=="loading")t();else{var a=function(){t(),l.removeEventListener("DOMContentLoaded",a)};l.addEventListener("DOMContentLoaded",a),e._reactRetry=a}}function dt(e){for(;e!=null;e=e.nextSibling){var t=e.nodeType;if(t===1||t===3)break;if(t===8){if(t=e.data,t==="$"||t==="$!"||t==="$?"||t==="$~"||t==="&"||t==="F!"||t==="F")break;if(t==="/$"||t==="/&")return null}}return e}var Ic=null;function Tr(e){e=e.nextSibling;for(var t=0;e;){if(e.nodeType===8){var l=e.data;if(l==="/$"||l==="/&"){if(t===0)return dt(e.nextSibling);t--}else l!=="$"&&l!=="$!"&&l!=="$?"&&l!=="$~"&&l!=="&"||t++}e=e.nextSibling}return null}function wr(e){e=e.previousSibling;for(var t=0;e;){if(e.nodeType===8){var l=e.data;if(l==="$"||l==="$!"||l==="$?"||l==="$~"||l==="&"){if(t===0)return e;t--}else l!=="/$"&&l!=="/&"||t++}e=e.previousSibling}return null}function Xm(e,t,l){switch(t=Gi(l),e){case"html":if(e=t.documentElement,!e)throw Error(S(452));return e;case"head":if(e=t.head,!e)throw Error(S(453));return e;case"body":if(e=t.body,!e)throw Error(S(454));return e;default:throw Error(S(451))}}function un(e){for(var t=e.attributes;t.length;)e.removeAttributeNode(t[0]);hs(e)}var mt=new Map,Mr=new Set;function Xi(e){return typeof e.getRootNode=="function"?e.getRootNode():e.nodeType===9?e:e.ownerDocument}var Xt=J.d;J.d={f:F0,r:I0,D:P0,C:ey,L:ty,m:ly,X:ny,S:ay,M:iy};function F0(){var e=Xt.f(),t=fu();return e||t}function I0(e){var t=Ma(e);t!==null&&t.tag===5&&t.type==="form"?Ud(t):Xt.r(e)}var Oa=typeof document>"u"?null:document;function Qm(e,t,l){var a=Oa;if(a&&typeof t=="string"&&t){var n=ct(t);n='link[rel="'+e+'"][href="'+n+'"]',typeof l=="string"&&(n+='[crossorigin="'+l+'"]'),Mr.has(n)||(Mr.add(n),e={rel:e,crossOrigin:l,href:t},a.querySelector(n)===null&&(t=a.createElement("link"),Re(t,"link",e),we(t),a.head.appendChild(t)))}}function P0(e){Xt.D(e),Qm("dns-prefetch",e,null)}function ey(e,t){Xt.C(e,t),Qm("preconnect",e,t)}function ty(e,t,l){Xt.L(e,t,l);var a=Oa;if(a&&e&&t){var n='link[rel="preload"][as="'+ct(t)+'"]';t==="image"&&l&&l.imageSrcSet?(n+='[imagesrcset="'+ct(l.imageSrcSet)+'"]',typeof l.imageSizes=="string"&&(n+='[imagesizes="'+ct(l.imageSizes)+'"]')):n+='[href="'+ct(e)+'"]';var i=n;switch(t){case"style":i=xa(e);break;case"script":i=Ra(e)}mt.has(i)||(e=ue({rel:"preload",href:t==="image"&&l&&l.imageSrcSet?void 0:e,as:t},l),mt.set(i,e),a.querySelector(n)!==null||t==="style"&&a.querySelector(zn(i))||t==="script"&&a.querySelector(Dn(i))||(t=a.createElement("link"),Re(t,"link",e),we(t),a.head.appendChild(t)))}}function ly(e,t){Xt.m(e,t);var l=Oa;if(l&&e){var a=t&&typeof t.as=="string"?t.as:"script",n='link[rel="modulepreload"][as="'+ct(a)+'"][href="'+ct(e)+'"]',i=n;switch(a){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":i=Ra(e)}if(!mt.has(i)&&(e=ue({rel:"modulepreload",href:e},t),mt.set(i,e),l.querySelector(n)===null)){switch(a){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":if(l.querySelector(Dn(i)))return}a=l.createElement("link"),Re(a,"link",e),we(a),l.head.appendChild(a)}}}function ay(e,t,l){Xt.S(e,t,l);var a=Oa;if(a&&e){var n=ia(a).hoistableStyles,i=xa(e);t=t||"default";var u=n.get(i);if(!u){var c={loading:0,preload:null};if(u=a.querySelector(zn(i)))c.loading=5;else{e=ue({rel:"stylesheet",href:e,"data-precedence":t},l),(l=mt.get(i))&&Ps(e,l);var s=u=a.createElement("link");we(s),Re(s,"link",e),s._p=new Promise(function(r,p){s.onload=r,s.onerror=p}),s.addEventListener("load",function(){c.loading|=1}),s.addEventListener("error",function(){c.loading|=2}),c.loading|=4,hi(u,t,a)}u={type:"stylesheet",instance:u,count:1,state:c},n.set(i,u)}}}function ny(e,t){Xt.X(e,t);var l=Oa;if(l&&e){var a=ia(l).hoistableScripts,n=Ra(e),i=a.get(n);i||(i=l.querySelector(Dn(n)),i||(e=ue({src:e,async:!0},t),(t=mt.get(n))&&eo(e,t),i=l.createElement("script"),we(i),Re(i,"link",e),l.head.appendChild(i)),i={type:"script",instance:i,count:1,state:null},a.set(n,i))}}function iy(e,t){Xt.M(e,t);var l=Oa;if(l&&e){var a=ia(l).hoistableScripts,n=Ra(e),i=a.get(n);i||(i=l.querySelector(Dn(n)),i||(e=ue({src:e,async:!0,type:"module"},t),(t=mt.get(n))&&eo(e,t),i=l.createElement("script"),we(i),Re(i,"link",e),l.head.appendChild(i)),i={type:"script",instance:i,count:1,state:null},a.set(n,i))}}function _r(e,t,l,a){var n=(n=al.current)?Xi(n):null;if(!n)throw Error(S(446));switch(e){case"meta":case"title":return null;case"style":return typeof l.precedence=="string"&&typeof l.href=="string"?(t=xa(l.href),l=ia(n).hoistableStyles,a=l.get(t),a||(a={type:"style",instance:null,count:0,state:null},l.set(t,a)),a):{type:"void",instance:null,count:0,state:null};case"link":if(l.rel==="stylesheet"&&typeof l.href=="string"&&typeof l.precedence=="string"){e=xa(l.href);var i=ia(n).hoistableStyles,u=i.get(e);if(u||(n=n.ownerDocument||n,u={type:"stylesheet",instance:null,count:0,state:{loading:0,preload:null}},i.set(e,u),(i=n.querySelector(zn(e)))&&!i._p&&(u.instance=i,u.state.loading=5),mt.has(e)||(l={rel:"preload",as:"style",href:l.href,crossOrigin:l.crossOrigin,integrity:l.integrity,media:l.media,hrefLang:l.hrefLang,referrerPolicy:l.referrerPolicy},mt.set(e,l),i||uy(n,e,l,u.state))),t&&a===null)throw Error(S(528,""));return u}if(t&&a!==null)throw Error(S(529,""));return null;case"script":return t=l.async,l=l.src,typeof l=="string"&&t&&typeof t!="function"&&typeof t!="symbol"?(t=Ra(l),l=ia(n).hoistableScripts,a=l.get(t),a||(a={type:"script",instance:null,count:0,state:null},l.set(t,a)),a):{type:"void",instance:null,count:0,state:null};default:throw Error(S(444,e))}}function xa(e){return'href="'+ct(e)+'"'}function zn(e){return'link[rel="stylesheet"]['+e+"]"}function Vm(e){return ue({},e,{"data-precedence":e.precedence,precedence:null})}function uy(e,t,l,a){e.querySelector('link[rel="preload"][as="style"]['+t+"]")?a.loading=1:(t=e.createElement("link"),a.preload=t,t.addEventListener("load",function(){return a.loading|=1}),t.addEventListener("error",function(){return a.loading|=2}),Re(t,"link",l),we(t),e.head.appendChild(t))}function Ra(e){return'[src="'+ct(e)+'"]'}function Dn(e){return"script[async]"+e}function jr(e,t,l){if(t.count++,t.instance===null)switch(t.type){case"style":var a=e.querySelector('style[data-href~="'+ct(l.href)+'"]');if(a)return t.instance=a,we(a),a;var n=ue({},l,{"data-href":l.href,"data-precedence":l.precedence,href:null,precedence:null});return a=(e.ownerDocument||e).createElement("style"),we(a),Re(a,"style",n),hi(a,l.precedence,e),t.instance=a;case"stylesheet":n=xa(l.href);var i=e.querySelector(zn(n));if(i)return t.state.loading|=4,t.instance=i,we(i),i;a=Vm(l),(n=mt.get(n))&&Ps(a,n),i=(e.ownerDocument||e).createElement("link"),we(i);var u=i;return u._p=new Promise(function(c,s){u.onload=c,u.onerror=s}),Re(i,"link",a),t.state.loading|=4,hi(i,l.precedence,e),t.instance=i;case"script":return i=Ra(l.src),(n=e.querySelector(Dn(i)))?(t.instance=n,we(n),n):(a=l,(n=mt.get(i))&&(a=ue({},l),eo(a,n)),e=e.ownerDocument||e,n=e.createElement("script"),we(n),Re(n,"link",a),e.head.appendChild(n),t.instance=n);case"void":return null;default:throw Error(S(443,t.type))}else t.type==="stylesheet"&&!(t.state.loading&4)&&(a=t.instance,t.state.loading|=4,hi(a,l.precedence,e));return t.instance}function hi(e,t,l){for(var a=l.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'),n=a.length?a[a.length-1]:null,i=n,u=0;u<a.length;u++){var c=a[u];if(c.dataset.precedence===t)i=c;else if(i!==n)break}i?i.parentNode.insertBefore(e,i.nextSibling):(t=l.nodeType===9?l.head:l,t.insertBefore(e,t.firstChild))}function Ps(e,t){e.crossOrigin==null&&(e.crossOrigin=t.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=t.referrerPolicy),e.title==null&&(e.title=t.title)}function eo(e,t){e.crossOrigin==null&&(e.crossOrigin=t.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=t.referrerPolicy),e.integrity==null&&(e.integrity=t.integrity)}var pi=null;function Cr(e,t,l){if(pi===null){var a=new Map,n=pi=new Map;n.set(l,a)}else n=pi,a=n.get(l),a||(a=new Map,n.set(l,a));if(a.has(e))return a;for(a.set(e,null),l=l.getElementsByTagName(e),n=0;n<l.length;n++){var i=l[n];if(!(i[jn]||i[je]||e==="link"&&i.getAttribute("rel")==="stylesheet")&&i.namespaceURI!=="http://www.w3.org/2000/svg"){var u=i.getAttribute(t)||"";u=e+u;var c=a.get(u);c?c.push(i):a.set(u,[i])}}return a}function Or(e,t,l){e=e.ownerDocument||e,e.head.insertBefore(l,t==="title"?e.querySelector("head > title"):null)}function cy(e,t,l){if(l===1||t.itemProp!=null)return!1;switch(e){case"meta":case"title":return!0;case"style":if(typeof t.precedence!="string"||typeof t.href!="string"||t.href==="")break;return!0;case"link":if(typeof t.rel!="string"||typeof t.href!="string"||t.href===""||t.onLoad||t.onError)break;switch(t.rel){case"stylesheet":return e=t.disabled,typeof t.precedence=="string"&&e==null;default:return!0}case"script":if(t.async&&typeof t.async!="function"&&typeof t.async!="symbol"&&!t.onLoad&&!t.onError&&t.src&&typeof t.src=="string")return!0}return!1}function Zm(e){return!(e.type==="stylesheet"&&!(e.state.loading&3))}function sy(e,t,l,a){if(l.type==="stylesheet"&&(typeof a.media!="string"||matchMedia(a.media).matches!==!1)&&!(l.state.loading&4)){if(l.instance===null){var n=xa(a.href),i=t.querySelector(zn(n));if(i){t=i._p,t!==null&&typeof t=="object"&&typeof t.then=="function"&&(e.count++,e=Qi.bind(e),t.then(e,e)),l.state.loading|=4,l.instance=i,we(i);return}i=t.ownerDocument||t,a=Vm(a),(n=mt.get(n))&&Ps(a,n),i=i.createElement("link"),we(i);var u=i;u._p=new Promise(function(c,s){u.onload=c,u.onerror=s}),Re(i,"link",a),l.instance=i}e.stylesheets===null&&(e.stylesheets=new Map),e.stylesheets.set(l,t),(t=l.state.preload)&&!(l.state.loading&3)&&(e.count++,l=Qi.bind(e),t.addEventListener("load",l),t.addEventListener("error",l))}}var Iu=0;function oy(e,t){return e.stylesheets&&e.count===0&&yi(e,e.stylesheets),0<e.count||0<e.imgCount?function(l){var a=setTimeout(function(){if(e.stylesheets&&yi(e,e.stylesheets),e.unsuspend){var i=e.unsuspend;e.unsuspend=null,i()}},6e4+t);0<e.imgBytes&&Iu===0&&(Iu=62500*X0());var n=setTimeout(function(){if(e.waitingForImages=!1,e.count===0&&(e.stylesheets&&yi(e,e.stylesheets),e.unsuspend)){var i=e.unsuspend;e.unsuspend=null,i()}},(e.imgBytes>Iu?50:800)+t);return e.unsuspend=l,function(){e.unsuspend=null,clearTimeout(a),clearTimeout(n)}}:null}function Qi(){if(this.count--,this.count===0&&(this.imgCount===0||!this.waitingForImages)){if(this.stylesheets)yi(this,this.stylesheets);else if(this.unsuspend){var e=this.unsuspend;this.unsuspend=null,e()}}}var Vi=null;function yi(e,t){e.stylesheets=null,e.unsuspend!==null&&(e.count++,Vi=new Map,t.forEach(ry,e),Vi=null,Qi.call(e))}function ry(e,t){if(!(t.state.loading&4)){var l=Vi.get(e);if(l)var a=l.get(null);else{l=new Map,Vi.set(e,l);for(var n=e.querySelectorAll("link[data-precedence],style[data-precedence]"),i=0;i<n.length;i++){var u=n[i];(u.nodeName==="LINK"||u.getAttribute("media")!=="not all")&&(l.set(u.dataset.precedence,u),a=u)}a&&l.set(null,a)}n=t.instance,u=n.getAttribute("data-precedence"),i=l.get(u)||a,i===a&&l.set(null,n),l.set(u,n),this.count++,a=Qi.bind(this),n.addEventListener("load",a),n.addEventListener("error",a),i?i.parentNode.insertBefore(n,i.nextSibling):(e=e.nodeType===9?e.head:e,e.insertBefore(n,e.firstChild)),t.state.loading|=4}}var bn={$$typeof:Nt,Provider:null,Consumer:null,_currentValue:Ml,_currentValue2:Ml,_threadCount:0};function fy(e,t,l,a,n,i,u,c,s){this.tag=1,this.containerInfo=e,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=xu(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=xu(0),this.hiddenUpdates=xu(null),this.identifierPrefix=a,this.onUncaughtError=n,this.onCaughtError=i,this.onRecoverableError=u,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=s,this.incompleteTransitions=new Map}function Jm(e,t,l,a,n,i,u,c,s,r,p,y){return e=new fy(e,t,l,u,s,r,p,y,c),t=1,i===!0&&(t|=24),i=Ke(3,null,null,t),e.current=i,i.stateNode=e,t=_s(),t.refCount++,e.pooledCache=t,t.refCount++,i.memoizedState={element:a,isDehydrated:l,cache:t},Os(i),e}function Km(e){return e?(e=ea,e):ea}function $m(e,t,l,a,n,i){n=Km(n),a.context===null?a.context=n:a.pendingContext=n,a=il(t),a.payload={element:l},i=i===void 0?null:i,i!==null&&(a.callback=i),l=ul(e,a,t),l!==null&&(Ge(l,e,t),Fa(l,e,t))}function Rr(e,t){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var l=e.retryLane;e.retryLane=l!==0&&l<t?l:t}}function to(e,t){Rr(e,t),(e=e.alternate)&&Rr(e,t)}function Wm(e){if(e.tag===13||e.tag===31){var t=kl(e,67108864);t!==null&&Ge(t,e,67108864),to(e,67108864)}}function Ar(e){if(e.tag===13||e.tag===31){var t=Pe();t=ds(t);var l=kl(e,t);l!==null&&Ge(l,e,t),to(e,t)}}var Zi=!0;function dy(e,t,l,a){var n=D.T;D.T=null;var i=J.p;try{J.p=2,lo(e,t,l,a)}finally{J.p=i,D.T=n}}function my(e,t,l,a){var n=D.T;D.T=null;var i=J.p;try{J.p=8,lo(e,t,l,a)}finally{J.p=i,D.T=n}}function lo(e,t,l,a){if(Zi){var n=Pc(a);if(n===null)Wu(e,t,a,Ji,l),Nr(e,a);else if(py(n,e,t,l,a))a.stopPropagation();else if(Nr(e,a),t&4&&-1<hy.indexOf(e)){for(;n!==null;){var i=Ma(n);if(i!==null)switch(i.tag){case 3:if(i=i.stateNode,i.current.memoizedState.isDehydrated){var u=xl(i.pendingLanes);if(u!==0){var c=i;for(c.pendingLanes|=2,c.entangledLanes|=2;u;){var s=1<<31-Ie(u);c.entanglements[1]|=s,u&=~s}wt(i),!(Z&6)&&(Ui=We()+500,Nn(0))}}break;case 31:case 13:c=kl(i,2),c!==null&&Ge(c,i,2),fu(),to(i,2)}if(i=Pc(a),i===null&&Wu(e,t,a,Ji,l),i===n)break;n=i}n!==null&&a.stopPropagation()}else Wu(e,t,a,null,l)}}function Pc(e){return e=ys(e),ao(e)}var Ji=null;function ao(e){if(Ji=null,e=Kl(e),e!==null){var t=Tn(e);if(t===null)e=null;else{var l=t.tag;if(l===13){if(e=yf(t),e!==null)return e;e=null}else if(l===31){if(e=gf(t),e!==null)return e;e=null}else if(l===3){if(t.stateNode.current.memoizedState.isDehydrated)return t.tag===3?t.stateNode.containerInfo:null;e=null}else t!==e&&(e=null)}}return Ji=e,null}function Fm(e){switch(e){case"beforetoggle":case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"toggle":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 2;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 8;case"message":switch(Ph()){case xf:return 2;case Ef:return 8;case Ei:case ep:return 32;case Tf:return 268435456;default:return 32}default:return 32}}var es=!1,ol=null,rl=null,fl=null,Sn=new Map,xn=new Map,Wt=[],hy="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");function Nr(e,t){switch(e){case"focusin":case"focusout":ol=null;break;case"dragenter":case"dragleave":rl=null;break;case"mouseover":case"mouseout":fl=null;break;case"pointerover":case"pointerout":Sn.delete(t.pointerId);break;case"gotpointercapture":case"lostpointercapture":xn.delete(t.pointerId)}}function La(e,t,l,a,n,i){return e===null||e.nativeEvent!==i?(e={blockedOn:t,domEventName:l,eventSystemFlags:a,nativeEvent:i,targetContainers:[n]},t!==null&&(t=Ma(t),t!==null&&Wm(t)),e):(e.eventSystemFlags|=a,t=e.targetContainers,n!==null&&t.indexOf(n)===-1&&t.push(n),e)}function py(e,t,l,a,n){switch(t){case"focusin":return ol=La(ol,e,t,l,a,n),!0;case"dragenter":return rl=La(rl,e,t,l,a,n),!0;case"mouseover":return fl=La(fl,e,t,l,a,n),!0;case"pointerover":var i=n.pointerId;return Sn.set(i,La(Sn.get(i)||null,e,t,l,a,n)),!0;case"gotpointercapture":return i=n.pointerId,xn.set(i,La(xn.get(i)||null,e,t,l,a,n)),!0}return!1}function Im(e){var t=Kl(e.target);if(t!==null){var l=Tn(t);if(l!==null){if(t=l.tag,t===13){if(t=yf(l),t!==null){e.blockedOn=t,yo(e.priority,function(){Ar(l)});return}}else if(t===31){if(t=gf(l),t!==null){e.blockedOn=t,yo(e.priority,function(){Ar(l)});return}}else if(t===3&&l.stateNode.current.memoizedState.isDehydrated){e.blockedOn=l.tag===3?l.stateNode.containerInfo:null;return}}}e.blockedOn=null}function gi(e){if(e.blockedOn!==null)return!1;for(var t=e.targetContainers;0<t.length;){var l=Pc(e.nativeEvent);if(l===null){l=e.nativeEvent;var a=new l.constructor(l.type,l);vc=a,l.target.dispatchEvent(a),vc=null}else return t=Ma(l),t!==null&&Wm(t),e.blockedOn=l,!1;t.shift()}return!0}function zr(e,t,l){gi(e)&&l.delete(t)}function yy(){es=!1,ol!==null&&gi(ol)&&(ol=null),rl!==null&&gi(rl)&&(rl=null),fl!==null&&gi(fl)&&(fl=null),Sn.forEach(zr),xn.forEach(zr)}function Wn(e,t){e.blockedOn===t&&(e.blockedOn=null,es||(es=!0,Ee.unstable_scheduleCallback(Ee.unstable_NormalPriority,yy)))}var Fn=null;function Dr(e){Fn!==e&&(Fn=e,Ee.unstable_scheduleCallback(Ee.unstable_NormalPriority,function(){Fn===e&&(Fn=null);for(var t=0;t<e.length;t+=3){var l=e[t],a=e[t+1],n=e[t+2];if(typeof a!="function"){if(ao(a||l)===null)continue;break}var i=Ma(l);i!==null&&(e.splice(t,3),t-=3,Dc(i,{pending:!0,data:n,method:l.method,action:a},a,n))}}))}function Ea(e){function t(s){return Wn(s,e)}ol!==null&&Wn(ol,e),rl!==null&&Wn(rl,e),fl!==null&&Wn(fl,e),Sn.forEach(t),xn.forEach(t);for(var l=0;l<Wt.length;l++){var a=Wt[l];a.blockedOn===e&&(a.blockedOn=null)}for(;0<Wt.length&&(l=Wt[0],l.blockedOn===null);)Im(l),l.blockedOn===null&&Wt.shift();if(l=(e.ownerDocument||e).$$reactFormReplay,l!=null)for(a=0;a<l.length;a+=3){var n=l[a],i=l[a+1],u=n[Xe]||null;if(typeof i=="function")u||Dr(l);else if(u){var c=null;if(i&&i.hasAttribute("formAction")){if(n=i,u=i[Xe]||null)c=u.formAction;else if(ao(n)!==null)continue}else c=u.action;typeof c=="function"?l[a+1]=c:(l.splice(a,3),a-=3),Dr(l)}}}function Pm(){function e(i){i.canIntercept&&i.info==="react-transition"&&i.intercept({handler:function(){return new Promise(function(u){return n=u})},focusReset:"manual",scroll:"manual"})}function t(){n!==null&&(n(),n=null),a||setTimeout(l,20)}function l(){if(!a&&!navigation.transition){var i=navigation.currentEntry;i&&i.url!=null&&navigation.navigate(i.url,{state:i.getState(),info:"react-transition",history:"replace"})}}if(typeof navigation=="object"){var a=!1,n=null;return navigation.addEventListener("navigate",e),navigation.addEventListener("navigatesuccess",t),navigation.addEventListener("navigateerror",t),setTimeout(l,100),function(){a=!0,navigation.removeEventListener("navigate",e),navigation.removeEventListener("navigatesuccess",t),navigation.removeEventListener("navigateerror",t),n!==null&&(n(),n=null)}}}function no(e){this._internalRoot=e}hu.prototype.render=no.prototype.render=function(e){var t=this._internalRoot;if(t===null)throw Error(S(409));var l=t.current,a=Pe();$m(l,a,e,t,null,null)};hu.prototype.unmount=no.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var t=e.containerInfo;$m(e.current,2,null,e,null,null),fu(),t[wa]=null}};function hu(e){this._internalRoot=e}hu.prototype.unstable_scheduleHydration=function(e){if(e){var t=Cf();e={blockedOn:null,target:e,priority:t};for(var l=0;l<Wt.length&&t!==0&&t<Wt[l].priority;l++);Wt.splice(l,0,e),l===0&&Im(e)}};var Hr=hf.version;if(Hr!=="19.2.4")throw Error(S(527,Hr,"19.2.4"));J.findDOMNode=function(e){var t=e._reactInternals;if(t===void 0)throw typeof e.render=="function"?Error(S(188)):(e=Object.keys(e).join(","),Error(S(268,e)));return e=Zh(t),e=e!==null?vf(e):null,e=e===null?null:e.stateNode,e};var gy={bundleType:0,version:"19.2.4",rendererPackageName:"react-dom",currentDispatcherRef:D,reconcilerVersion:"19.2.4"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"){var In=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!In.isDisabled&&In.supportsFiber)try{wn=In.inject(gy),Fe=In}catch{}}Fi.createRoot=function(e,t){if(!pf(e))throw Error(S(299));var l=!1,a="",n=Qd,i=Vd,u=Zd;return t!=null&&(t.unstable_strictMode===!0&&(l=!0),t.identifierPrefix!==void 0&&(a=t.identifierPrefix),t.onUncaughtError!==void 0&&(n=t.onUncaughtError),t.onCaughtError!==void 0&&(i=t.onCaughtError),t.onRecoverableError!==void 0&&(u=t.onRecoverableError)),t=Jm(e,1,!1,null,null,l,a,null,n,i,u,Pm),e[wa]=t.current,Is(e),new no(t)};Fi.hydrateRoot=function(e,t,l){if(!pf(e))throw Error(S(299));var a=!1,n="",i=Qd,u=Vd,c=Zd,s=null;return l!=null&&(l.unstable_strictMode===!0&&(a=!0),l.identifierPrefix!==void 0&&(n=l.identifierPrefix),l.onUncaughtError!==void 0&&(i=l.onUncaughtError),l.onCaughtError!==void 0&&(u=l.onCaughtError),l.onRecoverableError!==void 0&&(c=l.onRecoverableError),l.formState!==void 0&&(s=l.formState)),t=Jm(e,1,!0,t,l??null,a,n,s,i,u,c,Pm),t.context=Km(null),l=t.current,a=Pe(),a=ds(a),n=il(a),n.callback=null,ul(l,n,a),l=a,t.current.lanes=l,_n(t,l),wt(t),e[wa]=t.current,Is(e),new hu(t)};Fi.version="19.2.4";function eh(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(eh)}catch(e){console.error(e)}}eh(),sf.exports=Fi;var vy=sf.exports;const by=Fr(vy);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Sy=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),th=(...e)=>e.filter((t,l,a)=>!!t&&t.trim()!==""&&a.indexOf(t)===l).join(" ").trim();/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var xy={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ey=b.forwardRef(({color:e="currentColor",size:t=24,strokeWidth:l=2,absoluteStrokeWidth:a,className:n="",children:i,iconNode:u,...c},s)=>b.createElement("svg",{ref:s,...xy,width:t,height:t,stroke:e,strokeWidth:a?Number(l)*24/Number(t):l,className:th("lucide",n),...c},[...u.map(([r,p])=>b.createElement(r,p)),...Array.isArray(i)?i:[i]]));/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const le=(e,t)=>{const l=b.forwardRef(({className:a,...n},i)=>b.createElement(Ey,{ref:i,iconNode:t,className:th(`lucide-${Sy(e)}`,a),...n}));return l.displayName=`${e}`,l};/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ty=le("ArrowLeft",[["path",{d:"m12 19-7-7 7-7",key:"1l729n"}],["path",{d:"M19 12H5",key:"x3x0zl"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const wy=le("Ban",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m4.9 4.9 14.2 14.2",key:"1m5liu"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const My=le("Box",[["path",{d:"M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z",key:"hh9hay"}],["path",{d:"m3.3 7 8.7 5 8.7-5",key:"g66t2b"}],["path",{d:"M12 22V12",key:"d0xqtd"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const lh=le("Brain",[["path",{d:"M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z",key:"l5xja"}],["path",{d:"M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z",key:"ep3f8r"}],["path",{d:"M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4",key:"1p4c4q"}],["path",{d:"M17.599 6.5a3 3 0 0 0 .399-1.375",key:"tmeiqw"}],["path",{d:"M6.003 5.125A3 3 0 0 0 6.401 6.5",key:"105sqy"}],["path",{d:"M3.477 10.896a4 4 0 0 1 .585-.396",key:"ql3yin"}],["path",{d:"M19.938 10.5a4 4 0 0 1 .585.396",key:"1qfode"}],["path",{d:"M6 18a4 4 0 0 1-1.967-.516",key:"2e4loj"}],["path",{d:"M19.967 17.484A4 4 0 0 1 18 18",key:"159ez6"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _y=le("Bug",[["path",{d:"m8 2 1.88 1.88",key:"fmnt4t"}],["path",{d:"M14.12 3.88 16 2",key:"qol33r"}],["path",{d:"M9 7.13v-1a3.003 3.003 0 1 1 6 0v1",key:"d7y7pr"}],["path",{d:"M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6",key:"xs1cw7"}],["path",{d:"M12 20v-9",key:"1qisl0"}],["path",{d:"M6.53 9C4.6 8.8 3 7.1 3 5",key:"32zzws"}],["path",{d:"M6 13H2",key:"82j7cp"}],["path",{d:"M3 21c0-2.1 1.7-3.9 3.8-4",key:"4p0ekp"}],["path",{d:"M20.97 5c0 2.1-1.6 3.8-3.5 4",key:"18gb23"}],["path",{d:"M22 13h-4",key:"1jl80f"}],["path",{d:"M17.2 17c2.1.1 3.8 1.9 3.8 4",key:"k3fwyw"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const jy=le("CircleAlert",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Cy=le("CircleCheck",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Oy=le("Clock",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16 14",key:"68esgv"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Xa=le("CodeXml",[["path",{d:"m18 16 4-4-4-4",key:"1inbqp"}],["path",{d:"m6 8-4 4 4 4",key:"15zrgr"}],["path",{d:"m14.5 4-5 16",key:"e7oirm"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ry=le("Columns2",[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",key:"afitv7"}],["path",{d:"M12 3v18",key:"108xh3"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ay=le("Cpu",[["rect",{width:"16",height:"16",x:"4",y:"4",rx:"2",key:"14l7u7"}],["rect",{width:"6",height:"6",x:"9",y:"9",rx:"1",key:"5aljv4"}],["path",{d:"M15 2v2",key:"13l42r"}],["path",{d:"M15 20v2",key:"15mkzm"}],["path",{d:"M2 15h2",key:"1gxd5l"}],["path",{d:"M2 9h2",key:"1bbxkp"}],["path",{d:"M20 15h2",key:"19e6y8"}],["path",{d:"M20 9h2",key:"19tzq7"}],["path",{d:"M9 2v2",key:"165o2o"}],["path",{d:"M9 20v2",key:"i2bqo8"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const vi=le("FileCode",[["path",{d:"M10 12.5 8 15l2 2.5",key:"1tg20x"}],["path",{d:"m14 12.5 2 2.5-2 2.5",key:"yinavb"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z",key:"1mlx9k"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const io=le("GripHorizontal",[["circle",{cx:"12",cy:"9",r:"1",key:"124mty"}],["circle",{cx:"19",cy:"9",r:"1",key:"1ruzo2"}],["circle",{cx:"5",cy:"9",r:"1",key:"1a8b28"}],["circle",{cx:"12",cy:"15",r:"1",key:"1e56xg"}],["circle",{cx:"19",cy:"15",r:"1",key:"1a92ep"}],["circle",{cx:"5",cy:"15",r:"1",key:"5r1jwy"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ny=le("GripVertical",[["circle",{cx:"9",cy:"12",r:"1",key:"1vctgf"}],["circle",{cx:"9",cy:"5",r:"1",key:"hp0tcf"}],["circle",{cx:"9",cy:"19",r:"1",key:"fkjjf6"}],["circle",{cx:"15",cy:"12",r:"1",key:"1tmaij"}],["circle",{cx:"15",cy:"5",r:"1",key:"19l28e"}],["circle",{cx:"15",cy:"19",r:"1",key:"f4zoj3"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ah=le("Lock",[["rect",{width:"18",height:"11",x:"3",y:"11",rx:"2",ry:"2",key:"1w4ew1"}],["path",{d:"M7 11V7a5 5 0 0 1 10 0v4",key:"fwvmzm"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const zy=le("Moon",[["path",{d:"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z",key:"a7tn18"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const nh=le("Palette",[["circle",{cx:"13.5",cy:"6.5",r:".5",fill:"currentColor",key:"1okk4w"}],["circle",{cx:"17.5",cy:"10.5",r:".5",fill:"currentColor",key:"f64h9f"}],["circle",{cx:"8.5",cy:"7.5",r:".5",fill:"currentColor",key:"fotxhn"}],["circle",{cx:"6.5",cy:"12.5",r:".5",fill:"currentColor",key:"qy21gx"}],["path",{d:"M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z",key:"12rzf8"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Dy=le("Play",[["polygon",{points:"6 3 20 12 6 21 6 3",key:"1oa8hb"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ih=le("RotateCcw",[["path",{d:"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",key:"1357e3"}],["path",{d:"M3 3v5h5",key:"1xhq8a"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Hy=le("Rows2",[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",key:"afitv7"}],["path",{d:"M3 12h18",key:"1i2n21"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Uy=le("Save",[["path",{d:"M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",key:"1c8476"}],["path",{d:"M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7",key:"1ydtos"}],["path",{d:"M7 3v4a1 1 0 0 0 1 1h7",key:"t51u73"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const uh=le("Server",[["rect",{width:"20",height:"8",x:"2",y:"2",rx:"2",ry:"2",key:"ngkwjq"}],["rect",{width:"20",height:"8",x:"2",y:"14",rx:"2",ry:"2",key:"iecqi9"}],["line",{x1:"6",x2:"6.01",y1:"6",y2:"6",key:"16zg32"}],["line",{x1:"6",x2:"6.01",y1:"18",y2:"18",key:"nzw8ys"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ly=le("Sparkles",[["path",{d:"M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",key:"4pj2yx"}],["path",{d:"M20 3v4",key:"1olli1"}],["path",{d:"M22 5h-4",key:"1gvqau"}],["path",{d:"M4 17v2",key:"vumght"}],["path",{d:"M5 18H3",key:"zchphs"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ky=le("Sun",[["circle",{cx:"12",cy:"12",r:"4",key:"4exip2"}],["path",{d:"M12 2v2",key:"tus03m"}],["path",{d:"M12 20v2",key:"1lh1kg"}],["path",{d:"m4.93 4.93 1.41 1.41",key:"149t6j"}],["path",{d:"m17.66 17.66 1.41 1.41",key:"ptbguv"}],["path",{d:"M2 12h2",key:"1t8f8n"}],["path",{d:"M20 12h2",key:"1q8mjw"}],["path",{d:"m6.34 17.66-1.41 1.41",key:"1m8zz5"}],["path",{d:"m19.07 4.93-1.41 1.41",key:"1shlcs"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const qy=le("Terminal",[["polyline",{points:"4 17 10 11 4 5",key:"akl6gq"}],["line",{x1:"12",x2:"20",y1:"19",y2:"19",key:"q2wloq"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const By=le("Zap",[["path",{d:"M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",key:"1xq2db"}]]);function Ur(e,t){(t==null||t>e.length)&&(t=e.length);for(var l=0,a=Array(t);l<t;l++)a[l]=e[l];return a}function Yy(e){if(Array.isArray(e))return e}function Gy(e,t,l){return(t=$y(t))in e?Object.defineProperty(e,t,{value:l,enumerable:!0,configurable:!0,writable:!0}):e[t]=l,e}function Xy(e,t){var l=e==null?null:typeof Symbol<"u"&&e[Symbol.iterator]||e["@@iterator"];if(l!=null){var a,n,i,u,c=[],s=!0,r=!1;try{if(i=(l=l.call(e)).next,t!==0)for(;!(s=(a=i.call(l)).done)&&(c.push(a.value),c.length!==t);s=!0);}catch(p){r=!0,n=p}finally{try{if(!s&&l.return!=null&&(u=l.return(),Object(u)!==u))return}finally{if(r)throw n}}return c}}function Qy(){throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function Lr(e,t){var l=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter(function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable})),l.push.apply(l,a)}return l}function kr(e){for(var t=1;t<arguments.length;t++){var l=arguments[t]!=null?arguments[t]:{};t%2?Lr(Object(l),!0).forEach(function(a){Gy(e,a,l[a])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(l)):Lr(Object(l)).forEach(function(a){Object.defineProperty(e,a,Object.getOwnPropertyDescriptor(l,a))})}return e}function Vy(e,t){if(e==null)return{};var l,a,n=Zy(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)l=i[a],t.indexOf(l)===-1&&{}.propertyIsEnumerable.call(e,l)&&(n[l]=e[l])}return n}function Zy(e,t){if(e==null)return{};var l={};for(var a in e)if({}.hasOwnProperty.call(e,a)){if(t.indexOf(a)!==-1)continue;l[a]=e[a]}return l}function Jy(e,t){return Yy(e)||Xy(e,t)||Wy(e,t)||Qy()}function Ky(e,t){if(typeof e!="object"||!e)return e;var l=e[Symbol.toPrimitive];if(l!==void 0){var a=l.call(e,t);if(typeof a!="object")return a;throw new TypeError("@@toPrimitive must return a primitive value.")}return(t==="string"?String:Number)(e)}function $y(e){var t=Ky(e,"string");return typeof t=="symbol"?t:t+""}function Wy(e,t){if(e){if(typeof e=="string")return Ur(e,t);var l={}.toString.call(e).slice(8,-1);return l==="Object"&&e.constructor&&(l=e.constructor.name),l==="Map"||l==="Set"?Array.from(e):l==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(l)?Ur(e,t):void 0}}function Fy(e,t,l){return t in e?Object.defineProperty(e,t,{value:l,enumerable:!0,configurable:!0,writable:!0}):e[t]=l,e}function qr(e,t){var l=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter(function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable})),l.push.apply(l,a)}return l}function Br(e){for(var t=1;t<arguments.length;t++){var l=arguments[t]!=null?arguments[t]:{};t%2?qr(Object(l),!0).forEach(function(a){Fy(e,a,l[a])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(l)):qr(Object(l)).forEach(function(a){Object.defineProperty(e,a,Object.getOwnPropertyDescriptor(l,a))})}return e}function Iy(){for(var e=arguments.length,t=new Array(e),l=0;l<e;l++)t[l]=arguments[l];return function(a){return t.reduceRight(function(n,i){return i(n)},a)}}function Qa(e){return function t(){for(var l=this,a=arguments.length,n=new Array(a),i=0;i<a;i++)n[i]=arguments[i];return n.length>=e.length?e.apply(this,n):function(){for(var u=arguments.length,c=new Array(u),s=0;s<u;s++)c[s]=arguments[s];return t.apply(l,[].concat(n,c))}}}function Ki(e){return{}.toString.call(e).includes("Object")}function Py(e){return!Object.keys(e).length}function En(e){return typeof e=="function"}function eg(e,t){return Object.prototype.hasOwnProperty.call(e,t)}function tg(e,t){return Ki(t)||dl("changeType"),Object.keys(t).some(function(l){return!eg(e,l)})&&dl("changeField"),t}function lg(e){En(e)||dl("selectorType")}function ag(e){En(e)||Ki(e)||dl("handlerType"),Ki(e)&&Object.values(e).some(function(t){return!En(t)})&&dl("handlersType")}function ng(e){e||dl("initialIsRequired"),Ki(e)||dl("initialType"),Py(e)&&dl("initialContent")}function ig(e,t){throw new Error(e[t]||e.default)}var ug={initialIsRequired:"initial state is required",initialType:"initial state should be an object",initialContent:"initial state shouldn't be an empty object",handlerType:"handler should be an object or a function",handlersType:"all handlers should be a functions",selectorType:"selector should be a function",changeType:"provided value of changes should be an object",changeField:'it seams you want to change a field in the state which is not specified in the "initial" state',default:"an unknown error accured in `state-local` package"},dl=Qa(ig)(ug),Pn={changes:tg,selector:lg,handler:ag,initial:ng};function cg(e){var t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{};Pn.initial(e),Pn.handler(t);var l={current:e},a=Qa(rg)(l,t),n=Qa(og)(l),i=Qa(Pn.changes)(e),u=Qa(sg)(l);function c(){var r=arguments.length>0&&arguments[0]!==void 0?arguments[0]:function(p){return p};return Pn.selector(r),r(l.current)}function s(r){Iy(a,n,i,u)(r)}return[c,s]}function sg(e,t){return En(t)?t(e.current):t}function og(e,t){return e.current=Br(Br({},e.current),t),t}function rg(e,t,l){return En(t)?t(e.current):Object.keys(l).forEach(function(a){var n;return(n=t[a])===null||n===void 0?void 0:n.call(t,e.current[a])}),l}var fg={create:cg},dg={paths:{vs:"https://cdn.jsdelivr.net/npm/monaco-editor@0.55.1/min/vs"}};function mg(e){return function t(){for(var l=this,a=arguments.length,n=new Array(a),i=0;i<a;i++)n[i]=arguments[i];return n.length>=e.length?e.apply(this,n):function(){for(var u=arguments.length,c=new Array(u),s=0;s<u;s++)c[s]=arguments[s];return t.apply(l,[].concat(n,c))}}}function hg(e){return{}.toString.call(e).includes("Object")}function pg(e){return e||Yr("configIsRequired"),hg(e)||Yr("configType"),e.urls?(yg(),{paths:{vs:e.urls.monacoBase}}):e}function yg(){console.warn(ch.deprecation)}function gg(e,t){throw new Error(e[t]||e.default)}var ch={configIsRequired:"the configuration object is required",configType:"the configuration object should be an object",default:"an unknown error accured in `@monaco-editor/loader` package",deprecation:`Deprecation warning!
    You are using deprecated way of configuration.

    Instead of using
      monaco.config({ urls: { monacoBase: '...' } })
    use
      monaco.config({ paths: { vs: '...' } })

    For more please check the link https://github.com/suren-atoyan/monaco-loader#config
  `},Yr=mg(gg)(ch),vg={config:pg},bg=function(){for(var t=arguments.length,l=new Array(t),a=0;a<t;a++)l[a]=arguments[a];return function(n){return l.reduceRight(function(i,u){return u(i)},n)}};function sh(e,t){return Object.keys(t).forEach(function(l){t[l]instanceof Object&&e[l]&&Object.assign(t[l],sh(e[l],t[l]))}),kr(kr({},e),t)}var Sg={type:"cancelation",msg:"operation is manually canceled"};function Pu(e){var t=!1,l=new Promise(function(a,n){e.then(function(i){return t?n(Sg):a(i)}),e.catch(n)});return l.cancel=function(){return t=!0},l}var xg=["monaco"],Eg=fg.create({config:dg,isInitialized:!1,resolve:null,reject:null,monaco:null}),oh=Jy(Eg,2),Hn=oh[0],pu=oh[1];function Tg(e){var t=vg.config(e),l=t.monaco,a=Vy(t,xg);pu(function(n){return{config:sh(n.config,a),monaco:l}})}function wg(){var e=Hn(function(t){var l=t.monaco,a=t.isInitialized,n=t.resolve;return{monaco:l,isInitialized:a,resolve:n}});if(!e.isInitialized){if(pu({isInitialized:!0}),e.monaco)return e.resolve(e.monaco),Pu(ec);if(window.monaco&&window.monaco.editor)return rh(window.monaco),e.resolve(window.monaco),Pu(ec);bg(Mg,jg)(Cg)}return Pu(ec)}function Mg(e){return document.body.appendChild(e)}function _g(e){var t=document.createElement("script");return e&&(t.src=e),t}function jg(e){var t=Hn(function(a){var n=a.config,i=a.reject;return{config:n,reject:i}}),l=_g("".concat(t.config.paths.vs,"/loader.js"));return l.onload=function(){return e()},l.onerror=t.reject,l}function Cg(){var e=Hn(function(l){var a=l.config,n=l.resolve,i=l.reject;return{config:a,resolve:n,reject:i}}),t=window.require;t.config(e.config),t(["vs/editor/editor.main"],function(l){var a=l.m||l;rh(a),e.resolve(a)},function(l){e.reject(l)})}function rh(e){Hn().monaco||pu({monaco:e})}function Og(){return Hn(function(e){var t=e.monaco;return t})}var ec=new Promise(function(e,t){return pu({resolve:e,reject:t})}),fh={config:Tg,init:wg,__getMonacoInstance:Og},Rg={wrapper:{display:"flex",position:"relative",textAlign:"initial"},fullWidth:{width:"100%"},hide:{display:"none"}},tc=Rg,Ag={container:{display:"flex",height:"100%",width:"100%",justifyContent:"center",alignItems:"center"}},Ng=Ag;function zg({children:e}){return ll.createElement("div",{style:Ng.container},e)}var Dg=zg,Hg=Dg;function Ug({width:e,height:t,isEditorReady:l,loading:a,_ref:n,className:i,wrapperProps:u}){return ll.createElement("section",{style:{...tc.wrapper,width:e,height:t},...u},!l&&ll.createElement(Hg,null,a),ll.createElement("div",{ref:n,style:{...tc.fullWidth,...!l&&tc.hide},className:i}))}var Lg=Ug,dh=b.memo(Lg);function kg(e){b.useEffect(e,[])}var mh=kg;function qg(e,t,l=!0){let a=b.useRef(!0);b.useEffect(a.current||!l?()=>{a.current=!1}:e,t)}var Ze=qg;function cn(){}function na(e,t,l,a){return Bg(e,a)||Yg(e,t,l,a)}function Bg(e,t){return e.editor.getModel(hh(e,t))}function Yg(e,t,l,a){return e.editor.createModel(t,l,a?hh(e,a):void 0)}function hh(e,t){return e.Uri.parse(t)}function Gg({original:e,modified:t,language:l,originalLanguage:a,modifiedLanguage:n,originalModelPath:i,modifiedModelPath:u,keepCurrentOriginalModel:c=!1,keepCurrentModifiedModel:s=!1,theme:r="light",loading:p="Loading...",options:y={},height:m="100%",width:g="100%",className:x,wrapperProps:_={},beforeMount:A=cn,onMount:d=cn}){let[f,h]=b.useState(!1),[v,T]=b.useState(!0),j=b.useRef(null),E=b.useRef(null),O=b.useRef(null),C=b.useRef(d),w=b.useRef(A),X=b.useRef(!1);mh(()=>{let N=fh.init();return N.then(M=>(E.current=M)&&T(!1)).catch(M=>M?.type!=="cancelation"&&console.error("Monaco initialization: error:",M)),()=>j.current?K():N.cancel()}),Ze(()=>{if(j.current&&E.current){let N=j.current.getOriginalEditor(),M=na(E.current,e||"",a||l||"text",i||"");M!==N.getModel()&&N.setModel(M)}},[i],f),Ze(()=>{if(j.current&&E.current){let N=j.current.getModifiedEditor(),M=na(E.current,t||"",n||l||"text",u||"");M!==N.getModel()&&N.setModel(M)}},[u],f),Ze(()=>{let N=j.current.getModifiedEditor();N.getOption(E.current.editor.EditorOption.readOnly)?N.setValue(t||""):t!==N.getValue()&&(N.executeEdits("",[{range:N.getModel().getFullModelRange(),text:t||"",forceMoveMarkers:!0}]),N.pushUndoStop())},[t],f),Ze(()=>{j.current?.getModel()?.original.setValue(e||"")},[e],f),Ze(()=>{let{original:N,modified:M}=j.current.getModel();E.current.editor.setModelLanguage(N,a||l||"text"),E.current.editor.setModelLanguage(M,n||l||"text")},[l,a,n],f),Ze(()=>{E.current?.editor.setTheme(r)},[r],f),Ze(()=>{j.current?.updateOptions(y)},[y],f);let F=b.useCallback(()=>{if(!E.current)return;w.current(E.current);let N=na(E.current,e||"",a||l||"text",i||""),M=na(E.current,t||"",n||l||"text",u||"");j.current?.setModel({original:N,modified:M})},[l,t,n,e,a,i,u]),H=b.useCallback(()=>{!X.current&&O.current&&(j.current=E.current.editor.createDiffEditor(O.current,{automaticLayout:!0,...y}),F(),E.current?.editor.setTheme(r),h(!0),X.current=!0)},[y,r,F]);b.useEffect(()=>{f&&C.current(j.current,E.current)},[f]),b.useEffect(()=>{!v&&!f&&H()},[v,f,H]);function K(){let N=j.current?.getModel();c||N?.original?.dispose(),s||N?.modified?.dispose(),j.current?.dispose()}return ll.createElement(dh,{width:g,height:m,isEditorReady:f,loading:p,_ref:O,className:x,wrapperProps:_})}var Xg=Gg;b.memo(Xg);function Qg(e){let t=b.useRef();return b.useEffect(()=>{t.current=e},[e]),t.current}var Vg=Qg,ei=new Map;function Zg({defaultValue:e,defaultLanguage:t,defaultPath:l,value:a,language:n,path:i,theme:u="light",line:c,loading:s="Loading...",options:r={},overrideServices:p={},saveViewState:y=!0,keepCurrentModel:m=!1,width:g="100%",height:x="100%",className:_,wrapperProps:A={},beforeMount:d=cn,onMount:f=cn,onChange:h,onValidate:v=cn}){let[T,j]=b.useState(!1),[E,O]=b.useState(!0),C=b.useRef(null),w=b.useRef(null),X=b.useRef(null),F=b.useRef(f),H=b.useRef(d),K=b.useRef(),N=b.useRef(a),M=Vg(i),z=b.useRef(!1),R=b.useRef(!1);mh(()=>{let se=fh.init();return se.then(be=>(C.current=be)&&O(!1)).catch(be=>be?.type!=="cancelation"&&console.error("Monaco initialization: error:",be)),()=>w.current?ce():se.cancel()}),Ze(()=>{let se=na(C.current,e||a||"",t||n||"",i||l||"");se!==w.current?.getModel()&&(y&&ei.set(M,w.current?.saveViewState()),w.current?.setModel(se),y&&w.current?.restoreViewState(ei.get(i)))},[i],T),Ze(()=>{w.current?.updateOptions(r)},[r],T),Ze(()=>{!w.current||a===void 0||(w.current.getOption(C.current.editor.EditorOption.readOnly)?w.current.setValue(a):a!==w.current.getValue()&&(R.current=!0,w.current.executeEdits("",[{range:w.current.getModel().getFullModelRange(),text:a,forceMoveMarkers:!0}]),w.current.pushUndoStop(),R.current=!1))},[a],T),Ze(()=>{let se=w.current?.getModel();se&&n&&C.current?.editor.setModelLanguage(se,n)},[n],T),Ze(()=>{c!==void 0&&w.current?.revealLine(c)},[c],T),Ze(()=>{C.current?.editor.setTheme(u)},[u],T);let Q=b.useCallback(()=>{if(!(!X.current||!C.current)&&!z.current){H.current(C.current);let se=i||l,be=na(C.current,a||e||"",t||n||"",se||"");w.current=C.current?.editor.create(X.current,{model:be,automaticLayout:!0,...r},p),y&&w.current.restoreViewState(ei.get(se)),C.current.editor.setTheme(u),c!==void 0&&w.current.revealLine(c),j(!0),z.current=!0}},[e,t,l,a,n,i,r,p,y,u,c]);b.useEffect(()=>{T&&F.current(w.current,C.current)},[T]),b.useEffect(()=>{!E&&!T&&Q()},[E,T,Q]),N.current=a,b.useEffect(()=>{T&&h&&(K.current?.dispose(),K.current=w.current?.onDidChangeModelContent(se=>{R.current||h(w.current.getValue(),se)}))},[T,h]),b.useEffect(()=>{if(T){let se=C.current.editor.onDidChangeMarkers(be=>{let ht=w.current.getModel()?.uri;if(ht&&be.find(de=>de.path===ht.path)){let de=C.current.editor.getModelMarkers({resource:ht});v?.(de)}});return()=>{se?.dispose()}}return()=>{}},[T,v]);function ce(){K.current?.dispose(),m?y&&ei.set(i,w.current.saveViewState()):w.current.getModel()?.dispose(),w.current.dispose()}return ll.createElement(dh,{width:g,height:x,isEditorReady:T,loading:s,_ref:X,className:_,wrapperProps:A})}var Jg=Zg,Kg=b.memo(Jg),$g=Kg;const Wg='ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',Fg=["node-js","express","hono"],Ig=`
declare var console: {
  log(...data: any[]): void;
  error(...data: any[]): void;
  warn(...data: any[]): void;
  info(...data: any[]): void;
  debug(...data: any[]): void;
  table(data: any, columns?: string[]): void;
  dir(item?: any): void;
  group(...data: any[]): void;
  groupEnd(): void;
  time(label?: string): void;
  timeEnd(label?: string): void;
  count(label?: string): void;
  assert(condition?: boolean, ...data: any[]): void;
  trace(...data: any[]): void;
  clear(): void;
};
`,Gr=(e,t)=>{const l=Fg.includes(t),a=e.languages.typescript;a.javascriptDefaults.setCompilerOptions({target:a.ScriptTarget.ES2020,allowNonTsExtensions:!0,allowJs:!0,lib:l?["es2020"]:["es2020","dom"]}),a.javascriptDefaults.addExtraLib(l?Ig:"","ts:code-shoebox-console.d.ts")},Pg=({code:e,onChange:t,themeMode:l,environmentMode:a,sessionId:n,activeFile:i,readOnly:u=!1})=>{const c=b.useMemo(()=>{const p=`sandbox-${a}-${n}`;if(i)return`${p}-${i}`;switch(a){case"typescript":case"express-ts":case"hono-ts":case"p5-ts":case"node-ts":return`${p}.ts`;case"react-ts":return`${p}.tsx`;case"html":return`${p}.html`;case"react":return`${p}.jsx`;case"p5":return`${p}.js`;default:return`${p}.js`}},[n,a,i]),s=b.useMemo(()=>i?.endsWith(".html")?"html":i?.endsWith(".css")?"css":i?.endsWith(".js")?"javascript":a==="html"?"html":["typescript","react-ts","express-ts","hono-ts","node-ts","p5-ts"].includes(a)?"typescript":"javascript",[a,i]),r=(p,y)=>{p.focus();const m=()=>{y.editor.remeasureFonts(),p.layout()};m(),window.requestAnimationFrame(m),window.setTimeout(m,250),document.fonts?.ready.then(m).catch(()=>{}),s==="javascript"&&(Gr(y,a),p.onDidFocusEditorText(()=>Gr(y,a))),s==="typescript"&&(y.languages.typescript.typescriptDefaults.setCompilerOptions({jsx:y.languages.typescript.JsxEmit.React,target:y.languages.typescript.ScriptTarget.ES2020,allowNonTsExtensions:!0,moduleResolution:y.languages.typescript.ModuleResolutionKind.NodeJs,noLib:!1,esModuleInterop:!0}),a==="react-ts"&&y.languages.typescript.typescriptDefaults.addExtraLib(`
                declare namespace React {
                    type ReactNode = any;
                    interface FC<P = {}> {
                        (props: P): ReactNode;
                    }
                    interface Dispatch<A> {
                        (value: A): void;
                    }
                    type SetStateAction<S> = S | ((prevState: S) => S);
                }

                declare module 'react' {
                    export type ReactNode = any;
                    export interface FC<P = {}> {
                        (props: P): ReactNode;
                    }
                    export interface Dispatch<A> {
                        (value: A): void;
                    }
                    export type SetStateAction<S> = S | ((prevState: S) => S);
                    export function useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>];

                    const React: {
                        FC: FC<any>;
                        useState: typeof useState;
                    };
                    export default React;
                }

                declare module 'react-dom/client' {
                    export interface Root {
                        render(children: any): void;
                        unmount(): void;
                    }
                    export function createRoot(container: Element | DocumentFragment): Root;
                }
                `,"react-shim.d.ts"),a==="express-ts"&&y.languages.typescript.typescriptDefaults.addExtraLib(`
                declare module 'express' {
                    export interface Request {
                        params: any;
                        query: any;
                        body: any;
                        method: string;
                        url: string;
                    }
                    export interface Response {
                        status(code: number): this;
                        json(data: any): void;
                        send(data: any): void;
                    }
                    export interface Application {
                        get(path: string, handler: (req: Request, res: Response) => void): void;
                        post(path: string, handler: (req: Request, res: Response) => void): void;
                        listen(port: number, cb?: () => void): void;
                    }
                    function express(): Application;
                    export default express;
                }
                `,"express.d.ts"),a==="hono-ts"&&y.languages.typescript.typescriptDefaults.addExtraLib(`
                declare module 'hono' {
                    export interface Context {
                        text(content: string): any;
                        json(data: any): any;
                        req: {
                            param(name: string): string;
                            query(name: string): string;
                            query(): Record<string, string>;
                        };
                    }
                    export class Hono {
                        get(path: string, handler: (c: Context) => any): void;
                        post(path: string, handler: (c: Context) => any): void;
                        fire(): void;
                    }
                }
                declare class Hono {
                    get(path: string, handler: (c: any) => any): void;
                    post(path: string, handler: (c: any) => any): void;
                    fire(): void;
                }
                `,"hono.d.ts"),a==="p5-ts"&&y.languages.typescript.typescriptDefaults.addExtraLib(`
                declare function createCanvas(w: number, h: number): any;
                declare function background(gray: number, alpha?: number): void;
                declare function background(r: number, g: number, b: number, a?: number): void;
                declare function background(color: string): void;
                declare function stroke(gray: number, alpha?: number): void;
                declare function stroke(r: number, g: number, b: number, a?: number): void;
                declare function noStroke(): void;
                declare function fill(gray: number, alpha?: number): void;
                declare function fill(r: number, g: number, b: number, a?: number): void;
                declare function fill(color: string): void;
                declare function noFill(): void;
                declare function circle(x: number, y: number, d: number): void;
                declare function line(x1: number, y1: number, x2: number, y2: number): void;
                declare function rect(x: number, y: number, w: number, h: number): void;
                declare function ellipse(x: number, y: number, w: number, h: number): void;
                declare function triangle(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): void;
                declare function dist(x1: number, y1: number, x2: number, y2: number): number;
                declare function random(max?: number): number;
                declare function random(min: number, max: number): number;
                declare function colorMode(mode: string, max?: number): void;
                declare function angleMode(mode: string): void;
                declare function translate(x: number, y: number): void;
                declare function rotate(angle: number): void;
                declare function push(): void;
                declare function pop(): void;
                declare function frameRate(fps: number): void;
                declare function strokeWeight(weight: number): void;
                declare var width: number;
                declare var height: number;
                declare var frameCount: number;
                declare var mouseX: number;
                declare var mouseY: number;
                declare var mouseIsPressed: boolean;
                declare var keyIsPressed: boolean;
                declare const PI: number;
                declare const TWO_PI: number;
                declare const DEGREES: string;
                declare const RADIANS: string;
                declare const HSB: string;
                declare const RGB: string;
                
                // Allow defining setup and draw on window for global mode
                interface Window {
                    setup?: () => void;
                    draw?: () => void;
                }
                `,"p5-shim.d.ts"))};return o.jsx("div",{className:"monaco-editor-container h-full w-full overflow-hidden",children:o.jsx($g,{height:"100%",path:c,language:s,theme:l==="dark"?"vs-dark":"light",value:e,onChange:t,onMount:r,loading:o.jsx("div",{className:"h-full w-full flex items-center justify-center text-sm opacity-50",children:"Loading Editor..."}),options:{readOnly:u,minimap:{enabled:!1},fontSize:14,wordWrap:"on",automaticLayout:!0,padding:{top:16,bottom:16},scrollBeyondLastLine:!1,fontFamily:Wg,fontLigatures:!1,fixedOverflowWidgets:!0,renderValidationDecorations:"on",lineHeight:24,letterSpacing:0}},c)})},ti=e=>e.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/'/g,"&#39;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\r/g,"&#13;").replace(/\n/g,"&#10;"),ev=e=>e.replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\r\n|\r|\n/g,"\\a "),tv=e=>{switch(e.kind){case"image":return[{language:"HTML",code:`<img src="${ti(e.src)}" alt="${ti(e.alt)}">`},{language:"CSS",code:`.media-image { background-image: url("${ev(e.src)}"); }`}];case"audio":return[{language:"HTML",code:`<audio controls src="${ti(e.src)}"></audio>`},{language:"JavaScript",code:`const audio = new Audio(${JSON.stringify(e.src)});
void audio.play();`}];case"video":return[{language:"HTML",code:`<video id="media-video" controls src="${ti(e.src)}"></video>`},{language:"JavaScript",code:`const video = document.querySelector('#media-video');
void video?.play();`}]}},lv=({language:e,code:t})=>o.jsxs("div",{children:[o.jsx("h3",{className:"mb-1 text-xs font-bold uppercase tracking-wide",children:e}),o.jsx("pre",{className:"overflow-x-auto rounded bg-black/20 p-3 text-xs",children:o.jsx("code",{children:t})})]}),lc=(e,t)=>`${t}:${e.kind}:${e.name}:${e.src}`,av=({mediaAssets:e,themeMode:t})=>{const l=b.useId(),a=e.slice(0,3),[n,i]=b.useState(null),[u,c]=b.useState(null),s=a.findIndex((g,x)=>lc(g,x)===n),r=s>=0?s:0,p=a[r];if(!p)return o.jsx("section",{className:`flex h-full items-center justify-center p-6 ${t==="dark"?"bg-[#1e1e1e] text-gray-300":"bg-white text-gray-600"}`,children:o.jsx("p",{className:"rounded-lg border border-dashed border-current/25 px-5 py-4 text-center text-sm",children:"No media assets supplied."})});const y=tv(p),m=lc(p,r);return o.jsxs("section",{className:`h-full overflow-auto p-4 ${t==="dark"?"bg-[#1e1e1e] text-gray-100":"bg-white text-gray-900"}`,children:[o.jsx("div",{role:"tablist","aria-label":"Media assets",className:"mb-4 flex gap-1 overflow-x-auto",children:a.map((g,x)=>o.jsxs("button",{id:`${l}-tab-${x}`,type:"button",role:"tab","aria-selected":x===r,"aria-controls":`${l}-panel`,onClick:()=>{i(lc(g,x)),c(null)},className:`shrink-0 rounded px-3 py-1.5 text-sm font-medium transition-colors ${x===r?t==="dark"?"bg-white/10 text-blue-300":"bg-blue-50 text-blue-700":"opacity-60 hover:opacity-90"}`,children:[g.name,o.jsx(ah,{"aria-hidden":"true",className:"ml-1 inline h-3 w-3"})]},`${x}-${g.name}`))}),e.length>a.length&&o.jsx("p",{className:"mb-4 text-xs opacity-70",children:"Only the first 3 assets are shown."}),o.jsxs("div",{id:`${l}-panel`,role:"tabpanel","aria-labelledby":`${l}-tab-${r}`,children:[o.jsxs("div",{className:`flex min-h-40 items-center justify-center rounded-lg border p-3 ${t==="dark"?"border-white/10 bg-black/20":"border-gray-200 bg-gray-50"}`,children:[p.kind==="image"&&o.jsx("img",{src:p.src,alt:p.alt,onError:()=>c(m),className:"max-h-64 max-w-full rounded object-contain"}),p.kind==="audio"&&o.jsx("audio",{src:p.src,controls:!0,preload:"metadata","aria-label":`Audio preview: ${p.name}`,onError:()=>c(m),className:"w-full"}),p.kind==="video"&&o.jsx("video",{src:p.src,controls:!0,preload:"metadata","aria-label":`Video preview: ${p.name}`,onError:()=>c(m),className:"max-h-64 max-w-full rounded"})]}),u===m&&o.jsxs("p",{role:"alert",className:"mt-3 text-sm text-red-500",children:["Could not load ",p.name,"."]}),o.jsx("div",{className:"mt-5 space-y-4",children:y.map(g=>o.jsx(lv,{...g},g.language))})]})]})},nv=`
    html, body {
        height: 100%;
        margin: 0;
        padding: 0;
        overflow: hidden;
    }

    body { 
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        color: #333;
        background: #fff;
        transition: background-color 0.3s, color 0.3s;
        display: flex;
        flex-direction: column;
    }
    
    body.dark { background: #1a1a1a; color: #ddd; }
    
    #root {
        flex: 1;
        overflow: auto;
        padding: 1rem;
        position: relative;
        width: 100%;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    
    #root > * {
        max-width: 100%;
        flex-shrink: 0;
    }

    canvas {
        display: block;
        margin-bottom: 1rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        border-radius: 4px;
    }
`,iv=`
    // --- Console & Module System ---
    window.messagePort = null;
    window.__MODULE_REGISTRY__ = {};

    window.require = function(module) {
        if (window.__MODULE_REGISTRY__[module]) return window.__MODULE_REGISTRY__[module];
        if (module === 'react') return window.React;
        if (module === 'react-dom' || module === 'react-dom/client') return window.ReactDOM;
        throw new Error('Module not found: ' + module);
    };

    function sendPayload(type, payload) {
        const message = { type, payload };
        if (window.messagePort) window.messagePort.postMessage(message);
        else window.parent.postMessage(message, '*');
    }

    function formatRuntimeValue(value) {
        if (
            value !== null
            && typeof value === 'object'
            && typeof value.name === 'string'
            && typeof value.message === 'string'
        ) {
            return value.name + ': ' + value.message;
        }
        if (typeof value === 'object' && value !== null) {
            try { return JSON.stringify(value, null, 2); } catch (e) { return String(value); }
        }
        return String(value);
    }

    // Intercept standard logs
    ['log', 'error', 'warn', 'info'].forEach(method => {
        const original = console[method];
        console[method] = function(...args) {
            original.apply(console, args);
            const content = args.map(formatRuntimeValue).join(' ');
            sendPayload(method === 'error' ? 'RUNTIME_ERROR' : (method === 'warn' ? 'CONSOLE_WARN' : 'CONSOLE_LOG'), content);
        };
    });

    console.log("[Kernel] Sandbox started. Initializing environment...");

    window.onerror = (msg, src, line, column, error) => {
        const content = error
            ? formatRuntimeValue(error)
            : 'Error: ' + String(msg) + ' (Line ' + line + ', Column ' + column + ')';
        sendPayload('RUNTIME_ERROR', content);
    };

    window.addEventListener('unhandledrejection', (event) => {
        sendPayload('RUNTIME_ERROR', formatRuntimeValue(event.reason));
    });

    window.addEventListener('message', (event) => {
        if (event.source !== window.parent) return;
        const { type, code, mode, payload } = event.data;
        if (type === 'INIT_PORT' && event.ports[0]) {
            console.log("[Kernel] Received INIT_PORT. Establishing MessageChannel.");
            window.messagePort = event.ports[0];
            window.messagePort.postMessage({ type: 'READY_SIGNAL' });
            if (window.__SERVER_READY__) {
                console.log("[Kernel] Server already ready, resending SERVER_READY signal via Port.");
                window.messagePort.postMessage({ type: 'SERVER_READY' });
            }
        }
        if (type === 'THEME') document.body.className = mode === 'dark' ? 'dark' : '';
        if (type === 'EXECUTE' && window.__RUN_MODE__) {
            console.log("[Kernel] Received EXECUTE signal.");
            const root = document.getElementById('root');
            const placeholder = document.getElementById('placeholder');
            if (placeholder) placeholder.style.display = 'none';
            window.__RUN_MODE__(code, root, payload || {});
        }
    });
`,uv=e=>`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>${nv} ${e.styles||""}</style>
    ${(e.cdns||[]).join(`
`)}
</head>
<body>
    <div id="root">
        ${e.showPlaceholder!==!1?'<p id="placeholder" style="color: #888; font-style: italic;">Output will appear here...</p>':""}
    </div>
    <script>
        ${iv}
        ${e.mocks||""}
        ${e.logic}
    <\/script>
</body>
</html>
`,Xr=`
    // --- Mock Express & Response Objects ---

    class MockResponse {
        constructor(resolve) {
            this.resolve = resolve;
            this.statusCode = 200;
        }

        status(code) {
            this.statusCode = code;
            return this;
        }

        json(data) {
            this.resolve({
                status: this.statusCode,
                data: data,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        send(data) {
             this.resolve({
                status: this.statusCode,
                data: data,
                headers: { 'Content-Type': 'text/html' }
            });
        }
    }

    class MockApp {
        constructor() {
            this.routes = { GET: {} };
        }

        get(path, handler) {
            const regexPath = path.replace(/:[^/]+/g, '([^/]+)');
            this.routes.GET[regexPath] = { originalPath: path, handler };
        }

        listen(port, cb) {
            if (cb) cb();
            
            // Signal ready via port if available, else global window.parent fallback
            const readyMsg = { type: 'SERVER_READY' };
            if (window.messagePort) {
                window.messagePort.postMessage(readyMsg);
            } else {
                window.parent.postMessage(readyMsg, '*');
                // Flag for async port initialization in common.ts interceptor
                window.serverReadySignal = true;
            }
        }

        async _handleRequest(method, url) {
            // Parse URL to separate path and query
            // We use a dummy base because 'url' is just the path+query like '/users?id=1'
            const urlObj = new URL(url, "http://localhost");
            const pathname = urlObj.pathname;
            const searchParams = urlObj.searchParams;
            
            // Convert searchParams to a plain object
            const query = {};
            for (const [key, value] of searchParams) {
                query[key] = value;
            }

            console.log(\`Incoming Request: \${method} \${url}\`);
            
            const methodRoutes = this.routes[method] || {};
            
            for (const routeRegex in methodRoutes) {
                // Match against pathname, NOT full url (which might contain query strings)
                const match = new RegExp(\`^\${routeRegex}$\`).exec(pathname);
                if (match) {
                    const { handler } = methodRoutes[routeRegex];
                    
                    const params = {};
                    const originalPath = methodRoutes[routeRegex].originalPath;
                    const paramKeys = (originalPath.match(/:([^/]+)/g) || []).map(k => k.substring(1));
                    
                    if (paramKeys.length && match.length > 1) {
                       paramKeys.forEach((key, index) => {
                           params[key] = match[index + 1];
                       });
                    }

                    const req = { 
                        method, 
                        url, 
                        path: pathname,
                        params, 
                        query 
                    };

                    return new Promise(resolve => {
                        const res = new MockResponse(resolve);
                        try {
                            const out = handler(req, res);
                            if (out && typeof out.catch === 'function') {
                                out.catch(e => {
                                    const message = e && e.message ? e.message : String(e);
                                    console.warn(message);
                                    resolve({ status: 500, data: { error: message } });
                                });
                            }
                        } catch (e) {
                            const message = e && e.message ? e.message : String(e);
                            console.warn(message);
                            resolve({ status: 500, data: { error: message } });
                        }
                    });
                }
            }

            return { status: 404, data: { error: \`Cannot \${method} \${pathname}\` } };
        }
    }

    const appInstance = new MockApp();
    window.express = function() { return appInstance; };
    window.appInstance = appInstance;

    // Logic to handle requests coming from the parent
    const requestHandler = async (event) => {
        if (event.data && event.data.type === 'SIMULATE_REQUEST') {
            const { method, url } = event.data.payload;
            try {
                const response = await appInstance._handleRequest(method, url);
                const completeMsg = { type: 'REQUEST_COMPLETE', payload: response };
                
                if (window.messagePort) {
                    window.messagePort.postMessage(completeMsg);
                } else {
                    window.parent.postMessage(completeMsg, '*');
                }
            } catch (err) {
                console.error("[Express Mock] Simulation error:", err);
                sendPayload('RUNTIME_ERROR', err.message);
            }
        }
    };

    // Listen on the main window for initial requests (fallback)
    window.addEventListener('message', (event) => {
        if (event.source !== window.parent) return;
        requestHandler(event);
    });
    
    // Also attach to the message port once it arrives for high-performance communication
    const checkPortInterval = setInterval(() => {
        if (window.messagePort) {
            window.messagePort.addEventListener('message', requestHandler);
            window.messagePort.start();
            clearInterval(checkPortInterval);
        }
    }, 50);
`,Qr=`
    // 1. Define Server Starter globally so it is always available
    window.__startHonoServer = function(app) {
        // Debounce: if this exact instance is already running, skip
        if (window.appInstance === app && window.__SERVER_READY__) {
            return;
        }

        window.appInstance = app;
        window.__SERVER_READY__ = true;

        const readyMsg = { type: 'SERVER_READY' };
        if (window.messagePort) {
            window.messagePort.postMessage(readyMsg);
        } else {
            window.parent.postMessage(readyMsg, '*');
        }
    };

    // 2. Setup function called by Runner
    window.__setupHonoMock = function(HonoClass) {
        if (!HonoClass) {
            console.error("[Hono Mock] HonoClass is undefined");
            return;
        }

        // Always patch/re-patch to ensure fresh closure context if needed
        HonoClass.prototype.fire = function() {
            window.__startHonoServer(this);
        };
        
        // Also patch .listen() for Express-style compatibility
        HonoClass.prototype.listen = function() {
            window.__startHonoServer(this);
        };

        // Bridge for require('hono') logic in the runner
        window.__MODULE_REGISTRY__['hono'] = { 
            get Hono() { return window.Hono; } 
        };
    };

    const requestHandler = async (event) => {
        if (event.data && event.data.type === 'SIMULATE_REQUEST') {
            const { method, url } = event.data.payload;
            
            if (!window.appInstance) {
                const errorMsg = "Server not started. Ensure you 'export default app', 'app.fire()', or 'app.listen()'.";
                console.error("[Hono Mock] Error:", errorMsg);
                sendPayload('RUNTIME_ERROR', errorMsg);
                return;
            }

            console.log(\`[Hono] Incoming Request: \${method} \${url}\`);

            try {
                // Mock the request object
                // Note: 'url' includes query params (e.g. /path?q=1), which Request/URL handles automatically
                const req = new Request('http://localhost' + url, { method });
                
                // app.fetch is the standard entry point for Hono
                const res = await window.appInstance.fetch(req);
                
                const status = res.status;
                const contentType = res.headers.get('content-type') || '';
                
                let data;
                if (contentType.includes('application/json')) {
                    try { data = await res.json(); } catch (e) { data = await res.text(); }
                } else {
                    data = await res.text();
                }

                const completeMsg = { type: 'REQUEST_COMPLETE', payload: { status, data } };
                if (window.messagePort) window.messagePort.postMessage(completeMsg);
                else window.parent.postMessage(completeMsg, '*');

            } catch (err) {
                console.error("[Hono Mock] Simulation error:", err);
                sendPayload('RUNTIME_ERROR', err.message);
            }
        }
    };

    window.addEventListener('message', (event) => {
        if (event.source !== window.parent) return;
        requestHandler(event);
    });

    // Attach to messagePort if available
    const checkPortInterval = setInterval(() => {
        if (window.messagePort) {
            window.messagePort.addEventListener('message', requestHandler);
            window.messagePort.start();
            clearInterval(checkPortInterval);
        }
    }, 100);
`,ts="allow-scripts allow-modals allow-forms",wl='<script src="https://unpkg.com/@babel/standalone@7.26.4/babel.min.js"><\/script>',Vr=['<script crossorigin src="https://unpkg.com/react@18.3.1/umd/react.development.js"><\/script>','<script crossorigin src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js"><\/script>',wl],ls='<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"><\/script>',cv=[ls,'<script src="https://cdn.jsdelivr.net/gh/rmccrear/p5.play@v2.0.0-codex.1/lib/p5.play.js"><\/script>'],ac=`
  #root {
    padding: 0;
    overflow: hidden;
  }

  canvas.p5Canvas {
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    margin: 0 !important;
    border: 2px solid rgba(37, 99, 235, 0.85);
    border-radius: 6px;
    box-sizing: border-box;
  }

  body.dark canvas.p5Canvas {
    border-color: rgba(96, 165, 250, 0.95);
  }
`,Zr='<script type="module">import { Hono } from "https://esm.sh/hono@4.1.0"; window.Hono = Hono;<\/script>',li=`
  #root {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    padding: 0;
  }

  .cs-script-banner,
  .cs-hint-banner {
    flex-shrink: 0;
    padding: 6px 12px;
    font-size: 12px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .cs-script-banner {
    background: #fef3c7;
    color: #92400e;
    border-bottom: 1px solid #fcd34d;
  }

  .cs-hint-banner {
    background: #dbeafe;
    color: #1e40af;
    border-bottom: 1px solid #93c5fd;
  }

  .cs-html-frame {
    flex: 1;
    width: 100%;
    border: none;
    display: block;
    background: #fff;
  }
`,$i={html:{name:"HTML (single file)",showPlaceholder:!1,styles:li,logic:`
      window.__RUN_MODE__ = (code, root) => {
        root.innerHTML = '';
        // The buffer renders verbatim as the srcdoc of a nested iframe with
        // sandbox="" — script execution is blocked by the browser sandbox
        // itself (nested sandbox flags intersect, so the outer frame's
        // allow-scripts does not leak in). The DOMParser pass below only
        // DETECTS script tags to show the learner a banner; it must not be
        // "upgraded" to stripping, and sandbox="" must stay empty.
        const probe = new DOMParser().parseFromString(code, 'text/html');
        if (probe.querySelector('script')) {
          const banner = document.createElement('div');
          banner.className = 'cs-script-banner';
          banner.textContent = '\\u26a0 <script> is ignored in HTML & CSS mode \\u2014 switch to the DOM mode to write JavaScript.';
          root.appendChild(banner);
        }
        const frame = document.createElement('iframe');
        frame.setAttribute('sandbox', '');
        frame.className = 'cs-html-frame';
        frame.srcdoc = code;
        root.appendChild(frame);
      };
    `},"html-css":{name:"HTML & CSS (style.css)",showPlaceholder:!1,styles:li,logic:`
      window.__RUN_MODE__ = (code, root) => {
        root.innerHTML = '';
        // Inline copy of parseFileBundle from runtime/fileBundle.ts — the
        // iframe kernel cannot import modules. Keep the two in sync.
        let files;
        try {
          const parsed = JSON.parse(code);
          files = (parsed && parsed.__csFiles__ === 1 && parsed.files)
            ? { html: String(parsed.files['index.html'] ?? ''), css: String(parsed.files['style.css'] ?? '') }
            : { html: code, css: '' };
        } catch (e) { files = { html: code, css: '' }; }

        const doc = new DOMParser().parseFromString(files.html, 'text/html');

        if (doc.querySelector('script')) {
          const banner = document.createElement('div');
          banner.className = 'cs-script-banner';
          banner.textContent = '\\u26a0 <script> is ignored in HTML & CSS mode \\u2014 switch to the DOM mode to write JavaScript.';
          root.appendChild(banner);
        }

        // Strict link semantics: only a literal style.css href resolves to
        // the css tab. Scripts are still blocked by the inner sandbox=""
        // attribute below, not by stripping — do not change either rule.
        const links = doc.querySelectorAll('link[rel="stylesheet"][href="style.css"]');
        links.forEach((link) => {
          const style = doc.createElement('style');
          style.textContent = files.css;
          link.replaceWith(style);
        });
        if (links.length === 0 && files.css.trim()) {
          const hint = document.createElement('div');
          hint.className = 'cs-hint-banner';
          hint.textContent = 'style.css is not linked \\u2014 add <link rel="stylesheet" href="style.css"> inside <head>.';
          root.appendChild(hint);
        }

        const frame = document.createElement('iframe');
        frame.setAttribute('sandbox', '');
        frame.className = 'cs-html-frame';
        frame.srcdoc = '<!DOCTYPE html>' + doc.documentElement.outerHTML;
        root.appendChild(frame);
      };
    `},"html-js":{name:"HTML & JavaScript (script.js)",showPlaceholder:!1,styles:li,logic:`
      window.__RUN_MODE__ = (code, root) => {
        root.replaceChildren();
        // Inline copy of the bounded bundle parser from runtime/fileBundle.ts.
        // The iframe kernel cannot import modules; keep both copies in sync.
        let files;
        try {
          const parsed = JSON.parse(code);
          files = (parsed && parsed.__csFiles__ === 1 && parsed.files)
            ? { html: String(parsed.files['index.html'] ?? ''), js: String(parsed.files['script.js'] ?? '') }
            : { html: code, js: '' };
        } catch (e) { files = { html: code, js: '' }; }

        const doc = new DOMParser().parseFromString(files.html, 'text/html');
        const linkedScript = doc.querySelector('script[src="script.js"]');

        // Learner HTML never creates a second execution path. The bundled
        // script.js file is the only JavaScript this mode executes.
        doc.querySelectorAll('script').forEach((script) => script.remove());

        if (!linkedScript && files.js.trim()) {
          const hint = document.createElement('div');
          hint.className = 'cs-hint-banner';
          hint.textContent = 'script.js is not linked \\u2014 add <script src="script.js"><\\/script> before </body>.';
          root.appendChild(hint);
        }

        doc.body.childNodes.forEach((node) => {
          root.appendChild(document.importNode(node, true));
        });

        if (!linkedScript) return;
        try { new Function('root', files.js)(root); } catch (e) { console.error(e); }
      };
    `},"html-css-js":{name:"HTML, CSS & JavaScript (3 files)",showPlaceholder:!1,styles:li,logic:`
      window.__RUN_MODE__ = (code, root) => {
        root.replaceChildren();
        document.querySelectorAll('style[data-code-shoebox-html-css-js]').forEach((style) => style.remove());

        // Inline copy of the bounded bundle parser from runtime/fileBundle.ts.
        // The iframe kernel cannot import modules; keep both copies in sync.
        let files;
        try {
          const parsed = JSON.parse(code);
          files = (parsed && parsed.__csFiles__ === 1 && parsed.files)
            ? {
                html: String(parsed.files['index.html'] ?? ''),
                css: String(parsed.files['style.css'] ?? ''),
                js: String(parsed.files['script.js'] ?? '')
              }
            : { html: code, css: '', js: '' };
        } catch (e) { files = { html: code, css: '', js: '' }; }

        const doc = new DOMParser().parseFromString(files.html, 'text/html');
        const linkedStyles = doc.querySelector('link[rel="stylesheet"][href="style.css"]');
        const linkedScript = doc.querySelector('script[src="script.js"]');

        // The bundled files are the only CSS/JS resource paths in this mode.
        // Detect their markers first, then remove every parsed resource node.
        doc.querySelectorAll('script').forEach((script) => script.remove());
        doc.querySelectorAll('link[rel~="stylesheet"]').forEach((link) => link.remove());

        if (linkedStyles) {
          const style = document.createElement('style');
          style.setAttribute('data-code-shoebox-html-css-js', '');
          style.textContent = files.css;
          document.head.appendChild(style);
        } else if (files.css.trim()) {
          const hint = document.createElement('div');
          hint.className = 'cs-hint-banner';
          hint.textContent = 'style.css is not linked \\u2014 add <link rel="stylesheet" href="style.css"> inside <head>.';
          root.appendChild(hint);
        }

        if (!linkedScript && files.js.trim()) {
          const hint = document.createElement('div');
          hint.className = 'cs-hint-banner';
          hint.textContent = 'script.js is not linked \\u2014 add <script src="script.js"><\\/script> before </body>.';
          root.appendChild(hint);
        }

        doc.body.childNodes.forEach((node) => {
          root.appendChild(document.importNode(node, true));
        });

        if (!linkedScript) return;
        try { new Function('root', files.js)(root); } catch (e) { console.error(e); }
      };
    `},dom:{name:"DOM",logic:`
      window.__RUN_MODE__ = (code, root, options = {}) => {
        root.replaceChildren();
        document.querySelectorAll('style[data-code-shoebox-fixture]').forEach((style) => style.remove());

        if (options.fixtureCss !== undefined) {
          const fixtureStyle = document.createElement('style');
          fixtureStyle.setAttribute('data-code-shoebox-fixture', '');
          fixtureStyle.textContent = options.fixtureCss;
          document.head.appendChild(fixtureStyle);
        }

        if (options.fixtureHtml !== undefined) {
          const fixtureDocument = new DOMParser().parseFromString(options.fixtureHtml, 'text/html');
          const fixtureFragment = document.createDocumentFragment();
          fixtureDocument.body.childNodes.forEach((node) => {
            fixtureFragment.appendChild(document.importNode(node, true));
          });
          root.appendChild(fixtureFragment);
        }

        try { new Function('root', code)(root); } catch (e) { console.error(e); }
      };
    `},typescript:{name:"TypeScript",cdns:[wl],babelPresets:["typescript","env"],logic:`
      window.__RUN_MODE__ = (code, root) => {
        root.innerHTML = '';
        try {
          const transpiled = Babel.transform(code, { presets: ['env', 'typescript'], filename: 'script.ts' }).code;
          new Function('root', transpiled)(root);
        } catch (e) { console.error(e); }
      };
    `},p5play:{name:"p5.js + p5.play",cdns:cv,styles:ac,logic:`
      let instance = null;
      window.__RUN_MODE__ = (code, root) => {
        if (instance) instance.remove();
        root.innerHTML = '';
        window.setup = window.draw = null;
        const observer = new MutationObserver(m => {
          m.forEach(mutation => mutation.addedNodes.forEach(node => {
            if (node.tagName === 'CANVAS' && node.classList.contains('p5Canvas')) root.appendChild(node);
          }));
        });
        observer.observe(document.body, { childList: true });
        try {
          // Game Lab semantics: the canvas and p5 globals exist BEFORE student
          // code runs, so top-level statements like createSprite() work.
          // p5's redraw() looks up window.draw each frame, so a draw() defined
          // by the eval below is picked up even though the instance already exists.
          instance = new p5();
          window.createCanvas(400, 400);
          window.eval(code);
          if (typeof window.setup === 'function') window.setup();
        } catch (e) { console.error(e); }
      };
    `},p5:{name:"p5.js",cdns:[ls],styles:ac,logic:`
      let instance = null;
      window.__RUN_MODE__ = (code, root) => {
        if (instance) instance.remove();
        root.innerHTML = '';
        window.setup = window.draw = null;
        const observer = new MutationObserver(m => {
          m.forEach(mutation => mutation.addedNodes.forEach(node => {
            if (node.tagName === 'CANVAS' && node.classList.contains('p5Canvas')) root.appendChild(node);
          }));
        });
        observer.observe(document.body, { childList: true });
        try { window.eval(code); instance = new p5(); } catch (e) { console.error(e); }
      };
    `},"p5-ts":{name:"p5.js TS",cdns:[ls,wl],babelPresets:["typescript","env"],styles:ac,logic:`
      let instance = null;
      window.__RUN_MODE__ = (code, root) => {
        if (instance) instance.remove();
        root.innerHTML = '';
        window.setup = window.draw = null;
        const observer = new MutationObserver(m => {
          m.forEach(mutation => mutation.addedNodes.forEach(node => {
            if (node.tagName === 'CANVAS' && node.classList.contains('p5Canvas')) root.appendChild(node);
          }));
        });
        observer.observe(document.body, { childList: true });
        try {
          const transpiled = Babel.transform(code, { 
            presets: ['env', 'typescript'], 
            filename: 'sketch.ts' 
          }).code;
          window.eval(transpiled); 
          instance = new p5(); 
        } catch (e) { console.error(e); }
      };
    `},react:{name:"React",cdns:Vr,babelPresets:["react","env"],logic:`
      let rootInstance = null;
      const originalCreateRoot = window.ReactDOM.createRoot;
      window.ReactDOM.createRoot = (c, o) => {
        const r = originalCreateRoot.call(window.ReactDOM, c, o);
        if (c.id === 'root') rootInstance = r;
        return r;
      };
      window.__RUN_MODE__ = (code, root) => {
        if (rootInstance) { try { rootInstance.unmount(); } catch(e){} rootInstance = null; }
        root.innerHTML = '';
        try {
          const compiled = Babel.transform(code, { presets: ['react', 'env'], filename: 'App.js' }).code;
          eval(compiled);
        } catch (e) { console.error(e); }
      };
    `},"react-ts":{name:"React TS",cdns:Vr,babelPresets:["react","typescript","env"],logic:`
      let rootInstance = null;
      const originalCreateRoot = window.ReactDOM.createRoot;
      window.ReactDOM.createRoot = (c, o) => {
        const r = originalCreateRoot.call(window.ReactDOM, c, o);
        if (c.id === 'root') rootInstance = r;
        return r;
      };
      window.__RUN_MODE__ = (code, root) => {
        if (rootInstance) { try { rootInstance.unmount(); } catch(e){} rootInstance = null; }
        root.innerHTML = '';
        try {
          const compiled = Babel.transform(code, { presets: ['react', 'typescript', 'env'], filename: 'App.tsx' }).code;
          eval(compiled);
        } catch (e) { console.error(e); }
      };
    `},express:{name:"Express",mocks:Xr,showPlaceholder:!1,logic:`
      window.__MODULE_REGISTRY__['express'] = window.express;
      window.__RUN_MODE__ = (code, root) => {
        root.innerHTML = '';
        if (window.appInstance) window.appInstance.routes = { GET: {} };
        try { eval(code); } catch (e) { console.error(e); }
      };
    `},"express-ts":{name:"Express TS",cdns:[wl],mocks:Xr,showPlaceholder:!1,logic:`
      window.__MODULE_REGISTRY__['express'] = window.express;
      window.__RUN_MODE__ = (code, root) => {
        root.innerHTML = '';
        if (window.appInstance) window.appInstance.routes = { GET: {} };
        try {
          var exports = {};
          var module = { exports: exports };
          const transpiled = Babel.transform(code, {
            presets: [['env', { modules: 'commonjs' }], 'typescript'],
            filename: 'server.ts',
            sourceType: 'module'
          }).code;
          new Function('module', 'exports', transpiled)(module, exports);
        } catch (e) { console.error(e); }
      };
    `},hono:{name:"Hono",cdns:[Zr,wl],mocks:Qr,showPlaceholder:!1,logic:`
      window.__RUN_MODE__ = (code, root) => {
        root.innerHTML = '';
        const run = () => {
          if (!window.Hono || !window.Babel) {
            setTimeout(run, 50);
            return;
          }
          
          if (window.__setupHonoMock) window.__setupHonoMock(window.Hono);
          
          // Reset previous instance
          window.appInstance = null;

          try {
            // Setup CommonJS shim to capture exports
            var exports = {};
            var module = { exports: exports };
            
            // Transpile to handle 'export default'
            const transpiled = Babel.transform(code, {
                presets: [['env', { modules: 'commonjs' }]],
                filename: 'index.js',
                sourceType: 'module'
            }).code;

            // Execute code
            // We use 'call' to provide the 'this' context if needed, but mostly rely on scope
            new Function('module', 'exports', transpiled)(module, exports);

            // Check for exports
            const exportedApp = module.exports.default || module.exports;
            
            // If the user exported a Hono app, start it automatically
            if (exportedApp && typeof exportedApp.fetch === 'function') {
                window.__startHonoServer(exportedApp);
            }

          } catch (e) { console.error(e); }
        };
        run();
      };
    `},"hono-ts":{name:"Hono TS",cdns:[Zr,wl],mocks:Qr,showPlaceholder:!1,logic:`
      window.__RUN_MODE__ = (code, root) => {
        root.innerHTML = '';
        const run = () => {
          if (!window.Hono || !window.Babel) {
            setTimeout(run, 50);
            return;
          }
          
          if (window.__setupHonoMock) window.__setupHonoMock(window.Hono);

          // Reset previous instance
          window.appInstance = null;

          try {
            // Setup CommonJS shim to capture exports
            var exports = {};
            var module = { exports: exports };

            const transpiled = Babel.transform(code, {
              presets: [['env', { modules: 'commonjs' }], 'typescript'],
              filename: 'server.ts',
              sourceType: 'module'
            }).code;
            
            new Function('module', 'exports', transpiled)(module, exports);

            // Check for exports
            const exportedApp = module.exports.default || module.exports;
            
            // If the user exported a Hono app, start it automatically
            if (exportedApp && typeof exportedApp.fetch === 'function') {
                window.__startHonoServer(exportedApp);
            }

          } catch (e) { console.error(e); }
        };
        run();
      };
    `},"node-js":{name:"Node JS",showPlaceholder:!1,headless:!0,logic:`
      window.__RUN_MODE__ = (code, root) => {
        root.innerHTML = '<div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; opacity:0.3;">💻 Console Environment</div>';
        try { new Function('document', 'window', 'root', code)(null, null, null); } catch (e) { console.error(e); }
      };
    `},"node-ts":{name:"Node TS",cdns:[wl],showPlaceholder:!1,headless:!0,logic:`
      window.__RUN_MODE__ = (code, root) => {
        root.innerHTML = '<div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; opacity:0.3;">💻 TS Console Environment</div>';
        try {
          const transpiled = Babel.transform(code, { presets: ['env', 'typescript'], filename: 'index.ts' }).code;
          new Function('document', 'window', 'root', transpiled)(null, null, null);
        } catch (e) { console.error(e); }
      };
    `}};$i["html-js-css-media"]={...$i["html-css-js"],name:"HTML, CSS, JavaScript & Media (4 tabs)"};const ph=(e="dom",t=!1)=>{const l=$i[e]||$i.dom;return uv({cdns:l.cdns,mocks:l.mocks,styles:l.styles,logic:l.logic||"",showPlaceholder:t?!1:l.showPlaceholder})},Va=(e,t,l)=>{const a=l===void 0?{type:"EXECUTE",code:t}:{type:"EXECUTE",code:t,payload:l};e.postMessage(a,"*")},yh=({themeMode:e,isReady:t,children:l,overlayMessage:a})=>o.jsxs("div",{className:`w-full h-full rounded-md overflow-hidden shadow-inner relative border transition-colors duration-300 ${e==="dark"?"bg-[#1a1a1a] border-gray-700":"bg-white border-gray-200"}`,children:[l,!t&&o.jsx("div",{className:"absolute inset-0 flex items-center justify-center pointer-events-none bg-black/5",children:o.jsx("p",{className:"text-gray-400 font-medium",children:a||"Click 'Run Code' to execute"})})]}),ut=({children:e,variant:t="primary",icon:l,className:a="",...n})=>{const i="flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2",u={primary:"bg-[hsl(var(--primary))] hover:opacity-90 text-[hsl(var(--primary-foreground))] focus:ring-[hsl(var(--ring))]",secondary:"bg-gray-700 hover:bg-gray-600 text-white focus:ring-gray-500",ghost:"bg-transparent hover:bg-black/10 dark:hover:bg-white/10 text-inherit focus:ring-gray-500"};return o.jsxs("button",{className:`${i} ${u[t]} ${a}`,...n,children:[l&&o.jsx("span",{className:"w-4 h-4",children:l}),e]})},gh=ll.memo(function({logs:t,onClear:l,themeMode:a,className:n=""}){return o.jsxs("div",{className:`flex flex-col h-full w-full overflow-hidden ${n} ${a==="dark"?"bg-[#1e1e1e]":"bg-gray-50"}`,children:[o.jsxs("div",{className:`flex items-center justify-between px-3 py-1 shrink-0 border-b ${a==="dark"?"border-white/10 bg-[#252526]":"border-gray-200 bg-gray-100"}`,children:[o.jsxs("div",{className:"flex items-center gap-2 text-xs font-semibold opacity-70",children:[o.jsx(qy,{className:"w-3 h-3"}),o.jsxs("span",{children:["Console (",t.length,")"]})]}),o.jsx(ut,{variant:"ghost",onClick:l,className:"!p-1 h-6 w-6",title:"Clear Console",children:o.jsx(wy,{className:"w-3 h-3"})})]}),o.jsxs("div",{className:`flex-1 overflow-y-auto p-2 font-mono text-xs space-y-1 ${a==="dark"?"text-gray-300":"text-gray-700"}`,children:[t.length===0&&o.jsx("div",{className:"h-full flex flex-col items-center justify-center opacity-30 select-none",children:o.jsx("span",{className:"italic",children:"No output"})}),t.map((i,u)=>o.jsxs("div",{className:`
            border-b border-transparent hover:bg-black/5 dark:hover:bg-white/5 px-1 py-0.5 break-all whitespace-pre
            ${i.type==="error"?"text-red-500 bg-red-500/5":""}
            ${i.type==="warn"?"text-yellow-500 bg-yellow-500/5":""}
          `,children:[o.jsx("span",{className:"opacity-50 mr-2 select-none",children:">"}),i.content]},u))]})]})}),sv=500,Jr=(e,t)=>e.length>=sv?[...e.slice(-499),t]:[...e,t],ov=({runTrigger:e,code:t,themeMode:l,environmentMode:a,fixtureHtml:n,fixtureCss:i,isBlurred:u=!1,isPredictionMode:c=!1,debugMode:s=!1})=>{const r=b.useRef(null),p=b.useRef(null),y=b.useRef(null),m=b.useRef({code:t,environmentMode:a,fixtureHtml:n,fixtureCss:i,debugMode:s}),[g,x]=b.useState([]),[_,A]=b.useState(150),[d,f]=b.useState(!1),h=a==="node-js"||a==="node-ts",v=a==="html"||a==="html-css",T=b.useCallback((H,K="log")=>{x(N=>Jr(N,{type:K,content:`[System] ${H}`,timestamp:Date.now()}))},[]),j=b.useMemo(()=>ph(a,c),[a,c]);b.useEffect(()=>{m.current={code:t,environmentMode:a,fixtureHtml:n,fixtureCss:i,debugMode:s}},[t,a,n,i,s]);const E=b.useCallback(H=>{if(!H||typeof H!="object")return;const{type:K,payload:N}=H;K==="CONSOLE_LOG"||K==="RUNTIME_ERROR"||K==="CONSOLE_WARN"?x(M=>Jr(M,{type:K==="RUNTIME_ERROR"?"error":K==="CONSOLE_WARN"?"warn":"log",content:N,timestamp:Date.now()})):K==="READY_SIGNAL"&&s&&T("Sandbox Iframe Ready Signal Received via MessageChannel.")},[s,T]),O=b.useRef(E);b.useEffect(()=>{O.current=E},[E]),b.useEffect(()=>()=>{y.current?.port1.close(),y.current=null},[]),b.useEffect(()=>{if(e>0){const H=m.current;x([]),H.debugMode&&T("Attempting to execute code..."),r.current?.contentWindow?(H.environmentMode==="dom"&&(H.fixtureHtml!==void 0||H.fixtureCss!==void 0)?Va(r.current.contentWindow,H.code,{fixtureHtml:H.fixtureHtml,fixtureCss:H.fixtureCss}):Va(r.current.contentWindow,H.code),H.debugMode&&T("EXECUTE message dispatched.")):H.debugMode&&T("FAILED: iframe.contentWindow is null.","error")}},[e,T]),b.useEffect(()=>{r.current?.contentWindow&&r.current.contentWindow.postMessage({type:"THEME",mode:l},"*")},[l]),b.useEffect(()=>{if(!v)return;const H=setTimeout(()=>{r.current?.contentWindow&&Va(r.current.contentWindow,t)},500);return()=>clearTimeout(H)},[t,v]);const C=()=>{if(s&&T('Iframe "onLoad" event fired.'),!r.current?.contentWindow)return;y.current?.port1.close();const H=new MessageChannel;y.current=H,H.port1.onmessage=K=>O.current(K.data),r.current.contentWindow.postMessage({type:"INIT_PORT"},"*",[H.port2]),r.current.contentWindow.postMessage({type:"THEME",mode:l},"*"),v&&Va(r.current.contentWindow,t),s&&T("Channel Ports initialized.")},w=H=>{H.preventDefault(),f(!0)},X=b.useCallback(H=>{if(!d||!p.current)return;const K=p.current.getBoundingClientRect(),N=H.clientY-K.top,M=K.height-N;A(Math.max(30,Math.min(K.height*.8,M)))},[d]),F=b.useCallback(()=>f(!1),[]);return b.useEffect(()=>(d?(window.addEventListener("mousemove",X),window.addEventListener("mouseup",F),document.body.style.cursor="row-resize"):(window.removeEventListener("mousemove",X),window.removeEventListener("mouseup",F),document.body.style.cursor=""),()=>{window.removeEventListener("mousemove",X),window.removeEventListener("mouseup",F)}),[d,X,F]),o.jsx(yh,{themeMode:l,isReady:v||e>0,overlayMessage:u?"Make your Prediction":void 0,children:o.jsxs("div",{ref:p,className:"w-full h-full flex flex-col relative",children:[!h&&o.jsx("div",{className:"flex-1 min-h-0 relative",children:o.jsx("iframe",{ref:r,srcDoc:j,title:"Code Output",sandbox:ts,className:`w-full h-full border-none ${d?"pointer-events-none":""}`,onLoad:C},`${a}-${c}`)}),!h&&!v&&o.jsx("div",{onMouseDown:w,className:`h-3 shrink-0 flex items-center justify-center cursor-row-resize z-10 hover:bg-blue-500 hover:text-white transition-colors ${l==="dark"?"bg-[#252526] text-gray-600 border-t border-b border-black/20":"bg-gray-100 text-gray-400 border-t border-b border-gray-200"}`,children:o.jsx(io,{className:"w-3 h-3"})}),!v&&o.jsx("div",{style:{height:h?"100%":_},className:"shrink-0 min-h-0",children:o.jsx(gh,{logs:g,onClear:()=>x([]),themeMode:l})}),h&&o.jsx("iframe",{ref:r,srcDoc:j,title:"Headless Execution",sandbox:ts,className:"hidden",onLoad:C},`headless-${a}`)]})})},rv=500,nc=(e,t)=>e.length>=rv?[...e.slice(-499),t]:[...e,t],fv=({runTrigger:e,code:t,themeMode:l,environmentMode:a,isBlurred:n=!1,debugMode:i=!1,onTriggerRun:u})=>{const c=b.useRef(null),s=b.useRef(null),r=b.useRef(null),[p,y]=b.useState([]),[m,g]=b.useState("/"),[x]=b.useState("GET"),[_,A]=b.useState(null),[d,f]=b.useState(null),[h,v]=b.useState(!1),[T,j]=b.useState(!1),[E,O]=b.useState(null),C=b.useRef(null),w=b.useRef(null),[X,F]=b.useState(150),[H,K]=b.useState(!1),N=b.useCallback(U=>{y(V=>nc(V,{type:"log",content:`[System] ${U}`,timestamp:Date.now()}))},[]),M=b.useCallback(()=>y([]),[]),z=b.useCallback((U,V)=>{if(!r.current)return;const Le={type:"SIMULATE_REQUEST",payload:{method:U,url:V}};i&&N(`Sending Request: ${U} ${V}`),r.current.port1.postMessage(Le)},[i,N]),R=b.useCallback(U=>{if(!U||typeof U!="object")return;const{type:V,payload:Le}=U;switch(V){case"SERVER_READY":j(!0),O(null),N("Server signaled ready."),f(pt=>(pt&&z(pt.method,pt.url),null));break;case"REQUEST_COMPLETE":A(Le),v(!1),i&&N(`Request Success: Status ${Le.status}`);break;case"RUNTIME_ERROR":O(Le),v(!1),f(null),y(pt=>nc(pt,{type:"error",content:Le,timestamp:Date.now()})),j(!1);break;case"CONSOLE_LOG":case"CONSOLE_WARN":y(pt=>nc(pt,{type:V==="CONSOLE_WARN"?"warn":"log",content:Le,timestamp:Date.now()}));break;case"CONSOLE_CLEAR":M();break;case"READY_SIGNAL":i&&N("Sandbox established MessageChannel port.");break}},[i,N,M,z]),Q=b.useRef(R);b.useEffect(()=>{Q.current=R},[R]),b.useEffect(()=>()=>{r.current?.port1.close(),r.current=null},[]),b.useEffect(()=>{const U=V=>{V.source===c.current?.contentWindow&&V.data&&typeof V.data=="object"&&V.data.type&&Q.current(V.data)};return window.addEventListener("message",U),()=>window.removeEventListener("message",U)},[]);const ce=b.useMemo(()=>ph(a),[a]);b.useEffect(()=>{e>0&&c.current?.contentWindow&&(j(!1),A(null),O(null),y([]),f(U=>U||(v(!0),{method:x,url:m})),i&&N("Executing server code..."),Va(c.current.contentWindow,t))},[e,t,i,N,x,m]),b.useEffect(()=>{c.current?.contentWindow&&c.current.contentWindow.postMessage({type:"THEME",mode:l},"*")},[l]);const se=()=>{if(i&&N("Server Iframe loaded."),!c.current?.contentWindow)return;r.current?.port1.close();const U=new MessageChannel;r.current=U,U.port1.onmessage=V=>Q.current(V.data),c.current.contentWindow.postMessage({type:"INIT_PORT"},"*",[U.port2]),c.current.contentWindow.postMessage({type:"THEME",mode:l},"*")},be=()=>{v(!0),A(null),O(null),f({method:x,url:m}),u?u():console.warn("ServerOutput: onTriggerRun prop missing")};b.useEffect(()=>{if(!h||!d||T||E){C.current&&(window.clearTimeout(C.current),C.current=null);return}return C.current=window.setTimeout(()=>{v(!1),f(null),j(!1),O("Server startup timed out. For Express, ensure your code calls app.listen(...). For Hono, export default app (or call app.fire/app.listen)."),N("Server startup timed out while waiting for SERVER_READY.")},5e3),()=>{C.current&&(window.clearTimeout(C.current),C.current=null)}},[h,d,T,E,N]),b.useEffect(()=>{if(!h||d||E){w.current&&(window.clearTimeout(w.current),w.current=null);return}return w.current=window.setTimeout(()=>{v(!1),O("Request timed out. Check that your route handler sends a response: res.send()/res.json() for Express, or return a Response for Hono."),N("Request timed out while waiting for REQUEST_COMPLETE.")},1e4),()=>{w.current&&(window.clearTimeout(w.current),w.current=null)}},[h,d,E,N]);const ht=U=>{U.preventDefault(),K(!0)},de=b.useCallback(U=>{if(!H||!s.current)return;const V=s.current.getBoundingClientRect(),Le=U.clientY-V.top,pt=V.height-Le;F(Math.max(30,Math.min(V.height*.8,pt)))},[H]),Ue=b.useCallback(()=>K(!1),[]);b.useEffect(()=>(H?(window.addEventListener("mousemove",de),window.addEventListener("mouseup",Ue)):(window.removeEventListener("mousemove",de),window.removeEventListener("mouseup",Ue)),()=>{window.removeEventListener("mousemove",de),window.removeEventListener("mouseup",Ue)}),[H,de,Ue]);const Un=e>0;return o.jsxs("div",{className:"flex flex-col h-full w-full gap-2",children:[o.jsxs("div",{className:`flex items-center gap-2 p-2 rounded-md border transition-colors ${l==="dark"?"bg-[#252526] border-white/10":"bg-white border-gray-200"}`,children:[o.jsx("div",{className:`px-3 py-1.5 rounded text-xs font-bold tracking-wider ${l==="dark"?"bg-blue-900/50 text-blue-400":"bg-blue-100 text-blue-700"}`,children:x}),o.jsx("input",{type:"text",value:m,onChange:U=>g(U.target.value),placeholder:"/api/inventory",className:`flex-1 bg-transparent border-none outline-none text-sm font-mono ${l==="dark"?"text-white placeholder-gray-600":"text-gray-800 placeholder-gray-400"}`,onKeyDown:U=>U.key==="Enter"&&be()}),o.jsx(ut,{onClick:be,disabled:h||n,className:"!py-1 !px-3 h-8 text-xs",title:"Restart Server & Send Request",children:h?d?"Starting...":"Sending...":"Send"})]}),o.jsx(yh,{themeMode:l,isReady:Un,overlayMessage:n?"Make your Prediction":void 0,children:o.jsxs("div",{ref:s,className:"flex flex-col h-full relative",children:[h&&o.jsxs("div",{className:"absolute top-2 right-2 z-10 flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs shadow-lg backdrop-blur-md",children:[o.jsx(Oy,{className:"w-3 h-3 animate-pulse"}),o.jsx("span",{children:d?"Starting Server...":"Processing..."})]}),o.jsx("div",{className:`flex-1 overflow-auto p-4 font-mono text-sm ${l==="dark"?"bg-[#1e1e1e]":"bg-gray-50"}`,children:E?o.jsxs("div",{className:"p-4 border border-red-500/20 rounded bg-red-500/5 text-red-400",children:[o.jsxs("div",{className:"flex items-center gap-2 text-red-500 font-bold mb-2",children:[o.jsx(jy,{className:"w-4 h-4"}),o.jsx("span",{children:"Runtime Error"})]}),o.jsx("pre",{className:"whitespace-pre-wrap break-all",children:E})]}):_?o.jsxs("div",{className:"animate-in fade-in slide-in-from-top-2 duration-300",children:[o.jsx("div",{className:"flex items-center justify-between mb-4 pb-2 border-b border-dashed border-gray-500/20",children:o.jsxs("span",{className:`font-bold ${_.status<300?"text-green-500":"text-red-500"}`,children:[_.status," ",_.status===200?"OK":""]})}),o.jsx("pre",{className:`${l==="dark"?"text-blue-300":"text-blue-700"}`,children:JSON.stringify(_.data,null,2)})]}):o.jsxs("div",{className:"h-full flex flex-col items-center justify-center opacity-20",children:[o.jsx(uh,{className:"w-12 h-12 mb-2"}),o.jsx("p",{children:"Server Standby"})]})}),o.jsx("div",{onMouseDown:ht,className:`h-3 shrink-0 flex items-center justify-center cursor-row-resize ${l==="dark"?"bg-[#252526] text-gray-600 border-t border-b border-black/20":"bg-gray-100 text-gray-400 border-t border-b border-gray-200"}`,children:o.jsx(io,{className:"w-3 h-3"})}),o.jsx("div",{style:{height:X},className:"shrink-0 min-h-0",children:o.jsx(gh,{logs:p,onClear:M,themeMode:l})}),o.jsx("iframe",{ref:c,srcDoc:ce,title:"Server Execution",sandbox:ts,className:"hidden",onLoad:se},`server-${a}`)]})})]})},vh=["index.html","style.css"],dv=["index.html","script.js"],Kr=["index.html","style.css","script.js"],rt=e=>JSON.stringify({__csFiles__:1,files:e});function mv(e,t=vh){try{const l=JSON.parse(e);if(l&&l.__csFiles__===1&&l.files)return Object.fromEntries(t.map(a=>[a,String(l.files[a]??"")]))}catch{}return Object.fromEntries(t.map(l=>[l,l==="index.html"?e:""]))}const $r={"html-css":{files:vh,hasMediaTab:!1},"html-js":{files:dv,hasMediaTab:!1},"html-css-js":{files:Kr,hasMediaTab:!1},"html-js-css-media":{files:Kr,hasMediaTab:!0}},hv=e=>e==="html"?"index.html":`${e}.script`,pv=({code:e,onChange:t,onRun:l,isRunning:a,runTrigger:n,themeMode:i,environmentMode:u,fixtureHtml:c,fixtureCss:s,mediaAssets:r,sessionId:p,predictionPrompt:y,debugMode:m=!1})=>{const[g,x]=b.useState(""),[_,A]=b.useState(!1),[d,f]=b.useState("horizontal"),[h,v]=b.useState(.5),[T,j]=b.useState(!1),E=b.useRef(null),O=!y||g.trim().length>0,C=u in $r?$r[u]:null,w=C?.files??null,X=w!==null,F=u==="dom"&&(c!==void 0||s!==void 0),H=b.useMemo(()=>w?[...w,...C?.hasMediaTab?["media"]:[]]:F?["script.js",...c!==void 0?["index.html"]:[],...s!==void 0?["style.css"]:[]]:["script.js"],[w,C,F,c,s]),K=H.length>1,[N,M]=b.useState(X?"index.html":"script.js"),z=H.includes(N)?N:H[0],R=z==="media"?null:z,Q=b.useMemo(()=>w?mv(e,w):null,[w,e]);b.useEffect(()=>{H.includes(N)||M(H[0])},[N,H]);const ce=X&&Q&&R?Q[R]:F&&R==="index.html"?c??"":F&&R==="style.css"?s??"":e,se=U=>{const V=U||"";X&&Q&&R?t(rt({...Q,[R]:V})):(!F||R==="script.js")&&t(V)},be=()=>{y&&A(!0),l()},ht=U=>{U.preventDefault(),j(!0)},de=b.useCallback(U=>{if(!T||!E.current)return;const V=E.current.getBoundingClientRect(),Le=d==="horizontal"?(U.clientX-V.left)/V.width:(U.clientY-V.top)/V.height;v(Math.max(.2,Math.min(.8,Le)))},[T,d]),Ue=b.useCallback(()=>j(!1),[]);b.useEffect(()=>(T?(window.addEventListener("mousemove",de),window.addEventListener("mouseup",Ue)):(window.removeEventListener("mousemove",de),window.removeEventListener("mouseup",Ue)),()=>{window.removeEventListener("mousemove",de),window.removeEventListener("mouseup",Ue)}),[T,de,Ue]);const Un=u.startsWith("express")||u.startsWith("hono");return o.jsxs("div",{className:`flex-1 flex flex-col overflow-hidden ${i==="dark"?"bg-[#1e1e1e]":"bg-white"}`,children:[y&&o.jsx("div",{className:`p-4 border-b flex gap-4 ${i==="dark"?"bg-[#252526] border-white/10":"bg-blue-50 border-blue-100"}`,children:o.jsxs("div",{className:"flex-1",children:[o.jsx("h3",{className:"text-xs font-bold uppercase tracking-wider text-purple-500 mb-2",children:"Knowledge Check"}),o.jsx("div",{className:"text-sm opacity-80 mb-3",children:y}),o.jsx("textarea",{value:g,onChange:U=>x(U.target.value),disabled:_,placeholder:"What will happen when the code runs?",className:`w-full p-2 text-sm rounded border focus:ring-1 focus:ring-purple-500 outline-none transition-all ${i==="dark"?"bg-black/20 border-white/10 text-white":"bg-white border-gray-200"}`})]})}),o.jsxs("div",{className:`h-12 px-4 border-b flex items-center justify-between ${i==="dark"?"bg-[#1e1e1e] border-white/10 text-gray-400":"bg-white border-gray-100"}`,children:[o.jsxs("div",{className:"flex min-w-0 items-center gap-2 overflow-hidden",children:[o.jsx(vi,{className:"h-4 w-4 shrink-0 text-blue-500"}),K?o.jsx("div",{className:"flex min-w-0 items-center gap-1 overflow-x-auto whitespace-nowrap",children:H.map(U=>{const V=U==="media",Le=F&&U!=="script.js",pt=V||Le;return o.jsxs("button",{type:"button",onClick:()=>M(U),title:V?"Read-only media":Le?"Fixed fixture":void 0,"aria-pressed":z===U,className:`px-2 py-1 rounded text-xs font-mono font-medium transition-colors ${z===U?i==="dark"?"bg-white/10 text-blue-400":"bg-blue-50 text-blue-600":"opacity-50 hover:opacity-80"}`,children:[V?"Media":U,pt&&o.jsx(ah,{"aria-hidden":"true",className:"ml-1 inline h-3 w-3"})]},U)})}):o.jsx("span",{className:"text-xs font-mono font-medium hidden sm:inline",children:hv(u)})]}),o.jsxs("div",{className:"flex items-center gap-4",children:[o.jsxs("div",{className:"flex bg-black/5 dark:bg-white/5 p-0.5 rounded-lg border border-black/5 dark:border-white/5",children:[o.jsxs("button",{onClick:()=>f("horizontal"),title:"Split View (Side by Side)",className:`flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight transition-all ${d==="horizontal"?"bg-white dark:bg-gray-700 shadow-sm text-blue-500":"opacity-40 hover:opacity-60"}`,children:[o.jsx(Ry,{size:12}),o.jsx("span",{className:"hidden md:inline",children:"Split"})]}),o.jsxs("button",{onClick:()=>f("vertical"),title:"Vertical View (Stacked)",className:`flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight transition-all ${d==="vertical"?"bg-white dark:bg-gray-700 shadow-sm text-blue-500":"opacity-40 hover:opacity-60"}`,children:[o.jsx(Hy,{size:12}),o.jsx("span",{className:"hidden md:inline",children:"Stacked"})]})]}),!Un&&o.jsx(ut,{onClick:be,disabled:a||!O,variant:"primary",className:"h-8 !px-5 text-xs font-bold shadow-lg shadow-blue-500/20",icon:a?o.jsx(Cy,{className:"animate-pulse",size:14}):o.jsx(Dy,{size:14}),children:a?"RUNNING...":"RUN CODE"})]})]}),o.jsxs("div",{ref:E,className:`flex-1 flex overflow-hidden ${d==="horizontal"?"flex-row":"flex-col"}`,children:[o.jsx("div",{style:{[d==="horizontal"?"width":"height"]:`${h*100}%`},className:"relative flex flex-col min-w-0 min-h-0",children:z==="media"?o.jsx(av,{mediaAssets:u==="html-js-css-media"?r??[]:[],themeMode:i}):o.jsx(Pg,{code:ce,onChange:se,themeMode:i,environmentMode:u,sessionId:p,activeFile:K?R??void 0:void 0,readOnly:!!y&&_||F&&R!=="script.js"})}),o.jsx("div",{onMouseDown:ht,className:`flex items-center justify-center shrink-0 hover:bg-blue-500/50 transition-colors z-10 ${d==="horizontal"?"w-1.5 cursor-col-resize":"h-1.5 cursor-row-resize"} ${i==="dark"?"bg-black/40":"bg-gray-100"}`,children:d==="horizontal"?o.jsx(Ny,{size:10,className:"opacity-20"}):o.jsx(io,{size:10,className:"opacity-20"})}),o.jsx("div",{style:{[d==="horizontal"?"width":"height"]:`${(1-h)*100}%`},className:`relative flex flex-col min-w-0 min-h-0 ${T?"pointer-events-none":""}`,children:o.jsx("div",{className:"flex-1 p-2 md:p-3 overflow-hidden",children:Un?o.jsx(fv,{runTrigger:n,code:e,themeMode:i,environmentMode:u,isBlurred:!O,debugMode:m,onTriggerRun:be}):o.jsx(ov,{runTrigger:n,code:e,themeMode:i,environmentMode:u,fixtureHtml:u==="dom"?c:void 0,fixtureCss:u==="dom"?s:void 0,isBlurred:!O,isPredictionMode:!!y,debugMode:m})})})]})]})},Ae=({code:e,onCodeChange:t,environmentMode:l,fixtureHtml:a,fixtureCss:n,mediaAssets:i,theme:u,themeMode:c,sessionId:s=0,prediction_prompt:r,debugMode:p=!1})=>{const[y,m]=b.useState(0),[g,x]=b.useState(!1);b.useEffect(()=>{m(0),x(!1)},[s]);const _=()=>{x(!0),m(d=>d+1),setTimeout(()=>{x(!1)},500)},A=b.useMemo(()=>{const d=c==="dark"?u.dark:u.light,f=c==="dark"?"220 13% 18%":"0 0% 98%",h=c==="dark"?"0 0% 95%":"220 13% 18%";return{"--primary":d.primary,"--primary-foreground":d.primaryForeground,"--ring":d.ring,"--sidebar-primary":d.sidebarPrimary,"--sidebar-primary-foreground":d.sidebarPrimaryForeground,"--sidebar-ring":d.sidebarRing,"--background":d.background||f,"--foreground":d.foreground||h}},[c,u]);return o.jsx("div",{className:"flex flex-col h-full w-full transition-colors duration-300 bg-[hsl(var(--background))] text-[hsl(var(--foreground))]",style:A,children:o.jsx(pv,{sessionId:s,code:e,onChange:t,onRun:_,isRunning:g,runTrigger:y,themeMode:c,environmentMode:l,fixtureHtml:a,fixtureCss:n,mediaAssets:i,predictionPrompt:r,debugMode:p},s)})},yv={name:"Base (Indigo)",light:{primary:"239 84% 67%",primaryForeground:"0 0% 100%",ring:"239 84% 67%",sidebarPrimary:"239 84% 67%",sidebarPrimaryForeground:"0 0% 100%",sidebarRing:"239 84% 67%"},dark:{primary:"239 84% 67%",primaryForeground:"0 0% 100%",ring:"239 84% 67%",sidebarPrimary:"239 84% 67%",sidebarPrimaryForeground:"0 0% 100%",sidebarRing:"239 84% 67%"}},gv={name:"Boris",light:{primary:"211 43% 30%",primaryForeground:"0 0% 100%",ring:"211 43% 30%",sidebarPrimary:"211 43% 30%",sidebarPrimaryForeground:"0 0% 100%",sidebarRing:"211 43% 30%",background:"40 33% 95%",foreground:"15 24% 20%",card:"0 0% 100%",cardForeground:"15 24% 20%",muted:"40 20% 90%",mutedForeground:"24 26% 44%",border:"15 24% 20%",input:"0 0% 100%"},dark:{primary:"211 50% 45%",primaryForeground:"0 0% 100%",ring:"211 50% 45%",sidebarPrimary:"211 50% 45%",sidebarPrimaryForeground:"0 0% 100%",sidebarRing:"211 50% 45%",background:"15 24% 12%",foreground:"40 33% 95%",card:"15 24% 16%",cardForeground:"40 33% 95%",muted:"15 20% 20%",mutedForeground:"24 26% 60%",border:"24 26% 30%",input:"15 24% 20%"}},vv={name:"Modern Lab",light:{primary:"217 91% 60%",primaryForeground:"0 0% 100%",ring:"217 91% 60%",sidebarPrimary:"217 91% 60%",sidebarPrimaryForeground:"0 0% 100%",sidebarRing:"217 91% 60%",tagBackground:"34 47% 85%",tagForeground:"16 20% 29%"},dark:{primary:"217 91% 60%",primaryForeground:"0 0% 100%",ring:"217 91% 60%",sidebarPrimary:"217 91% 60%",sidebarPrimaryForeground:"0 0% 100%",sidebarRing:"217 91% 60%",tagBackground:"16 20% 25%",tagForeground:"34 47% 85%"}},Se=[yv,gv,vv],bv="CodeShoebox",Sv=`<!DOCTYPE html>
<html>
<head>
  <title>My First Page</title>
  <style>
    body {
      font-family: sans-serif;
      margin: 2rem;
    }
    h1 { color: #6366f1; }
    .highlight {
      background: #fef08a;
      padding: 0 4px;
    }
  </style>
</head>
<body>
  <h1>Hello, HTML!</h1>
  <p>This is a <span class="highlight">real
     web page</span>. Edit it and press Run.</p>
  <a href="https://developer.mozilla.org">
    Learn more at MDN</a>
</body>
</html>
`,xv=rt({"index.html":`<!DOCTYPE html>
<html>
<head>
  <title>Two Files</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Hello, style.css!</h1>
  <p>The styles for this page live in the <strong>style.css</strong> tab.</p>
</body>
</html>
`,"style.css":`body {
  font-family: sans-serif;
  margin: 2rem;
}

h1 {
  color: #6366f1;
}

strong {
  background: #fef08a;
  padding: 0 4px;
}
`}),Ev=rt({"index.html":`<!DOCTYPE html>
<html>
<head>
  <title>Two Files</title>
</head>
<body>
  <h1>HTML meets JavaScript</h1>
  <p id="message">Press the button to run an interaction.</p>
  <button id="change-message">Change message</button>
  <script src="script.js"><\/script>
</body>
</html>
`,"script.js":`const button = document.getElementById('change-message');
const message = document.getElementById('message');

button.addEventListener('click', () => {
  message.textContent = 'JavaScript changed the page!';
  console.log('Message updated');
});
`}),Tv=rt({"index.html":`<!DOCTYPE html>
<html>
<head>
  <title>Three Files</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <main class="message-card">
    <p class="eyebrow">HTML + CSS + JavaScript</p>
    <h1 id="message">Ready for all three layers.</h1>
    <button id="change-message" type="button">Change message</button>
  </main>
  <script src="script.js"><\/script>
</body>
</html>
`,"style.css":`body {
  margin: 0;
  padding: 2rem;
  background: #eef2ff;
  font-family: ui-sans-serif, system-ui, sans-serif;
}

.message-card {
  max-width: 28rem;
  padding: 1.5rem;
  border: 1px solid #a5b4fc;
  border-radius: 1rem;
  background: white;
  color: #1e1b4b;
}

.eyebrow { color: #4f46e5; font-weight: 700; }
button { padding: 0.7rem 1rem; border: 0; border-radius: 999px; background: #4f46e5; color: white; }
`,"script.js":`const button = document.getElementById('change-message');
const message = document.getElementById('message');

button.addEventListener('click', () => {
  message.textContent = 'HTML, CSS, and JavaScript are connected!';
  console.log('Three-file interaction complete');
});
`}),wv=rt({"index.html":`<!DOCTYPE html>
<html>
<head>
  <title>Media Page</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <main class="media-card">
    <p class="eyebrow">HTML + CSS + JavaScript + Media</p>
    <h1>Build with media</h1>
    <div id="media-gallery">
      Open the Media tab and paste a snippet here.
    </div>
    <button id="check-media" type="button">Check my page</button>
  </main>
  <script src="script.js"><\/script>
</body>
</html>
`,"style.css":`body {
  margin: 0;
  padding: 2rem;
  background: #fff7ed;
  font-family: ui-sans-serif, system-ui, sans-serif;
  color: #7c2d12;
}

.media-card {
  max-width: 32rem;
  padding: 1.5rem;
  border: 1px solid #fdba74;
  border-radius: 1rem;
  background: white;
}

.eyebrow { color: #ea580c; font-weight: 700; }
#media-gallery { margin: 1rem 0; padding: 1rem; border: 2px dashed #fdba74; border-radius: 0.75rem; }
button { padding: 0.7rem 1rem; border: 0; border-radius: 999px; background: #ea580c; color: white; }
`,"script.js":`const button = document.getElementById('check-media');
const gallery = document.getElementById('media-gallery');

button.addEventListener('click', () => {
  console.log(gallery.children.length > 0 ? 'Media added!' : 'Choose a snippet from the Media tab.');
});
`}),Mv=`// Welcome to your coding sandbox!
// You can use standard JavaScript here.
// 'root' is a reference to the main container div.

// Example 1: Manipulate the DOM
const heading = document.createElement('h1');
heading.innerText = 'Hello, Sandbox!';
heading.style.color = '#3b82f6';
root.appendChild(heading);

// Example 2: Add some interactivity
const button = document.createElement('button');
button.innerText = 'Click Me';
button.style.marginTop = '10px';
button.style.padding = '8px 16px';
button.style.cursor = 'pointer';

button.onclick = () => {
    console.log('Button clicked! Interaction detected at ' + new Date().toLocaleTimeString());
};

root.appendChild(button);

// Example 3: Console logging
console.log('Code loaded successfully.');
`,_v=["// Welcome to TypeScript!","// The browser will transpile this code before running it.","","interface User {","  id: number;","  name: string;","  role: 'admin' | 'user';","}","","const currentUser: User = {","  id: 42,",'  name: "Sandbox Developer",','  role: "admin"',"};","","// 'root' is available in the global scope","const displayUser = (user: User) => {","  const card = document.createElement('div');","  Object.assign(card.style, {","    padding: '20px',","    border: '1px solid #ccc',","    borderRadius: '8px',","    fontFamily: 'monospace'","  });","","  card.innerHTML = `","    <h3>${user.name}</h3>","    <p>ID: ${user.id}</p>",'    <p>Role: <span style="color: blue">${user.role}</span></p>',"  `;","  ","  root.appendChild(card);","};","","displayUser(currentUser);",'console.log("TypeScript execution complete");'].join(`
`),jv=`// Welcome to p5.js Creative Coding!
// The console below will capture your logs.

function setup() {
  createCanvas(400, 400);
  background(220);
  console.log("p5.js setup complete!");
}

function draw() {
  // Move mouse to draw
  if (mouseIsPressed) {
    fill(0);
  } else {
    fill(255);
  }
  
  // Draw an ellipse at mouse position
  ellipse(mouseX, mouseY, 20, 20);
}
`,Cv=`/**
 * p5.js + TypeScript
 * Using interfaces and types for creative coding!
 */

interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
}

const particles: Particle[] = [];

// Global scope p5 functions
(window as any).setup = () => {
  createCanvas(400, 400);
  background(20);
  console.log("Typed p5 setup complete");
};

(window as any).draw = () => {
  background(20, 20);
  
  if (mouseIsPressed) {
    const p: Particle = {
      x: mouseX,
      y: mouseY,
      size: random(10, 30),
      color: \`hsl(\${frameCount % 360}, 70%, 60%)\`
    };
    particles.push(p);
  }

  // Draw typed particles
  particles.forEach((p, i) => {
    noStroke();
    fill(p.color);
    circle(p.x, p.y, p.size);
    p.size *= 0.95; // Shrink
    if (p.size < 0.5) particles.splice(i, 1);
  });
};
`,Ov=`import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ fontFamily: 'sans-serif', textAlign: 'center', padding: 20 }}>
      <h2>React Counter</h2>
      <p style={{ fontSize: '2rem', margin: '10px 0' }}>{count}</p>
      <button 
        style={{ padding: '8px 16px', cursor: 'pointer', fontSize: '1rem' }}
        onClick={() => setCount(count + 1)}
      >
        Increment
      </button>
    </div>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<Counter />);
`,Rv=`import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';

interface CounterProps {
  start?: number;
}

const Counter: React.FC<CounterProps> = ({ start = 0 }) => {
  const [count, setCount] = useState<number>(start);

  return (
    <div style={{ fontFamily: 'sans-serif', textAlign: 'center', padding: 20 }}>
      <h2>React + TypeScript</h2>
      <p style={{ fontSize: '2rem', margin: '10px 0' }}>{count}</p>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button 
          onClick={() => setCount(c => c - 1)}
          style={{ padding: '8px 16px', cursor: 'pointer' }}
        >
          -
        </button>
        <button 
          onClick={() => setCount(c => c + 1)}
          style={{ padding: '8px 16px', cursor: 'pointer' }}
        >
          +
        </button>
      </div>
    </div>
  );
};

// Ensure root exists
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<Counter start={10} />);
}
`,Av=["// Welcome to the Express.js Simulator!","// We've mocked 'express' so you can write server-side code in the browser.","","const app = express();","const port = 3000;","","// Database simulation","const users = [","  { id: 1, name: 'Alice', role: 'engineer' },","  { id: 2, name: 'Bob', role: 'designer' }","];","","// Define your routes below","app.get('/', (req, res) => {","  res.json({ message: 'Welcome to the mock API!' });","});","","app.get('/users', (req, res) => {","  res.json(users);","});","","app.get('/users/:id', (req, res) => {","  const id = parseInt(req.params.id);","  const user = users.find(u => u.id === id);","  ","  if (user) {","    res.json(user);","  } else {","    res.status(404).json({ error: 'User not found' });","  }","});","","// Start the server","app.listen(port, () => {","  console.log(`Mock server listening on port ${port}`);","});"].join(`
`),Nv=["// Express + TypeScript Simulator","import express, { Request, Response } from 'express';","","const app = express();","const port = 3000;","","interface Product {","  id: number;","  name: string;","  stock: number;","}","","const inventory: Product[] = [",'  { id: 101, name: "Laptop", stock: 5 },','  { id: 102, name: "Mouse", stock: 12 }',"];","","app.get('/', (req: Request, res: Response) => {",'  res.json({ status: "system_nominal", timestamp: Date.now() });',"});","","app.get('/products', (req: Request, res: Response) => {","  res.json(inventory);","});","","app.get('/products/:id', (req: Request, res: Response) => {","  const id = parseInt(req.params.id);","  const item = inventory.find(p => p.id === id);","  ","  if (item) {","    res.json(item);","  } else {",'    res.status(404).json({ error: "Product not found" });',"  }","});","","app.listen(port, () => {","  console.log(`TS Server initialized on port ${port}`);","});"].join(`
`),zv=["// Modern Server Simulation using Hono!","// Hono is built on web standards like Request and Response.","","const app = new Hono();","","app.get('/', (c) => {","  return c.text('Hono says hello!');","});","","app.get('/api/hello', (c) => {","  return c.json({","    message: 'Hono is lightweight and fast!',","    runtime: 'Browser Sandbox'","  });","});","","// Try sending a GET request to /user/123","app.get('/user/:id', (c) => {","  const id = c.req.param('id');","  return c.json({ userId: id, status: 'active' });","});","","// Standard Export for Modern Runtimes (Cloudflare, Bun, etc)","export default app;"].join(`
`),Dv=["// Hono + TypeScript","import { Hono } from 'hono';","","const app = new Hono();","","interface Profile {","  username: string;","  bio: string;","}","","const profile: Profile = {",'  username: "shoebox_dev",','  bio: "Simulating the future of web frameworks in a tab."',"};","","app.get('/', (c) => c.text('Hono TS Environment Ready'));","","app.get('/profile', (c) => {","  return c.json(profile);","});","","export default app;"].join(`
`),Hv=`/**
 * Logic & Algorithms: The Reducer Pattern
 * 
 * Scenario: Track Meet Analysis
 * Goal: Sum up the total miles where the pace was under 7:00 min/mile.
 */

const trackMeets = [
  { event: "High School Invitational", miles: 3.1, pacePerMile: 6.45 },
  { event: "City Championship", miles: 3.1, pacePerMile: 7.10 },
  { event: "District Finals", miles: 3.1, pacePerMile: 6.55 },
  { event: "State Meet", miles: 3.1, pacePerMile: 6.50 },
  { event: "Morning Training Run", miles: 5.0, pacePerMile: 8.30 },
  { event: "Speed Workout", miles: 4.0, pacePerMile: 6.58 }
];

console.log("Analyzing Track Meet Data...");
console.table(trackMeets);

// Use reduce to filter and sum in one pass
const eliteMiles = trackMeets.reduce((total, meet) => {
  if (meet.pacePerMile < 7.0) {
    console.log(\`✅ Included: \${meet.event} (\${meet.miles} miles @ \${meet.pacePerMile})\`);
    return total + meet.miles;
  }
  return total;
}, 0);

console.log("\\n--- Results ---");
console.log(\`Total "Elite" Miles (Under 7:00 pace): \${eliteMiles.toFixed(1)} miles\`);
`,Uv=`/**
 * Pure TypeScript Console Environment
 * Focus on types and logic without DOM distraction.
 */

interface Task {
  id: number;
  title: string;
  completed: boolean;
}

class TodoList {
  private tasks: Task[] = [];

  addTask(title: string): void {
    const newTask: Task = {
      id: this.tasks.length + 1,
      title,
      completed: false
    };
    this.tasks.push(newTask);
    console.log(\`Added task: "\${title}"\`);
  }

  showTasks(): void {
    console.log("--- Current Todo List ---");
    console.table(this.tasks);
  }
}

const myTodos = new TodoList();
myTodos.addTask("Learn TypeScript Types");
myTodos.addTask("Master the Console");
myTodos.showTasks();
`,Lv=["html","html-css","html-js","html-css-js","html-js-css-media","dom","typescript","p5","p5-ts","react","react-ts","express","express-ts","hono","hono-ts","node-js","node-ts"],Wr=e=>{switch(e){case"html":return Sv;case"html-css":return xv;case"html-js":return Ev;case"html-css-js":return Tv;case"html-js-css-media":return wv;case"p5":return jv;case"p5-ts":return Cv;case"react":return Ov;case"typescript":return _v;case"react-ts":return Rv;case"express":return Av;case"express-ts":return Nv;case"hono":return zv;case"hono-ts":return Dv;case"node-js":return Hv;case"node-ts":return Uv;default:return Mv}},Ne=(e,t,l="dom")=>{const a=e?`cs_${e}`:"",n=b.useCallback(h=>`${a}_${h}`,[a]),i=(h,v,T)=>{if(!e||typeof window>"u")return v;try{const j=localStorage.getItem(n(h));return!j||T&&!T.includes(j)?v:j}catch{return v}},u=b.useCallback(h=>{const v=t??Wr(h);if(!e||typeof window>"u")return v;try{return localStorage.getItem(n(`code_${h}`))||v}catch{return v}},[e,n,t]),[c,s]=b.useState(()=>i("env_mode",l,Lv)),[r,p]=b.useState(()=>i("theme_mode","dark",["light","dark"])),[y,m]=b.useState(()=>i("theme_name",Se[0].name,Se.map(h=>h.name))),[g,x]=b.useState(()=>u(c)),[_,A]=b.useState(()=>Math.floor(Math.random()*1e6));b.useEffect(()=>{e&&(localStorage.setItem(n("env_mode"),c),localStorage.setItem(n("theme_mode"),r),localStorage.setItem(n("theme_name"),y),localStorage.setItem(n(`code_${c}`),g))},[c,r,y,g,e,n]);const d=b.useCallback(h=>{h!==c&&(s(h),x(u(h)),A(v=>v+1))},[c,u]),f=b.useCallback(()=>{const h=t??Wr(c);x(h),A(v=>v+1)},[c,t]);return{environmentMode:c,themeMode:r,activeThemeName:y,code:g,sessionId:_,setEnvironmentMode:d,setThemeMode:p,setActiveThemeName:m,setCode:x,resetCode:f}},Gl=[{kind:"image",name:"Grapefruit slice",src:"https://interactive-examples.mdn.mozilla.net/media/cc0-images/grapefruit-slice-332-332.jpg",alt:"A grapefruit slice on a blue background"},{kind:"audio",name:"T-Rex roar",src:"https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3"},{kind:"video",name:"Flower video",src:"https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"}],uo=[{id:"html-css-demo",mode:"html",code:`<!DOCTYPE html>
<html>
<head>
  <title>Flexbox Cards</title>
  <style>
    body { font-family: sans-serif; margin: 1.5rem; background: #f8fafc; }
    .row { display: flex; gap: 1rem; }
    .card {
      flex: 1;
      padding: 1rem;
      border-radius: 10px;
      background: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      border-top: 4px solid #6366f1;
    }
    .card h2 { margin: 0 0 0.4rem; font-size: 1rem; }
    .card p { margin: 0; font-size: 0.85rem; color: #475569; }
  </style>
</head>
<body>
  <h1>My Flexbox Gallery</h1>
  <div class="row">
    <div class="card"><h2>HTML</h2><p>Structure the page.</p></div>
    <div class="card"><h2>CSS</h2><p>Style every element.</p></div>
    <div class="card"><h2>Flexbox</h2><p>Lay out the cards.</p></div>
  </div>
</body>
</html>`},{id:"html-css-tabs-demo",mode:"html-css",code:rt({"index.html":`<!DOCTYPE html>
<html>
<head>
  <title>Linked Styles</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Two tabs, one page</h1>
  <ul class="checklist">
    <li>Markup lives in index.html</li>
    <li>Styles live in style.css</li>
    <li>The link tag connects them</li>
  </ul>
</body>
</html>`,"style.css":`body {
  font-family: sans-serif;
  margin: 2rem;
  background: #f8fafc;
}

h1 { color: #0ea5e9; }

.checklist {
  list-style: none;
  padding: 0;
}

.checklist li {
  padding: 0.5rem 0.75rem;
  margin-bottom: 0.5rem;
  background: white;
  border-left: 4px solid #0ea5e9;
  border-radius: 4px;
}`})},{id:"html-js-tabs-demo",mode:"html-js",code:rt({"index.html":`<!DOCTYPE html>
<html>
<head><title>Interactive Greeting</title></head>
<body>
  <h1 id="greeting">Ready to say hello?</h1>
  <button id="greet" type="button">Greet me</button>
  <script src="script.js"><\/script>
</body>
</html>`,"script.js":`const greeting = document.getElementById('greeting');
const button = document.getElementById('greet');

button.addEventListener('click', () => {
  greeting.textContent = 'Hello from script.js!';
  console.log('Greeting updated');
});`})},{id:"html-css-js-tabs-demo",mode:"html-css-js",code:rt({"index.html":`<!DOCTYPE html>
<html>
<head>
  <title>Launch Checklist</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <main class="launch-card">
    <p class="eyebrow">Three-file mission</p>
    <h1>Launch checklist</h1>
    <p id="launch-status">Systems are standing by.</p>
    <button id="launch" type="button">Run launch check</button>
  </main>
  <script src="script.js"><\/script>
</body>
</html>`,"style.css":`body {
  margin: 0;
  padding: 2rem;
  background: #ecfeff;
  font-family: ui-sans-serif, system-ui, sans-serif;
  color: #164e63;
}

.launch-card {
  max-width: 26rem;
  padding: 1.5rem;
  border: 1px solid #67e8f9;
  border-radius: 1rem;
  background: white;
  box-shadow: 0 16px 40px rgba(8, 145, 178, 0.16);
}

.eyebrow { color: #0891b2; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; }
button { border: 0; border-radius: 999px; padding: 0.75rem 1rem; background: #0891b2; color: white; font-weight: 700; }`,"script.js":`const button = document.getElementById('launch');
const status = document.getElementById('launch-status');

button.addEventListener('click', () => {
  status.textContent = 'All systems go!';
  console.log('Launch check complete');
});`})},{id:"html-js-css-media-tabs-demo",mode:"html-js-css-media",mediaAssets:Gl,code:rt({"index.html":`<!DOCTYPE html>
<html>
<head>
  <title>Media Field Guide</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <main class="field-guide">
    <p class="eyebrow">Four-tab field guide</p>
    <h1>Grapefruit in bloom</h1>
    <img class="feature-image" src="${Gl[0].src}" alt="${Gl[0].alt}">
    <video id="media-video" controls src="${Gl[2].src}"></video>
    <button id="play-sound" type="button">Play the roar</button>
    <p id="media-status">Choose an asset in the Media tab to see its snippets.</p>
  </main>
  <script src="script.js"><\/script>
</body>
</html>`,"style.css":`body {
  margin: 0;
  padding: 2rem;
  background: #fff7ed;
  font-family: ui-sans-serif, system-ui, sans-serif;
  color: #7c2d12;
}

.field-guide {
  max-width: 34rem;
  padding: 1.5rem;
  border: 1px solid #fdba74;
  border-radius: 1.25rem;
  background: linear-gradient(rgba(255,255,255,.92), rgba(255,255,255,.92)), url("${Gl[0].src}") center / cover;
  box-shadow: 0 18px 44px rgba(154, 52, 18, 0.16);
}

.eyebrow { color: #ea580c; font-weight: 800; text-transform: uppercase; letter-spacing: .12em; }
.feature-image, video { display: block; width: 100%; max-height: 15rem; margin: 1rem 0; border-radius: .8rem; object-fit: cover; }
button { border: 0; border-radius: 999px; padding: .75rem 1rem; background: #ea580c; color: white; font-weight: 700; cursor: pointer; }`,"script.js":`const playButton = document.getElementById('play-sound');
const status = document.getElementById('media-status');
const roar = new Audio(${JSON.stringify(Gl[1].src)});

playButton.addEventListener('click', async () => {
  try {
    await roar.play();
    status.textContent = 'Playing the audio asset from JavaScript.';
    console.log('Media playback started');
  } catch (error) {
    status.textContent = 'Your browser blocked playback. Click again to retry.';
    console.error(error);
  }
});`})},{id:"ts-express-rest-demo",mode:"express-ts",aliases:["express-rest-demo"],code:`import type { Request, Response } from 'express';
const app = express();
const inventory = [
  { id: 1, item: "Space Suit", price: 500 },
  { id: 2, item: "Oxygen Tank", price: 150 }
];
app.get('/', (_req: Request, res: Response) => {
  res.json({ message: "Welcome to the Shop API!", endpoints: ["/api/inventory"] });
});
app.get('/api/inventory', (_req: Request, res: Response) => res.json(inventory));
app.listen(3000, () => console.log('Ready'));`},{id:"hono-api-demo",mode:"hono",code:`const app = new Hono();
app.get('/', (c) => c.text('Hono running on Web Standards!'));
app.get('/api/stats', (c) => c.json({ engine: "Hono", version: "4.x", environment: "CodeShoebox" }));
export default app;`},{id:"hono-ts-api-demo",mode:"hono-ts",code:`import { Hono } from 'hono';
type ApiResponse = { engine: string; mode: string; status: string };
const app = new Hono();
app.get('/', (c) => c.text('Hono TS running'));
app.get('/api/stats', (c) => c.json<ApiResponse>({ engine: "Hono", mode: "TypeScript", status: "ok" }));
export default app;`},{id:"p5-ts-demo",mode:"p5-ts",code:`(window as any).setup = () => {
  createCanvas(400, 250);
};
(window as any).draw = () => {
  background(12);
  fill(0, 200, 255);
  circle(mouseX, mouseY, 28);
};`},{id:"ts-logic-demo",mode:"node-ts",code:`interface Task { id: number; title: string; }
const tasks: Task[] = [{ id: 1, title: "Ship hash presets" }];
console.table(tasks);`},{id:"p5play-demo",mode:"p5play",code:`// p5.play sprites, Game Lab style: top-level code, no setup() needed
var ball = createSprite(50, 200, 30, 30);
ball.shapeColor = color(0, 200, 255);
ball.velocityX = 3;

function draw() {
  background(12);
  if (ball.x > 425) {
    ball.x = -25; // wrap around
  }
  if (keyDown("space")) {
    ball.rotation = ball.rotation + 5;
  }
  drawSprites();
}`}],kv=new Map(uo.map(e=>[e.id,e])),bh=new Map(uo.map(e=>[e.mode,e])),qv=new Map(uo.flatMap(e=>(e.aliases||[]).map(t=>[t,e.id]))),Sh=e=>{const t=decodeURIComponent(e.replace(/^#/,""));if(!t)return;const l=qv.get(t)||t;return kv.get(l)},Bv=e=>bh.get(e)?.id,Yv=e=>bh.get(e)?.mediaAssets,Gv=`<!DOCTYPE html>
<html>
<head>
  <title>My Profile</title>
  <style>
    body {
      font-family: sans-serif;
      margin: 2rem;
      background: #f1f5f9;
    }
    .profile {
      display: flex;
      align-items: center;
      gap: 1rem;
      max-width: 420px;
      padding: 1.25rem;
      border-radius: 14px;
      background: white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }
    .avatar {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #ec4899);
    }
    .profile h1 { margin: 0; font-size: 1.2rem; }
    .profile p { margin: 0.25rem 0 0; color: #64748b; font-size: 0.9rem; }
  </style>
</head>
<body>
  <div class="profile">
    <div class="avatar"></div>
    <div>
      <h1>Shoebox Learner</h1>
      <p>Edits HTML, watches it render live.</p>
    </div>
  </div>
</body>
</html>`,Xv=rt({"index.html":`<!DOCTYPE html>
<html>
<head>
  <title>Recipe Card</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="card">
    <h1>Lemonade</h1>
    <p class="meta">3 ingredients &middot; 5 minutes</p>
    <ol>
      <li>Squeeze four lemons.</li>
      <li>Stir in sugar and cold water.</li>
      <li>Serve over ice.</li>
    </ol>
  </div>
</body>
</html>`,"style.css":`body {
  font-family: Georgia, serif;
  background: #fefce8;
  margin: 2rem;
}

.card {
  max-width: 380px;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
}

h1 {
  margin: 0;
  color: #ca8a04;
}

.meta {
  color: #a16207;
  font-style: italic;
  margin-top: 0.25rem;
}

ol li { margin-bottom: 0.5rem; }`}),Qv=rt({"index.html":`<!DOCTYPE html>
<html>
<head>
  <title>Signal Console</title>
</head>
<body>
  <style>
    .signal-card {
      width: min(390px, calc(100% - 2rem));
      margin: 1.5rem auto;
      padding: 1.5rem;
      border: 1px solid #a5b4fc;
      border-radius: 20px;
      background: linear-gradient(145deg, #eef2ff, #ffffff);
      box-shadow: 0 18px 45px rgba(49, 46, 129, 0.18);
      color: #1e1b4b;
      font-family: ui-sans-serif, system-ui, sans-serif;
    }
    .signal-card small { color: #6366f1; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; }
    .signal-card h1 { margin: 0.4rem 0; }
    .signal-card p { min-height: 1.5rem; color: #4338ca; }
    .signal-card button { border: 0; border-radius: 999px; padding: 0.75rem 1rem; background: #4f46e5; color: white; font-weight: 750; cursor: pointer; }
  </style>
  <article class="signal-card">
    <small>HTML + JavaScript</small>
    <h1>Signal console</h1>
    <p id="signal-status">No signal sent yet.</p>
    <button id="send-signal" type="button">Send signal</button>
  </article>
  <script src="script.js"><\/script>
</body>
</html>`,"script.js":`const button = document.getElementById('send-signal');
const status = document.getElementById('signal-status');
let signalCount = 0;

button.addEventListener('click', () => {
  signalCount += 1;
  status.textContent = \`Signal #\${signalCount} received.\`;
  console.log('Signal received', { signalCount });
});`}),Vv=rt({"index.html":`<!DOCTYPE html>
<html>
<head>
  <title>Launch Checklist</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <main class="launch-card">
    <p class="eyebrow">Three-file mission</p>
    <h1>Launch checklist</h1>
    <p id="launch-status">Systems are standing by.</p>
    <button id="launch" type="button">Run launch check</button>
  </main>
  <script src="script.js"><\/script>
</body>
</html>`,"style.css":`body {
  margin: 0;
  padding: 2rem;
  background: #ecfeff;
  font-family: ui-sans-serif, system-ui, sans-serif;
  color: #164e63;
}

.launch-card {
  max-width: 26rem;
  padding: 1.5rem;
  border: 1px solid #67e8f9;
  border-radius: 1rem;
  background: white;
  box-shadow: 0 16px 40px rgba(8, 145, 178, 0.16);
}

.eyebrow { color: #0891b2; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; }
button { border: 0; border-radius: 999px; padding: 0.75rem 1rem; background: #0891b2; color: white; font-weight: 700; }`,"script.js":`const button = document.getElementById('launch');
const status = document.getElementById('launch-status');

button.addEventListener('click', () => {
  status.textContent = 'All systems go!';
  console.log('Launch check complete');
});`}),Zv=`const statusLine = document.getElementById('status-line');
const diagnosticButton = document.getElementById('run-diagnostic');

statusLine.textContent = 'Systems: all green';
diagnosticButton.addEventListener('click', () => {
  statusLine.textContent = 'Diagnostic rerun at ' + new Date().toLocaleTimeString();
});`,Jv=`<section class="status-panel">
  <p class="eyebrow">Orbital classroom</p>
  <h1>Mission control</h1>
  <p id="status-line" class="status-line">Systems: awaiting check</p>
  <button id="run-diagnostic" type="button">Run diagnostic</button>
</section>`,Kv=`.status-panel {
  width: min(360px, calc(100% - 2rem));
  padding: 1.5rem;
  border: 1px solid #a5b4fc;
  border-radius: 18px;
  background: linear-gradient(145deg, #eef2ff, #ffffff);
  box-shadow: 0 18px 45px rgba(49, 46, 129, 0.18);
  color: #1e1b4b;
}

.eyebrow {
  margin: 0 0 0.4rem;
  color: #6366f1;
  font: 700 0.72rem/1.2 sans-serif;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.status-panel h1 { margin: 0; font: 700 1.8rem/1.2 sans-serif; }
.status-line { margin: 1rem 0; font: 500 1rem/1.5 sans-serif; }

.status-panel button {
  border: 0;
  border-radius: 999px;
  padding: 0.7rem 1rem;
  background: #4f46e5;
  color: white;
  font-weight: 700;
  cursor: pointer;
}`,$v=`function setup() {
  createCanvas(400, 400);
  angleMode(DEGREES);
  colorMode(HSB);
  background(0);
}

function draw() {
  background(0, 10); 
  translate(width / 2, height / 2);
  noFill();
  let t = frameCount;
  for (let i = 0; i < 6; i++) {
    push();
    rotate(i * 60 + t * 0.5);
    stroke((t + i * 30) % 360, 90, 100);
    strokeWeight(2);
    let d = 100 + sin(t * 2) * 50;
    let r = 20 + cos(t * 3) * 10;
    triangle(d, 0, d - 20, 20, d - 20, -20);
    ellipse(d/2, 0, d, r * 2);
    pop();
  }
  noStroke();
  fill((t * 2) % 360, 80, 100);
  circle(0, 0, 10 + 10 * sin(t * 5));
}`,Wv=`/**
 * Typed Creative Coding
 */
interface ParticleNode {
  pos: { x: number; y: number };
  vel: { x: number; y: number };
}

const nodes: ParticleNode[] = [];

(window as any).setup = () => {
  createCanvas(400, 400);
  for(let i=0; i<30; i++) {
    nodes.push({
      pos: { x: random(width), y: random(height) },
      vel: { x: random(-1, 1), y: random(-1, 1) }
    });
  }
};

(window as any).draw = () => {
  background(255);
  stroke(0, 50);
  
  nodes.forEach(n => {
    n.pos.x += n.vel.x;
    n.pos.y += n.vel.y;
    
    if(n.pos.x < 0 || n.pos.x > width) n.vel.x *= -1;
    if(n.pos.y < 0 || n.pos.y > height) n.vel.y *= -1;
    
    circle(n.pos.x, n.pos.y, 4);
    
    // Connect nodes
    nodes.forEach(other => {
      let d = dist(n.pos.x, n.pos.y, other.pos.x, other.pos.y);
      if(d < 60) line(n.pos.x, n.pos.y, other.pos.x, other.pos.y);
    });
  });
};`,Fv=`const app = express();
const port = 3000;

const inventory = [
  { id: 1, item: "Space Suit", price: 500 },
  { id: 2, item: "Oxygen Tank", price: 150 }
];

// Root route to guide the user
app.get('/', (req, res) => {
  res.json({
    message: "Welcome to the Shop API!",
    endpoints: [
      "/api/inventory"
    ]
  });
});

app.get('/api/inventory', (req, res) => res.json(inventory));

app.listen(port, () => console.log('Ready'));`,Iv=`const app = express();

app.get('/secure', (req, res) => {
  const apiKey = req.query.key;
  
  // 1. Check if key exists
  if (!apiKey) {
    return res.status(400).json({ error: "Missing API Key" });
  }
  
  // 2. Validate key
  if (apiKey !== "12345") {
    return res.status(403).json({ error: "Invalid Credentials" });
  }
  
  res.json({ data: "Top Secret Info" });
});

app.listen(3000, () => console.log('Security Server Ready'));`,Pv=`/**
 * Hono API - Modern & Standard-compliant
 */
const app = new Hono();

app.get('/', (c) => {
  return c.text('Hono running on Web Standards!');
});

app.get('/api/stats', (c) => {
  return c.json({
    engine: "Hono",
    version: "4.x",
    environment: "CodeShoebox"
  });
});

app.get('/hello/:name', (c) => {
  const name = c.req.param('name');
  return c.json({ message: \`Hello, \${name}!\` });
});

// Use modern ESM syntax
export default app;`,e1=`/**
 * Logic & Algorithms: The Reducer Pattern
 */
const trackMeets = [
  { event: "Invitational", miles: 3.1, pacePerMile: 6.45 },
  { event: "Championship", miles: 3.1, pacePerMile: 7.10 },
  { event: "State Meet", miles: 3.1, pacePerMile: 6.50 },
  { event: "Speed Workout", miles: 4.0, pacePerMile: 6.58 }
];
console.log("Analyzing Track Data...");
const eliteMiles = trackMeets.reduce((total, meet) => {
  if (meet.pacePerMile < 7.0) {
    console.log(\`✅ Included: \${meet.event}\`);
    return total + meet.miles;
  }
  return total;
}, 0);
console.log(\`Total Elite Miles: \${eliteMiles.toFixed(1)}\`);`,t1=`/**
 * Typed Logic (TS)
 */
interface Task { id: number; title: string; }
class TodoList {
  private tasks: Task[] = [];
  addTask(title: string) {
    this.tasks.push({ id: this.tasks.length + 1, title });
    console.log(\`Added: \${title}\`);
  }
  show() { console.table(this.tasks); }
}
const list = new TodoList();
list.addTask("Fix isolated console");
list.addTask("Add demos");
list.show();`,l1=`// Persistence Demo
const message = "Change me and reload the page!";
console.log("Persistence Status:", message);`,as=Sh("html-js-css-media-tabs-demo");if(!as)throw new Error("Missing html-js-css-media demo preset");const a1=()=>{const e=Ne("demo_html_v1",Gv,"html"),t=Ne("demo_html_css_v1",Xv,"html-css"),l=Ne("demo_html_js_v1",Qv,"html-js"),a=Ne("demo_html_css_js_v1",Vv,"html-css-js"),n=Ne("demo_html_js_css_media_v1",as.code,"html-js-css-media"),i=Ne("demo_dom_fixture_v1",Zv,"dom"),u=Ne("demo_p5_v2",$v,"p5"),c=Ne("demo_p5_ts_v2",Wv,"p5-ts"),s=Ne("demo_express_legacy_v2",Fv,"express"),r=Ne("demo_express_prediction_v2",Iv,"express"),p=Ne("demo_hono_v2",Pv,"hono"),y=Ne("demo_node_js_v2",e1,"node-js"),m=Ne("demo_node_ts_v2",t1,"node-ts"),g=Ne("demo_persistence_v2",l1,"dom"),x=()=>{window.confirm("Reset all demos to their original state? This will erase your changes.")&&(e.resetCode(),t.resetCode(),l.resetCode(),a.resetCode(),n.resetCode(),i.resetCode(),u.resetCode(),c.resetCode(),s.resetCode(),r.resetCode(),p.resetCode(),y.resetCode(),m.resetCode(),g.resetCode())};return o.jsx("div",{className:"h-full w-full overflow-y-auto bg-gray-50 dark:bg-[#121212] transition-colors duration-300 pb-20",children:o.jsxs("div",{className:"max-w-5xl mx-auto py-12 px-6 space-y-20",children:[o.jsxs("header",{className:"flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 dark:border-white/10 pb-6 mb-12",children:[o.jsxs("div",{children:[o.jsx("h1",{className:"text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500",children:"Gallery"}),o.jsx("p",{className:"text-lg opacity-70 dark:text-gray-300",children:"Isolated sandboxes for various educational needs."})]}),o.jsx(ut,{onClick:x,variant:"secondary",className:"text-xs whitespace-nowrap",icon:o.jsx(ih,{className:"w-4 h-4"}),children:"Reset Persistence"})]}),o.jsxs("section",{children:[o.jsx("div",{className:"mb-6",children:o.jsxs("h2",{className:"text-2xl font-semibold flex items-center gap-2",children:[o.jsx(vi,{className:"w-6 h-6 text-emerald-500"})," Web Page (HTML & CSS)"]})}),o.jsx("div",{className:"h-[500px] border rounded-xl overflow-hidden shadow-xl dark:border-white/10",children:o.jsx(Ae,{code:e.code,onCodeChange:e.setCode,environmentMode:e.environmentMode,theme:Se[0],themeMode:"dark",sessionId:e.sessionId})})]}),o.jsxs("section",{children:[o.jsx("div",{className:"mb-6",children:o.jsxs("h2",{className:"text-2xl font-semibold flex items-center gap-2",children:[o.jsx(vi,{className:"w-6 h-6 text-sky-500"})," Two Files (index.html + style.css)"]})}),o.jsx("div",{className:"h-[500px] border rounded-xl overflow-hidden shadow-xl dark:border-white/10",children:o.jsx(Ae,{code:t.code,onCodeChange:t.setCode,environmentMode:t.environmentMode,theme:Se[0],themeMode:"dark",sessionId:t.sessionId})})]}),o.jsxs("section",{children:[o.jsx("div",{className:"mb-6",children:o.jsxs("h2",{className:"text-2xl font-semibold flex items-center gap-2",children:[o.jsx(Xa,{className:"w-6 h-6 text-indigo-500"})," Two Files (index.html + script.js)"]})}),o.jsx("div",{className:"h-[500px] border rounded-xl overflow-hidden shadow-xl dark:border-white/10",children:o.jsx(Ae,{code:l.code,onCodeChange:l.setCode,environmentMode:l.environmentMode,theme:Se[0],themeMode:"dark",sessionId:l.sessionId})})]}),o.jsxs("section",{children:[o.jsx("div",{className:"mb-6",children:o.jsxs("h2",{className:"text-2xl font-semibold flex items-center gap-2",children:[o.jsx(Xa,{className:"w-6 h-6 text-cyan-500"})," Three Files (index.html + style.css + script.js)"]})}),o.jsx("div",{className:"h-[500px] border rounded-xl overflow-hidden shadow-xl dark:border-white/10",children:o.jsx(Ae,{code:a.code,onCodeChange:a.setCode,environmentMode:a.environmentMode,theme:Se[0],themeMode:"dark",sessionId:a.sessionId})})]}),o.jsxs("section",{children:[o.jsx("div",{className:"mb-6",children:o.jsxs("h2",{className:"text-2xl font-semibold flex items-center gap-2",children:[o.jsx(vi,{className:"w-6 h-6 text-orange-500"})," Four Tabs (HTML + CSS + JavaScript + Media)"]})}),o.jsx("div",{className:"h-[560px] border rounded-xl overflow-hidden shadow-xl dark:border-white/10",children:o.jsx(Ae,{code:n.code,onCodeChange:n.setCode,environmentMode:n.environmentMode,mediaAssets:as.mediaAssets,theme:Se[0],themeMode:"dark",sessionId:n.sessionId})})]}),o.jsxs("section",{children:[o.jsx("div",{className:"mb-6",children:o.jsxs("h2",{className:"text-2xl font-semibold flex items-center gap-2",children:[o.jsx(Xa,{className:"w-6 h-6 text-violet-500"})," DOM Fixture (script.js + index.html + style.css)"]})}),o.jsx("div",{className:"h-[500px] border rounded-xl overflow-hidden shadow-xl dark:border-white/10",children:o.jsx(Ae,{code:i.code,onCodeChange:i.setCode,environmentMode:i.environmentMode,fixtureHtml:Jv,fixtureCss:Kv,theme:Se[0],themeMode:"dark",sessionId:i.sessionId})})]}),o.jsxs("section",{children:[o.jsx("div",{className:"mb-6",children:o.jsxs("h2",{className:"text-2xl font-semibold flex items-center gap-2",children:[o.jsx(Uy,{className:"w-6 h-6 text-indigo-500"})," Persistence"]})}),o.jsx("div",{className:"h-[400px] border rounded-xl overflow-hidden shadow-xl dark:border-white/10",children:o.jsx(Ae,{code:g.code,onCodeChange:g.setCode,environmentMode:g.environmentMode,theme:Se[0],themeMode:"dark",sessionId:g.sessionId})})]}),o.jsxs("section",{children:[o.jsx("div",{className:"mb-6",children:o.jsxs("h2",{className:"text-2xl font-semibold flex items-center gap-2",children:[o.jsx(nh,{className:"w-6 h-6 text-pink-500"})," Creative Coding"]})}),o.jsx("div",{className:"h-[500px] border rounded-xl overflow-hidden shadow-xl dark:border-white/10",children:o.jsx(Ae,{code:u.code,onCodeChange:u.setCode,environmentMode:u.environmentMode,theme:Se[2],themeMode:"dark",sessionId:u.sessionId})})]}),o.jsxs("section",{children:[o.jsx("div",{className:"mb-6",children:o.jsxs("h2",{className:"text-2xl font-semibold flex items-center gap-2",children:[o.jsx(Ly,{className:"w-6 h-6 text-yellow-400"})," Typed Graphics (p5.js + TS)"]})}),o.jsx("div",{className:"h-[500px] border rounded-xl overflow-hidden shadow-xl dark:border-white/10",children:o.jsx(Ae,{code:c.code,onCodeChange:c.setCode,environmentMode:c.environmentMode,theme:Se[2],themeMode:"dark",sessionId:c.sessionId})})]}),o.jsxs("section",{children:[o.jsx("div",{className:"mb-6",children:o.jsxs("h2",{className:"text-2xl font-semibold flex items-center gap-2",children:[o.jsx(By,{className:"w-6 h-6 text-yellow-500"})," Modern API (Hono)"]})}),o.jsx("div",{className:"h-[500px] border rounded-xl overflow-hidden shadow-xl dark:border-white/10",children:o.jsx(Ae,{code:p.code,onCodeChange:p.setCode,environmentMode:p.environmentMode,theme:Se[1],themeMode:"dark",sessionId:p.sessionId})})]}),o.jsxs("section",{children:[o.jsx("div",{className:"mb-6",children:o.jsxs("h2",{className:"text-2xl font-semibold flex items-center gap-2",children:[o.jsx(Ay,{className:"w-6 h-6 text-yellow-500"})," Logic (Headless JS)"]})}),o.jsx("div",{className:"h-[400px] border rounded-xl overflow-hidden shadow-xl dark:border-white/10",children:o.jsx(Ae,{code:y.code,onCodeChange:y.setCode,environmentMode:y.environmentMode,theme:Se[0],themeMode:"dark",sessionId:y.sessionId})})]}),o.jsxs("section",{children:[o.jsx("div",{className:"mb-6",children:o.jsxs("h2",{className:"text-2xl font-semibold flex items-center gap-2",children:[o.jsx(Xa,{className:"w-6 h-6 text-teal-500"})," Logic (Headless TS)"]})}),o.jsx("div",{className:"h-[400px] border rounded-xl overflow-hidden shadow-xl dark:border-white/10",children:o.jsx(Ae,{code:m.code,onCodeChange:m.setCode,environmentMode:m.environmentMode,theme:Se[2],themeMode:"dark",sessionId:m.sessionId})})]}),o.jsxs("section",{children:[o.jsx("div",{className:"mb-6",children:o.jsxs("h2",{className:"text-2xl font-semibold flex items-center gap-2",children:[o.jsx(lh,{className:"w-6 h-6 text-purple-500"})," Prediction Challenge"]})}),o.jsx("div",{className:"h-[500px] border rounded-xl overflow-hidden shadow-xl dark:border-white/10",children:o.jsx(Ae,{code:r.code,onCodeChange:r.setCode,environmentMode:"express",theme:Se[1],themeMode:"dark",sessionId:r.sessionId,prediction_prompt:o.jsxs("div",{children:[o.jsx("p",{className:"font-bold mb-2",children:"Analyze the security logic:"}),o.jsxs("p",{children:["If you request ",o.jsx("code",{className:"bg-black/20 px-1 rounded",children:"/secure?key=abc"}),", what HTTP status code and error message will be returned?"]})]})})})]}),o.jsxs("section",{children:[o.jsx("div",{className:"mb-6",children:o.jsxs("h2",{className:"text-2xl font-semibold flex items-center gap-2",children:[o.jsx(uh,{className:"w-6 h-6 text-orange-500"})," Legacy API (Express)"]})}),o.jsx("div",{className:"h-[500px] border rounded-xl overflow-hidden shadow-xl dark:border-white/10",children:o.jsx(Ae,{code:s.code,onCodeChange:s.setCode,environmentMode:s.environmentMode,theme:Se[1],themeMode:"dark",sessionId:s.sessionId})})]})]})})},n1=({isOpen:e,title:t,message:l,onConfirm:a,onCancel:n,themeMode:i})=>e?o.jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200",children:o.jsxs("div",{className:`w-full max-w-md rounded-xl shadow-2xl border p-6 transform transition-all scale-100 ${i==="dark"?"bg-[#1e1e1e] border-white/10 text-gray-100":"bg-white border-black/10 text-gray-800"}`,children:[o.jsx("h3",{className:"text-lg font-bold mb-2",children:t}),o.jsx("p",{className:`mb-6 text-sm leading-relaxed ${i==="dark"?"text-gray-400":"text-gray-600"}`,children:l}),o.jsxs("div",{className:"flex justify-end gap-3",children:[o.jsx(ut,{variant:"ghost",onClick:n,children:"Cancel"}),o.jsx(ut,{variant:"primary",onClick:a,children:"Confirm"})]})]})}):null,i1=e=>{switch(e){case"html-js":return"What text will appear after the button's click handler runs?";case"html-css-js":return"How will the styled message change after the button's click handler runs?";case"html-js-css-media":return"What will the status message say after the audio starts playing?";case"dom":return"Examine the code below. What message will be logged to the console when the 'Click Me' button is pressed?";case"p5":case"p5-ts":return"Look at the conditional statement in the draw loop. What color will the shape fill with when the mouse is pressed?";case"p5play":return"Look at how the sprite's properties change inside the draw loop. Where will the sprite be after the program runs for a few seconds?";case"react":return"What is the starting value of the 'count' state variable rendered on the screen?";case"react-ts":return"If you click the '+' button twice, what will the final number displayed be?";case"typescript":return"What property is being accessed on the 'currentUser' object to display the header text?";case"express":return"What HTTP status code will the server return if you send a GET request to '/users/99'?";case"express-ts":return"Look at the route handler for '/products/:id'. What message will be returned if the ID does not exist in the inventory?";case"hono":return"What string will be returned if you send a GET request to the root path '/'?";case"hono-ts":return"If you request the '/profile' route, what 'username' will be included in the JSON response?";case"node-js":return"What is the 5th number in the Fibonacci sequence generated by this code (starting from index 0)?";case"node-ts":return"Look at the 'addTask' method. What will the 'id' of the second task added to the list be?";default:return"Predict the output of the code below."}},u1=({setView:e,setIsPredictionMode:t,setEnvironmentMode:l,setCode:a,bumpEditorMountKey:n})=>{const i=b.useRef({setView:e,setIsPredictionMode:t,setEnvironmentMode:l,setCode:a,bumpEditorMountKey:n});b.useEffect(()=>{i.current={setView:e,setIsPredictionMode:t,setEnvironmentMode:l,setCode:a,bumpEditorMountKey:n}},[e,t,l,a,n]);const u=b.useCallback(s=>{const r=Sh(s);if(!r)return!1;const p=i.current;return p.setView("editor"),p.setIsPredictionMode(!1),p.setEnvironmentMode(r.mode),p.setCode(r.code),p.bumpEditorMountKey(),!0},[]),c=b.useCallback(s=>{const r=Bv(s),p=window.location.hash.replace(/^#/,"");return r?(p!==r?window.location.hash=r:u(r),!0):(p&&window.history.replaceState(null,"",window.location.pathname+window.location.search),!1)},[u]);return b.useEffect(()=>{const s=()=>{const r=window.location.hash.replace(/^#/,"");r&&u(r)};return s(),window.addEventListener("hashchange",s),()=>window.removeEventListener("hashchange",s)},[u]),{syncHashForMode:c,applyPresetFromHash:u}},c1=()=>{const{environmentMode:e,themeMode:t,activeThemeName:l,code:a,sessionId:n,setEnvironmentMode:i,setThemeMode:u,setActiveThemeName:c,setCode:s,resetCode:r}=Ne("demo_workspace_v1"),[p,y]=b.useState("editor"),[m,g]=b.useState(0),[x,_]=b.useState(!1),[A,d]=b.useState(!1),[f,h]=b.useState(!1),[v,T]=b.useState({title:"",message:"",onConfirm:()=>{}}),j=Se.find(w=>w.name===l)||Se[0],E=()=>{T({title:"Reset Code?",message:`Are you sure you want to reset your ${e} workspace? This will delete your saved progress for this mode and revert to the starter code.`,onConfirm:()=>{r(),h(!1)}}),h(!0)},O=()=>{u(w=>w==="dark"?"light":"dark")},{syncHashForMode:C}=u1({setView:y,setIsPredictionMode:_,setEnvironmentMode:i,setCode:s,bumpEditorMountKey:()=>g(w=>w+1)});return o.jsxs("div",{className:`h-screen w-screen flex flex-col transition-colors duration-300 ${t==="dark"?"bg-[#1e1e1e] text-gray-200":"bg-gray-50 text-gray-900"}`,children:[o.jsxs("header",{className:`flex items-center justify-between px-4 sm:px-6 py-3 border-b shrink-0 transition-colors duration-300 ${t==="dark"?"bg-[#1e1e1e] border-white/10":"bg-white border-black/10 text-gray-800"}`,children:[o.jsxs("div",{className:"flex items-center gap-2",children:[o.jsx("div",{className:`p-2 rounded-lg ${t==="dark"?"bg-blue-500/20":"bg-blue-100"}`,children:o.jsx(My,{className:`w-6 h-6 ${t==="dark"?"text-blue-400":"text-blue-600"}`})}),o.jsxs("div",{className:"hidden sm:block",children:[o.jsx("h1",{className:"font-bold text-lg leading-tight",children:bv}),o.jsx("p",{className:"text-xs opacity-60",children:"Educational Sandbox"})]})]}),o.jsxs("div",{className:"flex items-center gap-2 sm:gap-3",children:[p==="editor"?o.jsx(ut,{variant:"ghost",onClick:()=>y("demo"),title:"Open Gallery",children:o.jsx("span",{className:"hidden sm:inline",children:"Gallery"})}):o.jsxs(ut,{variant:"ghost",onClick:()=>y("editor"),title:"Back to Editor",className:"bg-blue-500/10 text-blue-500",children:[o.jsx(Ty,{className:"w-4 h-4"}),o.jsx("span",{className:"hidden sm:inline ml-2",children:"Editor"})]}),p==="editor"&&o.jsx("div",{className:"relative group hidden sm:block",children:o.jsxs("div",{className:`flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm transition-colors ${t==="dark"?"border-gray-700 bg-gray-800 text-gray-200":"border-gray-300 bg-white text-gray-700"}`,children:[o.jsx(Xa,{className:"w-4 h-4 opacity-70"}),o.jsxs("select",{value:e,onChange:w=>{const X=w.target.value;i(X),C(X)},className:"bg-transparent border-none outline-none appearance-none cursor-pointer pr-4 font-medium",children:[o.jsxs("optgroup",{label:"Web & UI",className:"text-black",children:[o.jsx("option",{value:"html",children:"HTML (single file)"}),o.jsx("option",{value:"html-css",children:"HTML & CSS (style.css)"}),o.jsx("option",{value:"html-js",children:"HTML & JavaScript (script.js)"}),o.jsx("option",{value:"html-css-js",children:"HTML, CSS & JavaScript (3 files)"}),o.jsx("option",{value:"html-js-css-media",children:"HTML, CSS, JavaScript & Media (4 tabs)"}),o.jsx("option",{value:"dom",children:"DOM / JS"}),o.jsx("option",{value:"typescript",children:"TypeScript"}),o.jsx("option",{value:"p5",children:"p5.js"}),o.jsx("option",{value:"p5-ts",children:"p5.js (TS)"}),o.jsx("option",{value:"p5play",children:"p5.js + p5.play"}),o.jsx("option",{value:"react",children:"React (JS)"}),o.jsx("option",{value:"react-ts",children:"React (TS)"})]}),o.jsxs("optgroup",{label:"Logic & Console",className:"text-black",children:[o.jsx("option",{value:"node-js",children:"JavaScript (Console)"}),o.jsx("option",{value:"node-ts",children:"TypeScript (Console)"})]}),o.jsxs("optgroup",{label:"Modern Server (Hono)",className:"text-black",children:[o.jsx("option",{value:"hono",children:"Hono (JS)"}),o.jsx("option",{value:"hono-ts",children:"Hono (TS)"})]}),o.jsxs("optgroup",{label:"Server (Express)",className:"text-black",children:[o.jsx("option",{value:"express",children:"Node / Express"}),o.jsx("option",{value:"express-ts",children:"Express (TS)"})]})]})]})}),p==="editor"&&o.jsx("div",{className:"relative group hidden sm:block",children:o.jsxs("div",{className:`flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm transition-colors ${t==="dark"?"border-gray-700 bg-gray-800 text-gray-200":"border-gray-300 bg-white text-gray-700"}`,children:[o.jsx(nh,{className:"w-4 h-4 opacity-70"}),o.jsx("select",{value:l,onChange:w=>c(w.target.value),className:"bg-transparent border-none outline-none appearance-none cursor-pointer pr-4 font-medium",children:Se.map(w=>o.jsx("option",{value:w.name,className:"text-black",children:w.name},w.name))})]})}),o.jsx("div",{className:"h-6 w-px bg-current opacity-10 mx-1"}),p==="editor"&&o.jsx(ut,{variant:"ghost",onClick:()=>_(!x),className:x?t==="dark"?"text-purple-400 bg-purple-500/10":"text-purple-600 bg-purple-100":"",title:"Toggle Prediction Mode (Demo)",children:o.jsx(lh,{className:"w-4 h-4"})}),o.jsx(ut,{variant:"ghost",onClick:()=>d(!A),className:A?t==="dark"?"text-orange-400 bg-orange-500/10":"text-orange-600 bg-orange-100":"",title:"Toggle Diagnostic Mode",children:o.jsx(_y,{className:"w-4 h-4"})}),o.jsx(ut,{variant:"ghost",onClick:O,title:`Switch to ${t==="dark"?"light":"dark"} mode`,children:t==="dark"?o.jsx(ky,{className:"w-4 h-4"}):o.jsx(zy,{className:"w-4 h-4"})}),p==="editor"&&o.jsxs(ut,{variant:"ghost",onClick:E,title:"Clear editor and reset to starter code",children:[o.jsx(ih,{className:"w-4 h-4"}),o.jsx("span",{className:"hidden sm:inline",children:"Start Over"})]})]})]}),o.jsx("div",{className:"flex-1 overflow-hidden",children:p==="editor"?o.jsx(Ae,{code:a,onCodeChange:s,environmentMode:e,mediaAssets:Yv(e),themeMode:t,theme:j,sessionId:n,prediction_prompt:x?i1(e):void 0,debugMode:A},m):o.jsx(a1,{})}),o.jsx(n1,{isOpen:f,title:v.title,message:v.message,onConfirm:v.onConfirm,onCancel:()=>h(!1),themeMode:t})]})},xh=document.getElementById("root");if(!xh)throw new Error("Could not find root element to mount to");const s1=by.createRoot(xh);s1.render(o.jsx(ll.StrictMode,{children:o.jsx(c1,{})}));
