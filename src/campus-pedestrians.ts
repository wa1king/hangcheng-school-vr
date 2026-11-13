import {
  AnimationMixer, CanvasTexture, Color, Group, MathUtils, Mesh, MeshBasicMaterial,
  MeshStandardMaterial, PlaneGeometry, Vector3, type Object3D,
} from 'three';
import { GLTFLoader, type GLTF } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { clone } from 'three/addons/utils/SkeletonUtils.js';

export type StreetPeopleRoute = {
  points: [number, number, number][];
  waitAt?: number;
  crossingEnd?: number;
};

function createContactShadow() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 32;
  const context = canvas.getContext('2d');
  if (context) {
    const gradient = context.createRadialGradient(16, 16, 2, 16, 16, 15);
    gradient.addColorStop(0, 'rgba(20, 19, 16, .65)');
    gradient.addColorStop(.5, 'rgba(20, 19, 16, .3)');
    gradient.addColorStop(1, 'rgba(20, 19, 16, 0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 32, 32);
  }
  const geometry = new PlaneGeometry(.88, .64);
  geometry.rotateX(-Math.PI / 2);
  return { geometry, material: new MeshBasicMaterial({
    map: new CanvasTexture(canvas), transparent: true, depthWrite: false, polygonOffset: true,
    polygonOffsetFactor: -2,
  }) };
}

const variants = [0x9eb3af, 0xc5d4e2, 0xb59687, 0x9caaa0, 0xc7aebb, 0xa2b4ce];

function pedestrian(asset: GLTF, route: StreetPeopleRoute, index: number,
  shadow: ReturnType<typeof createContactShadow>) {
  const points = route.points.map(point => new Vector3(...point));
  const last = points.length - 1;
  const crossingStart = route.waitAt;
  const crossingEnd = route.crossingEnd ?? (crossingStart === undefined ? undefined : crossingStart + 1);
  let leg = 1;
  let segment = crossingStart ?? (index % last);
  let progress = crossingStart === undefined ? (index % 3 + 1) * .16 : 0;
  let lastCrossing: number | undefined;
  let speed = 0;
  let look = 0;
  let turning = false;
  const strollSpeed = 1.12 + (index % 3) * .075;
  const root = new Group();
  root.name = `street-pedestrian-${index + 1}`;
  const character = clone(asset.scene);
  character.scale.setScalar([.96, 1, 1.02, .98, 1, .98][index % 6]);
  const shirtTint = new Color(variants[index % 6]).lerp(new Color(0xffffff), .4);
  character.traverse(object => {
    if (!(object instanceof Mesh)) return;
    object.receiveShadow = true;
    const tint = (material: typeof object.material) => {
      if (!(material instanceof MeshStandardMaterial) || !/plum satin|original top/.test(material.name)) return material;
      const shirt = material.clone();
      shirt.color.multiplyScalar(1.12).multiply(shirtTint);
      return shirt;
    };
    object.material = Array.isArray(object.material) ? object.material.map(tint) : tint(object.material);
  });
  const contact = new Mesh(shadow.geometry, shadow.material);
  contact.position.y = .006;
  root.add(character, contact);

  const mixer = new AnimationMixer(character);
  const idle = mixer.clipAction(asset.animations.find(clip => clip.name === 'Idle_Standing')!);
  const walk = mixer.clipAction(asset.animations.find(clip => clip.name === 'Walk_Relaxed')!);
  const brisk = mixer.clipAction(asset.animations.find(clip => clip.name === 'Walk_Brisk')!);
  idle.time = index * .61;
  walk.time = index * .31;
  idle.play();
  walk.setEffectiveWeight(0).play();
  brisk.setEffectiveWeight(0).play();

  function isCrossing() {
    return crossingStart !== undefined && crossingEnd !== undefined &&
      (leg > 0 ? segment >= crossingStart && segment < crossingEnd
        : segment <= crossingEnd && segment > crossingStart);
  }
  function place() {
    root.position.lerpVectors(points[segment], points[segment + leg], progress);
  }
  function desiredYaw() {
    const a = points[segment], b = points[segment + leg];
    return Math.atan2(b.x - a.x, b.z - a.z);
  }
  look = desiredYaw();
  root.rotation.y = look;
  place();
  mixer.update(0);

  return {
    root,
    update(dt: number, timeMs: number, canCross: boolean) {
      const leavingCurb = progress === 0 && (leg > 0 ? segment === crossingStart : segment === crossingEnd);
      // An actor that has stepped onto the zebra finishes crossing even if the signal changes.
      const ready = !leavingCurb || (canCross && (lastCrossing === undefined || timeMs - lastCrossing > 10000));
      const yaw = desiredYaw();
      const difference = MathUtils.euclideanModulo(yaw - look + Math.PI, 2 * Math.PI) - Math.PI;
      look += MathUtils.clamp(difference, -3.6 * dt, 3.6 * dt);
      root.rotation.y = look;
      if (turning && Math.abs(difference) < .17) turning = false;
      const crossing = isCrossing();
      const targetSpeed = ready && !turning ? (crossing ? 1.7 : strollSpeed) : 0;
      if (ready && leavingCurb && !turning && dt > 0) lastCrossing = timeMs;
      speed = MathUtils.damp(speed, targetSpeed, targetSpeed ? 8 : 14, dt);
      if (targetSpeed > 0) {
        const length = points[segment].distanceTo(points[segment + leg]);
        progress = Math.min(1, progress + speed * dt / length);
        place();
        if (progress === 1) {
          segment += leg;
          progress = 0;
          if (segment === 0 || segment === last) {
            leg *= -1;
            turning = true;
          }
        }
      }
      const moving = MathUtils.clamp(speed / (crossing ? 1.7 : strollSpeed), 0, 1);
      idle.setEffectiveWeight(1 - moving);
      walk.setEffectiveWeight(crossing ? 0 : moving);
      walk.setEffectiveTimeScale(speed / 1.3 / character.scale.x);
      brisk.setEffectiveWeight(crossing ? moving : 0);
      brisk.setEffectiveTimeScale(speed / 1.7 / character.scale.x);
      mixer.update(dt);
    },
  };
}

export async function loadStreetPeople(root: Object3D, manifestURL: URL, routes: StreetPeopleRoute[]) {
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const cast = await Promise.all(['maya', 'sam'].map(name =>
    loader.loadAsync(new URL(`./street-people-${name}.glb?v=1`, manifestURL).href)));
  const shadow = createContactShadow();
  const people = routes.map((route, index) => pedestrian(cast[index % cast.length], route, index, shadow));
  for (const person of people) root.add(person.root);
  return (dt: number, timeMs: number, canCross: boolean) => {
    for (const person of people) person.update(dt, timeMs, canCross);
  };
}
