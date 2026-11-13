import {
  AnimationClip, AnimationMixer, Box3, CanvasTexture, Color, Group, MathUtils, Mesh, MeshBasicMaterial,
  MeshStandardMaterial, PlaneGeometry, Quaternion, Vector3, type Object3D,
} from 'three';
import { GLTFLoader, type GLTF } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { clone } from 'three/addons/utils/SkeletonUtils.js';
import { styleCampusCharacter, type CampusPersonRole } from './campus-character-style.ts';
import { createCampusNavigation, type CampusNavigationRoute } from './campus-npc-navigation.ts';

export type StreetPeopleRoute = {
  points: [number, number, number][];
  waitAt?: number;
  crossingEnd?: number;
};

export type CampusPeopleRoute = CampusNavigationRoute & {
  role: CampusPersonRole;
  height: number;
  facing?: number;
};

type WalkClip = { clip: AnimationClip; speed: number };
type MotionFile = Record<string, { clip: Parameters<typeof AnimationClip.parse>[0]; speed: number }[]>;
type PersonAsset = { asset: GLTF; walks: WalkClip[]; height: number; ground: number };

async function loadWalkMocap(manifestURL: URL, motionPath: string | undefined) {
  if (!motionPath) return undefined;
  try {
    const response = await fetch(new URL(motionPath, manifestURL));
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json() as MotionFile;
  } catch (error) {
    console.warn('步行动捕载入失败，使用备用步态', error);
    return undefined;
  }
}

function walkClip({ asset, walks }: PersonAsset, pace: number, scale: number, brisk = false): WalkClip {
  if (walks.length) {
    const distance = (walk: WalkClip) => Math.abs(Math.log(walk.speed * scale / pace));
    return walks.reduce((best, walk) => distance(walk) < distance(best) ? walk : best);
  }
  return {
    clip: asset.animations.find(clip => clip.name === (brisk ? 'Walk_Brisk' : 'Walk_Relaxed'))!,
    speed: brisk ? 1.7 : 1.3,
  };
}

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

function pedestrian(person: PersonAsset, route: StreetPeopleRoute, index: number,
  shadow: ReturnType<typeof createContactShadow>) {
  const { asset, ground } = person;
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
  const root = new Group();
  root.name = `street-pedestrian-${index + 1}`;
  const character = clone(asset.scene);
  character.scale.setScalar([.96, 1, 1.02, .98, 1, .98][index % 6]);
  character.position.y -= ground * character.scale.x;
  const strolling = walkClip(person, 1.19 + (index % 3) * .07, character.scale.x);
  const crossingWalk = walkClip(person, 1.7, character.scale.x, true);
  const strollSpeed = strolling.speed * character.scale.x * (.94 + (index % 3) * .04);
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
  const walk = mixer.clipAction(strolling.clip);
  const brisk = mixer.clipAction(crossingWalk.clip);
  idle.time = index * .61;
  walk.time = index * .31;
  idle.play();
  walk.setEffectiveWeight(0).play();
  brisk.setEffectiveWeight(0).play();
  let walkBlend = 0;
  let crossingBlend = 0;

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
      let travel = 0;
      if (targetSpeed > 0) {
        const length = points[segment].distanceTo(points[segment + leg]);
        travel = Math.min((1 - progress) * length, speed * dt);
        progress = Math.min(1, progress + travel / length);
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
      walkBlend = MathUtils.damp(walkBlend, MathUtils.smoothstep(speed, .08, .62), 12, dt);
      crossingBlend = MathUtils.damp(crossingBlend, crossing ? 1 : 0, 9, dt);
      idle.setEffectiveWeight(1 - walkBlend);
      const groundSpeed = dt > 0 ? travel / dt : 0;
      if (walk === brisk) {
        walk.setEffectiveWeight(walkBlend);
        walk.setEffectiveTimeScale(groundSpeed / (strolling.speed * character.scale.x));
      } else {
        walk.setEffectiveWeight(walkBlend * (1 - crossingBlend));
        brisk.setEffectiveWeight(walkBlend * crossingBlend);
        walk.setEffectiveTimeScale(groundSpeed / (strolling.speed * character.scale.x));
        brisk.setEffectiveTimeScale(groundSpeed / (crossingWalk.speed * character.scale.x));
      }
      mixer.update(dt);
    },
  };
}

const upright = new Vector3(0, 1, 0);
const bend = new Vector3(1, 0, 0);

function campusActor(person: PersonAsset, route: CampusPeopleRoute, index: number,
  shadow: ReturnType<typeof createContactShadow>) {
  const { asset, height, ground } = person;
  const root = new Group();
  const scale = route.height / height;
  root.name = `campus-npc-${index + 1}`;
  root.userData.role = route.role;
  root.userData.walkingRoute = route.points.length > 1;

  const character = clone(asset.scene);
  styleCampusCharacter(character, route.role, index);
  character.scale.multiplyScalar(scale);
  character.position.y -= ground * scale;
  setPedestrianShadows(character);
  attachCharacter(root, character, shadow, scale);

  const mixer = new AnimationMixer(character);
  const idle = mixer.clipAction(asset.animations.find(clip => clip.name === 'Idle_Standing')!);
  const desiredPace = route.pace ?? (route.role === 'pupil' ? .88 : 1.14) + (index % 4) * .058;
  const walking = walkClip(person, desiredPace, scale);
  const walk = mixer.clipAction(walking.clip);
  const nativePace = walking.speed * scale;
  const navigate = createCampusNavigation(root, route, index, nativePace);
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

  let stride = 0;
  let animationElapsed = 0;
  let animationDistance = 0;
  mixer.update(0);

  return {
    root,
    update(dt: number, timeMs: number, cameraPosition?: Vector3) {
      const { speed, turning } = navigate(dt);
      const distanceSq = cameraPosition ? root.position.distanceToSquared(cameraPosition) : 0;
      root.visible = distanceSq < 170 ** 2;
      if (!root.visible) {
        animationElapsed = animationDistance = 0;
        return;
      }
      animationElapsed += dt;
      // Integrating travel at every navigation tick keeps stride phase matched
      // to ground motion even when a distant rig is posed less frequently.
      const turnPace = .8 * turning;
      animationDistance += Math.max(speed, turnPace) * dt;
      const interval = distanceSq < 40 ** 2 ? 0 : distanceSq < 85 ** 2 ? 1 / 24 : 1 / 12;
      if (animationElapsed < interval || animationElapsed <= 0) return;

      stride = MathUtils.damp(stride, MathUtils.smoothstep(Math.max(speed, turnPace), .06, .56), 10, animationElapsed);
      idle.setEffectiveWeight(1 - stride);
      walk.setEffectiveWeight(stride);
      walk.setEffectiveTimeScale(animationDistance / (animationElapsed * nativePace));
      // Undo our offsets before sampling the next pose, including unchanged tracks.
      head?.quaternion.multiply(inverse.copy(headOffset).invert());
      arm?.quaternion.multiply(inverse.copy(armOffset).invert());
      mixer.update(animationElapsed);
      animationElapsed = animationDistance = 0;
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
  campusPeople: CampusPeopleRoute[] = [], motionPath?: string) {
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const motion = loadWalkMocap(manifestURL, motionPath);
  const cast: PersonAsset[] = await Promise.all(['maya', 'sam'].map(async name => {
    const asset = await loader.loadAsync(new URL(`./street-people-${name}.glb?v=1`, manifestURL).href);
    const { min, max } = new Box3().setFromObject(asset.scene, true);
    const walks = (await motion)?.[name]?.map(entry => ({
      clip: AnimationClip.parse(entry.clip),
      speed: entry.speed,
    })) ?? [];
    return { asset, height: max.y - min.y, ground: min.y, walks };
  }));
  const shadow = createContactShadow();
  const people = routes.map((route, index) => pedestrian(cast[index % cast.length], route, index, shadow));
  const campus = campusPeople.filter(route => route.points.length > 0).map((route, index) =>
    campusActor(cast[route.role === 'guard' ? 1 : index % cast.length], route, index, shadow));
  for (const person of [...people, ...campus]) root.add(person.root);
  return (dt: number, timeMs: number, canCross: boolean, cameraPosition?: Vector3) => {
    for (const person of people) person.update(dt, timeMs, canCross);
    for (const person of campus) person.update(dt, timeMs, cameraPosition);
  };
}
