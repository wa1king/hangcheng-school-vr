import * as THREE from 'three';
import type { loadCampus } from './campus.ts';
import type { Mode } from './input.ts';

type Campus = Awaited<ReturnType<typeof loadCampus>>;
type Surface = { y: number; normal: { x: number; y: number; z: number } };

const sunDirection = new THREE.Vector3(-0.48, 0.76, 0.43).normalize();
const haze = new THREE.Color('#b6cad4');
const zenith = new THREE.Color('#6195cb');

function createSky(radius: number) {
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uZenith: { value: zenith },
      uHorizon: { value: haze },
      uCloud: { value: new THREE.Color('#edf0ea') },
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
      void main() {
        vec3 dir = normalize(vDirection);
        float elevation = max(0.0, dir.y);
        vec3 color = mix(uHorizon, uZenith, smoothstep(-0.02, 0.92, dir.y));
        float solar = max(0.0, dot(dir, uSun));
        color = mix(color, uCloud, 0.32 * pow(solar, 14.0));
        if (elevation > 0.055) {
          vec2 p = dir.xz * vec2(2.5, 3.8) / (elevation + 0.12) + vec2(6.0, -1.0);
          float cloud = noise(p) * 0.62 + noise(p * 2.05 + 14.0) * 0.26
            + noise(p * 4.1 + 4.0) * 0.12;
          float coverage = smoothstep(0.59, 0.78, cloud)
            * smoothstep(0.055, 0.29, elevation);
          color = mix(color, uCloud, coverage * 0.70);
        }
        color = mix(color, vec3(1.0, 0.94, 0.82), smoothstep(0.99965, 0.99992, solar) * 0.75);
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
  const width = 128, height = 64;
  const pixels = new Uint8Array(width * height * 4);
  const ground = new THREE.Color('#838a78');
  const sunlight = new THREE.Color('#fff1d7');
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
      else color.lerp(ground, THREE.MathUtils.smoothstep(-elevation, 0.04, 0.57));
      color.lerp(sunlight, 0.42 * sun ** 14);
      const index = (y * width + x) * 4;
      pixels.set([Math.round(color.r * 255), Math.round(color.g * 255), Math.round(color.b * 255), 255], index);
    }
  }
  const texture = new THREE.DataTexture(pixels, width, height);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.LinearSRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
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
  const skyLight = new THREE.HemisphereLight('#e4efff', '#b4a58e', 1.67);
  const reflectedLight = new THREE.AmbientLight('#f5eee7', 0.17);
  const sun = new THREE.DirectionalLight('#fff1d7', 3.25);
  const sunOffset = sunDirection.clone().multiplyScalar(span * 1.30);
  sun.castShadow = true;
  const mapSize = mobile ? 1024 : 2048;
  sun.shadow.mapSize.set(mapSize, mapSize);
  sun.shadow.intensity = 0.90;
  sun.shadow.radius = 2;
  const blob = createContactShadow();
  const reflection = createSkyReflection();
  scene.add(sky, backdrop, skyLight, reflectedLight, sun, sun.target, blob);
  if (campus.manifest.collisionFromModels) campus.collision.add(backdrop.clone());
  campus.visuals.traverse(object => {
    if (!(object instanceof THREE.Mesh)) return;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of materials) {
      if (!(material instanceof THREE.MeshStandardMaterial)) continue;
      if (material.name === 'teaching-lamp') {
        material.emissive.set('#fff2d8');
        material.emissiveIntensity = 0.55;
      } else if (material.name.startsWith('glass-')) {
        material.envMap = reflection;
        material.envMapIntensity = 0.42;
      }
    }
  });

  const focus = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);
  const normal = new THREE.Vector3();
  const contactLift = campus.manifest.collisionFromModels ? 0.019 : 0.043;
  let currentRadius = 0;

  function update(mode: Mode, feet?: THREE.Vector3, surface?: Surface) {
    camera.getWorldPosition(sky.position);
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
    },
  };
}
