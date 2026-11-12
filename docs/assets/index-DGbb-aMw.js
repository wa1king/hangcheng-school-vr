const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./player-DKGjlMNw.js","./three-runtime-CV2Ouew1.js","./physics-runtime-BR_-CEU_.js"])))=>i.map(i=>d[i]);
import{$ as e,A as t,B as n,C as r,D as i,E as a,F as o,G as s,H as c,I as l,J as u,K as d,L as f,M as p,N as m,O as h,P as g,Q as _,R as v,S as y,T as b,U as x,V as S,W as C,X as w,Y as T,Z as E,_ as D,a as ee,b as O,c as k,d as A,et as j,f as te,g as ne,i as re,j as ie,k as ae,l as M,m as oe,n as se,o as ce,p as N,q as le,r as ue,s as de,t as fe,tt as pe,v as me,w as he,x as ge,y as _e,z as ve}from"./three-runtime-CV2Ouew1.js";(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var ye=new URL(`./scene/scene.json`,window.location.href),be=e=>Array.isArray(e)&&e.length===3&&e.every(Number.isFinite);function xe(e){return e&&be(e.position)&&(e.yaw===void 0||Number.isFinite(e.yaw))&&(e.pitch===void 0||Number.isFinite(e.pitch)&&Math.abs(e.pitch)<=1.49)}function Se(e){let t=new URL(e,ye);if(t.origin!==ye.origin||!t.pathname.toLowerCase().endsWith(`.glb`))throw Error(`模型必须是项目内的 GLB 文件。`);return t.href}function Ce(e,t,n,r=!1){e.updateWorldMatrix(!0,!0);let i=e=>{if(!(e instanceof m))return;let r=n(e);if(!r)return;let i=e.clone(!1);i.geometry=r,i.matrixAutoUpdate=!1,i.matrix.copy(e.matrixWorld),i.visible=!0,t.add(i)};r?e.traverseVisible(i):e.traverse(i)}function we(e){for(;e;){let t=e.name.toUpperCase();if(t===`COLLISION`||t.startsWith(`COLLISION_`))return!0;e=e.parent}return!1}function Te(e){if(we(e))return;let t=e=>e&&!e.name.startsWith(`decal-`),n=e.geometry;if(!Array.isArray(e.material))return t(e.material)?n:void 0;let r=e.material,i=n.groups.filter(e=>t(r[e.materialIndex??0]));if(!i.length)return;if(i.length===n.groups.length)return n;let a=new Uint32Array(i.reduce((e,t)=>e+t.count,0)),o=0;for(let e of i)for(let t=e.start;t<e.start+e.count;t+=1)a[o++]=n.index?n.index.getX(t):t;return new te().setAttribute(`position`,n.getAttribute(`position`)).setIndex(new A(a,1))}async function Ee(){let t=await fetch(ye,{cache:`no-cache`});if(!t.ok||!t.headers.get(`content-type`)?.includes(`json`))throw Error(`还没有找到校园场景文件。`);let n=await t.json();if(typeof n.title!=`string`||!Array.isArray(n.models)||!n.models.length||!xe(n.spawn))throw Error(`校园场景缺少名称、模型或有效起点。`);if(n.northYaw!==void 0&&!Number.isFinite(n.northYaw))throw Error(`校园方位设置无效。`);if(n.overview&&(!be(n.overview.position)||!be(n.overview.target)))throw Error(`校园总览机位无效。`);if(n.collisionFromModels!==void 0&&typeof n.collisionFromModels!=`boolean`)throw Error(`校园碰撞来源无效。`);if(n.landingBoundary&&(!Array.isArray(n.landingBoundary)||n.landingBoundary.length<3||!n.landingBoundary.every(e=>Array.isArray(e)&&e.length===2&&e.every(Number.isFinite))))throw Error(`校园可落地区域数据无效。`);for(let e of n.models)if(typeof e?.url!=`string`||e.position!==void 0&&!be(e.position)||e.rotationY!==void 0&&!Number.isFinite(e.rotationY)||e.surroundings!==void 0&&typeof e.surroundings!=`boolean`||e.scale!==void 0&&(!Number.isFinite(e.scale)||e.scale<=0))throw Error(`校园模型的文件路径或坐标无效。`);if(n.locations&&(!Array.isArray(n.locations)||!n.locations.every(e=>xe(e)&&typeof e.id==`string`&&typeof e.label==`string`)))throw Error(`校园地点数据无效。`);let i=new ue().setMeshoptDecoder(se),a=new r,o=new r,[s,c]=await Promise.all([Promise.all(n.models.map(e=>i.loadAsync(Se(e.url)))),!n.collisionFromModels&&n.collisionUrl?i.loadAsync(Se(n.collisionUrl)):void 0]);for(let[e,t]of s.entries()){let i=n.models[e],o=new r;i.position&&o.position.fromArray(i.position),o.rotation.y=i.rotationY??0,o.scale.setScalar(i.scale??1),o.add(t.scene),i.surroundings&&o.traverse(e=>{e.userData.surroundings=!0,e.userData.shadow=!1}),a.add(o)}n.collisionFromModels?Ce(a,o,Te,!0):c?Ce(c.scene,o,e=>e.userData.collision===!1?void 0:e.geometry):Ce(a,o,e=>we(e)?e.geometry:void 0);let l=new M;if(a.updateWorldMatrix(!0,!0),a.traverse(e=>{if(we(e)){e.visible=!1;return}if(!(e instanceof m))return;let t=Array.isArray(e.material)?e.material:[e.material];e.castShadow=e.userData.shadow!==!1&&t.some(e=>!e.transparent&&(!e.name.startsWith(`decal-`)||e.alphaTest>0)),e.receiveShadow=e.userData.shadow!==!1,e.userData.surroundings||(e.geometry.boundingBox||e.geometry.computeBoundingBox(),e.geometry.boundingBox&&l.union(e.geometry.boundingBox.clone().applyMatrix4(e.matrixWorld)))}),l.isEmpty())throw Error(`校园模型中没有可见网格。`);return{manifest:n,visuals:a,collision:o,bounds:l,size:l.getSize(new e),center:l.getCenter(new e),manifestURL:ye}}var De=-.02,Oe=-24*Math.PI/180,ke=new Set([`plaza`,`walk`,`courtyard-paving`,`plaza-inlay`,`decal-brickline`]),Ae=`
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
`;function je(t,n,r,i){let a=i&&t.extensions.has(`EXT_color_buffer_float`),o=new pe(1,1,{type:a?he:w,minFilter:h,generateMipmaps:!0});o.texture.name=`Campus paving reflection`;let s={tCampusMirror:{value:null},uCampusMirrorProjection:{value:new p},uCampusMirrorActive:{value:0},uCampusGroundLevel:{value:De},uCampusSiteRotation:{value:new _(Math.cos(Oe),Math.sin(Oe))}},c=new Set;r.traverse(e=>{if(!(e instanceof m))return;let t=Array.isArray(e.material)?e.material:[e.material];for(let e of t){if(!(e instanceof g)||c.has(e)||!ke.has(e.name))continue;c.add(e);let t=e.onBeforeCompile.bind(e),n=e.customProgramCacheKey();e.customProgramCacheKey=()=>`${n}|campus-ground-v1`,e.onBeforeCompile=(e,n)=>{t(e,n),Object.assign(e.uniforms,s),e.vertexShader=e.vertexShader.replace(`#include <common>`,`#include <common>
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
          `)},e.needsUpdate=!0}});let l=new f,u=new e,d=new e,y=new e(1/0,1/0,1/0),b=new e,x=new _,S=new _,C=new v,T=new j,E=new j,D=new p().set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),ee=-1/0,O=!0,k=0;function A(){s.uCampusMirrorActive.value=0,O=!0}return a&&t.domElement.addEventListener(`webglcontextrestored`,A),{get active(){return s.uCampusMirrorActive.value!==0},get passes(){return k},update(e,r,i){e.getWorldPosition(u),e.getWorldDirection(d);let c=s.uCampusSiteRotation.value.x,f=s.uCampusSiteRotation.value.y;if(S.set(c*u.x+f*u.z,-f*u.x+c*u.z),!a||!i||t.xr.isPresenting||d.y>.58||u.y<.35||u.y>4.2||S.x<-20||S.x>48||S.y<-32||S.y>78){A();return}if(t.shadowMap.needsUpdate){O=!0;return}t.getDrawingBufferSize(x);let p=Math.min(.43,576/Math.max(x.x,x.y)),m=Math.max(16,Math.round(x.x*p)),h=Math.max(16,Math.round(x.y*p)),g=o.width!==m||o.height!==h,_=y.distanceToSquared(u)>.022**2||b.dot(d)<.999993;if(!g&&(!O&&!_||r-ee<38))return;g&&o.setSize(m,h),l.position.copy(u),l.position.y=2*De-u.y,l.up.setFromMatrixColumn(e.matrixWorld,1),l.up.y*=-1,d.y*=-1,l.lookAt(d.add(l.position)),l.updateMatrixWorld(!0),l.near=e.near,l.far=e.far,l.projectionMatrix.copy(e.projectionMatrix);let v=l.projectionMatrix.elements;C.normal.set(0,1,0),C.constant=.024,C.applyMatrix4(l.matrixWorldInverse),T.set(C.normal.x,C.normal.y,C.normal.z,C.constant),E.set((Math.sign(T.x)+v[8])/v[0],(Math.sign(T.y)+v[9])/v[5],-1,(1+v[10])/v[14]);let w=T.dot(E);if(Math.abs(w)<1e-5){s.uCampusMirrorActive.value=0;return}s.uCampusMirrorProjection.value.copy(D).multiply(l.projectionMatrix).multiply(l.matrixWorldInverse),T.multiplyScalar(2/w),v[2]=T.x,v[6]=T.y,v[10]=T.z+1,v[14]=T.w,l.projectionMatrixInverse.copy(l.projectionMatrix).invert();let j=t.getRenderTarget(),te=t.xr.enabled;s.uCampusMirrorActive.value=0,s.tCampusMirror.value=null;try{t.xr.enabled=!1,t.setRenderTarget(o),t.state.buffers.depth.setMask(!0),t.render(n,l)}finally{t.setRenderTarget(j),t.xr.enabled=te}s.tCampusMirror.value=o.texture,s.uCampusMirrorActive.value=1,y.copy(u),e.getWorldDirection(b),ee=r,O=!1,k+=1},dispose(){a&&t.domElement.removeEventListener(`webglcontextrestored`,A),o.dispose()}}}var Me=`
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
`;function Pe(n,r){let a=new URLSearchParams(window.location.search);if(a.has(`debug`)&&a.get(`bake`)===`0`)return;let o=new URL(r,n).searchParams.get(`v`);if(!o||!/^[\da-f]{12}$/.test(o))return;let s={tCampusBake:{value:null},uCampusBakeOrigin:{value:new e},uCampusBakeStep:{value:new e(1,1,1)},uCampusBakeSize:{value:new e(1,1,1)},uCampusBakeRotation:{value:new _(1,0)},uCampusBakeActive:{value:0}},c=new URL(`campus-baked-light.bin`,n);c.searchParams.set(`v`,o);let l=new AbortController,u=!1;function d(){u||l.signal.aborted||(u=!0,fetch(c,{signal:l.signal}).then(async e=>{if(!e.ok)return;let t=await e.arrayBuffer();if(t.byteLength<64||l.signal.aborted)return;let n=new TextDecoder;if(n.decode(new Uint8Array(t,0,4))!==`HCB1`||n.decode(new Uint8Array(t,48,12))!==o)return;let r=new DataView(t),a=r.getUint32(4,!0),c=r.getUint32(8,!0),u=r.getUint32(12,!0),d=[28,32,36].map(e=>r.getFloat32(e,!0));if(a<2||c<2||u<2||a*c*u*4!=t.byteLength-64||d.some(e=>!(e>0)||!Number.isFinite(e)))return;let f=new ne(new Uint8Array(t,64),a,c,u);f.minFilter=i,f.magFilter=i,f.needsUpdate=!0,s.tCampusBake.value=f,s.uCampusBakeOrigin.value.set(r.getFloat32(16,!0),r.getFloat32(20,!0),r.getFloat32(24,!0)),s.uCampusBakeStep.value.set(d[0],d[1],d[2]),s.uCampusBakeSize.value.set(a,c,u),s.uCampusBakeRotation.value.set(r.getFloat32(40,!0),r.getFloat32(44,!0)),s.uCampusBakeActive.value=1}).catch(()=>{}))}return{start:d,skyVisibilityAt(e){let n=s.tCampusBake.value;if(!n)return 1;let{width:r,height:i,depth:a}=n.image,o=n.image.data,{x:c,y:l}=s.uCampusBakeRotation.value,u=s.uCampusBakeOrigin.value,d=s.uCampusBakeStep.value,f=(e.x*c+e.z*l-u.x)/d.x,p=(-e.x*l+e.z*c-u.y)/d.y,m=(e.y-u.z)/d.z,h=t.smoothstep(Math.min(f,r-1-f,p,i-1-p),0,3),g=t.smoothstep(m,-1.5,-.1)*t.smoothstep(a-1-m,0,2);if(h===0||g===0)return 1;let _=Math.floor(f),v=Math.floor(p),y=Math.max(0,m),b=Math.floor(y),x=4*r,S=x*i,C=_*4+v*x+b*S,w=t.lerp(t.lerp(o[C],o[C+4],f-_),t.lerp(o[C+x],o[C+x+4],f-_),p-v),T=C+S,E=t.lerp(t.lerp(o[T],o[T+4],f-_),t.lerp(o[T+x],o[T+x+4],f-_),p-v),D=t.lerp(w,E,y-b)/255;return t.lerp(1,D,h*g)},register(e){if(e.transparent||e.name.startsWith(`decal-`))return;let t=e.onBeforeCompile,n=e.customProgramCacheKey();e.onBeforeCompile=(n,r)=>{t.call(e,n,r),Object.assign(n.uniforms,s),n.vertexShader=n.vertexShader.replace(`#include <common>`,`#include <common>
varying vec3 vCampusBakeWorld;`).replace(`#include <project_vertex>`,`
            #include <project_vertex>
            vCampusBakeWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;
          `),n.fragmentShader=n.fragmentShader.replace(`#include <common>`,`#include <common>\n${Me}`).replace(`#include <lights_fragment_end>`,`${Ne}\n#include <lights_fragment_end>`)},e.customProgramCacheKey=()=>`${n}|campus-bake-v1`},dispose(){l.abort(),s.uCampusBakeActive.value=0,s.tCampusBake.value?.dispose(),s.tCampusBake.value=null}}}var Fe=`scene/campus-photo-sky.hdr?v=44f8af5b5dda`;async function Ie(){let e=new URL(`./${Fe}`,window.location.href),t=await new fe().loadAsync(e.href);return t.mapping=303,t.wrapS=C,t.needsUpdate=!0,{material:new le({uniforms:{uSky:{value:t},uHorizon:{value:new N(`#bed0d9`)}},vertexShader:`
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
      }`,side:1,depthTest:!1,depthWrite:!1,toneMapped:!1}),texture:t}}var Le=new Map([[`plaza`,[`pavers`,.31,.26,.0022]],[`walk`,[`pavers`,.3,.22,.0022]],[`street-paving`,[`stone`,.26,.12,.0024]],[`street-curb`,[`stone`,.32,.07,.002]],[`street-verge`,[`scanned`,.29,.02,.0018]],[`street-soil`,[`scanned`,.33,.03,.0028]],[`plaza-inlay`,[`stone`,.23,.13,.0015]],[`courtyard-paving`,[`pavers`,.33,.24,.0022]],[`teaching-floor`,[`pavers`,.16,.38,8e-4]],[`beige`,[`masonry`,.23,.06,.0012]],[`terra`,[`masonry`,.29,.08,.0014]],[`road`,[`scanned`,.35,.14,.0034]],[`teaching-wall`,[`scanned`,.1,.02,5e-4]],[`teaching-ceiling`,[`scanned`,.075,.02,5e-4]],[`soffit`,[`scanned`,.2,.04,.0012]],[`cream`,[`scanned`,.17,.05,9e-4]],[`reveal`,[`scanned`,.19,.04,8e-4]],[`entry-stone`,[`stone`,.22,.27,.0016]],[`entry-nosing`,[`stone`,.19,.2,.0012]],[`entry-traction`,[`stone`,.23,.12,.0022]],[`stair-stone`,[`stone`,.13,.27,.0011]],[`gallery-base-stone`,[`stone`,.17,.15,.001]],[`curb`,[`stone`,.27,.09,.0026]],[`decal-brickline`,[`stone`,.27,.19,.0015]],[`decal-paint-yellow`,[`paint`,.25,.12,0]],[`decal-paint-white`,[`paint`,.21,.1,0]],[`decal-sports_paint`,[`paint`,.14,.09,0]]]),Re=new Set([`road`,`street-paving`,`street-curb`,`walk`,`plaza-inlay`]),ze=`
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
      `))},e.customProgramCacheKey=()=>`${c}|campus-surface-v2:${n}:${o}`}var Ke=new e(-.69,.55,.47).normalize(),qe=new N(`#bed0d9`),Je=new N(`#568bc6`),Ye=new Set([`ground`,`plaza`,`walk`,`courtyard-paving`,`road`,`planter`,`plaza-inlay`,`street-paving`,`street-curb`,`street-verge`,`street-soil`,`teaching-floor`]);function Xe(e){let t=new le({uniforms:{uZenith:{value:Je},uHorizon:{value:qe},uCloud:{value:new N(`#f3f5ef`)},uSun:{value:Ke}},vertexShader:`
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
      }`,side:1,depthTest:!1,depthWrite:!1,toneMapped:!1}),n=new m(new u(e,32,16),t);return n.renderOrder=-1e3,n.frustumCulled=!1,n}function Ze(){let e=new Uint16Array(73728),n=new N(`#69725e`),r=new N(`#fff0d7`),a=me.toHalfFloat,o=new N;for(let i=0;i<96;i+=1){let s=((i+.5)/96-.5)*Math.PI,c=Math.sin(s),l=Math.cos(s);for(let u=0;u<192;u+=1){let d=((u+.5)/192-.5)*Math.PI*2,f=Math.max(0,l*(Math.cos(d)*Ke.x+Math.sin(d)*Ke.z)+c*Ke.y);o.copy(qe),c>=0?o.lerp(Je,t.smoothstep(c,0,.92)):o.lerp(n,t.smoothstep(-c,0,.38));let p=t.smoothstep(Math.sin(d*3+s*13.1)*.62+Math.cos(d*7-s*25.1)*.25+Math.sin(d*11+s*37)*.13,.27,.86)*t.smoothstep(c,.06,.43);o.lerp(r,p*.37).multiplyScalar(.75+Math.max(0,c)*.53);let m=.53*f**21+2.6*f**225;o.r+=r.r*m,o.g+=r.g*m,o.b+=r.b*m;let h=(i*192+u)*4;e.set([a(o.r),a(o.g),a(o.b),a(1)],h)}}let s=new D(e,192,96,c,he);return s.mapping=303,s.colorSpace=ae,s.minFilter=i,s.magFilter=i,s.needsUpdate=!0,s}var Qe=`
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
`;function $e(t,n,r,i,a,o,s,c){let l=n.manifest.locations?.find(e=>e.id===`gate`),u=n.manifest.locations?.find(e=>e.id===`courtyard`);if(!l||!u||!t.extensions.has(`EXT_color_buffer_float`))return;let f=new e().fromArray(u.position).add(new e(0,5.2,0)),p=new e().fromArray(l.position).lerp(f,.41);p.y=l.position[1]+5.1;let v=[p,f],y=v.map(()=>new ce(128,{type:he,generateMipmaps:!0,minFilter:h})),b=new _,x=new _,S={uCampusEntryProbe:{value:y[0].texture},uCampusCourtProbe:{value:y[1].texture},uCampusEntryProbeCenter:{value:p},uCampusCourtProbeCenter:{value:f},uCampusProbeActive:{value:b}};function C(e,t,n){let r=e.onBeforeCompile,i=e.customProgramCacheKey(),a={value:t?.88:.65};e.onBeforeCompile=(t,i)=>{r.call(e,t,i),Object.assign(t.uniforms,S,{uCampusProbeStrength:a}),t.vertexShader=t.vertexShader.replace(`#include <common>`,`#include <common>
varying vec3 vCampusProbePosition;`).replace(`#include <project_vertex>`,`
          #include <project_vertex>
          vCampusProbePosition = (modelMatrix * vec4(transformed, 1.0)).xyz;
        `);let o=ee.envmap_physical_pars_fragment.replace(`return envMapColor.rgb * envMapIntensity;`,`return campusProbeSample(reflectVec, roughness, envMapColor.rgb) * envMapIntensity;`);t.fragmentShader=t.fragmentShader.replace(`#include <common>`,`#include <common>\n${Qe}`).replace(`#include <envmap_physical_pars_fragment>`,o),n&&(t.fragmentShader=t.fragmentShader.replace(`#include <opaque_fragment>`,`
        float faceOn = clamp(dot(normalize(vViewPosition), normal), 0.0, 1.0);
        diffuseColor.a *= mix(0.67, 1.43, pow(1.0 - faceOn, 4.0));
        #include <opaque_fragment>
      `))},e.customProgramCacheKey=()=>`${i}|campus-probe-${n?`clear`:`opaque`}`}function w(){let e=new d;e.background=r.background,e.fog=r.fog;let l=n.visuals.clone(!0),u=new Map;l.traverse(e=>{if(!(e instanceof m))return;let t=e=>{let t=u.get(e);return t||(t=e.clone(),t.visible=e.visible&&!e.transparent,t instanceof g&&(t.envMap=null),u.set(e,t)),t};e.material=Array.isArray(e.material)?e.material.map(t):t(e.material)});let f=i.clone(),p=c.clone();p.shadow.mapSize.set(512,512),p.shadow.bias=-2e-4,p.shadow.normalBias=.04,Object.assign(p.shadow.camera,{left:-48,right:48,top:48,bottom:-48,near:55,far:185}),p.shadow.camera.updateProjectionMatrix(),e.add(l,f,a.clone(),o.clone(),s.clone(),p,p.target);let h=new oe(.2,840,y[0]);return h.coordinateSystem=t.coordinateSystem,h.updateCoordinateSystem(),{prepare(){let n=t.getRenderTarget(),r=t.getActiveCubeFace(),i=t.getActiveMipmapLevel();try{return t.setRenderTarget(y[0]),t.compileAsync(e,h.children[0])}finally{t.setRenderTarget(n,r,i)}},renderFace(n,r){let i=y[n];if(r===0){let e=v[n];f.position.copy(e),p.target.position.copy(e),p.position.copy(e).addScaledVector(Ke,120),h.position.copy(e),h.updateMatrixWorld(!0)}let a=r===h.children.length-1,o=t.getRenderTarget(),s=t.getActiveCubeFace(),c=t.getActiveMipmapLevel(),l=t.xr.enabled,u=t.shadowMap.autoUpdate,d=t.shadowMap.needsUpdate;try{t.xr.enabled=!1,t.shadowMap.autoUpdate=!1,t.shadowMap.needsUpdate=r===0,i.texture.generateMipmaps=a,t.setRenderTarget(i,r),t.state.buffers.depth.setMask(!0),t.render(e,h.children[r]),a&&x.setComponent(n,1)}finally{t.setRenderTarget(o,s,c),t.xr.enabled=l,t.shadowMap.autoUpdate=u,t.shadowMap.needsUpdate=d}return a},dispose(){p.shadow.dispose();for(let e of u.values())e.dispose()}}}let T,E=0,D=0,O=0,k=!1,A;function j(){A?.(),A=void 0,T?.dispose(),T=void 0,O=0,k=!1,E=0,D=0,b.set(0,0),x.set(0,0)}t.domElement.addEventListener(`webglcontextrestored`,j);function te(e){if(b.copy(x).multiplyScalar(+!t.xr.isPresenting),D>=y.length||A||k||!e||t.xr.isPresenting)return;let n=performance.now();if(O===0&&(O=n+1050),n<O)return;let r=()=>{if(A=void 0,!(document.hidden||t.xr.isPresenting||t.getContext().isContextLost())){try{if(!T&&(T=w(),t.extensions.has(`KHR_parallel_shader_compile`))){let e=T;k=!0,e.prepare().catch(e=>console.warn(`校园反射材质预编译未完成`,e)).finally(()=>{T===e&&(k=!1)});return}T.renderFace(D,E++)&&(E=0,D+=1)}catch(e){k=!1,console.warn(`校园局部反射未能生成`,e),E=0,D+=1}O=performance.now()+45,D>=y.length&&(T?.dispose(),T=void 0)}};if(typeof window.requestIdleCallback==`function`){let e=window.requestIdleCallback(r,{timeout:250});A=()=>window.cancelIdleCallback(e)}else{let e=window.setTimeout(r,0);A=()=>window.clearTimeout(e)}}return{register:C,update:te,dispose(){A?.(),T?.dispose(),t.domElement.removeEventListener(`webglcontextrestored`,j);for(let e of y)e.dispose()}}}function et(t,n){let r=t.geometry,i=r.getAttribute(`position`);if(!i)return;let a=new e,o=[],s=new Map,c=[],l=[],u=[],d=e=>{for(;l[e]!==e;)l[e]=l[l[e]],e=l[e];return e};for(let e=0;e<i.count;e+=1){a.fromBufferAttribute(i,e).applyMatrix4(t.matrixWorld);let n=`${Math.round(a.x*500)},${Math.round(a.y*500)},${Math.round(a.z*500)}`,r=s.get(n);r===void 0&&(r=u.length,s.set(n,r),u.push(a.clone()),l.push(r)),c[e]=r}let f=r.index,p=f?.count??i.count;for(let e=0;e+2<p;e+=3){let t=d(c[f?.getX(e)??e]),n=d(c[f?.getX(e+1)??e+1]),r=d(c[f?.getX(e+2)??e+2]);l[n]=t,l[r]=t}for(let[e,t]of u.entries()){let n=d(e);(o[n]??=new M).expandByPoint(t)}for(let t of o){if(!t||t.getSize(a).lengthSq()<.14**2)continue;let r=t.getCenter(new e);r.y=t.min.y-.045,n.push(r)}}function tt(r,i,a,o,s){let c=Math.max(o.size.x,o.size.z,30);r.fog=new y(qe,c*.46,c*2.75),i.far=Math.max(600,c*8),i.updateProjectionMatrix();let l=Xe(i.far*.8),u=Math.max(3e3,c*16),d=new m(new ve(u,u),new g({color:`#7f8f68`,roughness:1}));d.rotation.x=-Math.PI/2,d.position.set(o.center.x,o.bounds.min.y-.36,o.center.z);let f=new b(`#dbeaff`,`#c7beaa`,.95),p=new k(`#eae6dc`,.14),h=new O(`#fff0d7`,3.71),_=Ke.clone().multiplyScalar(c*1.3);h.castShadow=!0;let v=s?1024:2048;h.shadow.mapSize.set(v,v),h.shadow.intensity=.94,h.shadow.radius=2;let x=Ze(),S=[],C=[new n(`#fff0d8`,0,5.2,2),new n(`#fff0d8`,0,5.2,2)];r.add(l,d,f,p,h,h.target,...C);let w=new URLSearchParams(window.location.search),T=w.has(`debug`),E=!T||w.get(`camera`)!==`0`,D=a.toneMappingExposure,ee=T&&w.get(`photoSky`)===`0`,A=!1,j=!1,te,ne=Pe(o.manifestURL,o.manifest.models[0].url),re=!s&&!(T&&w.get(`probe`)===`0`)?$e(a,o,r,l,d,f,p,h):void 0;o.manifest.collisionFromModels&&o.collision.add(d.clone()),o.visuals.updateMatrixWorld(!0);let ie=new Set,ae=Math.min(a.capabilities.getMaxAnisotropy(),s?4:8);o.visuals.traverse(e=>{if(!(e instanceof m))return;let t=Array.isArray(e.material)?e.material:[e.material];t.every(e=>e.name===`glass-clear`)&&(e.castShadow=!1),t.every(e=>e.name===`teaching-lamp`)&&et(e,S);for(let n of t)if(n instanceof g&&!ie.has(n)){if(ie.add(n),Ge(n),Ye.has(n.name))for(let e of[n.map,n.normalMap,n.roughnessMap])e&&e.anisotropy<ae&&(e.anisotropy=ae,e.needsUpdate=!0);n.name===`teaching-lamp`?(n.emissive.set(`#fff1db`),n.emissiveIntensity=1.05):n.name.startsWith(`glass-`)?(n.envMap=x,n.envMapIntensity=n.name===`glass-clear`?1.42:1.02,n.roughness=Math.min(n.roughness,.25),n.name!==`glass-clear`&&(n.metalness=Math.max(n.metalness,.11)),re?.register(n,!0,n.name===`glass-clear`)):[`teaching-metal`,`frame`,`blue-rail`,`blue-cap`,`stand_steel`,`entry-aluminum`,`stainless`,`entry-drain-frame`,`entry-drain-grate`].includes(n.name)?(n.envMap=x,n.envMapIntensity=.48,n.metalness=Math.max(n.metalness,.27),re?.register(n,!1,!1)):n.name===`teaching-floor`&&(n.envMap=x,n.envMapIntensity=.22),e.userData.surroundings||ne?.register(n)}});let M=new e,oe=0;function se(){A=!0,ne?.start(),ee||Ie().then(({material:e,texture:t})=>{if(j)e.dispose(),t.dispose();else{l.material.dispose(),l.material=e,te=t;for(let e of ie)e instanceof g&&e.envMap===x&&(e.envMap=t)}}).catch(()=>{}).finally(()=>{ee=!0})}function ce(e){let n,r,i=5.4**2,a=5.4**2;if(e)for(let t of S){let o=t.y-e.y;if(o<1.92||o>3.95)continue;let s=(t.x-e.x)**2+(t.z-e.z)**2;s<i?(r=n,a=i,n=t,i=s):s<a&&(r=t,a=s)}for(let[e,o]of C.entries()){let s=e?r:n,c=e?a:i;s&&o.position.copy(s),o.intensity=s?4.9*(1-t.smoothstep(c,9,5.4**2)):0}}function N(e,n,r,s){if(i.getWorldPosition(l.position),r&&!A&&se(),re?.update(r&&ee&&e!==`overview`),E){let n=e===`walk`?ne?.skyVisibilityAt(l.position)??1:1,r=D+.24*(1-t.smoothstep(n,.04,.65));a.toneMappingExposure=t.damp(a.toneMappingExposure,r,3,s)}ce(e===`walk`?n:void 0);let c=n&&(e===`walk`||e===`fly`&&n.y<o.bounds.max.y+14),u=c?e===`walk`?25:38:Math.max(o.size.length()*.56,25);if(c?M.set(Math.round(n.x/8)*8,Math.round(n.y/8)*8,Math.round(n.z/8)*8):M.copy(o.center),oe!==u||!h.target.position.equals(M)){if(h.target.position.copy(M),h.position.copy(M).add(_),oe!==u){oe=u;let e=_.length(),t=u*2.4;Object.assign(h.shadow.camera,{left:-u,right:u,top:u,bottom:-u,near:Math.max(.1,e-t),far:e+t}),h.shadow.camera.updateProjectionMatrix(),h.shadow.bias=c?-16e-5:-11e-5,h.shadow.normalBias=c?.018:.074}a.shadowMap.needsUpdate=!0}}return{update:N,dispose(){j=!0;for(let e of[l,d])e.removeFromParent(),e.geometry.dispose(),e.material.dispose();re?.dispose(),ne?.dispose(),te?.dispose(),x.dispose(),h.shadow.dispose(),f.removeFromParent(),p.removeFromParent(),h.removeFromParent(),h.target.removeFromParent();for(let e of C)e.removeFromParent()}}}var nt=`
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
`;function ot(e,t){if(!e.extensions.has(`EXT_color_buffer_float`))return;let n=new pe(1,1,{type:he,depthTexture:new _e(1,1,E)}),r=new pe(1,1,{depthBuffer:!1,minFilter:o,magFilter:o}),i={tDepth:{value:n.depthTexture},uProjection:{value:new _},uTexel:{value:new _},uLogFar:{value:0}},a=new le({uniforms:i,vertexShader:nt,fragmentShader:it,depthTest:!1,depthWrite:!1,toneMapped:!1}),s=new le({uniforms:{...i,tColor:{value:n.texture},tOcclusion:{value:r.texture},uOcclusionSize:{value:new _},uCameraResponse:{value:+!!t}},vertexShader:nt,fragmentShader:at,depthTest:!1,depthWrite:!1}),c=new d,u=new l,f=new m(new ve(2,2),a);f.frustumCulled=!1,c.add(f);let p=new _;return{render(t,o){e.getDrawingBufferSize(p);let l=Math.min(1,Math.sqrt(35e5/(p.x*p.y))),d=Math.max(1,Math.floor(p.x*l)),m=Math.max(1,Math.floor(p.y*l));if(n.width!==d||n.height!==m){let e=Math.max(1,Math.floor(d*.5)),t=Math.max(1,Math.floor(m*.5));n.setSize(d,m),r.setSize(e,t),i.uTexel.value.set(1/d,1/m),s.uniforms.uOcclusionSize.value.set(e,t)}i.uProjection.value.set(o.projectionMatrix.elements[0],o.projectionMatrix.elements[5]),i.uLogFar.value=Math.log2(o.far+1);let h=e.info.autoReset;e.info.reset(),e.info.autoReset=!1;try{e.setRenderTarget(n),e.render(t,o),e.setRenderTarget(r),f.material=a,e.render(c,u),e.setRenderTarget(null),f.material=s,e.render(c,u)}finally{e.setRenderTarget(null),e.info.autoReset=h}},dispose(){n.dispose(),r.dispose(),f.geometry.dispose(),a.dispose(),s.dispose()}}}var st=new Set([`KeyW`,`KeyA`,`KeyS`,`KeyD`,`ArrowUp`,`ArrowDown`,`ShiftLeft`,`ShiftRight`,`Space`,`KeyE`,`KeyQ`,`ControlLeft`,`ControlRight`]);function ct(e){let{surface:t,movePad:n,thumb:r,lifts:i}=e,a=new Set,o=matchMedia(`(pointer: coarse)`),s=o.matches,c=new Map,l=null,u=0,d=null,f=0,p=0,m=0;function h(){d=null,f=0,p=0,r.style.transform=``}function g(){a.clear(),l=null,c.clear(),u=0,m=0,h()}function _(){if(c.size!==2)return 0;let[e,t]=c.values();return Math.max(8,Math.hypot(e.x-t.x,e.y-t.y))}function v(t){t!==s&&(s=t,e.onDeviceChange())}function y(e){let t=n.getBoundingClientRect(),i=t.width*.31,a=(e.clientX-t.left-t.width/2)/i,o=(e.clientY-t.top-t.height/2)/i,s=Math.hypot(a,o),c=Math.max(1,s);f=s>.08?a/c:0,p=s>.08?-o/c:0,r.style.transform=`translate(${f*i}px, ${-p*i}px)`}o.addEventListener(`change`,e=>v(e.matches)),window.addEventListener(`pointerdown`,e=>{e.pointerType===`touch`?v(!0):e.pointerType===`mouse`&&!o.matches&&v(!1)}),t.addEventListener(`pointerdown`,e=>{if(e.button!==0)return;let n={x:e.clientX,y:e.clientY};if(e.pointerType===`touch`)l=c.size===0?{id:e.pointerId,...n}:null,c.set(e.pointerId,n),u=_();else{if(l||c.size>0)return;l={id:e.pointerId,...n}}t.setPointerCapture(e.pointerId)}),t.addEventListener(`pointermove`,t=>{let n=c.get(t.pointerId);if(!n)return;n.x=t.clientX,n.y=t.clientY;let r=_();r&&u&&e.mode()!==`overview`&&e.zoom(r/u),u=r});for(let r of[`pointerup`,`pointercancel`,`lostpointercapture`])t.addEventListener(r,t=>{if(c.delete(t.pointerId)&&(u=_()),t.pointerId!==l?.id)return;let n=t.clientX-l.x,i=t.clientY-l.y;l=null,r===`pointerup`&&Math.abs(n)>=36&&Math.abs(n)>Math.abs(i)*1.2&&e.turn(n<0?-1:1)}),n.addEventListener(r,e=>{e.pointerId===d&&h()});t.addEventListener(`wheel`,n=>{if(e.mode()===`overview`||!n.deltaY)return;n.preventDefault();let r=n.deltaMode===WheelEvent.DOM_DELTA_LINE?16:n.deltaMode===WheelEvent.DOM_DELTA_PAGE?t.clientHeight:1,i=Math.max(-160,Math.min(160,n.deltaY*r));e.zoom(Math.exp(-i*.002))},{passive:!1}),n.addEventListener(`pointerdown`,e=>{d===null&&(d=e.pointerId,n.setPointerCapture(e.pointerId),y(e))}),n.addEventListener(`pointermove`,e=>{e.pointerId===d&&y(e)});for(let e of i.querySelectorAll(`button`)){let t=Number(e.dataset.lift),n=null;e.addEventListener(`pointerdown`,r=>{n===null&&(n=r.pointerId,e.setPointerCapture(r.pointerId),m=t)});for(let r of[`pointerup`,`pointercancel`,`lostpointercapture`])e.addEventListener(r,e=>{e.pointerId===n&&(n=null,m===t&&(m=0))})}window.addEventListener(`keydown`,t=>{t.target instanceof HTMLElement&&t.target.closest(`input, select, textarea, button, a, [contenteditable]`)||(t.ctrlKey||t.metaKey||t.altKey)&&t.code!==`ControlLeft`&&t.code!==`ControlRight`||(t.code===`ArrowLeft`||t.code===`ArrowRight`?(t.preventDefault(),t.repeat||e.turn(t.code===`ArrowLeft`?-1:1)):(st.has(t.code)&&e.mode()!==`overview`&&(t.preventDefault(),a.add(t.code)),t.repeat||(t.code===`Digit1`&&e.setMode(`overview`),t.code===`Digit2`&&e.setMode(`walk`),t.code===`Digit3`&&e.setMode(`fly`),t.code===`KeyR`&&e.reset())))}),window.addEventListener(`keyup`,e=>a.delete(e.code)),window.addEventListener(`blur`,g),document.addEventListener(`visibilitychange`,()=>{document.hidden&&g()});let b=(...e)=>e.some(e=>a.has(e));return{get touch(){return s},get side(){return Number(b(`KeyD`))-Number(b(`KeyA`))+f},get ahead(){return Number(b(`KeyW`,`ArrowUp`))-Number(b(`KeyS`,`ArrowDown`))+p},get lift(){return Number(b(`Space`,`KeyE`))-Number(b(`ControlLeft`,`ControlRight`,`KeyQ`))+m},get running(){return b(`ShiftLeft`,`ShiftRight`)},get jumping(){return b(`Space`)},releaseAll:g}}var lt=new e(0,-1,0),ut=.27,dt=1.8,ft=[-.27,0,ut];function pt(e,t,n){let r=!1;for(let i=0,a=e.length-1;i<e.length;a=i++){let[o,s]=e[i],[c,l]=e[a];s>n!=l>n&&t<(c-o)*(n-s)/(l-s)+o&&(r=!r)}return r}function mt(t){let n=[],r=new p;return t.traverse(t=>{if(!(t instanceof m))return;let i=t.geometry,o=i.getAttribute(`position`);if(!o)return;let s=i.index,c=s?.count??o.count,l=t instanceof a?t.count:1,u=t=>new e().fromBufferAttribute(o,s?.getX(t)??t).applyMatrix4(r);for(let e=0;e<l;e++){t instanceof a?(t.getMatrixAt(e,r),r.premultiply(t.matrixWorld)):r.copy(t.matrixWorld);for(let e=0;e+2<c;e+=3){let t=new T(u(e),u(e+1),u(e+2));n.push({triangle:t,bounds:new M().setFromPoints([t.a,t.b,t.c])})}}}),n}function ht(t,n){t.updateWorldMatrix(!0,!0);let r=new M().setFromObject(t),i=mt(t),o=new x,s=new e,c=new e,l=new p,u=new ie,d=new M;function f(e){return!e.face||!(e.object instanceof m)||(Array.isArray(e.object.material)?e.object.material[e.face.materialIndex]:e.object.material)?.name!==`walkable`?!1:(e.object instanceof a&&e.instanceId!==void 0?(e.object.getMatrixAt(e.instanceId,l),l.premultiply(e.object.matrixWorld)):l.copy(e.object.matrixWorld),c.copy(e.face.normal).applyNormalMatrix(u.getNormalMatrix(l)).normalize(),c.y>=.707)}function h(e,i){if(!pt(n,e,i))return;o.set(s.set(e,r.max.y+1,i),lt);let a=o.intersectObject(t,!0)[0];return a&&f(a)?a.point.y:void 0}return t=>{let{x:n,y:r,z:a}=t;if(![n,r,a].every(Number.isFinite))return;let o=h(n,a);if(!(o===void 0||r<o+.3)){for(let e of ft)for(let t of ft){if(e===0&&t===0)continue;let r=h(n+e,a+t);if(r===void 0||Math.abs(r-o)>.18)return}if(d.min.set(n-ut,o+.05,a-ut),d.max.set(n+ut,o+dt,a+ut),!i.some(({bounds:e,triangle:t})=>e.intersectsBox(d)&&d.intersectsTriangle(t)))return new e(n,o+.035,a)}}}var gt=new e(0,1,0),_t=.18;function vt(e,t){t.set(0,0);for(let n of e){let e=n.gamepad;if(!e||e.axes.length<2)continue;let r=e.mapping===`xr-standard`&&e.axes.length>=4?2:0,i=e.axes[r],a=e.axes[r+1];if(!(!Number.isFinite(i)||!Number.isFinite(a)||Math.hypot(i,a)<_t)){if(n.handedness===`left`)return t.set(i,a);t.lengthSq()===0&&t.set(i,a)}}return t}function yt(){let t=new S,n=new e,r=new e,i=new _;return(e,a,o,s)=>{let{x:c,y:l,z:u,w:d}=e;return t.set(c,l,u,d),n.set(0,0,-1).applyQuaternion(t).applyAxisAngle(gt,a),n.y=0,n.lengthSq()<1e-4&&n.set(-Math.sin(a),0,-Math.cos(a)),n.normalize(),r.crossVectors(n,gt),vt(o,i),s.copy(r).multiplyScalar(i.x).addScaledVector(n,-i.y).clampLength(0,1)}}var bt=1.64;function xt(e){let t=new ge(0,0,0,`YXZ`);return(n,r,i)=>{e.position.copy(n),e.position.y+=bt,e.quaternion.setFromEuler(t.set(i,r,0))}}var St=`modulepreload`,Ct=function(e,t){return new URL(e,t).href},wt={},Tt=function(e){return e.pathname.endsWith(`.css`)},Et=function(e,t,n){if(t in e)return e[t];let r=n();if(!r){e[t]=void 0;return}let i=r.then(()=>{e[t]=void 0},n=>{throw e[t]=void 0,n});return e[t]=i,i},Dt=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e,i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}function s(e){return import.meta.resolve?new URL(import.meta.resolve(e)):new URL(e,import.meta.url)}r=o(t.map(t=>{t=Ct(t,n);let r=s(t),i=Tt(r);return Et(wt,r.href,()=>{if(e===void 0){e={all:new Set,styles:new Set};let t=document.getElementsByTagName(`link`);for(let n=t.length-1;n>=0;n--){let r=t[n];e.all.add(r.href),r.rel===`stylesheet`&&e.styles.add(r.href)}}if((i?e.styles:e.all).has(r.href))return;let t=document.createElement(`link`);if(t.rel=i?`stylesheet`:St,i||(t.as=`script`),t.crossOrigin=``,t.href=r.href,a&&t.setAttribute(`nonce`,a),document.head.appendChild(t),i)return new Promise((e,n)=>{t.addEventListener(`load`,e),t.addEventListener(`error`,()=>n(Error(`Unable to preload CSS for ${r}`)))})})}).filter(e=>e!==void 0))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})},P=e=>document.getElementById(e),Ot=P(`app`),F=P(`viewport`),kt=P(`notice`),At=P(`about`),jt=P(`about-panel`),Mt=P(`fullscreen`),Nt=P(`vr`),Pt=P(`location`),Ft=[...Ot.querySelectorAll(`.mode-controls [data-mode]`)],It=P(`direction-controls`),Lt=[...It.querySelectorAll(`[data-heading]`)],Rt=[...It.querySelectorAll(`[data-turn]`)],zt=P(`reset`),Bt=P(`controls-hint`),Vt=P(`diagnostics`),Ht=new URLSearchParams(window.location.search),Ut=Ht.has(`debug`),Wt=!Ut||Ht.get(`occlusion`)!==`0`,Gt=!Ut||Ht.get(`camera`)!==`0`,Kt=!Ut||Ht.get(`reflection`)!==`0`,qt=[{id:`north`,label:`北`,yaw:0},{id:`east`,label:`东`,yaw:-Math.PI/2},{id:`south`,label:`南`,yaw:Math.PI},{id:`west`,label:`西`,yaw:Math.PI/2}],Jt=new e,Yt=new e,Xt=new e,I=new e,L=new e,R=new e,Zt=yt(),Qt=new e,$t=new e,z=`overview`,B,V,en,H,tn,nn,rn,U=0,W=0,an=0,on=1,G=!1,sn=!1,cn,K,ln=``,un,q=new d;q.background=new N(`#b9d5e7`);var J=new f(57,1,.07,1600),Y=new r;Y.add(J),q.add(Y);var dn=xt(J),X=new re(J,F);X.enabled=!1,X.enableDamping=!0,X.dampingFactor=.095,X.maxPolarAngle=Math.PI/2-.035,X.minDistance=5,X.zoomSpeed=.95,X.enableRotate=!1,X.enablePan=!0;function fn(e){G&&!K&&e!==U&&(U=e,z===`overview`?yn():$(),_n())}function pn(e){fn(t.euclideanModulo(U+e,qt.length))}function mn(){return(B?.manifest.northYaw??0)+qt[U].yaw}function hn(){J.zoom=z===`overview`?1:on,J.updateProjectionMatrix()}function gn(e){!G||z===`overview`||K||!Number.isFinite(e)||e<=0||(on=t.clamp(on*e,.78,2.5),hn())}var Z=ct({surface:F,movePad:P(`move-pad`),thumb:P(`move-thumb`),lifts:P(`vertical-buttons`),mode:()=>z,setMode:Tn,reset:wn,turn:pn,zoom:gn,onDeviceChange:Q});function _n(){for(let e of Lt)e.setAttribute(`aria-pressed`,String(e.dataset.heading===qt[U].id))}function Q(){let e=!!(B&&G);Ot.dataset.mode=z;for(let t of Ft){let n=t.dataset.mode;t.disabled=!e||n===`walk`&&!V,t.setAttribute(`aria-pressed`,String(z===n))}zt.disabled=!e,It.hidden=!e||!!K,_n(),P(`reticle`).hidden=!e||z===`overview`||Z.touch,P(`move-pad`).hidden=!e||z===`overview`||!Z.touch,P(`vertical-buttons`).hidden=!e||z!==`fly`||!Z.touch,Bt.hidden=!e,e&&(Bt.textContent=ln||(Z.touch?{overview:`单指左右滑动转向 · 双指缩放和平移`,walk:`摇杆移动 · 单指左右滑动转向 · 双指缩放`,fly:`摇杆移动 · 单指左右滑动转向 · 双指缩放`}:{overview:`← → 转向 · 滚轮缩放 · 右键拖动平移`,walk:`WASD 移动 · ← → 转向 · 滚轮缩放`,fly:`WASD 移动 · E 上升 · Q 下降 · ← → 转向`})[z])}var vn=e=>Math.max(1,1.05/e);function yn(){let e=mn(),t=Math.hypot(J.position.x-X.target.x,J.position.z-X.target.z);J.position.x=X.target.x+Math.sin(e)*t,J.position.z=X.target.z+Math.cos(e)*t,X.update()}function bn(){if(!B)return;let e=B.manifest.overview,t=Math.max(B.size.x,B.size.z,B.size.y,12);e?(X.target.fromArray(e.target),J.position.fromArray(e.position)):(X.target.copy(B.center),J.position.copy(B.center).add(Qt.set(t*.55,t*.65,t*.68))),J.position.copy($t.subVectors(J.position,X.target).multiplyScalar(vn(J.aspect)).add(X.target)),X.minDistance=Math.max(3,t*.025),X.maxDistance=Math.max(t*3,J.position.distanceTo(X.target)*1.6),yn()}function $(){let e=z===`walk`?V?.position:L;e&&z!==`overview`&&!K&&dn(e,mn(),W)}function xn(e,n=0){let r=B?.manifest.northYaw??0,i=(e.yaw??r)-r;U=t.euclideanModulo(Math.round(-i/(Math.PI/2)),qt.length),W=e.pitch??n}function Sn(e){Qt.fromArray(e.position),V?.teleport(Qt),I.copy(Qt),xn(e),an=W}function Cn(){window.clearTimeout(un),ln=``}function wn(){B&&!K&&(Cn(),Z.releaseAll(),on=1,hn(),z===`overview`?(xn(B.manifest.spawn),bn(),Q()):(Sn(B.manifest.spawn),z===`fly`&&(L.fromArray(B.manifest.spawn.position),L.y+=Math.max(10,B.size.y*.6),W=-.2),$(),Q()))}function Tn(e,t){if(!G||!B||K||e===`walk`&&!V||e===z&&!t)return;let n=z;Cn();let r;n===`fly`&&e===`walk`&&!t&&V&&(r=B.manifest.collisionFromModels?V.findLanding(L):en?.(Qt.copy(L).addScaledVector(J.up,bt)),!r&&(B.manifest.collisionFromModels||en))?(ln=`脚下没有足够的落脚空间`,un=window.setTimeout(()=>{ln=``,Q()},3e3),Q()):(z===`walk`&&(an=W),Z.releaseAll(),e===`fly`&&(n===`walk`&&V?L.copy(V.position):(L.fromArray(B.manifest.spawn.position),L.y+=Math.max(10,B.size.y*.6)),W=-.22),z=e,X.enabled=e===`overview`,hn(),e===`overview`&&bn(),e===`walk`&&V&&(t?Sn(t):r?(V.teleport(r),I.copy(r),W=an):(V.teleport(I),W=an)),$(),Q())}function En(){let e=B?.manifest.locations?.find(e=>e.id===Pt.value);e&&!K&&(V?Tn(`walk`,e):(Tn(`fly`),L.fromArray(e.position),L.y+=2,xn(e,-.12),$(),_n()),Pt.value=``,F.focus({preventScroll:!0}))}function Dn(){let e=F.clientWidth,t=F.clientHeight;if(!e||!t)return;let n=vn(J.aspect);if(J.aspect=e/t,J.updateProjectionMatrix(),B&&z===`overview`){let e=vn(J.aspect)/n;J.position.copy($t.subVectors(J.position,X.target).multiplyScalar(e).add(X.target)),X.maxDistance=Math.max(X.maxDistance,J.position.distanceTo(X.target)*1.6),X.update()}H&&!K&&(H.setPixelRatio(Math.min(devicePixelRatio,Z.touch?1.5:2)),H.setSize(e,t,!1))}function On(e){let n=mn();if(Jt.set(-Math.sin(n),0,-Math.cos(n)),Yt.set(Math.cos(n),0,-Math.sin(n)),Xt.copy(Jt).multiplyScalar(Z.ahead).addScaledVector(Yt,Z.side),Xt.clampLength(0,1),z===`walk`&&V){V.update(e,Xt,Z.running,Z.jumping),V.grounded&&I.copy(V.position),B&&V.position.y<B.bounds.min.y-8&&V.teleport(I),$();return}if(!B)return;let r=Z.running?22:9,i=t.clamp(Z.lift,-1,1),a=B.manifest.collisionFromModels&&V,o=a?0:Math.max(25,Math.max(B.size.x,B.size.z)*.4);R.copy(L).addScaledVector(Xt,e*r),a||(R.x=t.clamp(R.x,B.bounds.min.x-o,B.bounds.max.x+o),R.z=t.clamp(R.z,B.bounds.min.z-o,B.bounds.max.z+o)),L.copy(V?.constrainFlight(L,R)??R),R.copy(L),R.y+=i*r*e,a||(R.y=t.clamp(R.y,B.bounds.min.y+.02,B.bounds.max.y+o*2)),L.copy(V?.constrainFlight(L,R)??R),$()}function kn(e,t){if(!V||!K||!t)return;let n=H.xr.getReferenceSpace(),r=n&&t.getViewerPose(n);r&&(Zt(r.transform.orientation,Y.rotation.y,K.inputSources,Xt),V.update(e,Xt,!1,!1),V.grounded&&I.copy(V.position),B&&V.position.y<B.bounds.min.y-8&&V.teleport(I),Y.position.copy(V.position))}async function An(){if(navigator.xr&&V&&window.isSecureContext)try{if(!await navigator.xr.isSessionSupported(`immersive-vr`))return;Nt.hidden=!1}catch{}}async function jn(){if(V&&navigator.xr&&!K){Nt.disabled=!0;try{let e=await navigator.xr.requestSession(`immersive-vr`,{requiredFeatures:[`local-floor`]});Tn(`walk`),K=e,Z.releaseAll(),Q(),Y.position.copy(V.position),Y.rotation.y=mn(),J.position.set(0,0,0),J.quaternion.identity(),e.addEventListener(`end`,()=>{K=void 0,Y.position.set(0,0,0),Y.rotation.y=0,$(),Nt.disabled=!1,Q(),queueMicrotask(Dn)},{once:!0}),await H.xr.setSession(e)}catch(e){K&&K.end().catch(()=>{}),Nt.disabled=!1,console.warn(`未能进入头显 VR`,e),Bt.textContent=`暂时无法进入头显，请检查浏览器的 VR 连接。`}}}function Mn(e,t){let n=Math.min(.1,cn===void 0?0:(e-cn)/1e3);cn=e,G&&(K?kn(n,t):z===`overview`?X.update(n):On(n));let r=z===`walk`?V?.position:z===`fly`?L:void 0;if(tn?.update(z,r,sn,n),nn?.update(J,e,G&&z===`walk`),G&&z!==`overview`&&!Z.touch&&!H.xr.isPresenting&&rn?rn.render(q,J):H.render(q,J),sn||(sn=!0,kt.hidden=!0),Ut){let e=J.position.toArray().map(e=>e.toFixed(2)).join(`, `),{calls:t,triangles:n}=H.info.render,i=(z===`overview`?V?.position:r)?.toArray().map(e=>e.toFixed(2)).join(`, `)??`—`,a=qt[U];Vt.textContent=`${z}${z===`walk`&&V?.grounded?` grounded`:``}\n${e}\n${t} draws · ${n.toLocaleString()} tris\nheading ${mn().toFixed(3)}\nfeet ${i}\nfacing ${a.label}\nzoom ${J.zoom.toFixed(3)}\nmirror ${nn?.active?`on`:`off`} · ${nn?.passes??0} captures`}}function Nn(e){let t=e??jt.hidden;jt.hidden=!t,At.setAttribute(`aria-expanded`,String(t))}function Pn(e,t){if(P(`campus-title`).textContent=e.title,document.title=`${e.title} · 3D 校园`,P(`campus-status`).textContent=e.status??`3D 校园`,P(`description`).textContent=e.description??e.status??`可从总览、飞行和步行视角查看校园场景。`,e.evidenceUrl){let n=new URL(e.evidenceUrl,t);if(n.protocol===`https:`||n.protocol===`http:`){let e=P(`evidence`);e.href=n.href,e.hidden=!1}}for(let t of e.locations??[])Pt.add(new Option(t.label,t.id));P(`location-wrap`).hidden=Pt.options.length<2}async function Fn(){try{let t=Dt(()=>import(`./player-DKGjlMNw.js`).then(async e=>(await e.preparePlayerPhysics(),e)),__vite__mapDeps([0,1,2]),import.meta.url).catch(e=>({loadError:e}));if(H=new de({antialias:!0,powerPreference:`high-performance`,logarithmicDepthBuffer:!0}),H.outputColorSpace=s,H.toneMapping=6,H.toneMappingExposure=1.04,H.shadowMap.enabled=!0,H.shadowMap.autoUpdate=!1,H.shadowMap.type=1,H.xr.enabled=!0,H.xr.setReferenceSpaceType(`local-floor`),!Z.touch&&Wt&&(rn=ot(H,Gt)),F.tabIndex=0,F.appendChild(H.domElement),new ResizeObserver(Dn).observe(F),Dn(),Vt.hidden=!Ut,Mt.hidden=!document.fullscreenEnabled,B=await Ee(),q.add(B.visuals),tn=tt(q,J,H,B,Z.touch),nn=je(H,q,B.visuals,Kt&&!Z.touch),Pn(B.manifest,B.manifestURL),B.collision.children.length)try{let n=await t;if(`loadError`in n)throw n.loadError;V=await n.createPlayerController(B.collision,new e().fromArray(B.manifest.spawn.position),{object:new r,updateMotion(){},dispose(){}},B.manifest.collisionFromModels),!B.manifest.collisionFromModels&&B.manifest.landingBoundary&&(en=ht(B.collision,B.manifest.landingBoundary))}catch(e){console.warn(`校园碰撞载入失败`,e),P(`description`).append(` 本次载入未启用步行。`)}!V&&B.collision.children.length===0&&P(`description`).append(` 当前场景支持总览与飞行。`),Sn(B.manifest.spawn),G=!0,V?Tn(`walk`):(bn(),Q()),H.setAnimationLoop(Mn),An()}catch(e){console.error(e),P(`loading-mark`).hidden=!0,P(`notice-title`).textContent=`场景未能加载`,P(`notice-detail`).textContent=e instanceof Error?e.message:`请重新加载页面。`,P(`retry`).hidden=!1}}for(let e of Ft)e.addEventListener(`click`,()=>{Tn(e.dataset.mode),F.focus({preventScroll:!0})});for(let e of Lt)e.addEventListener(`click`,()=>{let t=qt.findIndex(t=>t.id===e.dataset.heading);t!==-1&&fn(t),F.focus({preventScroll:!0})});for(let e of Rt)e.addEventListener(`click`,()=>{pn(e.dataset.turn===`left`?-1:1),F.focus({preventScroll:!0})});zt.addEventListener(`click`,()=>{wn(),F.focus({preventScroll:!0})}),At.addEventListener(`click`,()=>Nn()),document.addEventListener(`keydown`,e=>{e.key===`Escape`&&!jt.hidden&&(Nn(!1),At.focus())}),Mt.addEventListener(`click`,async()=>{try{document.fullscreenElement?await document.exitFullscreen():await Ot.requestFullscreen()}catch{}}),document.addEventListener(`fullscreenchange`,()=>{Mt.lastChild.textContent=document.fullscreenElement?`退出全屏`:`全屏`}),Nt.addEventListener(`click`,()=>void jn()),Pt.addEventListener(`change`,En),P(`retry`).addEventListener(`click`,()=>window.location.reload()),window.addEventListener(`pagehide`,e=>{e.persisted||(V?.dispose(),tn?.dispose(),nn?.dispose(),rn?.dispose(),X.dispose(),H&&(H.setAnimationLoop(null),H.dispose()))}),Fn();