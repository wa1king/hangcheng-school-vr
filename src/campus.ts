import { Box3, Group, Mesh, Object3D, Vector3 } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

export type Coordinate = [number, number, number];
export type PlanCoordinate = [number, number];
export type CampusPoint = { position: Coordinate; yaw?: number; pitch?: number };
export type Location = CampusPoint & { id: string; label: string };

type Model = {
  url: string;
  position?: Coordinate;
  rotationY?: number;
  scale?: number;
};

type CampusManifest = {
  title: string;
  status?: string;
  description?: string;
  models: Model[];
  collisionUrl?: string;
  evidenceUrl?: string;
  landingBoundary?: PlanCoordinate[];
  spawn: CampusPoint;
  overview?: { target: Coordinate; position: Coordinate };
  locations?: Location[];
};

const manifestURL = new URL(`${import.meta.env.BASE_URL}scene/scene.json`, window.location.href);
const validCoordinate = (value: unknown): value is Coordinate =>
  Array.isArray(value) && value.length === 3 && value.every(Number.isFinite);

function validPoint(point: CampusPoint | undefined) {
  return point
    && validCoordinate(point.position)
    && (point.yaw === undefined || Number.isFinite(point.yaw))
    && (point.pitch === undefined || (Number.isFinite(point.pitch) && Math.abs(point.pitch) <= 1.49));
}

function modelURL(file: string) {
  const url = new URL(file, manifestURL);
  if (url.origin !== manifestURL.origin || !url.pathname.toLowerCase().endsWith('.glb')) {
    throw new Error('模型必须是项目内的 GLB 文件。');
  }
  return url.href;
}

function collectMeshes(root: Object3D, target: Group, include: (mesh: Mesh) => boolean) {
  root.updateWorldMatrix(true, true);
  root.traverse(object => {
    if (!(object instanceof Mesh) || !include(object)) return;
    const copy = object.clone(false);
    copy.name = object.name;
    copy.matrixAutoUpdate = false;
    copy.matrix.copy(object.matrixWorld);
    copy.visible = true;
    target.add(copy);
  });
}

function isCollisionNode(object: Object3D | null): boolean {
  while (object) {
    const name = object.name.toUpperCase();
    if (name === 'COLLISION' || name.startsWith('COLLISION_')) return true;
    object = object.parent;
  }
  return false;
}

export async function loadCampus() {
  const response = await fetch(manifestURL, { cache: 'no-cache' });
  if (!response.ok || !response.headers.get('content-type')?.includes('json')) {
    throw new Error('还没有找到校园场景文件。');
  }
  const manifest = await response.json() as CampusManifest;
  if (typeof manifest.title !== 'string' || !Array.isArray(manifest.models) || !manifest.models.length || !validPoint(manifest.spawn)) {
    throw new Error('校园场景缺少名称、模型或有效起点。');
  }
  if (manifest.overview && (!validCoordinate(manifest.overview.position) || !validCoordinate(manifest.overview.target))) {
    throw new Error('校园总览机位无效。');
  }
  if (manifest.landingBoundary && (!Array.isArray(manifest.landingBoundary) || manifest.landingBoundary.length < 3
    || !manifest.landingBoundary.every(pair => Array.isArray(pair) && pair.length === 2 && pair.every(Number.isFinite)))) {
    throw new Error('校园可落地区域数据无效。');
  }
  for (const model of manifest.models) {
    if (typeof model?.url !== 'string'
      || (model.position !== undefined && !validCoordinate(model.position))
      || (model.rotationY !== undefined && !Number.isFinite(model.rotationY))
      || (model.scale !== undefined && (!Number.isFinite(model.scale) || model.scale <= 0))) {
      throw new Error('校园模型的文件路径或坐标无效。');
    }
  }
  if (manifest.locations && (!Array.isArray(manifest.locations)
    || !manifest.locations.every(point => validPoint(point) && typeof point.id === 'string' && typeof point.label === 'string'))) {
    throw new Error('校园地点数据无效。');
  }

  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const visuals = new Group();
  const collision = new Group();
  const models = await Promise.all(manifest.models.map(model => loader.loadAsync(modelURL(model.url))));
  for (const [index, asset] of models.entries()) {
    const config = manifest.models[index];
    const wrapper = new Group();
    if (config.position) wrapper.position.fromArray(config.position);
    wrapper.rotation.y = config.rotationY ?? 0;
    wrapper.scale.setScalar(config.scale ?? 1);
    wrapper.add(asset.scene);
    visuals.add(wrapper);
  }

  if (manifest.collisionUrl) {
    const asset = await loader.loadAsync(modelURL(manifest.collisionUrl));
    collectMeshes(asset.scene, collision, mesh => mesh.userData.collision !== false);
  } else {
    collectMeshes(visuals, collision, isCollisionNode);
  }

  const bounds = new Box3();
  visuals.updateWorldMatrix(true, true);
  visuals.traverse(object => {
    if (isCollisionNode(object)) {
      object.visible = false;
      return;
    }
    if (!(object instanceof Mesh)) return;
    object.castShadow = object.userData.shadow !== false;
    object.receiveShadow = object.userData.shadow !== false;
    if (!object.geometry.boundingBox) object.geometry.computeBoundingBox();
    if (object.geometry.boundingBox) bounds.union(object.geometry.boundingBox.clone().applyMatrix4(object.matrixWorld));
  });
  if (bounds.isEmpty()) throw new Error('校园模型中没有可见网格。');
  const size = bounds.getSize(new Vector3());
  const center = bounds.getCenter(new Vector3());

  return { manifest, visuals, collision, bounds, size, center, manifestURL };
}
