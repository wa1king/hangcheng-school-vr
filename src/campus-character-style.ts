import {
  BufferGeometry, Color, CylinderGeometry, DoubleSide, Float32BufferAttribute, Group, Mesh, MeshStandardMaterial,
  type Material, type Object3D,
} from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export type CampusPersonRole = 'pupil' | 'volunteer' | 'guard' | 'adult';

const adultShirts = [0x8493a1, 0x948575, 0x4d6968, 0xb29b9d, 0xc2b9a6, 0x536b88];
const backpackColors = [0x344c66, 0x715553, 0x415b55, 0x68708a];
const clothing = new WeakMap<Material, Map<string, Material>>();

type Outfit = {
  main: number;
  accent: number;
  trim: number;
};

const uniforms: Record<Exclude<CampusPersonRole, 'adult'>, Outfit> = {
  pupil: { main: 0xe7e7dc, accent: 0x275181, trim: 0xc5cdd3 },
  volunteer: { main: 0xb92e31, accent: 0x5e625e, trim: 0xb9b7a9 },
  guard: { main: 0x314158, accent: 0x242e3e, trim: 0xc7af76 },
};

function tailorShirt(material: MeshStandardMaterial, role: Exclude<CampusPersonRole, 'adult'>, woman: boolean) {
  const outfit = uniforms[role];
  const trim = new Color(outfit.trim);
  const accent = new Color(outfit.accent);
  material.color.setHex(outfit.main);
  material.map = null;
  material.metalness = 0;
  material.roughness = .82;
  material.onBeforeCompile = shader => {
    shader.uniforms.uClothAccent = { value: accent };
    shader.uniforms.uClothTrim = { value: trim };
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vClothRest;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvClothRest = position;');
    shader.fragmentShader = shader.fragmentShader.replace('#include <common>', `
      #include <common>
      varying vec3 vClothRest;
      uniform vec3 uClothAccent;
      uniform vec3 uClothTrim;

      float garmentBand(float value, float center, float halfWidth) {
        float aa = max(fwidth(value) * .65, .001);
        return 1. - smoothstep(halfWidth - aa, halfWidth + aa, abs(value - center));
      }
    `).replace('#include <color_fragment>', `
      #include <color_fragment>
      float x = abs(vClothRest.x);
      float y = vClothRest.y;
      float z = vClothRest.z;
      float front = smoothstep(.015, .1, z);
      float yoke = smoothstep(${woman ? '1.295, 1.313' : '1.329, 1.357'}, y);
      float sleeve = smoothstep(${woman ? '.137, .151' : '.155, .173'}, x);
      float zip = garmentBand(x, .0, .0038) * front;
      float grain = (fract(sin(dot(floor(vClothRest.xy * 510.), vec2(17.71, 92.82))) * 31415.9) - .5)
        * (1. - smoothstep(.001, .012, length(fwidth(vClothRest.xy))));
      ${role === 'pupil' ? `
        diffuseColor.rgb = mix(diffuseColor.rgb, uClothAccent, max(yoke * .92, sleeve));
        diffuseColor.rgb = mix(diffuseColor.rgb, uClothTrim, zip * .75);
        float piping = garmentBand(y, ${woman ? '1.295' : '1.327'}, .005);
        diffuseColor.rgb = mix(diffuseColor.rgb, uClothTrim, piping * .70 * (1. - sleeve));
      ` : role === 'volunteer' ? `
        diffuseColor.rgb = mix(diffuseColor.rgb, uClothAccent, sleeve);
        float reflective = garmentBand(y, 1.079, .011) + garmentBand(y, 1.115, .007);
        diffuseColor.rgb = mix(diffuseColor.rgb, uClothTrim, clamp(reflective, 0., 1.) * (1. - sleeve));
        diffuseColor.rgb *= 1. - zip * .49;
      ` : `
        diffuseColor.rgb = mix(diffuseColor.rgb, uClothAccent, max(.85 * yoke, zip * .68));
        float nameBadge = garmentBand(vClothRest.x, -.081, .022) * garmentBand(y, 1.266, .012) * front;
        diffuseColor.rgb = mix(diffuseColor.rgb, uClothTrim, nameBadge);
      `}
      diffuseColor.rgb *= 1. + .13 * grain;
    `);
  };
  material.customProgramCacheKey = () => `campus-uniform-${role}-${woman ? 'maya' : 'sam'}`;
}

function dressedMaterial(material: Material, role: CampusPersonRole, index: number) {
  if (!(material instanceof MeshStandardMaterial)) return material;
  const name = material.name;
  const top = /full-length top|original top/.test(name);
  const trousers = /tailored trousers|original bottom/.test(name);
  const sleeves = name === 'Maya | anatomical body.body' && (role === 'pupil' || role === 'volunteer');
  if (!top && !sleeves && (!trousers || role === 'adult')) return material;
  let variants = clothing.get(material);
  if (!variants) {
    variants = new Map();
    clothing.set(material, variants);
  }
  const key = role === 'adult' ? `adult-${index % adultShirts.length}` : role;
  const existing = variants.get(key);
  if (existing) return existing;
  const finish = material.clone();
  if (sleeves) {
    const cloth = new Color(role === 'pupil' ? uniforms.pupil.accent : uniforms.volunteer.accent);
    finish.onBeforeCompile = shader => {
      shader.uniforms.uCampusSleeve = { value: cloth };
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vCampusSleeve;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvCampusSleeve = position;');
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vCampusSleeve;\nuniform vec3 uCampusSleeve;')
        .replace('#include <color_fragment>', `
          #include <color_fragment>
          float x = abs(vCampusSleeve.x);
          float shoulder = smoothstep(.118, .148, x);
          float cuff = 1. - smoothstep(.236, .243, x);
          float sleeve = shoulder * cuff * (1. - smoothstep(1.407, 1.424, vCampusSleeve.y));
          diffuseColor.rgb = mix(diffuseColor.rgb, uCampusSleeve, sleeve);
        `);
    };
    finish.customProgramCacheKey = () => `campus-sleeve-${role}`;
  } else if (!top) {
    finish.map = null;
    finish.color.setHex(role === 'pupil' ? 0x293c5e : role === 'guard' ? 0x252e3c : 0x4a4844);
    finish.roughness = .84;
  } else if (role === 'adult') {
    finish.map = null;
    finish.color.setHex(adultShirts[index % adultShirts.length]);
    finish.metalness = 0;
    finish.roughness = .81;
  } else {
    tailorShirt(finish, role, name.startsWith('Maya'));
  }
  variants.set(key, finish);
  return finish;
}

const backpackBody = new RoundedBoxGeometry(.245, .31, .12, 3, .038);
const backpackPocket = new RoundedBoxGeometry(.196, .13, .032, 3, .015);

function backpackStraps(woman: boolean) {
  const profile = woman
    ? [[.087, .18, -.084], [.087, .238, -.030], [.098, .253, .048],
      [.097, .206, .118], [.100, .087, .129], [.113, -.031, .079], [.108, -.015, -.071]]
    : [[.095, .200, -.060], [.109, .302, .009], [.113, .311, .115],
      [.120, .231, .175], [.135, .065, .186], [.149, -.056, .127], [.150, -.012, -.055]];
  const vertices: number[] = [];
  const indices: number[] = [];
  for (const side of [-1, 1]) {
    const base = vertices.length / 3;
    for (let i = 0; i < profile.length; i++) {
      const [x, y, z] = profile[i];
      vertices.push(side * x - .018, y, z, side * x + .018, y, z);
      if (i > 0) {
        const end = base + 2 * i;
        indices.push(end - 2, end - 1, end, end - 1, end + 1, end);
      }
    }
  }
  const straps = new BufferGeometry();
  straps.setAttribute('position', new Float32BufferAttribute(vertices, 3));
  straps.setIndex(indices);
  straps.computeVertexNormals();
  return straps;
}

const mayaStraps = backpackStraps(true);
const samStraps = backpackStraps(false);
const backpackMaterials = backpackColors.map(color => new MeshStandardMaterial({ color, roughness: .89 }));
const backpackTrim = backpackColors.map(color => new MeshStandardMaterial({
  color: new Color(color).multiplyScalar(.69), roughness: .92, side: DoubleSide,
}));
const crown = new CylinderGeometry(.083, .096, .058, 24);
crown.scale(1, 1, 1.16);
crown.translate(0, .022, 0);
const band = new CylinderGeometry(.0965, .097, .017, 24);
band.scale(1, 1, 1.16);
band.translate(0, -.008, 0);
const visor = new RoundedBoxGeometry(.178, .012, .086, 3, .006);
visor.rotateX(.17);
visor.translate(0, -.011, .098);
const capGeometry = mergeGeometries([crown.toNonIndexed(), band.toNonIndexed(), visor]) ?? visor;
const capCloth = new MeshStandardMaterial({ color: 0x233243, roughness: .76 });

function addBackpack(character: Object3D, index: number, woman: boolean) {
  const spine = character.getObjectByName('spine_03');
  if (!spine) return;
  const color = index % backpackMaterials.length;
  const backpack = new Group();
  backpack.name = 'school-backpack';
  backpack.position.set(0, .07, woman ? -.116 : -.121);
  backpack.rotation.x = woman ? .10 : .20;
  backpack.add(new Mesh(backpackBody, backpackMaterials[color]));
  const pocket = new Mesh(backpackPocket, backpackTrim[color]);
  pocket.position.set(0, -.056, -.059);
  backpack.add(pocket);
  spine.add(backpack);
  spine.add(new Mesh(woman ? mayaStraps : samStraps, backpackTrim[color]));
}

export function styleCampusCharacter(character: Object3D, role: CampusPersonRole, index: number) {
  const woman = character.children.some(node => node.name.startsWith('Maya'));
  character.traverse(node => {
    if (!(node instanceof Mesh)) return;
    node.receiveShadow = true;
    node.material = Array.isArray(node.material)
      ? node.material.map(material => dressedMaterial(material, role, index))
      : dressedMaterial(node.material, role, index);
  });
  if (role === 'pupil') {
    character.getObjectByName('head')?.scale.multiplyScalar(1.065);
    if (index % 5 !== 4) addBackpack(character, index, woman);
  }
  if (role === 'guard') {
    const head = character.getObjectByName('head');
    const cap = new Mesh(capGeometry, capCloth);
    cap.name = 'navy-service-cap';
    cap.position.set(0, .12, -.005);
    head?.add(cap);
  }
}
