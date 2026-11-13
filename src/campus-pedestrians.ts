import {
  AnimationMixer, Box3, CanvasTexture, Color, Group, MathUtils, Mesh, MeshBasicMaterial,
  MeshStandardMaterial, PlaneGeometry, Quaternion, Vector3, type Object3D,
} from 'three';
import { GLTFLoader, type GLTF } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { clone } from 'three/addons/utils/SkeletonUtils.js';
import { styleCampusCharacter, type CampusPersonRole } from './campus-character-style.ts';

export type StreetPeopleRoute = {
  points: [number, number, number][];
  waitAt?: number;
  crossingEnd?: number;
};

export type CampusPeopleRoute = {
  points: [number, number, number][];
  role: CampusPersonRole;
  height: number;
  facing?: number;
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

function setPedestrianShadows(character: Object3D) {
  character.traverse(object => {
    if (object instanceof Mesh) object.receiveShadow = true;
  });
}

function attachCharacter(root: Group, character: Object3D, shadow: ReturnType<typeof createContactShadow>, scale = 1) {
  const contact = new Mesh(shadow.geometry, shadow.material);
  contact.position.y = .006;
  contact.scale.setScalar(scale);
  root.add(character, contact);
}

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
    const tint = (material: typeof object.material) => {
      if (!(material instanceof MeshStandardMaterial) || !/plum satin|original top/.test(material.name)) return material;
      const shirt = material.clone();
      shirt.color.multiplyScalar(1.12).multiply(shirtTint);
      return shirt;
    };
    object.material = Array.isArray(object.material) ? object.material.map(tint) : tint(object.material);
  });
  setPedestrianShadows(character);
  attachCharacter(root, character, shadow);

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

type CampusActorAsset = { asset: GLTF; height: number; ground: number };
const upright = new Vector3(0, 1, 0);
const bend = new Vector3(1, 0, 0);

function campusActor({ asset, height, ground }: CampusActorAsset, route: CampusPeopleRoute, index: number,
  shadow: ReturnType<typeof createContactShadow>) {
  const root = new Group();
  const points = route.points.map(point => new Vector3(...point));
  const last = points.length - 1;
  const scale = route.height / height;
  const start = points[0];
  root.name = `campus-npc-${index + 1}`;
  root.userData.role = route.role;
  root.userData.walkingRoute = last > 0;
  root.position.copy(start);

  const character = clone(asset.scene);
  styleCampusCharacter(character, route.role, index);
  character.scale.multiplyScalar(scale);
  character.position.y -= ground * scale;
  setPedestrianShadows(character);
  attachCharacter(root, character, shadow, scale);

  const mixer = new AnimationMixer(character);
  const idle = mixer.clipAction(asset.animations.find(clip => clip.name === 'Idle_Standing')!);
  const walk = mixer.clipAction(asset.animations.find(clip => clip.name === 'Walk_Relaxed')!);
  idle.time = (index * .73) % idle.getClip().duration;
  walk.time = (index * .43) % walk.getClip().duration;
  idle.play();
  walk.setEffectiveWeight(0).play();

  const head = character.getObjectByName('head');
  const arm = route.role === 'volunteer' ? character.getObjectByName('lowerarm_r') : undefined;
  const headOffset = new Quaternion();
  const armOffset = new Quaternion();
  const inverse = new Quaternion();
  const offset = index * 2.399963;

  let leg = 1;
  let segment = 0;
  let distance = 0;
  let speed = 0;
  let turningStep = 0;
  let pause = index % 4 * .21;
  let animationElapsed = 0;
  const pace = (route.role === 'pupil' ? .95 : 1.13) + index % 4 * .052;
  const initialYaw = last > 0 ? Math.atan2(points[1].x - start.x, points[1].z - start.z) : (route.facing ?? 0);
  root.rotation.y = initialYaw;
  mixer.update(0);

  function advancePath(dt: number) {
    const a = points[segment];
    const b = points[segment + leg];
    const length = a.distanceTo(b);
    const targetYaw = Math.atan2(b.x - a.x, b.z - a.z);
    const turn = MathUtils.euclideanModulo(targetYaw - root.rotation.y + Math.PI, Math.PI * 2) - Math.PI;
    const rest = pause > 0;
    pause = Math.max(0, pause - dt);
    if (!rest) root.rotation.y += MathUtils.clamp(turn, -3.4 * dt, 3.4 * dt);
    turningStep = MathUtils.damp(turningStep, rest ? 0 : MathUtils.clamp((Math.abs(turn) - .30) * 1.8, 0, .48), 15, dt);
    const remaining = length - distance;
    const endpoint = segment + leg === 0 || segment + leg === last;
    const targetSpeed = rest || Math.abs(turn) > .60 ? 0 : Math.min(pace, endpoint ? .24 + Math.sqrt(3 * remaining) : pace);
    speed = MathUtils.damp(speed, targetSpeed, targetSpeed > speed ? 6 : 12, dt);
    if (targetSpeed <= 0) return;
    distance = Math.min(length, distance + speed * dt);
    root.position.lerpVectors(a, b, length > 1e-6 ? distance / length : 1);
    if (distance < length) return;
    segment += leg;
    distance = 0;
    if (endpoint) {
      leg *= -1;
      pause = .65 + (index % 4) * .22;
    }
  }

  return {
    root,
    update(dt: number, timeMs: number, cameraPosition?: Vector3) {
      if (last > 0) advancePath(dt);
      const distanceSq = cameraPosition ? root.position.distanceToSquared(cameraPosition) : 0;
      root.visible = distanceSq < 170 ** 2;
      animationElapsed = Math.min(.2, animationElapsed + dt);
      const interval = distanceSq < 40 ** 2 ? 0 : distanceSq < 85 ** 2 ? 1 / 24 : 1 / 12;
      if (!root.visible || animationElapsed < interval) return;

      const stride = MathUtils.clamp(Math.max(speed / pace, turningStep), 0, 1);
      idle.setEffectiveWeight(1 - stride);
      walk.setEffectiveWeight(stride);
      walk.setEffectiveTimeScale(Math.max(speed / (1.3 * scale), turningStep * 1.45));
      // Undo our offsets before sampling the next pose, including unchanged tracks.
      head?.quaternion.multiply(inverse.copy(headOffset).invert());
      arm?.quaternion.multiply(inverse.copy(armOffset).invert());
      mixer.update(animationElapsed);
      animationElapsed = 0;
      const time = timeMs * .001;
      const glance = (Math.sin(time * .98 + offset) * .16 + Math.sin(time * .47 + offset) * .12) * (1 - stride);
      headOffset.setFromAxisAngle(upright, glance);
      head?.quaternion.multiply(headOffset);
      if (arm) {
        const wave = Math.max(0, Math.sin(time * .91 + offset) - .42);
        armOffset.setFromAxisAngle(bend, wave * .69 * (1 - stride));
        arm.quaternion.multiply(armOffset);
      }
    },
  };
}

export async function loadStreetPeople(root: Object3D, manifestURL: URL, routes: StreetPeopleRoute[],
  campusPeople: CampusPeopleRoute[] = []) {
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const cast = await Promise.all(['maya', 'sam'].map(name =>
    loader.loadAsync(new URL(`./street-people-${name}.glb?v=1`, manifestURL).href)));
  const shadow = createContactShadow();
  const people = routes.map((route, index) => pedestrian(cast[index % cast.length], route, index, shadow));
  const campusCast = cast.map(asset => {
    const { min, max } = new Box3().setFromObject(asset.scene, true);
    return { asset, height: max.y - min.y, ground: min.y };
  });
  const campus = campusPeople.filter(route => route.points.length > 0).map((route, index) =>
    campusActor(campusCast[route.role === 'guard' ? 1 : index % campusCast.length], route, index, shadow));
  for (const person of [...people, ...campus]) root.add(person.root);
  return (dt: number, timeMs: number, canCross: boolean, cameraPosition?: Vector3) => {
    for (const person of people) person.update(dt, timeMs, canCross);
    for (const person of campus) person.update(dt, timeMs, cameraPosition);
  };
}
