import * as THREE from 'three';
import type { loadCampus } from './campus.ts';
import type { Mode } from './input.ts';

type Campus = Awaited<ReturnType<typeof loadCampus>>;
type Surface = { y: number; normal: { x: number; y: number; z: number } };

const sunDirection = new THREE.Vector3(-0.62, 0.69, 0.38).normalize();
const haze = new THREE.Color('#bed0d9');
const zenith = new THREE.Color('#568bc6');

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
        color = mix(color, vec3(0.91, 0.88, 0.81), 0.22 * pow(solar, 9.0));
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

function createContactShadow() {
  const side = 32;
  const alpha = new Uint8Array(side * side * 4);
  for (let y = 0; y < side; y += 1) {
    for (let x = 0; x < side; x += 1) {
      const distance = Math.hypot((x + 0.5) / side - 0.5, (y + 0.5) / side - 0.5) * 2;
      const value = Math.round(255 * (1 - THREE.MathUtils.smoothstep(distance, 0.02, 0.97)) ** 1.55);
      const index = (y * side + x) * 4;
      alpha.set([value, value, value, 255], index);
    }
  }
  const texture = new THREE.DataTexture(alpha, side, side);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  const material = new THREE.MeshBasicMaterial({
    color: '#29242a',
    alphaMap: texture,
    transparent: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
  });
  const plane = new THREE.PlaneGeometry(1, 1);
  plane.rotateX(-Math.PI / 2);
  const shadow = new THREE.Mesh(plane, material);
  shadow.renderOrder = 1;
  shadow.visible = false;
  return shadow;
}

export function createCampusLighting(
  scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, campus: Campus, mobile: boolean,
) {
  const span = Math.max(campus.size.x, campus.size.z, 30);
  scene.fog = new THREE.Fog(haze, span * 0.64, span * 3.5);
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
  const skyLight = new THREE.HemisphereLight('#dceaff', '#b7a889', 0.98);
  const reflectedLight = new THREE.AmbientLight('#eae6dc', 0.13);
  const sun = new THREE.DirectionalLight('#fff2dc', 3.43);
  const sunOffset = sunDirection.clone().multiplyScalar(span * 1.30);
  sun.castShadow = true;
  const mapSize = mobile ? 1024 : 2048;
  sun.shadow.mapSize.set(mapSize, mapSize);
  sun.shadow.intensity = 0.94;
  sun.shadow.radius = 2;
  const blob = createContactShadow();
  const reflection = createSkyReflection();
  const fixtures: THREE.Vector3[] = [];
  const roomLights = [new THREE.PointLight('#fff0d8', 0, 5.2, 2), new THREE.PointLight('#fff0d8', 0, 5.2, 2)];
  scene.add(sky, backdrop, skyLight, reflectedLight, sun, sun.target, blob, ...roomLights);
  if (campus.manifest.collisionFromModels) campus.collision.add(backdrop.clone());
  campus.visuals.updateMatrixWorld(true);
  const updated = new Set<THREE.Material>();
  campus.visuals.traverse(object => {
    if (!(object instanceof THREE.Mesh)) return;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    if (materials.every(material => material.name === 'glass-clear')) object.castShadow = false;
    if (materials.every(material => material.name === 'teaching-lamp')) collectFixtures(object, fixtures);
    for (const material of materials) {
      if (!(material instanceof THREE.MeshStandardMaterial) || updated.has(material)) continue;
      updated.add(material);
      if (material.name === 'teaching-lamp') {
        material.emissive.set('#fff1db');
        material.emissiveIntensity = 1.05;
      } else if (material.name.startsWith('glass-')) {
        material.envMap = reflection;
        material.envMapIntensity = material.name === 'glass-clear' ? 1.42 : 1.02;
        material.roughness = Math.min(material.roughness, 0.25);
        if (material.name !== 'glass-clear') material.metalness = Math.max(material.metalness, 0.11);
      } else if (['teaching-metal', 'frame', 'blue-rail', 'blue-cap', 'stand_steel'].includes(material.name)) {
        material.envMap = reflection;
        material.envMapIntensity = 0.48;
        material.metalness = Math.max(material.metalness, 0.27);
      }
    }
  });

  const focus = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);
  const normal = new THREE.Vector3();
  const contactLift = campus.manifest.collisionFromModels ? 0.019 : 0.043;
  let currentRadius = 0;

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

  function update(mode: Mode, feet?: THREE.Vector3, surface?: Surface) {
    camera.getWorldPosition(sky.position);
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
    blob.visible = Boolean(feet && surface);
    if (feet && surface) {
      const height = Math.max(0, feet.y - surface.y);
      normal.set(surface.normal.x, surface.normal.y, surface.normal.z);
      blob.position.set(feet.x, surface.y, feet.z).addScaledVector(normal, contactLift);
      blob.quaternion.setFromUnitVectors(up, normal);
      const spread = 1 + 0.62 * height;
      blob.scale.set(0.83 * spread, 1, 0.79 * spread);
      blob.material.opacity = 0.42 * (1 - THREE.MathUtils.smoothstep(height, 0.03, 1.38));
    }
  }

  return {
    update,
    dispose() {
      for (const mesh of [sky, backdrop, blob]) {
        mesh.removeFromParent();
        mesh.geometry.dispose();
        mesh.material.dispose();
      }
      blob.material.alphaMap?.dispose();
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
