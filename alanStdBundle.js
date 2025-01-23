for(var t,e=[],i=0;i<256;++i)e.push((i+256).toString(16).slice(1));var r=new Uint8Array(16);function n(){if(!t&&!(t="undefined"!=typeof crypto&&crypto.getRandomValues&&crypto.getRandomValues.bind(crypto)))throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");return t(r)}var a={randomUUID:"undefined"!=typeof crypto&&crypto.randomUUID&&crypto.randomUUID.bind(crypto)};function s(t,i,r){if(a.randomUUID&&!i&&!t)return a.randomUUID();var s=(t=t||{}).random||(t.rng||n)();if(s[6]=15&s[6]|64,s[8]=63&s[8]|128,i){r=r||0;for(var u=0;u<16;++u)i[r+u]=s[u];return i}return function(t,i=0){return(e[t[i+0]]+e[t[i+1]]+e[t[i+2]]+e[t[i+3]]+"-"+e[t[i+4]]+e[t[i+5]]+"-"+e[t[i+6]]+e[t[i+7]]+"-"+e[t[i+8]]+e[t[i+9]]+"-"+e[t[i+10]]+e[t[i+11]]+e[t[i+12]]+e[t[i+13]]+e[t[i+14]]+e[t[i+15]]).toLowerCase()}(s)}class u{constructor(t){this.message=t}}function o(t){return Number.isNaN(t)?new u("Not a Number"):t}function l(t,e,i){return t?.val??t?e():i()}class h{constructor(t){this.map=t??{}}store(t){this.map[globalThis.GPUBuffer&&t instanceof globalThis.GPUBuffer?t.label:t.toString()]=t}has(t){return new j(this.map.hasOwnProperty(globalThis.GPUBuffer&&t instanceof globalThis.GPUBuffer?t.label:t.toString()))}len(){return new y(Object.keys(this.map).length)}array(){return[...Object.values(this.map)]}makeMapWith(t,e){let i={};for(let r of t)i[r]=this.has(r).val?this.map[r]:e.map[r];return i}union(t){let e={};for(let t of Object.keys(this.map))e[t]=!0;for(let i of Object.keys(t.map))e[i]=!0;let i=this.makeMapWith(Object.keys(e),t);return new h(i)}intersect(t){let e={};for(let i of Object.keys(this.map))t.has(i).val&&(e[i]=!0);let i=this.makeMapWith(Object.keys(e),t);return new h(i)}difference(t){let e={};for(let i of Object.keys(this.map))t.has(i).val||(e[i]=!0);let i=this.makeMapWith(Object.keys(e),t);return new h(i)}symmetricDifference(t){let e={};for(let i of Object.keys(this.map))t.has(i).val||(e[i]=!0);for(let i of Object.keys(t.map))this.has(i).val||(e[i]=!0);let i=this.makeMapWith(Object.keys(e),t);return new h(i)}product(t){let e=new h;for(let i of Object.keys(this.map))for(let r of Object.keys(t.map))e.store([this.map[i],t.map[r]]);return e}}function f(t){return t instanceof Array?t.map(f):t instanceof h?t.union(new h):t instanceof Map?new Map([...t.entries()].map((t=>[f(t[0]),f(t[1])]))):t.build instanceof Function?t.build(t.val):t instanceof Object?Object.fromEntries([...Object.entries(t)].map((t=>[t[0],f(t[1])]))):structuredClone(t)}class c{constructor(t,e,i,r,n){if(64===e){let e=BigInt(t);this.val=e>n?n:e<r?r:e}else this.val=Math.max(r,Math.min(n,Number(t)));this.bits=e,this.size=i,this.lower=r,this.upper=n}wrap(t){for(t=64===this.bits?BigInt(t):Number(t);t>this.upper;)t-=this.size;for(;t<this.lower;)t+=this.size;return t}wrappingAdd(t){return this.build(this.val+t.val)}wrappingSub(t){return this.build(this.val-t.val)}wrappingMul(t){return this.build(this.val*t.val)}wrappingDiv(t){return 64===this.bits?this.build(this.val/t.val):this.build(Math.floor(this.val/t.val))}wrappingMod(t){return this.build(this.val%t.val)}wrappingPow(t){return 64===this.bits?this.build(this.val**t.val):this.build(Math.floor(this.val**t.val))}not(){return this.build(~this.val)}wrappingShl(t){if(this.bits>=32){let e=(this.val<0?BigInt(this.val)+BigInt(this.size):BigInt(this.val))<<BigInt(t);return this.build(e)}return this.build((this.val<0?this.val+this.size:this.val)<<t.val)}wrappingShr(t){if(this.bits>=32){let e=(this.val<0?BigInt(this.val)+BigInt(this.size):BigInt(this.val))>>BigInt(t);return this.build(e)}return this.build((this.val<0?this.val+this.size:this.val)>>t.val)}rotateLeft(t){if(this.bits>=32){let e=this.val<0?BigInt(this.val)+BigInt(this.size):BigInt(this.val),i=BigInt(t.val);for(;i>BigInt(this.bits-1);)i-=BigInt(this.bits);if(0n==i)return this.build(this.val);let r=BigInt(this.size)-1n&BigInt(this.size)-1n<<BigInt(this.bits)-i,n=e&r,a=e&(BigInt(this.size)-1n&(BigInt(this.size)-1n^r));return this.build((n>>BigInt(this.bits)-i)+(a<<i))}{let e=this.val<0?this.val+this.size:this.val,i=t.val;for(;i>this.bits-1;)i-=this.bits;if(0==i)return this.build(this.val);let r=this.size-1&this.size-1<<this.bits-i,n=e&r,a=e&(this.size-1&(this.size-1^r));return this.build((n>>this.bits-i)+(a<<i))}}rotateRight(t){if(this.bits>=32){let e=this.val<0?BigInt(this.val)+BigInt(this.size):BigInt(this.val),i=BigInt(t.val);for(;i>BigInt(this.bits-1);)i-=BigInt(this.bits);if(0n==i)return this.build(this.val);let r=BigInt(this.size)-1n&BigInt(this.size)-1n<<i,n=e&(BigInt(this.size)-1n&(BigInt(this.size)-1n^r)),a=e&r;return this.build((n<<BigInt(this.bits)-i)+(a>>i))}{let e=this.val<0?this.val+this.size:this.val,i=t.val;for(;i>this.bits-1;)i-=this.bits;if(0==i)return this.build(this.val);let r=this.size-1&this.size-1<<i,n=e&(this.size-1&(this.size-1^r)),a=e&r;return this.build((n<<this.bits-i)+(a>>i))}}clz(){const t=this.val<(64==this.bits?0n:0)?BigInt(this.val+this.size):BigInt(this.val);if(0n==t)return this.build(this.bits);let e=BigInt(this.bits/2),i=0,r=0,n=Math.log2(this.bits);do{r++,t<2n**e?(i=BigInt(this.bits)-e,e-=BigInt(Math.round(this.bits/2**(r+1)))):e+=BigInt(Math.round(this.bits/2**(r+1)))}while(r<n);return this.build(i)}ctz(){let t=this.val<(64==this.bits?0n:0)?BigInt(this.val+this.size):BigInt(this.val);if(0n==t)return this.build(this.bits);let e=0;for(let i=0;i<this.bits&&t%2n==0n;i++)e++,t>>=1n;return this.build(e)}ones(){let t=this.val<(64==this.bits?0n:0)?BigInt(this.val+this.size):BigInt(this.val),e=0;for(let i=0;i<this.bits;i++)e+=Number(t%2n),t>>=1n;return this.build(e)}reverseBits(){let t=this.val<(64==this.bits?0n:0)?BigInt(this.val+this.size):BigInt(this.val),e=0n;for(let i=0;i<this.bits;i++)e+=(1n&t)<<BigInt(this.bits-i-1),t>>=1n;return this.build(this.upper<e?e-BigInt(this.size):e)}valueOf(){return this.val}toString(){return this.val.toString()}}class d extends c{static ArrayKind=Int32Array;constructor(t){super(t,8,256,-128,127)}build(t){return new d(this.wrap(t))}}class p extends c{static ArrayKind=Uint32Array;constructor(t){super(t,8,256,0,255)}build(t){return new p(this.wrap(t))}}class v extends c{static ArrayKind=Int32Array;constructor(t){super(t,16,65536,-32768,32767)}build(t){return new v(this.wrap(t))}}class w extends c{static ArrayKind=Uint32Array;constructor(t){super(t,16,65536,0,65535)}build(t){return new w(this.wrap(t))}}class b extends c{static ArrayKind=Int32Array;constructor(t){super(t,32,4294967296,-2147483648,2147483647)}build(t){return new b(this.wrap(t))}}class g extends c{static ArrayKind=Uint32Array;constructor(t){super(t,32,4294967296,0,4294967295)}build(t){return new g(this.wrap(t))}}class y extends c{static ArrayKind=Int32Array;constructor(t){super(t,64,18446744073709551616n,-9223372036854775808n,9223372036854775807n)}build(t){return new y(this.wrap(t))}}class m extends c{static ArrayKind=Uint32Array;constructor(t){super(t,64,18446744073709551616n,0n,18446744073709551615n)}build(t){return new m(this.wrap(t))}}class B{constructor(t,e){this.val=t,this.bits=e}roundTiesEven(){let t=Math.floor(this.val);return this.val-t==.5?this.build(t%2==0?t:t+1):this.build(Math.round(this.val))}valueOf(){return this.val}toString(){return this.val.toString()}}class A extends B{static ArrayKind=Float32Array;constructor(t){super(Number(t),32)}build(t){return new A(t)}}class I extends B{static ArrayKind=Float32Array;constructor(t){super(Number(t),64)}build(t){return new I(t)}}function z(t){const e=new ArrayBuffer(1),i=new Int8Array(e),r=new Uint8Array(e);return i[0]=t.val,new p(r[0])}function P(t){const e=new ArrayBuffer(2),i=new Int16Array(e),r=new Uint16Array(e);return i[0]=t.val,new w(r[0])}function U(t){const e=new ArrayBuffer(4),i=new Int32Array(e),r=new Uint32Array(e);return i[0]=t.val,new g(r[0])}function k(t){const e=new ArrayBuffer(4),i=new Int32Array(e),r=new Float32Array(e);return i[0]=t.val,new A(r[0])}function O(t){const e=new ArrayBuffer(8),i=new BigInt64Array(e),r=new BigUint64Array(e);return i[0]=t.val,new m(r[0])}function S(t){const e=new ArrayBuffer(8),i=new BigInt64Array(e),r=new Float64Array(e);return i[0]=t.val,new I(r[0])}function M(t){const e=new ArrayBuffer(1),i=new Uint8Array(e),r=new Int8Array(e);return i[0]=t.val,new d(r[0])}function x(t){const e=new ArrayBuffer(2),i=new Uint16Array(e),r=new Int16Array(e);return i[0]=t.val,new v(r[0])}function C(t){const e=new ArrayBuffer(4),i=new Uint32Array(e),r=new Int32Array(e);return i[0]=t.val,new b(r[0])}function G(t){const e=new ArrayBuffer(4),i=new Uint32Array(e),r=new Float32Array(e);return i[0]=t.val,new A(r[0])}function T(t){const e=new ArrayBuffer(8),i=new BigUint64Array(e),r=new BigInt64Array(e);return i[0]=t.val,new y(r[0])}function W(t){const e=new ArrayBuffer(8),i=new BigUint64Array(e),r=new Float64Array(e);return i[0]=t.val,new I(r[0])}function q(t){const e=new ArrayBuffer(4),i=new Float32Array(e),r=new Int32Array(e);return i[0]=t.val,new b(r[0])}function K(t){const e=new ArrayBuffer(4),i=new Float32Array(e),r=new Uint32Array(e);return i[0]=t.val,new g(r[0])}function _(t){const e=new ArrayBuffer(8),i=new Float64Array(e),r=new BigInt64Array(e);return i[0]=t.val,new y(r[0])}function E(t){const e=new ArrayBuffer(8),i=new Float64Array(e),r=new BigUint64Array(e);return i[0]=t.val,new m(r[0])}class j{constructor(t){this.val=Boolean(t),this.ArrayKind=Int8Array}valueOf(){return this.val}toString(){return this.val.toString()}}class D{constructor(t){this.val=String(t)}valueOf(){return this.val}toString(){return this.val.toString()}}function R(t,e,i){if(e.val<0||e.val>t.length)return new u(`Provided index ${e.val} is beyond the bounds of the array`);if(i.val<0||i.val>t.length)return new u(`Provided index ${i.val} is beyond the bounds of the array`);let r=t[e.val];t[e.val]=t[i.val],t[i.val]=r}async function V(t,e){if(t.length<2)return;let i=Math.floor(t.length/2),r=[...t],n=r.splice(0,i);await V(n,e),await V(r,e);let a=await async function(t,e,i){let r=[];for(;t.length&&e.length;)await i(t[0],e[0])<0?r.push(t.shift()):r.push(e.shift());return[...r,...t,...e]}(n,r,e);for(let e=0;e<a.length;e++)t[e]=a[e]}function F(t,e){let i=t[0].constructor;return[new i(t[1].val*e[2].val-t[2].val*e[1].val),new i(t[2].val*e[0].val-t[0].val*e[2].val),new i(t[0].val*e[1].val-t[1].val*e[0].val)]}class Y{constructor(t,e,i){this.adapter=t,this.device=e,this.queue=i}static async list(){let t=[],e=await(navigator?.gpu?.requestAdapter({powerPreference:"high-performance"})),i=await(navigator?.gpu?.requestAdapter({powerPreference:"low-power"})),r=await(navigator?.gpu?.requestAdapter());return e&&t.push(e),i&&t.push(i),r&&t.push(r),t}static async init(t){let e=[];for(let i of t){let t=i.features,r=i.limits,n=i.info,a=await i.requestDevice({label:`${n.device} on ${n.architecture}`,requiredFeatures:t,requiredLimits:r});e.push(new Y(i,a,a.queue))}return e}}let N=null;async function L(){if(null===N&&(N=await Y.init(await Y.list())),N.length>0)return N[0];throw new u("This program requires a GPU but there are no WebGPU-compliant GPUs on this machine")}async function $(t,e){let i=await L(),r=await i.device.createBuffer({mappedAtCreation:!0,size:e.length*(e[0]?.bits??32)/8,usage:t,label:`buffer_${s().replaceAll("-","_")}`}),n=r.getMappedRange(),a=new(e[0].constructor.ArrayKind??Int32Array)(n);for(let t=0;t<e.length;t++)a[t]=e[t].valueOf();return r.unmap(),r.ValType=e[0].constructor,r}async function X(t,e,i){let r=await L(),n=await r.device.createBuffer({size:e.valueOf()*(i?.bits??32)/8,usage:t,label:`buffer_${s().replaceAll("-","_")}`});return n.ValKind=i,n}function H(){return GPUBufferUsage.MAP_READ|GPUBufferUsage.COPY_DST}function J(){return GPUBufferUsage.MAP_WRITE|GPUBufferUsage.COPY_SRC}function Q(){return GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST|GPUBufferUsage.COPY_SRC}function Z(t){return new y(t.size/((t?.ValKind?.bits??32)/8))}function tt(t){return new D(t.label)}class et{constructor(t,e,i,r){this.source=t,this.entrypoint=r??"main",this.buffers=e,this.workgroupSizes=i,this.module=void 0,this.computePipeline=void 0}}async function it(t){let e=await L();t.module||(t.module=e.device.createShaderModule({code:t.source}));let i=t.module;t.computePipeline||(t.computePipeline=e.device.createComputePipeline({layout:"auto",compute:{entryPoint:t.entryPoint,module:i}}));let r=t.computePipeline,n=e.device.createCommandEncoder(),a=n.beginComputePass();a.setPipeline(r);for(let i=0;i<t.buffers.length;i++){let n=r.getBindGroupLayout(i),s=t.buffers[i],u=[];for(let t=0;t<s.length;t++)u.push({binding:t,resource:{buffer:s[t]}});let o=e.device.createBindGroup({layout:n,entries:u});a.setBindGroup(i,o)}a.dispatchWorkgroups(t.workgroupSizes[0].valueOf(),(t.workgroupSizes[1]??1).valueOf(),(t.workgroupSizes[2]??1).valueOf()),a.end(),e.queue.submit([n.finish()])}async function rt(t){let e=await L(),i=e.device.createCommandEncoder();for(let r of t){r.module||(r.module=e.device.createShaderModule({code:r.source}));let t=r.module;r.computePipeline||(r.computePipeline=e.device.createComputePipeline({layout:"auto",compute:{entryPoint:r.entryPoint,module:t}}));let n=r.computePipeline,a=i.beginComputePass();a.setPipeline(n);for(let t=0;t<r.buffers.length;t++){let i=n.getBindGroupLayout(t),s=r.buffers[t],u=[];for(let t=0;t<s.length;t++)u.push({binding:t,resource:{buffer:s[t]}});let o=e.device.createBindGroup({layout:i,entries:u});a.setBindGroup(t,o)}a.dispatchWorkgroups(r.workgroupSizes[0].valueOf(),(r.workgroupSizes[1]??1).valueOf(),(r.workgroupSizes[2]??1).valueOf()),a.end()}e.queue.submit([i.finish()])}async function nt(t){let e=await L();await e.queue.onSubmittedWorkDone();let i=await X(H(),t.size/4),r=e.device.createCommandEncoder();r.copyBufferToBuffer(t,0,i,0,t.size),e.queue.submit([r.finish()]),await i.mapAsync(GPUMapMode.READ);let n=i.getMappedRange(0,t.size),a=new(t?.ValKind?.ArrayKind??Int32Array)(n),s=[];for(let e=0;e<a.length;e++)s[e]=new(t?.ValKind??b)(a[e]);return i.unmap(),i.destroy(),s}async function at(t,e){if(e.length!=Z(t))return new u("The input array is not the same size as the buffer");let i=await $(J(),e),r=await L(),n=r.device.createCommandEncoder();n.copyBufferToBuffer(i,0,t,0,t.size),r.queue.submit([n.finish()]),i.destroy()}function st(t){return new g(t.canvas.width)}function ut(t){return new g(t.canvas.height)}function ot(t){return new g(t.bufferWidth/4)}function lt(t){return void 0===t.mouseX&&(t.mouseX=new g(0),t.mouseY=new g(0)),t.mouseX}function ht(t){return void 0===t.mouseY&&(t.mouseX=new g(0),t.mouseY=new g(0)),t.mouseY}function ft(t){t.cursorVisible=!0}function ct(t){t.cursorVisible=!1}function dt(t){t.transparent=!0}function pt(t){t.transparent=!1}function vt(t){return K(new A((performance.now()-t.start)/1e3))}function wt(t){return t.context}function bt(t){return t.framebuffer}async function gt(t,e,i){await new Promise((t=>document.addEventListener("DOMContentLoaded",(()=>t()))));let r={canvas:void 0,start:void 0,bufferWidth:void 0,mouseX:void 0,mouseY:void 0,cursorVisible:!0,transparent:!1};if(await t(r),r.start=performance.now(),!r.canvas){let t=document.createElement("canvas");t.setAttribute("id","AlanWindow"),document.body.appendChild(t),t.style["z-index"]=9001,t.style.position="absolute",t.style.left="0px",t.style.top="0px",t.style.width="100%",t.style.height="100%",t.width=window.innerWidth,t.height=window.innerHeight,document.body.addEventListener("resize",(()=>{t.width=window.innerWidth,t.height=window.innerHeight})),r.cursorVisible||(t.style.cursor="none"),r.canvas=t}r.canvas.addEventListener("mousemove",(t=>{void 0===r.mouseX&&void 0===r.mouseY||(r.mouseX=new g(t.offsetX),r.mouseY=new g(t.offsetY))}));let n=r.canvas.getContext("webgpu"),a=await navigator.gpu.requestAdapter(),u=await a.requestDevice(),o=u.queue;n.configure({device:u,format:"bgra8unorm",alphaMode:r.transparent?"premultiplied":"opaque",usage:GPUTextureUsage.COPY_DST|GPUTextureUsage.RENDER_ATTACHMENT,viewFormats:["bgra8unorm"]});let l=await u.createBuffer({size:16,usage:Q(),label:`buffer_${s().replaceAll("-","_")}`});l.ValKind=g;let h=Math.max(1,r.canvas.width),f=Math.max(1,r.canvas.height);r.bufferWidth=4*h%256==0?4*h:4*h+(256-4*h%256);let c=f,d=r.bufferWidth*c,p=await u.createBuffer({size:d,usage:Q(),label:`buffer_${s().replaceAll("-","_")}`});p.ValKind=g;let v=await i({context:l,framebuffer:p}),w=async function(){if(h!==r.canvas.width||f!==r.canvas.height){h=r.canvas.width,f=r.canvas.height,r.bufferWidth=4*h%256==0?4*h:4*h+(256-4*h%256),c=f,d=r.bufferWidth*c;let t=p.label,e=await u.createBuffer({size:d,usage:Q(),label:`buffer_${s().replaceAll("-","_")}`});e.ValKind=g;for(let i of v)for(let r of i.buffers){let i;for(let e=0;e<r.length;e++){if(r[e].label==t){i=e;break}}void 0!==i&&(r[i]=e)}p.destroy(),p=e}let t=l.label,i=n.getCurrentTexture(),a=u.createCommandEncoder(),b=await e(r),y=await u.createBuffer({mappedAtCreation:!0,size:4*b.length,usage:Q(),label:`buffer_${s().replaceAll("-","_")}`}),m=y.getMappedRange(),B=new Uint32Array(m);for(let t=0;t<b.length;t++)B[t]=b[t].valueOf();y.unmap(),y.ValType=g;for(let e of v){void 0===e.module&&(e.module=u.createShaderModule({code:e.source})),void 0===e.computePipeline&&(e.computePipeline=u.createComputePipeline({compute:{module:e.module,entryPoint:e.entryPoint},layout:"auto"}));let i=[],r=a.beginComputePass();r.setPipeline(e.computePipeline);for(let r=0;r<e.buffers.length;r++){let n=e.computePipeline.getBindGroupLayout(r),a=e.buffers[r];for(let e=0;e<a.length;e++)a[e].label===t&&(a[e]=y);let s=[];for(let t=0;t<a.length;t++)s.push({binding:t,resource:{buffer:a[t]}});let o=u.createBindGroup({layout:n,entries:s});i.push(o)}for(let t=0;t<e.buffers.length;t++)r.setBindGroup(t,i[t]);let n=0,s=0;switch(e.workgroupSizes[0].val){case-1:n=h;break;case-2:n=f;break;default:n=e.workgroupSizes[0].val}switch(e.workgroupSizes[1].val){case-1:s=h;break;case-2:s=f;break;default:s=e.workgroupSizes[1].val}let o=e.workgroupSizes[2].val;r.dispatchWorkgroups(n,s,o),r.end()}l.destroy(),l=y,a.copyBufferToTexture({buffer:p,bytesPerRow:r.bufferWidth},{texture:i},[h,f,1]),o.submit([a.finish()]),requestAnimationFrame(w)};requestAnimationFrame(w),await new Promise((t=>{}))}export{u as AlanError,j as Bool,A as F32,I as F64,B as Float,h as FuzzySet,et as GPGPU,Y as GPU,v as I16,b as I32,y as I64,d as I8,c as Int,D as Str,w as U16,g as U32,m as U64,p as U8,tt as bufferid,Z as bufferlen,f as clone,ot as contextBufferWidth,ct as contextCursorInvisible,ft as contextCursorVisible,ut as contextHeight,lt as contextMouseX,ht as contextMouseY,pt as contextOpaque,vt as contextRuntime,dt as contextTransparent,st as contextWidth,$ as createBufferInit,X as createEmptyBuffer,F as cross,q as f32AsI32,K as f32AsU32,_ as f64AsI64,E as f64AsU64,wt as frameContext,bt as frameFramebuffer,L as gpu,it as gpuRun,rt as gpuRunList,P as i16AsU16,k as i32AsF32,U as i32AsU32,S as i64AsF64,O as i64AsU64,z as i8AsU8,l as ifbool,H as mapReadBufferType,J as mapWriteBufferType,o as nanToError,nt as readBuffer,at as replaceBuffer,gt as runWindow,V as sort,Q as storageBufferType,R as swap,x as u16AsI16,G as u32AsF32,C as u32AsI32,W as u64AsF64,T as u64AsI64,M as u8AsI8,s as uuidv4};
