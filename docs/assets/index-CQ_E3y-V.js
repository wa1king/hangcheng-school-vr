const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./player-D_21T33K.js","./three-runtime-BY9apgoe.js","./physics-runtime-BR_-CEU_.js"])))=>i.map(i=>d[i]);
import{$ as e,A as t,B as n,C as r,D as i,E as a,F as o,G as s,H as c,I as l,J as u,K as d,L as f,M as p,N as m,O as h,P as g,Q as _,R as v,S as y,T as b,U as x,V as S,W as C,X as w,Y as T,Z as E,_ as D,a as O,b as k,c as A,et as j,f as M,g as ee,h as te,i as ne,j as re,k as ie,l as ae,m as N,n as oe,o as se,p as ce,q as le,r as ue,s as de,t as fe,tt as pe,u as me,v as he,w as ge,x as _e,y as ve,z as ye}from"./three-runtime-BY9apgoe.js";(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var be=new URL(`./scene/scene.json`,window.location.href),xe=e=>Array.isArray(e)&&e.length===3&&e.every(Number.isFinite);function Se(e){return e&&xe(e.position)&&(e.yaw===void 0||Number.isFinite(e.yaw))&&(e.pitch===void 0||Number.isFinite(e.pitch)&&Math.abs(e.pitch)<=1.49)}function Ce(e){let t=new URL(e,be);if(t.origin!==be.origin||!t.pathname.toLowerCase().endsWith(`.glb`))throw Error(`模型必须是项目内的 GLB 文件。`);return t.href}function we(e,t,n,r=!1){e.updateWorldMatrix(!0,!0);let i=e=>{if(!(e instanceof m))return;let r=n(e);if(!r)return;let i=e.clone(!1);i.geometry=r,i.matrixAutoUpdate=!1,i.matrix.copy(e.matrixWorld),i.visible=!0,t.add(i)};r?e.traverseVisible(i):e.traverse(i)}function Te(e){for(;e;){let t=e.name.toUpperCase();if(t===`COLLISION`||t.startsWith(`COLLISION_`))return!0;e=e.parent}return!1}function Ee(e){if(Te(e))return;let t=e=>e&&!e.name.startsWith(`decal-`),n=e.geometry;if(!Array.isArray(e.material))return t(e.material)?n:void 0;let r=e.material,i=n.groups.filter(e=>t(r[e.materialIndex??0]));if(!i.length)return;if(i.length===n.groups.length)return n;let a=new Uint32Array(i.reduce((e,t)=>e+t.count,0)),o=0;for(let e of i)for(let t=e.start;t<e.start+e.count;t+=1)a[o++]=n.index?n.index.getX(t):t;return new ce().setAttribute(`position`,n.getAttribute(`position`)).setIndex(new M(a,1))}async function De(){let t=await fetch(be,{cache:`no-cache`});if(!t.ok||!t.headers.get(`content-type`)?.includes(`json`))throw Error(`还没有找到校园场景文件。`);let n=await t.json();if(typeof n.title!=`string`||!Array.isArray(n.models)||!n.models.length||!Se(n.spawn))throw Error(`校园场景缺少名称、模型或有效起点。`);if(n.overview&&(!xe(n.overview.position)||!xe(n.overview.target)))throw Error(`校园总览机位无效。`);if(n.collisionFromModels!==void 0&&typeof n.collisionFromModels!=`boolean`)throw Error(`校园碰撞来源无效。`);if(n.landingBoundary&&(!Array.isArray(n.landingBoundary)||n.landingBoundary.length<3||!n.landingBoundary.every(e=>Array.isArray(e)&&e.length===2&&e.every(Number.isFinite))))throw Error(`校园可落地区域数据无效。`);for(let e of n.models)if(typeof e?.url!=`string`||e.position!==void 0&&!xe(e.position)||e.rotationY!==void 0&&!Number.isFinite(e.rotationY)||e.surroundings!==void 0&&typeof e.surroundings!=`boolean`||e.scale!==void 0&&(!Number.isFinite(e.scale)||e.scale<=0))throw Error(`校园模型的文件路径或坐标无效。`);if(n.locations&&(!Array.isArray(n.locations)||!n.locations.every(e=>Se(e)&&typeof e.id==`string`&&typeof e.label==`string`)))throw Error(`校园地点数据无效。`);let i=new ue().setMeshoptDecoder(oe),a=new r,o=new r,[s,c]=await Promise.all([Promise.all(n.models.map(e=>i.loadAsync(Ce(e.url)))),!n.collisionFromModels&&n.collisionUrl?i.loadAsync(Ce(n.collisionUrl)):void 0]);for(let[e,t]of s.entries()){let i=n.models[e],o=new r;i.position&&o.position.fromArray(i.position),o.rotation.y=i.rotationY??0,o.scale.setScalar(i.scale??1),o.add(t.scene),i.surroundings&&o.traverse(e=>{e.userData.surroundings=!0,e.userData.shadow=!1}),a.add(o)}n.collisionFromModels?we(a,o,Ee,!0):c?we(c.scene,o,e=>e.userData.collision===!1?void 0:e.geometry):we(a,o,e=>Te(e)?e.geometry:void 0);let l=new me;if(a.updateWorldMatrix(!0,!0),a.traverse(e=>{if(Te(e)){e.visible=!1;return}if(!(e instanceof m))return;let t=Array.isArray(e.material)?e.material:[e.material];e.castShadow=e.userData.shadow!==!1&&t.some(e=>!e.transparent&&(!e.name.startsWith(`decal-`)||e.alphaTest>0)),e.receiveShadow=e.userData.shadow!==!1,e.userData.surroundings||(e.geometry.boundingBox||e.geometry.computeBoundingBox(),e.geometry.boundingBox&&l.union(e.geometry.boundingBox.clone().applyMatrix4(e.matrixWorld)))}),l.isEmpty())throw Error(`校园模型中没有可见网格。`);return{manifest:n,visuals:a,collision:o,bounds:l,size:l.getSize(new e),center:l.getCenter(new e),manifestURL:be}}var Oe=-.02,ke=-24*Math.PI/180,Ae=new Set([`plaza`,`walk`,`courtyard-paving`,`decal-brickline`]),je=`
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
`;function Me(t,n,r,i){let a=i&&t.extensions.has(`EXT_color_buffer_float`),s=new pe(1,1,{type:a?ge:w,minFilter:h,generateMipmaps:!0});s.texture.name=`Campus paving reflection`;let c={tCampusMirror:{value:null},uCampusMirrorProjection:{value:new p},uCampusMirrorActive:{value:0},uCampusGroundLevel:{value:Oe},uCampusSiteRotation:{value:new _(Math.cos(ke),Math.sin(ke))}},l=new Set;r.traverse(e=>{if(!(e instanceof m))return;let t=Array.isArray(e.material)?e.material:[e.material];for(let e of t){if(!(e instanceof o)||l.has(e)||!Ae.has(e.name))continue;l.add(e);let t=e.onBeforeCompile.bind(e),n=e.customProgramCacheKey();e.customProgramCacheKey=()=>`${n}|campus-ground-v1`,e.onBeforeCompile=(e,n)=>{t(e,n),Object.assign(e.uniforms,c),e.vertexShader=e.vertexShader.replace(`#include <common>`,`#include <common>
varying vec3 vCampusMirrorWorld;`).replace(`#include <project_vertex>`,`
            #include <project_vertex>
            vCampusMirrorWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;
          `),e.fragmentShader=e.fragmentShader.replace(`#include <common>`,`#include <common>\n${je}`).replace(`#include <metalnessmap_fragment>`,`
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
          `)},e.needsUpdate=!0}});let u=new v,d=new e,f=new e,g=new e(1/0,1/0,1/0),y=new e,b=new _,x=new _,S=new ye,C=new j,T=new j,E=new p().set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),D=-1/0,O=!0,k=0;function A(){c.uCampusMirrorActive.value=0,O=!0}return a&&t.domElement.addEventListener(`webglcontextrestored`,A),{get active(){return c.uCampusMirrorActive.value!==0},get passes(){return k},update(e,r,i){e.getWorldPosition(d),e.getWorldDirection(f);let o=c.uCampusSiteRotation.value.x,l=c.uCampusSiteRotation.value.y;if(x.set(o*d.x+l*d.z,-l*d.x+o*d.z),!a||!i||t.xr.isPresenting||f.y>.58||d.y<.35||d.y>4.2||x.x<-20||x.x>48||x.y<-32||x.y>78){A();return}if(t.shadowMap.needsUpdate){O=!0;return}t.getDrawingBufferSize(b);let p=Math.min(.43,576/Math.max(b.x,b.y)),m=Math.max(16,Math.round(b.x*p)),h=Math.max(16,Math.round(b.y*p)),_=s.width!==m||s.height!==h,v=g.distanceToSquared(d)>.022**2||y.dot(f)<.999993;if(!_&&(!O&&!v||r-D<38))return;_&&s.setSize(m,h),u.position.copy(d),u.position.y=2*Oe-d.y,u.up.setFromMatrixColumn(e.matrixWorld,1),u.up.y*=-1,f.y*=-1,u.lookAt(f.add(u.position)),u.updateMatrixWorld(!0),u.near=e.near,u.far=e.far,u.projectionMatrix.copy(e.projectionMatrix);let w=u.projectionMatrix.elements;S.normal.set(0,1,0),S.constant=.024,S.applyMatrix4(u.matrixWorldInverse),C.set(S.normal.x,S.normal.y,S.normal.z,S.constant),T.set((Math.sign(C.x)+w[8])/w[0],(Math.sign(C.y)+w[9])/w[5],-1,(1+w[10])/w[14]);let j=C.dot(T);if(Math.abs(j)<1e-5){c.uCampusMirrorActive.value=0;return}c.uCampusMirrorProjection.value.copy(E).multiply(u.projectionMatrix).multiply(u.matrixWorldInverse),C.multiplyScalar(2/j),w[2]=C.x,w[6]=C.y,w[10]=C.z+1,w[14]=C.w,u.projectionMatrixInverse.copy(u.projectionMatrix).invert();let M=t.getRenderTarget(),ee=t.xr.enabled;c.uCampusMirrorActive.value=0,c.tCampusMirror.value=null;try{t.xr.enabled=!1,t.setRenderTarget(s),t.state.buffers.depth.setMask(!0),t.render(n,u)}finally{t.setRenderTarget(M),t.xr.enabled=ee}c.tCampusMirror.value=s.texture,c.uCampusMirrorActive.value=1,g.copy(d),e.getWorldDirection(y),D=r,O=!1,k+=1},dispose(){a&&t.domElement.removeEventListener(`webglcontextrestored`,A),s.dispose()}}}var Ne=new Map([[`plaza`,[`pavers`,.31,.26,.0022]],[`walk`,[`pavers`,.3,.22,.0022]],[`courtyard-paving`,[`pavers`,.33,.24,.0022]],[`teaching-floor`,[`pavers`,.16,.38,8e-4]],[`beige`,[`masonry`,.23,.06,.0012]],[`terra`,[`masonry`,.29,.08,.0014]],[`road`,[`scanned`,.35,.14,.0034]],[`teaching-wall`,[`scanned`,.1,.02,5e-4]],[`teaching-ceiling`,[`scanned`,.075,.02,5e-4]],[`soffit`,[`scanned`,.2,.04,.0012]],[`cream`,[`scanned`,.17,.05,9e-4]],[`reveal`,[`scanned`,.19,.04,8e-4]],[`entry-stone`,[`stone`,.22,.27,.0016]],[`entry-nosing`,[`stone`,.19,.2,.0012]],[`entry-traction`,[`stone`,.23,.12,.0022]],[`stair-stone`,[`stone`,.13,.27,.0011]],[`gallery-base-stone`,[`stone`,.17,.15,.001]],[`curb`,[`stone`,.27,.09,.0026]],[`decal-brickline`,[`stone`,.27,.19,.0015]],[`decal-paint-yellow`,[`paint`,.25,.12,0]],[`decal-sports_paint`,[`paint`,.14,.09,0]]]),Pe=`
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
`,Fe=`
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
`,Ie=`
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
`,Le=`
  #if defined(CAMPUS_SCANNED) && defined(USE_ROUGHNESSMAP)
    #undef vRoughnessMapUv
  #endif
  roughnessFactor = clamp(roughnessFactor + campusDirt * .38 + campusJoint * .10
    + campusPores * .045 - campusWear * uCampusSurfaceResponse.y, .22, .98);
`,Re=`
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
`;function ze(e){let t=Ne.get(e.name);if(!t)return;let[n,r,i,a]=t,o=e.onBeforeCompile,s=e.customProgramCacheKey();e.onBeforeCompile=(t,s)=>{o.call(e,t,s),t.uniforms.uCampusSurfaceResponse={value:[r,i,a]},t.vertexShader=t.vertexShader.replace(`#include <common>`,`#include <common>
varying vec3 vCampusSurface;`).replace(`#include <project_vertex>`,`
        #include <project_vertex>
        vCampusSurface = (modelMatrix * vec4(transformed, 1.0)).xyz;
      `),t.fragmentShader=t.fragmentShader.replace(`#include <common>`,`#include <common>\n#define CAMPUS_${n.toUpperCase()}\n${Pe}`).replace(`#include <map_fragment>`,`${Fe}\n#include <map_fragment>\n${Ie}`).replace(`#include <roughnessmap_fragment>`,`
        #if defined(CAMPUS_SCANNED) && defined(USE_ROUGHNESSMAP)
          vec2 campusRoughnessUv = vRoughnessMapUv + campusScanShift;
          #define vRoughnessMapUv campusRoughnessUv
        #endif
        #include <roughnessmap_fragment>
        ${Le}
      `).replace(`#include <normal_fragment_maps>`,`
        #if defined(CAMPUS_SCANNED) && defined(USE_NORMALMAP_TANGENTSPACE)
          vec2 campusNormalUv = vNormalMapUv + campusScanShift;
          #define vNormalMapUv campusNormalUv
        #endif
        #include <normal_fragment_maps>
        ${Re}
      `)},e.customProgramCacheKey=()=>`${s}|campus-surface-v2:${n}`}var Be=new e(-.69,.55,.47).normalize(),Ve=new N(`#bed0d9`),He=new N(`#568bc6`);function Ue(e){let t=new le({uniforms:{uZenith:{value:He},uHorizon:{value:Ve},uCloud:{value:new N(`#f3f5ef`)},uSun:{value:Be}},vertexShader:`
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
      }`,side:1,depthTest:!1,depthWrite:!1,toneMapped:!1}),n=new m(new u(e,32,16),t);return n.renderOrder=-1e3,n.frustumCulled=!1,n}function We(){let e=new Uint16Array(73728),n=new N(`#69725e`),r=new N(`#fff0d7`),a=he.toHalfFloat,o=new N;for(let i=0;i<96;i+=1){let s=((i+.5)/96-.5)*Math.PI,c=Math.sin(s),l=Math.cos(s);for(let u=0;u<192;u+=1){let d=((u+.5)/192-.5)*Math.PI*2,f=Math.max(0,l*(Math.cos(d)*Be.x+Math.sin(d)*Be.z)+c*Be.y);o.copy(Ve),c>=0?o.lerp(He,t.smoothstep(c,0,.92)):o.lerp(n,t.smoothstep(-c,0,.38));let p=t.smoothstep(Math.sin(d*3+s*13.1)*.62+Math.cos(d*7-s*25.1)*.25+Math.sin(d*11+s*37)*.13,.27,.86)*t.smoothstep(c,.06,.43);o.lerp(r,p*.37).multiplyScalar(.75+Math.max(0,c)*.53);let m=.53*f**21+2.6*f**225;o.r+=r.r*m,o.g+=r.g*m,o.b+=r.b*m;let h=(i*192+u)*4;e.set([a(o.r),a(o.g),a(o.b),a(1)],h)}}let s=new D(e,192,96,x,ge);return s.mapping=303,s.colorSpace=ie,s.minFilter=i,s.magFilter=i,s.needsUpdate=!0,s}var Ge=`
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
`;function Ke(t,n,r,i,a,s,c,l){let u=n.manifest.locations?.find(e=>e.id===`gate`),f=n.manifest.locations?.find(e=>e.id===`courtyard`);if(!u||!f||!t.extensions.has(`EXT_color_buffer_float`))return;let p=new e().fromArray(f.position).add(new e(0,5.2,0)),g=new e().fromArray(u.position).lerp(p,.41);g.y=u.position[1]+5.1;let v=[g,p],y=v.map(()=>new de(128,{type:ge,generateMipmaps:!0,minFilter:h})),b=new _,x=new _,S={uCampusEntryProbe:{value:y[0].texture},uCampusCourtProbe:{value:y[1].texture},uCampusEntryProbeCenter:{value:g},uCampusCourtProbeCenter:{value:p},uCampusProbeActive:{value:b}};function C(e,t,n){let r=e.onBeforeCompile,i=e.customProgramCacheKey(),a={value:t?.88:.65};e.onBeforeCompile=(t,i)=>{r.call(e,t,i),Object.assign(t.uniforms,S,{uCampusProbeStrength:a}),t.vertexShader=t.vertexShader.replace(`#include <common>`,`#include <common>
varying vec3 vCampusProbePosition;`).replace(`#include <project_vertex>`,`
          #include <project_vertex>
          vCampusProbePosition = (modelMatrix * vec4(transformed, 1.0)).xyz;
        `);let o=se.envmap_physical_pars_fragment.replace(`return envMapColor.rgb * envMapIntensity;`,`return campusProbeSample(reflectVec, roughness, envMapColor.rgb) * envMapIntensity;`);t.fragmentShader=t.fragmentShader.replace(`#include <common>`,`#include <common>\n${Ge}`).replace(`#include <envmap_physical_pars_fragment>`,o),n&&(t.fragmentShader=t.fragmentShader.replace(`#include <opaque_fragment>`,`
        float faceOn = clamp(dot(normalize(vViewPosition), normal), 0.0, 1.0);
        diffuseColor.a *= mix(0.67, 1.43, pow(1.0 - faceOn, 4.0));
        #include <opaque_fragment>
      `))},e.customProgramCacheKey=()=>`${i}|campus-probe-${n?`clear`:`opaque`}`}function w(){let e=new d;e.background=r.background,e.fog=r.fog;let u=n.visuals.clone(!0),f=new Map;u.traverse(e=>{if(!(e instanceof m))return;let t=e=>{let t=f.get(e);return t||(t=e.clone(),t.visible=e.visible&&!e.transparent,t instanceof o&&(t.envMap=null),f.set(e,t)),t};e.material=Array.isArray(e.material)?e.material.map(t):t(e.material)});let p=i.clone(),h=l.clone();h.shadow.mapSize.set(512,512),h.shadow.bias=-2e-4,h.shadow.normalBias=.04,Object.assign(h.shadow.camera,{left:-48,right:48,top:48,bottom:-48,near:55,far:185}),h.shadow.camera.updateProjectionMatrix(),e.add(u,p,a.clone(),s.clone(),c.clone(),h,h.target);let g=new te(.2,840,y[0]);return g.coordinateSystem=t.coordinateSystem,g.updateCoordinateSystem(),{prepare(){let n=t.getRenderTarget(),r=t.getActiveCubeFace(),i=t.getActiveMipmapLevel();try{return t.setRenderTarget(y[0]),t.compileAsync(e,g.children[0])}finally{t.setRenderTarget(n,r,i)}},renderFace(n,r){let i=y[n];if(r===0){let e=v[n];p.position.copy(e),h.target.position.copy(e),h.position.copy(e).addScaledVector(Be,120),g.position.copy(e),g.updateMatrixWorld(!0)}let a=r===g.children.length-1,o=t.getRenderTarget(),s=t.getActiveCubeFace(),c=t.getActiveMipmapLevel(),l=t.xr.enabled,u=t.shadowMap.autoUpdate,d=t.shadowMap.needsUpdate;try{t.xr.enabled=!1,t.shadowMap.autoUpdate=!1,t.shadowMap.needsUpdate=r===0,i.texture.generateMipmaps=a,t.setRenderTarget(i,r),t.state.buffers.depth.setMask(!0),t.render(e,g.children[r]),a&&x.setComponent(n,1)}finally{t.setRenderTarget(o,s,c),t.xr.enabled=l,t.shadowMap.autoUpdate=u,t.shadowMap.needsUpdate=d}return a},dispose(){h.shadow.dispose();for(let e of f.values())e.dispose()}}}let T,E=0,D=0,O=0,k=!1,A;function j(){A?.(),A=void 0,T?.dispose(),T=void 0,O=0,k=!1,E=0,D=0,b.set(0,0),x.set(0,0)}t.domElement.addEventListener(`webglcontextrestored`,j);function M(e){if(b.copy(x).multiplyScalar(+!t.xr.isPresenting),D>=y.length||A||k||!e||t.xr.isPresenting)return;let n=performance.now();if(O===0&&(O=n+1050),n<O)return;let r=()=>{if(A=void 0,!(document.hidden||t.xr.isPresenting||t.getContext().isContextLost())){try{if(!T&&(T=w(),t.extensions.has(`KHR_parallel_shader_compile`))){let e=T;k=!0,e.prepare().catch(e=>console.warn(`校园反射材质预编译未完成`,e)).finally(()=>{T===e&&(k=!1)});return}T.renderFace(D,E++)&&(E=0,D+=1)}catch(e){k=!1,console.warn(`校园局部反射未能生成`,e),E=0,D+=1}O=performance.now()+45,D>=y.length&&(T?.dispose(),T=void 0)}};if(typeof window.requestIdleCallback==`function`){let e=window.requestIdleCallback(r,{timeout:250});A=()=>window.cancelIdleCallback(e)}else{let e=window.setTimeout(r,0);A=()=>window.clearTimeout(e)}}return{register:C,update:M,dispose(){A?.(),T?.dispose(),t.domElement.removeEventListener(`webglcontextrestored`,j);for(let e of y)e.dispose()}}}function qe(t,n){let r=t.geometry,i=r.getAttribute(`position`);if(!i)return;let a=new e,o=[],s=new Map,c=[],l=[],u=[],d=e=>{for(;l[e]!==e;)l[e]=l[l[e]],e=l[e];return e};for(let e=0;e<i.count;e+=1){a.fromBufferAttribute(i,e).applyMatrix4(t.matrixWorld);let n=`${Math.round(a.x*500)},${Math.round(a.y*500)},${Math.round(a.z*500)}`,r=s.get(n);r===void 0&&(r=u.length,s.set(n,r),u.push(a.clone()),l.push(r)),c[e]=r}let f=r.index,p=f?.count??i.count;for(let e=0;e+2<p;e+=3){let t=d(c[f?.getX(e)??e]),n=d(c[f?.getX(e+1)??e+1]),r=d(c[f?.getX(e+2)??e+2]);l[n]=t,l[r]=t}for(let[e,t]of u.entries()){let n=d(e);(o[n]??=new me).expandByPoint(t)}for(let t of o){if(!t||t.getSize(a).lengthSq()<.14**2)continue;let r=t.getCenter(new e);r.y=t.min.y-.045,n.push(r)}}function Je(){let e=new Uint8Array(4096);for(let n=0;n<32;n+=1)for(let r=0;r<32;r+=1){let i=Math.hypot((r+.5)/32-.5,(n+.5)/32-.5)*2,a=Math.round(255*(1-t.smoothstep(i,.02,.97))**1.55),o=(n*32+r)*4;e.set([a,a,a,255],o)}let r=new D(e,32,32);r.minFilter=i,r.magFilter=i,r.needsUpdate=!0;let a=new g({color:`#29242a`,alphaMap:r,transparent:!0,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-1}),o=new n(1,1);o.rotateX(-Math.PI/2);let s=new m(o,a);return s.renderOrder=1,s.visible=!1,s}function Ye(r,i,a,s,c){let l=Math.max(s.size.x,s.size.z,30);r.fog=new y(Ve,l*.46,l*2.75),i.far=Math.max(600,l*8),i.updateProjectionMatrix();let u=Ue(i.far*.8),d=Math.max(3e3,l*16),f=new m(new n(d,d),new o({color:`#7f8f68`,roughness:1}));f.rotation.x=-Math.PI/2,f.position.set(s.center.x,s.bounds.min.y-.36,s.center.z);let p=new b(`#dbeaff`,`#c7beaa`,.95),h=new ae(`#eae6dc`,.14),g=new k(`#fff0d7`,3.71),_=Be.clone().multiplyScalar(l*1.3);g.castShadow=!0;let v=c?1024:2048;g.shadow.mapSize.set(v,v),g.shadow.intensity=.94,g.shadow.radius=2;let x=Je(),C=We(),w=[],T=[new S(`#fff0d8`,0,5.2,2),new S(`#fff0d8`,0,5.2,2)];r.add(u,f,p,h,g,g.target,x,...T);let E=new URLSearchParams(window.location.search),D=!c&&!(E.has(`debug`)&&E.get(`probe`)===`0`)?Ke(a,s,r,u,f,p,h,g):void 0;s.manifest.collisionFromModels&&s.collision.add(f.clone()),s.visuals.updateMatrixWorld(!0);let O=new Set;s.visuals.traverse(e=>{if(!(e instanceof m))return;let t=Array.isArray(e.material)?e.material:[e.material];t.every(e=>e.name===`glass-clear`)&&(e.castShadow=!1),t.every(e=>e.name===`teaching-lamp`)&&qe(e,w);for(let e of t)e instanceof o&&!O.has(e)&&(O.add(e),ze(e),e.name===`teaching-lamp`?(e.emissive.set(`#fff1db`),e.emissiveIntensity=1.05):e.name.startsWith(`glass-`)?(e.envMap=C,e.envMapIntensity=e.name===`glass-clear`?1.42:1.02,e.roughness=Math.min(e.roughness,.25),e.name!==`glass-clear`&&(e.metalness=Math.max(e.metalness,.11)),D?.register(e,!0,e.name===`glass-clear`)):[`teaching-metal`,`frame`,`blue-rail`,`blue-cap`,`stand_steel`,`entry-aluminum`,`stainless`,`entry-drain-frame`,`entry-drain-grate`].includes(e.name)?(e.envMap=C,e.envMapIntensity=.48,e.metalness=Math.max(e.metalness,.27),D?.register(e,!1,!1)):e.name===`teaching-floor`&&(e.envMap=C,e.envMapIntensity=.22))});let A=new e,j=new e(0,1,0),M=new e,ee=s.manifest.collisionFromModels?.019:.043,te=0;function ne(e){let n,r,i=5.4**2,a=5.4**2;if(e)for(let t of w){let o=t.y-e.y;if(o<1.92||o>3.95)continue;let s=(t.x-e.x)**2+(t.z-e.z)**2;s<i?(r=n,a=i,n=t,i=s):s<a&&(r=t,a=s)}for(let[e,o]of T.entries()){let s=e?r:n,c=e?a:i;s&&o.position.copy(s),o.intensity=s?4.9*(1-t.smoothstep(c,9,5.4**2)):0}}function re(e,n,r,o=!0){i.getWorldPosition(u.position),D?.update(o&&e!==`overview`),ne(e===`walk`?n:void 0);let c=n&&(e===`walk`||e===`fly`&&n.y<s.bounds.max.y+14),l=c?e===`walk`?25:38:Math.max(s.size.length()*.56,25);if(c?A.set(Math.round(n.x/8)*8,Math.round(n.y/8)*8,Math.round(n.z/8)*8):A.copy(s.center),te!==l||!g.target.position.equals(A)){if(g.target.position.copy(A),g.position.copy(A).add(_),te!==l){te=l;let e=_.length(),t=l*2.4;Object.assign(g.shadow.camera,{left:-l,right:l,top:l,bottom:-l,near:Math.max(.1,e-t),far:e+t}),g.shadow.camera.updateProjectionMatrix(),g.shadow.bias=c?-16e-5:-11e-5,g.shadow.normalBias=c?.018:.074}a.shadowMap.needsUpdate=!0}if(x.visible=!!(n&&r),n&&r){let e=Math.max(0,n.y-r.y);M.set(r.normal.x,r.normal.y,r.normal.z),x.position.set(n.x,r.y,n.z).addScaledVector(M,ee),x.quaternion.setFromUnitVectors(j,M);let i=1+.62*e;x.scale.set(.83*i,1,.79*i),x.material.opacity=.42*(1-t.smoothstep(e,.03,1.38))}}return{update:re,dispose(){for(let e of[u,f,x])e.removeFromParent(),e.geometry.dispose(),e.material.dispose();x.material.alphaMap?.dispose(),D?.dispose(),C.dispose(),g.shadow.dispose(),p.removeFromParent(),h.removeFromParent(),g.removeFromParent(),g.target.removeFromParent();for(let e of T)e.removeFromParent()}}}var Xe=`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`,Ze=`
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
`,Qe=`
  varying vec2 vUv;
  ${Ze}

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
`,$e=`
  varying vec2 vUv;
  uniform sampler2D tColor;
  uniform sampler2D tOcclusion;
  uniform vec2 uOcclusionSize;
  ${Ze}

  float lumaOf(vec3 color) {
    return sqrt(max(0.0, dot(color, vec3(0.2126, 0.7152, 0.0722))));
  }

  // Keep a single depth sample at the pixel center, then smooth color edges.
  vec3 antialiasedColor(vec2 uv) {
    vec3 center = texture2D(tColor, uv).rgb;
    float a = lumaOf(texture2D(tColor, uv + vec2(-1.0, -1.0) * uTexel).rgb);
    float b = lumaOf(texture2D(tColor, uv + vec2( 1.0, -1.0) * uTexel).rgb);
    float c = lumaOf(texture2D(tColor, uv + vec2(-1.0,  1.0) * uTexel).rgb);
    float d = lumaOf(texture2D(tColor, uv + vec2( 1.0,  1.0) * uTexel).rgb);
    float middle = lumaOf(center);
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
    vec3 color = antialiasedColor(vUv);
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
    #include <colorspace_fragment>
  }
`;function et(e){if(!e.extensions.has(`EXT_color_buffer_float`))return;let t=new pe(1,1,{type:ge,depthTexture:new ve(1,1,E)}),r=new pe(1,1,{depthBuffer:!1,minFilter:l,magFilter:l}),i={tDepth:{value:t.depthTexture},uProjection:{value:new _},uTexel:{value:new _},uLogFar:{value:0}},a=new le({uniforms:i,vertexShader:Xe,fragmentShader:Qe,depthTest:!1,depthWrite:!1,toneMapped:!1}),o=new le({uniforms:{...i,tColor:{value:t.texture},tOcclusion:{value:r.texture},uOcclusionSize:{value:new _}},vertexShader:Xe,fragmentShader:$e,depthTest:!1,depthWrite:!1}),s=new d,c=new f,u=new m(new n(2,2),a);u.frustumCulled=!1,s.add(u);let p=new _;return{render(n,l){e.getDrawingBufferSize(p);let d=Math.min(1,Math.sqrt(35e5/(p.x*p.y))),f=Math.max(1,Math.floor(p.x*d)),m=Math.max(1,Math.floor(p.y*d));if(t.width!==f||t.height!==m){let e=Math.max(1,Math.floor(f*.5)),n=Math.max(1,Math.floor(m*.5));t.setSize(f,m),r.setSize(e,n),i.uTexel.value.set(1/f,1/m),o.uniforms.uOcclusionSize.value.set(e,n)}i.uProjection.value.set(l.projectionMatrix.elements[0],l.projectionMatrix.elements[5]),i.uLogFar.value=Math.log2(l.far+1);let h=e.info.autoReset;e.info.reset(),e.info.autoReset=!1;try{e.setRenderTarget(t),e.render(n,l),e.setRenderTarget(r),u.material=a,e.render(s,c),e.setRenderTarget(null),u.material=o,e.render(s,c)}finally{e.setRenderTarget(null),e.info.autoReset=h}},dispose(){t.dispose(),r.dispose(),u.geometry.dispose(),a.dispose(),o.dispose()}}}var tt=new Set([`KeyW`,`KeyA`,`KeyS`,`KeyD`,`ArrowUp`,`ArrowLeft`,`ArrowDown`,`ArrowRight`,`ShiftLeft`,`ShiftRight`,`Space`,`KeyE`,`KeyQ`,`ControlLeft`,`ControlRight`]);function nt(e){let{surface:t,movePad:n,thumb:r,lifts:i}=e,a=new Set,o=matchMedia(`(pointer: coarse)`),s=o.matches,c=null,l=null,u=0,d=0,f=0;function p(){l=null,u=0,d=0,r.style.transform=``}function m(){a.clear(),c=null,f=0,p()}function h(t){t!==s&&(s=t,e.onDeviceChange())}function g(e){let t=n.getBoundingClientRect(),i=t.width*.31,a=(e.clientX-t.left-t.width/2)/i,o=(e.clientY-t.top-t.height/2)/i,s=Math.hypot(a,o),c=Math.max(1,s);u=s>.08?a/c:0,d=s>.08?-o/c:0,r.style.transform=`translate(${u*i}px, ${-d*i}px)`}o.addEventListener(`change`,e=>h(e.matches)),window.addEventListener(`pointerdown`,e=>{e.pointerType===`touch`?h(!0):e.pointerType===`mouse`&&!o.matches&&h(!1)}),t.addEventListener(`pointerdown`,n=>{e.mode()!==`overview`&&n.button===0&&document.pointerLockElement!==t&&(c||(c={id:n.pointerId,x:n.clientX,y:n.clientY},t.setPointerCapture(n.pointerId)))}),t.addEventListener(`pointermove`,t=>{t.pointerId===c?.id&&(e.look(t.clientX-c.x,t.clientY-c.y),c.x=t.clientX,c.y=t.clientY)});for(let e of[`pointerup`,`pointercancel`,`lostpointercapture`])t.addEventListener(e,e=>{e.pointerId===c?.id&&(c=null)}),n.addEventListener(e,e=>{e.pointerId===l&&p()});t.addEventListener(`dblclick`,()=>{if(e.mode()!==`overview`&&!s&&t.requestPointerLock)try{t.requestPointerLock()?.catch(()=>{})}catch{}}),document.addEventListener(`mousemove`,n=>{document.pointerLockElement===t&&e.look(n.movementX,n.movementY)}),n.addEventListener(`pointerdown`,e=>{l===null&&(l=e.pointerId,n.setPointerCapture(e.pointerId),g(e))}),n.addEventListener(`pointermove`,e=>{e.pointerId===l&&g(e)});for(let e of i.querySelectorAll(`button`)){let t=Number(e.dataset.lift),n=null;e.addEventListener(`pointerdown`,r=>{n===null&&(n=r.pointerId,e.setPointerCapture(r.pointerId),f=t)});for(let r of[`pointerup`,`pointercancel`,`lostpointercapture`])e.addEventListener(r,e=>{e.pointerId===n&&(n=null,f===t&&(f=0))})}window.addEventListener(`keydown`,t=>{t.target instanceof HTMLElement&&t.target.closest(`input, select, textarea, button, a, [contenteditable]`)||(t.ctrlKey||t.metaKey||t.altKey)&&t.code!==`ControlLeft`&&t.code!==`ControlRight`||(tt.has(t.code)&&e.mode()!==`overview`&&(t.preventDefault(),a.add(t.code)),t.repeat||(t.code===`Digit1`&&e.setMode(`overview`),t.code===`Digit2`&&e.setMode(`walk`),t.code===`Digit3`&&e.setMode(`fly`),t.code===`KeyR`&&e.reset()))}),window.addEventListener(`keyup`,e=>a.delete(e.code)),window.addEventListener(`blur`,m),document.addEventListener(`visibilitychange`,()=>{document.hidden&&m()});let _=(...e)=>e.some(e=>a.has(e));return{get touch(){return s},get side(){return Number(_(`KeyD`,`ArrowRight`))-Number(_(`KeyA`,`ArrowLeft`))+u},get ahead(){return Number(_(`KeyW`,`ArrowUp`))-Number(_(`KeyS`,`ArrowDown`))+d},get lift(){return Number(_(`Space`,`KeyE`))-Number(_(`ControlLeft`,`ControlRight`,`KeyQ`))+f},get running(){return _(`ShiftLeft`,`ShiftRight`)},get jumping(){return _(`Space`)},releaseAll:m}}var rt=new e(0,-1,0),it=.27,at=1.8,ot=[-.27,0,it];function st(e,t,n){let r=!1;for(let i=0,a=e.length-1;i<e.length;a=i++){let[o,s]=e[i],[c,l]=e[a];s>n!=l>n&&t<(c-o)*(n-s)/(l-s)+o&&(r=!r)}return r}function ct(t){let n=[],r=new p;return t.traverse(t=>{if(!(t instanceof m))return;let i=t.geometry,o=i.getAttribute(`position`);if(!o)return;let s=i.index,c=s?.count??o.count,l=t instanceof a?t.count:1,u=t=>new e().fromBufferAttribute(o,s?.getX(t)??t).applyMatrix4(r);for(let e=0;e<l;e++){t instanceof a?(t.getMatrixAt(e,r),r.premultiply(t.matrixWorld)):r.copy(t.matrixWorld);for(let e=0;e+2<c;e+=3){let t=new T(u(e),u(e+1),u(e+2));n.push({triangle:t,bounds:new me().setFromPoints([t.a,t.b,t.c])})}}}),n}function lt(t,n){t.updateWorldMatrix(!0,!0);let r=new me().setFromObject(t),i=ct(t),o=new C,s=new e,c=new e,l=new p,u=new re,d=new me;function f(e){return!e.face||!(e.object instanceof m)||(Array.isArray(e.object.material)?e.object.material[e.face.materialIndex]:e.object.material)?.name!==`walkable`?!1:(e.object instanceof a&&e.instanceId!==void 0?(e.object.getMatrixAt(e.instanceId,l),l.premultiply(e.object.matrixWorld)):l.copy(e.object.matrixWorld),c.copy(e.face.normal).applyNormalMatrix(u.getNormalMatrix(l)).normalize(),c.y>=.707)}function h(e,i){if(!st(n,e,i))return;o.set(s.set(e,r.max.y+1,i),rt);let a=o.intersectObject(t,!0)[0];return a&&f(a)?a.point.y:void 0}return t=>{let{x:n,y:r,z:a}=t;if(![n,r,a].every(Number.isFinite))return;let o=h(n,a);if(!(o===void 0||r<o+.3)){for(let e of ot)for(let t of ot){if(e===0&&t===0)continue;let r=h(n+e,a+t);if(r===void 0||Math.abs(r-o)>.18)return}if(d.min.set(n-it,o+.05,a-it),d.max.set(n+it,o+at,a+it),!i.some(({bounds:e,triangle:t})=>e.intersectsBox(d)&&d.intersectsTriangle(t)))return new e(n,o+.035,a)}}}var ut=new e(0,1,0),dt=.18;function ft(e,t){t.set(0,0);for(let n of e){let e=n.gamepad;if(!e||e.axes.length<2)continue;let r=e.mapping===`xr-standard`&&e.axes.length>=4?2:0,i=e.axes[r],a=e.axes[r+1];if(!(!Number.isFinite(i)||!Number.isFinite(a)||Math.hypot(i,a)<dt)){if(n.handedness===`left`)return t.set(i,a);t.lengthSq()===0&&t.set(i,a)}}return t}function pt(){let t=new c,n=new e,r=new e,i=new _;return(e,a,o,s)=>{let{x:c,y:l,z:u,w:d}=e;return t.set(c,l,u,d),n.set(0,0,-1).applyQuaternion(t).applyAxisAngle(ut,a),n.y=0,n.lengthSq()<1e-4&&n.set(-Math.sin(a),0,-Math.cos(a)),n.normalize(),r.crossVectors(n,ut),ft(o,i),s.copy(r).multiplyScalar(i.x).addScaledVector(n,-i.y).clampLength(0,1)}}var mt={taoqi:{name:`Taoqi`,skin:`#ffc49c`,shade:`#e7a37e`,hair:`#282532`,hairLight:`#443746`,shirt:`#ffb34d`,trim:`#f8ecd0`,seam:`#d68731`,bottoms:`#284a67`,shoes:`#426e9d`,bag:`#2a7894`,bagPocket:`#459aae`,bagSeam:`#215c74`,badge:`#ffca54`},xiaoxiao:{name:`Xiaoxiao`,skin:`#ffcbab`,shade:`#eaa587`,hair:`#322537`,hairLight:`#51364b`,shirt:`#df647d`,trim:`#fff3e9`,seam:`#b34e70`,bottoms:`#d97894`,shoes:`#b44f6d`,bag:`#885f9d`,bagPocket:`#ac7cb2`,bagSeam:`#674576`,badge:`#ffdc77`}},ht=Math.PI*2,gt=`#fff8e7`,_t=`#362737`;function P(e,t,n,i){let a=new r;return a.position.set(t,n,i),e.add(a),a}function vt(){function e(e){if(!e.index)return e;let t=e.toNonIndexed();return e.dispose(),t}let t={round:e(new u(1,16,12)),box:new fe(1,1,1,2,.13),cylinder:e(new ee(.5,.5,1,16)),skirt:e(new ee(.32,.5,1,16))},n=new o({vertexColors:!0,roughness:.84}),r=new Set;function i(e,i){let a=[];i((e,n,r,i,o,s,c,l,u=0,d=0,f=0)=>{let p=t[e].clone();p.scale(s,c,l),p.rotateX(u),p.rotateY(d),p.rotateZ(f),p.translate(r,i,o);let m=new N(n),h=new Float32Array(p.getAttribute(`position`).count*3);for(let e=0;e<h.length;e+=3)h[e]=m.r,h[e+1]=m.g,h[e+2]=m.b;p.setAttribute(`color`,new M(h,3)),a.push(p)});let o=ne(a);for(let e of a)e.dispose();r.add(o),e.add(new m(o,n))}return{part:i,dispose(){for(let e of Object.values(t))e.dispose();for(let e of r)e.dispose();n.dispose()}}}function yt(e,t,n){let r=mt[n],i=n===`xiaoxiao`,a=P(e,0,0,0);a.name=r.name;let o=P(a,0,1.12,-.012),{part:s}=t;s(a,e=>{e(`box`,r.shirt,0,.706,0,.363,.46,.242),e(`cylinder`,r.trim,0,.923,-.009,.192,.036,.171),e(`cylinder`,r.skin,0,.955,-.01,.13,.084,.124),i?(e(`skirt`,r.bottoms,0,.463,0,.455,.217,.32),e(`cylinder`,r.trim,0,.365,0,.463,.026,.327),e(`box`,r.seam,0,.553,-.123,.29,.033,.018),e(`box`,r.trim,-.047,.881,-.12,.077,.088,.018,0,0,-.37),e(`box`,r.trim,.047,.881,-.12,.077,.088,.018,0,0,.37),e(`round`,r.badge,0,.838,-.137,.018,.018,.008)):(e(`box`,r.bottoms,0,.479,.012,.329,.148,.231),e(`box`,r.trim,0,.583,-.12,.32,.035,.018),e(`box`,r.seam,-.094,.783,-.123,.088,.082,.023),e(`box`,r.trim,-.094,.816,-.138,.085,.013,.01)),e(`box`,r.bag,0,.701,.172,.306,.344,.224),e(`box`,r.bagPocket,0,.643,.282,.252,.155,.075),e(`box`,r.bagSeam,0,.705,.321,.195,.014,.009),e(`box`,r.trim,.061,.699,.327,.018,.032,.012,0,0,-.17),e(`box`,r.bagSeam,0,.883,.192,.092,.037,.032);for(let t of[-1,1])e(`box`,r.bagSeam,t*.128,.736,-.119,.041,.304,.037,0,0,t*-.12),e(`box`,r.bag,t*.13,.907,.028,.043,.032,.237,-.04),e(`box`,r.bagPocket,t*.152,.636,.176,.065,.111,.132);i?(e(`round`,r.badge,.064,.772,.285,.04,.04,.009),e(`round`,`#f6a397`,.064,.772,.294,.018,.018,.008)):(e(`box`,r.badge,-.067,.765,.288,.076,.064,.011,0,0,.13),e(`box`,r.bagSeam,-.067,.766,.296,.027,.015,.01,0,0,.13))}),s(o,e=>{e(`round`,r.skin,0,.069,-.027,.221,.209,.212),e(`round`,r.hair,0,.118,.03,.23,.211,.214);for(let t of[-1,1])e(`round`,r.skin,t*.211,.065,-.011,.044,.059,.035),e(`round`,r.shade,t*.224,.066,-.035,.021,.032,.011),e(`round`,`#fffdf6`,t*.082,.091,-.224,.042,.049,.019,0,t*-.21),e(`round`,_t,t*.078,.09,-.24,.024,.032,.012),e(`round`,`#ffffff`,t*.078-.008,.103,-.25,.008,.01,.004),e(`round`,r.hair,t*.085,.153,-.214,.039,.009,.012,0,t*-.22,t*.15),e(`round`,`#ee9b91`,t*.134,.022,-.19,.035,.015,.014,0,t*-.46);if(e(`round`,r.skin,0,.043,-.235,.035,.036,.033),e(`round`,`#8c4d53`,0,-.026,-.213,.045,.025,.015,-.2),e(`round`,gt,0,-.018,-.225,.029,.008,.005,-.2),i){e(`round`,r.hair,0,.185,-.143,.19,.081,.082);for(let t of[-1,1])e(`round`,r.hairLight,t*.166,.164,-.127,.056,.097,.061,0,0,t*.36),e(`round`,r.hair,t*.252,.012,.128,.089,.151,.102,-.16,0,t*.37),e(`round`,r.hairLight,t*.277,-.044,.183,.064,.097,.047,-.25,0,t*.36),e(`round`,r.shirt,t*.219,.095,.127,.052,.043,.055),e(`round`,r.trim,t*.245,.111,.15,.027,.026,.026)}else e(`round`,r.hairLight,-.082,.216,-.134,.128,.081,.099,.21,0,-.3),e(`round`,r.hair,.063,.202,-.139,.112,.061,.082,0,0,.2),e(`round`,r.hair,-.082,.275,.075,.113,.066,.087,-.36,0,-.61),e(`round`,r.hairLight,-.13,.29,.103,.058,.057,.059,-.38,0,-.63)});let c=[-1,1].map(e=>{let t=P(a,e*.19,.858,0),n=P(t,0,-.161,0),o=P(a,e*.102,.457,0),c=P(o,0,-.211,0);return s(t,e=>{e(`box`,r.shirt,0,-.071,0,.137,.183,.148),e(`box`,r.trim,0,-.146,0,.14,.042,.146),e(`round`,r.skin,0,-.169,0,.052,.056,.055)}),s(n,t=>{t(`round`,r.skin,0,-.086,0,.048,.095,.051),t(`round`,r.skin,0,-.184,-.006,.059,.064,.05),t(`round`,r.skin,e*-.036,-.172,-.036,.032,.04,.025)}),s(o,e=>{i?e(`round`,r.skin,0,-.121,0,.066,.138,.072):(e(`box`,r.bottoms,0,-.087,0,.153,.213,.17),e(`box`,`#406582`,0,-.177,0,.155,.043,.172),e(`round`,r.skin,0,-.217,0,.058,.055,.062))}),s(c,e=>{e(`round`,r.skin,0,-.077,0,.055,.093,.062),e(`cylinder`,r.trim,0,-.15,0,.119,.094,.128),e(`box`,r.shoes,0,-.186,-.035,.157,.105,.224),e(`box`,r.trim,0,-.23,-.037,.162,.034,.231),e(`box`,r.trim,0,-.129,-.071,.081,.019,.026,.11)}),{side:e,arm:t,elbow:n,leg:o,knee:c}}),l=P(o,0,.317,.015);l.name=`BambooCopter`,s(l,e=>{e(`cylinder`,`#e3b85e`,0,.067,0,.04,.172,.04),e(`round`,`#9a7039`,0,.025,0,.044,.029,.042),e(`cylinder`,`#7d8844`,0,.153,0,.064,.038,.064)});let u=P(l,0,.159,0);return u.name=`BambooRotor`,s(u,e=>{e(`round`,`#e2ae57`,0,0,0,.055,.022,.055);for(let t of[-1,1])e(`box`,`#b7ad64`,t*.108,0,0,.21,.02,.053,-t*.14),e(`round`,`#edd083`,t*.282,0,t*.012,.235,.022,.085,-t*.17,-.11),e(`round`,`#88a255`,t*.411,.005,t*.028,.098,.016,.054,-t*.17,-.11),e(`box`,`#b7a05d`,t*.29,.019,t*.008,.014,.007,.115,-t*.17,-.11)}),l.visible=!1,{body:a,head:o,limbs:c,copter:l,rotor:u}}function bt(){let e=new r;e.name=`TourAvatar`;let n=vt(),i={taoqi:yt(e,n,`taoqi`),xiaoxiao:yt(e,n,`xiaoxiao`)},a=`taoqi`,o=0,s=0,c=0,l=0,u=!1;return i.xiaoxiao.body.visible=!1,{object:e,select(e){i[a].body.visible=!1,a=e,i[a].body.visible=!0},update(n,r,d,f,p){if(e.visible=r!==`overview`,r===`overview`){u=!1;return}let m=i[a];s+=n;let h=r===`fly`,g=h?0:t.clamp(d/2.65,0,1);c=t.damp(c,g,13,n),l=t.damp(l,Number(h),11,n),o=(o+n*ht*(.85+1.25*c))%ht;let _=f-e.rotation.y;e.rotation.y=u?e.rotation.y+Math.atan2(Math.sin(_),Math.cos(_))*(1-Math.exp(-18*n)):f,u=!0,m.body.position.y=.019*c*Math.abs(Math.sin(o))+l*(.052+Math.sin(s*5)*.033),m.body.rotation.x=l*(-.16-Math.min(d*.006,.22)+p*.08)-(1-l)*c*.055,m.body.rotation.z=Math.sin(o)*c*.028+Math.sin(s*2.4)*l*.043,m.head.rotation.x=.1*l,m.head.rotation.z=Math.sin(s*1.9)*(.015+l*.019),m.copter.visible=h,h&&(m.rotor.rotation.y=(m.rotor.rotation.y+n*(23+Math.min(d,10)))%ht);for(let e of m.limbs){let t=Math.sin(o)*e.side,n=Math.sin(s*3.1+e.side*.9);e.arm.rotation.x=-t*c*.63-l*(.21+n*.065),e.arm.rotation.z=e.side*(.1+.53*l),e.elbow.rotation.x=.12+(1-l)*c*(.25-t*.19)+l*.12,e.leg.rotation.x=t*c*.55-l*(.28+e.side*.095),e.leg.rotation.z=e.side*l*.1,e.knee.rotation.x=-Math.max(0,-t)*c*.66-l*(.43-n*.11)}},dispose(){n.dispose(),e.clear()}}}var xt=1.64;function St(n){let r=new e,i=new e,a=new e,o=new e,s=new _e(0,0,0,`YXZ`),c=0;return function(e,l,u,d,f,p,m,h){let g=!1;if(!f){let s=Math.sin(l),f=Math.cos(l),_=d?3.35:2.83,v=t.clamp(u,-1.18,.85),y=_*Math.cos(v);r.copy(e),r.y+=1.08,i.set(r.x+y*s+.32*f,Math.max(e.y+.54,r.y+(d?.82:.54)-_*Math.sin(v)),r.z+y*f-.32*s);let b=r.distanceTo(h?h(r,i):i);g=b>=1.12,c=m||!c||!g?b:Math.min(b,t.damp(c,b,8,p)),g&&(n.position.copy(r).addScaledVector(o.subVectors(i,r).normalize(),c),a.set(r.x-.9*s,r.y+(d?.1:-.12)+1.37*Math.sin(v),r.z-.9*f),n.lookAt(a))}return g||(c=0,n.position.copy(e),n.position.y+=xt,n.quaternion.setFromEuler(s.set(u,l,0))),g}}var Ct=`modulepreload`,wt=function(e,t){return new URL(e,t).href},Tt={},Et=function(e){return e.pathname.endsWith(`.css`)},Dt=function(e,t,n){if(t in e)return e[t];let r=n();if(!r){e[t]=void 0;return}let i=r.then(()=>{e[t]=void 0},n=>{throw e[t]=void 0,n});return e[t]=i,i},Ot=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e,i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}function s(e){return import.meta.resolve?new URL(import.meta.resolve(e)):new URL(e,import.meta.url)}r=o(t.map(t=>{t=wt(t,n);let r=s(t),i=Et(r);return Dt(Tt,r.href,()=>{if(e===void 0){e={all:new Set,styles:new Set};let t=document.getElementsByTagName(`link`);for(let n=t.length-1;n>=0;n--){let r=t[n];e.all.add(r.href),r.rel===`stylesheet`&&e.styles.add(r.href)}}if((i?e.styles:e.all).has(r.href))return;let t=document.createElement(`link`);if(t.rel=i?`stylesheet`:Ct,i||(t.as=`script`),t.crossOrigin=``,t.href=r.href,a&&t.setAttribute(`nonce`,a),document.head.appendChild(t),i)return new Promise((e,n)=>{t.addEventListener(`load`,e),t.addEventListener(`error`,()=>n(Error(`Unable to preload CSS for ${r}`)))})})}).filter(e=>e!==void 0))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})},F=e=>document.getElementById(e),kt=F(`app`),I=F(`viewport`),At=F(`notice`),jt=F(`about`),Mt=F(`about-panel`),Nt=F(`fullscreen`),Pt=F(`vr`),Ft=F(`location`),It=[...kt.querySelectorAll(`.mode-controls [data-mode]`)],Lt=F(`avatar-controls`),Rt=[...Lt.querySelectorAll(`[data-avatar]`)],zt=F(`view-toggle`),Bt=zt.querySelector(`.view-label`),Vt=F(`reset`),Ht=F(`controls-hint`),Ut=F(`diagnostics`),Wt=new URLSearchParams(window.location.search),Gt=Wt.has(`debug`),Kt=!Gt||Wt.get(`occlusion`)!==`0`,qt=!Gt||Wt.get(`reflection`)!==`0`,Jt=new e,Yt=new e,Xt=new e,L=new e,Zt=new e,R=new e,z=new e,Qt=pt(),$t=new e,en=new e,B=`overview`,V,H,tn,U,nn,rn,an,W=0,G=0,on=0,sn=!1,cn=`taoqi`,ln=0,un=0,dn=!1,fn=!1,pn,K,mn=``,hn,q=new d;q.background=new N(`#b9d5e7`);var J=new v(57,1,.07,1600),Y=new r;Y.add(J),q.add(Y);var X=bt(),gn=St(J);X.object.visible=!1,X.object.traverse(e=>{e instanceof m&&(e.receiveShadow=!0)}),q.add(X.object);var Z=new O(J,I);Z.enabled=!1,Z.enableDamping=!0,Z.dampingFactor=.095,Z.maxPolarAngle=Math.PI/2-.035,Z.minDistance=5,Z.zoomSpeed=.95,Z.rotateSpeed=.6,Z.enablePan=!0;function _n(e,n){B===`overview`||K||(W-=e*.003,G=t.clamp(G-n*.003,-1.49,1.49))}var Q=nt({surface:I,movePad:F(`move-pad`),thumb:F(`move-thumb`),lifts:F(`vertical-buttons`),mode:()=>B,setMode:wn,reset:Cn,look:_n,onDeviceChange:$});function $(){let e=!!(V&&dn);kt.dataset.mode=B;for(let t of It){let n=t.dataset.mode;t.disabled=!e||n===`walk`&&!H,t.setAttribute(`aria-pressed`,String(B===n))}Vt.disabled=!e,Lt.hidden=!e||!!K,zt.hidden=!e||B===`overview`||!!K,zt.setAttribute(`aria-pressed`,String(sn)),Bt.textContent=sn?`第一人称`:`跟随视角`;for(let e of Rt)e.setAttribute(`aria-pressed`,String(e.dataset.avatar===cn));F(`reticle`).hidden=!e||B===`overview`||Q.touch||!sn,F(`move-pad`).hidden=!e||B===`overview`||!Q.touch,F(`vertical-buttons`).hidden=!e||B!==`fly`||!Q.touch,Ht.hidden=!e,e&&(Ht.textContent=mn||(Q.touch?{overview:`单指旋转 · 双指缩放和平移`,walk:`左侧摇杆移动 · 拖动看向四周`,fly:`左侧摇杆移动 · 拖动转向`}:{overview:`拖动旋转 · 滚轮缩放 · 右键拖动平移`,walk:`WASD 移动 · 拖动看向四周 · 双击锁定视角`,fly:`WASD 移动 · E 上升 · Q 下降 · 拖动转向`})[B])}var vn=e=>Math.max(1,1.05/e);function yn(){if(!V)return;let e=V.manifest.overview,t=Math.max(V.size.x,V.size.z,V.size.y,12);e?(Z.target.fromArray(e.target),J.position.fromArray(e.position)):(Z.target.copy(V.center),J.position.copy(V.center).add($t.set(t*.55,t*.65,t*.68))),J.position.copy(en.subVectors(J.position,Z.target).multiplyScalar(vn(J.aspect)).add(Z.target)),Z.minDistance=Math.max(3,t*.025),Z.maxDistance=Math.max(t*3,J.position.distanceTo(Z.target)*1.6),J.lookAt(Z.target),Z.update()}function bn(e,t=0,n=0,r=!1){let i=B===`walk`?H?.position:R;!i||B===`overview`||K?X.object.visible=!1:(X.object.position.copy(i),X.update(e,B,t,on,n),X.object.visible=gn(i,W,G,B===`fly`,sn,e,r,H?.constrainCamera))}function xn(e){$t.fromArray(e.position),H?.teleport($t),L.copy($t),ln=e.yaw??0,un=e.pitch??0,W=ln,G=un,on=W-.42}function Sn(){window.clearTimeout(hn),mn=``}function Cn(){V&&!K&&(Sn(),$(),Q.releaseAll(),B===`overview`?yn():(xn(V.manifest.spawn),B===`fly`&&(R.fromArray(V.manifest.spawn.position),R.y+=Math.max(10,V.size.y*.6),G=-.2),bn(0,0,0,!0)))}function wn(e,n){if(!dn||!V||K||e===`walk`&&!H||e===B&&!n)return;let r=B;Sn();let i;r===`fly`&&e===`walk`&&!n&&H&&(i=V.manifest.collisionFromModels?H.findLanding(R):tn?.($t.copy(R).addScaledVector(J.up,xt)),!i&&(V.manifest.collisionFromModels||tn))?(mn=`脚下没有足够的落脚空间`,hn=window.setTimeout(()=>{mn=``,$()},3e3),$()):(B===`walk`&&(ln=W,un=G),Q.releaseAll(),document.pointerLockElement===I&&document.exitPointerLock(),e===`fly`&&(r===`walk`&&H?R.copy(H.position):(R.fromArray(V.manifest.spawn.position),R.y+=Math.max(10,V.size.y*.6),W=V.manifest.spawn.yaw??0,G=-.22,on=W-.42)),B=e,Z.enabled=e===`overview`,e===`overview`&&yn(),e===`walk`&&H&&(n?xn(n):i?(H.teleport(i),L.copy(i),G=t.clamp(G,-.5,.5)):(H.teleport(L),W=ln,G=un)),bn(0,0,0,!0),$())}function Tn(){let e=V?.manifest.locations?.find(e=>e.id===Ft.value);e&&!K&&(H?wn(`walk`,e):(wn(`fly`),R.fromArray(e.position),R.y+=2,W=e.yaw??0,G=e.pitch??-.12,on=W-.42,bn(0,0,0,!0)),Ft.value=``,I.focus({preventScroll:!0}))}function En(){let e=I.clientWidth,t=I.clientHeight;if(!e||!t)return;let n=vn(J.aspect);if(J.aspect=e/t,J.updateProjectionMatrix(),V&&B===`overview`){let e=vn(J.aspect)/n;J.position.copy(en.subVectors(J.position,Z.target).multiplyScalar(e).add(Z.target)),Z.maxDistance=Math.max(Z.maxDistance,J.position.distanceTo(Z.target)*1.6),Z.update()}U&&!K&&(U.setPixelRatio(Math.min(devicePixelRatio,Q.touch?1.5:2)),U.setSize(e,t,!1))}function Dn(e){if(Jt.set(-Math.sin(W),0,-Math.cos(W)),Yt.set(Math.cos(W),0,-Math.sin(W)),Xt.copy(Jt).multiplyScalar(Q.ahead).addScaledVector(Yt,Q.side),Xt.clampLength(0,1),B===`walk`&&H){Zt.copy(H.position),H.update(e,Xt,Q.running,Q.jumping),H.grounded&&L.copy(H.position),V&&H.position.y<V.bounds.min.y-8&&H.teleport(L),bn(e,On(H.position,e));return}if(!V)return;Zt.copy(R);let n=Q.running?22:9,r=t.clamp(Q.lift,-1,1),i=V.manifest.collisionFromModels&&H,a=i?0:Math.max(25,Math.max(V.size.x,V.size.z)*.4);z.copy(R).addScaledVector(Xt,e*n),i||(z.x=t.clamp(z.x,V.bounds.min.x-a,V.bounds.max.x+a),z.z=t.clamp(z.z,V.bounds.min.z-a,V.bounds.max.z+a)),R.copy(H?.constrainFlight(R,z)??z),z.copy(R),z.y+=r*n*e,i||(z.y=t.clamp(z.y,V.bounds.min.y+.02,V.bounds.max.y+a*2)),R.copy(H?.constrainFlight(R,z)??z),bn(e,On(R,e),r)}function On(e,t){let n=e.x-Zt.x,r=e.z-Zt.z,i=t>0?Math.hypot(n,r)/t:0;return i>.08&&(on=Math.atan2(-n,-r)),i}function kn(e,t){if(!H||!K||!t)return;let n=U.xr.getReferenceSpace(),r=n&&t.getViewerPose(n);r&&(Qt(r.transform.orientation,Y.rotation.y,K.inputSources,Xt),H.update(e,Xt,!1,!1),H.grounded&&L.copy(H.position),V&&H.position.y<V.bounds.min.y-8&&H.teleport(L),Y.position.copy(H.position))}async function An(){if(navigator.xr&&H&&window.isSecureContext)try{if(!await navigator.xr.isSessionSupported(`immersive-vr`))return;Pt.hidden=!1}catch{}}async function jn(){if(H&&navigator.xr&&!K){Pt.disabled=!0;try{let e=await navigator.xr.requestSession(`immersive-vr`,{requiredFeatures:[`local-floor`]});wn(`walk`),K=e,Q.releaseAll(),X.object.visible=!1,$(),Y.position.copy(H.position),Y.rotation.y=W,J.position.set(0,0,0),J.quaternion.identity(),e.addEventListener(`end`,()=>{K=void 0,Y.position.set(0,0,0),Y.rotation.y=0,bn(0,0,0,!0),Pt.disabled=!1,$(),queueMicrotask(En)},{once:!0}),await U.xr.setSession(e)}catch(e){K&&K.end().catch(()=>{}),Pt.disabled=!1,console.warn(`未能进入头显 VR`,e),Ht.textContent=`暂时无法进入头显，请检查浏览器的 VR 连接。`}}}function Mn(e,t){let n=Math.min(.1,pn===void 0?0:(e-pn)/1e3);pn=e,dn&&(K?kn(n,t):B===`overview`?Z.update(n):Dn(n));let r=B===`walk`?H?.position:B===`fly`?R:void 0,i=r&&X.object.visible?H?.groundSurface(r):void 0;if(nn?.update(B,r,i,fn),rn?.update(J,e,dn&&B===`walk`),dn&&B!==`overview`&&!Q.touch&&!U.xr.isPresenting&&an?an.render(q,J):U.render(q,J),fn||(fn=!0,At.hidden=!0),Gt){let e=J.position.toArray().map(e=>e.toFixed(2)).join(`, `),{calls:t,triangles:n}=U.info.render,i=(B===`overview`?H?.position:r)?.toArray().map(e=>e.toFixed(2)).join(`, `)??`—`,a=B===`overview`?`overview`:X.object.visible?`follow`:`eyes`;Ut.textContent=`${B}${B===`walk`&&H?.grounded?` grounded`:``}\n${e}\n${t} draws · ${n.toLocaleString()} tris\nheading ${W.toFixed(3)}\navatar ${i}\nview ${a}\nmirror ${rn?.active?`on`:`off`} · ${rn?.passes??0} captures`}}function Nn(e){let t=e??Mt.hidden;Mt.hidden=!t,jt.setAttribute(`aria-expanded`,String(t))}function Pn(e,t){if(F(`campus-title`).textContent=e.title,document.title=`${e.title} · 3D 校园`,F(`campus-status`).textContent=e.status??`3D 校园`,F(`description`).textContent=e.description??e.status??`可从总览、飞行和步行视角查看校园场景。`,e.evidenceUrl){let n=new URL(e.evidenceUrl,t);if(n.protocol===`https:`||n.protocol===`http:`){let e=F(`evidence`);e.href=n.href,e.hidden=!1}}for(let t of e.locations??[])Ft.add(new Option(t.label,t.id));F(`location-wrap`).hidden=Ft.options.length<2}async function Fn(){try{let t=Ot(()=>import(`./player-D_21T33K.js`).then(async e=>(await e.preparePlayerPhysics(),e)),__vite__mapDeps([0,1,2]),import.meta.url).catch(e=>({loadError:e}));if(U=new A({antialias:!0,powerPreference:`high-performance`,logarithmicDepthBuffer:!0}),U.outputColorSpace=s,U.toneMapping=6,U.toneMappingExposure=1.04,U.shadowMap.enabled=!0,U.shadowMap.autoUpdate=!1,U.shadowMap.type=1,U.xr.enabled=!0,U.xr.setReferenceSpaceType(`local-floor`),!Q.touch&&Kt&&(an=et(U)),I.tabIndex=0,I.appendChild(U.domElement),new ResizeObserver(En).observe(I),En(),Ut.hidden=!Gt,Nt.hidden=!document.fullscreenEnabled,V=await De(),q.add(V.visuals),nn=Ye(q,J,U,V,Q.touch),rn=Me(U,q,V.visuals,qt&&!Q.touch),Pn(V.manifest,V.manifestURL),V.collision.children.length)try{let n=await t;if(`loadError`in n)throw n.loadError;H=await n.createPlayerController(V.collision,new e().fromArray(V.manifest.spawn.position),{object:new r,updateMotion(){},dispose(){}},V.manifest.collisionFromModels),!V.manifest.collisionFromModels&&V.manifest.landingBoundary&&(tn=lt(V.collision,V.manifest.landingBoundary))}catch(e){console.warn(`校园碰撞载入失败`,e),F(`description`).append(` 本次载入未启用步行。`)}!H&&V.collision.children.length===0&&F(`description`).append(` 当前场景支持总览与飞行。`),xn(V.manifest.spawn),dn=!0,H?wn(`walk`):(yn(),$()),U.setAnimationLoop(Mn),An()}catch(e){console.error(e),F(`loading-mark`).hidden=!0,F(`notice-title`).textContent=`场景未能加载`,F(`notice-detail`).textContent=e instanceof Error?e.message:`请重新加载页面。`,F(`retry`).hidden=!1}}for(let e of It)e.addEventListener(`click`,()=>{wn(e.dataset.mode),I.focus({preventScroll:!0})});for(let e of Rt)e.addEventListener(`click`,()=>{cn=e.dataset.avatar===`xiaoxiao`?`xiaoxiao`:`taoqi`,X.select(cn),$(),I.focus({preventScroll:!0})});zt.addEventListener(`click`,()=>{sn=!sn,bn(0,0,0,!0),$(),I.focus({preventScroll:!0})}),Vt.addEventListener(`click`,()=>{Cn(),I.focus({preventScroll:!0})}),jt.addEventListener(`click`,()=>Nn()),document.addEventListener(`keydown`,e=>{e.key===`Escape`&&!Mt.hidden&&(Nn(!1),jt.focus())}),Nt.addEventListener(`click`,async()=>{try{document.fullscreenElement?await document.exitFullscreen():await kt.requestFullscreen()}catch{}}),document.addEventListener(`fullscreenchange`,()=>{Nt.lastChild.textContent=document.fullscreenElement?`退出全屏`:`全屏`}),Pt.addEventListener(`click`,()=>void jn()),Ft.addEventListener(`change`,Tn),F(`retry`).addEventListener(`click`,()=>window.location.reload()),window.addEventListener(`pagehide`,e=>{e.persisted||(H?.dispose(),nn?.dispose(),rn?.dispose(),an?.dispose(),X.dispose(),Z.dispose(),U&&(U.setAnimationLoop(null),U.dispose()))}),Fn();