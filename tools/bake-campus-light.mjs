/** Bake geometry-derived sky visibility, nearby occlusion and one sun bounce. */
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import RAPIER from '@dimforge/rapier3d-compat';
import { Group, Vector3 } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

const [sceneFile, assetFile] = process.argv.slice(2);
const sceneURL = sceneFile ? pathToFileURL(resolve(sceneFile)) : new URL('../public/scene/scene.json', import.meta.url);
const output = assetFile ? pathToFileURL(resolve(assetFile)) : new URL('campus-baked-light.bin', sceneURL);
const manifest = JSON.parse(await readFile(sceneURL, 'utf8'));
const revision = new URL(manifest.models[0].url, sceneURL).searchParams.get('v');
if (!/^[\da-f]{12}$/.test(revision ?? '')) throw new Error('The campus model needs a 12-digit build revision.');

const rotation = -(manifest.northYaw ?? 0);
const cosine = Math.cos(rotation), sine = Math.sin(rotation);
const sun = new Vector3(-0.69, 0.55, 0.47).normalize();
const origin = [-72, -33, 0.30]; // Site X, site Z, height. The grid covers the entrance and main teaching wing.
const step = [1.5, 1.5, 0.8];
const size = [81, 83, 20];

function stripImageReferences(glb) {
  // The renderer-independent bake needs only geometry and surface types.
  const jsonLength = glb.readUInt32LE(12);
  const document = JSON.parse(glb.toString('utf8', 20, 20 + jsonLength));
  delete document.images;
  delete document.textures;
  delete document.samplers;
  for (const material of document.materials) {
    for (const target of [material, material.pbrMetallicRoughness ?? {}]) {
      for (const key of Object.keys(target)) if (key.endsWith('Texture')) delete target[key];
    }
  }
  const json = Buffer.from(JSON.stringify(document));
  const aligned = (json.length + 3) & ~3;
  const remainder = glb.subarray(20 + jsonLength);
  const result = Buffer.alloc(20 + aligned + remainder.length, 0x20);
  glb.copy(result, 0, 0, 20);
  result.writeUInt32LE(result.length, 8);
  result.writeUInt32LE(aligned, 12);
  json.copy(result, 20);
  remainder.copy(result, 20 + aligned);
  return result.buffer;
}

const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
const geometry = new Group();
for (const model of manifest.models) {
  const bytes = stripImageReferences(await readFile(new URL(model.url, sceneURL)));
  const { scene } = await loader.parseAsync(bytes, '');
  const wrapper = new Group();
  wrapper.position.fromArray(model.position ?? [0, 0, 0]);
  wrapper.rotation.y = model.rotationY ?? 0;
  wrapper.scale.setScalar(model.scale ?? 1);
  wrapper.add(scene);
  geometry.add(wrapper);
}
geometry.updateMatrixWorld(true);

await RAPIER.init();
const world = new RAPIER.World({ x: 0, y: 0, z: 0 });
const reflectances = new Map();
const vertex = new Vector3();
let triangles = 0;
geometry.traverse(mesh => {
  if (!mesh.isMesh) return;
  const position = mesh.geometry.getAttribute('position');
  const index = mesh.geometry.index;
  const spans = Array.isArray(mesh.material)
    ? mesh.geometry.groups.map(group => ({ ...group, material: mesh.material[group.materialIndex] }))
    : [{ material: mesh.material, start: 0, count: index?.count ?? position.count }];
  const vertices = new Float32Array(position.count * 3);
  for (let i = 0; i < position.count; i += 1) {
    vertex.fromBufferAttribute(position, i).applyMatrix4(mesh.matrixWorld).toArray(vertices, i * 3);
  }
  for (const { material, start, count } of spans) {
    if (!count || !material || material.transparent || material.name.startsWith('decal-')) continue;
    const indices = new Uint32Array(count);
    for (let i = 0; i < count; i += 1) indices[i] = index?.getX(start + i) ?? start + i;
    const collider = world.createCollider(RAPIER.ColliderDesc.trimesh(vertices, indices));
    triangles += count / 3;
    const color = material.color;
    const luminance = color ? color.r * 0.213 + color.g * 0.715 + color.b * 0.072 : 0.45;
    const dark = /asphalt|road|grass|bark|glass|frame|steel/i.test(material.name);
    reflectances.set(collider.handle, Math.min(dark ? 0.22 : 0.68, Math.max(0.10, luminance * 0.70)));
  }
});
world.step();

const goldenAngle = Math.PI * (3 - Math.sqrt(5));
function distributedDirections(count, lower, upper, phase) {
  return Array.from({ length: count }, (_, index) => {
    const y = lower + (upper - lower) * ((index + 0.5) / count);
    const radius = Math.sqrt(1 - y * y);
    const azimuth = index * goldenAngle + phase;
    return { x: Math.cos(azimuth) * radius, y, z: Math.sin(azimuth) * radius };
  });
}
const skyDirections = distributedDirections(22, 0, 1, 0.42);
const bounceDirections = distributedDirections(12, -0.98, 0.30, 1.67);
const skyWeight = skyDirections.reduce((total, direction) => total + 0.35 + 0.65 * direction.y, 0);
const ray = new RAPIER.Ray({ x: 0, y: 0, z: 0 }, skyDirections[0]);
const sunRay = new RAPIER.Ray({ x: 0, y: 0, z: 0 }, sun);
const smoothstep = (value, min, max) => {
  const t = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return t * t * (3 - 2 * t);
};
const toByte = value => Math.round(Math.max(0, Math.min(1, value)) * 255);

const headerSize = 64;
const result = Buffer.alloc(headerSize + size[0] * size[1] * size[2] * 4, 0);
result.write('HCB1', 0, 'ascii');
size.forEach((value, index) => result.writeUInt32LE(value, 4 + index * 4));
[...origin, ...step, cosine, sine].forEach((value, index) => result.writeFloatLE(value, 16 + index * 4));
result.write(revision, 48, 12, 'ascii');

const startTime = performance.now();
let offset = headerSize;
for (let layer = 0; layer < size[2]; layer += 1) {
  ray.origin.y = origin[2] + step[2] * layer;
  for (let row = 0; row < size[1]; row += 1) {
    const z = origin[1] + step[1] * row;
    for (let column = 0; column < size[0]; column += 1) {
      const x = origin[0] + step[0] * column;
      ray.origin.x = x * cosine - z * sine;
      ray.origin.z = x * sine + z * cosine;

      let sky = 0;
      let near = 0;
      for (const direction of skyDirections) {
        ray.dir = direction;
        const hit = world.castRay(ray, 165, false);
        const weight = 0.35 + 0.65 * direction.y;
        if (!hit) sky += weight;
        near += weight * (hit ? smoothstep(hit.timeOfImpact, 0.16, 2.5) : 1);
      }

      let bounced = 0;
      for (const direction of bounceDirections) {
        ray.dir = direction;
        const hit = world.castRayAndGetNormal(ray, 12, false);
        if (!hit || hit.timeOfImpact < 0.07) continue;
        const normal = hit.normal;
        const towardReceiver = normal.x * direction.x + normal.y * direction.y + normal.z * direction.z < 0 ? 1 : -1;
        const incidence = towardReceiver * (normal.x * sun.x + normal.y * sun.y + normal.z * sun.z);
        if (incidence < 0.035) continue;
        const distance = hit.timeOfImpact;
        sunRay.origin.x = ray.origin.x + direction.x * distance + normal.x * towardReceiver * 0.045;
        sunRay.origin.y = ray.origin.y + direction.y * distance + normal.y * towardReceiver * 0.045;
        sunRay.origin.z = ray.origin.z + direction.z * distance + normal.z * towardReceiver * 0.045;
        if (world.castRay(sunRay, 165, false)) continue;
        bounced += incidence * reflectances.get(hit.collider.handle) * (1 - smoothstep(distance, 4, 12));
      }
      result[offset++] = toByte(sky / skyWeight);
      result[offset++] = toByte(near / skyWeight);
      result[offset++] = toByte(bounced * 3 / bounceDirections.length);
      result[offset++] = 255;
    }
  }
}
world.free();
await writeFile(output, result);
console.log(`Baked ${size[0] * size[1] * size[2]} probes from ${triangles} triangles in ${((performance.now() - startTime) / 1000).toFixed(1)} s (${result.length} B).`);
