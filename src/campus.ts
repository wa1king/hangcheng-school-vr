import { Box3, BufferAttribute, BufferGeometry, Group, Material, Mesh, Object3D, Vector3 } from 'three';
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
  surroundings?: boolean;
};

type CampusManifest = {
  title: string;
  status?: string;
  description?: string;
  models: Model[];
  collisionUrl?: string;
  collisionFromModels?: boolean;
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

function collectMeshes(
  root: Object3D,
  target: Group,
  geometryFor: (mesh: Mesh) => BufferGeometry | undefined,
  visibleOnly = false,
) {
  root.updateWorldMatrix(true, true);
  const copyMesh = (object: Object3D) => {
    if (!(object instanceof Mesh)) return;
    const geometry = geometryFor(object);
    if (!geometry) return;
    const copy = object.clone(false);
    copy.geometry = geometry;
    copy.matrixAutoUpdate = false;
    copy.matrix.copy(object.matrixWorld);
    copy.visible = true;
    target.add(copy);
  };
  if (visibleOnly) root.traverseVisible(copyMesh);
  else root.traverse(copyMesh);
}

function isCollisionNode(object: Object3D | null): boolean {
  while (object) {
    const name = object.name.toUpperCase();
    if (name === 'COLLISION' || name.startsWith('COLLISION_')) return true;
    object = object.parent;
  }
  return false;
}

function structuralGeometry(mesh: Mesh) {
  if (isCollisionNode(mesh)) return undefined;
  const structural = (material: Material | undefined) => material && !material.name.startsWith('decal-');
  const geometry = mesh.geometry;
  if (!Array.isArray(mesh.material)) return structural(mesh.material) ? geometry : undefined;
  const materials = mesh.material;
  const groups = geometry.groups.filter(group => structural(materials[group.materialIndex ?? 0]));
  if (!groups.length) return undefined;
  if (groups.length === geometry.groups.length) return geometry;
  const index = new Uint32Array(groups.reduce((count, group) => count + group.count, 0));
  let offset = 0;
  for (const group of groups) {
    for (let i = group.start; i < group.start + group.count; i += 1) {
      index[offset++] = geometry.index ? geometry.index.getX(i) : i;
    }
  }
  return new BufferGeometry()
    .setAttribute('position', geometry.getAttribute('position'))
    .setIndex(new BufferAttribute(index, 1));
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
  if (manifest.collisionFromModels !== undefined && typeof manifest.collisionFromModels !== 'boolean') {
    throw new Error('校园碰撞来源无效。');
  }
  if (manifest.landingBoundary && (!Array.isArray(manifest.landingBoundary) || manifest.landingBoundary.length < 3
    || !manifest.landingBoundary.every(pair => Array.isArray(pair) && pair.length === 2 && pair.every(Number.isFinite)))) {
    throw new Error('校园可落地区域数据无效。');
  }
  for (const model of manifest.models) {
    if (typeof model?.url !== 'string'
      || (model.position !== undefined && !validCoordinate(model.position))
      || (model.rotationY !== undefined && !Number.isFinite(model.rotationY))
      || (model.surroundings !== undefined && typeof model.surroundings !== 'boolean')
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
  const [models, collisionAsset] = await Promise.all([
    Promise.all(manifest.models.map(model => loader.loadAsync(modelURL(model.url)))),
    !manifest.collisionFromModels && manifest.collisionUrl
      ? loader.loadAsync(modelURL(manifest.collisionUrl)) : undefined,
  ]);
  for (const [index, asset] of models.entries()) {
    const config = manifest.models[index];
    const wrapper = new Group();
    if (config.position) wrapper.position.fromArray(config.position);
    wrapper.rotation.y = config.rotationY ?? 0;
    wrapper.scale.setScalar(config.scale ?? 1);
    wrapper.add(asset.scene);
    if (config.surroundings) {
      wrapper.traverse(node => {
        node.userData.surroundings = true;
        node.userData.shadow = false;
      });
    }
    visuals.add(wrapper);
  }

  if (manifest.collisionFromModels) {
    collectMeshes(visuals, collision, structuralGeometry, true);
  } else if (collisionAsset) {
    collectMeshes(collisionAsset.scene, collision, mesh => mesh.userData.collision !== false ? mesh.geometry : undefined);
  } else {
    collectMeshes(visuals, collision, mesh => isCollisionNode(mesh) ? mesh.geometry : undefined);
  }

  const bounds = new Box3();
  visuals.updateWorldMatrix(true, true);
  visuals.traverse(object => {
    if (isCollisionNode(object)) {
      object.visible = false;
      return;
    }
    if (!(object instanceof Mesh)) return;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    object.castShadow = object.userData.shadow !== false && materials.some(material => !material.transparent
      && (!material.name.startsWith('decal-') || material.alphaTest > 0));
    object.receiveShadow = object.userData.shadow !== false;
    if (object.userData.surroundings) return;
    if (!object.geometry.boundingBox) object.geometry.computeBoundingBox();
    if (object.geometry.boundingBox) bounds.union(object.geometry.boundingBox.clone().applyMatrix4(object.matrixWorld));
  });
  if (bounds.isEmpty()) throw new Error('校园模型中没有可见网格。');
  const size = bounds.getSize(new Vector3());
  const center = bounds.getCenter(new Vector3());

  return { manifest, visuals, collision, bounds, size, center, manifestURL };
}
