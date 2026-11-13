import {
  BufferGeometry, Color, CylinderGeometry, DoubleSide, Float32BufferAttribute, FrontSide, Group, Mesh, MeshStandardMaterial,
  SRGBColorSpace, TextureLoader, type Material, type Object3D, type Side, type Texture,
} from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { dressInShirt } from './campus-shirt.ts';
import crestURL from './hangcheng-school-crest.png';

export { prepareCampusWardrobe } from './campus-shirt.ts';

export type CampusPersonRole = 'pupil' | 'volunteer' | 'guard' | 'adult' | 'teacher';
const blue = 0x2652b7;
const white = 0xf2f1e9;
const teacherShirts = [0xdad6c7, 0xb5cfde, 0x293d54, 0x445263, 0xf0dda9, 0x9aa7a2];
const streetShirts = [0x8493a1, 0x948575, 0x4d6968, 0xb29b9d, 0xc2b9a6, 0x536b88];
const backpackColors = [0x344c66, 0x715553, 0x415b55, 0x68708a];
const shirts = new Map<string, MeshStandardMaterial>();
const collars = new Map<number, [Material, Material]>();
let schoolCrest: Texture | undefined;

function clothColor(color: number, side: Side = FrontSide) {
  return new MeshStandardMaterial({ color, roughness: .88, side });
}

function collarFor(color: number) {
  let materials = collars.get(color);
  if (!materials) {
    materials = [clothColor(color, DoubleSide), clothColor(0xf2e9da, DoubleSide)];
    collars.set(color, materials);
  }
  return materials;
}

function shirtFor(role: CampusPersonRole, woman: boolean, index: number) {
  const variant = (role === 'adult' || role === 'teacher') ? index % streetShirts.length : 0;
  const key = `shirt-${role}-${woman}-${variant}`;
  const existing = shirts.get(key);
  if (existing) return existing;
  const primary = {
    pupil: woman ? white : blue,
    volunteer: 0xc03a36,
    guard: 0x394b62,
    teacher: teacherShirts[variant],
    adult: streetShirts[variant],
  }[role];
  const pupil = role === 'pupil';
  if (pupil && !schoolCrest) {
    schoolCrest = new TextureLoader().load(crestURL);
    schoolCrest.colorSpace = SRGBColorSpace;
  }
  const accent = new Color(role === 'pupil' ? (woman ? blue : white) : role === 'guard' ? 0xb6a071 : 0xe2ded2);
  const material = clothColor(primary);
  material.onBeforeCompile = shader => {
    shader.uniforms.wardrobeAccent = { value: accent };
    if (pupil) shader.uniforms.wardrobeSchoolCrest = { value: schoolCrest };
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `
        #include <common>
        attribute vec3 wardrobeSleeve;
        varying vec3 vShirtRest;
        varying vec3 vShirtSleeve;
      `)
      .replace('#include <begin_vertex>', `
        #include <begin_vertex>
        vShirtRest = position;
        vShirtSleeve = wardrobeSleeve;
      `);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `
        #include <common>
        varying vec3 vShirtRest;
        varying vec3 vShirtSleeve;
        uniform vec3 wardrobeAccent;
        ${pupil ? 'uniform sampler2D wardrobeSchoolCrest;' : ''}
      `)
      .replace('#include <color_fragment>', `
        #include <color_fragment>
        float x = abs(vShirtRest.x);
        float y = vShirtRest.y;
        float front = smoothstep(.04, .09, vShirtRest.z);
        float sleeve = smoothstep(${woman ? '.104, .130' : '.121, .149'}, x);
        ${role === 'pupil' ? `
          float outside = smoothstep(.008, .024, vShirtSleeve.x);
          float tape = outside * sleeve * (1. - smoothstep(.015, .022, abs(vShirtSleeve.y)));
          float cuff = sleeve * smoothstep(.76, .84, vShirtSleeve.z);
          diffuseColor.rgb = mix(diffuseColor.rgb, wardrobeAccent, max(tape, cuff));
          vec2 crestUV = (vShirtRest.xy - vec2(.073, ${woman ? '1.289' : '1.390'})) / .061 + .5;
          vec4 crest = texture2D(wardrobeSchoolCrest, crestUV);
          diffuseColor.rgb = mix(diffuseColor.rgb, crest.rgb, crest.a * front);
        ` : role === 'volunteer' ? `
          diffuseColor.rgb = mix(diffuseColor.rgb, wardrobeAccent, sleeve);
          float band = 1. - smoothstep(.008, .013, abs(y - ${woman ? '1.100' : '1.120'}));
          diffuseColor.rgb = mix(diffuseColor.rgb, wardrobeAccent, band * (1. - sleeve) * .80);
          diffuseColor.rgb *= 1. - .39 * (1. - smoothstep(.002, .005, x)) * front;
        ` : role === 'guard' ? `
          float nameplate = (1. - smoothstep(.019, .023, abs(vShirtRest.x - .071)))
            * (1. - smoothstep(.007, .010, abs(y - ${woman ? '1.265' : '1.360'})));
          diffuseColor.rgb = mix(diffuseColor.rgb, wardrobeAccent, nameplate * front);
        ` : '' }
        vec2 detail = vShirtRest.xy * 482.;
        float grain = fract(sin(dot(floor(detail), vec2(12.53, 78.64))) * 9317.) - .5;
        diffuseColor.rgb *= 1. + .095 * grain * (1. - smoothstep(.35, 1.3, length(fwidth(detail))));
      `);
  };
  material.customProgramCacheKey = () => `campus-shirt-${role}-${woman}`;
  shirts.set(key, material);
  return material;
}

const pants = new Map<string, MeshStandardMaterial>();
const lightSneaker = clothColor(0xe8e9e2);
const trackAnkle = clothColor(blue);

function pupilTrackPants(woman: boolean) {
  const key = woman ? 'maya' : 'sam';
  const existing = pants.get(key);
  if (existing) return existing;
  const material = clothColor(blue);
  material.onBeforeCompile = shader => {
    shader.uniforms.wardrobeSeam = { value: new Color(white) };
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vPantsRest;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvPantsRest = position;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vPantsRest;\nuniform vec3 wardrobeSeam;')
      .replace('#include <color_fragment>', `
        #include <color_fragment>
        float y = vPantsRest.y;
        float upper = ${woman ? '.203 - .024 * smoothstep(.75, .97, y)' : '.218 - .053 * smoothstep(.65, 1., y)'};
        float side = ${woman ? 'mix(.239, upper, smoothstep(.31, .51, y))' : 'mix(.256, upper, smoothstep(.20, .55, y))'};
        float outerLeg = smoothstep(side - .046, side - .033, abs(vPantsRest.x));
        float z = vPantsRest.z - ${woman ? 'mix(.018, .051, smoothstep(.30, .55, y))' : 'mix(.015, .027, smoothstep(.44, .62, y))'};
        float stitch = 1. - smoothstep(.010, .013, abs(abs(z) - .014));
        diffuseColor.rgb = mix(diffuseColor.rgb, wardrobeSeam, outerLeg * stitch * .96);
      `);
  };
  material.customProgramCacheKey = () => `campus-track-pants-${key}`;
  pants.set(key, material);
  return material;
}

const trousersColors = {
  teacher: clothColor(0x4d535b),
  guard: clothColor(0x273447),
  volunteer: clothColor(0x414749),
};

function dressLowerBody(material: Material, role: CampusPersonRole, woman: boolean) {
  if (/tailored trousers|original bottom/.test(material.name)) {
    if (role === 'pupil') return pupilTrackPants(woman);
    return role === 'adult' ? material : trousersColors[role];
  }
  if (role === 'pupil' && /sneaker|\bshoe/i.test(material.name)) return lightSneaker;
  if (role === 'pupil' && material.name === 'Original dark ankle lining') return trackAnkle;
  return material;
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

function dressCharacter(character: Object3D, role: CampusPersonRole, index: number) {
  const woman = character.children.some(node => node.name.startsWith('Maya'));
  const color = role === 'pupil' ? (woman ? blue : white)
    : role === 'teacher' ? teacherShirts[index % teacherShirts.length] : undefined;
  dressInShirt(character, woman, shirtFor(role, woman, index), color === undefined ? undefined : collarFor(color), role === 'pupil');
  character.traverse(node => {
    if (!(node instanceof Mesh)) return;
    node.receiveShadow = true;
    node.material = Array.isArray(node.material)
      ? node.material.map(material => dressLowerBody(material, role, woman))
      : dressLowerBody(node.material, role, woman);
  });
  return woman;
}

export function styleStreetCharacter(character: Object3D, index: number) {
  dressCharacter(character, 'adult', index);
}

export function styleCampusCharacter(character: Object3D, role: CampusPersonRole, index: number) {
  const woman = dressCharacter(character, role, index);
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
