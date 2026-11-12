import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export type TourCharacter = 'taoqi' | 'xiaoxiao';
type AvatarMode = 'walk' | 'fly' | 'overview';

const palettes = {
  taoqi: {
    name: 'Taoqi', skin: '#ffc49c', shade: '#e7a37e', hair: '#282532', hairLight: '#443746',
    shirt: '#ffb34d', trim: '#f8ecd0', seam: '#d68731', bottoms: '#284a67',
    shoes: '#426e9d', bag: '#2a7894', bagPocket: '#459aae', bagSeam: '#215c74', badge: '#ffca54',
  },
  xiaoxiao: {
    name: 'Xiaoxiao', skin: '#ffcbab', shade: '#eaa587', hair: '#322537', hairLight: '#51364b',
    shirt: '#df647d', trim: '#fff3e9', seam: '#b34e70', bottoms: '#d97894',
    shoes: '#b44f6d', bag: '#885f9d', bagPocket: '#ac7cb2', bagSeam: '#674576', badge: '#ffdc77',
  },
} as const;

const tau = Math.PI * 2;
const white = '#fff8e7';
const faceDark = '#362737';

function joint(parent: THREE.Group, x: number, y: number, z: number) {
  const group = new THREE.Group();
  group.position.set(x, y, z);
  parent.add(group);
  return group;
}

function createModelKit() {
  function unpack(geometry: THREE.BufferGeometry) {
    if (!geometry.index) return geometry;
    const result = geometry.toNonIndexed();
    geometry.dispose();
    return result;
  }

  const sources = {
    round: unpack(new THREE.SphereGeometry(1, 16, 12)),
    box: new RoundedBoxGeometry(1, 1, 1, 2, 0.13),
    cylinder: unpack(new THREE.CylinderGeometry(0.5, 0.5, 1, 16)),
    skirt: unpack(new THREE.CylinderGeometry(0.32, 0.5, 1, 16)),
  };
  const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.84 });
  const used = new Set<THREE.BufferGeometry>();

  function part(parent: THREE.Group, build: (place: Place) => void) {
    const pieces: THREE.BufferGeometry[] = [];
    build((shape, color, x, y, z, width, height, depth, pitch = 0, yaw = 0, roll = 0) => {
      const geometry = sources[shape].clone();
      geometry.scale(width, height, depth);
      geometry.rotateX(pitch);
      geometry.rotateY(yaw);
      geometry.rotateZ(roll);
      geometry.translate(x, y, z);
      const rgb = new THREE.Color(color);
      const colors = new Float32Array(geometry.getAttribute('position').count * 3);
      for (let index = 0; index < colors.length; index += 3) {
        colors[index] = rgb.r;
        colors[index + 1] = rgb.g;
        colors[index + 2] = rgb.b;
      }
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      pieces.push(geometry);
    });
    const geometry = mergeGeometries(pieces);
    for (const piece of pieces) piece.dispose();
    used.add(geometry);
    parent.add(new THREE.Mesh(geometry, material));
  }

  return {
    part,
    dispose() {
      for (const geometry of Object.values(sources)) geometry.dispose();
      for (const geometry of used) geometry.dispose();
      material.dispose();
    },
  };
}

type Place = (
  shape: 'round' | 'box' | 'cylinder' | 'skirt',
  color: string,
  x: number, y: number, z: number,
  width: number, height: number, depth: number,
  pitch?: number, yaw?: number, roll?: number,
) => void;

function makeCharacter(parent: THREE.Group, kit: ReturnType<typeof createModelKit>, id: TourCharacter) {
  const colors = palettes[id];
  const girl = id === 'xiaoxiao';
  const body = joint(parent, 0, 0, 0);
  body.name = colors.name;
  const head = joint(body, 0, 1.12, -0.012);
  const { part } = kit;

  part(body, place => {
    place('box', colors.shirt, 0, 0.706, 0, 0.363, 0.46, 0.242);
    place('cylinder', colors.trim, 0, 0.923, -0.009, 0.192, 0.036, 0.171);
    place('cylinder', colors.skin, 0, 0.955, -0.01, 0.130, 0.084, 0.124);
    if (girl) {
      place('skirt', colors.bottoms, 0, 0.463, 0, 0.455, 0.217, 0.32);
      place('cylinder', colors.trim, 0, 0.365, 0, 0.463, 0.026, 0.327);
      place('box', colors.seam, 0, 0.553, -0.123, 0.29, 0.033, 0.018);
      place('box', colors.trim, -0.047, 0.881, -0.120, 0.077, 0.088, 0.018, 0, 0, -0.37);
      place('box', colors.trim, 0.047, 0.881, -0.120, 0.077, 0.088, 0.018, 0, 0, 0.37);
      place('round', colors.badge, 0, 0.838, -0.137, 0.018, 0.018, 0.008);
    } else {
      place('box', colors.bottoms, 0, 0.479, 0.012, 0.329, 0.148, 0.231);
      place('box', colors.trim, 0, 0.583, -0.12, 0.32, 0.035, 0.018);
      place('box', colors.seam, -0.094, 0.783, -0.123, 0.088, 0.082, 0.023);
      place('box', colors.trim, -0.094, 0.816, -0.138, 0.085, 0.013, 0.01);
    }
    // The bag and its contrasting front pocket remain legible from the follow camera.
    place('box', colors.bag, 0, 0.701, 0.172, 0.306, 0.344, 0.224);
    place('box', colors.bagPocket, 0, 0.643, 0.282, 0.252, 0.155, 0.075);
    place('box', colors.bagSeam, 0, 0.705, 0.321, 0.195, 0.014, 0.009);
    place('box', colors.trim, 0.061, 0.699, 0.327, 0.018, 0.032, 0.012, 0, 0, -0.17);
    place('box', colors.bagSeam, 0, 0.883, 0.192, 0.092, 0.037, 0.032);
    for (const side of [-1, 1]) {
      place('box', colors.bagSeam, side * 0.128, 0.736, -0.119, 0.041, 0.304, 0.037, 0, 0, side * -0.12);
      place('box', colors.bag, side * 0.13, 0.907, 0.028, 0.043, 0.032, 0.237, -0.04);
      place('box', colors.bagPocket, side * 0.152, 0.636, 0.176, 0.065, 0.111, 0.132);
    }
    if (girl) {
      place('round', colors.badge, 0.064, 0.772, 0.285, 0.04, 0.04, 0.009);
      place('round', '#f6a397', 0.064, 0.772, 0.294, 0.018, 0.018, 0.008);
    } else {
      place('box', colors.badge, -0.067, 0.765, 0.288, 0.076, 0.064, 0.011, 0, 0, 0.13);
      place('box', colors.bagSeam, -0.067, 0.766, 0.296, 0.027, 0.015, 0.01, 0, 0, 0.13);
    }
  });

  part(head, place => {
    place('round', colors.skin, 0, 0.069, -0.027, 0.221, 0.209, 0.212);
    place('round', colors.hair, 0, 0.118, 0.03, 0.23, 0.211, 0.214);
    for (const side of [-1, 1]) {
      place('round', colors.skin, side * 0.211, 0.065, -0.011, 0.044, 0.059, 0.035);
      place('round', colors.shade, side * 0.224, 0.066, -0.035, 0.021, 0.032, 0.011);
      place('round', '#fffdf6', side * 0.082, 0.091, -0.224, 0.042, 0.049, 0.019, 0, side * -0.21);
      place('round', faceDark, side * 0.078, 0.09, -0.24, 0.024, 0.032, 0.012);
      place('round', '#ffffff', side * 0.078 - 0.008, 0.103, -0.250, 0.008, 0.01, 0.004);
      place('round', colors.hair, side * 0.085, 0.153, -0.214, 0.039, 0.009, 0.012, 0, side * -0.22, side * 0.15);
      place('round', '#ee9b91', side * 0.134, 0.022, -0.190, 0.035, 0.015, 0.014, 0, side * -0.46);
    }
    place('round', colors.skin, 0, 0.043, -0.235, 0.035, 0.036, 0.033);
    place('round', '#8c4d53', 0, -0.026, -0.213, 0.045, 0.025, 0.015, -0.2);
    place('round', white, 0, -0.018, -0.225, 0.029, 0.008, 0.005, -0.2);
    if (girl) {
      place('round', colors.hair, 0, 0.185, -0.143, 0.19, 0.081, 0.082);
      for (const side of [-1, 1]) {
        place('round', colors.hairLight, side * 0.166, 0.164, -0.127, 0.056, 0.097, 0.061, 0, 0, side * 0.36);
        place('round', colors.hair, side * 0.252, 0.012, 0.128, 0.089, 0.151, 0.102, -0.16, 0, side * 0.37);
        place('round', colors.hairLight, side * 0.277, -0.044, 0.183, 0.064, 0.097, 0.047, -0.25, 0, side * 0.36);
        place('round', colors.shirt, side * 0.219, 0.095, 0.127, 0.052, 0.043, 0.055);
        place('round', colors.trim, side * 0.245, 0.111, 0.15, 0.027, 0.026, 0.026);
      }
    } else {
      place('round', colors.hairLight, -0.082, 0.216, -0.134, 0.128, 0.081, 0.099, 0.21, 0, -0.30);
      place('round', colors.hair, 0.063, 0.202, -0.139, 0.112, 0.061, 0.082, 0, 0, 0.20);
      place('round', colors.hair, -0.082, 0.275, 0.075, 0.113, 0.066, 0.087, -0.36, 0, -0.61);
      place('round', colors.hairLight, -0.13, 0.29, 0.103, 0.058, 0.057, 0.059, -0.38, 0, -0.63);
    }
  });

  const limbs = [-1, 1].map(side => {
    const arm = joint(body, side * 0.19, 0.858, 0);
    const elbow = joint(arm, 0, -0.161, 0);
    const leg = joint(body, side * 0.102, 0.457, 0);
    const knee = joint(leg, 0, -0.211, 0);
    part(arm, place => {
      place('box', colors.shirt, 0, -0.071, 0, 0.137, 0.183, 0.148);
      place('box', colors.trim, 0, -0.146, 0, 0.14, 0.042, 0.146);
      place('round', colors.skin, 0, -0.169, 0, 0.052, 0.056, 0.055);
    });
    part(elbow, place => {
      place('round', colors.skin, 0, -0.086, 0, 0.048, 0.095, 0.051);
      place('round', colors.skin, 0, -0.184, -0.006, 0.059, 0.064, 0.05);
      place('round', colors.skin, side * -0.036, -0.172, -0.036, 0.032, 0.04, 0.025);
    });
    part(leg, place => {
      if (girl) {
        place('round', colors.skin, 0, -0.121, 0, 0.066, 0.138, 0.072);
      } else {
        place('box', colors.bottoms, 0, -0.087, 0, 0.153, 0.213, 0.17);
        place('box', '#406582', 0, -0.177, 0, 0.155, 0.043, 0.172);
        place('round', colors.skin, 0, -0.217, 0, 0.058, 0.055, 0.062);
      }
    });
    part(knee, place => {
      place('round', colors.skin, 0, -0.077, 0, 0.055, 0.093, 0.062);
      place('cylinder', colors.trim, 0, -0.15, 0, 0.119, 0.094, 0.128);
      place('box', colors.shoes, 0, -0.186, -0.035, 0.157, 0.105, 0.224);
      place('box', colors.trim, 0, -0.23, -0.037, 0.162, 0.034, 0.231);
      place('box', colors.trim, 0, -0.129, -0.071, 0.081, 0.019, 0.026, 0.11);
    });
    return { side, arm, elbow, leg, knee };
  });

  const copter = joint(head, 0, 0.317, 0.015);
  copter.name = 'BambooCopter';
  part(copter, place => {
    place('cylinder', '#e3b85e', 0, 0.067, 0, 0.04, 0.172, 0.04);
    place('round', '#9a7039', 0, 0.025, 0, 0.044, 0.029, 0.042);
    place('cylinder', '#7d8844', 0, 0.153, 0, 0.064, 0.038, 0.064);
  });
  const rotor = joint(copter, 0, 0.159, 0);
  rotor.name = 'BambooRotor';
  part(rotor, place => {
    place('round', '#e2ae57', 0, 0, 0, 0.055, 0.022, 0.055);
    for (const side of [-1, 1]) {
      place('box', '#b7ad64', side * 0.108, 0, 0, 0.21, 0.02, 0.053, -side * 0.14);
      place('round', '#edd083', side * 0.282, 0, side * 0.012, 0.235, 0.022, 0.085, -side * 0.17, -0.11);
      place('round', '#88a255', side * 0.411, 0.005, side * 0.028, 0.098, 0.016, 0.054, -side * 0.17, -0.11);
      place('box', '#b7a05d', side * 0.29, 0.019, side * 0.008, 0.014, 0.007, 0.115, -side * 0.17, -0.11);
    }
  });
  copter.visible = false;

  return { body, head, limbs, copter, rotor };
}

export function createTourAvatar() {
  const object = new THREE.Group();
  object.name = 'TourAvatar';
  const kit = createModelKit();
  const characters = {
    taoqi: makeCharacter(object, kit, 'taoqi'),
    xiaoxiao: makeCharacter(object, kit, 'xiaoxiao'),
  };
  let active: TourCharacter = 'taoqi';
  let phase = 0;
  let clock = 0;
  let movement = 0;
  let flight = 0;
  let headingReady = false;
  characters.xiaoxiao.body.visible = false;

  return {
    object,
    select(id: TourCharacter) {
      characters[active].body.visible = false;
      active = id;
      characters[active].body.visible = true;
    },
    update(dt: number, mode: AvatarMode, speed: number, heading: number, lift: number) {
      object.visible = mode !== 'overview';
      if (mode === 'overview') {
        headingReady = false;
        return;
      }
      const avatar = characters[active];
      clock += dt;
      const flying = mode === 'fly';
      const gait = flying ? 0 : THREE.MathUtils.clamp(speed / 2.65, 0, 1);
      movement = THREE.MathUtils.damp(movement, gait, 13, dt);
      flight = THREE.MathUtils.damp(flight, Number(flying), 11, dt);
      phase = (phase + dt * tau * (0.85 + 1.25 * movement)) % tau;
      const deltaHeading = heading - object.rotation.y;
      object.rotation.y = headingReady
        ? object.rotation.y + Math.atan2(Math.sin(deltaHeading), Math.cos(deltaHeading)) * (1 - Math.exp(-18 * dt))
        : heading;
      headingReady = true;

      avatar.body.position.y = 0.019 * movement * Math.abs(Math.sin(phase))
        + flight * (0.052 + Math.sin(clock * 5) * 0.033);
      avatar.body.rotation.x = flight * (-0.16 - Math.min(speed * 0.006, 0.22) + lift * 0.08)
        - (1 - flight) * movement * 0.055;
      avatar.body.rotation.z = Math.sin(phase) * movement * 0.028 + Math.sin(clock * 2.4) * flight * 0.043;
      avatar.head.rotation.x = 0.10 * flight;
      avatar.head.rotation.z = Math.sin(clock * 1.9) * (0.015 + flight * 0.019);
      avatar.copter.visible = flying;
      if (flying) avatar.rotor.rotation.y = (avatar.rotor.rotation.y + dt * (23 + Math.min(speed, 10))) % tau;

      for (const limb of avatar.limbs) {
        const swing = Math.sin(phase) * limb.side;
        const idle = Math.sin(clock * 3.1 + limb.side * 0.9);
        limb.arm.rotation.x = -swing * movement * 0.63 - flight * (0.21 + idle * 0.065);
        limb.arm.rotation.z = limb.side * (0.10 + 0.53 * flight);
        limb.elbow.rotation.x = 0.12 + (1 - flight) * movement * (0.25 - swing * 0.19) + flight * 0.12;
        limb.leg.rotation.x = swing * movement * 0.55 - flight * (0.28 + limb.side * 0.095);
        limb.leg.rotation.z = limb.side * flight * 0.10;
        limb.knee.rotation.x = -Math.max(0, -swing) * movement * 0.66 - flight * (0.43 - idle * 0.11);
      }
    },
    dispose() {
      kit.dispose();
      object.clear();
    },
  };
}
