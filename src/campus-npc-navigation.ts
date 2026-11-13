import { MathUtils, Vector3, type Object3D } from 'three';

type CampusStop = { point: number; wait: [number, number]; facing?: number };

export type CampusNavigationRoute = {
  points: [number, number, number][];
  facing?: number;
  loop?: boolean;
  pace?: number;
  group?: number;
  stops?: CampusStop[];
};

const fullTurn = Math.PI * 2;
const yawTo = (a: Vector3, b: Vector3) => Math.atan2(b.x - a.x, b.z - a.z);
const angleDelta = (from: number, to: number) => MathUtils.euclideanModulo(to - from + Math.PI, fullTurn) - Math.PI;

/** Give each walkable corridor a rounded centreline between its marked destinations. */
function buildPath(points: Vector3[], stops: CampusStop[], loop: boolean) {
  function corner(index: number) {
    const point = points[index];
    const previous = points[index - 1] ?? points.at(-1)!;
    const next = points[index + 1] ?? points[0];
    const reach = Math.min(.85, point.distanceTo(previous) * .26, point.distanceTo(next) * .26);
    const entry = point.clone().lerp(previous, reach / Math.max(1e-5, point.distanceTo(previous)));
    const exit = point.clone().lerp(next, reach / Math.max(1e-5, point.distanceTo(next)));
    return (t: number) => entry.clone().multiplyScalar((1 - t) ** 2)
      .addScaledVector(point, 2 * t * (1 - t)).addScaledVector(exit, t * t);
  }
  const origin = loop ? corner(0) : undefined;
  const samples = [origin?.(.5) ?? points[0]];
  const distances = [0];
  const marks = new Map([[0, 0]]);
  const stopsAt = new Set(stops.map(stop => stop.point));
  function append(point: Vector3) {
    const length = point.distanceTo(samples[samples.length - 1]);
    if (length <= 1e-5) return;
    samples.push(point);
    distances.push(distances[distances.length - 1] + length);
  }
  if (origin) for (let step = 5; step <= 8; step++) append(origin(step / 8));
  for (let i = 1; i < points.length; i++) {
    if (loop || i < points.length - 1) {
      const arc = corner(i);
      for (let step = 0; step <= 8; step++) {
        append(arc(step / 8));
        if (step === 4 && stopsAt.has(i)) marks.set(i, distances[distances.length - 1]);
      }
    } else {
      append(points[i]);
      marks.set(i, distances[distances.length - 1]);
    }
  }
  if (origin) for (let step = 0; step <= 4; step++) append(origin(step / 8));
  return { samples, distances, marks, length: distances[distances.length - 1] };
}

export function createCampusNavigation(root: Object3D, route: CampusNavigationRoute, index: number, naturalPace: number) {
  const state = { speed: 0, glance: 0 };
  const points = route.points.map(point => new Vector3(...point));
  root.position.copy(points[0]);
  root.rotation.y = route.facing ?? (points[1] ? yawTo(points[0], points[1]) : 0);
  if (points.length < 2) return (_dt: number) => state;

  const loop = route.loop ?? false;
  const supplied = route.stops ?? [];
  const stops: CampusStop[] = [...supplied];
  if (!stops.some(stop => stop.point === 0)) stops.unshift({ point: 0, wait: [1.5, 4] });
  if (!loop && !stops.some(stop => stop.point === points.length - 1)) {
    stops.push({ point: points.length - 1, wait: [2.1, 5.9] });
  }
  const path = buildPath(points, stops, loop);
  if (path.length <= 1e-5) return (_dt: number) => state;
  root.position.copy(path.samples[0]);
  root.rotation.y = yawTo(path.samples[0], path.samples[1]);
  const waitPoints = stops.map(stop => ({ ...stop, distance: path.marks.get(stop.point)! }))
    .filter(stop => Number.isFinite(stop.distance))
    .sort((a, b) => a.distance - b.distance);
  if (loop) waitPoints.push({ ...waitPoints[0], distance: path.length });
  let seed = (route.group ?? index + 1) * 10369 + 25;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const pace = route.pace ?? naturalPace * (.91 + .15 * random());
  let distance = 0;
  let velocity = 0;
  let leg = 1;
  let target = 1;
  let rest = .10 + .78 * random();
  let waitFacing = root.rotation.y;
  let elapsed = 0;
  let angleStep = 0;
  const turnBefore = new Vector3();
  const turnAfter = new Vector3();

  function sample(s: number, position: Vector3) {
    const clamped = loop ? MathUtils.euclideanModulo(s, path.length) : MathUtils.clamp(s, 0, path.length);
    let left = 0;
    let right = path.distances.length - 1;
    while (right - left > 1) {
      const mid = (left + right) >> 1;
      if (path.distances[mid] < clamped) left = mid;
      else right = mid;
    }
    const t = (clamped - path.distances[left]) / (path.distances[right] - path.distances[left]);
    return position.lerpVectors(path.samples[left], path.samples[right], t);
  }

  function tangentYaw(at: number) {
    sample(at - leg * .16, turnBefore);
    sample(at + leg * .28, turnAfter);
    return yawTo(turnBefore, turnAfter);
  }

  function turnPace(yaw: number, remaining: number) {
    // An actor can face the right way on a tight arc and still turn too fast
    // to plant a foot. Look ahead along the path and brake before the arc.
    const ahead = Math.min(remaining, .55);
    if (ahead < .05) return Infinity;
    const middleYaw = tangentYaw(distance + leg * ahead * .5);
    const futureYaw = tangentYaw(distance + leg * ahead);
    const bend = Math.max(Math.abs(angleDelta(yaw, middleYaw)), Math.abs(angleDelta(middleYaw, futureYaw)));
    return .82 * ahead * .5 / Math.max(.001, bend);
  }

  function arrive() {
    const stop = waitPoints[target];
    rest = MathUtils.lerp(stop.wait[0], stop.wait[1], random());
    waitFacing = stop.facing ?? root.rotation.y;
    if (loop && target === waitPoints.length - 1) {
      distance = 0;
      target = 1;
    } else {
      if (target === 0 || target === waitPoints.length - 1) leg *= -1;
      target += leg;
    }
  }

  return (dt: number) => {
    if (dt <= 0) return state;
    elapsed += dt;
    const waiting = rest > 0;
    const desiredYaw = tangentYaw(distance);
    const turn = angleDelta(root.rotation.y, desiredYaw);
    const turnRate = waiting ? 1.2 : 3.25;
    const desiredTurn = MathUtils.clamp(turn * 9, -turnRate, turnRate);
    angleStep = MathUtils.damp(angleStep, desiredTurn, 16, dt);
    root.rotation.y += angleStep * dt;
    if (waiting) {
      rest = Math.max(0, rest - dt);
      state.speed = 0;
    } else {
      const remaining = Math.abs(waitPoints[target].distance - distance);
      const cruise = pace * (1 + .045 * Math.sin(elapsed * .44 + (route.group ?? index) * 2.3));
      const brakingPace = Math.sqrt(2 * 1.3 * remaining);
      const alignedPace = cruise * (1 - .51 * MathUtils.smoothstep(Math.abs(turn), .22, .82));
      const cornerPace = Math.min(alignedPace, Math.max(.29, turnPace(desiredYaw, remaining)));
      const requested = Math.abs(turn) > .73 && velocity < .19 ? 0 : Math.min(cornerPace, brakingPace);
      velocity = Math.min(brakingPace, MathUtils.damp(velocity, requested, requested > velocity ? 4.2 : 9.5, dt));
      const travel = Math.min(remaining, velocity * dt);
      distance += leg * travel;
      sample(distance, root.position);
      state.speed = travel / dt;
      if (remaining - travel <= 1e-5) {
        arrive();
        velocity = 0;
      }
    }
    const glance = waiting ? MathUtils.clamp(angleDelta(root.rotation.y, waitFacing), -.47, .47) : 0;
    state.glance = MathUtils.damp(state.glance, glance, 4, dt);
    return state;
  };
}
