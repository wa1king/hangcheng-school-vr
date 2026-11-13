import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  AnimationClip, AnimationMixer, Quaternion, QuaternionKeyframeTrack, Vector3,
  VectorKeyframeTrack,
} from 'three';
import { BVHLoader } from 'three/addons/loaders/BVHLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

// Carnegie Mellon Graphics Lab Motion Capture Database, converted to BVH by Bruce Hahne.
// BVH mirror: https://github.com/una-dinosauria/cmu-mocap/tree/09a07f54f3bbb58797325f009282d0b2048a2871
// Usage: node tools/retarget-campus-mocap.mjs <directory of CMU BVHs> <output JSON>
const [sourceDirectory, output] = process.argv.slice(2);
if (!sourceDirectory || !output) throw new Error('Supply the CMU BVH directory and the output JSON path.');
globalThis.self = globalThis;
globalThis.createImageBitmap = async () => ({ width: 1, height: 1 });

const fps = 30;
const up = new Vector3(0, 1, 0);
const right = new Vector3(1, 0, 0);
const captures = [
  { id: '37_01', duration: 1.267, label: 'Slow' },
  { id: '07_01', duration: 1.100, label: 'Normal' },
  { id: '08_01', duration: 1.000, label: 'Purposeful' },
  { id: '07_12', duration: .867, label: 'Brisk' },
];
const upperBody = {
  pelvis: 'Hips', spine_01: 'LowerBack', spine_02: 'Spine', spine_03: 'Spine1',
  neck_01: 'Neck1', head: 'Head',
};
const targetNames = [
  ...Object.keys(upperBody), 'clavicle_l', 'clavicle_r', 'upperarm_l', 'upperarm_r',
  'lowerarm_l', 'lowerarm_r', 'hand_l', 'hand_r', 'thigh_l', 'thigh_r', 'calf_l', 'calf_r',
  'foot_l', 'foot_r', 'ball_l', 'ball_r',
];
const sideNames = [['l', 'Left'], ['r', 'Right']];
const quaternion = () => new Quaternion();
const vector = () => new Vector3();
const relativeDirection = (a, b) => b.clone().sub(a).normalize();
const shortestRotation = (from, to) => quaternion().setFromUnitVectors(from, to);

async function readCapture(specification) {
  const text = await readFile(join(sourceDirectory, specification.id + '.bvh'), 'utf8');
  const { skeleton, clip } = new BVHLoader().parse(text);
  const hips = skeleton.bones[0];
  const mixer = new AnimationMixer(hips);
  mixer.clipAction(clip).play();
  const joints = new Map(skeleton.bones.map(bone => [bone.name, bone]));
  const sample = time => {
    mixer.setTime(time);
    hips.updateMatrixWorld(true);
    return Object.fromEntries([...joints].map(([name, joint]) => [name, {
      position: joint.getWorldPosition(vector()),
      rotation: joint.getWorldQuaternion(quaternion()),
    }]));
  };

  // Skip the synthetic T-pose at frame zero. Match equivalent support phases
  // by feet and knees relative to the pelvis, rather than cutting on a fixed time.
  const closureJoints = [
    'LeftUpLeg', 'LeftLeg', 'LeftFoot', 'LeftToeBase',
    'RightUpLeg', 'RightLeg', 'RightFoot', 'RightToeBase',
    'LeftForeArm', 'RightForeArm', 'LeftHand', 'RightHand',
  ];
  let best;
  for (let start = 0.25; start < clip.duration - specification.duration - .38; start += 1 / fps) {
    const first = sample(start);
    for (let offset = -2; offset <= 2; offset++) {
      const frames = Math.round(specification.duration * fps) + offset;
      const end = start + frames / fps;
      const last = sample(end);
      const score = closureJoints.reduce((sum, name) => {
        const a = first[name].position.clone().sub(first.Hips.position);
        const b = last[name].position.clone().sub(last.Hips.position);
        return sum + a.distanceToSquared(b);
      }, 0) + offset * offset * .30;
      if (!best || score < best.score) best = { start, end, frames, first, last, score };
    }
  }
  const travel = best.last.Hips.position.clone().sub(best.first.Hips.position);
  travel.y = 0;
  const heading = quaternion().setFromAxisAngle(up, -Math.atan2(travel.x, travel.z));
  const leg = ['Left', 'Right'].reduce((sum, side) => {
    const pose = best.first;
    return sum + pose[side + 'UpLeg'].position.distanceTo(pose[side + 'Leg'].position) +
      pose[side + 'Leg'].position.distanceTo(pose[side + 'Foot'].position);
  }, 0) / 2;
  const frames = Array.from({ length: best.frames + 1 }, (_, frame) => sample(best.start + frame / fps));
  for (const frame of frames) {
    for (const pose of Object.values(frame)) {
      pose.position.applyQuaternion(heading);
      pose.rotation.premultiply(heading);
    }
  }
  return { ...specification, duration: best.frames / fps, frames, leg, travel: travel.length() };
}

function transformPosition(bone, point) {
  bone.parent.updateWorldMatrix(true, false);
  bone.position.copy(bone.parent.worldToLocal(point.clone()));
}

function transformRotation(bone, worldRotation) {
  bone.quaternion.copy(bone.parent.getWorldQuaternion(quaternion()).invert().multiply(worldRotation));
}

function legBend(hip, foot, sourceKnee, thigh, shin) {
  const line = foot.clone().sub(hip);
  const length = line.length();
  line.divideScalar(length);
  const effectiveLength = Math.min(length, thigh + shin - .0001);
  const along = (effectiveLength ** 2 + thigh ** 2 - shin ** 2) / (2 * effectiveLength);
  const side = sourceKnee.clone().addScaledVector(line, -sourceKnee.dot(line)).normalize();
  return hip.clone().addScaledVector(line, along).addScaledVector(side, Math.sqrt(Math.max(0, thigh ** 2 - along ** 2)));
}

function supportCorrections(frames, source) {
  const count = frames.length - 1;
  const ankle = frames.map(frame => frame[source + 'Foot'].position);
  const toes = frames.map(frame => frame[source + 'ToeBase'].position);
  const speed = (joint, index) => joint[index + 1].distanceTo(joint[index]) * fps;
  const corrections = Array.from({ length: frames.length }, vector);
  const intervals = [];
  let index = 0;
  while (index < count) {
    if (speed(ankle, index) > 5 || speed(toes, index) > 5) {
      index++;
      continue;
    }
    const start = index;
    while (index < count && speed(ankle, index) <= 5 && speed(toes, index) <= 5) index++;
    if (index - start < 3) continue;
    intervals.push([start, index]);
    const mean = vector();
    for (let sample = start; sample <= index; sample++) mean.add(ankle[sample]);
    mean.multiplyScalar(1 / (index - start + 1));
    for (let sample = Math.max(0, start - 2); sample <= Math.min(count, index + 2); sample++) {
      const blend = Math.min(1, (sample - start + 3) / 3, (index - sample + 3) / 3);
      corrections[sample].addScaledVector(mean.clone().sub(ankle[sample]), blend);
    }
  }
  return { corrections, intervals };
}

async function readCharacter(name) {
  const bytes = await readFile(new URL(`../public/scene/street-people-${name}.glb`, import.meta.url));
  const { scene, animations } = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder)
    .parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '');
  const mixer = new AnimationMixer(scene);
  mixer.clipAction(animations.find(clip => clip.name === 'Idle_Standing')).play();
  mixer.update(0);
  scene.updateMatrixWorld(true);
  const bones = Object.fromEntries(targetNames.map(name => [name, scene.getObjectByName(name)]));
  const rest = Object.fromEntries(Object.entries(bones).map(([name, bone]) => [name, {
    local: bone.quaternion.clone(), origin: bone.position.clone(),
    position: bone.getWorldPosition(vector()), rotation: bone.getWorldQuaternion(quaternion()),
  }]));
  const shoes = [];
  scene.traverse(node => {
    if (node.isSkinnedMesh && /^shoes/i.test(node.name)) shoes.push(node);
  });
  return { scene, bones, rest, shoes };
}

function shoeSamples(shoes) {
  const point = vector();
  const levels = [[], []];
  for (const mesh of shoes) {
    mesh.skeleton.update();
    for (let index = 0; index < mesh.geometry.attributes.position.count; index++) {
      mesh.getVertexPosition(index, point).applyMatrix4(mesh.matrixWorld);
      levels[point.x < 0 ? 1 : 0].push(point.clone());
    }
  }
  return levels.map(positions => {
    positions.sort((a, b) => a.y - b.y);
    return positions[0];
  });
}

function supportPoint(shoe, indices) {
  const point = vector();
  const center = vector();
  for (const index of indices) {
    shoe.getVertexPosition(index, point).applyMatrix4(shoe.matrixWorld);
    center.add(point);
  }
  return center.multiplyScalar(1 / indices.length);
}

function retarget(character, capture) {
  const { scene, bones, rest, shoes } = character;
  const frameCount = capture.frames.length;
  const rotations = Object.fromEntries(targetNames.map(name => [name, []]));
  const positions = { pelvis: [], foot_l: [], foot_r: [] };
  const pelvisRest = rest.pelvis.position;
  const limbs = sideNames.map(([side, source]) => {
    const thigh = rest[`thigh_${side}`].position.distanceTo(rest[`calf_${side}`].position);
    const shin = rest[`calf_${side}`].position.distanceTo(rest[`foot_${side}`].position);
    return { side, source, thigh, shin, support: supportCorrections(capture.frames, source) };
  });
  const legRatio = limbs.reduce((sum, limb) => sum + limb.thigh + limb.shin, 0) / 2 / capture.leg;
  const speed = capture.travel * legRatio / capture.duration;
  const first = capture.frames[0].Hips.position;
  const last = capture.frames.at(-1).Hips.position;
  const reference = Object.fromEntries(Object.values(upperBody).map(name => {
    const mean = capture.frames[0][name].rotation.clone();
    for (let index = 1; index < frameCount; index++) {
      mean.slerp(capture.frames[index][name].rotation, 1 / (index + 1));
    }
    return [name, mean.invert()];
  }));
  const meanY = capture.frames.reduce((sum, frame) => sum + frame.Hips.position.y, 0) / frameCount;
  const lowFeet = limbs.map(({ source }) => Math.min(...capture.frames.map(frame =>
    frame[`${source}Foot`].position.y)));
  const midpointX = (first.x + last.x) * .5;
  const centerZ = limbs.map(({ source }) => capture.frames.reduce((sum, frame) =>
    sum + frame[`${source}Foot`].position.z - frame.Hips.position.z, 0) / frameCount);
  const contactPatch = new Map();
  const samplePose = index => {
    for (const [name, values] of Object.entries(rotations)) bones[name].quaternion.copy(values[index]);
    for (const [name, values] of Object.entries(positions)) bones[name].position.copy(values[index]);
    scene.updateMatrixWorld(true);
  };

  for (let index = 0; index < frameCount; index++) {
    const frame = capture.frames[index];
    const phase = index / (frameCount - 1);
    for (const name of targetNames) {
      bones[name].quaternion.copy(rest[name].local);
      bones[name].position.copy(rest[name].origin);
    }
    const center = first.clone().lerp(last, phase);
    const hip = frame.Hips.position;
    const pelvis = pelvisRest.clone().add(new Vector3(
      (hip.x - center.x) * legRatio,
      (hip.y - meanY) * legRatio - .025,
      (hip.z - center.z) * legRatio,
    ));
    transformPosition(bones.pelvis, pelvis);
    for (const [name, source] of Object.entries(upperBody)) {
      const change = frame[source].rotation.clone().multiply(reference[source]);
      const weight = name === 'pelvis' ? .52 : name === 'head' ? .35 : .48;
      transformRotation(bones[name], quaternion().slerp(change, weight).multiply(rest[name].rotation));
    }

    for (const [legIndex, { side, source, thigh, shin, support }] of limbs.entries()) {
      const ankle = frame[`${source}Foot`].position.clone().add(support.corrections[index]);
      const toes = frame[`${source}ToeBase`].position.clone().add(support.corrections[index]);
      const joint = bones[`foot_${side}`];
      const footRest = rest[`foot_${side}`];
      const footTarget = new Vector3(
        (ankle.x - midpointX) * legRatio * .80,
        footRest.position.y + (ankle.y - lowFeet[legIndex]) * legRatio,
        footRest.position.z + (ankle.z - center.z - centerZ[legIndex]) * legRatio,
      );
      const capturedDirection = relativeDirection(ankle, toes);
      // Keep the captured heel/toe pitch; tame lateral toe flare on the mismatched shoe lasts.
      const pitch = Math.atan2(capturedDirection.y, capturedDirection.z);
      const yaw = Math.atan2(capturedDirection.x, capturedDirection.z);
      const baselinePitch = Math.atan2(
        rest[`ball_${side}`].position.y - footRest.position.y,
        rest[`ball_${side}`].position.z - footRest.position.z,
      );
      const footRotation = quaternion().setFromAxisAngle(up, yaw * .55)
        .multiply(quaternion().setFromAxisAngle(right, (baselinePitch - pitch) * .86))
        .multiply(footRest.rotation);
      transformPosition(joint, footTarget);
      transformRotation(joint, footRotation);

      const upper = bones[`thigh_${side}`];
      const lower = bones[`calf_${side}`];
      const hipJoint = upper.getWorldPosition(vector());
      const originalKnee = frame[`${source}Leg`].position.clone().sub(frame[`${source}UpLeg`].position);
      const knee = legBend(hipJoint, footTarget, originalKnee, thigh, shin);
      const upperRest = rest[`thigh_${side}`];
      const lowerRest = rest[`calf_${side}`];
      const upperDirection = relativeDirection(upperRest.position, lowerRest.position);
      transformRotation(upper, shortestRotation(upperDirection, relativeDirection(hipJoint, knee)).multiply(upperRest.rotation));
      const lowerDirection = relativeDirection(lowerRest.position, footRest.position);
      transformRotation(lower, shortestRotation(lowerDirection, relativeDirection(knee, footTarget)).multiply(lowerRest.rotation));

      const shoulder = rest[`upperarm_${side}`];
      const elbow = rest[`lowerarm_${side}`];
      const palm = rest[`hand_${side}`];
      const downArm = relativeDirection(frame[`${source}Arm`].position, frame[`${source}ForeArm`].position);
      const downForearm = relativeDirection(frame[`${source}ForeArm`].position, frame[`${source}Hand`].position);
      const outward = side === 'l' ? 1 : -1;
      downArm.x = outward * Math.max(.135, Math.abs(downArm.x) * .86);
      downForearm.x = outward * Math.max(.045, Math.abs(downForearm.x) * .46);
      transformRotation(bones[`upperarm_${side}`],
        shortestRotation(relativeDirection(shoulder.position, elbow.position), downArm.normalize()).multiply(shoulder.rotation));
      transformRotation(bones[`lowerarm_${side}`],
        shortestRotation(relativeDirection(elbow.position, palm.position), downForearm.normalize()).multiply(elbow.rotation));
    }

    scene.updateMatrixWorld(true);
    const feet = shoeSamples(shoes);
    const correction = .002 - Math.min(...feet.map(foot => foot.y));
    const raise = new Vector3(0, correction, 0);
    for (const name of Object.keys(positions)) {
      const bone = bones[name];
      transformPosition(bone, bone.getWorldPosition(vector()).add(raise));
      positions[name].push(bone.position.clone());
    }
    for (const name of targetNames) rotations[name].push(bones[name].quaternion.clone());
  }

  // Distribute the small closure mismatch across 3 samples on each side of
  // the seam. Keep the mid-stride support from the unmodified capture.
  function close(values) {
    const first = values[0].clone();
    const last = values.at(-1).clone();
    const seam = first.isQuaternion ? first.slerp(last, .5) : first.lerp(last, .5);
    for (let offset = 0; offset < 3; offset++) {
      const influence = 1 - offset / 3;
      for (const index of [offset, values.length - 1 - offset]) {
        if (values[index].isQuaternion) values[index].slerp(seam, influence);
        else values[index].lerp(seam, influence);
      }
    }
  }
  Object.values(rotations).forEach(close);
  Object.values(positions).forEach(close);

  // Pin the visible shoe's sole contact patch as the root translates. Corrections
  // fade in at heel strike and out before toe off. This keeps captured roll.
  const shoe = shoes[0];
  if (shoe) {
    for (const { side, support } of limbs) {
      for (const [start, end] of support.intervals) {
        const middle = Math.round((start + end) / 2);
        samplePose(middle);
        shoe.skeleton.update();
        const point = vector();
        const vertices = [];
        for (let index = 0; index < shoe.geometry.attributes.position.count; index++) {
          shoe.getVertexPosition(index, point).applyMatrix4(shoe.matrixWorld);
          if ((side === 'l') === (point.x > 0)) vertices.push({ index, y: point.y });
        }
        vertices.sort((a, b) => a.y - b.y);
        const patch = vertices.slice(0, 14).map(vertex => vertex.index);
        const anchor = supportPoint(shoe, patch);
        anchor.z += middle / fps * speed;
        for (let index = Math.max(1, start - 2); index <= Math.min(frameCount - 2, end + 2); index++) {
          samplePose(index);
          shoe.skeleton.update();
          const current = supportPoint(shoe, patch);
          current.z += index / fps * speed;
          const shift = anchor.clone().sub(current);
          shift.y = 0;
          const blend = Math.min(1, (index - start + 3) / 3, (end - index + 3) / 3);
          shift.multiplyScalar(blend).clampLength(0, .04);
          contactPatch.set(side + index, shift);
        }
      }
    }
  }

  // Re-solve the vertical offset after smoothing the loop seam, because
  // interpolation can otherwise leave a short hover at the wraparound.
  for (let index = 0; index < frameCount; index++) {
    samplePose(index);
    for (const { side, source, thigh, shin } of limbs) {
      const shift = contactPatch.get(side + index);
      if (!shift) continue;
      const name = `foot_${side}`;
      const bone = bones[name];
      const target = bone.getWorldPosition(vector()).add(shift);
      transformPosition(bone, target);
      positions[name][index].copy(bone.position);
      const upperName = `thigh_${side}`;
      const lowerName = `calf_${side}`;
      const upper = bones[upperName], lower = bones[lowerName];
      const hip = upper.getWorldPosition(vector());
      const frame = capture.frames[index];
      const referenceKnee = frame[source + 'Leg'].position.clone().sub(frame[source + 'UpLeg'].position);
      const knee = legBend(hip, target, referenceKnee, thigh, shin);
      const upperRest = rest[upperName], lowerRest = rest[lowerName], footRest = rest[name];
      transformRotation(upper, shortestRotation(relativeDirection(upperRest.position, lowerRest.position),
        relativeDirection(hip, knee)).multiply(upperRest.rotation));
      transformRotation(lower, shortestRotation(relativeDirection(lowerRest.position, footRest.position),
        relativeDirection(knee, target)).multiply(lowerRest.rotation));
      rotations[upperName][index].copy(upper.quaternion);
      rotations[lowerName][index].copy(lower.quaternion);
    }
    scene.updateMatrixWorld(true);
    const adjustment = .002 - Math.min(...shoeSamples(shoes).map(foot => foot.y));
    for (const [name, values] of Object.entries(positions)) {
      const bone = bones[name];
      const world = bone.getWorldPosition(vector());
      world.y += adjustment;
      transformPosition(bone, world);
      values[index].copy(bone.position);
    }
  }
  const flatten = values => values.flatMap(value => value.toArray().map(component => +component.toFixed(5)));
  const times = Array.from({ length: frameCount }, (_, index) => +(index / fps).toFixed(5));
  const tracks = [
    ...Object.entries(rotations).map(([name, values]) => new QuaternionKeyframeTrack(`${name}.quaternion`, times, flatten(values))),
    ...Object.entries(positions).map(([name, values]) => new VectorKeyframeTrack(`${name}.position`, times, flatten(values))),
  ];
  const clip = AnimationClip.toJSON(new AnimationClip(`CMU_Walk_${capture.label}`, times.at(-1), tracks));
  delete clip.uuid;
  for (const track of clip.tracks) {
    track.times = track.times.map(value => +value.toFixed(5));
    track.values = track.values.map(value => +value.toFixed(5));
  }
  return { clip, speed: +speed.toFixed(3), source: capture.id };
}

const motions = await Promise.all(captures.map(readCapture));
const animations = {};
for (const model of ['maya', 'sam']) {
  const character = await readCharacter(model);
  animations[model] = motions.map(capture => retarget(character, capture));
  for (const { clip, speed, source } of animations[model]) {
    console.log(model, clip.name, source, clip.duration, speed, clip.tracks.length);
  }
}
await writeFile(output, JSON.stringify(animations) + '\n');
