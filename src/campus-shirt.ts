import {
  BufferGeometry, DoubleSide, Float32BufferAttribute, Mesh, MeshBasicMaterial, Quaternion, Raycaster, SkinnedMesh,
  Uint16BufferAttribute, Vector3, type Material, type Object3D,
} from 'three';

type Arm = [Vector3, Vector3, Vector3];
type Profile = { arms: [Arm, Arm]; top: SkinnedMesh; collarBase: number };
type ShirtTemplate = { top: BufferGeometry; collar: BufferGeometry; profile: Profile };

const wardrobe = new WeakMap<BufferGeometry, ShirtTemplate>();
const coveredSkin = new WeakMap<BufferGeometry, BufferGeometry>();
let source: Profile | undefined;
const sides = ['l', 'r'] as const;
const sampleMaterial = new MeshBasicMaterial({ side: DoubleSide });

function garment(character: Object3D) {
  let top: SkinnedMesh | undefined;
  character.traverse(node => {
    if (node instanceof SkinnedMesh && !Array.isArray(node.material) && /full-length top|original top/.test(node.material.name)) {
      top = node;
    }
  });
  return top;
}

function measure(character: Object3D, woman: boolean) {
  character.updateMatrixWorld(true);
  const top = garment(character);
  if (!top) return undefined;
  const arm = (side: typeof sides[number]) =>
    ['upperarm', 'lowerarm', 'hand'].map(name => character.getObjectByName(`${name}_${side}`)!
      .getWorldPosition(new Vector3())).map(position => character.worldToLocal(position)) as Arm;
  return { top, arms: [arm('l'), arm('r')], collarBase: woman ? 1.416 : 1.520 } as Profile;
}

export function prepareCampusWardrobe(samScene: Object3D) {
  source = measure(samScene, false);
}

function closestOnArm(point: Vector3, arm: Arm) {
  const upper = arm[1].clone().sub(arm[0]);
  const lower = arm[2].clone().sub(arm[1]);
  const u = point.clone().sub(arm[0]).dot(upper) / upper.lengthSq();
  const l = point.clone().sub(arm[1]).dot(lower) / lower.lengthSq();
  return u < 1 ? { segment: 0, along: u, axis: upper } : { segment: 1, along: l, axis: lower };
}

function refitTorso(point: Vector3) {
  // Preserve the loose shirt hem. A tapered shoulder and fuller front fit the
  // other rig, whose neck is 10 cm lower and whose sleeve lengths differ.
  const t = Math.max(0, Math.min(1, (point.y - .9) / .62));
  const y = .922 + (point.y - .9) * .794;
  const hemEase = Math.max(0, 1 - t * 2);
  const x = point.x * (1.08 - .16 * t + .25 * hemEase);
  const z = point.z * (.97 + .06 * t + .29 * hemEase) + .016 + .010 * Math.sin(t * Math.PI);
  return new Vector3(x, y, z);
}

function shirtGeometry(original: Profile, target: Profile, woman: boolean) {
  const geometry = original.top.geometry.clone();
  const count = geometry.attributes.position.count;
  const position = new Float32BufferAttribute(count * 3, 3);
  const normal = new Float32BufferAttribute(count * 3, 3);
  const sleeve = new Float32BufferAttribute(count * 3, 3);
  const map = original.top.skeleton.bones.map(bone => target.top.skeleton.bones.findIndex(candidate => candidate.name === bone.name));
  const oldIndex = geometry.attributes.skinIndex;
  const indices = new Uint16BufferAttribute(count * 4, 4);
  const vertex = new Vector3();
  const vertexNormal = new Vector3();
  for (let index = 0; index < count; index++) {
    vertex.fromBufferAttribute(geometry.attributes.position, index);
    vertexNormal.fromBufferAttribute(geometry.attributes.normal, index);
    const armIndex = vertex.x >= 0 ? 0 : 1;
    const arm = original.arms[armIndex];
    const side = armIndex ? -1 : 1;
    const nearest = closestOnArm(vertex, arm);
    const axis = nearest.axis.clone().normalize();
    const onAxis = arm[nearest.segment].clone().addScaledVector(nearest.axis, nearest.along);
    const radial = vertex.clone().sub(onAxis);
    const outer = new Vector3(side, 1, 0).addScaledVector(axis, -new Vector3(side, 1, 0).dot(axis)).normalize();
    const across = new Vector3().crossVectors(axis, outer);
    const cuff = nearest.segment ? nearest.along : 0;
    // Signed distance across the outer sleeve and a distance along the sleeve
    // stay stable as the vertex is moved by the skinning pose.
    sleeve.setXYZ(index, radial.dot(outer), radial.dot(across), cuff);
    if (woman) {
      const replacement = target.arms[armIndex];
      const armAxis = replacement[nearest.segment + 1].clone().sub(replacement[nearest.segment]);
      const rotate = new Quaternion().setFromUnitVectors(axis, armAxis.clone().normalize());
      const along = Math.min(1, nearest.along);
      const upperSleeveEase = nearest.segment === 0 ? 1.25 - .13 * Math.max(0, nearest.along) : 1.12 - .10 * Math.max(0, nearest.along);
      const fitArm = replacement[nearest.segment].clone().addScaledVector(armAxis, along)
        .add(radial.applyQuaternion(rotate).multiplyScalar(upperSleeveEase));
      const fitTorso = refitTorso(vertex);
      const blend = Math.max(0, Math.min(1, (Math.abs(vertex.x) - .112) / .112));
      vertex.copy(fitTorso).lerp(fitArm, blend * blend * (3 - 2 * blend));
      vertexNormal.lerp(vertexNormal.clone().applyQuaternion(rotate), blend).normalize();
    }
    position.setXYZ(index, vertex.x, vertex.y, vertex.z);
    normal.setXYZ(index, vertexNormal.x, vertexNormal.y, vertexNormal.z);
    indices.setXYZW(index, map[oldIndex.getX(index)], map[oldIndex.getY(index)],
      map[oldIndex.getZ(index)], map[oldIndex.getW(index)]);
  }
  geometry.setAttribute('position', position);
  geometry.setAttribute('normal', normal);
  geometry.setAttribute('skinIndex', indices);
  geometry.setAttribute('wardrobeSleeve', sleeve);
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}

function collarGeometry(top: BufferGeometry, profile: Profile) {
  const position: number[] = [];
  const skinIndex: number[] = [];
  const skinWeight: number[] = [];
  const geometry = new BufferGeometry();
  const mesh = new Mesh(top, sampleMaterial);
  const ray = new Raycaster();
  const direction = new Vector3(0, 0, -1);
  const chest = profile.top.skeleton.bones.findIndex(bone => bone.name === 'spine_03');
  const neck = profile.top.skeleton.bones.findIndex(bone => bone.name === 'neck_01');
  function add([x, y, z]: number[], neckWeight = .06) {
    position.push(x, y, z);
    skinIndex.push(chest, neck, 0, 0);
    skinWeight.push(1 - neckWeight, neckWeight, 0, 0);
  }
  function onShirt(x: number, y: number, offset = .004) {
    ray.set(new Vector3(x, y, 1), direction);
    const hit = ray.intersectObject(mesh)[0];
    return [x, y, (hit?.point.z ?? .078) + offset];
  }
  const base = profile.collarBase;
  // Back and side band, with a separate flat fold at the front.
  for (let sample = 0; sample < 16; sample++) {
    const section = (index: number, high: boolean) => {
      const angle = Math.PI * (.16 + .68 * index / 16);
      const x = Math.cos(angle) * (high ? .057 : .078);
      const z = -Math.sin(angle) * (high ? .047 : .051) + .006;
      return [x, base - (high ? .004 : .027), z];
    };
    const a = section(sample, true);
    const b = section(sample, false);
    const c = section(sample + 1, false);
    const d = section(sample + 1, true);
    add(a, .16); add(b); add(c); add(c); add(d, .16); add(a, .16);
  }
  for (const side of [-1, 1]) {
    const inside = onShirt(side * .012, base - .055, .005);
    const tip = onShirt(side * .064, base - .088, .006);
    const edge = onShirt(side * .100, base - .048, .006);
    const neckSide = [side * .051, base - .004, .018];
    add(inside); add(tip); add(edge);
    add(edge); add(neckSide, .17); add(inside);
  }
  for (let segment = 0; segment < 5; segment++) {
    const topY = base - .052 - segment * .016;
    const end = topY - .016;
    const a = onShirt(-.012, topY, .004);
    const b = onShirt(.012, topY, .004);
    const c = onShirt(.012, end, .004);
    const d = onShirt(-.012, end, .004);
    add(a); add(b); add(c); add(c); add(d); add(a);
  }
  const buttonStart = position.length / 3;
  for (const y of [base - .077, base - .105]) {
    const center = onShirt(0, y, .0065);
    for (let index = 0; index < 10; index++) {
      const a = 2 * Math.PI * index / 10;
      const b = 2 * Math.PI * (index + 1) / 10;
      add(center);
      add([.0043 * Math.cos(a), y + .0043 * Math.sin(a), center[2]]);
      add([.0043 * Math.cos(b), y + .0043 * Math.sin(b), center[2]]);
    }
  }
  geometry.setAttribute('position', new Float32BufferAttribute(position, 3));
  geometry.setAttribute('skinIndex', new Uint16BufferAttribute(skinIndex, 4));
  geometry.setAttribute('skinWeight', new Float32BufferAttribute(skinWeight, 4));
  geometry.computeVertexNormals();
  geometry.addGroup(0, buttonStart, 0);
  geometry.addGroup(buttonStart, position.length / 3 - buttonStart, 1);
  return geometry;
}

function hideSkinUnderSleeves(character: Object3D, profile: Profile) {
  character.traverse(node => {
    if (!(node instanceof SkinnedMesh) || Array.isArray(node.material) || node.material.name !== 'Maya | anatomical body.body') return;
    const original = node.geometry;
    const cached = coveredSkin.get(original);
    if (cached) {
      node.geometry = cached;
      return;
    }
    const { index, attributes } = original;
    if (!index) return;
    const visible: number[] = [];
    const center = new Vector3();
    const vertex = new Vector3();
    for (let i = 0; i < index.count; i += 3) {
      const a = index.getX(i), b = index.getX(i + 1), c = index.getX(i + 2);
      center.fromBufferAttribute(attributes.position, a)
        .add(vertex.fromBufferAttribute(attributes.position, b))
        .add(vertex.fromBufferAttribute(attributes.position, c)).multiplyScalar(1 / 3);
      const x = Math.abs(center.x);
      const arm = profile.arms[center.x >= 0 ? 0 : 1];
      const { segment, along } = closestOnArm(center, arm);
      // The original tank top leaves upper arms in the body mesh. Remove the
      // triangles under the new shirt so the skin cannot poke through in poses.
      const covered = x > .089 && center.y < 1.410 && center.y > .990
        && (center.y > 1.185 || x > .245) && (segment === 0 || along < .82);
      if (!covered) visible.push(a, b, c);
    }
    const geometry = original.clone();
    geometry.setIndex(visible);
    coveredSkin.set(original, geometry);
    node.geometry = geometry;
  });
}
export function dressInShirt(character: Object3D, woman: boolean, material: Material, collar?: [Material, Material]) {
  if (!source) return;
  const top = garment(character);
  if (!top) return;
  let template = wardrobe.get(top.geometry);
  if (!template) {
    const profile = measure(character, woman);
    if (!profile) return;
    const garmentGeometry = shirtGeometry(source, profile, woman);
    template = { top: garmentGeometry, collar: collarGeometry(garmentGeometry, profile), profile };
    wardrobe.set(top.geometry, template);
  }
  if (woman) hideSkinUnderSleeves(character, template.profile);
  top.geometry = template.top;
  top.material = material;
  if (collar) {
    const collarMesh = top.clone(false);
    collarMesh.name = 'folded-shirt-collar';
    collarMesh.geometry = template.collar;
    collarMesh.material = collar;
    top.parent?.add(collarMesh);
  }
}
