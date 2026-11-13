const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./campus-street-life-D6LAs962.js","./three-runtime-DG5F_cpE.js","./player-BNrZjX8V.js","./physics-runtime-BR_-CEU_.js"])))=>i.map(i=>d[i]);
import{$ as e,A as t,C as n,E as r,F as i,G as a,H as o,I as s,J as c,K as l,L as u,M as d,N as f,O as p,P as m,Q as h,R as g,S as _,T as v,U as y,V as b,W as x,X as S,Y as C,Z as w,at as T,c as E,ct as D,et as O,g as k,h as A,i as j,j as ee,k as M,l as te,lt as ne,n as re,nt as ie,ot as ae,p as oe,q as se,r as ce,rt as le,s as ue,st as N,u as de,ut as fe,v as P,w as pe,x as me,y as he,z as F}from"./three-runtime-DG5F_cpE.js";(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var ge=new URL(`./scene/scene.json`,window.location.href),_e=e=>Array.isArray(e)&&e.length===3&&e.every(Number.isFinite);function ve(e){return e&&_e(e.position)&&(e.yaw===void 0||Number.isFinite(e.yaw))&&(e.pitch===void 0||Number.isFinite(e.pitch)&&Math.abs(e.pitch)<=1.49)}function ye(e){let t=new URL(e,ge);if(t.origin!==ge.origin||!t.pathname.toLowerCase().endsWith(`.glb`))throw Error(`模型必须是项目内的 GLB 文件。`);return t.href}function be(e,t,n,r=!1){e.updateWorldMatrix(!0,!0);let i=e=>{if(!(e instanceof F))return;let r=n(e);if(!r)return;let i=e.clone(!1);i.geometry=r,i.matrixAutoUpdate=!1,i.matrix.copy(e.matrixWorld),i.visible=!0,t.add(i)};r?e.traverseVisible(i):e.traverse(i)}function xe(e){for(;e;){let t=e.name.toUpperCase();if(t===`COLLISION`||t.startsWith(`COLLISION_`))return!0;e=e.parent}return!1}function Se(e){if(xe(e))return;let t=e=>e&&!e.name.startsWith(`decal-`),n=e.geometry;if(!Array.isArray(e.material))return t(e.material)?n:void 0;let r=e.material,i=n.groups.filter(e=>t(r[e.materialIndex??0]));if(!i.length)return;if(i.length===n.groups.length)return n;let a=new Uint32Array(i.reduce((e,t)=>e+t.count,0)),o=0;for(let e of i)for(let t=e.start;t<e.start+e.count;t+=1)a[o++]=n.index?n.index.getX(t):t;return new k().setAttribute(`position`,n.getAttribute(`position`)).setIndex(new A(a,1))}async function Ce(){let e=await fetch(ge,{cache:`no-cache`});if(!e.ok||!e.headers.get(`content-type`)?.includes(`json`))throw Error(`还没有找到校园场景文件。`);let t=await e.json();if(typeof t.title!=`string`||!Array.isArray(t.models)||!t.models.length||!ve(t.spawn))throw Error(`校园场景缺少名称、模型或有效起点。`);if(t.northYaw!==void 0&&!Number.isFinite(t.northYaw))throw Error(`校园方位设置无效。`);if(t.overview&&(!_e(t.overview.position)||!_e(t.overview.target)))throw Error(`校园总览机位无效。`);if(t.collisionFromModels!==void 0&&typeof t.collisionFromModels!=`boolean`)throw Error(`校园碰撞来源无效。`);if(t.streetRoutes!==void 0&&(typeof t.streetRoutes!=`string`||new URL(t.streetRoutes,ge).origin!==ge.origin))throw Error(`道路路线文件无效。`);if(t.landingBoundary&&(!Array.isArray(t.landingBoundary)||t.landingBoundary.length<3||!t.landingBoundary.every(e=>Array.isArray(e)&&e.length===2&&e.every(Number.isFinite))))throw Error(`校园可落地区域数据无效。`);if(t.tourBoundary!==void 0&&(!Array.isArray(t.tourBoundary)||t.tourBoundary.length<3||!t.tourBoundary.every(e=>Array.isArray(e)&&e.length===2&&e.every(Number.isFinite))))throw Error(`校园游览边界无效。`);for(let e of t.models)if(typeof e?.url!=`string`||e.position!==void 0&&!_e(e.position)||e.rotationY!==void 0&&!Number.isFinite(e.rotationY)||e.surroundings!==void 0&&typeof e.surroundings!=`boolean`||e.scale!==void 0&&(!Number.isFinite(e.scale)||e.scale<=0))throw Error(`校园模型的文件路径或坐标无效。`);if(t.locations&&(!Array.isArray(t.locations)||!t.locations.every(e=>ve(e)&&typeof e.id==`string`&&typeof e.label==`string`)))throw Error(`校园地点数据无效。`);let n=new j().setMeshoptDecoder(ce),r=new M,i=new M,a=t.models.filter(e=>!e.surroundings),[o,s]=await Promise.all([Promise.all(a.map(e=>c(e))),!t.collisionFromModels&&t.collisionUrl?n.loadAsync(ye(t.collisionUrl)):void 0]);async function c(e){let t=await n.loadAsync(ye(e.url)),r=new M;return e.position&&r.position.fromArray(e.position),r.rotation.y=e.rotationY??0,r.scale.setScalar(e.scale??1),r.add(t.scene),e.surroundings&&r.traverse(e=>{e.userData.surroundings=!0,e.userData.shadow=!1}),r}for(let e of o)r.add(e);t.collisionFromModels?be(r,i,Se,!0):s?be(s.scene,i,e=>e.userData.collision===!1?void 0:e.geometry):be(r,i,e=>xe(e)?e.geometry:void 0);let l=new oe;if(r.updateWorldMatrix(!0,!0),r.traverse(e=>{if(xe(e)){e.visible=!1;return}if(!(e instanceof F))return;let t=Array.isArray(e.material)?e.material:[e.material];e.castShadow=e.userData.shadow!==!1&&t.some(e=>!e.transparent&&(!e.name.startsWith(`decal-`)||e.alphaTest>0)),e.receiveShadow=e.userData.shadow!==!1,e.geometry.boundingBox||e.geometry.computeBoundingBox(),e.geometry.boundingBox&&l.union(e.geometry.boundingBox.clone().applyMatrix4(e.matrixWorld))}),l.isEmpty())throw Error(`校园模型中没有可见网格。`);let u=l.getSize(new D),d=l.getCenter(new D);async function f(){let e=new M,n=await Promise.all(t.models.filter(e=>e.surroundings).map(c));for(let t of n)e.add(t);return e}return{manifest:t,visuals:r,collision:i,bounds:l,size:u,center:d,manifestURL:ge,loadSurroundings:f}}function we(e){let t=e.map(([t,n],r)=>{let[i,a]=e[(r+1)%e.length];return{x:t,z:n,dx:i-t,dz:a-n}}),n=Math.sign(t.reduce((e,t)=>e+t.x*t.dz-t.z*t.dx,0));return(e,r,i,a)=>{let o=i-e,s=a-r,c=Math.hypot(o,s);if(c<1e-8)return 1;let l=1;for(let i of t){let t=o*i.dz-s*i.dx;if(t*n<=1e-9)continue;let a=i.x-e,u=i.z-r,d=(a*s-u*o)/t;if(d<-1e-9||d>1+1e-9)continue;let f=(a*i.dz-u*i.dx)/t;f>=-1e-9&&f<=l&&(l=Math.max(0,f-.001/c))}return l}}var Te=-.02,Ee=-24*Math.PI/180,De=new Set([`plaza`,`walk`,`courtyard-paving`,`plaza-inlay`,`decal-brickline`]),Oe=`
  varying vec3 vCampusMirrorWorld;
  uniform sampler2D tCampusMirror;
  uniform mat4 uCampusMirrorProjection;
  uniform float uCampusMirrorActive;
  uniform float uCampusGroundLevel;
  uniform vec2 uCampusSiteRotation;

  vec2 campusSite(vec2 world) {
    float c = uCampusSiteRotation.x;
    float s = uCampusSiteRotation.y;
    return vec2(c * world.x + s * world.y, -s * world.x + c * world.y);
  }

  float campusDampPatch(vec2 site, vec2 center, vec2 radius, float variation) {
    vec2 d = (site - center) / radius;
    return 1.0 - smoothstep(0.44, 1.0, dot(d, d) + variation);
  }

  float campusDampness(vec3 world) {
    vec2 site = campusSite(world.xz);
    float height = abs(world.y - uCampusGroundLevel);
    if (height > 0.095 || site.x < 3.5 || site.x > 21.0 || site.y < 15.0 || site.y > 63.0) return 0.0;
    float uneven = sin(site.x * 5.8 + sin(site.y * 3.1)) * 0.10
      + sin(site.y * 11.7 + site.x * 3.2) * 0.047;
    // Water gathers immediately beside the trench and on the shaded paving edges.
    float moisture = campusDampPatch(site, vec2(6.3, 54.94), vec2(2.8, 0.55), uneven);
    moisture = max(moisture, campusDampPatch(site, vec2(14.1, 54.79), vec2(3.1, 0.43), uneven));
    moisture = max(moisture, 0.70 * campusDampPatch(site, vec2(19.2, 57.5), vec2(1.05, 2.0), uneven));
    moisture = max(moisture, campusDampPatch(site, vec2(12.35, 59.4), vec2(1.48, 2.15), uneven));
    moisture = max(moisture, 0.70 * campusDampPatch(site, vec2(13.66, 60.6), vec2(0.73, 1.28), uneven));
    moisture = max(moisture, 0.55 * campusDampPatch(site, vec2(19.4, 18.8), vec2(0.87, 2.9), uneven));
    return moisture * (1.0 - smoothstep(0.045, 0.095, height));
  }
`;function ke(e,n,r,i){let o=i&&e.extensions.has(`EXT_color_buffer_float`),s=new fe(1,1,{type:o?t:T,minFilter:m,generateMipmaps:!0});s.texture.name=`Campus paving reflection`;let c={tCampusMirror:{value:null},uCampusMirrorProjection:{value:new g},uCampusMirrorActive:{value:0},uCampusGroundLevel:{value:Te},uCampusSiteRotation:{value:new N(Math.cos(Ee),Math.sin(Ee))}},l=new Set;r.traverse(e=>{if(!(e instanceof F))return;let t=Array.isArray(e.material)?e.material:[e.material];for(let e of t){if(!(e instanceof b)||l.has(e)||!De.has(e.name))continue;l.add(e);let t=e.onBeforeCompile.bind(e),n=e.customProgramCacheKey();e.customProgramCacheKey=()=>`${n}|campus-ground-v1`,e.onBeforeCompile=(e,n)=>{t(e,n),Object.assign(e.uniforms,c),e.vertexShader=e.vertexShader.replace(`#include <common>`,`#include <common>
varying vec3 vCampusMirrorWorld;`).replace(`#include <project_vertex>`,`
            #include <project_vertex>
            vCampusMirrorWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;
          `),e.fragmentShader=e.fragmentShader.replace(`#include <common>`,`#include <common>\n${Oe}`).replace(`#include <metalnessmap_fragment>`,`
            #include <metalnessmap_fragment>
            float campusDamp = campusDampness(vCampusMirrorWorld);
            roughnessFactor = mix(roughnessFactor, 0.085, campusDamp * 0.92);
            diffuseColor.rgb *= mix(1.0, 0.76, campusDamp);
          `).replace(`#include <lights_fragment_maps>`,`
            #include <lights_fragment_maps>
            if (uCampusMirrorActive > 0.0) {
              vec3 groundView = normalize(cameraPosition - vCampusMirrorWorld);
              vec3 groundNormal = transformDirectionByInverseViewMatrix(geometryNormal, viewMatrix);
              vec2 site = campusSite(vCampusMirrorWorld.xz);
              float pavement = step(-2.0, site.x) * step(site.x, 33.0)
                * step(-16.0, site.y) * step(site.y, 87.0)
                * (1.0 - smoothstep(0.045, 0.096, abs(vCampusMirrorWorld.y - uCampusGroundLevel)))
                * smoothstep(0.93, 0.99, groundNormal.y);
              float facing = max(0.0, groundView.y);
              float angle = pow(1.0 - facing, 3.0);
              float range = 1.0 - smoothstep(27.0, 49.0, length(cameraPosition - vCampusMirrorWorld));
              float strength = pavement * range * mix(0.13 * angle, 0.72 + 0.28 * angle, campusDamp);
              if (strength > 0.004) {
                vec4 projected = uCampusMirrorProjection * vec4(vCampusMirrorWorld.x, uCampusGroundLevel, vCampusMirrorWorld.z, 1.0);
                vec2 uv = projected.xy / max(projected.w, 0.001);
                uv += groundNormal.xz * mix(0.017, 0.004, campusDamp);
                vec2 edge = min(uv, 1.0 - uv);
                float edgeFade = smoothstep(0.0, 0.070, min(edge.x, edge.y)) * step(0.001, projected.w);
                float lod = mix(0.8, 5.8, material.roughness);
                vec3 reflected = textureLod(tCampusMirror, clamp(uv, 0.002, 0.998), lod).rgb;
                radiance += min(reflected, vec3(6.0)) * strength * edgeFade;
              }
            }
          `)},e.needsUpdate=!0}});let u=new x,d=new D,f=new D,p=new D(1/0,1/0,1/0),h=new D,_=new N,v=new N,y=new a,S=new ne,C=new ne,w=new g().set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),E=-1/0,O=!0,k=0;function A(){c.uCampusMirrorActive.value=0,O=!0}return o&&e.domElement.addEventListener(`webglcontextrestored`,A),{get active(){return c.uCampusMirrorActive.value!==0},get passes(){return k},update(t,r,i){t.getWorldPosition(d),t.getWorldDirection(f);let a=c.uCampusSiteRotation.value.x,l=c.uCampusSiteRotation.value.y;if(v.set(a*d.x+l*d.z,-l*d.x+a*d.z),!o||!i||e.xr.isPresenting||f.y>.58||d.y<.35||d.y>4.2||v.x<-20||v.x>48||v.y<-32||v.y>78){A();return}if(e.shadowMap.needsUpdate){O=!0;return}e.getDrawingBufferSize(_);let m=Math.min(.43,576/Math.max(_.x,_.y)),g=Math.max(16,Math.round(_.x*m)),b=Math.max(16,Math.round(_.y*m)),x=s.width!==g||s.height!==b,T=p.distanceToSquared(d)>.022**2||h.dot(f)<.999993;if(!x&&(!O&&!T||r-E<38))return;x&&s.setSize(g,b),u.position.copy(d),u.position.y=2*Te-d.y,u.up.setFromMatrixColumn(t.matrixWorld,1),u.up.y*=-1,f.y*=-1,u.lookAt(f.add(u.position)),u.updateMatrixWorld(!0),u.near=t.near,u.far=t.far,u.projectionMatrix.copy(t.projectionMatrix);let D=u.projectionMatrix.elements;y.normal.set(0,1,0),y.constant=.024,y.applyMatrix4(u.matrixWorldInverse),S.set(y.normal.x,y.normal.y,y.normal.z,y.constant),C.set((Math.sign(S.x)+D[8])/D[0],(Math.sign(S.y)+D[9])/D[5],-1,(1+D[10])/D[14]);let j=S.dot(C);if(Math.abs(j)<1e-5){c.uCampusMirrorActive.value=0;return}c.uCampusMirrorProjection.value.copy(w).multiply(u.projectionMatrix).multiply(u.matrixWorldInverse),S.multiplyScalar(2/j),D[2]=S.x,D[6]=S.y,D[10]=S.z+1,D[14]=S.w,u.projectionMatrixInverse.copy(u.projectionMatrix).invert();let ee=e.getRenderTarget(),M=e.xr.enabled;c.uCampusMirrorActive.value=0,c.tCampusMirror.value=null;try{e.xr.enabled=!1,e.setRenderTarget(s),e.state.buffers.depth.setMask(!0),e.render(n,u)}finally{e.setRenderTarget(ee),e.xr.enabled=M}c.tCampusMirror.value=s.texture,c.uCampusMirrorActive.value=1,p.copy(d),t.getWorldDirection(h),E=r,O=!1,k+=1},dispose(){o&&e.domElement.removeEventListener(`webglcontextrestored`,A),s.dispose()}}}var Ae=`
  varying vec3 vCampusBakeWorld;
  uniform highp sampler3D tCampusBake;
  uniform vec3 uCampusBakeOrigin;
  uniform vec3 uCampusBakeStep;
  uniform vec3 uCampusBakeSize;
  uniform vec2 uCampusBakeRotation;
  uniform float uCampusBakeActive;
`,je=`
  if (uCampusBakeActive > 0.0) {
    // Offset toward the visible surface side to avoid using the opposite room's probe.
    vec3 probeWorld = vCampusBakeWorld + transformNormalByInverseViewMatrix(nonPerturbedNormal, viewMatrix) * 0.53;
    float cosine = uCampusBakeRotation.x;
    float sine = uCampusBakeRotation.y;
    vec3 sitePoint = vec3(
      probeWorld.x * cosine + probeWorld.z * sine,
      -probeWorld.x * sine + probeWorld.z * cosine,
      probeWorld.y
    );
    vec3 grid = (sitePoint - uCampusBakeOrigin) / uCampusBakeStep;
    vec3 margin = min(grid, uCampusBakeSize - 1.0 - grid);
    // Ground-level samples are clamped down to the first walkable level.
    float horizontal = smoothstep(0.0, 3.0, min(margin.x, margin.y));
    float vertical = smoothstep(-1.5, -0.1, grid.z) * smoothstep(0.0, 2.0, uCampusBakeSize.z - 1.0 - grid.z);
    float amount = horizontal * vertical;
    if (amount > 0.001) {
      vec3 lighting = texture(tCampusBake, (grid + 0.5) / uCampusBakeSize).rgb;
      float openSky = lighting.r;
      float ambientVisibility = (0.39 + 0.61 * openSky) * (0.72 + 0.28 * lighting.g);
      irradiance *= mix(1.0, ambientVisibility, amount);
      iblIrradiance *= mix(1.0, ambientVisibility, amount);
      vec3 reflectedSun = vec3(0.52, 0.41, 0.29) * lighting.b * (1.0 - 0.55 * openSky);
      irradiance += reflectedSun * amount;
    }
  }
`;function Me(e,t){let n=new URLSearchParams(window.location.search);if(n.has(`debug`)&&n.get(`bake`)===`0`)return;let r=new URL(t,e).searchParams.get(`v`);if(!r||!/^[\da-f]{12}$/.test(r))return;let i={tCampusBake:{value:null},uCampusBakeOrigin:{value:new D},uCampusBakeStep:{value:new D(1,1,1)},uCampusBakeSize:{value:new D(1,1,1)},uCampusBakeRotation:{value:new N(1,0)},uCampusBakeActive:{value:0}},a=new URL(`campus-baked-light.bin`,e);a.searchParams.set(`v`,r);let o=new AbortController,c=!1;function l(){c||o.signal.aborted||(c=!0,fetch(a,{signal:o.signal}).then(async e=>{if(!e.ok)return;let t=await e.arrayBuffer();if(t.byteLength<64||o.signal.aborted)return;let n=new TextDecoder;if(n.decode(new Uint8Array(t,0,4))!==`HCB1`||n.decode(new Uint8Array(t,48,12))!==r)return;let a=new DataView(t),s=a.getUint32(4,!0),c=a.getUint32(8,!0),l=a.getUint32(12,!0),u=[28,32,36].map(e=>a.getFloat32(e,!0));if(s<2||c<2||l<2||s*c*l*4!=t.byteLength-64||u.some(e=>!(e>0)||!Number.isFinite(e)))return;let d=new me(new Uint8Array(t,64),s,c,l);d.minFilter=f,d.magFilter=f,d.needsUpdate=!0,i.tCampusBake.value=d,i.uCampusBakeOrigin.value.set(a.getFloat32(16,!0),a.getFloat32(20,!0),a.getFloat32(24,!0)),i.uCampusBakeStep.value.set(u[0],u[1],u[2]),i.uCampusBakeSize.value.set(s,c,l),i.uCampusBakeRotation.value.set(a.getFloat32(40,!0),a.getFloat32(44,!0)),i.uCampusBakeActive.value=1}).catch(()=>{}))}return{start:l,skyVisibilityAt(e){let t=i.tCampusBake.value;if(!t)return 1;let{width:n,height:r,depth:a}=t.image,o=t.image.data,{x:c,y:l}=i.uCampusBakeRotation.value,u=i.uCampusBakeOrigin.value,d=i.uCampusBakeStep.value,f=(e.x*c+e.z*l-u.x)/d.x,p=(-e.x*l+e.z*c-u.y)/d.y,m=(e.y-u.z)/d.z,h=s.smoothstep(Math.min(f,n-1-f,p,r-1-p),0,3),g=s.smoothstep(m,-1.5,-.1)*s.smoothstep(a-1-m,0,2);if(h===0||g===0)return 1;let _=Math.floor(f),v=Math.floor(p),y=Math.max(0,m),b=Math.floor(y),x=4*n,S=x*r,C=_*4+v*x+b*S,w=s.lerp(s.lerp(o[C],o[C+4],f-_),s.lerp(o[C+x],o[C+x+4],f-_),p-v),T=C+S,E=s.lerp(s.lerp(o[T],o[T+4],f-_),s.lerp(o[T+x],o[T+x+4],f-_),p-v),D=s.lerp(w,E,y-b)/255;return s.lerp(1,D,h*g)},register(e){if(e.transparent||e.name.startsWith(`decal-`))return;let t=e.onBeforeCompile,n=e.customProgramCacheKey();e.onBeforeCompile=(n,r)=>{t.call(e,n,r),Object.assign(n.uniforms,i),n.vertexShader=n.vertexShader.replace(`#include <common>`,`#include <common>
varying vec3 vCampusBakeWorld;`).replace(`#include <project_vertex>`,`
            #include <project_vertex>
            vCampusBakeWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;
          `),n.fragmentShader=n.fragmentShader.replace(`#include <common>`,`#include <common>\n${Ae}`).replace(`#include <lights_fragment_end>`,`${je}\n#include <lights_fragment_end>`)},e.customProgramCacheKey=()=>`${n}|campus-bake-v1`},dispose(){o.abort(),i.uCampusBakeActive.value=0,i.tCampusBake.value?.dispose(),i.tCampusBake.value=null}}}var Ne=`scene/campus-photo-sky.hdr?v=44f8af5b5dda`;async function Pe(){let e=new URL(`./${Ne}`,window.location.href),t=await new re().loadAsync(e.href);return t.mapping=303,t.wrapS=w,t.needsUpdate=!0,{material:new O({uniforms:{uSky:{value:t},uHorizon:{value:new P(`#bed0d9`)}},vertexShader:`
      varying vec3 vSkyRay;
      void main() {
        vSkyRay = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,fragmentShader:`
      #include <common>
      uniform sampler2D uSky;
      uniform vec3 uHorizon;
      varying vec3 vSkyRay;
      void main() {
        vec3 ray = normalize(vSkyRay);
        vec3 radiance = texture2D(uSky, equirectUv(ray)).rgb * 1.52;
        // Preserve bright clouds, then let the sensor highlights converge to white.
        float peak = max(1e-6, max(radiance.r, max(radiance.g, radiance.b)));
        float shoulder = peak > 0.62 ? 0.62 + 0.38 * (1.0 - exp(-(peak - 0.62) / 0.38)) : peak;
        vec3 photograph = mix(radiance * (shoulder / peak), vec3(shoulder), smoothstep(2.0, 18.0, peak));
        vec3 skyColor = mix(uHorizon, photograph, smoothstep(-0.01, 0.15, ray.y));
        gl_FragColor = vec4(skyColor, 1.0);
        #include <colorspace_fragment>
      }`,side:1,depthTest:!1,depthWrite:!1,toneMapped:!1}),texture:t}}var Fe=new Map([[`plaza`,[`pavers`,.31,.26,.0022]],[`walk`,[`pavers`,.3,.22,.0022]],[`street-paving`,[`stone`,.26,.12,.0024]],[`street-curb`,[`stone`,.32,.07,.002]],[`street-verge`,[`scanned`,.29,.02,.0018]],[`street-soil`,[`scanned`,.33,.03,.0028]],[`plaza-inlay`,[`stone`,.23,.13,.0015]],[`courtyard-paving`,[`pavers`,.33,.24,.0022]],[`teaching-floor`,[`pavers`,.16,.38,8e-4]],[`beige`,[`masonry`,.23,.06,.0012]],[`terra`,[`masonry`,.29,.08,.0014]],[`road`,[`scanned`,.35,.14,.0034]],[`teaching-wall`,[`scanned`,.1,.02,5e-4]],[`teaching-ceiling`,[`scanned`,.075,.02,5e-4]],[`soffit`,[`scanned`,.2,.04,.0012]],[`cream`,[`scanned`,.17,.05,9e-4]],[`reveal`,[`scanned`,.19,.04,8e-4]],[`entry-stone`,[`stone`,.22,.27,.0016]],[`entry-nosing`,[`stone`,.19,.2,.0012]],[`entry-traction`,[`stone`,.23,.12,.0022]],[`stair-stone`,[`stone`,.13,.27,.0011]],[`gallery-base-stone`,[`stone`,.17,.15,.001]],[`curb`,[`stone`,.27,.09,.0026]],[`plinth`,[`stone`,.3,.1,.0018]],[`apron`,[`stone`,.34,.06,.0024]],[`decal-brickline`,[`stone`,.27,.19,.0015]],[`decal-paint-yellow`,[`paint`,.25,.12,0]],[`decal-paint-white`,[`paint`,.21,.1,0]],[`decal-sports_paint`,[`paint`,.14,.09,0]]]),Ie=new Set([`road`,`street-paving`,`street-curb`,`walk`,`plaza-inlay`]),Le=`
  #include <lights_physical_pars_fragment>
  void campusLeafDirect(
    const in IncidentLight light, const in vec3 position, const in vec3 normal,
    const in vec3 view, const in vec3 clearcoatNormal, const in PhysicalMaterial material,
    inout ReflectedLight result
  ) {
    RE_Direct_Physical(light, position, normal, view, clearcoatNormal, material, result);
    float backlight = max(0.0, -dot(normal, light.direction));
    float forwardScatter = max(0.0, dot(view, -light.direction));
    // Direct light already includes the shadow test. A shaded crown cannot glow on its own.
    vec3 transmitted = BRDF_Lambert(material.diffuseColor * vec3(0.99, 1.15, 0.61));
    result.directDiffuse += light.color * transmitted * backlight * (0.22 + 0.34 * forwardScatter * forwardScatter);
  }
  #undef RE_Direct
  #define RE_Direct campusLeafDirect
`,Re=`
  varying vec3 vCampusSurface;
  uniform vec3 uCampusSurfaceResponse;

  float campusHash(vec2 point) {
    vec3 seed = fract(point.xyx * vec3(0.1031, 0.11369, 0.13787));
    seed += dot(seed, seed.yzx + 19.19);
    return fract((seed.x + seed.y) * seed.z);
  }

  float campusNoise(vec2 point) {
    vec2 cell = floor(point);
    vec2 t = fract(point);
    t *= t * (3.0 - 2.0 * t);
    return mix(
      mix(campusHash(cell), campusHash(cell + vec2(1.0, 0.0)), t.x),
      mix(campusHash(cell + vec2(0.0, 1.0)), campusHash(cell + 1.0), t.x),
      t.y
    );
  }

  float campusJointMask(vec2 tile, float width) {
    vec2 phase = fract(tile);
    vec2 distanceToEdge = min(phase, 1.0 - phase);
    vec2 aa = max(fwidth(tile) * .62, vec2(.0001));
    vec2 edge = (1.0 - smoothstep(vec2(width) - aa, vec2(width) + aa, distanceToEdge))
      * min(vec2(1.0), vec2(width * 2.0) / aa);
    return max(edge.x, edge.y);
  }
`,ze=`
  vec3 campusDx = dFdx(vCampusSurface);
  vec3 campusDy = dFdy(vCampusSurface);
  vec3 campusCross = cross(campusDx, campusDy);
  vec3 campusNormal = campusCross * inversesqrt(max(1e-18, dot(campusCross, campusCross)));
  float campusUp = smoothstep(.30, .88, campusNormal.y);
  float campusWall = 1.0 - smoothstep(.14, .72, abs(campusNormal.y));
  vec2 campusWallUv = vec2(vCampusSurface.x + .84 * vCampusSurface.z, vCampusSurface.y);
  vec2 campusPlane = mix(vCampusSurface.xz, campusWallUv, campusWall);
  float campusFootprint = max(length(campusDx), length(campusDy));

  // Three bands have different uses. Long gradients suppress the 3 m scan
  // repetition, mid-scale soil follows runoff, and grit fades before aliasing.
  float campusLarge = campusNoise(campusPlane * .205 + 8.5);
  float campusMedium = campusNoise(campusPlane * vec2(1.22 + campusWall * 2.30, 1.22 - campusWall * .87) - 9.7);
  float campusFineFade = 1.0 - smoothstep(.013, .048, campusFootprint);
  float campusGritFade = 1.0 - smoothstep(.0035, .015, campusFootprint);
  float campusGrit = .5;
  float campusGrain = .5;
  if (campusFineFade > 0.0) {
    campusGrain = mix(.5, campusNoise(campusPlane * 48.0 + 17.3), campusFineFade);
    if (campusGritFade > 0.0) {
      campusGrit = mix(.5, campusNoise(campusPlane * 126.0 - 5.2), campusGritFade);
    }
  }
  float campusGroundSplash = campusWall * (1.0 - smoothstep(.12, .82, vCampusSurface.y));
  float campusSoil = smoothstep(.34, .77, campusLarge * .57 + campusMedium * .43 + campusGroundSplash * .15);
  float campusWear = smoothstep(.40, .74, campusLarge * .45 + (1.0 - campusMedium) * .55) * campusUp;
  float campusJoint = 0.0;
  float campusTileShade = .5;

  #if defined(USE_MAP) && (defined(CAMPUS_PAVERS) || defined(CAMPUS_MASONRY))
    // Keep tile and mortar edges at the same locations as the scans.
    #ifdef CAMPUS_PAVERS
      vec2 campusTile = vMapUv * 5.0 - vec2(.477, 0.0);
      float campusWidth = .012;
    #else
      vec2 campusTile = vMapUv * vec2(16.0, 32.0);
      campusTile.x += mod(floor(campusTile.y), 2.0) * .5;
      float campusWidth = .026;
    #endif
    campusJoint = campusJointMask(campusTile, campusWidth);
    float campusSlabFade = 1.0 - smoothstep(.05, .21, campusFootprint);
    campusTileShade = mix(.5, campusHash(floor(campusTile) + 23.7), campusSlabFade * (1.0 - campusJoint));
  #endif

  #ifdef CAMPUS_SCANNED
    // Warp unjointed scans coherently in all channels, preserving the scale
    // of the scan while breaking up long repeated patches on plaster and asphalt.
    vec2 campusScanShift = (vec2(campusLarge, campusNoise(campusPlane * .173 + 57.1)) - .5) * .85;
    #ifdef USE_MAP
      vec2 campusMapUv = vMapUv + campusScanShift;
      #define vMapUv campusMapUv
    #endif
  #endif
`,Be=`
  #if defined(CAMPUS_SCANNED) && defined(USE_MAP)
    #undef vMapUv
  #endif
  float campusTint = (campusLarge - .5) * .092 + (campusTileShade - .5) * .102;
  float campusAggregate = smoothstep(.61, .88, campusGrain * .62 + campusGrit * .38);
  float campusPores = 1.0 - smoothstep(.19, .42, campusGrain * .53 + campusGrit * .47);
  float campusDirt = uCampusSurfaceResponse.x * campusSoil * (.77 + .50 * campusJoint);
  diffuseColor.rgb *= (1.035 + campusTint + .087 * campusAggregate - .118 * campusPores)
    * mix(vec3(1.0), vec3(.67, .63, .58), campusDirt * 2.02);

  #ifdef CAMPUS_PAINT
    float campusChip = campusGrain * .65 + campusGrit * .35;
    // Paint only, so a rare chip reveals the real pavement underneath.
    if (campusFineFade > .65 && campusChip < .25 + .095 * campusSoil) discard;
    diffuseColor.rgb *= .88 + .17 * smoothstep(.27, .76, campusChip);
  #endif
`,Ve=`
  #if defined(CAMPUS_SCANNED) && defined(USE_ROUGHNESSMAP)
    #undef vRoughnessMapUv
  #endif
  roughnessFactor = clamp(roughnessFactor + campusDirt * .38 + campusJoint * .10
    + campusPores * .045 - campusWear * uCampusSurfaceResponse.y, .22, .98);
`,He=`
  #if defined(CAMPUS_SCANNED) && defined(USE_NORMALMAP_TANGENTSPACE)
    #undef vNormalMapUv
  #endif
  #ifndef CAMPUS_PAINT
    // Screen derivatives express the grain as a shallow height field in metres,
    // without displacing the paved surface or changing its collision geometry.
    float campusHeight = (campusGrain * .57 + campusGrit * .43) * uCampusSurfaceResponse.z;
    vec3 campusViewX = dFdx(-vViewPosition);
    vec3 campusViewY = dFdy(-vViewPosition);
    vec3 campusPerpX = cross(campusViewY, nonPerturbedNormal);
    vec3 campusPerpY = cross(nonPerturbedNormal, campusViewX);
    float campusDet = dot(campusViewX, campusPerpX);
    vec3 campusSlope = sign(campusDet) * (dFdx(campusHeight) * campusPerpX
      + dFdy(campusHeight) * campusPerpY) / max(abs(campusDet), 1e-8);
    normal = normalize(normal - campusSlope / max(1.0, 2.3 * length(campusSlope)));
  #endif
`;function Ue(e){if(e.name.startsWith(`decal-street-leaf-`)||e.name.startsWith(`decal-leaf-spray-`)){let t=e.onBeforeCompile,n=e.customProgramCacheKey();e.onBeforeCompile=(n,r)=>{t.call(e,n,r),n.fragmentShader=n.fragmentShader.replace(`#include <lights_physical_pars_fragment>`,Le)},e.customProgramCacheKey=()=>`${n}|campus-leaf-transmission`;return}let t=Fe.get(e.name);if(!t)return;let[n,r,i,a]=t,o=Ie.has(e.name),s=e.onBeforeCompile,c=e.customProgramCacheKey();e.onBeforeCompile=(t,c)=>{s.call(e,t,c),t.uniforms.uCampusSurfaceResponse={value:[r,i,a]},t.vertexShader=t.vertexShader.replace(`#include <common>`,`#include <common>
varying vec3 vCampusSurface;`).replace(`#include <project_vertex>`,`
        #include <project_vertex>
        vCampusSurface = (modelMatrix * vec4(transformed, 1.0)).xyz;
      `),t.fragmentShader=t.fragmentShader.replace(`#include <common>`,`#include <common>\n#define CAMPUS_${n.toUpperCase()}\n${Re}`).replace(`#include <map_fragment>`,`${ze}\n#include <map_fragment>\n${Be}`).replace(`#include <roughnessmap_fragment>`,`
        #if defined(CAMPUS_SCANNED) && defined(USE_ROUGHNESSMAP)
          vec2 campusRoughnessUv = vRoughnessMapUv + campusScanShift;
          #define vRoughnessMapUv campusRoughnessUv
        #endif
        #include <roughnessmap_fragment>
        ${Ve}
      `).replace(`#include <normal_fragment_maps>`,`
        #if defined(CAMPUS_SCANNED) && defined(USE_NORMALMAP_TANGENTSPACE)
          vec2 campusNormalUv = vNormalMapUv + campusScanShift;
          #define vNormalMapUv campusNormalUv
        #endif
        #include <normal_fragment_maps>
        ${He}
      `),o&&(t.fragmentShader=t.fragmentShader.replace(`#include <lights_fragment_end>`,`
        #include <lights_fragment_end>
        reflectedLight.directSpecular *= .14;
        reflectedLight.indirectSpecular *= .22;
      `))},e.customProgramCacheKey=()=>`${c}|campus-surface-v2:${n}:${o}`}var We=new D(-.69,.55,.47).normalize(),Ge=new P(`#bed0d9`),Ke=new P(`#568bc6`),qe=new Set([`ground`,`plaza`,`walk`,`courtyard-paving`,`road`,`planter`,`plaza-inlay`,`street-paving`,`street-curb`,`street-verge`,`street-soil`,`teaching-floor`]);function Je(e){let t=new O({uniforms:{uZenith:{value:Ke},uHorizon:{value:Ge},uCloud:{value:new P(`#f3f5ef`)},uSun:{value:We}},vertexShader:`
      varying vec3 vDirection;
      void main() {
        vDirection = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,fragmentShader:`
      uniform vec3 uZenith;
      uniform vec3 uHorizon;
      uniform vec3 uCloud;
      uniform vec3 uSun;
      varying vec3 vDirection;
      float hash(vec2 p) {
        vec3 q = fract(vec3(p.xyx) * 0.1031);
        q += dot(q, q.yzx + 33.33);
        return fract((q.x + q.y) * q.z);
      }
      float noise(vec2 p) {
        vec2 cell = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float lower = mix(hash(cell), hash(cell + vec2(1.0, 0.0)), f.x);
        float upper = mix(hash(cell + vec2(0.0, 1.0)), hash(cell + vec2(1.0)), f.x);
        return mix(lower, upper, f.y);
      }
      float cloudDensity(vec2 p) {
        float mass = noise(p) * 0.58 + noise(p * 2.13 + 12.0) * 0.27
          + noise(p * 4.19 - 7.0) * 0.105 + noise(p * 8.3 + 3.0) * 0.045;
        return smoothstep(0.53, 0.73, mass);
      }
      void main() {
        vec3 dir = normalize(vDirection);
        float elevation = max(0.0, dir.y);
        vec3 color = mix(uHorizon, uZenith, pow(smoothstep(-0.026, 0.86, dir.y), 0.71));
        float solar = max(0.0, dot(dir, uSun));
        color = mix(color, vec3(0.94, 0.88, 0.77), 0.28 * pow(solar, 9.0));
        if (elevation > 0.048) {
          vec2 p = dir.xz * vec2(2.38, 3.42) / (elevation + 0.108) + vec2(6.0, -1.0);
          float coverage = cloudDensity(p);
          float upstream = cloudDensity(p + uSun.xz * 0.29);
          float highlight = clamp(0.72 + (coverage - upstream) * 0.37, 0.48, 1.0);
          vec3 underside = vec3(0.55, 0.63, 0.72);
          vec3 litCloud = mix(underside, uCloud, highlight);
          color = mix(color, litCloud, coverage * smoothstep(0.048, 0.25, elevation) * 0.87);
        }
        color = mix(color, vec3(1.0, 0.97, 0.88), smoothstep(0.99984, 0.99996, solar) * 0.94);
        gl_FragColor = vec4(color, 1.0);
        #include <colorspace_fragment>
      }`,side:1,depthTest:!1,depthWrite:!1,toneMapped:!1}),n=new F(new ie(e,32,16),t);return n.renderOrder=-1e3,n.frustumCulled=!1,n}function Ye(){let e=new Uint16Array(73728),r=new P(`#69725e`),a=new P(`#fff0d7`),o=n.toHalfFloat,c=new P;for(let t=0;t<96;t+=1){let n=((t+.5)/96-.5)*Math.PI,i=Math.sin(n),l=Math.cos(n);for(let u=0;u<192;u+=1){let d=((u+.5)/192-.5)*Math.PI*2,f=Math.max(0,l*(Math.cos(d)*We.x+Math.sin(d)*We.z)+i*We.y);c.copy(Ge),i>=0?c.lerp(Ke,s.smoothstep(i,0,.92)):c.lerp(r,s.smoothstep(-i,0,.38));let p=s.smoothstep(Math.sin(d*3+n*13.1)*.62+Math.cos(d*7-n*25.1)*.25+Math.sin(d*11+n*37)*.13,.27,.86)*s.smoothstep(i,.06,.43);c.lerp(a,p*.37).multiplyScalar(.75+Math.max(0,i)*.53);let m=.53*f**21+2.6*f**225;c.r+=a.r*m,c.g+=a.g*m,c.b+=a.b*m;let h=(t*192+u)*4;e.set([o(c.r),o(c.g),o(c.b),o(1)],h)}}let l=new _(e,192,96,C,t);return l.mapping=303,l.colorSpace=i,l.minFilter=f,l.magFilter=f,l.needsUpdate=!0,l}var Xe=`
  varying vec3 vCampusProbePosition;
  uniform samplerCube uCampusEntryProbe;
  uniform samplerCube uCampusCourtProbe;
  uniform vec3 uCampusEntryProbeCenter;
  uniform vec3 uCampusCourtProbeCenter;
  uniform vec2 uCampusProbeActive;
  uniform float uCampusProbeStrength;

  vec3 campusProbeSample(vec3 direction, float roughness, vec3 sky) {
    vec3 entryOffset = vCampusProbePosition - uCampusEntryProbeCenter;
    vec3 courtOffset = vCampusProbePosition - uCampusCourtProbeCenter;
    float entryWeight = (1.0 - smoothstep(22.0, 47.0, length(entryOffset))) * uCampusProbeActive.x;
    float courtWeight = (1.0 - smoothstep(16.0, 44.0, length(courtOffset))) * uCampusProbeActive.y;
    float total = entryWeight + courtWeight;
    if (total < 0.001) return sky;

    float lod = clamp(roughness * 7.0, 0.0, 5.0);
    vec3 reflected = vec3(0.0);
    // Shift the lookup direction as the window moves away from the capture center.
    if (entryWeight > 0.001) {
      vec3 entryRay = normalize(direction + entryOffset * 0.025);
      reflected += textureLod(uCampusEntryProbe, entryRay, lod).rgb * entryWeight;
    }
    if (courtWeight > 0.001) {
      vec3 courtRay = normalize(direction + courtOffset * 0.036);
      reflected += textureLod(uCampusCourtProbe, courtRay, lod).rgb * courtWeight;
    }
    return mix(sky, reflected / total, min(1.0, total) * uCampusProbeStrength);
  }
`;function Ze(n,r,i,a,o,s,c,l){let u=r.manifest.locations?.find(e=>e.id===`gate`),d=r.manifest.locations?.find(e=>e.id===`courtyard`);if(!u||!d||!n.extensions.has(`EXT_color_buffer_float`))return;let f=new D().fromArray(d.position).add(new D(0,5.2,0)),p=new D().fromArray(u.position).lerp(f,.41);p.y=u.position[1]+5.1;let h=[p,f],g=h.map(()=>new E(128,{type:t,generateMipmaps:!0,minFilter:m})),_=new N,v=new N,y={uCampusEntryProbe:{value:g[0].texture},uCampusCourtProbe:{value:g[1].texture},uCampusEntryProbeCenter:{value:p},uCampusCourtProbeCenter:{value:f},uCampusProbeActive:{value:_}};function x(e,t,n){let r=e.onBeforeCompile,i=e.customProgramCacheKey(),a={value:t?.88:.65};e.onBeforeCompile=(t,i)=>{r.call(e,t,i),Object.assign(t.uniforms,y,{uCampusProbeStrength:a}),t.vertexShader=t.vertexShader.replace(`#include <common>`,`#include <common>
varying vec3 vCampusProbePosition;`).replace(`#include <project_vertex>`,`
          #include <project_vertex>
          vCampusProbePosition = (modelMatrix * vec4(transformed, 1.0)).xyz;
        `);let o=ue.envmap_physical_pars_fragment.replace(`return envMapColor.rgb * envMapIntensity;`,`return campusProbeSample(reflectVec, roughness, envMapColor.rgb) * envMapIntensity;`);t.fragmentShader=t.fragmentShader.replace(`#include <common>`,`#include <common>\n${Xe}`).replace(`#include <envmap_physical_pars_fragment>`,o),n&&(t.fragmentShader=t.fragmentShader.replace(`#include <opaque_fragment>`,`
        float faceOn = clamp(dot(normalize(vViewPosition), normal), 0.0, 1.0);
        diffuseColor.a *= mix(0.67, 1.43, pow(1.0 - faceOn, 4.0));
        #include <opaque_fragment>
      `))},e.customProgramCacheKey=()=>`${i}|campus-probe-${n?`clear`:`opaque`}`}function S(){let t=new e;t.background=i.background,t.fog=i.fog;let u=r.visuals.clone(!0),d=new Map;u.traverse(e=>{if(!(e instanceof F))return;let t=e=>{let t=d.get(e);return t||(t=e.clone(),t.visible=e.visible&&!e.transparent,t instanceof b&&(t.envMap=null),d.set(e,t)),t};e.material=Array.isArray(e.material)?e.material.map(t):t(e.material)});let f=a.clone(),p=l.clone();p.shadow.mapSize.set(512,512),p.shadow.bias=-2e-4,p.shadow.normalBias=.04,Object.assign(p.shadow.camera,{left:-48,right:48,top:48,bottom:-48,near:55,far:185}),p.shadow.camera.updateProjectionMatrix(),t.add(u,f,o.clone(),s.clone(),c.clone(),p,p.target);let m=new he(.2,840,g[0]);return m.coordinateSystem=n.coordinateSystem,m.updateCoordinateSystem(),{prepare(){let e=n.getRenderTarget(),r=n.getActiveCubeFace(),i=n.getActiveMipmapLevel();try{return n.setRenderTarget(g[0]),n.compileAsync(t,m.children[0])}finally{n.setRenderTarget(e,r,i)}},renderFace(e,r){let i=g[e];if(r===0){let t=h[e];f.position.copy(t),p.target.position.copy(t),p.position.copy(t).addScaledVector(We,120),m.position.copy(t),m.updateMatrixWorld(!0)}let a=r===m.children.length-1,o=n.getRenderTarget(),s=n.getActiveCubeFace(),c=n.getActiveMipmapLevel(),l=n.xr.enabled,u=n.shadowMap.autoUpdate,d=n.shadowMap.needsUpdate;try{n.xr.enabled=!1,n.shadowMap.autoUpdate=!1,n.shadowMap.needsUpdate=r===0,i.texture.generateMipmaps=a,n.setRenderTarget(i,r),n.state.buffers.depth.setMask(!0),n.render(t,m.children[r]),a&&v.setComponent(e,1)}finally{n.setRenderTarget(o,s,c),n.xr.enabled=l,n.shadowMap.autoUpdate=u,n.shadowMap.needsUpdate=d}return a},dispose(){p.shadow.dispose();for(let e of d.values())e.dispose()}}}let C,w=0,T=0,O=0,k=!1,A;function j(){A?.(),A=void 0,C?.dispose(),C=void 0,O=0,k=!1,w=0,T=0,_.set(0,0),v.set(0,0)}n.domElement.addEventListener(`webglcontextrestored`,j);function ee(e){if(_.copy(v).multiplyScalar(+!n.xr.isPresenting),T>=g.length||A||k||!e||n.xr.isPresenting)return;let t=performance.now();if(O===0&&(O=t+1050),t<O)return;let r=()=>{if(A=void 0,!(document.hidden||n.xr.isPresenting||n.getContext().isContextLost())){try{if(!C&&(C=S(),n.extensions.has(`KHR_parallel_shader_compile`))){let e=C;k=!0,e.prepare().catch(e=>console.warn(`校园反射材质预编译未完成`,e)).finally(()=>{C===e&&(k=!1)});return}C.renderFace(T,w++)&&(w=0,T+=1)}catch(e){k=!1,console.warn(`校园局部反射未能生成`,e),w=0,T+=1}O=performance.now()+45,T>=g.length&&(C?.dispose(),C=void 0)}};if(typeof window.requestIdleCallback==`function`){let e=window.requestIdleCallback(r,{timeout:250});A=()=>window.cancelIdleCallback(e)}else{let e=window.setTimeout(r,0);A=()=>window.clearTimeout(e)}}return{register:x,update:ee,dispose(){A?.(),C?.dispose(),n.domElement.removeEventListener(`webglcontextrestored`,j);for(let e of g)e.dispose()}}}function Qe(e,t){let n=e.geometry,r=n.getAttribute(`position`);if(!r)return;let i=new D,a=[],o=new Map,s=[],c=[],l=[],u=e=>{for(;c[e]!==e;)c[e]=c[c[e]],e=c[e];return e};for(let t=0;t<r.count;t+=1){i.fromBufferAttribute(r,t).applyMatrix4(e.matrixWorld);let n=`${Math.round(i.x*500)},${Math.round(i.y*500)},${Math.round(i.z*500)}`,a=o.get(n);a===void 0&&(a=l.length,o.set(n,a),l.push(i.clone()),c.push(a)),s[t]=a}let d=n.index,f=d?.count??r.count;for(let e=0;e+2<f;e+=3){let t=u(s[d?.getX(e)??e]),n=u(s[d?.getX(e+1)??e+1]),r=u(s[d?.getX(e+2)??e+2]);c[n]=t,c[r]=t}for(let[e,t]of l.entries()){let n=u(e);(a[n]??=new oe).expandByPoint(t)}for(let e of a){if(!e||e.getSize(i).lengthSq()<.14**2)continue;let n=e.getCenter(new D);n.y=e.min.y-.045,t.push(n)}}function $e(e,t,n,r,i){let a=Math.max(r.size.x,r.size.z,30);e.fog=new p(Ge,a*.46,a*2.75),t.far=Math.max(600,a*8),t.updateProjectionMatrix();let o=Je(t.far*.8),c=Math.max(3e3,a*16),u=new F(new l(c,c),new b({color:`#7f8f68`,roughness:1}));u.rotation.x=-Math.PI/2,u.position.set(r.center.x,r.bounds.min.y-.36,r.center.z);let d=new ee(`#dbeaff`,`#c7beaa`,.95),f=new de(`#eae6dc`,.14),m=new v(`#fff0d7`,3.71),h=We.clone().multiplyScalar(a*1.3);m.castShadow=!0;let g=i?1024:2048;m.shadow.mapSize.set(g,g),m.shadow.intensity=.94,m.shadow.radius=2;let _=Ye(),y=[],x=[new se(`#fff0d8`,0,5.2,2),new se(`#fff0d8`,0,5.2,2)];e.add(o,u,d,f,m,m.target,...x);let S=new URLSearchParams(window.location.search),C=S.has(`debug`),w=!C||S.get(`camera`)!==`0`,T=n.toneMappingExposure,E=C&&S.get(`photoSky`)===`0`,O=!1,k=!1,A,j=Me(r.manifestURL,r.manifest.models[0].url),M=!i&&!(C&&S.get(`probe`)===`0`)?Ze(n,r,e,o,u,d,f,m):void 0;r.manifest.collisionFromModels&&r.collision.add(u.clone()),r.visuals.updateMatrixWorld(!0);let te=new Set,ne=Math.min(n.capabilities.getMaxAnisotropy(),i?4:8);r.visuals.traverse(e=>{if(!(e instanceof F))return;let t=Array.isArray(e.material)?e.material:[e.material];t.every(e=>e.name===`glass-clear`)&&(e.castShadow=!1),t.every(e=>e.name===`teaching-lamp`)&&Qe(e,y);for(let n of t)if(n instanceof b&&!te.has(n)){if(te.add(n),Ue(n),qe.has(n.name))for(let e of[n.map,n.normalMap,n.roughnessMap])e&&e.anisotropy<ne&&(e.anisotropy=ne,e.needsUpdate=!0);n.name===`teaching-lamp`?(n.emissive.set(`#fff1db`),n.emissiveIntensity=1.05):n.name.startsWith(`glass-`)?(n.envMap=_,n.envMapIntensity=n.name===`glass-clear`?1.42:1.02,n.roughness=Math.min(n.roughness,.25),n.name!==`glass-clear`&&(n.metalness=Math.max(n.metalness,.11)),M?.register(n,!0,n.name===`glass-clear`)):[`teaching-metal`,`frame`,`blue-rail`,`blue-cap`,`stand_steel`,`entry-aluminum`,`stainless`,`entry-drain-frame`,`entry-drain-grate`].includes(n.name)?(n.envMap=_,n.envMapIntensity=.48,n.metalness=Math.max(n.metalness,.27),M?.register(n,!1,!1)):n.name===`teaching-floor`&&(n.envMap=_,n.envMapIntensity=.22),e.userData.surroundings||j?.register(n)}});let re=new D,ie=0;function ae(){O=!0,j?.start(),E||Pe().then(({material:e,texture:t})=>{if(k)e.dispose(),t.dispose();else{o.material.dispose(),o.material=e,A=t;for(let e of te)e instanceof b&&e.envMap===_&&(e.envMap=t)}}).catch(()=>{}).finally(()=>{E=!0})}function oe(e){let t,n,r=5.4**2,i=5.4**2;if(e)for(let a of y){let o=a.y-e.y;if(o<1.92||o>3.95)continue;let s=(a.x-e.x)**2+(a.z-e.z)**2;s<r?(n=t,i=r,t=a,r=s):s<i&&(n=a,i=s)}for(let[e,a]of x.entries()){let o=e?n:t,c=e?i:r;o&&a.position.copy(o),a.intensity=o?4.9*(1-s.smoothstep(c,9,5.4**2)):0}}function ce(e,i,a,c){if(t.getWorldPosition(o.position),a&&!O&&ae(),M?.update(a&&E),w){let t=e===`walk`?j?.skyVisibilityAt(o.position)??1:1,r=T+.24*(1-s.smoothstep(t,.04,.65));n.toneMappingExposure=s.damp(n.toneMappingExposure,r,3,c)}oe(e===`walk`?i:void 0);let l=i&&(e===`walk`||e===`fly`&&i.y<r.bounds.max.y+14),u=l?e===`walk`?25:38:Math.max(r.size.length()*.56,25);if(l?re.set(Math.round(i.x/8)*8,Math.round(i.y/8)*8,Math.round(i.z/8)*8):re.copy(r.center),ie!==u||!m.target.position.equals(re)){if(m.target.position.copy(re),m.position.copy(re).add(h),ie!==u){ie=u;let e=h.length(),t=u*2.4;Object.assign(m.shadow.camera,{left:-u,right:u,top:u,bottom:-u,near:Math.max(.1,e-t),far:e+t}),m.shadow.camera.updateProjectionMatrix(),m.shadow.bias=l?-16e-5:-11e-5,m.shadow.normalBias=l?.018:.074}n.shadowMap.needsUpdate=!0}}return{update:ce,addStreetReflections(e){e.traverse(e=>{if(!(e instanceof F))return;let t=Array.isArray(e.material)?e.material:[e.material];for(let e of t)e instanceof b&&!te.has(e)&&(te.add(e),e.envMap=A??_,e.envMapIntensity=.52,e.needsUpdate=!0)})},dispose(){k=!0;for(let e of[o,u])e.removeFromParent(),e.geometry.dispose(),e.material.dispose();M?.dispose(),j?.dispose(),A?.dispose(),_.dispose(),m.shadow.dispose(),d.removeFromParent(),f.removeFromParent(),m.removeFromParent(),m.target.removeFromParent();for(let e of x)e.removeFromParent()}}}var et=`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`,tt=`
  uniform sampler2D tDepth;
  uniform vec2 uProjection;
  uniform vec2 uTexel;
  uniform float uLogFar;

  vec2 pixelCenter(vec2 uv) {
    vec2 center = (floor(uv / uTexel) + 0.5) * uTexel;
    return clamp(center, uTexel * 0.5, 1.0 - uTexel * 0.5);
  }

  float distanceAt(vec2 uv) {
    // WebGLRenderer stores log2(1 + view distance) for a perspective camera.
    return exp2(texture2D(tDepth, pixelCenter(uv)).r * uLogFar) - 1.0;
  }

  vec3 positionAt(vec2 uv, float distance) {
    return vec3((pixelCenter(uv) * 2.0 - 1.0) * distance / uProjection, -distance);
  }
`,nt=`
  varying vec2 vUv;
  ${tt}

  vec3 adjacent(vec2 uv, vec2 texel, float distance) {
    float a = distanceAt(uv - texel);
    float b = distanceAt(uv + texel);
    vec3 p = positionAt(uv, distance);
    return abs(a - distance) < abs(b - distance)
      ? p - positionAt(uv - texel, a)
      : positionAt(uv + texel, b) - p;
  }

  float contribution(vec2 uv, vec3 center, vec3 normal, float radius) {
    vec3 delta = positionAt(uv, distanceAt(uv)) - center;
    float separation = length(delta);
    float height = dot(normal, delta);
    float horizon = max(height - 0.018, 0.0) / max(0.001, separation);
    return max(horizon - 0.085, 0.0) * (1.0 - smoothstep(0.12, radius, separation));
  }

  void main() {
    float distance = distanceAt(vUv);
    if (distance > 105.0 || distance < 0.05) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
      return;
    }
    vec3 p = positionAt(vUv, distance);
    vec3 dx = adjacent(vUv, vec2(uTexel.x * 2.0, 0.0), distance);
    vec3 dy = adjacent(vUv, vec2(0.0, uTexel.y * 2.0), distance);
    vec3 crossNormal = cross(dx, dy);
    vec3 normal = crossNormal * inversesqrt(max(1e-12, dot(crossNormal, crossNormal)));
    if (dot(normal, p) > 0.0) normal = -normal;
    float radius = mix(0.56, 0.96, smoothstep(3.0, 42.0, distance));
    vec2 scale = uProjection * (radius * 0.5 / distance);
    float occlusion = 0.0;
    for (int i = 0; i < 8; i++) {
      float a = float(i) * 0.78539816 + 0.19634954;
      vec2 stepUv = vec2(cos(a), sin(a)) * scale;
      float nearby = contribution(vUv + stepUv * 0.32, p, normal, radius);
      float farther = contribution(vUv + stepUv * 0.79, p, normal, radius);
      occlusion += max(nearby, farther);
    }
    occlusion = min(0.55, occlusion * 0.2375);
    gl_FragColor = vec4(occlusion, 0.0, 0.0, 1.0);
  }
`,rt=`
  varying vec2 vUv;
  uniform sampler2D tColor;
  uniform sampler2D tOcclusion;
  uniform vec2 uOcclusionSize;
  uniform float uCameraResponse;
  ${tt}

  float lumaOf(vec3 color) {
    return sqrt(max(0.0, dot(color, vec3(0.2126, 0.7152, 0.0722))));
  }

  // Keep a single depth sample at the pixel center, then smooth color edges.
  vec3 antialiasedColor(vec2 uv, out float highlightSpill) {
    vec3 center = texture2D(tColor, uv).rgb;
    float a = lumaOf(texture2D(tColor, uv + vec2(-1.0, -1.0) * uTexel).rgb);
    float b = lumaOf(texture2D(tColor, uv + vec2( 1.0, -1.0) * uTexel).rgb);
    float c = lumaOf(texture2D(tColor, uv + vec2(-1.0,  1.0) * uTexel).rgb);
    float d = lumaOf(texture2D(tColor, uv + vec2( 1.0,  1.0) * uTexel).rgb);
    float middle = lumaOf(center);
    float neighbourLight = (a * a + b * b + c * c + d * d) * 0.25;
    highlightSpill = clamp(neighbourLight - max(1.25, middle * middle + 0.12), 0.0, 0.7);
    float minimum = min(middle, min(min(a, b), min(c, d)));
    float maximum = max(middle, max(max(a, b), max(c, d)));
    if (maximum - minimum < max(0.045, maximum * 0.12)) return center;
    vec2 direction = vec2(c + d - a - b, a + c - b - d);
    float reduction = max(0.0078, (a + b + c + d) * 0.03125);
    direction = clamp(direction / (min(abs(direction.x), abs(direction.y)) + reduction), -6.0, 6.0) * uTexel;
    vec3 inner = 0.5 * (texture2D(tColor, uv - direction / 6.0).rgb + texture2D(tColor, uv + direction / 6.0).rgb);
    vec3 outer = inner * 0.5 + 0.25 * (texture2D(tColor, uv - direction * 0.5).rgb + texture2D(tColor, uv + direction * 0.5).rgb);
    float value = lumaOf(outer);
    return (value < minimum || value > maximum) ? inner : outer;
  }

  float weightedOcclusion(vec2 uv, float distance, float bilinear, inout float total) {
    float depthDifference = abs(distanceAt(uv) - distance);
    float limit = 0.13 + distance * 0.008;
    float weight = bilinear * (1.0 - smoothstep(limit, limit * 2.6, depthDifference));
    total += weight;
    return texture2D(tOcclusion, uv).r * weight;
  }

  void main() {
    float highlightSpill;
    vec3 color = antialiasedColor(vUv, highlightSpill);
    if (uCameraResponse > 0.0) {
      // Use the same neighbouring samples as antialiasing, with no extra pass.
      vec2 lens = vUv * 2.0 - 1.0;
      float edge = 1.0 - 0.055 * smoothstep(0.34, 1.58, dot(lens, lens));
      color = (color + vec3(1.0, 0.95, 0.88) * highlightSpill * 0.032) * edge;
    }
    float depth = texture2D(tDepth, vUv).r;
    if (depth < 0.99999) {
      float distance = distanceAt(vUv);
      if (distance < 105.0) {
        vec2 texel = 1.0 / uOcclusionSize;
        vec2 index = vUv * uOcclusionSize - 0.5;
        vec2 corner = (floor(index) + 0.5) * texel;
        vec2 blend = fract(index);
        float total = 0.0;
        float ao = weightedOcclusion(corner, distance, (1.0 - blend.x) * (1.0 - blend.y), total);
        ao += weightedOcclusion(corner + vec2(texel.x, 0.0), distance, blend.x * (1.0 - blend.y), total);
        ao += weightedOcclusion(corner + vec2(0.0, texel.y), distance, (1.0 - blend.x) * blend.y, total);
        ao += weightedOcclusion(corner + texel, distance, blend.x * blend.y, total);
        float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
        color *= 1.0 - ao / max(0.01, total) * mix(0.91, 0.58, smoothstep(0.28, 1.28, luma));
      }
      gl_FragColor = vec4(color, 1.0);
      #include <tonemapping_fragment>
    } else {
      // The sky shader already owns its display response.
      gl_FragColor = vec4(color, 1.0);
    }
    if (uCameraResponse > 0.0) {
      float pixel = fract(dot(gl_FragCoord.xy, vec2(0.1031, 0.11369)));
      float dither = fract(pixel * (pixel + 17.71)) - 0.5;
      gl_FragColor.rgb = max(vec3(0.0), gl_FragColor.rgb + dither * 0.0026);
    }
    #include <colorspace_fragment>
  }
`;function it(n,r){if(!n.extensions.has(`EXT_color_buffer_float`))return;let i=new fe(1,1,{type:t,depthTexture:new pe(1,1,ae)}),a=new fe(1,1,{depthBuffer:!1,minFilter:o,magFilter:o}),s={tDepth:{value:i.depthTexture},uProjection:{value:new N},uTexel:{value:new N},uLogFar:{value:0}},c=new O({uniforms:s,vertexShader:et,fragmentShader:nt,depthTest:!1,depthWrite:!1,toneMapped:!1}),u=new O({uniforms:{...s,tColor:{value:i.texture},tOcclusion:{value:a.texture},uOcclusionSize:{value:new N},uCameraResponse:{value:+!!r}},vertexShader:et,fragmentShader:rt,depthTest:!1,depthWrite:!1}),d=new e,f=new y,p=new F(new l(2,2),c);p.frustumCulled=!1,d.add(p);let m=new N;return{render(e,t){n.getDrawingBufferSize(m);let r=Math.min(1,Math.sqrt(35e5/(m.x*m.y))),o=Math.max(1,Math.floor(m.x*r)),l=Math.max(1,Math.floor(m.y*r));if(i.width!==o||i.height!==l){let e=Math.max(1,Math.floor(o*.5)),t=Math.max(1,Math.floor(l*.5));i.setSize(o,l),a.setSize(e,t),s.uTexel.value.set(1/o,1/l),u.uniforms.uOcclusionSize.value.set(e,t)}s.uProjection.value.set(t.projectionMatrix.elements[0],t.projectionMatrix.elements[5]),s.uLogFar.value=Math.log2(t.far+1);let h=n.info.autoReset;n.info.reset(),n.info.autoReset=!1;try{n.setRenderTarget(i),n.render(e,t),n.setRenderTarget(a),p.material=c,n.render(d,f),n.setRenderTarget(null),p.material=u,n.render(d,f)}finally{n.setRenderTarget(null),n.info.autoReset=h}},dispose(){i.dispose(),a.dispose(),p.geometry.dispose(),c.dispose(),u.dispose()}}}var at=new Set([`KeyW`,`KeyA`,`KeyS`,`KeyD`,`ArrowUp`,`ArrowDown`,`ShiftLeft`,`ShiftRight`,`Space`,`KeyE`,`KeyQ`,`ControlLeft`,`ControlRight`]);function ot(e){let{surface:t,movePad:n,thumb:r,lever:i,leverThumb:a}=e,o=new Set,s=matchMedia(`(pointer: coarse)`),c=s.matches,l=new Map,u=null,d=0,f=null,p=0,m=0,h=0,g=null;function _(){f=null,p=0,m=0,r.style.transform=``}function v(){g=null,h=0,a.style.transform=``}function y(){o.clear(),u=null,l.clear(),d=0,v(),_()}function b(){if(l.size!==2)return 0;let[e,t]=l.values();return Math.max(8,Math.hypot(e.x-t.x,e.y-t.y))}function x(t){t!==c&&(c=t,e.onDeviceChange())}function S(e){let t=n.getBoundingClientRect(),i=t.width*.31,a=(e.clientX-t.left-t.width/2)/i,o=(e.clientY-t.top-t.height/2)/i,s=Math.hypot(a,o),c=Math.max(1,s);p=s>.08?a/c:0,m=s>.08?-o/c:0,r.style.transform=`translate(${p*i}px, ${-m*i}px)`}s.addEventListener(`change`,e=>x(e.matches)),window.addEventListener(`pointerdown`,e=>{e.pointerType===`touch`?x(!0):e.pointerType===`mouse`&&!s.matches&&x(!1)}),t.addEventListener(`pointerdown`,e=>{if(e.button!==0)return;let n={x:e.clientX,y:e.clientY};if(e.pointerType===`touch`)u=l.size===0?{id:e.pointerId,...n}:null,l.set(e.pointerId,n),d=b();else{if(u||l.size>0)return;u={id:e.pointerId,...n}}t.setPointerCapture(e.pointerId)}),t.addEventListener(`pointermove`,t=>{let n=l.get(t.pointerId);if(n){n.x=t.clientX,n.y=t.clientY;let r=b();r&&d&&e.zoom(r/d),d=r}t.pointerId===u?.id&&(e.look(t.clientX-u.x,t.clientY-u.y),u.x=t.clientX,u.y=t.clientY)});for(let e of[`pointerup`,`pointercancel`,`lostpointercapture`])t.addEventListener(e,e=>{if(l.delete(e.pointerId)){d=b();let[e]=l.entries();u=l.size===1?{id:e[0],...e[1]}:null}else e.pointerId===u?.id&&(u=null)}),n.addEventListener(e,e=>{e.pointerId===f&&_()});t.addEventListener(`wheel`,n=>{if(!n.deltaY)return;n.preventDefault();let r=n.deltaMode===WheelEvent.DOM_DELTA_LINE?16:n.deltaMode===WheelEvent.DOM_DELTA_PAGE?t.clientHeight:1,i=Math.max(-160,Math.min(160,n.deltaY*r));e.zoom(Math.exp(-i*.002))},{passive:!1}),n.addEventListener(`pointerdown`,e=>{f===null&&e.button===0&&(e.preventDefault(),f=e.pointerId,n.setPointerCapture(e.pointerId),S(e))}),n.addEventListener(`pointermove`,e=>{e.pointerId===f&&S(e)});function C(e){let t=i.getBoundingClientRect(),n=t.height*.32,r=Math.max(-1,Math.min(1,(t.top+t.height/2-e.clientY)/n));h=Math.abs(r)>.12?r:0,a.style.transform=`translateY(${-r*n}px)`}i.addEventListener(`pointerdown`,e=>{g===null&&e.button===0&&(e.preventDefault(),g=e.pointerId,C(e),i.setPointerCapture(e.pointerId))}),i.addEventListener(`pointermove`,e=>{e.pointerId===g&&C(e)});for(let e of[`pointerup`,`pointercancel`,`lostpointercapture`])i.addEventListener(e,e=>{e.pointerId===g&&v()});window.addEventListener(`keydown`,t=>{t.target instanceof HTMLElement&&t.target.closest(`input, select, textarea, button, a, [contenteditable]`)||(t.ctrlKey||t.metaKey||t.altKey)&&t.code!==`ControlLeft`&&t.code!==`ControlRight`||(t.code===`ArrowLeft`||t.code===`ArrowRight`?(t.preventDefault(),t.repeat||e.turn(t.code===`ArrowLeft`?-1:1)):(at.has(t.code)&&(t.preventDefault(),o.add(t.code)),t.repeat||(t.code===`KeyF`&&e.toggleFlight(),t.code===`KeyR`&&e.reset())))}),window.addEventListener(`keyup`,e=>o.delete(e.code)),window.addEventListener(`blur`,y),document.addEventListener(`visibilitychange`,()=>{document.hidden&&y()});let w=(...e)=>e.some(e=>o.has(e));return{get touch(){return c},get side(){return Number(w(`KeyD`))-Number(w(`KeyA`))+p},get ahead(){return Number(w(`KeyW`,`ArrowUp`))-Number(w(`KeyS`,`ArrowDown`))+m},get lift(){return Number(w(`Space`,`KeyE`))-Number(w(`ControlLeft`,`ControlRight`,`KeyQ`))+h},get takeoff(){return h>0||w(`KeyE`)},get running(){return w(`ShiftLeft`,`ShiftRight`)},get jumping(){return w(`Space`)},releaseAll:y}}var st=new D(0,-1,0),ct=.27,lt=1.8,ut=[-.27,0,ct];function dt(e,t,n){let r=!1;for(let i=0,a=e.length-1;i<e.length;a=i++){let[o,s]=e[i],[c,l]=e[a];s>n!=l>n&&t<(c-o)*(n-s)/(l-s)+o&&(r=!r)}return r}function ft(e){let t=[],n=new g;return e.traverse(e=>{if(!(e instanceof F))return;let r=e.geometry,i=r.getAttribute(`position`);if(!i)return;let a=r.index,o=a?.count??i.count,s=e instanceof d?e.count:1,c=e=>new D().fromBufferAttribute(i,a?.getX(e)??e).applyMatrix4(n);for(let r=0;r<s;r++){e instanceof d?(e.getMatrixAt(r,n),n.premultiply(e.matrixWorld)):n.copy(e.matrixWorld);for(let e=0;e+2<o;e+=3){let n=new le(c(e),c(e+1),c(e+2));t.push({triangle:n,bounds:new oe().setFromPoints([n.a,n.b,n.c])})}}}),t}function pt(e,t){e.updateWorldMatrix(!0,!0);let n=new oe().setFromObject(e),r=ft(e),i=new S,a=new D,o=new D,s=new g,c=new u,l=new oe;function f(e){return!e.face||!(e.object instanceof F)||(Array.isArray(e.object.material)?e.object.material[e.face.materialIndex]:e.object.material)?.name!==`walkable`?!1:(e.object instanceof d&&e.instanceId!==void 0?(e.object.getMatrixAt(e.instanceId,s),s.premultiply(e.object.matrixWorld)):s.copy(e.object.matrixWorld),o.copy(e.face.normal).applyNormalMatrix(c.getNormalMatrix(s)).normalize(),o.y>=.707)}function p(r,o){if(!dt(t,r,o))return;i.set(a.set(r,n.max.y+1,o),st);let s=i.intersectObject(e,!0)[0];return s&&f(s)?s.point.y:void 0}return e=>{let{x:t,y:n,z:i}=e;if(![t,n,i].every(Number.isFinite))return;let a=p(t,i);if(!(a===void 0||n<a+.3)){for(let e of ut)for(let n of ut){if(e===0&&n===0)continue;let r=p(t+e,i+n);if(r===void 0||Math.abs(r-a)>.18)return}if(l.min.set(t-ct,a+.05,i-ct),l.max.set(t+ct,a+lt,i+ct),!r.some(({bounds:e,triangle:t})=>e.intersectsBox(l)&&l.intersectsTriangle(t)))return new D(t,a+.035,i)}}}var mt=new D(0,1,0),ht=.18;function gt(e,t){t.set(0,0);for(let n of e){let e=n.gamepad;if(!e||e.axes.length<2)continue;let r=e.mapping===`xr-standard`&&e.axes.length>=4?2:0,i=e.axes[r],a=e.axes[r+1];if(!(!Number.isFinite(i)||!Number.isFinite(a)||Math.hypot(i,a)<ht)){if(n.handedness===`left`)return t.set(i,a);t.lengthSq()===0&&t.set(i,a)}}return t}function _t(){let e=new c,t=new D,n=new D,r=new N;return(i,a,o,s)=>{let{x:c,y:l,z:u,w:d}=i;return e.set(c,l,u,d),t.set(0,0,-1).applyQuaternion(e).applyAxisAngle(mt,a),t.y=0,t.lengthSq()<1e-4&&t.set(-Math.sin(a),0,-Math.cos(a)),t.normalize(),n.crossVectors(t,mt),gt(o,r),s.copy(n).multiplyScalar(r.x).addScaledVector(t,-r.y).clampLength(0,1)}}var vt=1.64;function yt(e){let t=new r(0,0,0,`YXZ`);return(n,r,i)=>{e.position.copy(n),e.position.y+=vt,e.quaternion.setFromEuler(t.set(i,r,0))}}var bt=`modulepreload`,xt=function(e,t){return new URL(e,t).href},St={},Ct=function(e){return e.pathname.endsWith(`.css`)},wt=function(e,t,n){if(t in e)return e[t];let r=n();if(!r){e[t]=void 0;return}let i=r.then(()=>{e[t]=void 0},n=>{throw e[t]=void 0,n});return e[t]=i,i},Tt=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e,i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}function s(e){return import.meta.resolve?new URL(import.meta.resolve(e)):new URL(e,import.meta.url)}r=o(t.map(t=>{t=xt(t,n);let r=s(t),i=Ct(r);return wt(St,r.href,()=>{if(e===void 0){e={all:new Set,styles:new Set};let t=document.getElementsByTagName(`link`);for(let n=t.length-1;n>=0;n--){let r=t[n];e.all.add(r.href),r.rel===`stylesheet`&&e.styles.add(r.href)}}if((i?e.styles:e.all).has(r.href))return;let t=document.createElement(`link`);if(t.rel=i?`stylesheet`:bt,i||(t.as=`script`),t.crossOrigin=``,t.href=r.href,a&&t.setAttribute(`nonce`,a),document.head.appendChild(t),i)return new Promise((e,n)=>{t.addEventListener(`load`,e),t.addEventListener(`error`,()=>n(Error(`Unable to preload CSS for ${r}`)))})})}).filter(e=>e!==void 0))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})},I=e=>document.getElementById(e),Et=I(`app`),L=I(`viewport`),Dt=I(`notice`),Ot=I(`about`),kt=I(`about-panel`),At=I(`fullscreen`),jt=I(`vr`),Mt=I(`places`),Nt=I(`places-toggle`),Pt=I(`compass`),Ft=I(`compass-label`),It=I(`reset`),Lt=I(`controls-hint`),Rt=I(`diagnostics`),zt=new URLSearchParams(window.location.search),Bt=zt.has(`debug`),Vt=!Bt||zt.get(`occlusion`)!==`0`,Ht=!Bt||zt.get(`camera`)!==`0`,Ut=!Bt||zt.get(`reflection`)!==`0`,Wt=[`北`,`东北`,`东`,`东南`,`南`,`西南`,`西`,`西北`],Gt=Math.PI/2,Kt=1.25,qt=.0045,Jt=7,Yt=new D,Xt=new D,Zt=new D,R=new D,z=new D,B=new D,Qt=_t(),V=new D,H=`walk`,U,W,$t,en,G,tn,nn,rn,an,K=0,on=NaN,q,sn=0,J=0,cn=0,ln=1,Y=!1,un=!1,dn,X,fn=``,pn,mn=new e;mn.background=new P(`#b9d5e7`);var Z=new x(57,1,.07,1600),Q=new M;Q.add(Z),mn.add(Q);var hn=yt(Z);function gn(e){if(!Y||X)return;let t=e-K;q=Math.abs(t)<.001?void 0:{start:K,arc:t,durationMs:Math.max(320,1180*Math.abs(t)/Gt),startTime:performance.now()}}function _n(e){if(!q)return;let t=s.clamp((e-q.startTime)/q.durationMs,0,1);K=q.start+q.arc*(t*t*(3-2*t)),t===1&&(q=void 0)}function vn(e){let t=-(q?q.start+q.arc:K)/Gt;gn(-(e>0?Math.floor(t+1.001):Math.ceil(t-1.001))*Gt)}function yn(){gn(K-(s.euclideanModulo(K+Math.PI,Math.PI*2)-Math.PI))}function bn(e,t){if(!Y||X)return;q=void 0;let n=qt/Z.zoom;K-=e*n,sn=s.clamp(sn-t*n,-1.25,Kt)}function xn(){return(U?.manifest.northYaw??0)+K}function Sn(){Z.zoom=ln,Z.updateProjectionMatrix()}function Cn(e){!Y||X||!Number.isFinite(e)||e<=0||(ln=s.clamp(ln*e,.78,2.5),Sn())}var $=ot({surface:L,movePad:I(`move-pad`),thumb:I(`move-thumb`),lever:I(`lift-lever`),leverThumb:I(`lift-thumb`),toggleFlight:In,reset:Mn,turn:vn,look:bn,zoom:Cn,onDeviceChange:Tn});function wn(){if(K===on)return;on=K,Pt.style.setProperty(`--turn`,`${K.toFixed(4)}rad`);let e=`朝${Wt[s.euclideanModulo(Math.round(-K/(Gt/2)),Wt.length)]}`;Ft.textContent!==e&&(Ft.textContent=e)}function Tn(){let e=!!(U&&Y),t=e&&!X;Et.dataset.mode=H,It.disabled=!t,Nt.disabled=!t,t||Ln(!1),Pt.hidden=!t,I(`move-pad`).hidden=!t,I(`lift-lever`).hidden=!t||!W,Lt.hidden=!e,e&&(Lt.textContent=fn||($.touch?{walk:`拖动画面转视角 · 摇杆移动 · 推杆向上起飞`,fly:`飞行中 · 推杆升降 · 降到地面自动落地`}:{walk:`拖动画面转视角 · WASD 或摇杆移动 · 推杆向上或按 E 起飞`,fly:`飞行中 · 推杆或 E、Q 升降 · 降到地面自动落地`})[H])}function En(e,t){let n=$t?.(e.x,e.z,t.x,t.z)??1;t.x=e.x+(t.x-e.x)*n,t.z=e.z+(t.z-e.z)*n}function Dn(){let e=H===`walk`?W?.position:z;e&&!X&&hn(e,xn(),sn)}function On(e,t=0){let n=U?.manifest.northYaw??0;K=(e.yaw??n)-n,q=void 0,sn=e.pitch??t}function kn(e){V.fromArray(e.position),W?.teleport(V),R.copy(V),On(e)}function An(e,t,n){z.fromArray(e.position),z.y+=t,On(e,n)}function jn(){window.clearTimeout(pn),fn=``}function Mn(){U&&!X&&(ln=1,Sn(),Nn(U.manifest.spawn))}function Nn(e){U&&!X&&(W?Fn(`walk`,e):(jn(),$.releaseAll(),An(e,e===U.manifest.spawn?Math.max(10,U.size.y*.6):2,-.2),Dn(),Tn()))}function Pn(){if(U&&W)return U.manifest.collisionFromModels?W.findLanding(z):en?.(V.copy(z).addScaledVector(Z.up,vt))}function Fn(e,t,n){Y&&U&&!X&&W&&(e!==H||t)&&(jn(),H===`fly`&&e===`walk`&&!t&&!n&&(n=Pn(),!n&&(U.manifest.collisionFromModels||en))?(fn=`脚下没有足够的落脚空间，换个位置再落地`,pn=window.setTimeout(()=>{fn=``,Tn()},3e3),Tn()):(t&&$.releaseAll(),J=0,e===`fly`&&z.copy(W.position),H=e,e===`walk`&&(t?kn(t):(W.teleport(n??R),n&&R.copy(n))),Dn(),Tn()))}function In(){let e=H===`fly`;Fn(e?`walk`:`fly`),!e&&H===`fly`&&(J=Jt)}function Ln(e){let t=e??Mt.hidden;t&&Gn(!1),Mt.hidden=!t,Nt.setAttribute(`aria-expanded`,String(t))}function Rn(){let e=L.clientWidth,t=L.clientHeight;e&&t&&(Z.aspect=e/t,Z.updateProjectionMatrix(),G&&!X&&(G.setPixelRatio(Math.min(devicePixelRatio,$.touch?1.5:2)),G.setSize(e,t,!1)))}function zn(){let e=xn();Yt.set(-Math.sin(e),0,-Math.cos(e)),Xt.set(Math.cos(e),0,-Math.sin(e)),Zt.copy(Yt).multiplyScalar($.ahead).addScaledVector(Xt,$.side),Zt.clampLength(0,1)}function Bn(e,t){if(zn(),H===`walk`&&W&&$.takeoff&&Fn(`fly`),H===`walk`&&W){W.update(e,Zt,$.running,$.jumping),W.grounded&&R.copy(W.position),U&&W.position.y<U.bounds.min.y-8&&W.teleport(R),Dn();return}if(!U)return;let n=$.running?32:16,r=s.clamp($.lift,-1,1);if(r)J=0;else if(J>0){let t=Math.min(J,Math.max(.6,J*2.4)*e);J-=t,r=t/(n*e||1)}let i=U.manifest.collisionFromModels&&W,a=i?0:Math.max(25,Math.max(U.size.x,U.size.z)*.4);B.copy(z).addScaledVector(Zt,e*n),$t?En(z,B):i||(B.x=s.clamp(B.x,U.bounds.min.x-a,U.bounds.max.x+a),B.z=s.clamp(B.z,U.bounds.min.z-a,U.bounds.max.z+a)),B.copy(W?.constrainFlight(z,B)??B),En(z,B),z.copy(B),B.copy(z),B.y+=r*n*e,i||(B.y=s.clamp(B.y,U.bounds.min.y+.02,U.bounds.max.y+a*2));let o=z.y-B.y;if(z.copy(W?.constrainFlight(z,B)??B),r<0&&o>0&&z.y-B.y>o*.5&&t-cn>200){cn=t;let e=Pn();e&&z.y-e.y<1.2&&Fn(`walk`,void 0,e)}Dn()}function Vn(e,t){if(!W||!X||!t)return;let n=G.xr.getReferenceSpace(),r=n&&t.getViewerPose(n);if(r&&(Qt(r.transform.orientation,Q.rotation.y,X.inputSources,Zt),W.update(e,Zt,!1,!1),W.grounded&&R.copy(W.position),U&&W.position.y<U.bounds.min.y-8&&W.teleport(R),Q.position.copy(W.position),$t)){let e=r.transform.position;V.set(e.x,0,e.z).applyAxisAngle(Z.up,Q.rotation.y);let t=$t(W.position.x,W.position.z,W.position.x+V.x,W.position.z+V.z);Q.position.addScaledVector(V,t-1)}}async function Hn(){if(navigator.xr&&W&&window.isSecureContext)try{if(!await navigator.xr.isSessionSupported(`immersive-vr`))return;jt.hidden=!1}catch{}}async function Un(){if(W&&navigator.xr&&!X){jt.disabled=!0;try{let e=await navigator.xr.requestSession(`immersive-vr`,{requiredFeatures:[`local-floor`]});Fn(`walk`),q=void 0,X=e,$.releaseAll(),Tn(),Q.position.copy(W.position),Q.rotation.y=xn(),Z.position.set(0,0,0),Z.quaternion.identity(),e.addEventListener(`end`,()=>{X=void 0,Q.position.set(0,0,0),Q.rotation.y=0,Dn(),jt.disabled=!1,Tn(),queueMicrotask(Rn)},{once:!0}),await G.xr.setSession(e)}catch(e){X&&X.end().catch(()=>{}),jt.disabled=!1,console.warn(`未能进入头显 VR`,e),Lt.textContent=`暂时无法进入头显，请检查浏览器的 VR 连接。`}}}function Wn(e,t){let n=Math.min(.1,dn===void 0?0:(e-dn)/1e3);dn=e,Y&&(X?Vn(n,t):(_n(e),Bn(n,e),wn()));let r=H===`walk`?W?.position:z;if(tn?.update(H,r,un,n),nn?.(n,X?Q.position:Z.position),rn?.update(Z,e,Y&&H===`walk`),Y&&!$.touch&&!G.xr.isPresenting&&an?an.render(mn,Z):G.render(mn,Z),!un&&(un=!0,Dt.hidden=!0,U)){let{visuals:e,manifestURL:t,manifest:n}=U;U.loadSurroundings().then(async r=>{e.add(r);let{createStreetLife:i}=await Tt(async()=>{let{createStreetLife:e}=await import(`./campus-street-life-D6LAs962.js`);return{createStreetLife:e}},__vite__mapDeps([0,1]),import.meta.url);nn=i(r,t,n.streetRoutes,e=>tn?.addStreetReflections(e))}).catch(e=>console.warn(`校园周边场景载入失败`,e))}if(Bt){let e=Z.position.toArray().map(e=>e.toFixed(2)).join(`, `),{calls:t,triangles:n}=G.info.render,i=r?.toArray().map(e=>e.toFixed(2)).join(`, `)??`—`;Rt.textContent=`${H}${H===`walk`&&W?.grounded?` grounded`:``}\n${e}\n${t} draws · ${n.toLocaleString()} tris\nheading ${xn().toFixed(3)}\nfeet ${i}\nfacing ${Ft.textContent}\nzoom ${Z.zoom.toFixed(3)}\nmirror ${rn?.active?`on`:`off`} · ${rn?.passes??0} captures`}}function Gn(e){let t=e??kt.hidden;t&&Ln(!1),kt.hidden=!t,Ot.setAttribute(`aria-expanded`,String(t))}function Kn(e,t){if(I(`campus-title`).textContent=e.title,document.title=`${e.title} · 3D 校园`,I(`campus-status`).textContent=e.status??`3D 校园`,I(`description`).textContent=e.description??e.status??`可以步行或飞行查看校园场景。`,e.evidenceUrl){let n=new URL(e.evidenceUrl,t);if(n.protocol===`https:`||n.protocol===`http:`){let e=I(`evidence`);e.href=n.href,e.hidden=!1}}for(let t of e.locations??[]){let e=document.createElement(`button`);e.type=`button`,e.textContent=t.label,e.addEventListener(`click`,()=>{Ln(!1),Nn(t),L.focus({preventScroll:!0})}),Mt.append(e)}Nt.hidden=!Mt.childElementCount}async function qn(){try{let e=Tt(()=>import(`./player-BNrZjX8V.js`).then(async e=>(await e.preparePlayerPhysics(),e)),__vite__mapDeps([2,1,3]),import.meta.url).catch(e=>({loadError:e}));if(G=new te({antialias:!0,powerPreference:`high-performance`,logarithmicDepthBuffer:!0}),G.outputColorSpace=h,G.toneMapping=6,G.toneMappingExposure=1.04,G.shadowMap.enabled=!0,G.shadowMap.autoUpdate=!1,G.shadowMap.type=1,G.xr.enabled=!0,G.xr.setReferenceSpaceType(`local-floor`),!$.touch&&Vt&&(an=it(G,Ht)),L.tabIndex=0,L.appendChild(G.domElement),new ResizeObserver(Rn).observe(L),Rn(),Rt.hidden=!Bt,At.hidden=!document.fullscreenEnabled,U=await Ce(),U.manifest.tourBoundary&&($t=we(U.manifest.tourBoundary)),mn.add(U.visuals),tn=$e(mn,Z,G,U,$.touch),rn=ke(G,mn,U.visuals,Ut&&!$.touch),Kn(U.manifest,U.manifestURL),U.collision.children.length)try{let t=await e;if(`loadError`in t)throw t.loadError;W=await t.createPlayerController(U.collision,new D().fromArray(U.manifest.spawn.position),{object:new M,updateMotion(){},dispose(){}},U.manifest.collisionFromModels,$t),!U.manifest.collisionFromModels&&U.manifest.landingBoundary&&(en=pt(U.collision,U.manifest.landingBoundary))}catch(e){console.warn(`校园碰撞载入失败`,e),I(`description`).append(` 本次载入未启用步行。`)}!W&&U.collision.children.length===0&&I(`description`).append(` 当前场景支持飞行。`),W||(H=`fly`),Y=!0,Nn(U.manifest.spawn),G.setAnimationLoop(Wn),Hn()}catch(e){console.error(e),I(`loading-mark`).hidden=!0,I(`notice-title`).textContent=`场景未能加载`,I(`notice-detail`).textContent=e instanceof Error?e.message:`请重新加载页面。`,I(`retry`).hidden=!1}}Pt.addEventListener(`click`,()=>{yn(),L.focus({preventScroll:!0})}),It.addEventListener(`click`,()=>{Mn(),L.focus({preventScroll:!0})}),Nt.addEventListener(`click`,()=>Ln()),Ot.addEventListener(`click`,()=>Gn()),L.addEventListener(`pointerdown`,()=>{Ln(!1),Gn(!1)}),document.addEventListener(`keydown`,e=>{e.key===`Escape`&&(kt.hidden?Mt.hidden||(Ln(!1),Nt.focus()):(Gn(!1),Ot.focus()))}),At.addEventListener(`click`,async()=>{try{document.fullscreenElement?await document.exitFullscreen():await Et.requestFullscreen()}catch{}}),document.addEventListener(`fullscreenchange`,()=>{At.lastChild.textContent=document.fullscreenElement?`退出全屏`:`全屏`}),jt.addEventListener(`click`,()=>void Un()),I(`retry`).addEventListener(`click`,()=>window.location.reload()),window.addEventListener(`pagehide`,e=>{e.persisted||(W?.dispose(),tn?.dispose(),rn?.dispose(),an?.dispose(),G&&(G.setAnimationLoop(null),G.dispose()))}),qn();