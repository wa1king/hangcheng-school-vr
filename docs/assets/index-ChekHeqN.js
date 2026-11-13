const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./campus-street-life-D7UIbkcN.js","./three-runtime-CDB0kq_a.js","./player-CJNiXZE0.js","./physics-runtime-BR_-CEU_.js"])))=>i.map(i=>d[i]);
import{$ as e,A as t,B as n,C as r,D as i,F as a,G as o,H as s,I as c,J as l,K as u,L as d,M as f,N as p,O as m,P as h,Q as g,R as _,S as v,T as y,U as b,V as x,W as S,X as C,Y as w,Z as T,_ as E,at as D,b as O,c as k,et as A,f as j,h as ee,i as te,it as M,j as N,k as ne,l as re,m as ie,n as ae,nt as oe,ot as se,q as ce,r as le,rt as ue,s as de,st as fe,tt as pe,u as me,v as he,w as ge,x as _e}from"./three-runtime-CDB0kq_a.js";(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var ve=new URL(`./scene/scene.json`,window.location.href),ye=e=>Array.isArray(e)&&e.length===3&&e.every(Number.isFinite);function be(e){return e&&ye(e.position)&&(e.yaw===void 0||Number.isFinite(e.yaw))&&(e.pitch===void 0||Number.isFinite(e.pitch)&&Math.abs(e.pitch)<=1.49)}function xe(e){let t=new URL(e,ve);if(t.origin!==ve.origin||!t.pathname.toLowerCase().endsWith(`.glb`))throw Error(`模型必须是项目内的 GLB 文件。`);return t.href}function Se(e,t,n,r=!1){e.updateWorldMatrix(!0,!0);let i=e=>{if(!(e instanceof _))return;let r=n(e);if(!r)return;let i=e.clone(!1);i.geometry=r,i.matrixAutoUpdate=!1,i.matrix.copy(e.matrixWorld),i.visible=!0,t.add(i)};r?e.traverseVisible(i):e.traverse(i)}function Ce(e){for(;e;){let t=e.name.toUpperCase();if(t===`COLLISION`||t.startsWith(`COLLISION_`))return!0;e=e.parent}return!1}function we(e){if(Ce(e))return;let t=e=>e&&!e.name.startsWith(`decal-`),n=e.geometry;if(!Array.isArray(e.material))return t(e.material)?n:void 0;let r=e.material,i=n.groups.filter(e=>t(r[e.materialIndex??0]));if(!i.length)return;if(i.length===n.groups.length)return n;let a=new Uint32Array(i.reduce((e,t)=>e+t.count,0)),o=0;for(let e of i)for(let t=e.start;t<e.start+e.count;t+=1)a[o++]=n.index?n.index.getX(t):t;return new ee().setAttribute(`position`,n.getAttribute(`position`)).setIndex(new ie(a,1))}async function Te(){let e=await fetch(ve,{cache:`no-cache`});if(!e.ok||!e.headers.get(`content-type`)?.includes(`json`))throw Error(`还没有找到校园场景文件。`);let t=await e.json();if(typeof t.title!=`string`||!Array.isArray(t.models)||!t.models.length||!be(t.spawn))throw Error(`校园场景缺少名称、模型或有效起点。`);if(t.northYaw!==void 0&&!Number.isFinite(t.northYaw))throw Error(`校园方位设置无效。`);if(t.overview&&(!ye(t.overview.position)||!ye(t.overview.target)))throw Error(`校园总览机位无效。`);if(t.collisionFromModels!==void 0&&typeof t.collisionFromModels!=`boolean`)throw Error(`校园碰撞来源无效。`);if(t.streetRoutes!==void 0&&(typeof t.streetRoutes!=`string`||new URL(t.streetRoutes,ve).origin!==ve.origin))throw Error(`道路路线文件无效。`);if(t.landingBoundary&&(!Array.isArray(t.landingBoundary)||t.landingBoundary.length<3||!t.landingBoundary.every(e=>Array.isArray(e)&&e.length===2&&e.every(Number.isFinite))))throw Error(`校园可落地区域数据无效。`);if(t.tourBoundary!==void 0&&(!Array.isArray(t.tourBoundary)||t.tourBoundary.length<3||!t.tourBoundary.every(e=>Array.isArray(e)&&e.length===2&&e.every(Number.isFinite))))throw Error(`校园游览边界无效。`);for(let e of t.models)if(typeof e?.url!=`string`||e.position!==void 0&&!ye(e.position)||e.rotationY!==void 0&&!Number.isFinite(e.rotationY)||e.surroundings!==void 0&&typeof e.surroundings!=`boolean`||e.scale!==void 0&&(!Number.isFinite(e.scale)||e.scale<=0))throw Error(`校园模型的文件路径或坐标无效。`);if(t.locations&&(!Array.isArray(t.locations)||!t.locations.every(e=>be(e)&&typeof e.id==`string`&&typeof e.label==`string`)))throw Error(`校园地点数据无效。`);let n=new te().setMeshoptDecoder(le),r=new m,i=new m,a=t.models.filter(e=>!e.surroundings),[o,s]=await Promise.all([Promise.all(a.map(e=>c(e))),!t.collisionFromModels&&t.collisionUrl?n.loadAsync(xe(t.collisionUrl)):void 0]);async function c(e){let t=await n.loadAsync(xe(e.url)),r=new m;return e.position&&r.position.fromArray(e.position),r.rotation.y=e.rotationY??0,r.scale.setScalar(e.scale??1),r.add(t.scene),e.surroundings&&r.traverse(e=>{e.userData.surroundings=!0,e.userData.shadow=!1}),r}for(let e of o)r.add(e);t.collisionFromModels?Se(r,i,we,!0):s?Se(s.scene,i,e=>e.userData.collision===!1?void 0:e.geometry):Se(r,i,e=>Ce(e)?e.geometry:void 0);let l=new j;if(r.updateWorldMatrix(!0,!0),r.traverse(e=>{if(Ce(e)){e.visible=!1;return}if(!(e instanceof _))return;let t=Array.isArray(e.material)?e.material:[e.material];e.castShadow=e.userData.shadow!==!1&&t.some(e=>!e.transparent&&(!e.name.startsWith(`decal-`)||e.alphaTest>0)),e.receiveShadow=e.userData.shadow!==!1,e.geometry.boundingBox||e.geometry.computeBoundingBox(),e.geometry.boundingBox&&l.union(e.geometry.boundingBox.clone().applyMatrix4(e.matrixWorld))}),l.isEmpty())throw Error(`校园模型中没有可见网格。`);let u=l.getSize(new D),d=l.getCenter(new D);async function f(){let e=new m,n=await Promise.all(t.models.filter(e=>e.surroundings).map(c));for(let t of n)e.add(t);return e}return{manifest:t,visuals:r,collision:i,bounds:l,size:u,center:d,manifestURL:ve,loadSurroundings:f}}function Ee(e){let t=e.map(([t,n],r)=>{let[i,a]=e[(r+1)%e.length];return{x:t,z:n,dx:i-t,dz:a-n}}),n=Math.sign(t.reduce((e,t)=>e+t.x*t.dz-t.z*t.dx,0));return(e,r,i,a)=>{let o=i-e,s=a-r,c=Math.hypot(o,s);if(c<1e-8)return 1;let l=1;for(let i of t){let t=o*i.dz-s*i.dx;if(t*n<=1e-9)continue;let a=i.x-e,u=i.z-r,d=(a*s-u*o)/t;if(d<-1e-9||d>1+1e-9)continue;let f=(a*i.dz-u*i.dx)/t;f>=-1e-9&&f<=l&&(l=Math.max(0,f-.001/c))}return l}}var De=-.02,Oe=-24*Math.PI/180,ke=new Set([`plaza`,`walk`,`courtyard-paving`,`plaza-inlay`,`decal-brickline`]),Ae=`
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
`;function je(e,t,r,i){let a=i&&e.extensions.has(`EXT_color_buffer_float`),o=new fe(1,1,{type:a?ne:oe,minFilter:p,generateMipmaps:!0});o.texture.name=`Campus paving reflection`;let s={tCampusMirror:{value:null},uCampusMirrorProjection:{value:new d},uCampusMirrorActive:{value:0},uCampusGroundLevel:{value:De},uCampusSiteRotation:{value:new M(Math.cos(Oe),Math.sin(Oe))}},c=new Set;r.traverse(e=>{if(!(e instanceof _))return;let t=Array.isArray(e.material)?e.material:[e.material];for(let e of t){if(!(e instanceof n)||c.has(e)||!ke.has(e.name))continue;c.add(e);let t=e.onBeforeCompile.bind(e),r=e.customProgramCacheKey();e.customProgramCacheKey=()=>`${r}|campus-ground-v1`,e.onBeforeCompile=(e,n)=>{t(e,n),Object.assign(e.uniforms,s),e.vertexShader=e.vertexShader.replace(`#include <common>`,`#include <common>
varying vec3 vCampusMirrorWorld;`).replace(`#include <project_vertex>`,`
            #include <project_vertex>
            vCampusMirrorWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;
          `),e.fragmentShader=e.fragmentShader.replace(`#include <common>`,`#include <common>\n${Ae}`).replace(`#include <metalnessmap_fragment>`,`
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
          `)},e.needsUpdate=!0}});let l=new b,u=new D,f=new D,m=new D(1/0,1/0,1/0),h=new D,g=new M,v=new M,y=new S,x=new se,C=new se,w=new d().set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),T=-1/0,E=!0,O=0;function k(){s.uCampusMirrorActive.value=0,E=!0}return a&&e.domElement.addEventListener(`webglcontextrestored`,k),{get active(){return s.uCampusMirrorActive.value!==0},get passes(){return O},update(n,r,i){n.getWorldPosition(u),n.getWorldDirection(f);let c=s.uCampusSiteRotation.value.x,d=s.uCampusSiteRotation.value.y;if(v.set(c*u.x+d*u.z,-d*u.x+c*u.z),!a||!i||e.xr.isPresenting||f.y>.58||u.y<.35||u.y>4.2||v.x<-20||v.x>48||v.y<-32||v.y>78){k();return}if(e.shadowMap.needsUpdate){E=!0;return}e.getDrawingBufferSize(g);let p=Math.min(.43,576/Math.max(g.x,g.y)),_=Math.max(16,Math.round(g.x*p)),b=Math.max(16,Math.round(g.y*p)),S=o.width!==_||o.height!==b,D=m.distanceToSquared(u)>.022**2||h.dot(f)<.999993;if(!S&&(!E&&!D||r-T<38))return;S&&o.setSize(_,b),l.position.copy(u),l.position.y=2*De-u.y,l.up.setFromMatrixColumn(n.matrixWorld,1),l.up.y*=-1,f.y*=-1,l.lookAt(f.add(l.position)),l.updateMatrixWorld(!0),l.near=n.near,l.far=n.far,l.projectionMatrix.copy(n.projectionMatrix);let A=l.projectionMatrix.elements;y.normal.set(0,1,0),y.constant=.024,y.applyMatrix4(l.matrixWorldInverse),x.set(y.normal.x,y.normal.y,y.normal.z,y.constant),C.set((Math.sign(x.x)+A[8])/A[0],(Math.sign(x.y)+A[9])/A[5],-1,(1+A[10])/A[14]);let j=x.dot(C);if(Math.abs(j)<1e-5){s.uCampusMirrorActive.value=0;return}s.uCampusMirrorProjection.value.copy(w).multiply(l.projectionMatrix).multiply(l.matrixWorldInverse),x.multiplyScalar(2/j),A[2]=x.x,A[6]=x.y,A[10]=x.z+1,A[14]=x.w,l.projectionMatrixInverse.copy(l.projectionMatrix).invert();let ee=e.getRenderTarget(),te=e.xr.enabled;s.uCampusMirrorActive.value=0,s.tCampusMirror.value=null;try{e.xr.enabled=!1,e.setRenderTarget(o),e.state.buffers.depth.setMask(!0),e.render(t,l)}finally{e.setRenderTarget(ee),e.xr.enabled=te}s.tCampusMirror.value=o.texture,s.uCampusMirrorActive.value=1,m.copy(u),n.getWorldDirection(h),T=r,E=!1,O+=1},dispose(){a&&e.domElement.removeEventListener(`webglcontextrestored`,k),o.dispose()}}}var Me=`
  varying vec3 vCampusBakeWorld;
  uniform highp sampler3D tCampusBake;
  uniform vec3 uCampusBakeOrigin;
  uniform vec3 uCampusBakeStep;
  uniform vec3 uCampusBakeSize;
  uniform vec2 uCampusBakeRotation;
  uniform float uCampusBakeActive;
`,Ne=`
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
`;function Pe(e,t){let n=new URLSearchParams(window.location.search);if(n.has(`debug`)&&n.get(`bake`)===`0`)return;let r=new URL(t,e).searchParams.get(`v`);if(!r||!/^[\da-f]{12}$/.test(r))return;let i={tCampusBake:{value:null},uCampusBakeOrigin:{value:new D},uCampusBakeStep:{value:new D(1,1,1)},uCampusBakeSize:{value:new D(1,1,1)},uCampusBakeRotation:{value:new M(1,0)},uCampusBakeActive:{value:0}},o=new URL(`campus-baked-light.bin`,e);o.searchParams.set(`v`,r);let s=new AbortController,c=!1;function l(){c||s.signal.aborted||(c=!0,fetch(o,{signal:s.signal}).then(async e=>{if(!e.ok)return;let t=await e.arrayBuffer();if(t.byteLength<64||s.signal.aborted)return;let n=new TextDecoder;if(n.decode(new Uint8Array(t,0,4))!==`HCB1`||n.decode(new Uint8Array(t,48,12))!==r)return;let a=new DataView(t),o=a.getUint32(4,!0),c=a.getUint32(8,!0),l=a.getUint32(12,!0),u=[28,32,36].map(e=>a.getFloat32(e,!0));if(o<2||c<2||l<2||o*c*l*4!=t.byteLength-64||u.some(e=>!(e>0)||!Number.isFinite(e)))return;let d=new O(new Uint8Array(t,64),o,c,l);d.minFilter=f,d.magFilter=f,d.needsUpdate=!0,i.tCampusBake.value=d,i.uCampusBakeOrigin.value.set(a.getFloat32(16,!0),a.getFloat32(20,!0),a.getFloat32(24,!0)),i.uCampusBakeStep.value.set(u[0],u[1],u[2]),i.uCampusBakeSize.value.set(o,c,l),i.uCampusBakeRotation.value.set(a.getFloat32(40,!0),a.getFloat32(44,!0)),i.uCampusBakeActive.value=1}).catch(()=>{}))}return{start:l,skyVisibilityAt(e){let t=i.tCampusBake.value;if(!t)return 1;let{width:n,height:r,depth:o}=t.image,s=t.image.data,{x:c,y:l}=i.uCampusBakeRotation.value,u=i.uCampusBakeOrigin.value,d=i.uCampusBakeStep.value,f=(e.x*c+e.z*l-u.x)/d.x,p=(-e.x*l+e.z*c-u.y)/d.y,m=(e.y-u.z)/d.z,h=a.smoothstep(Math.min(f,n-1-f,p,r-1-p),0,3),g=a.smoothstep(m,-1.5,-.1)*a.smoothstep(o-1-m,0,2);if(h===0||g===0)return 1;let _=Math.floor(f),v=Math.floor(p),y=Math.max(0,m),b=Math.floor(y),x=4*n,S=x*r,C=_*4+v*x+b*S,w=a.lerp(a.lerp(s[C],s[C+4],f-_),a.lerp(s[C+x],s[C+x+4],f-_),p-v),T=C+S,E=a.lerp(a.lerp(s[T],s[T+4],f-_),a.lerp(s[T+x],s[T+x+4],f-_),p-v),D=a.lerp(w,E,y-b)/255;return a.lerp(1,D,h*g)},register(e){if(e.transparent||e.name.startsWith(`decal-`))return;let t=e.onBeforeCompile,n=e.customProgramCacheKey();e.onBeforeCompile=(n,r)=>{t.call(e,n,r),Object.assign(n.uniforms,i),n.vertexShader=n.vertexShader.replace(`#include <common>`,`#include <common>
varying vec3 vCampusBakeWorld;`).replace(`#include <project_vertex>`,`
            #include <project_vertex>
            vCampusBakeWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;
          `),n.fragmentShader=n.fragmentShader.replace(`#include <common>`,`#include <common>\n${Me}`).replace(`#include <lights_fragment_end>`,`${Ne}\n#include <lights_fragment_end>`)},e.customProgramCacheKey=()=>`${n}|campus-bake-v1`},dispose(){s.abort(),i.uCampusBakeActive.value=0,i.tCampusBake.value?.dispose(),i.tCampusBake.value=null}}}var Fe=`scene/campus-photo-sky.hdr?v=44f8af5b5dda`;async function Ie(){let t=new URL(`./${Fe}`,window.location.href),n=await new ae().loadAsync(t.href);return n.mapping=303,n.wrapS=C,n.needsUpdate=!0,{material:new e({uniforms:{uSky:{value:n},uHorizon:{value:new E(`#bed0d9`)}},vertexShader:`
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
      }`,side:1,depthTest:!1,depthWrite:!1,toneMapped:!1}),texture:n}}var Le=new Map([[`plaza`,[`pavers`,.31,.26,.0022]],[`walk`,[`pavers`,.3,.22,.0022]],[`street-paving`,[`stone`,.26,.12,.0024]],[`street-curb`,[`stone`,.32,.07,.002]],[`street-verge`,[`scanned`,.29,.02,.0018]],[`street-soil`,[`scanned`,.33,.03,.0028]],[`plaza-inlay`,[`stone`,.23,.13,.0015]],[`courtyard-paving`,[`pavers`,.33,.24,.0022]],[`teaching-floor`,[`pavers`,.16,.38,8e-4]],[`beige`,[`masonry`,.23,.06,.0012]],[`terra`,[`masonry`,.29,.08,.0014]],[`road`,[`scanned`,.35,.14,.0034]],[`teaching-wall`,[`scanned`,.1,.02,5e-4]],[`teaching-ceiling`,[`scanned`,.075,.02,5e-4]],[`soffit`,[`scanned`,.2,.04,.0012]],[`cream`,[`scanned`,.17,.05,9e-4]],[`reveal`,[`scanned`,.19,.04,8e-4]],[`entry-stone`,[`stone`,.22,.27,.0016]],[`entry-nosing`,[`stone`,.19,.2,.0012]],[`entry-traction`,[`stone`,.23,.12,.0022]],[`stair-stone`,[`stone`,.13,.27,.0011]],[`gallery-base-stone`,[`stone`,.17,.15,.001]],[`curb`,[`stone`,.27,.09,.0026]],[`plinth`,[`stone`,.3,.1,.0018]],[`apron`,[`stone`,.34,.06,.0024]],[`decal-brickline`,[`stone`,.27,.19,.0015]],[`decal-paint-yellow`,[`paint`,.25,.12,0]],[`decal-paint-white`,[`paint`,.21,.1,0]],[`decal-sports_paint`,[`paint`,.14,.09,0]]]),Re=new Set([`road`,`street-paving`,`street-curb`,`walk`,`plaza-inlay`]),ze=`
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
`,Be=`
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
`,Ve=`
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
`,He=`
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
`,Ue=`
  #if defined(CAMPUS_SCANNED) && defined(USE_ROUGHNESSMAP)
    #undef vRoughnessMapUv
  #endif
  roughnessFactor = clamp(roughnessFactor + campusDirt * .38 + campusJoint * .10
    + campusPores * .045 - campusWear * uCampusSurfaceResponse.y, .22, .98);
`,We=`
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
`;function Ge(e){if(e.name.startsWith(`decal-street-leaf-`)||e.name.startsWith(`decal-leaf-spray-`)){let t=e.onBeforeCompile,n=e.customProgramCacheKey();e.onBeforeCompile=(n,r)=>{t.call(e,n,r),n.fragmentShader=n.fragmentShader.replace(`#include <lights_physical_pars_fragment>`,ze)},e.customProgramCacheKey=()=>`${n}|campus-leaf-transmission`;return}let t=Le.get(e.name);if(!t)return;let[n,r,i,a]=t,o=Re.has(e.name),s=e.onBeforeCompile,c=e.customProgramCacheKey();e.onBeforeCompile=(t,c)=>{s.call(e,t,c),t.uniforms.uCampusSurfaceResponse={value:[r,i,a]},t.vertexShader=t.vertexShader.replace(`#include <common>`,`#include <common>
varying vec3 vCampusSurface;`).replace(`#include <project_vertex>`,`
        #include <project_vertex>
        vCampusSurface = (modelMatrix * vec4(transformed, 1.0)).xyz;
      `),t.fragmentShader=t.fragmentShader.replace(`#include <common>`,`#include <common>\n#define CAMPUS_${n.toUpperCase()}\n${Be}`).replace(`#include <map_fragment>`,`${Ve}\n#include <map_fragment>\n${He}`).replace(`#include <roughnessmap_fragment>`,`
        #if defined(CAMPUS_SCANNED) && defined(USE_ROUGHNESSMAP)
          vec2 campusRoughnessUv = vRoughnessMapUv + campusScanShift;
          #define vRoughnessMapUv campusRoughnessUv
        #endif
        #include <roughnessmap_fragment>
        ${Ue}
      `).replace(`#include <normal_fragment_maps>`,`
        #if defined(CAMPUS_SCANNED) && defined(USE_NORMALMAP_TANGENTSPACE)
          vec2 campusNormalUv = vNormalMapUv + campusScanShift;
          #define vNormalMapUv campusNormalUv
        #endif
        #include <normal_fragment_maps>
        ${We}
      `),o&&(t.fragmentShader=t.fragmentShader.replace(`#include <lights_fragment_end>`,`
        #include <lights_fragment_end>
        reflectedLight.directSpecular *= .14;
        reflectedLight.indirectSpecular *= .22;
      `))},e.customProgramCacheKey=()=>`${c}|campus-surface-v2:${n}:${o}`}var Ke=new D(-.69,.55,.47).normalize(),qe=new E(`#bed0d9`),Je=new E(`#568bc6`),Ye=new Set([`ground`,`plaza`,`walk`,`courtyard-paving`,`road`,`planter`,`plaza-inlay`,`street-paving`,`street-curb`,`street-verge`,`street-soil`,`teaching-floor`]);function Xe(t){let n=new e({uniforms:{uZenith:{value:Je},uHorizon:{value:qe},uCloud:{value:new E(`#f3f5ef`)},uSun:{value:Ke}},vertexShader:`
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
      }`,side:1,depthTest:!1,depthWrite:!1,toneMapped:!1}),r=new _(new A(t,32,16),n);return r.renderOrder=-1e3,r.frustumCulled=!1,r}function Ze(){let e=new Uint16Array(73728),t=new E(`#69725e`),n=new E(`#fff0d7`),r=v.toHalfFloat,i=new E;for(let o=0;o<96;o+=1){let s=((o+.5)/96-.5)*Math.PI,c=Math.sin(s),l=Math.cos(s);for(let u=0;u<192;u+=1){let d=((u+.5)/192-.5)*Math.PI*2,f=Math.max(0,l*(Math.cos(d)*Ke.x+Math.sin(d)*Ke.z)+c*Ke.y);i.copy(qe),c>=0?i.lerp(Je,a.smoothstep(c,0,.92)):i.lerp(t,a.smoothstep(-c,0,.38));let p=a.smoothstep(Math.sin(d*3+s*13.1)*.62+Math.cos(d*7-s*25.1)*.25+Math.sin(d*11+s*37)*.13,.27,.86)*a.smoothstep(c,.06,.43);i.lerp(n,p*.37).multiplyScalar(.75+Math.max(0,c)*.53);let m=.53*f**21+2.6*f**225;i.r+=n.r*m,i.g+=n.g*m,i.b+=n.b*m;let h=(o*192+u)*4;e.set([r(i.r),r(i.g),r(i.b),r(1)],h)}}let o=new _e(e,192,96,l,ne);return o.mapping=303,o.colorSpace=h,o.minFilter=f,o.magFilter=f,o.needsUpdate=!0,o}var Qe=`
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
`;function $e(e,t,r,i,a,o,s,c){let l=t.manifest.locations?.find(e=>e.id===`gate`),u=t.manifest.locations?.find(e=>e.id===`courtyard`);if(!l||!u||!e.extensions.has(`EXT_color_buffer_float`))return;let d=new D().fromArray(u.position).add(new D(0,5.2,0)),f=new D().fromArray(l.position).lerp(d,.41);f.y=l.position[1]+5.1;let m=[f,d],h=m.map(()=>new k(128,{type:ne,generateMipmaps:!0,minFilter:p})),v=new M,y=new M,b={uCampusEntryProbe:{value:h[0].texture},uCampusCourtProbe:{value:h[1].texture},uCampusEntryProbeCenter:{value:f},uCampusCourtProbeCenter:{value:d},uCampusProbeActive:{value:v}};function x(e,t,n){let r=e.onBeforeCompile,i=e.customProgramCacheKey(),a={value:t?.88:.65};e.onBeforeCompile=(t,i)=>{r.call(e,t,i),Object.assign(t.uniforms,b,{uCampusProbeStrength:a}),t.vertexShader=t.vertexShader.replace(`#include <common>`,`#include <common>
varying vec3 vCampusProbePosition;`).replace(`#include <project_vertex>`,`
          #include <project_vertex>
          vCampusProbePosition = (modelMatrix * vec4(transformed, 1.0)).xyz;
        `);let o=de.envmap_physical_pars_fragment.replace(`return envMapColor.rgb * envMapIntensity;`,`return campusProbeSample(reflectVec, roughness, envMapColor.rgb) * envMapIntensity;`);t.fragmentShader=t.fragmentShader.replace(`#include <common>`,`#include <common>\n${Qe}`).replace(`#include <envmap_physical_pars_fragment>`,o),n&&(t.fragmentShader=t.fragmentShader.replace(`#include <opaque_fragment>`,`
        float faceOn = clamp(dot(normalize(vViewPosition), normal), 0.0, 1.0);
        diffuseColor.a *= mix(0.67, 1.43, pow(1.0 - faceOn, 4.0));
        #include <opaque_fragment>
      `))},e.customProgramCacheKey=()=>`${i}|campus-probe-${n?`clear`:`opaque`}`}function S(){let l=new g;l.background=r.background,l.fog=r.fog;let u=t.visuals.clone(!0),d=new Map;u.traverse(e=>{if(!(e instanceof _))return;let t=e=>{let t=d.get(e);return t||(t=e.clone(),t.visible=e.visible&&!e.transparent,t instanceof n&&(t.envMap=null),d.set(e,t)),t};e.material=Array.isArray(e.material)?e.material.map(t):t(e.material)});let f=i.clone(),p=c.clone();p.shadow.mapSize.set(512,512),p.shadow.bias=-2e-4,p.shadow.normalBias=.04,Object.assign(p.shadow.camera,{left:-48,right:48,top:48,bottom:-48,near:55,far:185}),p.shadow.camera.updateProjectionMatrix(),l.add(u,f,a.clone(),o.clone(),s.clone(),p,p.target);let v=new he(.2,840,h[0]);return v.coordinateSystem=e.coordinateSystem,v.updateCoordinateSystem(),{prepare(){let t=e.getRenderTarget(),n=e.getActiveCubeFace(),r=e.getActiveMipmapLevel();try{return e.setRenderTarget(h[0]),e.compileAsync(l,v.children[0])}finally{e.setRenderTarget(t,n,r)}},renderFace(t,n){let r=h[t];if(n===0){let e=m[t];f.position.copy(e),p.target.position.copy(e),p.position.copy(e).addScaledVector(Ke,120),v.position.copy(e),v.updateMatrixWorld(!0)}let i=n===v.children.length-1,a=e.getRenderTarget(),o=e.getActiveCubeFace(),s=e.getActiveMipmapLevel(),c=e.xr.enabled,u=e.shadowMap.autoUpdate,d=e.shadowMap.needsUpdate;try{e.xr.enabled=!1,e.shadowMap.autoUpdate=!1,e.shadowMap.needsUpdate=n===0,r.texture.generateMipmaps=i,e.setRenderTarget(r,n),e.state.buffers.depth.setMask(!0),e.render(l,v.children[n]),i&&y.setComponent(t,1)}finally{e.setRenderTarget(a,o,s),e.xr.enabled=c,e.shadowMap.autoUpdate=u,e.shadowMap.needsUpdate=d}return i},dispose(){p.shadow.dispose();for(let e of d.values())e.dispose()}}}let C,w=0,T=0,E=0,O=!1,A;function j(){A?.(),A=void 0,C?.dispose(),C=void 0,E=0,O=!1,w=0,T=0,v.set(0,0),y.set(0,0)}e.domElement.addEventListener(`webglcontextrestored`,j);function ee(t){if(v.copy(y).multiplyScalar(+!e.xr.isPresenting),T>=h.length||A||O||!t||e.xr.isPresenting)return;let n=performance.now();if(E===0&&(E=n+1050),n<E)return;let r=()=>{if(A=void 0,!(document.hidden||e.xr.isPresenting||e.getContext().isContextLost())){try{if(!C&&(C=S(),e.extensions.has(`KHR_parallel_shader_compile`))){let e=C;O=!0,e.prepare().catch(e=>console.warn(`校园反射材质预编译未完成`,e)).finally(()=>{C===e&&(O=!1)});return}C.renderFace(T,w++)&&(w=0,T+=1)}catch(e){O=!1,console.warn(`校园局部反射未能生成`,e),w=0,T+=1}E=performance.now()+45,T>=h.length&&(C?.dispose(),C=void 0)}};if(typeof window.requestIdleCallback==`function`){let e=window.requestIdleCallback(r,{timeout:250});A=()=>window.cancelIdleCallback(e)}else{let e=window.setTimeout(r,0);A=()=>window.clearTimeout(e)}}return{register:x,update:ee,dispose(){A?.(),C?.dispose(),e.domElement.removeEventListener(`webglcontextrestored`,j);for(let e of h)e.dispose()}}}function et(e,t){let n=e.geometry,r=n.getAttribute(`position`);if(!r)return;let i=new D,a=[],o=new Map,s=[],c=[],l=[],u=e=>{for(;c[e]!==e;)c[e]=c[c[e]],e=c[e];return e};for(let t=0;t<r.count;t+=1){i.fromBufferAttribute(r,t).applyMatrix4(e.matrixWorld);let n=`${Math.round(i.x*500)},${Math.round(i.y*500)},${Math.round(i.z*500)}`,a=o.get(n);a===void 0&&(a=l.length,o.set(n,a),l.push(i.clone()),c.push(a)),s[t]=a}let d=n.index,f=d?.count??r.count;for(let e=0;e+2<f;e+=3){let t=u(s[d?.getX(e)??e]),n=u(s[d?.getX(e+1)??e+1]),r=u(s[d?.getX(e+2)??e+2]);c[n]=t,c[r]=t}for(let[e,t]of l.entries()){let n=u(e);(a[n]??=new j).expandByPoint(t)}for(let e of a){if(!e||e.getSize(i).lengthSq()<.14**2)continue;let n=e.getCenter(new D);n.y=e.min.y-.045,t.push(n)}}function tt(e,r,s,c,l){let d=Math.max(c.size.x,c.size.z,30);e.fog=new i(qe,d*.46,d*2.75),r.far=Math.max(600,d*8),r.updateProjectionMatrix();let f=Xe(r.far*.8),p=Math.max(3e3,d*16),m=new _(new o(p,p),new n({color:`#7f8f68`,roughness:1}));m.rotation.x=-Math.PI/2,m.position.set(c.center.x,c.bounds.min.y-.36,c.center.z);let h=new t(`#dbeaff`,`#c7beaa`,.95),g=new me(`#eae6dc`,.14),v=new ge(`#fff0d7`,3.71),y=Ke.clone().multiplyScalar(d*1.3);v.castShadow=!0;let b=l?1024:2048;v.shadow.mapSize.set(b,b),v.shadow.intensity=.94,v.shadow.radius=2;let x=Ze(),S=[],C=[new u(`#fff0d8`,0,5.2,2),new u(`#fff0d8`,0,5.2,2)];e.add(f,m,h,g,v,v.target,...C);let w=new URLSearchParams(window.location.search),T=w.has(`debug`),E=!T||w.get(`camera`)!==`0`,O=s.toneMappingExposure,k=T&&w.get(`photoSky`)===`0`,A=!1,j=!1,ee,te=Pe(c.manifestURL,c.manifest.models[0].url),M=!l&&!(T&&w.get(`probe`)===`0`)?$e(s,c,e,f,m,h,g,v):void 0;c.manifest.collisionFromModels&&c.collision.add(m.clone()),c.visuals.updateMatrixWorld(!0);let N=new Set,ne=Math.min(s.capabilities.getMaxAnisotropy(),l?4:8);c.visuals.traverse(e=>{if(!(e instanceof _))return;let t=Array.isArray(e.material)?e.material:[e.material];t.every(e=>e.name===`glass-clear`)&&(e.castShadow=!1),t.every(e=>e.name===`teaching-lamp`)&&et(e,S);for(let r of t)if(r instanceof n&&!N.has(r)){if(N.add(r),Ge(r),Ye.has(r.name))for(let e of[r.map,r.normalMap,r.roughnessMap])e&&e.anisotropy<ne&&(e.anisotropy=ne,e.needsUpdate=!0);r.name===`teaching-lamp`?(r.emissive.set(`#fff1db`),r.emissiveIntensity=1.05):r.name.startsWith(`glass-`)?(r.envMap=x,r.envMapIntensity=r.name===`glass-clear`?1.42:1.02,r.roughness=Math.min(r.roughness,.25),r.name!==`glass-clear`&&(r.metalness=Math.max(r.metalness,.11)),M?.register(r,!0,r.name===`glass-clear`)):[`teaching-metal`,`frame`,`blue-rail`,`blue-cap`,`stand_steel`,`entry-aluminum`,`stainless`,`entry-drain-frame`,`entry-drain-grate`].includes(r.name)?(r.envMap=x,r.envMapIntensity=.48,r.metalness=Math.max(r.metalness,.27),M?.register(r,!1,!1)):r.name===`teaching-floor`&&(r.envMap=x,r.envMapIntensity=.22),e.userData.surroundings||te?.register(r)}});let re=new D,ie=0;function ae(){A=!0,te?.start(),k||Ie().then(({material:e,texture:t})=>{if(j)e.dispose(),t.dispose();else{f.material.dispose(),f.material=e,ee=t;for(let e of N)e instanceof n&&e.envMap===x&&(e.envMap=t)}}).catch(()=>{}).finally(()=>{k=!0})}function oe(e){let t,n,r=5.4**2,i=5.4**2;if(e)for(let a of S){let o=a.y-e.y;if(o<1.92||o>3.95)continue;let s=(a.x-e.x)**2+(a.z-e.z)**2;s<r?(n=t,i=r,t=a,r=s):s<i&&(n=a,i=s)}for(let[e,o]of C.entries()){let s=e?n:t,c=e?i:r;s&&o.position.copy(s),o.intensity=s?4.9*(1-a.smoothstep(c,9,5.4**2)):0}}function se(e,t,n,i){if(r.getWorldPosition(f.position),n&&!A&&ae(),M?.update(n&&k),E){let t=e===`walk`?te?.skyVisibilityAt(f.position)??1:1,n=O+.24*(1-a.smoothstep(t,.04,.65));s.toneMappingExposure=a.damp(s.toneMappingExposure,n,3,i)}oe(e===`walk`?t:void 0);let o=t&&(e===`walk`||e===`fly`&&t.y<c.bounds.max.y+14),l=o?e===`walk`?25:38:Math.max(c.size.length()*.56,25);if(o?re.set(Math.round(t.x/8)*8,Math.round(t.y/8)*8,Math.round(t.z/8)*8):re.copy(c.center),ie!==l||!v.target.position.equals(re)){if(v.target.position.copy(re),v.position.copy(re).add(y),ie!==l){ie=l;let e=y.length(),t=l*2.4;Object.assign(v.shadow.camera,{left:-l,right:l,top:l,bottom:-l,near:Math.max(.1,e-t),far:e+t}),v.shadow.camera.updateProjectionMatrix(),v.shadow.bias=o?-16e-5:-11e-5,v.shadow.normalBias=o?.018:.074}s.shadowMap.needsUpdate=!0}}return{update:se,addStreetReflections(e){e.traverse(e=>{if(!(e instanceof _))return;let t=Array.isArray(e.material)?e.material:[e.material];for(let e of t)e instanceof n&&!N.has(e)&&(N.add(e),e.envMap=ee??x,e.envMapIntensity=.52,e.needsUpdate=!0)})},dispose(){j=!0;for(let e of[f,m])e.removeFromParent(),e.geometry.dispose(),e.material.dispose();M?.dispose(),te?.dispose(),ee?.dispose(),x.dispose(),v.shadow.dispose(),h.removeFromParent(),g.removeFromParent(),v.removeFromParent(),v.target.removeFromParent();for(let e of C)e.removeFromParent()}}}var nt=`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`,rt=`
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
`,it=`
  varying vec2 vUv;
  ${rt}

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
`,at=`
  varying vec2 vUv;
  uniform sampler2D tColor;
  uniform sampler2D tOcclusion;
  uniform vec2 uOcclusionSize;
  uniform float uCameraResponse;
  ${rt}

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
`;function ot(t,n){if(!t.extensions.has(`EXT_color_buffer_float`))return;let i=new fe(1,1,{type:ne,depthTexture:new r(1,1,ue)}),a=new fe(1,1,{depthBuffer:!1,minFilter:x,magFilter:x}),c={tDepth:{value:i.depthTexture},uProjection:{value:new M},uTexel:{value:new M},uLogFar:{value:0}},l=new e({uniforms:c,vertexShader:nt,fragmentShader:it,depthTest:!1,depthWrite:!1,toneMapped:!1}),u=new e({uniforms:{...c,tColor:{value:i.texture},tOcclusion:{value:a.texture},uOcclusionSize:{value:new M},uCameraResponse:{value:+!!n}},vertexShader:nt,fragmentShader:at,depthTest:!1,depthWrite:!1}),d=new g,f=new s,p=new _(new o(2,2),l);p.frustumCulled=!1,d.add(p);let m=new M;return{render(e,n){t.getDrawingBufferSize(m);let r=Math.min(1,Math.sqrt(35e5/(m.x*m.y))),o=Math.max(1,Math.floor(m.x*r)),s=Math.max(1,Math.floor(m.y*r));if(i.width!==o||i.height!==s){let e=Math.max(1,Math.floor(o*.5)),t=Math.max(1,Math.floor(s*.5));i.setSize(o,s),a.setSize(e,t),c.uTexel.value.set(1/o,1/s),u.uniforms.uOcclusionSize.value.set(e,t)}c.uProjection.value.set(n.projectionMatrix.elements[0],n.projectionMatrix.elements[5]),c.uLogFar.value=Math.log2(n.far+1);let h=t.info.autoReset;t.info.reset(),t.info.autoReset=!1;try{t.setRenderTarget(i),t.render(e,n),t.setRenderTarget(a),p.material=l,t.render(d,f),t.setRenderTarget(null),p.material=u,t.render(d,f)}finally{t.setRenderTarget(null),t.info.autoReset=h}},dispose(){i.dispose(),a.dispose(),p.geometry.dispose(),l.dispose(),u.dispose()}}}var st=new Set([`KeyW`,`KeyA`,`KeyS`,`KeyD`,`ArrowUp`,`ArrowDown`,`ShiftLeft`,`ShiftRight`,`Space`,`KeyE`,`KeyQ`,`ControlLeft`,`ControlRight`]);function ct(e){let{surface:t,movePad:n,thumb:r,lever:i,leverThumb:a}=e,o=new Set,s=matchMedia(`(pointer: coarse)`),c=s.matches,l=new Map,u=null,d=0,f=null,p=0,m=0,h=0,g=null;function _(){f=null,p=0,m=0,r.style.transform=``}function v(){g=null,h=0,a.style.transform=``}function y(){o.clear(),u=null,l.clear(),d=0,v(),_()}function b(){if(l.size!==2)return 0;let[e,t]=l.values();return Math.max(8,Math.hypot(e.x-t.x,e.y-t.y))}function x(t){t!==c&&(c=t,e.onDeviceChange())}function S(e){let t=n.getBoundingClientRect(),i=t.width*.31,a=(e.clientX-t.left-t.width/2)/i,o=(e.clientY-t.top-t.height/2)/i,s=Math.hypot(a,o),c=Math.max(1,s);p=s>.08?a/c:0,m=s>.08?-o/c:0,r.style.transform=`translate(${p*i}px, ${-m*i}px)`}s.addEventListener(`change`,e=>x(e.matches)),window.addEventListener(`pointerdown`,e=>{e.pointerType===`touch`?x(!0):e.pointerType===`mouse`&&!s.matches&&x(!1)}),t.addEventListener(`pointerdown`,e=>{if(e.button!==0)return;let n={x:e.clientX,y:e.clientY};if(e.pointerType===`touch`)u=l.size===0?{id:e.pointerId,...n}:null,l.set(e.pointerId,n),d=b();else{if(u||l.size>0)return;u={id:e.pointerId,...n}}t.setPointerCapture(e.pointerId)}),t.addEventListener(`pointermove`,t=>{let n=l.get(t.pointerId);if(n){n.x=t.clientX,n.y=t.clientY;let r=b();r&&d&&e.zoom(r/d),d=r}t.pointerId===u?.id&&(e.look(t.clientX-u.x,t.clientY-u.y),u.x=t.clientX,u.y=t.clientY)});for(let e of[`pointerup`,`pointercancel`,`lostpointercapture`])t.addEventListener(e,e=>{if(l.delete(e.pointerId)){d=b();let[e]=l.entries();u=l.size===1?{id:e[0],...e[1]}:null}else e.pointerId===u?.id&&(u=null)}),n.addEventListener(e,e=>{e.pointerId===f&&_()});t.addEventListener(`wheel`,n=>{if(!n.deltaY)return;n.preventDefault();let r=n.deltaMode===WheelEvent.DOM_DELTA_LINE?16:n.deltaMode===WheelEvent.DOM_DELTA_PAGE?t.clientHeight:1,i=Math.max(-160,Math.min(160,n.deltaY*r));e.zoom(Math.exp(-i*.002))},{passive:!1}),n.addEventListener(`pointerdown`,e=>{f===null&&e.button===0&&(e.preventDefault(),f=e.pointerId,n.setPointerCapture(e.pointerId),S(e))}),n.addEventListener(`pointermove`,e=>{e.pointerId===f&&S(e)});function C(e){let t=i.getBoundingClientRect(),n=t.height*.32,r=Math.max(-1,Math.min(1,(t.top+t.height/2-e.clientY)/n));h=Math.abs(r)>.12?r:0,a.style.transform=`translateY(${-r*n}px)`}i.addEventListener(`pointerdown`,e=>{g===null&&e.button===0&&(e.preventDefault(),g=e.pointerId,C(e),i.setPointerCapture(e.pointerId))}),i.addEventListener(`pointermove`,e=>{e.pointerId===g&&C(e)});for(let e of[`pointerup`,`pointercancel`,`lostpointercapture`])i.addEventListener(e,e=>{e.pointerId===g&&v()});window.addEventListener(`keydown`,t=>{t.target instanceof HTMLElement&&t.target.closest(`input, select, textarea, button, a, [contenteditable]`)||(t.ctrlKey||t.metaKey||t.altKey)&&t.code!==`ControlLeft`&&t.code!==`ControlRight`||(t.code===`ArrowLeft`||t.code===`ArrowRight`?(t.preventDefault(),t.repeat||e.turn(t.code===`ArrowLeft`?-1:1)):(st.has(t.code)&&(t.preventDefault(),o.add(t.code)),t.repeat||(t.code===`KeyF`&&e.toggleFlight(),t.code===`KeyR`&&e.reset())))}),window.addEventListener(`keyup`,e=>o.delete(e.code)),window.addEventListener(`blur`,y),document.addEventListener(`visibilitychange`,()=>{document.hidden&&y()});let w=(...e)=>e.some(e=>o.has(e));return{get touch(){return c},get side(){return Number(w(`KeyD`))-Number(w(`KeyA`))+p},get ahead(){return Number(w(`KeyW`,`ArrowUp`))-Number(w(`KeyS`,`ArrowDown`))+m},get lift(){return Number(w(`Space`,`KeyE`))-Number(w(`ControlLeft`,`ControlRight`,`KeyQ`))+h},get takeoff(){return h>0||w(`KeyE`)},get running(){return w(`ShiftLeft`,`ShiftRight`)},get jumping(){return w(`Space`)},releaseAll:y}}var lt=new D(0,-1,0),ut=.27,dt=1.8,ft=[-.27,0,ut];function pt(e,t,n){let r=!1;for(let i=0,a=e.length-1;i<e.length;a=i++){let[o,s]=e[i],[c,l]=e[a];s>n!=l>n&&t<(c-o)*(n-s)/(l-s)+o&&(r=!r)}return r}function mt(e){let t=[],n=new d;return e.traverse(e=>{if(!(e instanceof _))return;let r=e.geometry,i=r.getAttribute(`position`);if(!i)return;let a=r.index,o=a?.count??i.count,s=e instanceof N?e.count:1,c=e=>new D().fromBufferAttribute(i,a?.getX(e)??e).applyMatrix4(n);for(let r=0;r<s;r++){e instanceof N?(e.getMatrixAt(r,n),n.premultiply(e.matrixWorld)):n.copy(e.matrixWorld);for(let e=0;e+2<o;e+=3){let n=new pe(c(e),c(e+1),c(e+2));t.push({triangle:n,bounds:new j().setFromPoints([n.a,n.b,n.c])})}}}),t}function ht(e,t){e.updateWorldMatrix(!0,!0);let n=new j().setFromObject(e),r=mt(e),i=new w,a=new D,o=new D,s=new d,l=new c,u=new j;function f(e){return!e.face||!(e.object instanceof _)||(Array.isArray(e.object.material)?e.object.material[e.face.materialIndex]:e.object.material)?.name!==`walkable`?!1:(e.object instanceof N&&e.instanceId!==void 0?(e.object.getMatrixAt(e.instanceId,s),s.premultiply(e.object.matrixWorld)):s.copy(e.object.matrixWorld),o.copy(e.face.normal).applyNormalMatrix(l.getNormalMatrix(s)).normalize(),o.y>=.707)}function p(r,o){if(!pt(t,r,o))return;i.set(a.set(r,n.max.y+1,o),lt);let s=i.intersectObject(e,!0)[0];return s&&f(s)?s.point.y:void 0}return e=>{let{x:t,y:n,z:i}=e;if(![t,n,i].every(Number.isFinite))return;let a=p(t,i);if(!(a===void 0||n<a+.3)){for(let e of ft)for(let n of ft){if(e===0&&n===0)continue;let r=p(t+e,i+n);if(r===void 0||Math.abs(r-a)>.18)return}if(u.min.set(t-ut,a+.05,i-ut),u.max.set(t+ut,a+dt,i+ut),!r.some(({bounds:e,triangle:t})=>e.intersectsBox(u)&&u.intersectsTriangle(t)))return new D(t,a+.035,i)}}}var gt=new D(0,1,0),_t=.18;function vt(e,t){t.set(0,0);for(let n of e){let e=n.gamepad;if(!e||e.axes.length<2)continue;let r=e.mapping===`xr-standard`&&e.axes.length>=4?2:0,i=e.axes[r],a=e.axes[r+1];if(!(!Number.isFinite(i)||!Number.isFinite(a)||Math.hypot(i,a)<_t)){if(n.handedness===`left`)return t.set(i,a);t.lengthSq()===0&&t.set(i,a)}}return t}function yt(){let e=new ce,t=new D,n=new D,r=new M;return(i,a,o,s)=>{let{x:c,y:l,z:u,w:d}=i;return e.set(c,l,u,d),t.set(0,0,-1).applyQuaternion(e).applyAxisAngle(gt,a),t.y=0,t.lengthSq()<1e-4&&t.set(-Math.sin(a),0,-Math.cos(a)),t.normalize(),n.crossVectors(t,gt),vt(o,r),s.copy(n).multiplyScalar(r.x).addScaledVector(t,-r.y).clampLength(0,1)}}var bt=1.64;function xt(e){let t=new y(0,0,0,`YXZ`);return(n,r,i)=>{e.position.copy(n),e.position.y+=bt,e.quaternion.setFromEuler(t.set(i,r,0))}}var St=`modulepreload`,Ct=function(e,t){return new URL(e,t).href},wt={},Tt=function(e){return e.pathname.endsWith(`.css`)},Et=function(e,t,n){if(t in e)return e[t];let r=n();if(!r){e[t]=void 0;return}let i=r.then(()=>{e[t]=void 0},n=>{throw e[t]=void 0,n});return e[t]=i,i},Dt=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e,i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}function s(e){return import.meta.resolve?new URL(import.meta.resolve(e)):new URL(e,import.meta.url)}r=o(t.map(t=>{t=Ct(t,n);let r=s(t),i=Tt(r);return Et(wt,r.href,()=>{if(e===void 0){e={all:new Set,styles:new Set};let t=document.getElementsByTagName(`link`);for(let n=t.length-1;n>=0;n--){let r=t[n];e.all.add(r.href),r.rel===`stylesheet`&&e.styles.add(r.href)}}if((i?e.styles:e.all).has(r.href))return;let t=document.createElement(`link`);if(t.rel=i?`stylesheet`:St,i||(t.as=`script`),t.crossOrigin=``,t.href=r.href,a&&t.setAttribute(`nonce`,a),document.head.appendChild(t),i)return new Promise((e,n)=>{t.addEventListener(`load`,e),t.addEventListener(`error`,()=>n(Error(`Unable to preload CSS for ${r}`)))})})}).filter(e=>e!==void 0))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})},P=e=>document.getElementById(e),Ot=P(`app`),F=P(`viewport`),kt=P(`notice`),At=P(`about`),jt=P(`about-panel`),Mt=P(`fullscreen`),Nt=P(`vr`),Pt=P(`places`),Ft=P(`places-toggle`),It=P(`compass`),Lt=P(`compass-label`),Rt=P(`reset`),zt=P(`controls-hint`),Bt=P(`diagnostics`),Vt=new URLSearchParams(window.location.search),Ht=Vt.has(`debug`),Ut=!Ht||Vt.get(`occlusion`)!==`0`,Wt=!Ht||Vt.get(`camera`)!==`0`,Gt=!Ht||Vt.get(`reflection`)!==`0`,Kt=[`北`,`东北`,`东`,`东南`,`南`,`西南`,`西`,`西北`],qt=Math.PI/2,Jt=1.25,Yt=.0045,Xt=7,Zt=new D,Qt=new D,$t=new D,I=new D,L=new D,R=new D,en=yt(),z=new D,B=`walk`,V,H,tn,nn,U,rn,an,on,sn,W=0,cn=NaN,G,ln=0,K=0,un=0,dn=1,q=!1,fn=!1,pn,J,mn=``,hn,Y=new g;Y.background=new E(`#b9d5e7`);var X=new b(57,1,.07,1600),Z=new m;Z.add(X),Y.add(Z);var gn=xt(X);function _n(e){if(!q||J)return;let t=e-W;G=Math.abs(t)<.001?void 0:{start:W,arc:t,durationMs:Math.max(320,1180*Math.abs(t)/qt),startTime:performance.now()}}function vn(e){if(!G)return;let t=a.clamp((e-G.startTime)/G.durationMs,0,1);W=G.start+G.arc*(t*t*(3-2*t)),t===1&&(G=void 0)}function yn(e){let t=-(G?G.start+G.arc:W)/qt;_n(-(e>0?Math.floor(t+1.001):Math.ceil(t-1.001))*qt)}function bn(){_n(W-(a.euclideanModulo(W+Math.PI,Math.PI*2)-Math.PI))}function xn(e,t){if(!q||J)return;G=void 0;let n=Yt/X.zoom;W-=e*n,ln=a.clamp(ln-t*n,-1.25,Jt)}function Sn(){return(V?.manifest.northYaw??0)+W}function Cn(){X.zoom=dn,X.updateProjectionMatrix()}function wn(e){!q||J||!Number.isFinite(e)||e<=0||(dn=a.clamp(dn*e,.78,2.5),Cn())}var Q=ct({surface:F,movePad:P(`move-pad`),thumb:P(`move-thumb`),lever:P(`lift-lever`),leverThumb:P(`lift-thumb`),toggleFlight:In,reset:Mn,turn:yn,look:xn,zoom:wn,onDeviceChange:$});function Tn(){if(W===cn)return;cn=W,It.style.setProperty(`--turn`,`${W.toFixed(4)}rad`);let e=`朝${Kt[a.euclideanModulo(Math.round(-W/(qt/2)),Kt.length)]}`;Lt.textContent!==e&&(Lt.textContent=e)}function $(){let e=!!(V&&q),t=e&&!J;Ot.dataset.mode=B,Rt.disabled=!t,Ft.disabled=!t,t||Ln(!1),It.hidden=!t,P(`move-pad`).hidden=!t,P(`lift-lever`).hidden=!t||!H,zt.hidden=!e,e&&(zt.textContent=mn||(Q.touch?{walk:`拖动画面转视角 · 摇杆移动 · 推杆向上起飞`,fly:`飞行中 · 推杆升降 · 降到地面自动落地`}:{walk:`拖动画面转视角 · WASD 或摇杆移动 · 推杆向上或按 E 起飞`,fly:`飞行中 · 推杆或 E、Q 升降 · 降到地面自动落地`})[B])}function En(e,t){let n=tn?.(e.x,e.z,t.x,t.z)??1;t.x=e.x+(t.x-e.x)*n,t.z=e.z+(t.z-e.z)*n}function Dn(){let e=B===`walk`?H?.position:L;e&&!J&&gn(e,Sn(),ln)}function On(e,t=0){let n=V?.manifest.northYaw??0;W=(e.yaw??n)-n,G=void 0,ln=e.pitch??t}function kn(e){z.fromArray(e.position),H?.teleport(z),I.copy(z),On(e)}function An(e,t,n){L.fromArray(e.position),L.y+=t,On(e,n)}function jn(){window.clearTimeout(hn),mn=``}function Mn(){V&&!J&&(dn=1,Cn(),Nn(V.manifest.spawn))}function Nn(e){V&&!J&&(H?Fn(`walk`,e):(jn(),Q.releaseAll(),An(e,e===V.manifest.spawn?Math.max(10,V.size.y*.6):2,-.2),Dn(),$()))}function Pn(){if(V&&H)return V.manifest.collisionFromModels?H.findLanding(L):nn?.(z.copy(L).addScaledVector(X.up,bt))}function Fn(e,t,n){q&&V&&!J&&H&&(e!==B||t)&&(jn(),B===`fly`&&e===`walk`&&!t&&!n&&(n=Pn(),!n&&(V.manifest.collisionFromModels||nn))?(mn=`脚下没有足够的落脚空间，换个位置再落地`,hn=window.setTimeout(()=>{mn=``,$()},3e3),$()):(t&&Q.releaseAll(),K=0,e===`fly`&&L.copy(H.position),B=e,e===`walk`&&(t?kn(t):(H.teleport(n??I),n&&I.copy(n))),Dn(),$()))}function In(){let e=B===`fly`;Fn(e?`walk`:`fly`),!e&&B===`fly`&&(K=Xt)}function Ln(e){let t=e??Pt.hidden;t&&Gn(!1),Pt.hidden=!t,Ft.setAttribute(`aria-expanded`,String(t))}function Rn(){let e=F.clientWidth,t=F.clientHeight;e&&t&&(X.aspect=e/t,X.updateProjectionMatrix(),U&&!J&&(U.setPixelRatio(Math.min(devicePixelRatio,Q.touch?1.5:2)),U.setSize(e,t,!1)))}function zn(){let e=Sn();Zt.set(-Math.sin(e),0,-Math.cos(e)),Qt.set(Math.cos(e),0,-Math.sin(e)),$t.copy(Zt).multiplyScalar(Q.ahead).addScaledVector(Qt,Q.side),$t.clampLength(0,1)}function Bn(e,t){if(zn(),B===`walk`&&H&&Q.takeoff&&Fn(`fly`),B===`walk`&&H){H.update(e,$t,Q.running,Q.jumping),H.grounded&&I.copy(H.position),V&&H.position.y<V.bounds.min.y-8&&H.teleport(I),Dn();return}if(!V)return;let n=Q.running?32:16,r=a.clamp(Q.lift,-1,1);if(r)K=0;else if(K>0){let t=Math.min(K,Math.max(.6,K*2.4)*e);K-=t,r=t/(n*e||1)}let i=V.manifest.collisionFromModels&&H,o=i?0:Math.max(25,Math.max(V.size.x,V.size.z)*.4);R.copy(L).addScaledVector($t,e*n),tn?En(L,R):i||(R.x=a.clamp(R.x,V.bounds.min.x-o,V.bounds.max.x+o),R.z=a.clamp(R.z,V.bounds.min.z-o,V.bounds.max.z+o)),R.copy(H?.constrainFlight(L,R)??R),En(L,R),L.copy(R),R.copy(L),R.y+=r*n*e,i||(R.y=a.clamp(R.y,V.bounds.min.y+.02,V.bounds.max.y+o*2));let s=L.y-R.y;if(L.copy(H?.constrainFlight(L,R)??R),r<0&&s>0&&L.y-R.y>s*.5&&t-un>200){un=t;let e=Pn();e&&L.y-e.y<1.2&&Fn(`walk`,void 0,e)}Dn()}function Vn(e,t){if(!H||!J||!t)return;let n=U.xr.getReferenceSpace(),r=n&&t.getViewerPose(n);if(r&&(en(r.transform.orientation,Z.rotation.y,J.inputSources,$t),H.update(e,$t,!1,!1),H.grounded&&I.copy(H.position),V&&H.position.y<V.bounds.min.y-8&&H.teleport(I),Z.position.copy(H.position),tn)){let e=r.transform.position;z.set(e.x,0,e.z).applyAxisAngle(X.up,Z.rotation.y);let t=tn(H.position.x,H.position.z,H.position.x+z.x,H.position.z+z.z);Z.position.addScaledVector(z,t-1)}}async function Hn(){if(navigator.xr&&H&&window.isSecureContext)try{if(!await navigator.xr.isSessionSupported(`immersive-vr`))return;Nt.hidden=!1}catch{}}async function Un(){if(H&&navigator.xr&&!J){Nt.disabled=!0;try{let e=await navigator.xr.requestSession(`immersive-vr`,{requiredFeatures:[`local-floor`]});Fn(`walk`),G=void 0,J=e,Q.releaseAll(),$(),Z.position.copy(H.position),Z.rotation.y=Sn(),X.position.set(0,0,0),X.quaternion.identity(),e.addEventListener(`end`,()=>{J=void 0,Z.position.set(0,0,0),Z.rotation.y=0,Dn(),Nt.disabled=!1,$(),queueMicrotask(Rn)},{once:!0}),await U.xr.setSession(e)}catch(e){J&&J.end().catch(()=>{}),Nt.disabled=!1,console.warn(`未能进入头显 VR`,e),zt.textContent=`暂时无法进入头显，请检查浏览器的 VR 连接。`}}}function Wn(e,t){let n=Math.min(.1,pn===void 0?0:(e-pn)/1e3);pn=e,q&&(J?Vn(n,t):(vn(e),Bn(n,e),Tn()));let r=B===`walk`?H?.position:L;if(rn?.update(B,r,fn,n),an?.(n,J?Z.position:X.position),on?.update(X,e,q&&B===`walk`),q&&!Q.touch&&!U.xr.isPresenting&&sn?sn.render(Y,X):U.render(Y,X),!fn&&(fn=!0,kt.hidden=!0,V)){let{visuals:e,manifestURL:t,manifest:n}=V;V.loadSurroundings().then(async r=>{e.add(r);let{createStreetLife:i}=await Dt(async()=>{let{createStreetLife:e}=await import(`./campus-street-life-D7UIbkcN.js`);return{createStreetLife:e}},__vite__mapDeps([0,1]),import.meta.url);an=i(r,t,n.streetRoutes,e=>rn?.addStreetReflections(e))}).catch(e=>console.warn(`校园周边场景载入失败`,e))}if(Ht){let e=X.position.toArray().map(e=>e.toFixed(2)).join(`, `),{calls:t,triangles:n}=U.info.render,i=r?.toArray().map(e=>e.toFixed(2)).join(`, `)??`—`;Bt.textContent=`${B}${B===`walk`&&H?.grounded?` grounded`:``}\n${e}\n${t} draws · ${n.toLocaleString()} tris\nheading ${Sn().toFixed(3)}\nfeet ${i}\nfacing ${Lt.textContent}\nzoom ${X.zoom.toFixed(3)}\nmirror ${on?.active?`on`:`off`} · ${on?.passes??0} captures`}}function Gn(e){let t=e??jt.hidden;t&&Ln(!1),jt.hidden=!t,At.setAttribute(`aria-expanded`,String(t))}function Kn(e,t){if(P(`campus-title`).textContent=e.title,document.title=`${e.title} · 3D 校园`,P(`campus-status`).textContent=e.status??`3D 校园`,P(`description`).textContent=e.description??e.status??`可以步行或飞行查看校园场景。`,e.evidenceUrl){let n=new URL(e.evidenceUrl,t);if(n.protocol===`https:`||n.protocol===`http:`){let e=P(`evidence`);e.href=n.href,e.hidden=!1}}for(let t of e.locations??[]){let e=document.createElement(`button`);e.type=`button`,e.textContent=t.label,e.addEventListener(`click`,()=>{Ln(!1),Nn(t),F.focus({preventScroll:!0})}),Pt.append(e)}Ft.hidden=!Pt.childElementCount}async function qn(){try{let e=Dt(()=>import(`./player-CJNiXZE0.js`).then(async e=>(await e.preparePlayerPhysics(),e)),__vite__mapDeps([2,1,3]),import.meta.url).catch(e=>({loadError:e}));if(U=new re({antialias:!0,powerPreference:`high-performance`,logarithmicDepthBuffer:!0}),U.outputColorSpace=T,U.toneMapping=6,U.toneMappingExposure=1.04,U.shadowMap.enabled=!0,U.shadowMap.autoUpdate=!1,U.shadowMap.type=1,U.xr.enabled=!0,U.xr.setReferenceSpaceType(`local-floor`),!Q.touch&&Ut&&(sn=ot(U,Wt)),F.tabIndex=0,F.appendChild(U.domElement),new ResizeObserver(Rn).observe(F),Rn(),Bt.hidden=!Ht,Mt.hidden=!document.fullscreenEnabled,V=await Te(),V.manifest.tourBoundary&&(tn=Ee(V.manifest.tourBoundary)),Y.add(V.visuals),rn=tt(Y,X,U,V,Q.touch),on=je(U,Y,V.visuals,Gt&&!Q.touch),Kn(V.manifest,V.manifestURL),V.collision.children.length)try{let t=await e;if(`loadError`in t)throw t.loadError;H=await t.createPlayerController(V.collision,new D().fromArray(V.manifest.spawn.position),{object:new m,updateMotion(){},dispose(){}},V.manifest.collisionFromModels,tn),!V.manifest.collisionFromModels&&V.manifest.landingBoundary&&(nn=ht(V.collision,V.manifest.landingBoundary))}catch(e){console.warn(`校园碰撞载入失败`,e),P(`description`).append(` 本次载入未启用步行。`)}!H&&V.collision.children.length===0&&P(`description`).append(` 当前场景支持飞行。`),H||(B=`fly`),q=!0,Nn(V.manifest.spawn),U.setAnimationLoop(Wn),Hn()}catch(e){console.error(e),P(`loading-mark`).hidden=!0,P(`notice-title`).textContent=`场景未能加载`,P(`notice-detail`).textContent=e instanceof Error?e.message:`请重新加载页面。`,P(`retry`).hidden=!1}}It.addEventListener(`click`,()=>{bn(),F.focus({preventScroll:!0})}),Rt.addEventListener(`click`,()=>{Mn(),F.focus({preventScroll:!0})}),Ft.addEventListener(`click`,()=>Ln()),At.addEventListener(`click`,()=>Gn()),F.addEventListener(`pointerdown`,()=>{Ln(!1),Gn(!1)}),document.addEventListener(`keydown`,e=>{e.key===`Escape`&&(jt.hidden?Pt.hidden||(Ln(!1),Ft.focus()):(Gn(!1),At.focus()))}),Mt.addEventListener(`click`,async()=>{try{document.fullscreenElement?await document.exitFullscreen():await Ot.requestFullscreen()}catch{}}),document.addEventListener(`fullscreenchange`,()=>{Mt.lastChild.textContent=document.fullscreenElement?`退出全屏`:`全屏`}),Nt.addEventListener(`click`,()=>void Un()),P(`retry`).addEventListener(`click`,()=>window.location.reload()),window.addEventListener(`pagehide`,e=>{e.persisted||(H?.dispose(),rn?.dispose(),on?.dispose(),sn?.dispose(),U&&(U.setAnimationLoop(null),U.dispose()))}),qn();