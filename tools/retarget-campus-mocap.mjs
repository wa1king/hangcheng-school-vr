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
const bakeRate = 60;
const up = new Vector3(0, 1, 0);
const right = new Vector3(1, 0, 0);
const forward = new Vector3(0, 0, 1);
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

function bendPole(line, knee) {
  return knee.clone().addScaledVector(line, -knee.dot(line));
}

function legBend(hip, foot, capturedPole, thigh, shin) {
  const line = foot.clone().sub(hip);
  const length = line.length();
  line.divideScalar(length);
  const effectiveLength = Math.min(length, thigh + shin - .0001);
  const along = (effectiveLength ** 2 + thigh ** 2 - shin ** 2) / (2 * effectiveLength);
  const sagittal = forward.clone().addScaledVector(line, -forward.dot(line)).normalize();
  const lateral = sagittal.clone().cross(line);
  // The knees flex mostly forward. A bounded source yaw retains natural
  // side motion without transferring spurious twist near a straight knee.
  const yaw = Math.atan2(capturedPole.dot(lateral), capturedPole.dot(sagittal));
  const confidence = Math.min(1, capturedPole.length() / .12);
  const boundedYaw = Math.max(-.35, Math.min(.35, yaw)) * confidence;
  const pole = sagittal.multiplyScalar(Math.cos(boundedYaw)).addScaledVector(lateral, Math.sin(boundedYaw));
  return hip.clone().addScaledVector(line, along).addScaledVector(pole, Math.sqrt(Math.max(0, thigh ** 2 - along ** 2)));
}

function supportCorrections(frames, source) {
  const count = frames.length - 1;
  const travel = frames.at(-1).Hips.position.clone().sub(frames[0].Hips.position);
  travel.y = 0;
  const ankle = frames.map(frame => frame[source + 'Foot'].position);
  const toes = frames.map(frame => frame[source + 'ToeBase'].position);
  const ring = index => ((index % count) + count) % count;
  const sample = (points, index) => points[ring(index)].clone().addScaledVector(travel, Math.floor(index / count));
  const speed = (joint, index) => sample(joint, index + 1).distanceTo(sample(joint, index)) * fps;
  const corrections = Array.from({ length: frames.length }, vector);
  const intervals = [];
  const stable = index => speed(ankle, index) <= 5.4 && speed(toes, index) <= 5.4;
  const begin = Array.from({ length: count }, (_, index) => index).find(index => !stable(index)) ?? 0;
  let index = begin;
  while (index < begin + count) {
    if (!stable(index)) {
      index++;
      continue;
    }
    const start = index;
    while (index < begin + count && stable(index)) index++;
    if (index - start < 3) continue;
    intervals.push([start, index]);
    const mean = vector();
    for (let frame = start; frame <= index; frame++) mean.add(sample(ankle, frame));
    mean.multiplyScalar(1 / (index - start + 1));
    for (let frame = start - 2; frame <= index + 2; frame++) {
      const weight = Math.min(1, (frame - start + 3) / 3, (index - frame + 3) / 3);
      const blend = weight * weight * (3 - 2 * weight);
      corrections[ring(frame)].addScaledVector(mean.clone().sub(sample(ankle, frame)), blend);
    }
  }
  corrections[count].copy(corrections[0]);
  return { corrections, intervals };
}

// Close the pose and its tangent before sampling a periodic spline. This
// follows the same periodic-Hermite approach as CROSSTOWN's crowd renderer.
function bakeLoop(values, count) {
  const period = values.length - 1;
  const isQuaternion = values[0].isQuaternion;
  const components = values.map(value => value.toArray());
  const align = (value, reference) => isQuaternion && value.reduce((dot, v, i) => dot + v * reference[i], 0) < 0
    ? value.map(v => -v) : value;
  const initial = components[0];
  const final = align(components[period], initial);
  const seam = initial.map((value, i) => (value + final[i]) * .5);
  for (const index of [0, period]) components[index] = seam;
  // A short quintic window removes residual closure error while preserving
  // motion through the seam. It does not average the neighboring poses.
  const blendWindow = 5;
  for (let j = 1; j < blendWindow; j++) {
    const t = 1 - j / blendWindow;
    const weight = t ** 3 * (10 + t * (-15 + 6 * t));
    for (const [index, endpoint] of [[j, initial], [period - j, final]]) {
      components[index] = align(components[index], endpoint)
        .map((value, i) => value + weight * (seam[i] - endpoint[i]));
    }
  }
  const at = i => components[((i % period) + period) % period];
  return Array.from({ length: count + 1 }, (_, i) => {
    const phase = i === count ? 0 : i / count * period;
    const j = Math.floor(phase);
    const t = phase - j, t2 = t * t, t3 = t2 * t;
    const a = at(j), b = align(at(j + 1), a);
    const before = align(at(j - 1), a), after = align(at(j + 2), b);
    const sample = a.map((v, k) => (2 * t3 - 3 * t2 + 1) * v + (t3 - 2 * t2 + t) * (b[k] - before[k]) * .5
      + (-2 * t3 + 3 * t2) * b[k] + (t3 - t2) * (after[k] - a[k]) * .5);
    const value = values[0].clone().fromArray(sample);
    return isQuaternion ? value.normalize() : value;
  });
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
  const meanFootSeparation = capture.frames.reduce((sum, frame) =>
    sum + frame.LeftFoot.position.x - frame.RightFoot.position.x, 0) / frameCount;
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
      (hip.x - center.x) * legRatio * .82,
      (hip.y - meanY) * legRatio * .92,
      (hip.z - center.z) * legRatio,
    ));
    const feet = limbs.map(({ side, source, support }, legIndex) => {
      const ankle = frame[`${source}Foot`].position.clone().add(support.corrections[index]);
      const toes = frame[`${source}ToeBase`].position.clone().add(support.corrections[index]);
      const footRest = rest[`foot_${side}`];
      const widthOffset = .45 * meanFootSeparation * (side === 'l' ? 1 : -1);
      const target = new Vector3(
        (ankle.x - midpointX - widthOffset) * legRatio * .88 + .5 * footRest.position.x,
        footRest.position.y + (ankle.y - lowFeet[legIndex]) * legRatio,
        footRest.position.z + (ankle.z - center.z - centerZ[legIndex]) * legRatio,
      );
      return { ankle, toes, target };
    });
    // Preserve extension in stance instead of applying a constant crouch.
    // Lower the root only when a captured stride would exceed rig leg reach.
    let ceiling = Infinity;
    for (const [legIndex, { side, thigh, shin }] of limbs.entries()) {
      const hipOffset = rest[`thigh_${side}`].position.clone().sub(pelvisRest);
      const foot = feet[legIndex].target;
      const horizontalSquared = (pelvis.x + hipOffset.x - foot.x) ** 2 + (pelvis.z + hipOffset.z - foot.z) ** 2;
      const reachable = Math.sqrt(Math.max(.09, ((thigh + shin) * .991) ** 2 - horizontalSquared));
      ceiling = Math.min(ceiling, foot.y + reachable - hipOffset.y);
    }
    pelvis.y = Math.min(pelvis.y, ceiling - .006);
    transformPosition(bones.pelvis, pelvis);
    for (const [name, source] of Object.entries(upperBody)) {
      const change = frame[source].rotation.clone().multiply(reference[source]);
      const weight = name === 'pelvis' ? .52 : name === 'head' ? .35 : .48;
      transformRotation(bones[name], quaternion().slerp(change, weight).multiply(rest[name].rotation));
    }

    for (const [legIndex, { side, source, thigh, shin }] of limbs.entries()) {
      const { ankle, toes, target: footTarget } = feet[legIndex];
      const joint = bones[`foot_${side}`];
      const footRest = rest[`foot_${side}`];
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
      const sourceHip = frame[source + 'UpLeg'].position;
      const sourceKnee = frame[source + 'Leg'].position;
      const sourceAnkle = frame[source + 'Foot'].position;
      const capturedPole = bendPole(relativeDirection(sourceHip, sourceAnkle), sourceKnee.clone().sub(sourceHip))
        .multiplyScalar(legRatio);
      const knee = legBend(hipJoint, footTarget, capturedPole, thigh, shin);
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
      const downHand = relativeDirection(frame[`${source}Hand`].position, frame[`${source}FingerBase`].position);
      const outward = side === 'l' ? 1 : -1;
      downArm.x = outward * Math.max(.095, Math.abs(downArm.x) * .74);
      downForearm.x = outward * Math.max(.025, Math.abs(downForearm.x) * .43);
      transformRotation(bones[`upperarm_${side}`],
        shortestRotation(relativeDirection(shoulder.position, elbow.position), downArm.normalize()).multiply(shoulder.rotation));
      transformRotation(bones[`lowerarm_${side}`],
        shortestRotation(relativeDirection(elbow.position, palm.position), downForearm.normalize()).multiply(elbow.rotation));
      const hand = bones[`hand_${side}`];
      const restHandDirection = new Vector3(0, 1, 0).applyQuaternion(palm.rotation);
      const forearmRotation = bones[`lowerarm_${side}`].getWorldQuaternion(quaternion());
      const handRelaxed = forearmRotation.multiply(palm.local);
      const inheritedDirection = new Vector3(0, 1, 0).applyQuaternion(handRelaxed);
      if (restHandDirection.dot(downHand) < -.6) downHand.negate();
      const handAdjustment = shortestRotation(inheritedDirection, downHand);
      transformRotation(hand, quaternion().slerp(handAdjustment, .5).multiply(handRelaxed));
    }

    scene.updateMatrixWorld(true);
    const soles = shoeSamples(shoes);
    const correction = .002 - Math.min(...soles.map(foot => foot.y));
    const raise = new Vector3(0, correction, 0);
    for (const name of Object.keys(positions)) {
      const bone = bones[name];
      transformPosition(bone, bone.getWorldPosition(vector()).add(raise));
      positions[name].push(bone.position.clone());
    }
    for (const name of targetNames) rotations[name].push(bones[name].quaternion.clone());
  }

  const bakedCount = Math.round(capture.duration * bakeRate);
  const dt = capture.duration / bakedCount;
  for (const track of [rotations, positions]) {
    for (const [name, values] of Object.entries(track)) track[name] = bakeLoop(values, bakedCount);
  }

  // Pin the visible shoe's sole contact patch as the root translates. Corrections
  // fade in at heel strike and out before toe off. This keeps captured roll.
  const shoe = shoes[0];
  if (shoe) {
    for (const { side, support } of limbs) {
      for (const [sourceStart, sourceEnd] of support.intervals) {
        const start = sourceStart * bakedCount / (frameCount - 1);
        const end = sourceEnd * bakedCount / (frameCount - 1);
        const ring = frame => ((frame % bakedCount) + bakedCount) % bakedCount;
        const middle = Math.round((start + end) / 2);
        samplePose(ring(middle));
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
        anchor.z += middle * dt * speed;
        for (let index = Math.floor(start - 5); index <= Math.ceil(end + 5); index++) {
          samplePose(ring(index));
          shoe.skeleton.update();
          const current = supportPoint(shoe, patch);
          current.z += index * dt * speed;
          const shift = anchor.clone().sub(current);
          shift.y = 0;
          const weight = Math.max(0, Math.min(1, (index - start + 5) / 5, (end - index + 5) / 5));
          shift.clampLength(0, .052).multiplyScalar(weight * weight * (3 - 2 * weight));
          contactPatch.set(side + ring(index), shift);
        }
      }
    }
  }

  // Re-solve the vertical offset after smoothing the loop seam, because
  // interpolation can otherwise leave a short hover at the wraparound.
  const leadingFoot = [[], []];
  for (let index = 0; index < bakedCount; index++) {
    samplePose(index);
    for (const { side, thigh, shin } of limbs) {
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
      const capturedPole = bendPole(relativeDirection(hip, target), lower.getWorldPosition(vector()).sub(hip));
      const knee = legBend(hip, target, capturedPole, thigh, shin);
      const upperRest = rest[upperName], lowerRest = rest[lowerName], footRest = rest[name];
      transformRotation(upper, shortestRotation(relativeDirection(upperRest.position, lowerRest.position),
        relativeDirection(hip, knee)).multiply(upperRest.rotation));
      transformRotation(lower, shortestRotation(relativeDirection(lowerRest.position, footRest.position),
        relativeDirection(knee, target)).multiply(lowerRest.rotation));
      rotations[upperName][index].copy(upper.quaternion);
      rotations[lowerName][index].copy(lower.quaternion);
    }
    scene.updateMatrixWorld(true);
    const soles = shoeSamples(shoes);
    const adjustment = .002 - Math.min(...soles.map(foot => foot.y));
    const ahead = soles[0].z >= soles[1].z ? 0 : 1;
    const spread = Math.abs(soles[0].z - soles[1].z);
    // Start on a frame with both shoes near the floor, favouring a shorter
    // stride during the fade from idle. Find a left- and a right-leading frame.
    leadingFoot[ahead].push({ index, score: Math.abs(soles[0].y - soles[1].y) * 3 + .11 * spread });
    for (const [name, values] of Object.entries(positions)) {
      const bone = bones[name];
      const world = bone.getWorldPosition(vector());
      world.y += adjustment;
      transformPosition(bone, world);
      values[index].copy(bone.position);
    }
  }
  for (const values of [...Object.values(rotations), ...Object.values(positions)]) {
    values[bakedCount].copy(values[0]);
    // Keep the final contact correction periodic as well. In the two keys
    // surrounding the seam, share the tangent derived from both sides.
    const center = values[0].toArray();
    const align = value => values[0].isQuaternion && value.dot(values[0]) < 0
      ? value.toArray().map(component => -component) : value.toArray();
    const before = align(values[bakedCount - 1]), after = align(values[1]);
    for (const [index, direction] of [[1, 1], [bakedCount - 1, -1]]) {
      const equalSlope = center.map((component, i) => component + direction * (after[i] - before[i]) * .5);
      values[index].fromArray(equalSlope);
      if (values[index].isQuaternion) values[index].normalize();
    }
  }
  const flatten = values => values.flatMap(value => value.toArray().map(component => +component.toFixed(5)));
  const times = Array.from({ length: bakedCount + 1 }, (_, index) => +(index * dt).toFixed(5));
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
  const startPhases = leadingFoot.map((samples, index) => {
    const best = samples.reduce((lowest, sample) => sample.score < lowest.score ? sample : lowest,
      { index: Math.round(index * .5 * bakedCount), score: Infinity });
    return +(best.index / bakedCount).toFixed(4);
  });
  return { clip, speed: +speed.toFixed(3), source: capture.id, startPhases };
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
