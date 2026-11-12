import { Box3, InstancedMesh, Matrix3, Matrix4, Mesh, Object3D, Raycaster, Triangle, Vector3 } from 'three';
import type { BufferGeometry, Intersection } from 'three';
import type { PlanCoordinate } from './campus.ts';

const down = new Vector3(0, -1, 0);
const radius = .27;
const bodyHeight = 1.80;
const probeOffsets = [-radius, 0, radius];

type Blocker = { triangle: Triangle; bounds: Box3 };

function insideBoundary(boundary: PlanCoordinate[], x: number, z: number) {
  let inside = false;
  for (let index = 0, previous = boundary.length - 1; index < boundary.length; previous = index++) {
    const [aX, aZ] = boundary[index];
    const [bX, bZ] = boundary[previous];
    if ((aZ > z) !== (bZ > z) && x < (bX - aX) * (z - aZ) / (bZ - aZ) + aX) inside = !inside;
  }
  return inside;
}

function collectBlockers(collision: Object3D) {
  const blockers: Blocker[] = [];
  const matrix = new Matrix4();
  collision.traverse(object => {
    if (!(object instanceof Mesh)) return;
    const geometry: BufferGeometry = object.geometry;
    const positions = geometry.getAttribute('position');
    if (!positions) return;
    const indices = geometry.index;
    const count = indices?.count ?? positions.count;
    const instances = object instanceof InstancedMesh ? object.count : 1;
    const point = (index: number) => new Vector3().fromBufferAttribute(positions, indices?.getX(index) ?? index).applyMatrix4(matrix);

    for (let instance = 0; instance < instances; instance++) {
      if (object instanceof InstancedMesh) {
        object.getMatrixAt(instance, matrix);
        matrix.premultiply(object.matrixWorld);
      } else matrix.copy(object.matrixWorld);

      for (let index = 0; index + 2 < count; index += 3) {
        const triangle = new Triangle(point(index), point(index + 1), point(index + 2));
        blockers.push({ triangle, bounds: new Box3().setFromPoints([triangle.a, triangle.b, triangle.c]) });
      }
    }
  });
  return blockers;
}

export function createLandingQuery(collision: Object3D, boundary: PlanCoordinate[]) {
  collision.updateWorldMatrix(true, true);
  const collisionBounds = new Box3().setFromObject(collision);
  const blockers = collectBlockers(collision);
  const ray = new Raycaster();
  const rayOrigin = new Vector3();
  const normal = new Vector3();
  const matrix = new Matrix4();
  const normalMatrix = new Matrix3();
  const body = new Box3();

  function isWalkable(hit: Intersection) {
    if (!hit.face || !(hit.object instanceof Mesh)) return false;
    const material = Array.isArray(hit.object.material) ? hit.object.material[hit.face.materialIndex] : hit.object.material;
    if (material?.name !== 'walkable') return false;
    if (hit.object instanceof InstancedMesh && hit.instanceId !== undefined) {
      hit.object.getMatrixAt(hit.instanceId, matrix);
      matrix.premultiply(hit.object.matrixWorld);
    } else matrix.copy(hit.object.matrixWorld);
    normal.copy(hit.face.normal).applyNormalMatrix(normalMatrix.getNormalMatrix(matrix)).normalize();
    return normal.y >= .707;
  }

  function topGround(x: number, z: number) {
    if (!insideBoundary(boundary, x, z)) return undefined;
    ray.set(rayOrigin.set(x, collisionBounds.max.y + 1, z), down);
    // Inspect the first face from above the whole scene, including when the
    // flight camera itself is already underneath a roof or other solid.
    const hit = ray.intersectObject(collision, true)[0];
    return hit && isWalkable(hit) ? hit.point.y : undefined;
  }

  return (origin: Vector3) => {
    const { x, y, z } = origin;
    if (![x, y, z].every(Number.isFinite)) return undefined;
    const floor = topGround(x, z);
    if (floor === undefined || y < floor + .30) return undefined;

    for (const dx of probeOffsets) for (const dz of probeOffsets) {
      if (dx === 0 && dz === 0) continue;
      const sample = topGround(x + dx, z + dz);
      if (sample === undefined || Math.abs(sample - floor) > .18) return undefined;
    }
    body.min.set(x - radius, floor + .05, z - radius);
    body.max.set(x + radius, floor + bodyHeight, z + radius);
    if (blockers.some(({ bounds, triangle }) => bounds.intersectsBox(body) && body.intersectsTriangle(triangle))) return undefined;

    return new Vector3(x, floor + .035, z);
  };
}
