import { CanvasTexture, Mesh, MeshBasicMaterial, PlaneGeometry, Vector3, type Object3D } from 'three';
import type { Coordinate } from './campus.ts';
import type { Lamp } from './campus-traffic.ts';

export type StreetLane = { points: Coordinate[]; stop: number; start: number[]; speed: number };
export type StreetVehicle = {
  object: Object3D;
  length: number;
  update: (travel: number, braking: boolean) => void;
};

export function moveStreetVehicles(lanes: StreetLane[], instantiate: (index: number) => StreetVehicle) {
  // Use a short contact shadow to keep the tyres grounded while the static map
  // is cached. Rendering all moving actors into the campus shadow map is costly.
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 32;
  const context = canvas.getContext('2d');
  if (context) {
    const gradient = context.createRadialGradient(16, 16, 5, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(21,23,23,.78)');
    gradient.addColorStop(.64, 'rgba(21,23,23,.46)');
    gradient.addColorStop(1, 'rgba(21,23,23,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 32, 32);
  }
  const ground = new PlaneGeometry(2.78, 1);
  ground.rotateX(-Math.PI / 2);
  const contactMaterial = new MeshBasicMaterial({ map: new CanvasTexture(canvas), transparent: true, depthWrite: false });
  let index = 0;
  const traffic = lanes.map(lane => {
    const points = lane.points.map(point => new Vector3(...point));
    const distances = [0];
    for (let i = 1; i < points.length; i++) {
      distances.push(distances[i - 1] + points[i - 1].distanceTo(points[i]));
    }
    const length = distances.at(-1)!;
    const vehicles = lane.start.map(s => {
      const vehicle = instantiate(index);
      vehicle.object.name = `street-vehicle-${++index}`;
      const contact = new Mesh(ground, contactMaterial);
      contact.position.y = .009;
      contact.scale.z = vehicle.length + .86;
      vehicle.object.add(contact);
      return { ...vehicle, s, speed: lane.speed * .76 };
    });
    const byDistance = [...vehicles];
    return { lane, byDistance, points, distances, length };
  });
  const before = new Vector3();
  const after = new Vector3();

  function sample(points: Vector3[], distances: number[], distance: number, target: Vector3) {
    let end = 1;
    while (end < distances.length - 1 && distances[end] < distance) end++;
    const start = distances[end - 1];
    const fraction = Math.max(0, Math.min(1, (distance - start) / (distances[end] - start)));
    target.lerpVectors(points[end - 1], points[end], fraction);
  }

  function place(car: StreetVehicle & { s: number }, points: Vector3[], distances: number[]) {
    sample(points, distances, car.s, car.object.position);
    sample(points, distances, car.s - 1.4, before);
    sample(points, distances, car.s + 1.4, after);
    car.object.rotation.y = Math.atan2(after.x - before.x, after.z - before.z);
  }

  for (const { byDistance, points, distances } of traffic) {
    for (const car of byDistance) place(car, points, distances);
  }
  return (dt: number, lamp: Lamp) => {
    if (dt <= 0) return;
    for (const { lane, byDistance, points, distances, length } of traffic) {
      byDistance.sort((a, b) => b.s - a.s);
      let leader: (typeof byDistance)[number] | undefined;
      const tail = byDistance.at(-1);
      for (const car of byDistance) {
        const line = lane.stop - car.length / 2 - .32;
        let gap = lamp !== 'green' && car.s <= line + .0001 ? line - car.s : Infinity;
        if (leader) gap = Math.min(gap, leader.s - car.s - (car.length + leader.length) / 2 - 2.4);
        gap = Math.max(0, gap);
        const target = Math.min(lane.speed, Math.sqrt(2 * 2.1 * gap));
        const nextSpeed = Math.max(car.speed - 4.5 * dt, Math.min(car.speed + 1.65 * dt, target));
        const travel = Math.min(gap, (car.speed + nextSpeed) * .5 * dt);
        const braking = nextSpeed < car.speed - .015 || target < .2;
        car.speed = travel < nextSpeed * dt * .85 ? travel / dt : nextSpeed;
        car.s = Math.min(car.s + travel, length);
        if (car.s >= length && (tail === car || (tail?.s ?? length) > car.length + 8)) {
          car.s = 0;
          leader = undefined;
        } else {
          leader = car;
        }
        place(car, points, distances);
        car.update(travel, braking);
      }
    }
  };
}
