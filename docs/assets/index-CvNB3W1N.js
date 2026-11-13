const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./player-CWFVsZkc.js","./three-runtime-DnJHqhY-.js","./physics-runtime-BR_-CEU_.js"])))=>i.map(i=>d[i]);
import{$ as e,A as t,B as n,C as r,D as i,E as a,F as o,G as s,H as c,I as l,J as u,K as d,L as f,M as p,N as m,O as h,P as g,Q as _,R as v,S as y,T as b,U as x,V as S,W as C,X as w,Y as T,Z as E,_ as D,a as ee,b as O,c as k,d as A,et as j,f as M,g as te,h as ne,i as re,j as ie,k as N,n as ae,o as oe,p as se,q as ce,r as le,s as ue,t as de,u as fe,v as pe,w as me,x as he,y as ge,z as _e}from"./three-runtime-DnJHqhY-.js";(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var ve=new URL(`./scene/scene.json`,window.location.href),ye=e=>Array.isArray(e)&&e.length===3&&e.every(Number.isFinite);function be(e){return e&&ye(e.position)&&(e.yaw===void 0||Number.isFinite(e.yaw))&&(e.pitch===void 0||Number.isFinite(e.pitch)&&Math.abs(e.pitch)<=1.49)}function xe(e){let t=new URL(e,ve);if(t.origin!==ve.origin||!t.pathname.toLowerCase().endsWith(`.glb`))throw Error(`模型必须是项目内的 GLB 文件。`);return t.href}function Se(e,t,n,r=!1){e.updateWorldMatrix(!0,!0);let i=e=>{if(!(e instanceof p))return;let r=n(e);if(!r)return;let i=e.clone(!1);i.geometry=r,i.matrixAutoUpdate=!1,i.matrix.copy(e.matrixWorld),i.visible=!0,t.add(i)};r?e.traverseVisible(i):e.traverse(i)}function Ce(e){for(;e;){let t=e.name.toUpperCase();if(t===`COLLISION`||t.startsWith(`COLLISION_`))return!0;e=e.parent}return!1}function we(e){if(Ce(e))return;let t=e=>e&&!e.name.startsWith(`decal-`),n=e.geometry;if(!Array.isArray(e.material))return t(e.material)?n:void 0;let r=e.material,i=n.groups.filter(e=>t(r[e.materialIndex??0]));if(!i.length)return;if(i.length===n.groups.length)return n;let a=new Uint32Array(i.reduce((e,t)=>e+t.count,0)),o=0;for(let e of i)for(let t=e.start;t<e.start+e.count;t+=1)a[o++]=n.index?n.index.getX(t):t;return new A().setAttribute(`position`,n.getAttribute(`position`)).setIndex(new fe(a,1))}async function Te(){let e=await fetch(ve,{cache:`no-cache`});if(!e.ok||!e.headers.get(`content-type`)?.includes(`json`))throw Error(`还没有找到校园场景文件。`);let t=await e.json();if(typeof t.title!=`string`||!Array.isArray(t.models)||!t.models.length||!be(t.spawn))throw Error(`校园场景缺少名称、模型或有效起点。`);if(t.northYaw!==void 0&&!Number.isFinite(t.northYaw))throw Error(`校园方位设置无效。`);if(t.overview&&(!ye(t.overview.position)||!ye(t.overview.target)))throw Error(`校园总览机位无效。`);if(t.collisionFromModels!==void 0&&typeof t.collisionFromModels!=`boolean`)throw Error(`校园碰撞来源无效。`);if(t.landingBoundary&&(!Array.isArray(t.landingBoundary)||t.landingBoundary.length<3||!t.landingBoundary.every(e=>Array.isArray(e)&&e.length===2&&e.every(Number.isFinite))))throw Error(`校园可落地区域数据无效。`);if(t.tourBoundary!==void 0&&(!Array.isArray(t.tourBoundary)||t.tourBoundary.length<3||!t.tourBoundary.every(e=>Array.isArray(e)&&e.length===2&&e.every(Number.isFinite))))throw Error(`校园游览边界无效。`);for(let e of t.models)if(typeof e?.url!=`string`||e.position!==void 0&&!ye(e.position)||e.rotationY!==void 0&&!Number.isFinite(e.rotationY)||e.surroundings!==void 0&&typeof e.surroundings!=`boolean`||e.scale!==void 0&&(!Number.isFinite(e.scale)||e.scale<=0))throw Error(`校园模型的文件路径或坐标无效。`);if(t.locations&&(!Array.isArray(t.locations)||!t.locations.every(e=>be(e)&&typeof e.id==`string`&&typeof e.label==`string`)))throw Error(`校园地点数据无效。`);let n=new le().setMeshoptDecoder(ae),r=new y,i=new y,a=t.models.filter(e=>!e.surroundings),[o,s]=await Promise.all([Promise.all(a.map(e=>c(e))),!t.collisionFromModels&&t.collisionUrl?n.loadAsync(xe(t.collisionUrl)):void 0]);async function c(e){let t=await n.loadAsync(xe(e.url)),r=new y;return e.position&&r.position.fromArray(e.position),r.rotation.y=e.rotationY??0,r.scale.setScalar(e.scale??1),r.add(t.scene),e.surroundings&&r.traverse(e=>{e.userData.surroundings=!0,e.userData.shadow=!1}),r}for(let e of o)r.add(e);t.collisionFromModels?Se(r,i,we,!0):s?Se(s.scene,i,e=>e.userData.collision===!1?void 0:e.geometry):Se(r,i,e=>Ce(e)?e.geometry:void 0);let l=new k;if(r.updateWorldMatrix(!0,!0),r.traverse(e=>{if(Ce(e)){e.visible=!1;return}if(!(e instanceof p))return;let t=Array.isArray(e.material)?e.material:[e.material];e.castShadow=e.userData.shadow!==!1&&t.some(e=>!e.transparent&&(!e.name.startsWith(`decal-`)||e.alphaTest>0)),e.receiveShadow=e.userData.shadow!==!1,e.geometry.boundingBox||e.geometry.computeBoundingBox(),e.geometry.boundingBox&&l.union(e.geometry.boundingBox.clone().applyMatrix4(e.matrixWorld))}),l.isEmpty())throw Error(`校园模型中没有可见网格。`);let u=l.getSize(new _),d=l.getCenter(new _);async function f(){let e=new y,n=await Promise.all(t.models.filter(e=>e.surroundings).map(c));for(let t of n)e.add(t);return e}return{manifest:t,visuals:r,collision:i,bounds:l,size:u,center:d,manifestURL:ve,loadSurroundings:f}}function Ee(e){let t=e.map(([t,n],r)=>{let[i,a]=e[(r+1)%e.length];return{x:t,z:n,dx:i-t,dz:a-n}}),n=Math.sign(t.reduce((e,t)=>e+t.x*t.dz-t.z*t.dx,0));return(e,r,i,a)=>{let o=i-e,s=a-r,c=Math.hypot(o,s);if(c<1e-8)return 1;let l=1;for(let i of t){let t=o*i.dz-s*i.dx;if(t*n<=1e-9)continue;let a=i.x-e,u=i.z-r,d=(a*s-u*o)/t;if(d<-1e-9||d>1+1e-9)continue;let f=(a*i.dz-u*i.dx)/t;f>=-1e-9&&f<=l&&(l=Math.max(0,f-.001/c))}return l}}var De=-.02,Oe=-24*Math.PI/180,ke=new Set([`plaza`,`walk`,`courtyard-paving`,`plaza-inlay`,`decal-brickline`]),Ae=`
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
`;function je(t,n,a,o){let s=o&&t.extensions.has(`EXT_color_buffer_float`),c=new j(1,1,{type:s?r:T,minFilter:i,generateMipmaps:!0});c.texture.name=`Campus paving reflection`;let u={tCampusMirror:{value:null},uCampusMirrorProjection:{value:new ie},uCampusMirrorActive:{value:0},uCampusGroundLevel:{value:De},uCampusSiteRotation:{value:new E(Math.cos(Oe),Math.sin(Oe))}},d=new Set;a.traverse(e=>{if(!(e instanceof p))return;let t=Array.isArray(e.material)?e.material:[e.material];for(let e of t){if(!(e instanceof m)||d.has(e)||!ke.has(e.name))continue;d.add(e);let t=e.onBeforeCompile.bind(e),n=e.customProgramCacheKey();e.customProgramCacheKey=()=>`${n}|campus-ground-v1`,e.onBeforeCompile=(e,n)=>{t(e,n),Object.assign(e.uniforms,u),e.vertexShader=e.vertexShader.replace(`#include <common>`,`#include <common>
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
          `)},e.needsUpdate=!0}});let h=new l,g=new _,v=new _,y=new _(1/0,1/0,1/0),b=new _,x=new E,S=new E,C=new f,w=new e,D=new e,ee=new ie().set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),O=-1/0,k=!0,A=0;function M(){u.uCampusMirrorActive.value=0,k=!0}return s&&t.domElement.addEventListener(`webglcontextrestored`,M),{get active(){return u.uCampusMirrorActive.value!==0},get passes(){return A},update(e,r,i){e.getWorldPosition(g),e.getWorldDirection(v);let a=u.uCampusSiteRotation.value.x,o=u.uCampusSiteRotation.value.y;if(S.set(a*g.x+o*g.z,-o*g.x+a*g.z),!s||!i||t.xr.isPresenting||v.y>.58||g.y<.35||g.y>4.2||S.x<-20||S.x>48||S.y<-32||S.y>78){M();return}if(t.shadowMap.needsUpdate){k=!0;return}t.getDrawingBufferSize(x);let l=Math.min(.43,576/Math.max(x.x,x.y)),d=Math.max(16,Math.round(x.x*l)),f=Math.max(16,Math.round(x.y*l)),p=c.width!==d||c.height!==f,m=y.distanceToSquared(g)>.022**2||b.dot(v)<.999993;if(!p&&(!k&&!m||r-O<38))return;p&&c.setSize(d,f),h.position.copy(g),h.position.y=2*De-g.y,h.up.setFromMatrixColumn(e.matrixWorld,1),h.up.y*=-1,v.y*=-1,h.lookAt(v.add(h.position)),h.updateMatrixWorld(!0),h.near=e.near,h.far=e.far,h.projectionMatrix.copy(e.projectionMatrix);let _=h.projectionMatrix.elements;C.normal.set(0,1,0),C.constant=.024,C.applyMatrix4(h.matrixWorldInverse),w.set(C.normal.x,C.normal.y,C.normal.z,C.constant),D.set((Math.sign(w.x)+_[8])/_[0],(Math.sign(w.y)+_[9])/_[5],-1,(1+_[10])/_[14]);let T=w.dot(D);if(Math.abs(T)<1e-5){u.uCampusMirrorActive.value=0;return}u.uCampusMirrorProjection.value.copy(ee).multiply(h.projectionMatrix).multiply(h.matrixWorldInverse),w.multiplyScalar(2/T),_[2]=w.x,_[6]=w.y,_[10]=w.z+1,_[14]=w.w,h.projectionMatrixInverse.copy(h.projectionMatrix).invert();let E=t.getRenderTarget(),j=t.xr.enabled;u.uCampusMirrorActive.value=0,u.tCampusMirror.value=null;try{t.xr.enabled=!1,t.setRenderTarget(c),t.state.buffers.depth.setMask(!0),t.render(n,h)}finally{t.setRenderTarget(E),t.xr.enabled=j}u.tCampusMirror.value=c.texture,u.uCampusMirrorActive.value=1,y.copy(g),e.getWorldDirection(b),O=r,k=!1,A+=1},dispose(){s&&t.domElement.removeEventListener(`webglcontextrestored`,M),c.dispose()}}}var Me=`
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
`;function Pe(e,t){let n=new URLSearchParams(window.location.search);if(n.has(`debug`)&&n.get(`bake`)===`0`)return;let r=new URL(t,e).searchParams.get(`v`);if(!r||!/^[\da-f]{12}$/.test(r))return;let i={tCampusBake:{value:null},uCampusBakeOrigin:{value:new _},uCampusBakeStep:{value:new _(1,1,1)},uCampusBakeSize:{value:new _(1,1,1)},uCampusBakeRotation:{value:new E(1,0)},uCampusBakeActive:{value:0}},o=new URL(`campus-baked-light.bin`,e);o.searchParams.set(`v`,r);let s=new AbortController,c=!1;function l(){c||s.signal.aborted||(c=!0,fetch(o,{signal:s.signal}).then(async e=>{if(!e.ok)return;let t=await e.arrayBuffer();if(t.byteLength<64||s.signal.aborted)return;let n=new TextDecoder;if(n.decode(new Uint8Array(t,0,4))!==`HCB1`||n.decode(new Uint8Array(t,48,12))!==r)return;let o=new DataView(t),c=o.getUint32(4,!0),l=o.getUint32(8,!0),u=o.getUint32(12,!0),d=[28,32,36].map(e=>o.getFloat32(e,!0));if(c<2||l<2||u<2||c*l*u*4!=t.byteLength-64||d.some(e=>!(e>0)||!Number.isFinite(e)))return;let f=new ne(new Uint8Array(t,64),c,l,u);f.minFilter=a,f.magFilter=a,f.needsUpdate=!0,i.tCampusBake.value=f,i.uCampusBakeOrigin.value.set(o.getFloat32(16,!0),o.getFloat32(20,!0),o.getFloat32(24,!0)),i.uCampusBakeStep.value.set(d[0],d[1],d[2]),i.uCampusBakeSize.value.set(c,l,u),i.uCampusBakeRotation.value.set(o.getFloat32(40,!0),o.getFloat32(44,!0)),i.uCampusBakeActive.value=1}).catch(()=>{}))}return{start:l,skyVisibilityAt(e){let t=i.tCampusBake.value;if(!t)return 1;let{width:n,height:r,depth:a}=t.image,o=t.image.data,{x:s,y:c}=i.uCampusBakeRotation.value,l=i.uCampusBakeOrigin.value,u=i.uCampusBakeStep.value,d=(e.x*s+e.z*c-l.x)/u.x,f=(-e.x*c+e.z*s-l.y)/u.y,p=(e.y-l.z)/u.z,m=N.smoothstep(Math.min(d,n-1-d,f,r-1-f),0,3),h=N.smoothstep(p,-1.5,-.1)*N.smoothstep(a-1-p,0,2);if(m===0||h===0)return 1;let g=Math.floor(d),_=Math.floor(f),v=Math.max(0,p),y=Math.floor(v),b=4*n,x=b*r,S=g*4+_*b+y*x,C=N.lerp(N.lerp(o[S],o[S+4],d-g),N.lerp(o[S+b],o[S+b+4],d-g),f-_),w=S+x,T=N.lerp(N.lerp(o[w],o[w+4],d-g),N.lerp(o[w+b],o[w+b+4],d-g),f-_),E=N.lerp(C,T,v-y)/255;return N.lerp(1,E,m*h)},register(e){if(e.transparent||e.name.startsWith(`decal-`))return;let t=e.onBeforeCompile,n=e.customProgramCacheKey();e.onBeforeCompile=(n,r)=>{t.call(e,n,r),Object.assign(n.uniforms,i),n.vertexShader=n.vertexShader.replace(`#include <common>`,`#include <common>
varying vec3 vCampusBakeWorld;`).replace(`#include <project_vertex>`,`
            #include <project_vertex>
            vCampusBakeWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;
          `),n.fragmentShader=n.fragmentShader.replace(`#include <common>`,`#include <common>\n${Me}`).replace(`#include <lights_fragment_end>`,`${Ne}\n#include <lights_fragment_end>`)},e.customProgramCacheKey=()=>`${n}|campus-bake-v1`},dispose(){s.abort(),i.uCampusBakeActive.value=0,i.tCampusBake.value?.dispose(),i.tCampusBake.value=null}}}var Fe=`scene/campus-photo-sky.hdr?v=44f8af5b5dda`;async function Ie(){let e=new URL(`./${Fe}`,window.location.href),t=await new de().loadAsync(e.href);return t.mapping=303,t.wrapS=x,t.needsUpdate=!0,{material:new d({uniforms:{uSky:{value:t},uHorizon:{value:new M(`#bed0d9`)}},vertexShader:`
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
      }`,side:1,depthTest:!1,depthWrite:!1,toneMapped:!1}),texture:t}}var Le=new Map([[`plaza`,[`pavers`,.31,.26,.0022]],[`walk`,[`pavers`,.3,.22,.0022]],[`street-paving`,[`stone`,.26,.12,.0024]],[`street-curb`,[`stone`,.32,.07,.002]],[`street-verge`,[`scanned`,.29,.02,.0018]],[`street-soil`,[`scanned`,.33,.03,.0028]],[`plaza-inlay`,[`stone`,.23,.13,.0015]],[`courtyard-paving`,[`pavers`,.33,.24,.0022]],[`teaching-floor`,[`pavers`,.16,.38,8e-4]],[`beige`,[`masonry`,.23,.06,.0012]],[`terra`,[`masonry`,.29,.08,.0014]],[`road`,[`scanned`,.35,.14,.0034]],[`teaching-wall`,[`scanned`,.1,.02,5e-4]],[`teaching-ceiling`,[`scanned`,.075,.02,5e-4]],[`soffit`,[`scanned`,.2,.04,.0012]],[`cream`,[`scanned`,.17,.05,9e-4]],[`reveal`,[`scanned`,.19,.04,8e-4]],[`entry-stone`,[`stone`,.22,.27,.0016]],[`entry-nosing`,[`stone`,.19,.2,.0012]],[`entry-traction`,[`stone`,.23,.12,.0022]],[`stair-stone`,[`stone`,.13,.27,.0011]],[`gallery-base-stone`,[`stone`,.17,.15,.001]],[`curb`,[`stone`,.27,.09,.0026]],[`plinth`,[`stone`,.3,.1,.0018]],[`apron`,[`stone`,.34,.06,.0024]],[`decal-brickline`,[`stone`,.27,.19,.0015]],[`decal-paint-yellow`,[`paint`,.25,.12,0]],[`decal-paint-white`,[`paint`,.21,.1,0]],[`decal-sports_paint`,[`paint`,.14,.09,0]]]),Re=new Set([`road`,`street-paving`,`street-curb`,`walk`,`plaza-inlay`]),ze=`
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
      `))},e.customProgramCacheKey=()=>`${c}|campus-surface-v2:${n}:${o}`}var Ke=new _(-.69,.55,.47).normalize(),qe=new M(`#bed0d9`),Je=new M(`#568bc6`),Ye=new Set([`ground`,`plaza`,`walk`,`courtyard-paving`,`road`,`planter`,`plaza-inlay`,`street-paving`,`street-curb`,`street-verge`,`street-soil`,`teaching-floor`]);function Xe(e){let t=new d({uniforms:{uZenith:{value:Je},uHorizon:{value:qe},uCloud:{value:new M(`#f3f5ef`)},uSun:{value:Ke}},vertexShader:`
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
      }`,side:1,depthTest:!1,depthWrite:!1,toneMapped:!1}),n=new p(new ce(e,32,16),t);return n.renderOrder=-1e3,n.frustumCulled=!1,n}function Ze(){let e=new Uint16Array(73728),t=new M(`#69725e`),n=new M(`#fff0d7`),i=D.toHalfFloat,o=new M;for(let r=0;r<96;r+=1){let a=((r+.5)/96-.5)*Math.PI,s=Math.sin(a),c=Math.cos(a);for(let l=0;l<192;l+=1){let u=((l+.5)/192-.5)*Math.PI*2,d=Math.max(0,c*(Math.cos(u)*Ke.x+Math.sin(u)*Ke.z)+s*Ke.y);o.copy(qe),s>=0?o.lerp(Je,N.smoothstep(s,0,.92)):o.lerp(t,N.smoothstep(-s,0,.38));let f=N.smoothstep(Math.sin(u*3+a*13.1)*.62+Math.cos(u*7-a*25.1)*.25+Math.sin(u*11+a*37)*.13,.27,.86)*N.smoothstep(s,.06,.43);o.lerp(n,f*.37).multiplyScalar(.75+Math.max(0,s)*.53);let p=.53*d**21+2.6*d**225;o.r+=n.r*p,o.g+=n.g*p,o.b+=n.b*p;let m=(r*192+l)*4;e.set([i(o.r),i(o.g),i(o.b),i(1)],m)}}let s=new te(e,192,96,S,r);return s.mapping=303,s.colorSpace=h,s.minFilter=a,s.magFilter=a,s.needsUpdate=!0,s}var Qe=`
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
`;function $e(e,t,n,a,o,c,l,u){let d=t.manifest.locations?.find(e=>e.id===`gate`),f=t.manifest.locations?.find(e=>e.id===`courtyard`);if(!d||!f||!e.extensions.has(`EXT_color_buffer_float`))return;let h=new _().fromArray(f.position).add(new _(0,5.2,0)),g=new _().fromArray(d.position).lerp(h,.41);g.y=d.position[1]+5.1;let v=[g,h],y=v.map(()=>new ee(128,{type:r,generateMipmaps:!0,minFilter:i})),b=new E,x=new E,S={uCampusEntryProbe:{value:y[0].texture},uCampusCourtProbe:{value:y[1].texture},uCampusEntryProbeCenter:{value:g},uCampusCourtProbeCenter:{value:h},uCampusProbeActive:{value:b}};function C(e,t,n){let r=e.onBeforeCompile,i=e.customProgramCacheKey(),a={value:t?.88:.65};e.onBeforeCompile=(t,i)=>{r.call(e,t,i),Object.assign(t.uniforms,S,{uCampusProbeStrength:a}),t.vertexShader=t.vertexShader.replace(`#include <common>`,`#include <common>
varying vec3 vCampusProbePosition;`).replace(`#include <project_vertex>`,`
          #include <project_vertex>
          vCampusProbePosition = (modelMatrix * vec4(transformed, 1.0)).xyz;
        `);let o=re.envmap_physical_pars_fragment.replace(`return envMapColor.rgb * envMapIntensity;`,`return campusProbeSample(reflectVec, roughness, envMapColor.rgb) * envMapIntensity;`);t.fragmentShader=t.fragmentShader.replace(`#include <common>`,`#include <common>\n${Qe}`).replace(`#include <envmap_physical_pars_fragment>`,o),n&&(t.fragmentShader=t.fragmentShader.replace(`#include <opaque_fragment>`,`
        float faceOn = clamp(dot(normalize(vViewPosition), normal), 0.0, 1.0);
        diffuseColor.a *= mix(0.67, 1.43, pow(1.0 - faceOn, 4.0));
        #include <opaque_fragment>
      `))},e.customProgramCacheKey=()=>`${i}|campus-probe-${n?`clear`:`opaque`}`}function w(){let r=new s;r.background=n.background,r.fog=n.fog;let i=t.visuals.clone(!0),d=new Map;i.traverse(e=>{if(!(e instanceof p))return;let t=e=>{let t=d.get(e);return t||(t=e.clone(),t.visible=e.visible&&!e.transparent,t instanceof m&&(t.envMap=null),d.set(e,t)),t};e.material=Array.isArray(e.material)?e.material.map(t):t(e.material)});let f=a.clone(),h=u.clone();h.shadow.mapSize.set(512,512),h.shadow.bias=-2e-4,h.shadow.normalBias=.04,Object.assign(h.shadow.camera,{left:-48,right:48,top:48,bottom:-48,near:55,far:185}),h.shadow.camera.updateProjectionMatrix(),r.add(i,f,o.clone(),c.clone(),l.clone(),h,h.target);let g=new se(.2,840,y[0]);return g.coordinateSystem=e.coordinateSystem,g.updateCoordinateSystem(),{prepare(){let t=e.getRenderTarget(),n=e.getActiveCubeFace(),i=e.getActiveMipmapLevel();try{return e.setRenderTarget(y[0]),e.compileAsync(r,g.children[0])}finally{e.setRenderTarget(t,n,i)}},renderFace(t,n){let i=y[t];if(n===0){let e=v[t];f.position.copy(e),h.target.position.copy(e),h.position.copy(e).addScaledVector(Ke,120),g.position.copy(e),g.updateMatrixWorld(!0)}let a=n===g.children.length-1,o=e.getRenderTarget(),s=e.getActiveCubeFace(),c=e.getActiveMipmapLevel(),l=e.xr.enabled,u=e.shadowMap.autoUpdate,d=e.shadowMap.needsUpdate;try{e.xr.enabled=!1,e.shadowMap.autoUpdate=!1,e.shadowMap.needsUpdate=n===0,i.texture.generateMipmaps=a,e.setRenderTarget(i,n),e.state.buffers.depth.setMask(!0),e.render(r,g.children[n]),a&&x.setComponent(t,1)}finally{e.setRenderTarget(o,s,c),e.xr.enabled=l,e.shadowMap.autoUpdate=u,e.shadowMap.needsUpdate=d}return a},dispose(){h.shadow.dispose();for(let e of d.values())e.dispose()}}}let T,D=0,O=0,k=0,A=!1,j;function M(){j?.(),j=void 0,T?.dispose(),T=void 0,k=0,A=!1,D=0,O=0,b.set(0,0),x.set(0,0)}e.domElement.addEventListener(`webglcontextrestored`,M);function te(t){if(b.copy(x).multiplyScalar(+!e.xr.isPresenting),O>=y.length||j||A||!t||e.xr.isPresenting)return;let n=performance.now();if(k===0&&(k=n+1050),n<k)return;let r=()=>{if(j=void 0,!(document.hidden||e.xr.isPresenting||e.getContext().isContextLost())){try{if(!T&&(T=w(),e.extensions.has(`KHR_parallel_shader_compile`))){let e=T;A=!0,e.prepare().catch(e=>console.warn(`校园反射材质预编译未完成`,e)).finally(()=>{T===e&&(A=!1)});return}T.renderFace(O,D++)&&(D=0,O+=1)}catch(e){A=!1,console.warn(`校园局部反射未能生成`,e),D=0,O+=1}k=performance.now()+45,O>=y.length&&(T?.dispose(),T=void 0)}};if(typeof window.requestIdleCallback==`function`){let e=window.requestIdleCallback(r,{timeout:250});j=()=>window.cancelIdleCallback(e)}else{let e=window.setTimeout(r,0);j=()=>window.clearTimeout(e)}}return{register:C,update:te,dispose(){j?.(),T?.dispose(),e.domElement.removeEventListener(`webglcontextrestored`,M);for(let e of y)e.dispose()}}}function et(e,t){let n=e.geometry,r=n.getAttribute(`position`);if(!r)return;let i=new _,a=[],o=new Map,s=[],c=[],l=[],u=e=>{for(;c[e]!==e;)c[e]=c[c[e]],e=c[e];return e};for(let t=0;t<r.count;t+=1){i.fromBufferAttribute(r,t).applyMatrix4(e.matrixWorld);let n=`${Math.round(i.x*500)},${Math.round(i.y*500)},${Math.round(i.z*500)}`,a=o.get(n);a===void 0&&(a=l.length,o.set(n,a),l.push(i.clone()),c.push(a)),s[t]=a}let d=n.index,f=d?.count??r.count;for(let e=0;e+2<f;e+=3){let t=u(s[d?.getX(e)??e]),n=u(s[d?.getX(e+1)??e+1]),r=u(s[d?.getX(e+2)??e+2]);c[n]=t,c[r]=t}for(let[e,t]of l.entries()){let n=u(e);(a[n]??=new k).expandByPoint(t)}for(let e of a){if(!e||e.getSize(i).lengthSq()<.14**2)continue;let n=e.getCenter(new _);n.y=e.min.y-.045,t.push(n)}}function tt(e,t,n,r,i){let a=Math.max(r.size.x,r.size.z,30);e.fog=new he(qe,a*.46,a*2.75),t.far=Math.max(600,a*8),t.updateProjectionMatrix();let o=Xe(t.far*.8),s=Math.max(3e3,a*16),c=new p(new v(s,s),new m({color:`#7f8f68`,roughness:1}));c.rotation.x=-Math.PI/2,c.position.set(r.center.x,r.bounds.min.y-.36,r.center.z);let l=new me(`#dbeaff`,`#c7beaa`,.95),u=new ue(`#eae6dc`,.14),d=new ge(`#fff0d7`,3.71),f=Ke.clone().multiplyScalar(a*1.3);d.castShadow=!0;let h=i?1024:2048;d.shadow.mapSize.set(h,h),d.shadow.intensity=.94,d.shadow.radius=2;let g=Ze(),y=[],b=[new _e(`#fff0d8`,0,5.2,2),new _e(`#fff0d8`,0,5.2,2)];e.add(o,c,l,u,d,d.target,...b);let x=new URLSearchParams(window.location.search),S=x.has(`debug`),C=!S||x.get(`camera`)!==`0`,w=n.toneMappingExposure,T=S&&x.get(`photoSky`)===`0`,E=!1,D=!1,ee,O=Pe(r.manifestURL,r.manifest.models[0].url),k=!i&&!(S&&x.get(`probe`)===`0`)?$e(n,r,e,o,c,l,u,d):void 0;r.manifest.collisionFromModels&&r.collision.add(c.clone()),r.visuals.updateMatrixWorld(!0);let A=new Set,j=Math.min(n.capabilities.getMaxAnisotropy(),i?4:8);r.visuals.traverse(e=>{if(!(e instanceof p))return;let t=Array.isArray(e.material)?e.material:[e.material];t.every(e=>e.name===`glass-clear`)&&(e.castShadow=!1),t.every(e=>e.name===`teaching-lamp`)&&et(e,y);for(let n of t)if(n instanceof m&&!A.has(n)){if(A.add(n),Ge(n),Ye.has(n.name))for(let e of[n.map,n.normalMap,n.roughnessMap])e&&e.anisotropy<j&&(e.anisotropy=j,e.needsUpdate=!0);n.name===`teaching-lamp`?(n.emissive.set(`#fff1db`),n.emissiveIntensity=1.05):n.name.startsWith(`glass-`)?(n.envMap=g,n.envMapIntensity=n.name===`glass-clear`?1.42:1.02,n.roughness=Math.min(n.roughness,.25),n.name!==`glass-clear`&&(n.metalness=Math.max(n.metalness,.11)),k?.register(n,!0,n.name===`glass-clear`)):[`teaching-metal`,`frame`,`blue-rail`,`blue-cap`,`stand_steel`,`entry-aluminum`,`stainless`,`entry-drain-frame`,`entry-drain-grate`].includes(n.name)?(n.envMap=g,n.envMapIntensity=.48,n.metalness=Math.max(n.metalness,.27),k?.register(n,!1,!1)):n.name===`teaching-floor`&&(n.envMap=g,n.envMapIntensity=.22),e.userData.surroundings||O?.register(n)}});let M=new _,te=0;function ne(){E=!0,O?.start(),T||Ie().then(({material:e,texture:t})=>{if(D)e.dispose(),t.dispose();else{o.material.dispose(),o.material=e,ee=t;for(let e of A)e instanceof m&&e.envMap===g&&(e.envMap=t)}}).catch(()=>{}).finally(()=>{T=!0})}function re(e){let t,n,r=5.4**2,i=5.4**2;if(e)for(let a of y){let o=a.y-e.y;if(o<1.92||o>3.95)continue;let s=(a.x-e.x)**2+(a.z-e.z)**2;s<r?(n=t,i=r,t=a,r=s):s<i&&(n=a,i=s)}for(let[e,a]of b.entries()){let o=e?n:t,s=e?i:r;o&&a.position.copy(o),a.intensity=o?4.9*(1-N.smoothstep(s,9,5.4**2)):0}}function ie(e,i,a,s){if(t.getWorldPosition(o.position),a&&!E&&ne(),k?.update(a&&T),C){let t=e===`walk`?O?.skyVisibilityAt(o.position)??1:1,r=w+.24*(1-N.smoothstep(t,.04,.65));n.toneMappingExposure=N.damp(n.toneMappingExposure,r,3,s)}re(e===`walk`?i:void 0);let c=i&&(e===`walk`||e===`fly`&&i.y<r.bounds.max.y+14),l=c?e===`walk`?25:38:Math.max(r.size.length()*.56,25);if(c?M.set(Math.round(i.x/8)*8,Math.round(i.y/8)*8,Math.round(i.z/8)*8):M.copy(r.center),te!==l||!d.target.position.equals(M)){if(d.target.position.copy(M),d.position.copy(M).add(f),te!==l){te=l;let e=f.length(),t=l*2.4;Object.assign(d.shadow.camera,{left:-l,right:l,top:l,bottom:-l,near:Math.max(.1,e-t),far:e+t}),d.shadow.camera.updateProjectionMatrix(),d.shadow.bias=c?-16e-5:-11e-5,d.shadow.normalBias=c?.018:.074}n.shadowMap.needsUpdate=!0}}return{update:ie,dispose(){D=!0;for(let e of[o,c])e.removeFromParent(),e.geometry.dispose(),e.material.dispose();k?.dispose(),O?.dispose(),ee?.dispose(),g.dispose(),d.shadow.dispose(),l.removeFromParent(),u.removeFromParent(),d.removeFromParent(),d.target.removeFromParent();for(let e of b)e.removeFromParent()}}}var nt=`
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
`;function ot(e,t){if(!e.extensions.has(`EXT_color_buffer_float`))return;let n=new j(1,1,{type:r,depthTexture:new pe(1,1,w)}),i=new j(1,1,{depthBuffer:!1,minFilter:g,magFilter:g}),a={tDepth:{value:n.depthTexture},uProjection:{value:new E},uTexel:{value:new E},uLogFar:{value:0}},c=new d({uniforms:a,vertexShader:nt,fragmentShader:it,depthTest:!1,depthWrite:!1,toneMapped:!1}),l=new d({uniforms:{...a,tColor:{value:n.texture},tOcclusion:{value:i.texture},uOcclusionSize:{value:new E},uCameraResponse:{value:+!!t}},vertexShader:nt,fragmentShader:at,depthTest:!1,depthWrite:!1}),u=new s,f=new o,m=new p(new v(2,2),c);m.frustumCulled=!1,u.add(m);let h=new E;return{render(t,r){e.getDrawingBufferSize(h);let o=Math.min(1,Math.sqrt(35e5/(h.x*h.y))),s=Math.max(1,Math.floor(h.x*o)),d=Math.max(1,Math.floor(h.y*o));if(n.width!==s||n.height!==d){let e=Math.max(1,Math.floor(s*.5)),t=Math.max(1,Math.floor(d*.5));n.setSize(s,d),i.setSize(e,t),a.uTexel.value.set(1/s,1/d),l.uniforms.uOcclusionSize.value.set(e,t)}a.uProjection.value.set(r.projectionMatrix.elements[0],r.projectionMatrix.elements[5]),a.uLogFar.value=Math.log2(r.far+1);let p=e.info.autoReset;e.info.reset(),e.info.autoReset=!1;try{e.setRenderTarget(n),e.render(t,r),e.setRenderTarget(i),m.material=c,e.render(u,f),e.setRenderTarget(null),m.material=l,e.render(u,f)}finally{e.setRenderTarget(null),e.info.autoReset=p}},dispose(){n.dispose(),i.dispose(),m.geometry.dispose(),c.dispose(),l.dispose()}}}var st=/^traffic-lens-(aviation|xuezi)-(red|yellow|green)$/,ct={red:16335157,yellow:16759343,green:3789946},lt=[{untilMs:12e3,aviation:`red`,xuezi:`green`},{untilMs:15e3,aviation:`red`,xuezi:`yellow`},{untilMs:16500,aviation:`red`,xuezi:`red`},{untilMs:36500,aviation:`green`,xuezi:`red`},{untilMs:39500,aviation:`yellow`,xuezi:`red`},{untilMs:41e3,aviation:`red`,xuezi:`red`}];function ut(e){let t=new Map;if(e.traverse(e=>{if(!(e instanceof p))return;let n=Array.isArray(e.material)?e.material:[e.material];for(let e of n){if(!(e instanceof m))continue;let n=st.exec(e.name);n&&t.set(e,{road:n[1],lamp:n[2]})}}),!t.size)return;let n,r,i=lt[lt.length-1].untilMs;return e=>{n??=e;let a=(e-n)%i,o=lt.find(({untilMs:e})=>a<e);if(o&&o!==r){r=o;for(let[e,{road:n,lamp:r}]of t)e.emissive.setHex(o[n]===r?ct[r]:0)}}}var dt=new Set([`KeyW`,`KeyA`,`KeyS`,`KeyD`,`ArrowUp`,`ArrowDown`,`ShiftLeft`,`ShiftRight`,`Space`,`KeyE`,`KeyQ`,`ControlLeft`,`ControlRight`]);function ft(e){let{surface:t,movePad:n,thumb:r,lever:i,leverThumb:a}=e,o=new Set,s=matchMedia(`(pointer: coarse)`),c=s.matches,l=new Map,u=null,d=0,f=null,p=0,m=0,h=0,g=null;function _(){f=null,p=0,m=0,r.style.transform=``}function v(){g=null,h=0,a.style.transform=``}function y(){o.clear(),u=null,l.clear(),d=0,v(),_()}function b(){if(l.size!==2)return 0;let[e,t]=l.values();return Math.max(8,Math.hypot(e.x-t.x,e.y-t.y))}function x(t){t!==c&&(c=t,e.onDeviceChange())}function S(e){let t=n.getBoundingClientRect(),i=t.width*.31,a=(e.clientX-t.left-t.width/2)/i,o=(e.clientY-t.top-t.height/2)/i,s=Math.hypot(a,o),c=Math.max(1,s);p=s>.08?a/c:0,m=s>.08?-o/c:0,r.style.transform=`translate(${p*i}px, ${-m*i}px)`}s.addEventListener(`change`,e=>x(e.matches)),window.addEventListener(`pointerdown`,e=>{e.pointerType===`touch`?x(!0):e.pointerType===`mouse`&&!s.matches&&x(!1)}),t.addEventListener(`pointerdown`,e=>{if(e.button!==0)return;let n={x:e.clientX,y:e.clientY};if(e.pointerType===`touch`)u=l.size===0?{id:e.pointerId,...n}:null,l.set(e.pointerId,n),d=b();else{if(u||l.size>0)return;u={id:e.pointerId,...n}}t.setPointerCapture(e.pointerId)}),t.addEventListener(`pointermove`,t=>{let n=l.get(t.pointerId);if(n){n.x=t.clientX,n.y=t.clientY;let r=b();r&&d&&e.zoom(r/d),d=r}t.pointerId===u?.id&&(e.look(t.clientX-u.x,t.clientY-u.y),u.x=t.clientX,u.y=t.clientY)});for(let e of[`pointerup`,`pointercancel`,`lostpointercapture`])t.addEventListener(e,e=>{if(l.delete(e.pointerId)){d=b();let[e]=l.entries();u=l.size===1?{id:e[0],...e[1]}:null}else e.pointerId===u?.id&&(u=null)}),n.addEventListener(e,e=>{e.pointerId===f&&_()});t.addEventListener(`wheel`,n=>{if(!n.deltaY)return;n.preventDefault();let r=n.deltaMode===WheelEvent.DOM_DELTA_LINE?16:n.deltaMode===WheelEvent.DOM_DELTA_PAGE?t.clientHeight:1,i=Math.max(-160,Math.min(160,n.deltaY*r));e.zoom(Math.exp(-i*.002))},{passive:!1}),n.addEventListener(`pointerdown`,e=>{f===null&&e.button===0&&(e.preventDefault(),f=e.pointerId,n.setPointerCapture(e.pointerId),S(e))}),n.addEventListener(`pointermove`,e=>{e.pointerId===f&&S(e)});function C(e){let t=i.getBoundingClientRect(),n=t.height*.32,r=Math.max(-1,Math.min(1,(t.top+t.height/2-e.clientY)/n));h=Math.abs(r)>.12?r:0,a.style.transform=`translateY(${-r*n}px)`}i.addEventListener(`pointerdown`,e=>{g===null&&e.button===0&&(e.preventDefault(),g=e.pointerId,C(e),i.setPointerCapture(e.pointerId))}),i.addEventListener(`pointermove`,e=>{e.pointerId===g&&C(e)});for(let e of[`pointerup`,`pointercancel`,`lostpointercapture`])i.addEventListener(e,e=>{e.pointerId===g&&v()});window.addEventListener(`keydown`,t=>{t.target instanceof HTMLElement&&t.target.closest(`input, select, textarea, button, a, [contenteditable]`)||(t.ctrlKey||t.metaKey||t.altKey)&&t.code!==`ControlLeft`&&t.code!==`ControlRight`||(t.code===`ArrowLeft`||t.code===`ArrowRight`?(t.preventDefault(),t.repeat||e.turn(t.code===`ArrowLeft`?-1:1)):(dt.has(t.code)&&(t.preventDefault(),o.add(t.code)),t.repeat||(t.code===`KeyF`&&e.toggleFlight(),t.code===`KeyR`&&e.reset())))}),window.addEventListener(`keyup`,e=>o.delete(e.code)),window.addEventListener(`blur`,y),document.addEventListener(`visibilitychange`,()=>{document.hidden&&y()});let w=(...e)=>e.some(e=>o.has(e));return{get touch(){return c},get side(){return Number(w(`KeyD`))-Number(w(`KeyA`))+p},get ahead(){return Number(w(`KeyW`,`ArrowUp`))-Number(w(`KeyS`,`ArrowDown`))+m},get lift(){return Number(w(`Space`,`KeyE`))-Number(w(`ControlLeft`,`ControlRight`,`KeyQ`))+h},get takeoff(){return h>0||w(`KeyE`)},get running(){return w(`ShiftLeft`,`ShiftRight`)},get jumping(){return w(`Space`)},releaseAll:y}}var pt=new _(0,-1,0),mt=.27,ht=1.8,gt=[-.27,0,mt];function _t(e,t,n){let r=!1;for(let i=0,a=e.length-1;i<e.length;a=i++){let[o,s]=e[i],[c,l]=e[a];s>n!=l>n&&t<(c-o)*(n-s)/(l-s)+o&&(r=!r)}return r}function vt(e){let t=[],n=new ie;return e.traverse(e=>{if(!(e instanceof p))return;let r=e.geometry,i=r.getAttribute(`position`);if(!i)return;let a=r.index,o=a?.count??i.count,s=e instanceof b?e.count:1,c=e=>new _().fromBufferAttribute(i,a?.getX(e)??e).applyMatrix4(n);for(let r=0;r<s;r++){e instanceof b?(e.getMatrixAt(r,n),n.premultiply(e.matrixWorld)):n.copy(e.matrixWorld);for(let e=0;e+2<o;e+=3){let n=new u(c(e),c(e+1),c(e+2));t.push({triangle:n,bounds:new k().setFromPoints([n.a,n.b,n.c])})}}}),t}function yt(e,n){e.updateWorldMatrix(!0,!0);let r=new k().setFromObject(e),i=vt(e),a=new c,o=new _,s=new _,l=new ie,u=new t,d=new k;function f(e){return!e.face||!(e.object instanceof p)||(Array.isArray(e.object.material)?e.object.material[e.face.materialIndex]:e.object.material)?.name!==`walkable`?!1:(e.object instanceof b&&e.instanceId!==void 0?(e.object.getMatrixAt(e.instanceId,l),l.premultiply(e.object.matrixWorld)):l.copy(e.object.matrixWorld),s.copy(e.face.normal).applyNormalMatrix(u.getNormalMatrix(l)).normalize(),s.y>=.707)}function m(t,i){if(!_t(n,t,i))return;a.set(o.set(t,r.max.y+1,i),pt);let s=a.intersectObject(e,!0)[0];return s&&f(s)?s.point.y:void 0}return e=>{let{x:t,y:n,z:r}=e;if(![t,n,r].every(Number.isFinite))return;let a=m(t,r);if(!(a===void 0||n<a+.3)){for(let e of gt)for(let n of gt){if(e===0&&n===0)continue;let i=m(t+e,r+n);if(i===void 0||Math.abs(i-a)>.18)return}if(d.min.set(t-mt,a+.05,r-mt),d.max.set(t+mt,a+ht,r+mt),!i.some(({bounds:e,triangle:t})=>e.intersectsBox(d)&&d.intersectsTriangle(t)))return new _(t,a+.035,r)}}}var bt=new _(0,1,0),xt=.18;function St(e,t){t.set(0,0);for(let n of e){let e=n.gamepad;if(!e||e.axes.length<2)continue;let r=e.mapping===`xr-standard`&&e.axes.length>=4?2:0,i=e.axes[r],a=e.axes[r+1];if(!(!Number.isFinite(i)||!Number.isFinite(a)||Math.hypot(i,a)<xt)){if(n.handedness===`left`)return t.set(i,a);t.lengthSq()===0&&t.set(i,a)}}return t}function Ct(){let e=new n,t=new _,r=new _,i=new E;return(n,a,o,s)=>{let{x:c,y:l,z:u,w:d}=n;return e.set(c,l,u,d),t.set(0,0,-1).applyQuaternion(e).applyAxisAngle(bt,a),t.y=0,t.lengthSq()<1e-4&&t.set(-Math.sin(a),0,-Math.cos(a)),t.normalize(),r.crossVectors(t,bt),St(o,i),s.copy(r).multiplyScalar(i.x).addScaledVector(t,-i.y).clampLength(0,1)}}var wt=1.64;function Tt(e){let t=new O(0,0,0,`YXZ`);return(n,r,i)=>{e.position.copy(n),e.position.y+=wt,e.quaternion.setFromEuler(t.set(i,r,0))}}var Et=`modulepreload`,Dt=function(e,t){return new URL(e,t).href},Ot={},kt=function(e){return e.pathname.endsWith(`.css`)},At=function(e,t,n){if(t in e)return e[t];let r=n();if(!r){e[t]=void 0;return}let i=r.then(()=>{e[t]=void 0},n=>{throw e[t]=void 0,n});return e[t]=i,i},jt=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e,i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}function s(e){return import.meta.resolve?new URL(import.meta.resolve(e)):new URL(e,import.meta.url)}r=o(t.map(t=>{t=Dt(t,n);let r=s(t),i=kt(r);return At(Ot,r.href,()=>{if(e===void 0){e={all:new Set,styles:new Set};let t=document.getElementsByTagName(`link`);for(let n=t.length-1;n>=0;n--){let r=t[n];e.all.add(r.href),r.rel===`stylesheet`&&e.styles.add(r.href)}}if((i?e.styles:e.all).has(r.href))return;let t=document.createElement(`link`);if(t.rel=i?`stylesheet`:Et,i||(t.as=`script`),t.crossOrigin=``,t.href=r.href,a&&t.setAttribute(`nonce`,a),document.head.appendChild(t),i)return new Promise((e,n)=>{t.addEventListener(`load`,e),t.addEventListener(`error`,()=>n(Error(`Unable to preload CSS for ${r}`)))})})}).filter(e=>e!==void 0))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})},P=e=>document.getElementById(e),Mt=P(`app`),F=P(`viewport`),Nt=P(`notice`),Pt=P(`about`),Ft=P(`about-panel`),It=P(`fullscreen`),Lt=P(`vr`),Rt=P(`places`),zt=P(`places-toggle`),Bt=P(`compass`),Vt=P(`compass-label`),Ht=P(`reset`),Ut=P(`controls-hint`),Wt=P(`diagnostics`),Gt=new URLSearchParams(window.location.search),Kt=Gt.has(`debug`),qt=!Kt||Gt.get(`occlusion`)!==`0`,Jt=!Kt||Gt.get(`camera`)!==`0`,Yt=!Kt||Gt.get(`reflection`)!==`0`,Xt=[`北`,`东北`,`东`,`东南`,`南`,`西南`,`西`,`西北`],Zt=Math.PI/2,Qt=1.25,$t=.0045,en=7,tn=new _,nn=new _,rn=new _,I=new _,L=new _,R=new _,an=Ct(),z=new _,B=`walk`,V,H,on,sn,U,cn,ln,un,dn,W=0,fn=NaN,G,pn=0,K=0,mn=0,hn=1,q=!1,gn=!1,_n,J,vn=``,yn,Y=new s;Y.background=new M(`#b9d5e7`);var X=new l(57,1,.07,1600),Z=new y;Z.add(X),Y.add(Z);var bn=Tt(X);function xn(e){if(!q||J)return;let t=e-W;G=Math.abs(t)<.001?void 0:{start:W,arc:t,durationMs:Math.max(320,1180*Math.abs(t)/Zt),startTime:performance.now()}}function Sn(e){if(!G)return;let t=N.clamp((e-G.startTime)/G.durationMs,0,1);W=G.start+G.arc*(t*t*(3-2*t)),t===1&&(G=void 0)}function Cn(e){let t=-(G?G.start+G.arc:W)/Zt;xn(-(e>0?Math.floor(t+1.001):Math.ceil(t-1.001))*Zt)}function wn(){xn(W-(N.euclideanModulo(W+Math.PI,Math.PI*2)-Math.PI))}function Tn(e,t){if(!q||J)return;G=void 0;let n=$t/X.zoom;W-=e*n,pn=N.clamp(pn-t*n,-1.25,Qt)}function En(){return(V?.manifest.northYaw??0)+W}function Dn(){X.zoom=hn,X.updateProjectionMatrix()}function On(e){!q||J||!Number.isFinite(e)||e<=0||(hn=N.clamp(hn*e,.78,2.5),Dn())}var Q=ft({surface:F,movePad:P(`move-pad`),thumb:P(`move-thumb`),lever:P(`lift-lever`),leverThumb:P(`lift-thumb`),toggleFlight:Bn,reset:In,turn:Cn,look:Tn,zoom:On,onDeviceChange:$});function kn(){if(W===fn)return;fn=W,Bt.style.setProperty(`--turn`,`${W.toFixed(4)}rad`);let e=`朝${Xt[N.euclideanModulo(Math.round(-W/(Zt/2)),Xt.length)]}`;Vt.textContent!==e&&(Vt.textContent=e)}function $(){let e=!!(V&&q),t=e&&!J;Mt.dataset.mode=B,Ht.disabled=!t,zt.disabled=!t,t||Vn(!1),Bt.hidden=!t,P(`move-pad`).hidden=!t,P(`lift-lever`).hidden=!t||!H,Ut.hidden=!e,e&&(Ut.textContent=vn||(Q.touch?{walk:`拖动画面转视角 · 摇杆移动 · 推杆向上起飞`,fly:`飞行中 · 推杆升降 · 降到地面自动落地`}:{walk:`拖动画面转视角 · WASD 或摇杆移动 · 推杆向上或按 E 起飞`,fly:`飞行中 · 推杆或 E、Q 升降 · 降到地面自动落地`})[B])}function An(e,t){let n=on?.(e.x,e.z,t.x,t.z)??1;t.x=e.x+(t.x-e.x)*n,t.z=e.z+(t.z-e.z)*n}function jn(){let e=B===`walk`?H?.position:L;e&&!J&&bn(e,En(),pn)}function Mn(e,t=0){let n=V?.manifest.northYaw??0;W=(e.yaw??n)-n,G=void 0,pn=e.pitch??t}function Nn(e){z.fromArray(e.position),H?.teleport(z),I.copy(z),Mn(e)}function Pn(e,t,n){L.fromArray(e.position),L.y+=t,Mn(e,n)}function Fn(){window.clearTimeout(yn),vn=``}function In(){V&&!J&&(hn=1,Dn(),Ln(V.manifest.spawn))}function Ln(e){V&&!J&&(H?zn(`walk`,e):(Fn(),Q.releaseAll(),Pn(e,e===V.manifest.spawn?Math.max(10,V.size.y*.6):2,-.2),jn(),$()))}function Rn(){if(V&&H)return V.manifest.collisionFromModels?H.findLanding(L):sn?.(z.copy(L).addScaledVector(X.up,wt))}function zn(e,t,n){q&&V&&!J&&H&&(e!==B||t)&&(Fn(),B===`fly`&&e===`walk`&&!t&&!n&&(n=Rn(),!n&&(V.manifest.collisionFromModels||sn))?(vn=`脚下没有足够的落脚空间，换个位置再落地`,yn=window.setTimeout(()=>{vn=``,$()},3e3),$()):(t&&Q.releaseAll(),K=0,e===`fly`&&L.copy(H.position),B=e,e===`walk`&&(t?Nn(t):(H.teleport(n??I),n&&I.copy(n))),jn(),$()))}function Bn(){let e=B===`fly`;zn(e?`walk`:`fly`),!e&&B===`fly`&&(K=en)}function Vn(e){let t=e??Rt.hidden;t&&Yn(!1),Rt.hidden=!t,zt.setAttribute(`aria-expanded`,String(t))}function Hn(){let e=F.clientWidth,t=F.clientHeight;e&&t&&(X.aspect=e/t,X.updateProjectionMatrix(),U&&!J&&(U.setPixelRatio(Math.min(devicePixelRatio,Q.touch?1.5:2)),U.setSize(e,t,!1)))}function Un(){let e=En();tn.set(-Math.sin(e),0,-Math.cos(e)),nn.set(Math.cos(e),0,-Math.sin(e)),rn.copy(tn).multiplyScalar(Q.ahead).addScaledVector(nn,Q.side),rn.clampLength(0,1)}function Wn(e,t){if(Un(),B===`walk`&&H&&Q.takeoff&&zn(`fly`),B===`walk`&&H){H.update(e,rn,Q.running,Q.jumping),H.grounded&&I.copy(H.position),V&&H.position.y<V.bounds.min.y-8&&H.teleport(I),jn();return}if(!V)return;let n=Q.running?32:16,r=N.clamp(Q.lift,-1,1);if(r)K=0;else if(K>0){let t=Math.min(K,Math.max(.6,K*2.4)*e);K-=t,r=t/(n*e||1)}let i=V.manifest.collisionFromModels&&H,a=i?0:Math.max(25,Math.max(V.size.x,V.size.z)*.4);R.copy(L).addScaledVector(rn,e*n),on?An(L,R):i||(R.x=N.clamp(R.x,V.bounds.min.x-a,V.bounds.max.x+a),R.z=N.clamp(R.z,V.bounds.min.z-a,V.bounds.max.z+a)),R.copy(H?.constrainFlight(L,R)??R),An(L,R),L.copy(R),R.copy(L),R.y+=r*n*e,i||(R.y=N.clamp(R.y,V.bounds.min.y+.02,V.bounds.max.y+a*2));let o=L.y-R.y;if(L.copy(H?.constrainFlight(L,R)??R),r<0&&o>0&&L.y-R.y>o*.5&&t-mn>200){mn=t;let e=Rn();e&&L.y-e.y<1.2&&zn(`walk`,void 0,e)}jn()}function Gn(e,t){if(!H||!J||!t)return;let n=U.xr.getReferenceSpace(),r=n&&t.getViewerPose(n);if(r&&(an(r.transform.orientation,Z.rotation.y,J.inputSources,rn),H.update(e,rn,!1,!1),H.grounded&&I.copy(H.position),V&&H.position.y<V.bounds.min.y-8&&H.teleport(I),Z.position.copy(H.position),on)){let e=r.transform.position;z.set(e.x,0,e.z).applyAxisAngle(X.up,Z.rotation.y);let t=on(H.position.x,H.position.z,H.position.x+z.x,H.position.z+z.z);Z.position.addScaledVector(z,t-1)}}async function Kn(){if(navigator.xr&&H&&window.isSecureContext)try{if(!await navigator.xr.isSessionSupported(`immersive-vr`))return;Lt.hidden=!1}catch{}}async function qn(){if(H&&navigator.xr&&!J){Lt.disabled=!0;try{let e=await navigator.xr.requestSession(`immersive-vr`,{requiredFeatures:[`local-floor`]});zn(`walk`),G=void 0,J=e,Q.releaseAll(),$(),Z.position.copy(H.position),Z.rotation.y=En(),X.position.set(0,0,0),X.quaternion.identity(),e.addEventListener(`end`,()=>{J=void 0,Z.position.set(0,0,0),Z.rotation.y=0,jn(),Lt.disabled=!1,$(),queueMicrotask(Hn)},{once:!0}),await U.xr.setSession(e)}catch(e){J&&J.end().catch(()=>{}),Lt.disabled=!1,console.warn(`未能进入头显 VR`,e),Ut.textContent=`暂时无法进入头显，请检查浏览器的 VR 连接。`}}}function Jn(e,t){let n=Math.min(.1,_n===void 0?0:(e-_n)/1e3);_n=e,q&&(J?Gn(n,t):(Sn(e),Wn(n,e),kn()));let r=B===`walk`?H?.position:L;if(cn?.update(B,r,gn,n),ln?.(e),un?.update(X,e,q&&B===`walk`),q&&!Q.touch&&!U.xr.isPresenting&&dn?dn.render(Y,X):U.render(Y,X),!gn&&(gn=!0,Nt.hidden=!0,V)){let e=V.visuals;V.loadSurroundings().then(t=>{e.add(t),ln=ut(t)}).catch(e=>console.warn(`校园周边场景载入失败`,e))}if(Kt){let e=X.position.toArray().map(e=>e.toFixed(2)).join(`, `),{calls:t,triangles:n}=U.info.render,i=r?.toArray().map(e=>e.toFixed(2)).join(`, `)??`—`;Wt.textContent=`${B}${B===`walk`&&H?.grounded?` grounded`:``}\n${e}\n${t} draws · ${n.toLocaleString()} tris\nheading ${En().toFixed(3)}\nfeet ${i}\nfacing ${Vt.textContent}\nzoom ${X.zoom.toFixed(3)}\nmirror ${un?.active?`on`:`off`} · ${un?.passes??0} captures`}}function Yn(e){let t=e??Ft.hidden;t&&Vn(!1),Ft.hidden=!t,Pt.setAttribute(`aria-expanded`,String(t))}function Xn(e,t){if(P(`campus-title`).textContent=e.title,document.title=`${e.title} · 3D 校园`,P(`campus-status`).textContent=e.status??`3D 校园`,P(`description`).textContent=e.description??e.status??`可以步行或飞行查看校园场景。`,e.evidenceUrl){let n=new URL(e.evidenceUrl,t);if(n.protocol===`https:`||n.protocol===`http:`){let e=P(`evidence`);e.href=n.href,e.hidden=!1}}for(let t of e.locations??[]){let e=document.createElement(`button`);e.type=`button`,e.textContent=t.label,e.addEventListener(`click`,()=>{Vn(!1),Ln(t),F.focus({preventScroll:!0})}),Rt.append(e)}zt.hidden=!Rt.childElementCount}async function Zn(){try{let e=jt(()=>import(`./player-CWFVsZkc.js`).then(async e=>(await e.preparePlayerPhysics(),e)),__vite__mapDeps([0,1,2]),import.meta.url).catch(e=>({loadError:e}));if(U=new oe({antialias:!0,powerPreference:`high-performance`,logarithmicDepthBuffer:!0}),U.outputColorSpace=C,U.toneMapping=6,U.toneMappingExposure=1.04,U.shadowMap.enabled=!0,U.shadowMap.autoUpdate=!1,U.shadowMap.type=1,U.xr.enabled=!0,U.xr.setReferenceSpaceType(`local-floor`),!Q.touch&&qt&&(dn=ot(U,Jt)),F.tabIndex=0,F.appendChild(U.domElement),new ResizeObserver(Hn).observe(F),Hn(),Wt.hidden=!Kt,It.hidden=!document.fullscreenEnabled,V=await Te(),V.manifest.tourBoundary&&(on=Ee(V.manifest.tourBoundary)),Y.add(V.visuals),cn=tt(Y,X,U,V,Q.touch),un=je(U,Y,V.visuals,Yt&&!Q.touch),Xn(V.manifest,V.manifestURL),V.collision.children.length)try{let t=await e;if(`loadError`in t)throw t.loadError;H=await t.createPlayerController(V.collision,new _().fromArray(V.manifest.spawn.position),{object:new y,updateMotion(){},dispose(){}},V.manifest.collisionFromModels,on),!V.manifest.collisionFromModels&&V.manifest.landingBoundary&&(sn=yt(V.collision,V.manifest.landingBoundary))}catch(e){console.warn(`校园碰撞载入失败`,e),P(`description`).append(` 本次载入未启用步行。`)}!H&&V.collision.children.length===0&&P(`description`).append(` 当前场景支持飞行。`),H||(B=`fly`),q=!0,Ln(V.manifest.spawn),U.setAnimationLoop(Jn),Kn()}catch(e){console.error(e),P(`loading-mark`).hidden=!0,P(`notice-title`).textContent=`场景未能加载`,P(`notice-detail`).textContent=e instanceof Error?e.message:`请重新加载页面。`,P(`retry`).hidden=!1}}Bt.addEventListener(`click`,()=>{wn(),F.focus({preventScroll:!0})}),Ht.addEventListener(`click`,()=>{In(),F.focus({preventScroll:!0})}),zt.addEventListener(`click`,()=>Vn()),Pt.addEventListener(`click`,()=>Yn()),F.addEventListener(`pointerdown`,()=>{Vn(!1),Yn(!1)}),document.addEventListener(`keydown`,e=>{e.key===`Escape`&&(Ft.hidden?Rt.hidden||(Vn(!1),zt.focus()):(Yn(!1),Pt.focus()))}),It.addEventListener(`click`,async()=>{try{document.fullscreenElement?await document.exitFullscreen():await Mt.requestFullscreen()}catch{}}),document.addEventListener(`fullscreenchange`,()=>{It.lastChild.textContent=document.fullscreenElement?`退出全屏`:`全屏`}),Lt.addEventListener(`click`,()=>void qn()),P(`retry`).addEventListener(`click`,()=>window.location.reload()),window.addEventListener(`pagehide`,e=>{e.persisted||(H?.dispose(),cn?.dispose(),un?.dispose(),dn?.dispose(),U&&(U.setAnimationLoop(null),U.dispose()))}),Zn();