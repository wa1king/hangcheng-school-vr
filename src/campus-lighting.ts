import * as THREE from 'three';
import { createCampusBakedLight } from './campus-baked-light.ts';
import { loadCampusPhotoSky } from './campus-photo-sky.ts';
import { applyCampusWeathering } from './campus-surfaces.ts';
import type { loadCampus } from './campus.ts';
import type { Mode } from './input.ts';

type Campus = Awaited<ReturnType<typeof loadCampus>>;

const sunDirection = new THREE.Vector3(-0.69, 0.55, 0.47).normalize();
const haze = new THREE.Color('#bed0d9');
const zenith = new THREE.Color('#568bc6');
const obliqueSurfaceMaterials = new Set([
  'ground', 'plaza', 'walk', 'courtyard-paving', 'road', 'planter', 'plaza-inlay',
  'street-paving', 'street-curb', 'street-verge', 'street-soil', 'teaching-floor',
]);

function createSky(radius: number) {
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uZenith: { value: zenith },
      uHorizon: { value: haze },
      uCloud: { value: new THREE.Color('#f3f5ef') },
      uSun: { value: sunDirection },
    },
    vertexShader: `
      varying vec3 vDirection;
      void main() {
        vDirection = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `
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
      }`,
    side: THREE.BackSide,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 16), material);
  mesh.renderOrder = -1000;
  mesh.frustumCulled = false;
  return mesh;
}

function createSkyReflection() {
  const width = 192, height = 96;
  const pixels = new Uint16Array(width * height * 4);
  const ground = new THREE.Color('#69725e');
  const sunlight = new THREE.Color('#fff0d7');
  const toHalf = THREE.DataUtils.toHalfFloat;
  const color = new THREE.Color();
  for (let y = 0; y < height; y += 1) {
    const latitude = ((y + 0.5) / height - 0.5) * Math.PI;
    const elevation = Math.sin(latitude);
    const horizontal = Math.cos(latitude);
    for (let x = 0; x < width; x += 1) {
      const longitude = ((x + 0.5) / width - 0.5) * Math.PI * 2;
      const sun = Math.max(0, horizontal * (Math.cos(longitude) * sunDirection.x
        + Math.sin(longitude) * sunDirection.z) + elevation * sunDirection.y);
      color.copy(haze);
      if (elevation >= 0) color.lerp(zenith, THREE.MathUtils.smoothstep(elevation, 0, 0.92));
      else color.lerp(ground, THREE.MathUtils.smoothstep(-elevation, 0, 0.38));
      const cloud = THREE.MathUtils.smoothstep(
        Math.sin(longitude * 3.0 + latitude * 13.1) * 0.62
          + Math.cos(longitude * 7.0 - latitude * 25.1) * 0.25
          + Math.sin(longitude * 11 + latitude * 37.0) * 0.13,
        0.27, 0.86,
      ) * THREE.MathUtils.smoothstep(elevation, 0.06, 0.43);
      color.lerp(sunlight, cloud * 0.37).multiplyScalar(0.75 + Math.max(0, elevation) * 0.53);
      const intensity = 0.53 * sun ** 21 + 2.6 * sun ** 225;
      color.r += sunlight.r * intensity;
      color.g += sunlight.g * intensity;
      color.b += sunlight.b * intensity;
      const index = (y * width + x) * 4;
      pixels.set([toHalf(color.r), toHalf(color.g), toHalf(color.b), toHalf(1)], index);
    }
  }
  const texture = new THREE.DataTexture(pixels, width, height, THREE.RGBAFormat, THREE.HalfFloatType);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.LinearSRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

const localReflectionShader = /* glsl */`
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
`;

function createLocalReflections(
  renderer: THREE.WebGLRenderer, campus: Campus, scene: THREE.Scene, sky: THREE.Mesh,
  backdrop: THREE.Mesh, fill: THREE.HemisphereLight, bounce: THREE.AmbientLight, sun: THREE.DirectionalLight,
) {
  const gate = campus.manifest.locations?.find(location => location.id === 'gate');
  const court = campus.manifest.locations?.find(location => location.id === 'courtyard');
  if (!gate || !court || !renderer.extensions.has('EXT_color_buffer_float')) return;
  const courtCenter = new THREE.Vector3().fromArray(court.position).add(new THREE.Vector3(0, 5.2, 0));
  const gateCenter = new THREE.Vector3().fromArray(gate.position).lerp(courtCenter, .41);
  gateCenter.y = gate.position[1] + 5.1;
  const centers = [gateCenter, courtCenter];
  const targets = centers.map(() => new THREE.WebGLCubeRenderTarget(128, {
    type: THREE.HalfFloatType,
    generateMipmaps: true,
    minFilter: THREE.LinearMipmapLinearFilter,
  }));
  const active = new THREE.Vector2();
  const baked = new THREE.Vector2();
  const uniforms = {
    uCampusEntryProbe: { value: targets[0].texture },
    uCampusCourtProbe: { value: targets[1].texture },
    uCampusEntryProbeCenter: { value: gateCenter },
    uCampusCourtProbeCenter: { value: courtCenter },
    uCampusProbeActive: { value: active },
  };

  function register(material: THREE.MeshStandardMaterial, glass: boolean, clear: boolean) {
    const compile = material.onBeforeCompile;
    const programKey = material.customProgramCacheKey();
    const probeStrength = { value: glass ? .88 : .65 };
    material.onBeforeCompile = (shader, webgl) => {
      compile.call(material, shader, webgl);
      Object.assign(shader.uniforms, uniforms, { uCampusProbeStrength: probeStrength });
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vCampusProbePosition;')
        .replace('#include <project_vertex>', `
          #include <project_vertex>
          vCampusProbePosition = (modelMatrix * vec4(transformed, 1.0)).xyz;
        `);
      const lighting = THREE.ShaderChunk.envmap_physical_pars_fragment.replace(
        'return envMapColor.rgb * envMapIntensity;',
        'return campusProbeSample(reflectVec, roughness, envMapColor.rgb) * envMapIntensity;',
      );
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', `#include <common>\n${localReflectionShader}`)
        .replace('#include <envmap_physical_pars_fragment>', lighting);
      if (clear) shader.fragmentShader = shader.fragmentShader.replace('#include <opaque_fragment>', `
        float faceOn = clamp(dot(normalize(vViewPosition), normal), 0.0, 1.0);
        diffuseColor.a *= mix(0.67, 1.43, pow(1.0 - faceOn, 4.0));
        #include <opaque_fragment>
      `);
    };
    material.customProgramCacheKey = () => `${programKey}|campus-probe-${clear ? 'clear' : 'opaque'}`;
  }

  function createCapture() {
    const capture = new THREE.Scene();
    capture.background = scene.background;
    capture.fog = scene.fog;
    const geometry = campus.visuals.clone(true);
    const copies = new Map<THREE.Material, THREE.Material>();
    geometry.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return;
      const passive = (source: THREE.Material) => {
        let material = copies.get(source);
        if (!material) {
          material = source.clone();
          material.visible = source.visible && !source.transparent;
          if (material instanceof THREE.MeshStandardMaterial) material.envMap = null;
          copies.set(source, material);
        }
        return material;
      };
      object.material = Array.isArray(object.material) ? object.material.map(passive) : passive(object.material);
    });
    const captureSky = sky.clone();
    const captureSun = sun.clone();
    captureSun.shadow.mapSize.set(512, 512);
    captureSun.shadow.bias = -.0002;
    captureSun.shadow.normalBias = .04;
    Object.assign(captureSun.shadow.camera, { left: -48, right: 48, top: 48, bottom: -48, near: 55, far: 185 });
    captureSun.shadow.camera.updateProjectionMatrix();
    capture.add(geometry, captureSky, backdrop.clone(), fill.clone(), bounce.clone(), captureSun, captureSun.target);
    const camera = new THREE.CubeCamera(.2, 840, targets[0]);
    camera.coordinateSystem = renderer.coordinateSystem;
    camera.updateCoordinateSystem();

    return {
      prepare() {
        const previousTarget = renderer.getRenderTarget();
        const previousFace = renderer.getActiveCubeFace();
        const previousMip = renderer.getActiveMipmapLevel();
        try {
          renderer.setRenderTarget(targets[0]);
          return renderer.compileAsync(capture, camera.children[0] as THREE.PerspectiveCamera);
        } finally {
          renderer.setRenderTarget(previousTarget, previousFace, previousMip);
        }
      },
      renderFace(index: number, face: number) {
        const target = targets[index];
        if (face === 0) {
          const center = centers[index];
          captureSky.position.copy(center);
          captureSun.target.position.copy(center);
          captureSun.position.copy(center).addScaledVector(sunDirection, 120);
          camera.position.copy(center);
          camera.updateMatrixWorld(true);
        }
        const lastFace = face === camera.children.length - 1;
        const previousTarget = renderer.getRenderTarget();
        const previousFace = renderer.getActiveCubeFace();
        const previousMip = renderer.getActiveMipmapLevel();
        const xr = renderer.xr.enabled;
        const shadowAuto = renderer.shadowMap.autoUpdate;
        const shadowNeedsUpdate = renderer.shadowMap.needsUpdate;
        try {
          renderer.xr.enabled = false;
          renderer.shadowMap.autoUpdate = false;
          renderer.shadowMap.needsUpdate = face === 0;
          target.texture.generateMipmaps = lastFace;
          renderer.setRenderTarget(target, face);
          renderer.state.buffers.depth.setMask(true);
          renderer.render(capture, camera.children[face] as THREE.PerspectiveCamera);
          if (lastFace) baked.setComponent(index, 1);
        } finally {
          renderer.setRenderTarget(previousTarget, previousFace, previousMip);
          renderer.xr.enabled = xr;
          renderer.shadowMap.autoUpdate = shadowAuto;
          renderer.shadowMap.needsUpdate = shadowNeedsUpdate;
        }
        return lastFace;
      },
      dispose() {
        captureSun.shadow.dispose();
        for (const material of copies.values()) material.dispose();
      },
    };
  }

  let capture: ReturnType<typeof createCapture> | undefined;
  let face = 0;
  let next = 0;
  let nextCaptureAt = 0;
  let compiling = false;
  let cancelCapture: (() => void) | undefined;
  function resetAfterContextRestore() {
    cancelCapture?.();
    cancelCapture = undefined;
    capture?.dispose();
    capture = undefined;
    nextCaptureAt = 0;
    compiling = false;
    face = 0;
    next = 0;
    active.set(0, 0);
    baked.set(0, 0);
  }
  renderer.domElement.addEventListener('webglcontextrestored', resetAfterContextRestore);

  function update(walking: boolean) {
    active.copy(baked).multiplyScalar(renderer.xr.isPresenting ? 0 : 1);
    if (next >= targets.length || cancelCapture || compiling || !walking || renderer.xr.isPresenting) return;
    const now = performance.now();
    if (nextCaptureAt === 0) nextCaptureAt = now + 1050;
    if (now < nextCaptureAt) return;
    // Build one cube face at a time after the first interactive frames.
    const renderNextFace = () => {
      cancelCapture = undefined;
      if (document.hidden || renderer.xr.isPresenting || renderer.getContext().isContextLost()) return;
      try {
        if (!capture) {
          capture = createCapture();
          if (renderer.extensions.has('KHR_parallel_shader_compile')) {
            const preparing = capture;
            compiling = true;
            void preparing.prepare().catch(error => console.warn('校园反射材质预编译未完成', error)).finally(() => {
              if (capture === preparing) compiling = false;
            });
            return;
          }
        }
        if (capture.renderFace(next, face++)) {
          face = 0;
          next += 1;
        }
      } catch (error) {
        // Materials keep their sky reflections if a driver cannot render the probe.
        compiling = false;
        console.warn('校园局部反射未能生成', error);
        face = 0;
        next += 1;
      }
      nextCaptureAt = performance.now() + 45;
      if (next >= targets.length) {
        capture?.dispose();
        capture = undefined;
      }
    };
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(renderNextFace, { timeout: 250 });
      cancelCapture = () => window.cancelIdleCallback(id);
    } else {
      const id = window.setTimeout(renderNextFace, 0);
      cancelCapture = () => window.clearTimeout(id);
    }
  }

  return {
    register,
    update,
    dispose() {
      cancelCapture?.();
      capture?.dispose();
      renderer.domElement.removeEventListener('webglcontextrestored', resetAfterContextRestore);
      for (const target of targets) target.dispose();
    },
  };
}

/** Find the centers of the actual lamp boxes in the merged campus model. */
function collectFixtures(mesh: THREE.Mesh, centers: THREE.Vector3[]) {
  const geometry = mesh.geometry;
  const position = geometry.getAttribute('position');
  if (!position) return;
  const point = new THREE.Vector3();
  const bounds: THREE.Box3[] = [];
  const slots = new Map<string, number>();
  const representatives: number[] = [];
  const parents: number[] = [];
  const points: THREE.Vector3[] = [];
  const root = (node: number): number => {
    while (parents[node] !== node) {
      parents[node] = parents[parents[node]];
      node = parents[node];
    }
    return node;
  };
  for (let index = 0; index < position.count; index += 1) {
    point.fromBufferAttribute(position, index).applyMatrix4(mesh.matrixWorld);
    const key = `${Math.round(point.x * 500)},${Math.round(point.y * 500)},${Math.round(point.z * 500)}`;
    let slot = slots.get(key);
    if (slot === undefined) {
      slot = points.length;
      slots.set(key, slot);
      points.push(point.clone());
      parents.push(slot);
    }
    representatives[index] = slot;
  }
  const indices = geometry.index;
  const count = indices?.count ?? position.count;
  for (let i = 0; i + 2 < count; i += 3) {
    const a = root(representatives[indices?.getX(i) ?? i]);
    const b = root(representatives[indices?.getX(i + 1) ?? i + 1]);
    const c = root(representatives[indices?.getX(i + 2) ?? i + 2]);
    parents[b] = a;
    parents[c] = a;
  }
  for (const [index, p] of points.entries()) {
    const component = root(index);
    (bounds[component] ??= new THREE.Box3()).expandByPoint(p);
  }
  for (const box of bounds) {
    if (!box || box.getSize(point).lengthSq() < 0.14 ** 2) continue;
    const center = box.getCenter(new THREE.Vector3());
    center.y = box.min.y - 0.045;
    centers.push(center);
  }
}

export function createCampusLighting(
  scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, campus: Campus, mobile: boolean,
) {
  const span = Math.max(campus.size.x, campus.size.z, 30);
  scene.fog = new THREE.Fog(haze, span * 0.46, span * 2.75);
  camera.far = Math.max(600, span * 8);
  camera.updateProjectionMatrix();
  const sky = createSky(camera.far * 0.8);
  const backdropWidth = Math.max(3000, span * 16);
  const backdrop = new THREE.Mesh(
    new THREE.PlaneGeometry(backdropWidth, backdropWidth),
    new THREE.MeshStandardMaterial({ color: '#7f8f68', roughness: 1 }),
  );
  backdrop.rotation.x = -Math.PI / 2;
  backdrop.position.set(campus.center.x, campus.bounds.min.y - 0.36, campus.center.z);
  const skyLight = new THREE.HemisphereLight('#dbeaff', '#c7beaa', 0.95);
  const reflectedLight = new THREE.AmbientLight('#eae6dc', 0.14);
  const sun = new THREE.DirectionalLight('#fff0d7', 3.71);
  const sunOffset = sunDirection.clone().multiplyScalar(span * 1.30);
  sun.castShadow = true;
  const mapSize = mobile ? 1024 : 2048;
  sun.shadow.mapSize.set(mapSize, mapSize);
  sun.shadow.intensity = 0.94;
  sun.shadow.radius = 2;
  const reflection = createSkyReflection();
  const fixtures: THREE.Vector3[] = [];
  const roomLights = [new THREE.PointLight('#fff0d8', 0, 5.2, 2), new THREE.PointLight('#fff0d8', 0, 5.2, 2)];
  scene.add(sky, backdrop, skyLight, reflectedLight, sun, sun.target, ...roomLights);
  const query = new URLSearchParams(window.location.search);
  const debug = query.has('debug');
  const photographicExposure = !debug || query.get('camera') !== '0';
  const baseExposure = renderer.toneMappingExposure;
  let photoSkySettled = debug && query.get('photoSky') === '0';
  let photographicAssetsStarted = false;
  let disposed = false;
  let photoSkyTexture: THREE.DataTexture | undefined;
  const bakedLight = createCampusBakedLight(campus.manifestURL, campus.manifest.models[0].url);
  const localReflections = !mobile && !(debug && query.get('probe') === '0')
    ? createLocalReflections(renderer, campus, scene, sky, backdrop, skyLight, reflectedLight, sun)
    : undefined;
  if (campus.manifest.collisionFromModels) campus.collision.add(backdrop.clone());
  campus.visuals.updateMatrixWorld(true);
  const updated = new Set<THREE.Material>();
  const textureAnisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), mobile ? 4 : 8);
  campus.visuals.traverse(object => {
    if (!(object instanceof THREE.Mesh)) return;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    if (materials.every(material => material.name === 'glass-clear')) object.castShadow = false;
    if (materials.every(material => material.name === 'teaching-lamp')) collectFixtures(object, fixtures);
    for (const material of materials) {
      if (!(material instanceof THREE.MeshStandardMaterial) || updated.has(material)) continue;
      updated.add(material);
      applyCampusWeathering(material);
      if (obliqueSurfaceMaterials.has(material.name)) {
        for (const texture of [material.map, material.normalMap, material.roughnessMap]) {
          if (texture && texture.anisotropy < textureAnisotropy) {
            texture.anisotropy = textureAnisotropy;
            texture.needsUpdate = true;
          }
        }
      }
      if (material.name === 'teaching-lamp') {
        material.emissive.set('#fff1db');
        material.emissiveIntensity = 1.05;
      } else if (material.name.startsWith('glass-')) {
        material.envMap = reflection;
        material.envMapIntensity = material.name === 'glass-clear' ? 1.42 : 1.02;
        material.roughness = Math.min(material.roughness, 0.25);
        if (material.name !== 'glass-clear') material.metalness = Math.max(material.metalness, 0.11);
        localReflections?.register(material, true, material.name === 'glass-clear');
      } else if (['teaching-metal', 'frame', 'blue-rail', 'blue-cap', 'stand_steel', 'entry-aluminum',
        'stainless', 'entry-drain-frame', 'entry-drain-grate'].includes(material.name)) {
        material.envMap = reflection;
        material.envMapIntensity = 0.48;
        material.metalness = Math.max(material.metalness, 0.27);
        localReflections?.register(material, false, false);
      } else if (material.name === 'teaching-floor') {
        material.envMap = reflection;
        material.envMapIntensity = 0.22;
      }
      if (!object.userData.surroundings) bakedLight?.register(material);
    }
  });

  const focus = new THREE.Vector3();
  let currentRadius = 0;

  function startPhotographicAssets() {
    photographicAssetsStarted = true;
    bakedLight?.start();
    if (photoSkySettled) return;
    void loadCampusPhotoSky().then(({ material, texture }) => {
      if (disposed) {
        material.dispose();
        texture.dispose();
        return;
      }
      sky.material.dispose();
      sky.material = material;
      photoSkyTexture = texture;
      for (const surface of updated) {
        if (surface instanceof THREE.MeshStandardMaterial && surface.envMap === reflection) {
          surface.envMap = texture;
        }
      }
    }).catch(() => {
      // The procedural sky remains visible if the panorama is unavailable.
    }).finally(() => { photoSkySettled = true; });
  }

  function updateFixtures(feet?: THREE.Vector3) {
    let nearest: THREE.Vector3 | undefined;
    let runnerUp: THREE.Vector3 | undefined;
    let d1 = 5.4 ** 2, d2 = 5.4 ** 2;
    if (feet) {
      for (const fixture of fixtures) {
        const rise = fixture.y - feet.y;
        if (rise < 1.92 || rise > 3.95) continue;
        const distance = (fixture.x - feet.x) ** 2 + (fixture.z - feet.z) ** 2;
        if (distance < d1) {
          runnerUp = nearest;
          d2 = d1;
          nearest = fixture;
          d1 = distance;
        } else if (distance < d2) {
          runnerUp = fixture;
          d2 = distance;
        }
      }
    }
    for (const [index, light] of roomLights.entries()) {
      const fixture = index ? runnerUp : nearest;
      const distance = index ? d2 : d1;
      if (fixture) light.position.copy(fixture);
      light.intensity = fixture ? 4.9 * (1 - THREE.MathUtils.smoothstep(distance, 9, 5.4 ** 2)) : 0;
    }
  }

  function update(mode: Mode, feet: THREE.Vector3 | undefined, firstFramePresented: boolean, dt: number) {
    camera.getWorldPosition(sky.position);
    if (firstFramePresented && !photographicAssetsStarted) startPhotographicAssets();
    localReflections?.update(firstFramePresented && photoSkySettled && mode !== 'overview');
    if (photographicExposure) {
      const openSky = mode === 'walk' ? bakedLight?.skyVisibilityAt(sky.position) ?? 1 : 1;
      const exposure = baseExposure + 0.24 * (1 - THREE.MathUtils.smoothstep(openSky, .04, .65));
      renderer.toneMappingExposure = THREE.MathUtils.damp(renderer.toneMappingExposure, exposure, 3, dt);
    }
    updateFixtures(mode === 'walk' ? feet : undefined);
    const local = feet && (mode === 'walk' || (mode === 'fly' && feet.y < campus.bounds.max.y + 14));
    const radius = local ? (mode === 'walk' ? 25 : 38) : Math.max(campus.size.length() * 0.56, 25);
    if (local) focus.set(Math.round(feet.x / 8) * 8, Math.round(feet.y / 8) * 8, Math.round(feet.z / 8) * 8);
    else focus.copy(campus.center);
    if (currentRadius !== radius || !sun.target.position.equals(focus)) {
      sun.target.position.copy(focus);
      sun.position.copy(focus).add(sunOffset);
      if (currentRadius !== radius) {
        currentRadius = radius;
        const distance = sunOffset.length();
        const depth = radius * 2.4;
        Object.assign(sun.shadow.camera, {
          left: -radius, right: radius, top: radius, bottom: -radius,
          near: Math.max(0.1, distance - depth), far: distance + depth,
        });
        sun.shadow.camera.updateProjectionMatrix();
        sun.shadow.bias = local ? -0.00016 : -0.00011;
        sun.shadow.normalBias = local ? 0.018 : 0.074;
      }
      renderer.shadowMap.needsUpdate = true;
    }
  }

  return {
    update,
    dispose() {
      disposed = true;
      for (const mesh of [sky, backdrop]) {
        mesh.removeFromParent();
        mesh.geometry.dispose();
        mesh.material.dispose();
      }
      localReflections?.dispose();
      bakedLight?.dispose();
      photoSkyTexture?.dispose();
      reflection.dispose();
      sun.shadow.dispose();
      skyLight.removeFromParent();
      reflectedLight.removeFromParent();
      sun.removeFromParent();
      sun.target.removeFromParent();
      for (const light of roomLights) light.removeFromParent();
    },
  };
}
