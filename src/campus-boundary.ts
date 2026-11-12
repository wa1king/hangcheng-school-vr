import type { PlanCoordinate } from './campus.ts';

export type CampusTravelLimit = (fromX: number, fromZ: number, toX: number, toZ: number) => number;

/** Clip travel from an interior position at the first exit, including across concave corners. */
export function createCampusTravelLimit(boundary: PlanCoordinate[]): CampusTravelLimit {
  const edges = boundary.map(([x, z], index) => {
    const [nextX, nextZ] = boundary[(index + 1) % boundary.length];
    return { x, z, dx: nextX - x, dz: nextZ - z };
  });
  const winding = Math.sign(edges.reduce((area, edge) => area + edge.x * edge.dz - edge.z * edge.dx, 0));
  return (fromX, fromZ, toX, toZ) => {
    const dx = toX - fromX;
    const dz = toZ - fromZ;
    const length = Math.hypot(dx, dz);
    if (length < 1e-8) return 1;
    let limit = 1;
    for (const edge of edges) {
      const determinant = dx * edge.dz - dz * edge.dx;
      if (determinant * winding <= 1e-9) continue;
      const offsetX = edge.x - fromX;
      const offsetZ = edge.z - fromZ;
      const edgeFraction = (offsetX * dz - offsetZ * dx) / determinant;
      if (edgeFraction < -1e-9 || edgeFraction > 1 + 1e-9) continue;
      const travelFraction = (offsetX * edge.dz - offsetZ * edge.dx) / determinant;
      if (travelFraction >= -1e-9 && travelFraction <= limit) {
        limit = Math.max(0, travelFraction - .001 / length);
      }
    }
    return limit;
  };
}
