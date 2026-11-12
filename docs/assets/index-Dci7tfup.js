const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./player-CzudtN9h.js","./three-runtime-zbpmMzNy.js","./physics-runtime-BR_-CEU_.js"])))=>i.map(i=>d[i]);
import{A as e,B as t,C as n,D as r,E as i,F as a,G as o,H as s,I as c,J as l,K as u,L as d,M as f,N as p,O as m,P as h,Q as g,R as _,S as v,T as y,U as b,V as x,W as S,X as C,Y as w,Z as T,_ as E,a as ee,b as D,c as O,d as k,f as A,g as j,h as te,i as ne,j as M,k as re,n as ie,o as ae,p as oe,q as se,r as ce,s as le,t as ue,u as de,v as fe,w as pe,x as me,y as he,z as ge}from"./three-runtime-zbpmMzNy.js";(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var _e=new URL(`./scene/scene.json`,window.location.href),ve=e=>Array.isArray(e)&&e.length===3&&e.every(Number.isFinite);function ye(e){return e&&ve(e.position)&&(e.yaw===void 0||Number.isFinite(e.yaw))&&(e.pitch===void 0||Number.isFinite(e.pitch)&&Math.abs(e.pitch)<=1.49)}function be(e){let t=new URL(e,_e);if(t.origin!==_e.origin||!t.pathname.toLowerCase().endsWith(`.glb`))throw Error(`模型必须是项目内的 GLB 文件。`);return t.href}function xe(e,t,n,r=!1){e.updateWorldMatrix(!0,!0);let i=e=>{if(!(e instanceof M))return;let r=n(e);if(!r)return;let i=e.clone(!1);i.geometry=r,i.matrixAutoUpdate=!1,i.matrix.copy(e.matrixWorld),i.visible=!0,t.add(i)};r?e.traverseVisible(i):e.traverse(i)}function Se(e){for(;e;){let t=e.name.toUpperCase();if(t===`COLLISION`||t.startsWith(`COLLISION_`))return!0;e=e.parent}return!1}function Ce(e){if(Se(e))return;let t=e=>e&&!e.name.startsWith(`decal-`),n=e.geometry;if(!Array.isArray(e.material))return t(e.material)?n:void 0;let r=e.material,i=n.groups.filter(e=>t(r[e.materialIndex??0]));if(!i.length)return;if(i.length===n.groups.length)return n;let a=new Uint32Array(i.reduce((e,t)=>e+t.count,0)),o=0;for(let e of i)for(let t=e.start;t<e.start+e.count;t+=1)a[o++]=n.index?n.index.getX(t):t;return new k().setAttribute(`position`,n.getAttribute(`position`)).setIndex(new de(a,1))}async function we(){let e=await fetch(_e,{cache:`no-cache`});if(!e.ok||!e.headers.get(`content-type`)?.includes(`json`))throw Error(`还没有找到校园场景文件。`);let t=await e.json();if(typeof t.title!=`string`||!Array.isArray(t.models)||!t.models.length||!ye(t.spawn))throw Error(`校园场景缺少名称、模型或有效起点。`);if(t.overview&&(!ve(t.overview.position)||!ve(t.overview.target)))throw Error(`校园总览机位无效。`);if(t.collisionFromModels!==void 0&&typeof t.collisionFromModels!=`boolean`)throw Error(`校园碰撞来源无效。`);if(t.landingBoundary&&(!Array.isArray(t.landingBoundary)||t.landingBoundary.length<3||!t.landingBoundary.every(e=>Array.isArray(e)&&e.length===2&&e.every(Number.isFinite))))throw Error(`校园可落地区域数据无效。`);for(let e of t.models)if(typeof e?.url!=`string`||e.position!==void 0&&!ve(e.position)||e.rotationY!==void 0&&!Number.isFinite(e.rotationY)||e.surroundings!==void 0&&typeof e.surroundings!=`boolean`||e.scale!==void 0&&(!Number.isFinite(e.scale)||e.scale<=0))throw Error(`校园模型的文件路径或坐标无效。`);if(t.locations&&(!Array.isArray(t.locations)||!t.locations.every(e=>ye(e)&&typeof e.id==`string`&&typeof e.label==`string`)))throw Error(`校园地点数据无效。`);let n=new ie().setMeshoptDecoder(ue),r=new me,i=new me,[a,o]=await Promise.all([Promise.all(t.models.map(e=>n.loadAsync(be(e.url)))),!t.collisionFromModels&&t.collisionUrl?n.loadAsync(be(t.collisionUrl)):void 0]);for(let[e,n]of a.entries()){let i=t.models[e],a=new me;i.position&&a.position.fromArray(i.position),a.rotation.y=i.rotationY??0,a.scale.setScalar(i.scale??1),a.add(n.scene),i.surroundings&&a.traverse(e=>{e.userData.surroundings=!0,e.userData.shadow=!1}),r.add(a)}t.collisionFromModels?xe(r,i,Ce,!0):o?xe(o.scene,i,e=>e.userData.collision===!1?void 0:e.geometry):xe(r,i,e=>Se(e)?e.geometry:void 0);let s=new O;if(r.updateWorldMatrix(!0,!0),r.traverse(e=>{if(Se(e)){e.visible=!1;return}if(!(e instanceof M))return;let t=Array.isArray(e.material)?e.material:[e.material];e.castShadow=e.userData.shadow!==!1&&t.some(e=>!e.transparent&&(!e.name.startsWith(`decal-`)||e.alphaTest>0)),e.receiveShadow=e.userData.shadow!==!1,e.userData.surroundings||(e.geometry.boundingBox||e.geometry.computeBoundingBox(),e.geometry.boundingBox&&s.union(e.geometry.boundingBox.clone().applyMatrix4(e.matrixWorld)))}),s.isEmpty())throw Error(`校园模型中没有可见网格。`);return{manifest:t,visuals:r,collision:i,bounds:s,size:s.getSize(new C),center:s.getCenter(new C),manifestURL:_e}}var Te=-.02,Ee=-24*Math.PI/180,De=new Set([`plaza`,`walk`,`courtyard-paving`,`decal-brickline`]),Oe=`
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
`;function ke(t,n,r,o){let s=o&&t.extensions.has(`EXT_color_buffer_float`),l=new g(1,1,{type:s?v:se,minFilter:i,generateMipmaps:!0});l.texture.name=`Campus paving reflection`;let u={tCampusMirror:{value:null},uCampusMirrorProjection:{value:new e},uCampusMirrorActive:{value:0},uCampusGroundLevel:{value:Te},uCampusSiteRotation:{value:new w(Math.cos(Ee),Math.sin(Ee))}},d=new Set;r.traverse(e=>{if(!(e instanceof M))return;let t=Array.isArray(e.material)?e.material:[e.material];for(let e of t){if(!(e instanceof f)||d.has(e)||!De.has(e.name))continue;d.add(e);let t=e.onBeforeCompile.bind(e),n=e.customProgramCacheKey();e.customProgramCacheKey=()=>`${n}|campus-ground-v1`,e.onBeforeCompile=(e,n)=>{t(e,n),Object.assign(e.uniforms,u),e.vertexShader=e.vertexShader.replace(`#include <common>`,`#include <common>
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
          `)},e.needsUpdate=!0}});let p=new a,m=new C,h=new C,_=new C(1/0,1/0,1/0),y=new C,b=new w,x=new w,S=new c,E=new T,ee=new T,D=new e().set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),O=-1/0,k=!0,A=0;function j(){u.uCampusMirrorActive.value=0,k=!0}return s&&t.domElement.addEventListener(`webglcontextrestored`,j),{get active(){return u.uCampusMirrorActive.value!==0},get passes(){return A},update(e,r,i){e.getWorldPosition(m),e.getWorldDirection(h);let a=u.uCampusSiteRotation.value.x,o=u.uCampusSiteRotation.value.y;if(x.set(a*m.x+o*m.z,-o*m.x+a*m.z),!s||!i||t.xr.isPresenting||h.y>.58||m.y<.35||m.y>4.2||x.x<-20||x.x>48||x.y<-32||x.y>78){j();return}if(t.shadowMap.needsUpdate){k=!0;return}t.getDrawingBufferSize(b);let c=Math.min(.43,576/Math.max(b.x,b.y)),d=Math.max(16,Math.round(b.x*c)),f=Math.max(16,Math.round(b.y*c)),g=l.width!==d||l.height!==f,v=_.distanceToSquared(m)>.022**2||y.dot(h)<.999993;if(!g&&(!k&&!v||r-O<38))return;g&&l.setSize(d,f),p.position.copy(m),p.position.y=2*Te-m.y,p.up.setFromMatrixColumn(e.matrixWorld,1),p.up.y*=-1,h.y*=-1,p.lookAt(h.add(p.position)),p.updateMatrixWorld(!0),p.near=e.near,p.far=e.far,p.projectionMatrix.copy(e.projectionMatrix);let C=p.projectionMatrix.elements;S.normal.set(0,1,0),S.constant=.024,S.applyMatrix4(p.matrixWorldInverse),E.set(S.normal.x,S.normal.y,S.normal.z,S.constant),ee.set((Math.sign(E.x)+C[8])/C[0],(Math.sign(E.y)+C[9])/C[5],-1,(1+C[10])/C[14]);let w=E.dot(ee);if(Math.abs(w)<1e-5){u.uCampusMirrorActive.value=0;return}u.uCampusMirrorProjection.value.copy(D).multiply(p.projectionMatrix).multiply(p.matrixWorldInverse),E.multiplyScalar(2/w),C[2]=E.x,C[6]=E.y,C[10]=E.z+1,C[14]=E.w,p.projectionMatrixInverse.copy(p.projectionMatrix).invert();let T=t.getRenderTarget(),te=t.xr.enabled;u.uCampusMirrorActive.value=0,u.tCampusMirror.value=null;try{t.xr.enabled=!1,t.setRenderTarget(l),t.state.buffers.depth.setMask(!0),t.render(n,p)}finally{t.setRenderTarget(T),t.xr.enabled=te}u.tCampusMirror.value=l.texture,u.uCampusMirrorActive.value=1,_.copy(m),e.getWorldDirection(y),O=r,k=!1,A+=1},dispose(){s&&t.domElement.removeEventListener(`webglcontextrestored`,j),l.dispose()}}}var Ae=new Map([[`plaza`,[`pavers`,.31,.26,.0022]],[`walk`,[`pavers`,.3,.22,.0022]],[`courtyard-paving`,[`pavers`,.33,.24,.0022]],[`teaching-floor`,[`pavers`,.16,.38,8e-4]],[`beige`,[`masonry`,.23,.06,.0012]],[`terra`,[`masonry`,.29,.08,.0014]],[`road`,[`scanned`,.35,.14,.0034]],[`teaching-wall`,[`scanned`,.1,.02,5e-4]],[`teaching-ceiling`,[`scanned`,.075,.02,5e-4]],[`soffit`,[`scanned`,.2,.04,.0012]],[`cream`,[`scanned`,.17,.05,9e-4]],[`reveal`,[`scanned`,.19,.04,8e-4]],[`entry-stone`,[`stone`,.22,.27,.0016]],[`entry-nosing`,[`stone`,.19,.2,.0012]],[`entry-traction`,[`stone`,.23,.12,.0022]],[`stair-stone`,[`stone`,.13,.27,.0011]],[`gallery-base-stone`,[`stone`,.17,.15,.001]],[`curb`,[`stone`,.27,.09,.0026]],[`decal-brickline`,[`stone`,.27,.19,.0015]],[`decal-paint-yellow`,[`paint`,.25,.12,0]],[`decal-sports_paint`,[`paint`,.14,.09,0]]]),je=`
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
`,Me=`
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
`,Ne=`
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
`,Pe=`
  #if defined(CAMPUS_SCANNED) && defined(USE_ROUGHNESSMAP)
    #undef vRoughnessMapUv
  #endif
  roughnessFactor = clamp(roughnessFactor + campusDirt * .38 + campusJoint * .10
    + campusPores * .045 - campusWear * uCampusSurfaceResponse.y, .22, .98);
`,Fe=`
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
`;function Ie(e){let t=Ae.get(e.name);if(!t)return;let[n,r,i,a]=t,o=e.onBeforeCompile,s=e.customProgramCacheKey();e.onBeforeCompile=(t,s)=>{o.call(e,t,s),t.uniforms.uCampusSurfaceResponse={value:[r,i,a]},t.vertexShader=t.vertexShader.replace(`#include <common>`,`#include <common>
varying vec3 vCampusSurface;`).replace(`#include <project_vertex>`,`
        #include <project_vertex>
        vCampusSurface = (modelMatrix * vec4(transformed, 1.0)).xyz;
      `),t.fragmentShader=t.fragmentShader.replace(`#include <common>`,`#include <common>\n#define CAMPUS_${n.toUpperCase()}\n${je}`).replace(`#include <map_fragment>`,`${Me}\n#include <map_fragment>\n${Ne}`).replace(`#include <roughnessmap_fragment>`,`
        #if defined(CAMPUS_SCANNED) && defined(USE_ROUGHNESSMAP)
          vec2 campusRoughnessUv = vRoughnessMapUv + campusScanShift;
          #define vRoughnessMapUv campusRoughnessUv
        #endif
        #include <roughnessmap_fragment>
        ${Pe}
      `).replace(`#include <normal_fragment_maps>`,`
        #if defined(CAMPUS_SCANNED) && defined(USE_NORMALMAP_TANGENTSPACE)
          vec2 campusNormalUv = vNormalMapUv + campusScanShift;
          #define vNormalMapUv campusNormalUv
        #endif
        #include <normal_fragment_maps>
        ${Fe}
      `)},e.customProgramCacheKey=()=>`${s}|campus-surface-v2:${n}`}var Le=new C(-.69,.55,.47).normalize(),Re=new A(`#bed0d9`),ze=new A(`#568bc6`);function Be(e){let t=new S({uniforms:{uZenith:{value:ze},uHorizon:{value:Re},uCloud:{value:new A(`#f3f5ef`)},uSun:{value:Le}},vertexShader:`
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
      }`,side:1,depthTest:!1,depthWrite:!1,toneMapped:!1}),n=new M(new o(e,32,16),t);return n.renderOrder=-1e3,n.frustumCulled=!1,n}function Ve(){let e=new Uint16Array(73728),n=new A(`#69725e`),i=new A(`#fff0d7`),a=j.toHalfFloat,o=new A;for(let t=0;t<96;t+=1){let r=((t+.5)/96-.5)*Math.PI,s=Math.sin(r),c=Math.cos(r);for(let l=0;l<192;l+=1){let u=((l+.5)/192-.5)*Math.PI*2,d=Math.max(0,c*(Math.cos(u)*Le.x+Math.sin(u)*Le.z)+s*Le.y);o.copy(Re),s>=0?o.lerp(ze,m.smoothstep(s,0,.92)):o.lerp(n,m.smoothstep(-s,0,.38));let f=m.smoothstep(Math.sin(u*3+r*13.1)*.62+Math.cos(u*7-r*25.1)*.25+Math.sin(u*11+r*37)*.13,.27,.86)*m.smoothstep(s,.06,.43);o.lerp(i,f*.37).multiplyScalar(.75+Math.max(0,s)*.53);let p=.53*d**21+2.6*d**225;o.r+=i.r*p,o.g+=i.g*p,o.b+=i.b*p;let h=(t*192+l)*4;e.set([a(o.r),a(o.g),a(o.b),a(1)],h)}}let s=new te(e,192,96,t,v);return s.mapping=303,s.colorSpace=r,s.minFilter=y,s.magFilter=y,s.needsUpdate=!0,s}var He=`
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
`;function Ue(e,t,n,r,a,o,s,c){let l=t.manifest.locations?.find(e=>e.id===`gate`),u=t.manifest.locations?.find(e=>e.id===`courtyard`);if(!l||!u||!e.extensions.has(`EXT_color_buffer_float`))return;let d=new C().fromArray(u.position).add(new C(0,5.2,0)),p=new C().fromArray(l.position).lerp(d,.41);p.y=l.position[1]+5.1;let m=[p,d],h=m.map(()=>new ee(128,{type:v,generateMipmaps:!0,minFilter:i})),g=new w,_=new w,y={uCampusEntryProbe:{value:h[0].texture},uCampusCourtProbe:{value:h[1].texture},uCampusEntryProbeCenter:{value:p},uCampusCourtProbeCenter:{value:d},uCampusProbeActive:{value:g}};function x(e,t,n){let r=e.onBeforeCompile,i=e.customProgramCacheKey(),a={value:t?.88:.65};e.onBeforeCompile=(t,i)=>{r.call(e,t,i),Object.assign(t.uniforms,y,{uCampusProbeStrength:a}),t.vertexShader=t.vertexShader.replace(`#include <common>`,`#include <common>
varying vec3 vCampusProbePosition;`).replace(`#include <project_vertex>`,`
          #include <project_vertex>
          vCampusProbePosition = (modelMatrix * vec4(transformed, 1.0)).xyz;
        `);let o=ne.envmap_physical_pars_fragment.replace(`return envMapColor.rgb * envMapIntensity;`,`return campusProbeSample(reflectVec, roughness, envMapColor.rgb) * envMapIntensity;`);t.fragmentShader=t.fragmentShader.replace(`#include <common>`,`#include <common>\n${He}`).replace(`#include <envmap_physical_pars_fragment>`,o),n&&(t.fragmentShader=t.fragmentShader.replace(`#include <opaque_fragment>`,`
        float faceOn = clamp(dot(normalize(vViewPosition), normal), 0.0, 1.0);
        diffuseColor.a *= mix(0.67, 1.43, pow(1.0 - faceOn, 4.0));
        #include <opaque_fragment>
      `))},e.customProgramCacheKey=()=>`${i}|campus-probe-${n?`clear`:`opaque`}`}function S(){let i=new b;i.background=n.background,i.fog=n.fog;let l=t.visuals.clone(!0),u=new Map;l.traverse(e=>{if(!(e instanceof M))return;let t=e=>{let t=u.get(e);return t||(t=e.clone(),t.visible=e.visible&&!e.transparent,t instanceof f&&(t.envMap=null),u.set(e,t)),t};e.material=Array.isArray(e.material)?e.material.map(t):t(e.material)});let d=r.clone(),p=c.clone();p.shadow.mapSize.set(512,512),p.shadow.bias=-2e-4,p.shadow.normalBias=.04,Object.assign(p.shadow.camera,{left:-48,right:48,top:48,bottom:-48,near:55,far:185}),p.shadow.camera.updateProjectionMatrix(),i.add(l,d,a.clone(),o.clone(),s.clone(),p,p.target);let g=new oe(.2,840,h[0]);return g.coordinateSystem=e.coordinateSystem,g.updateCoordinateSystem(),{prepare(){let t=e.getRenderTarget(),n=e.getActiveCubeFace(),r=e.getActiveMipmapLevel();try{return e.setRenderTarget(h[0]),e.compileAsync(i,g.children[0])}finally{e.setRenderTarget(t,n,r)}},renderFace(t,n){let r=h[t];if(n===0){let e=m[t];d.position.copy(e),p.target.position.copy(e),p.position.copy(e).addScaledVector(Le,120),g.position.copy(e),g.updateMatrixWorld(!0)}let a=n===g.children.length-1,o=e.getRenderTarget(),s=e.getActiveCubeFace(),c=e.getActiveMipmapLevel(),l=e.xr.enabled,u=e.shadowMap.autoUpdate,f=e.shadowMap.needsUpdate;try{e.xr.enabled=!1,e.shadowMap.autoUpdate=!1,e.shadowMap.needsUpdate=n===0,r.texture.generateMipmaps=a,e.setRenderTarget(r,n),e.state.buffers.depth.setMask(!0),e.render(i,g.children[n]),a&&_.setComponent(t,1)}finally{e.setRenderTarget(o,s,c),e.xr.enabled=l,e.shadowMap.autoUpdate=u,e.shadowMap.needsUpdate=f}return a},dispose(){p.shadow.dispose();for(let e of u.values())e.dispose()}}}let T,E=0,D=0,O=0,k=!1,A;function j(){A?.(),A=void 0,T?.dispose(),T=void 0,O=0,k=!1,E=0,D=0,g.set(0,0),_.set(0,0)}e.domElement.addEventListener(`webglcontextrestored`,j);function te(t){if(g.copy(_).multiplyScalar(+!e.xr.isPresenting),D>=h.length||A||k||!t||e.xr.isPresenting)return;let n=performance.now();if(O===0&&(O=n+1050),n<O)return;let r=()=>{if(A=void 0,!(document.hidden||e.xr.isPresenting||e.getContext().isContextLost())){try{if(!T&&(T=S(),e.extensions.has(`KHR_parallel_shader_compile`))){let e=T;k=!0,e.prepare().catch(e=>console.warn(`校园反射材质预编译未完成`,e)).finally(()=>{T===e&&(k=!1)});return}T.renderFace(D,E++)&&(E=0,D+=1)}catch(e){k=!1,console.warn(`校园局部反射未能生成`,e),E=0,D+=1}O=performance.now()+45,D>=h.length&&(T?.dispose(),T=void 0)}};if(typeof window.requestIdleCallback==`function`){let e=window.requestIdleCallback(r,{timeout:250});A=()=>window.cancelIdleCallback(e)}else{let e=window.setTimeout(r,0);A=()=>window.clearTimeout(e)}}return{register:x,update:te,dispose(){A?.(),T?.dispose(),e.domElement.removeEventListener(`webglcontextrestored`,j);for(let e of h)e.dispose()}}}function We(e,t){let n=e.geometry,r=n.getAttribute(`position`);if(!r)return;let i=new C,a=[],o=new Map,s=[],c=[],l=[],u=e=>{for(;c[e]!==e;)c[e]=c[c[e]],e=c[e];return e};for(let t=0;t<r.count;t+=1){i.fromBufferAttribute(r,t).applyMatrix4(e.matrixWorld);let n=`${Math.round(i.x*500)},${Math.round(i.y*500)},${Math.round(i.z*500)}`,a=o.get(n);a===void 0&&(a=l.length,o.set(n,a),l.push(i.clone()),c.push(a)),s[t]=a}let d=n.index,f=d?.count??r.count;for(let e=0;e+2<f;e+=3){let t=u(s[d?.getX(e)??e]),n=u(s[d?.getX(e+1)??e+1]),r=u(s[d?.getX(e+2)??e+2]);c[n]=t,c[r]=t}for(let[e,t]of l.entries()){let n=u(e);(a[n]??=new O).expandByPoint(t)}for(let e of a){if(!e||e.getSize(i).lengthSq()<.14**2)continue;let n=e.getCenter(new C);n.y=e.min.y-.045,t.push(n)}}function Ge(e,t,r,i,a){let o=Math.max(i.size.x,i.size.z,30);e.fog=new D(Re,o*.46,o*2.75),t.far=Math.max(600,o*8),t.updateProjectionMatrix();let s=Be(t.far*.8),c=Math.max(3e3,o*16),l=new M(new d(c,c),new f({color:`#7f8f68`,roughness:1}));l.rotation.x=-Math.PI/2,l.position.set(i.center.x,i.bounds.min.y-.36,i.center.z);let u=new n(`#dbeaff`,`#c7beaa`,.95),p=new le(`#eae6dc`,.14),h=new fe(`#fff0d7`,3.71),g=Le.clone().multiplyScalar(o*1.3);h.castShadow=!0;let v=a?1024:2048;h.shadow.mapSize.set(v,v),h.shadow.intensity=.94,h.shadow.radius=2;let y=Ve(),b=[],x=[new _(`#fff0d8`,0,5.2,2),new _(`#fff0d8`,0,5.2,2)];e.add(s,l,u,p,h,h.target,...x);let S=new URLSearchParams(window.location.search),w=!a&&!(S.has(`debug`)&&S.get(`probe`)===`0`)?Ue(r,i,e,s,l,u,p,h):void 0;i.manifest.collisionFromModels&&i.collision.add(l.clone()),i.visuals.updateMatrixWorld(!0);let T=new Set;i.visuals.traverse(e=>{if(!(e instanceof M))return;let t=Array.isArray(e.material)?e.material:[e.material];t.every(e=>e.name===`glass-clear`)&&(e.castShadow=!1),t.every(e=>e.name===`teaching-lamp`)&&We(e,b);for(let e of t)e instanceof f&&!T.has(e)&&(T.add(e),Ie(e),e.name===`teaching-lamp`?(e.emissive.set(`#fff1db`),e.emissiveIntensity=1.05):e.name.startsWith(`glass-`)?(e.envMap=y,e.envMapIntensity=e.name===`glass-clear`?1.42:1.02,e.roughness=Math.min(e.roughness,.25),e.name!==`glass-clear`&&(e.metalness=Math.max(e.metalness,.11)),w?.register(e,!0,e.name===`glass-clear`)):[`teaching-metal`,`frame`,`blue-rail`,`blue-cap`,`stand_steel`,`entry-aluminum`,`stainless`,`entry-drain-frame`,`entry-drain-grate`].includes(e.name)?(e.envMap=y,e.envMapIntensity=.48,e.metalness=Math.max(e.metalness,.27),w?.register(e,!1,!1)):e.name===`teaching-floor`&&(e.envMap=y,e.envMapIntensity=.22))});let E=new C,ee=0;function O(e){let t,n,r=5.4**2,i=5.4**2;if(e)for(let a of b){let o=a.y-e.y;if(o<1.92||o>3.95)continue;let s=(a.x-e.x)**2+(a.z-e.z)**2;s<r?(n=t,i=r,t=a,r=s):s<i&&(n=a,i=s)}for(let[e,a]of x.entries()){let o=e?n:t,s=e?i:r;o&&a.position.copy(o),a.intensity=o?4.9*(1-m.smoothstep(s,9,5.4**2)):0}}function k(e,n,a=!0){t.getWorldPosition(s.position),w?.update(a&&e!==`overview`),O(e===`walk`?n:void 0);let o=n&&(e===`walk`||e===`fly`&&n.y<i.bounds.max.y+14),c=o?e===`walk`?25:38:Math.max(i.size.length()*.56,25);if(o?E.set(Math.round(n.x/8)*8,Math.round(n.y/8)*8,Math.round(n.z/8)*8):E.copy(i.center),ee!==c||!h.target.position.equals(E)){if(h.target.position.copy(E),h.position.copy(E).add(g),ee!==c){ee=c;let e=g.length(),t=c*2.4;Object.assign(h.shadow.camera,{left:-c,right:c,top:c,bottom:-c,near:Math.max(.1,e-t),far:e+t}),h.shadow.camera.updateProjectionMatrix(),h.shadow.bias=o?-16e-5:-11e-5,h.shadow.normalBias=o?.018:.074}r.shadowMap.needsUpdate=!0}}return{update:k,dispose(){for(let e of[s,l])e.removeFromParent(),e.geometry.dispose(),e.material.dispose();w?.dispose(),y.dispose(),h.shadow.dispose(),u.removeFromParent(),p.removeFromParent(),h.removeFromParent(),h.target.removeFromParent();for(let e of x)e.removeFromParent()}}}var Ke=`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`,qe=`
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
`,Je=`
  varying vec2 vUv;
  ${qe}

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
`,Ye=`
  varying vec2 vUv;
  uniform sampler2D tColor;
  uniform sampler2D tOcclusion;
  uniform vec2 uOcclusionSize;
  ${qe}

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
`;function Xe(e){if(!e.extensions.has(`EXT_color_buffer_float`))return;let t=new g(1,1,{type:v,depthTexture:new E(1,1,l)}),n=new g(1,1,{depthBuffer:!1,minFilter:p,magFilter:p}),r={tDepth:{value:t.depthTexture},uProjection:{value:new w},uTexel:{value:new w},uLogFar:{value:0}},i=new S({uniforms:r,vertexShader:Ke,fragmentShader:Je,depthTest:!1,depthWrite:!1,toneMapped:!1}),a=new S({uniforms:{...r,tColor:{value:t.texture},tOcclusion:{value:n.texture},uOcclusionSize:{value:new w}},vertexShader:Ke,fragmentShader:Ye,depthTest:!1,depthWrite:!1}),o=new b,s=new h,c=new M(new d(2,2),i);c.frustumCulled=!1,o.add(c);let u=new w;return{render(l,d){e.getDrawingBufferSize(u);let f=Math.min(1,Math.sqrt(35e5/(u.x*u.y))),p=Math.max(1,Math.floor(u.x*f)),m=Math.max(1,Math.floor(u.y*f));if(t.width!==p||t.height!==m){let e=Math.max(1,Math.floor(p*.5)),i=Math.max(1,Math.floor(m*.5));t.setSize(p,m),n.setSize(e,i),r.uTexel.value.set(1/p,1/m),a.uniforms.uOcclusionSize.value.set(e,i)}r.uProjection.value.set(d.projectionMatrix.elements[0],d.projectionMatrix.elements[5]),r.uLogFar.value=Math.log2(d.far+1);let h=e.info.autoReset;e.info.reset(),e.info.autoReset=!1;try{e.setRenderTarget(t),e.render(l,d),e.setRenderTarget(n),c.material=i,e.render(o,s),e.setRenderTarget(null),c.material=a,e.render(o,s)}finally{e.setRenderTarget(null),e.info.autoReset=h}},dispose(){t.dispose(),n.dispose(),c.geometry.dispose(),i.dispose(),a.dispose()}}}var Ze=new Set([`KeyW`,`KeyA`,`KeyS`,`KeyD`,`ArrowUp`,`ArrowDown`,`ShiftLeft`,`ShiftRight`,`Space`,`KeyE`,`KeyQ`,`ControlLeft`,`ControlRight`]);function Qe(e){let{surface:t,movePad:n,thumb:r,lifts:i}=e,a=new Set,o=matchMedia(`(pointer: coarse)`),s=o.matches,c=new Map,l=null,u=0,d=null,f=0,p=0,m=0;function h(){d=null,f=0,p=0,r.style.transform=``}function g(){a.clear(),l=null,c.clear(),u=0,m=0,h()}function _(){if(c.size!==2)return 0;let[e,t]=c.values();return Math.max(8,Math.hypot(e.x-t.x,e.y-t.y))}function v(t){t!==s&&(s=t,e.onDeviceChange())}function y(e){let t=n.getBoundingClientRect(),i=t.width*.31,a=(e.clientX-t.left-t.width/2)/i,o=(e.clientY-t.top-t.height/2)/i,s=Math.hypot(a,o),c=Math.max(1,s);f=s>.08?a/c:0,p=s>.08?-o/c:0,r.style.transform=`translate(${f*i}px, ${-p*i}px)`}o.addEventListener(`change`,e=>v(e.matches)),window.addEventListener(`pointerdown`,e=>{e.pointerType===`touch`?v(!0):e.pointerType===`mouse`&&!o.matches&&v(!1)}),t.addEventListener(`pointerdown`,e=>{if(e.button!==0)return;let n={x:e.clientX,y:e.clientY};if(e.pointerType===`touch`)l=c.size===0?{id:e.pointerId,...n}:null,c.set(e.pointerId,n),u=_();else{if(l||c.size>0)return;l={id:e.pointerId,...n}}t.setPointerCapture(e.pointerId)}),t.addEventListener(`pointermove`,t=>{let n=c.get(t.pointerId);if(!n)return;n.x=t.clientX,n.y=t.clientY;let r=_();r&&u&&e.mode()!==`overview`&&e.zoom(r/u),u=r});for(let r of[`pointerup`,`pointercancel`,`lostpointercapture`])t.addEventListener(r,t=>{if(c.delete(t.pointerId)&&(u=_()),t.pointerId!==l?.id)return;let n=t.clientX-l.x,i=t.clientY-l.y;l=null,r===`pointerup`&&Math.abs(n)>=36&&Math.abs(n)>Math.abs(i)*1.2&&e.turn(n<0?-1:1)}),n.addEventListener(r,e=>{e.pointerId===d&&h()});t.addEventListener(`wheel`,n=>{if(e.mode()===`overview`||!n.deltaY)return;n.preventDefault();let r=n.deltaMode===WheelEvent.DOM_DELTA_LINE?16:n.deltaMode===WheelEvent.DOM_DELTA_PAGE?t.clientHeight:1,i=Math.max(-160,Math.min(160,n.deltaY*r));e.zoom(Math.exp(-i*.002))},{passive:!1}),n.addEventListener(`pointerdown`,e=>{d===null&&(d=e.pointerId,n.setPointerCapture(e.pointerId),y(e))}),n.addEventListener(`pointermove`,e=>{e.pointerId===d&&y(e)});for(let e of i.querySelectorAll(`button`)){let t=Number(e.dataset.lift),n=null;e.addEventListener(`pointerdown`,r=>{n===null&&(n=r.pointerId,e.setPointerCapture(r.pointerId),m=t)});for(let r of[`pointerup`,`pointercancel`,`lostpointercapture`])e.addEventListener(r,e=>{e.pointerId===n&&(n=null,m===t&&(m=0))})}window.addEventListener(`keydown`,t=>{t.target instanceof HTMLElement&&t.target.closest(`input, select, textarea, button, a, [contenteditable]`)||(t.ctrlKey||t.metaKey||t.altKey)&&t.code!==`ControlLeft`&&t.code!==`ControlRight`||(t.code===`ArrowLeft`||t.code===`ArrowRight`?(t.preventDefault(),t.repeat||e.turn(t.code===`ArrowLeft`?-1:1)):(Ze.has(t.code)&&e.mode()!==`overview`&&(t.preventDefault(),a.add(t.code)),t.repeat||(t.code===`Digit1`&&e.setMode(`overview`),t.code===`Digit2`&&e.setMode(`walk`),t.code===`Digit3`&&e.setMode(`fly`),t.code===`KeyR`&&e.reset())))}),window.addEventListener(`keyup`,e=>a.delete(e.code)),window.addEventListener(`blur`,g),document.addEventListener(`visibilitychange`,()=>{document.hidden&&g()});let b=(...e)=>e.some(e=>a.has(e));return{get touch(){return s},get side(){return Number(b(`KeyD`))-Number(b(`KeyA`))+f},get ahead(){return Number(b(`KeyW`,`ArrowUp`))-Number(b(`KeyS`,`ArrowDown`))+p},get lift(){return Number(b(`Space`,`KeyE`))-Number(b(`ControlLeft`,`ControlRight`,`KeyQ`))+m},get running(){return b(`ShiftLeft`,`ShiftRight`)},get jumping(){return b(`Space`)},releaseAll:g}}var $e=new C(0,-1,0),et=.27,tt=1.8,nt=[-.27,0,et];function rt(e,t,n){let r=!1;for(let i=0,a=e.length-1;i<e.length;a=i++){let[o,s]=e[i],[c,l]=e[a];s>n!=l>n&&t<(c-o)*(n-s)/(l-s)+o&&(r=!r)}return r}function it(t){let n=[],r=new e;return t.traverse(e=>{if(!(e instanceof M))return;let t=e.geometry,i=t.getAttribute(`position`);if(!i)return;let a=t.index,o=a?.count??i.count,s=e instanceof pe?e.count:1,c=e=>new C().fromBufferAttribute(i,a?.getX(e)??e).applyMatrix4(r);for(let t=0;t<s;t++){e instanceof pe?(e.getMatrixAt(t,r),r.premultiply(e.matrixWorld)):r.copy(e.matrixWorld);for(let e=0;e+2<o;e+=3){let t=new u(c(e),c(e+1),c(e+2));n.push({triangle:t,bounds:new O().setFromPoints([t.a,t.b,t.c])})}}}),n}function at(t,n){t.updateWorldMatrix(!0,!0);let r=new O().setFromObject(t),i=it(t),a=new x,o=new C,s=new C,c=new e,l=new re,u=new O;function d(e){return!e.face||!(e.object instanceof M)||(Array.isArray(e.object.material)?e.object.material[e.face.materialIndex]:e.object.material)?.name!==`walkable`?!1:(e.object instanceof pe&&e.instanceId!==void 0?(e.object.getMatrixAt(e.instanceId,c),c.premultiply(e.object.matrixWorld)):c.copy(e.object.matrixWorld),s.copy(e.face.normal).applyNormalMatrix(l.getNormalMatrix(c)).normalize(),s.y>=.707)}function f(e,i){if(!rt(n,e,i))return;a.set(o.set(e,r.max.y+1,i),$e);let s=a.intersectObject(t,!0)[0];return s&&d(s)?s.point.y:void 0}return e=>{let{x:t,y:n,z:r}=e;if(![t,n,r].every(Number.isFinite))return;let a=f(t,r);if(!(a===void 0||n<a+.3)){for(let e of nt)for(let n of nt){if(e===0&&n===0)continue;let i=f(t+e,r+n);if(i===void 0||Math.abs(i-a)>.18)return}if(u.min.set(t-et,a+.05,r-et),u.max.set(t+et,a+tt,r+et),!i.some(({bounds:e,triangle:t})=>e.intersectsBox(u)&&u.intersectsTriangle(t)))return new C(t,a+.035,r)}}}var ot=new C(0,1,0),st=.18;function ct(e,t){t.set(0,0);for(let n of e){let e=n.gamepad;if(!e||e.axes.length<2)continue;let r=e.mapping===`xr-standard`&&e.axes.length>=4?2:0,i=e.axes[r],a=e.axes[r+1];if(!(!Number.isFinite(i)||!Number.isFinite(a)||Math.hypot(i,a)<st)){if(n.handedness===`left`)return t.set(i,a);t.lengthSq()===0&&t.set(i,a)}}return t}function lt(){let e=new ge,t=new C,n=new C,r=new w;return(i,a,o,s)=>{let{x:c,y:l,z:u,w:d}=i;return e.set(c,l,u,d),t.set(0,0,-1).applyQuaternion(e).applyAxisAngle(ot,a),t.y=0,t.lengthSq()<1e-4&&t.set(-Math.sin(a),0,-Math.cos(a)),t.normalize(),n.crossVectors(t,ot),ct(o,r),s.copy(n).multiplyScalar(r.x).addScaledVector(t,-r.y).clampLength(0,1)}}var ut=1.64;function dt(e){let t=new he(0,0,0,`YXZ`);return(n,r,i)=>{e.position.copy(n),e.position.y+=ut,e.quaternion.setFromEuler(t.set(i,r,0))}}var ft=`modulepreload`,pt=function(e,t){return new URL(e,t).href},mt={},ht=function(e){return e.pathname.endsWith(`.css`)},gt=function(e,t,n){if(t in e)return e[t];let r=n();if(!r){e[t]=void 0;return}let i=r.then(()=>{e[t]=void 0},n=>{throw e[t]=void 0,n});return e[t]=i,i},_t=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e,i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}function s(e){return import.meta.resolve?new URL(import.meta.resolve(e)):new URL(e,import.meta.url)}r=o(t.map(t=>{t=pt(t,n);let r=s(t),i=ht(r);return gt(mt,r.href,()=>{if(e===void 0){e={all:new Set,styles:new Set};let t=document.getElementsByTagName(`link`);for(let n=t.length-1;n>=0;n--){let r=t[n];e.all.add(r.href),r.rel===`stylesheet`&&e.styles.add(r.href)}}if((i?e.styles:e.all).has(r.href))return;let t=document.createElement(`link`);if(t.rel=i?`stylesheet`:ft,i||(t.as=`script`),t.crossOrigin=``,t.href=r.href,a&&t.setAttribute(`nonce`,a),document.head.appendChild(t),i)return new Promise((e,n)=>{t.addEventListener(`load`,e),t.addEventListener(`error`,()=>n(Error(`Unable to preload CSS for ${r}`)))})})}).filter(e=>e!==void 0))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})},N=e=>document.getElementById(e),vt=N(`app`),P=N(`viewport`),yt=N(`notice`),bt=N(`about`),xt=N(`about-panel`),St=N(`fullscreen`),Ct=N(`vr`),wt=N(`location`),Tt=[...vt.querySelectorAll(`.mode-controls [data-mode]`)],Et=N(`direction-controls`),Dt=[...Et.querySelectorAll(`[data-heading]`)],Ot=[...Et.querySelectorAll(`[data-turn]`)],kt=N(`reset`),At=N(`controls-hint`),jt=N(`diagnostics`),Mt=new URLSearchParams(window.location.search),Nt=Mt.has(`debug`),Pt=!Nt||Mt.get(`occlusion`)!==`0`,Ft=!Nt||Mt.get(`reflection`)!==`0`,F=[{id:`north`,label:`北`,yaw:0},{id:`east`,label:`东`,yaw:-Math.PI/2},{id:`south`,label:`南`,yaw:Math.PI},{id:`west`,label:`西`,yaw:Math.PI/2}],It=new C,Lt=new C,Rt=new C,I=new C,L=new C,R=new C,zt=lt(),Bt=new C,Vt=new C,z=`overview`,B,V,Ht,H,Ut,Wt,Gt,U=0,W=0,Kt=0,qt=1,G=!1,Jt=!1,Yt,K,Xt=``,Zt,q=new b;q.background=new A(`#b9d5e7`);var J=new a(57,1,.07,1600),Y=new me;Y.add(J),q.add(Y);var Qt=dt(J),X=new ce(J,P);X.enabled=!1,X.enableDamping=!0,X.dampingFactor=.095,X.maxPolarAngle=Math.PI/2-.035,X.minDistance=5,X.zoomSpeed=.95,X.enableRotate=!1,X.enablePan=!0;function $t(e){G&&!K&&e!==U&&(U=e,z===`overview`?on():$(),rn())}function en(e){$t(m.euclideanModulo(U+e,F.length))}function tn(){J.zoom=z===`overview`?1:qt,J.updateProjectionMatrix()}function nn(e){!G||z===`overview`||K||!Number.isFinite(e)||e<=0||(qt=m.clamp(qt*e,.78,2.5),tn())}var Z=Qe({surface:P,movePad:N(`move-pad`),thumb:N(`move-thumb`),lifts:N(`vertical-buttons`),mode:()=>z,setMode:fn,reset:dn,turn:en,zoom:nn,onDeviceChange:Q});function rn(){for(let e of Dt)e.setAttribute(`aria-pressed`,String(e.dataset.heading===F[U].id))}function Q(){let e=!!(B&&G);vt.dataset.mode=z;for(let t of Tt){let n=t.dataset.mode;t.disabled=!e||n===`walk`&&!V,t.setAttribute(`aria-pressed`,String(z===n))}kt.disabled=!e,Et.hidden=!e||!!K,rn(),N(`reticle`).hidden=!e||z===`overview`||Z.touch,N(`move-pad`).hidden=!e||z===`overview`||!Z.touch,N(`vertical-buttons`).hidden=!e||z!==`fly`||!Z.touch,At.hidden=!e,e&&(At.textContent=Xt||(Z.touch?{overview:`单指左右滑动转向 · 双指缩放和平移`,walk:`摇杆移动 · 单指左右滑动转向 · 双指缩放`,fly:`摇杆移动 · 单指左右滑动转向 · 双指缩放`}:{overview:`← → 转向 · 滚轮缩放 · 右键拖动平移`,walk:`WASD 移动 · ← → 转向 · 滚轮缩放`,fly:`WASD 移动 · E 上升 · Q 下降 · ← → 转向`})[z])}var an=e=>Math.max(1,1.05/e);function on(){let{yaw:e}=F[U],t=Math.hypot(J.position.x-X.target.x,J.position.z-X.target.z);J.position.x=X.target.x+Math.sin(e)*t,J.position.z=X.target.z+Math.cos(e)*t,X.update()}function sn(){if(!B)return;let e=B.manifest.overview,t=Math.max(B.size.x,B.size.z,B.size.y,12);e?(X.target.fromArray(e.target),J.position.fromArray(e.position)):(X.target.copy(B.center),J.position.copy(B.center).add(Bt.set(t*.55,t*.65,t*.68))),J.position.copy(Vt.subVectors(J.position,X.target).multiplyScalar(an(J.aspect)).add(X.target)),X.minDistance=Math.max(3,t*.025),X.maxDistance=Math.max(t*3,J.position.distanceTo(X.target)*1.6),on()}function $(){let e=z===`walk`?V?.position:L;e&&z!==`overview`&&!K&&Qt(e,F[U].yaw,W)}function cn(e,t=0){U=m.euclideanModulo(Math.round(-(e.yaw??0)/(Math.PI/2)),F.length),W=e.pitch??t}function ln(e){Bt.fromArray(e.position),V?.teleport(Bt),I.copy(Bt),cn(e),Kt=W}function un(){window.clearTimeout(Zt),Xt=``}function dn(){B&&!K&&(un(),Z.releaseAll(),qt=1,tn(),z===`overview`?(cn(B.manifest.spawn),sn(),Q()):(ln(B.manifest.spawn),z===`fly`&&(L.fromArray(B.manifest.spawn.position),L.y+=Math.max(10,B.size.y*.6),W=-.2),$(),Q()))}function fn(e,t){if(!G||!B||K||e===`walk`&&!V||e===z&&!t)return;let n=z;un();let r;n===`fly`&&e===`walk`&&!t&&V&&(r=B.manifest.collisionFromModels?V.findLanding(L):Ht?.(Bt.copy(L).addScaledVector(J.up,ut)),!r&&(B.manifest.collisionFromModels||Ht))?(Xt=`脚下没有足够的落脚空间`,Zt=window.setTimeout(()=>{Xt=``,Q()},3e3),Q()):(z===`walk`&&(Kt=W),Z.releaseAll(),e===`fly`&&(n===`walk`&&V?L.copy(V.position):(L.fromArray(B.manifest.spawn.position),L.y+=Math.max(10,B.size.y*.6)),W=-.22),z=e,X.enabled=e===`overview`,tn(),e===`overview`&&sn(),e===`walk`&&V&&(t?ln(t):r?(V.teleport(r),I.copy(r),W=Kt):(V.teleport(I),W=Kt)),$(),Q())}function pn(){let e=B?.manifest.locations?.find(e=>e.id===wt.value);e&&!K&&(V?fn(`walk`,e):(fn(`fly`),L.fromArray(e.position),L.y+=2,cn(e,-.12),$(),rn()),wt.value=``,P.focus({preventScroll:!0}))}function mn(){let e=P.clientWidth,t=P.clientHeight;if(!e||!t)return;let n=an(J.aspect);if(J.aspect=e/t,J.updateProjectionMatrix(),B&&z===`overview`){let e=an(J.aspect)/n;J.position.copy(Vt.subVectors(J.position,X.target).multiplyScalar(e).add(X.target)),X.maxDistance=Math.max(X.maxDistance,J.position.distanceTo(X.target)*1.6),X.update()}H&&!K&&(H.setPixelRatio(Math.min(devicePixelRatio,Z.touch?1.5:2)),H.setSize(e,t,!1))}function hn(e){let{yaw:t}=F[U];if(It.set(-Math.sin(t),0,-Math.cos(t)),Lt.set(Math.cos(t),0,-Math.sin(t)),Rt.copy(It).multiplyScalar(Z.ahead).addScaledVector(Lt,Z.side),Rt.clampLength(0,1),z===`walk`&&V){V.update(e,Rt,Z.running,Z.jumping),V.grounded&&I.copy(V.position),B&&V.position.y<B.bounds.min.y-8&&V.teleport(I),$();return}if(!B)return;let n=Z.running?22:9,r=m.clamp(Z.lift,-1,1),i=B.manifest.collisionFromModels&&V,a=i?0:Math.max(25,Math.max(B.size.x,B.size.z)*.4);R.copy(L).addScaledVector(Rt,e*n),i||(R.x=m.clamp(R.x,B.bounds.min.x-a,B.bounds.max.x+a),R.z=m.clamp(R.z,B.bounds.min.z-a,B.bounds.max.z+a)),L.copy(V?.constrainFlight(L,R)??R),R.copy(L),R.y+=r*n*e,i||(R.y=m.clamp(R.y,B.bounds.min.y+.02,B.bounds.max.y+a*2)),L.copy(V?.constrainFlight(L,R)??R),$()}function gn(e,t){if(!V||!K||!t)return;let n=H.xr.getReferenceSpace(),r=n&&t.getViewerPose(n);r&&(zt(r.transform.orientation,Y.rotation.y,K.inputSources,Rt),V.update(e,Rt,!1,!1),V.grounded&&I.copy(V.position),B&&V.position.y<B.bounds.min.y-8&&V.teleport(I),Y.position.copy(V.position))}async function _n(){if(navigator.xr&&V&&window.isSecureContext)try{if(!await navigator.xr.isSessionSupported(`immersive-vr`))return;Ct.hidden=!1}catch{}}async function vn(){if(V&&navigator.xr&&!K){Ct.disabled=!0;try{let e=await navigator.xr.requestSession(`immersive-vr`,{requiredFeatures:[`local-floor`]});fn(`walk`),K=e,Z.releaseAll(),Q(),Y.position.copy(V.position),Y.rotation.y=F[U].yaw,J.position.set(0,0,0),J.quaternion.identity(),e.addEventListener(`end`,()=>{K=void 0,Y.position.set(0,0,0),Y.rotation.y=0,$(),Ct.disabled=!1,Q(),queueMicrotask(mn)},{once:!0}),await H.xr.setSession(e)}catch(e){K&&K.end().catch(()=>{}),Ct.disabled=!1,console.warn(`未能进入头显 VR`,e),At.textContent=`暂时无法进入头显，请检查浏览器的 VR 连接。`}}}function yn(e,t){let n=Math.min(.1,Yt===void 0?0:(e-Yt)/1e3);Yt=e,G&&(K?gn(n,t):z===`overview`?X.update(n):hn(n));let r=z===`walk`?V?.position:z===`fly`?L:void 0;if(Ut?.update(z,r,Jt),Wt?.update(J,e,G&&z===`walk`),G&&z!==`overview`&&!Z.touch&&!H.xr.isPresenting&&Gt?Gt.render(q,J):H.render(q,J),Jt||(Jt=!0,yt.hidden=!0),Nt){let e=J.position.toArray().map(e=>e.toFixed(2)).join(`, `),{calls:t,triangles:n}=H.info.render,i=(z===`overview`?V?.position:r)?.toArray().map(e=>e.toFixed(2)).join(`, `)??`—`,a=F[U];jt.textContent=`${z}${z===`walk`&&V?.grounded?` grounded`:``}\n${e}\n${t} draws · ${n.toLocaleString()} tris\nheading ${a.yaw.toFixed(3)}\nfeet ${i}\nfacing ${a.label}\nzoom ${J.zoom.toFixed(3)}\nmirror ${Wt?.active?`on`:`off`} · ${Wt?.passes??0} captures`}}function bn(e){let t=e??xt.hidden;xt.hidden=!t,bt.setAttribute(`aria-expanded`,String(t))}function xn(e,t){if(N(`campus-title`).textContent=e.title,document.title=`${e.title} · 3D 校园`,N(`campus-status`).textContent=e.status??`3D 校园`,N(`description`).textContent=e.description??e.status??`可从总览、飞行和步行视角查看校园场景。`,e.evidenceUrl){let n=new URL(e.evidenceUrl,t);if(n.protocol===`https:`||n.protocol===`http:`){let e=N(`evidence`);e.href=n.href,e.hidden=!1}}for(let t of e.locations??[])wt.add(new Option(t.label,t.id));N(`location-wrap`).hidden=wt.options.length<2}async function Sn(){try{let e=_t(()=>import(`./player-CzudtN9h.js`).then(async e=>(await e.preparePlayerPhysics(),e)),__vite__mapDeps([0,1,2]),import.meta.url).catch(e=>({loadError:e}));if(H=new ae({antialias:!0,powerPreference:`high-performance`,logarithmicDepthBuffer:!0}),H.outputColorSpace=s,H.toneMapping=6,H.toneMappingExposure=1.04,H.shadowMap.enabled=!0,H.shadowMap.autoUpdate=!1,H.shadowMap.type=1,H.xr.enabled=!0,H.xr.setReferenceSpaceType(`local-floor`),!Z.touch&&Pt&&(Gt=Xe(H)),P.tabIndex=0,P.appendChild(H.domElement),new ResizeObserver(mn).observe(P),mn(),jt.hidden=!Nt,St.hidden=!document.fullscreenEnabled,B=await we(),q.add(B.visuals),Ut=Ge(q,J,H,B,Z.touch),Wt=ke(H,q,B.visuals,Ft&&!Z.touch),xn(B.manifest,B.manifestURL),B.collision.children.length)try{let t=await e;if(`loadError`in t)throw t.loadError;V=await t.createPlayerController(B.collision,new C().fromArray(B.manifest.spawn.position),{object:new me,updateMotion(){},dispose(){}},B.manifest.collisionFromModels),!B.manifest.collisionFromModels&&B.manifest.landingBoundary&&(Ht=at(B.collision,B.manifest.landingBoundary))}catch(e){console.warn(`校园碰撞载入失败`,e),N(`description`).append(` 本次载入未启用步行。`)}!V&&B.collision.children.length===0&&N(`description`).append(` 当前场景支持总览与飞行。`),ln(B.manifest.spawn),G=!0,V?fn(`walk`):(sn(),Q()),H.setAnimationLoop(yn),_n()}catch(e){console.error(e),N(`loading-mark`).hidden=!0,N(`notice-title`).textContent=`场景未能加载`,N(`notice-detail`).textContent=e instanceof Error?e.message:`请重新加载页面。`,N(`retry`).hidden=!1}}for(let e of Tt)e.addEventListener(`click`,()=>{fn(e.dataset.mode),P.focus({preventScroll:!0})});for(let e of Dt)e.addEventListener(`click`,()=>{let t=F.findIndex(t=>t.id===e.dataset.heading);t!==-1&&$t(t),P.focus({preventScroll:!0})});for(let e of Ot)e.addEventListener(`click`,()=>{en(e.dataset.turn===`left`?-1:1),P.focus({preventScroll:!0})});kt.addEventListener(`click`,()=>{dn(),P.focus({preventScroll:!0})}),bt.addEventListener(`click`,()=>bn()),document.addEventListener(`keydown`,e=>{e.key===`Escape`&&!xt.hidden&&(bn(!1),bt.focus())}),St.addEventListener(`click`,async()=>{try{document.fullscreenElement?await document.exitFullscreen():await vt.requestFullscreen()}catch{}}),document.addEventListener(`fullscreenchange`,()=>{St.lastChild.textContent=document.fullscreenElement?`退出全屏`:`全屏`}),Ct.addEventListener(`click`,()=>void vn()),wt.addEventListener(`change`,pn),N(`retry`).addEventListener(`click`,()=>window.location.reload()),window.addEventListener(`pagehide`,e=>{e.persisted||(V?.dispose(),Ut?.dispose(),Wt?.dispose(),Gt?.dispose(),X.dispose(),H&&(H.setAnimationLoop(null),H.dispose()))}),Sn();