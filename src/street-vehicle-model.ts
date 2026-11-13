import { Box3, Group, Matrix4, Mesh, MeshStandardMaterial, Vector3, type BufferGeometry, type Object3D } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import type { StreetVehicle } from './street-vehicle-motion.ts';

const models = [
  { path: './street-vehicle-corolla.glb?v=91873ef6adec', radius: .328 },
  { path: './street-vehicle-tucson.glb?v=fd119cd4b45e', radius: .357 },
];
const paint = [0x777e85, 0xc8c9c5, 0x244668, 0xa6adb0, 0x633b37, 0x303539];
const wheelPivot = 'Grp_Wheel_Steering_Rotating_';
const rotation = new Matrix4().makeRotationY(-Math.PI / 2);

function prepareVehicle(scene: Object3D, radius: number) {
  scene.updateMatrixWorld(true);
  const bounds = new Box3().setFromObject(scene, true);
  const center = bounds.getCenter(new Vector3());
  const length = bounds.max.x - bounds.min.x;
  const align = rotation.clone().multiply(new Matrix4().makeTranslation(-center.x, -bounds.min.y, -center.z));
  const body = new Group();
  const buckets = new Map<MeshStandardMaterial, BufferGeometry[]>();
  const wheels = new Map<Object3D, Group>();
  scene.traverse(node => {
    if (!(node instanceof Mesh) || !(node.material instanceof MeshStandardMaterial)) return;
    let pivot = node.parent;
    while (pivot && !pivot.name.startsWith(wheelPivot)) pivot = pivot.parent;
    if (pivot) {
      let wheel = wheels.get(pivot);
      if (!wheel) {
        wheel = new Group();
        wheel.name = pivot.name;
        wheel.position.setFromMatrixPosition(pivot.matrixWorld).applyMatrix4(align);
        wheels.set(pivot, wheel);
        body.add(wheel);
      }
      const part = node.clone(false);
      const transform = align.clone().multiply(node.matrixWorld);
      transform.setPosition(new Vector3().setFromMatrixPosition(transform).sub(wheel.position));
      transform.decompose(part.position, part.quaternion, part.scale);
      wheel.add(part);
    } else {
      const geometry = node.geometry.clone().applyMatrix4(align.clone().multiply(node.matrixWorld));
      const list = buckets.get(node.material);
      if (list) list.push(geometry);
      else buckets.set(node.material, [geometry]);
    }
  });
  for (const [material, geometries] of buckets) {
    const combined = geometries.length === 1 ? geometries[0] : mergeGeometries(geometries);
    if (combined) {
      body.add(new Mesh(combined, material));
      if (geometries.length > 1) geometries.forEach(geometry => geometry.dispose());
    } else {
      for (const geometry of geometries) body.add(new Mesh(geometry, material));
    }
  }
  return { body, length, radius };
}

export async function loadStreetVehicleModels(manifestURL: URL): Promise<(index: number) => StreetVehicle> {
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const templates = await Promise.all(models.map(async ({ path, radius }) => {
    const { scene } = await loader.loadAsync(new URL(path, manifestURL).href);
    return prepareVehicle(scene, radius);
  }));

  return index => {
    const { body, length, radius } = templates[index % templates.length];
    const object = body.clone(true);
    const wheels: Object3D[] = [];
    const brakes: MeshStandardMaterial[] = [];
    const finishes = new Map<MeshStandardMaterial, MeshStandardMaterial>();
    object.traverse(node => {
      if (node.name.startsWith(wheelPivot)) wheels.push(node);
      if (!(node instanceof Mesh) || !(node.material instanceof MeshStandardMaterial)) return;
      const material = node.material;
      if (material.name === 'Body' || material.name === 'Street_Brake') {
        let finish = finishes.get(material);
        if (!finish) {
          finish = material.clone();
          finishes.set(material, finish);
          if (material.name === 'Body') finish.color.setHex(paint[index % paint.length]);
          else brakes.push(finish);
        }
        node.material = finish;
      }
    });
    let rotation = 0;
    let braking = false;
    return {
      object,
      length,
      update(travel, nextBraking) {
        rotation = (rotation + travel / radius) % (Math.PI * 2);
        for (const wheel of wheels) wheel.rotation.x = rotation;
        if (braking !== nextBraking) {
          braking = nextBraking;
          for (const material of brakes) {
            material.emissive.setRGB(braking ? .95 : .06, braking ? .012 : .001, .001);
          }
        }
      },
    };
  };
}
