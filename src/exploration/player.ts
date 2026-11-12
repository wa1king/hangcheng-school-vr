import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { createVehiclePhysicsSystem } from './vehicle-physics.ts';
import type { VehicleActionResult, VehicleInput, VehicleOptions, VehiclePhysics } from './vehicle-physics.ts';
import { createResourcePhysicsSystem } from './resource-physics.ts';
import type { ResourceActionResult, ResourcePhysics, ResourcePhysicsOptions } from './resource-physics.ts';

/** World units are metres; position and the avatar's origin are at its feet. */
export const CHARACTER_HEIGHT = 1.75;
export const CHARACTER_RADIUS = 0.24;
const CHARACTER_HALF_HEIGHT = CHARACTER_HEIGHT / 2;
const CAPSULE_HALF_SEGMENT = CHARACTER_HALF_HEIGHT - CHARACTER_RADIUS;
const CONTACT_OFFSET = 0.015;
const STEP_HEIGHT = 0.26;
const FIXED_STEP = 1 / 120;
const SPRINT_EVIDENCE_SECONDS = .05;
const WALK_SPEED = 1.3;
const RUN_SPEED = 5.2;
const GRAVITY = 18;
const JUMP_SPEED = 5.5;

export interface PlayerController {
  readonly object: THREE.Group;
  /** Live world-space feet position. Treat as read-only; use teleport to move it. */
  readonly position: THREE.Vector3;
  readonly grounded: boolean;
  readonly sprinting: boolean;
  readonly drivingVehicle: VehiclePhysics | undefined;
  /** Replace one independently owned static mesh; invalid/occupied replacements keep the old collider. */
  setStaticCollision(id: string, environment: THREE.Object3D): void;
  removeStaticCollision(id: string): boolean;
  addVehicle(options: VehicleOptions): VehiclePhysics;
  getVehicle(id: string): VehiclePhysics | undefined;
  getVehicleState(id: string): VehiclePhysics | undefined;
  setVehicleInput(id: string, input: Partial<VehicleInput>): boolean;
  resetVehicle(id: string, position?: THREE.Vector3, quaternion?: THREE.Quaternion): boolean;
  removeVehicle(id: string): boolean;
  enterVehicle(id: string): VehicleActionResult;
  exitVehicle(): VehicleActionResult;
  addResource(options: ResourcePhysicsOptions): ResourcePhysics;
  getResource(id: string): ResourcePhysics | undefined;
  fellResource(id: string, direction: THREE.Vector3): ResourceActionResult;
  /** Collect only a physically settled log; its fixed stump remains solid. */
  collectResource(id: string): boolean;
  /** Regrow only when the standing trunk is clear of the player and vehicles. */
  restoreResource(id: string): boolean;
  /** Query the resource's complete original solid volume without stepping or moving any body. */
  canRestoreResource(id: string): boolean;
  removeResource(id: string): boolean;
  update(dt: number, direction: THREE.Vector3, running: boolean, jump: boolean): void;
  teleport(feet: THREE.Vector3): void;
  /** Shorten a third-person camera arm against the static environment. */
  constrainCamera(target: THREE.Vector3, desired: THREE.Vector3): THREE.Vector3;
  dispose(): void;
}

/** A visual avatar can change appearance without replacing the physics root. */
export interface PlayerAvatar {
  readonly object: THREE.Group;
  updateMotion(dt: number, motion: { speed: number; distance?: number; grounded: boolean; sprinting: boolean; turnRate?: number }): void;
  dispose(): void;
}

interface CollisionMesh {
  geometry: THREE.BufferGeometry;
  transform: THREE.Matrix4;
}

/** Bake rendered environment transforms into one immutable collision mesh. */
function environmentCollision(environment: THREE.Object3D) {
  environment.updateWorldMatrix(true, true);
  const parts: CollisionMesh[] = [];
  let vertexCount = 0;
  let indexCount = 0;

  environment.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    // Explicit authoring metadata can mark decoration as non-solid. Do not
    // approximate whole buildings with boxes: that would seal their doorways.
    let ancestor: THREE.Object3D | null = object;
    while (ancestor) {
      if (!ancestor.visible || ancestor.userData.collision === false) return;
      if (ancestor === environment) break;
      ancestor = ancestor.parent;
    }
    const geometry: THREE.BufferGeometry = object.geometry;
    const positions = geometry.getAttribute('position');
    if (!positions || positions.count < 3) return;
    const count = geometry.index?.count ?? positions.count;
    if (count < 3) return;

    const addPart = (transform: THREE.Matrix4) => {
      parts.push({ geometry, transform });
      vertexCount += positions.count;
      indexCount += Math.floor(count / 3) * 3;
    };
    if (object instanceof THREE.InstancedMesh) {
      const instance = new THREE.Matrix4();
      for (let index = 0; index < object.count; index++) {
        object.getMatrixAt(index, instance);
        addPart(new THREE.Matrix4().multiplyMatrices(object.matrixWorld, instance));
      }
    } else {
      addPart(object.matrixWorld.clone());
    }
  });

  if (indexCount === 0) throw new Error('The exploration environment has no collision geometry.');
  const vertices = new Float32Array(vertexCount * 3);
  const indices = new Uint32Array(indexCount);
  const point = new THREE.Vector3();
  let vertexOffset = 0;
  let indexOffset = 0;

  for (const { geometry, transform } of parts) {
    const positions = geometry.getAttribute('position');
    for (let index = 0; index < positions.count; index++) {
      point.fromBufferAttribute(positions, index).applyMatrix4(transform);
      const offset = (vertexOffset + index) * 3;
      vertices[offset] = point.x;
      vertices[offset + 1] = point.y;
      vertices[offset + 2] = point.z;
    }
    const geometryIndex = geometry.index;
    const count = Math.floor((geometryIndex?.count ?? positions.count) / 3) * 3;
    const mirrored = transform.determinant() < 0;
    for (let index = 0; index < count; index += 3) {
      const a = geometryIndex ? geometryIndex.getX(index) : index;
      const b = geometryIndex ? geometryIndex.getX(index + 1) : index + 1;
      const c = geometryIndex ? geometryIndex.getX(index + 2) : index + 2;
      indices[indexOffset++] = vertexOffset + a;
      indices[indexOffset++] = vertexOffset + (mirrored ? c : b);
      indices[indexOffset++] = vertexOffset + (mirrored ? b : c);
    }
    vertexOffset += positions.count;
  }
  return { vertices, indices };
}

function createAvatar() {
  const object = new THREE.Group();
  object.name = 'Exploration player';
  const body = new THREE.Group();
  object.add(body);
  const shirt = new THREE.MeshStandardMaterial({ color: '#df713d', roughness: 0.85 });
  const trousers = new THREE.MeshStandardMaterial({ color: '#263947', roughness: 0.9 });
  const skin = new THREE.MeshStandardMaterial({ color: '#d5a07b', roughness: 0.9 });
  const hair = new THREE.MeshStandardMaterial({ color: '#302b29', roughness: 1 });
  const shoes = new THREE.MeshStandardMaterial({ color: '#20262b', roughness: 1 });

  const mesh = (geometry: THREE.BufferGeometry, material: THREE.Material, parent: THREE.Object3D, x: number, y: number, z = 0) => {
    const part = new THREE.Mesh(geometry, material);
    part.position.set(x, y, z);
    part.castShadow = true;
    part.receiveShadow = true;
    parent.add(part);
    return part;
  };
  mesh(new THREE.BoxGeometry(0.38, 0.56, 0.23), shirt, body, 0, 1.09);
  mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.12, 8), skin, body, 0, 1.42);
  mesh(new THREE.SphereGeometry(0.155, 12, 10), skin, body, 0, 1.585);
  const cap = mesh(new THREE.SphereGeometry(0.16, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), hair, body, 0, 1.585);
  cap.scale.y = 1.02;
  // A small nose also makes the avatar's forward (+Z) direction visible.
  mesh(new THREE.BoxGeometry(0.055, 0.065, 0.06), skin, body, 0, 1.57, 0.15);

  const limbs: THREE.Group[] = [];
  for (const side of [-1, 1]) {
    const leg = new THREE.Group();
    leg.position.set(side * 0.105, 0.83, 0);
    body.add(leg);
    mesh(new THREE.BoxGeometry(0.15, 0.65, 0.17), trousers, leg, 0, -0.325);
    mesh(new THREE.BoxGeometry(0.17, 0.13, 0.28), shoes, leg, 0, -0.755, 0.035);
    limbs.push(leg);
    const arm = new THREE.Group();
    arm.position.set(side * 0.245, 1.32, 0);
    body.add(arm);
    mesh(new THREE.BoxGeometry(0.12, 0.30, 0.14), shirt, arm, 0, -0.15);
    mesh(new THREE.BoxGeometry(0.105, 0.25, 0.12), skin, arm, 0, -0.40);
    limbs.push(arm);
  }
  return { object, body, limbs };
}

let rapierReady: Promise<void> | undefined;

export async function createPlayerController(
  environment: THREE.Object3D,
  spawn: THREE.Vector3,
  avatarModel?: PlayerAvatar,
): Promise<PlayerController> {
  rapierReady ??= RAPIER.init();
  await rapierReady;
  const { vertices, indices } = environmentCollision(environment);
  const world = new RAPIER.World({ x: 0, y: -GRAVITY, z: 0 });
  const staticColliders = new Map<string, RAPIER.Collider>();
  world.timestep = FIXED_STEP;
  world.createCollider(RAPIER.ColliderDesc.trimesh(vertices, indices));
  const rigidBody = world.createRigidBody(
    RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(spawn.x, spawn.y + CHARACTER_HALF_HEIGHT, spawn.z),
  );
  const collider = world.createCollider(
    RAPIER.ColliderDesc.capsule(CAPSULE_HALF_SEGMENT, CHARACTER_RADIUS).setFriction(0),
    rigidBody,
  );
  const controller = world.createCharacterController(CONTACT_OFFSET);
  const vehicles = createVehiclePhysicsSystem(world, collider);
  const resources = createResourcePhysicsSystem(world, collider);
  world.maxCcdSubsteps = 4;
  controller.setUp({ x: 0, y: 1, z: 0 });
  controller.setSlideEnabled(true);
  controller.setMaxSlopeClimbAngle(Math.PI / 4);
  controller.setMinSlopeSlideAngle(Math.PI / 4);
  controller.enableAutostep(STEP_HEIGHT, 0.1, false);
  controller.enableSnapToGround(0.2);
  // A first step populates Rapier's spatial queries before any character move.
  world.step();

  // The browser supplies a loaded model; physics tests keep an offline fallback.
  const fallbackAvatar = avatarModel ? undefined : createAvatar();
  const avatar = { object: avatarModel?.object ?? fallbackAvatar!.object };
  const position = spawn.clone();
  avatar.object.position.copy(position);
  const movement = new THREE.Vector3();
  const velocity = new THREE.Vector3();
  const targetVelocity = new THREE.Vector3();
  const displacement = new THREE.Vector3();
  const cameraDirection = new THREE.Vector3();
  const constrainedCamera = new THREE.Vector3();
  let accumulator = 0;
  let verticalSpeed = 0;
  let grounded = false;
  let jumpWasPressed = false;
  let jumpBuffer = 0;
  let animationPhase = 0;
  let animationWeight = 0;
  let animationSpeed = 0;
  let sprinting = false;
  let sprintEvidenceRemaining = 0;
  let disposed = false;
  let driving: VehiclePhysics | undefined;
  let savedAvatarVisible = true;
  const beforeDrivingPosition = spawn.clone();
  const seat = new THREE.Vector3();
  const capsuleShape = new RAPIER.Capsule(CAPSULE_HALF_SEGMENT, CHARACTER_RADIUS);

  const clearWalkingMotion = () => {
    verticalSpeed = 0; velocity.set(0, 0, 0); animationSpeed = 0;
    grounded = false; sprinting = false; sprintEvidenceRemaining = 0;
    accumulator = 0; jumpBuffer = 0; jumpWasPressed = false;
  };
  const placeFeet = (feet: THREE.Vector3) => {
    const translation = { x: feet.x, y: feet.y + CHARACTER_HALF_HEIGHT, z: feet.z };
    rigidBody.setTranslation(translation, true);
    rigidBody.setNextKinematicTranslation(translation);
    world.propagateModifiedBodyPositionsToColliders();
  };
  const cancelDriving = (feet: THREE.Vector3) => {
    if (driving) { driving.park(); driving = undefined; avatar.object.visible = savedAvatarVisible; }
    collider.setEnabled(true); clearWalkingMotion(); placeFeet(feet);
  };
  const pathClear = (fromFeet: THREE.Vector3, toFeet: THREE.Vector3, vehicle: VehiclePhysics) => {
    const from = fromFeet.clone().add(new THREE.Vector3(0, CHARACTER_HALF_HEIGHT, 0));
    const delta = toFeet.clone().sub(fromFeet);
    const excluded = vehicles.bodyFor(vehicle.id);
    if (world.castShape(from, { x: 0, y: 0, z: 0, w: 1 }, delta, capsuleShape, .005, 1, true,
      RAPIER.QueryFilterFlags.EXCLUDE_SENSORS, undefined, collider, excluded)) return false;
    // Newly spawned/reset dynamic bodies may not yet have had a broadphase
    // tick. Query their actual collider shapes too, without advancing the world.
    let clear = true;
    world.forEachCollider(other => {
      const parent = other.parent();
      if (!clear || !other.isEnabled() || other.isSensor() || !parent?.isDynamic() || parent.handle === excluded?.handle) return;
      if (other.castShape({ x: 0, y: 0, z: 0 }, capsuleShape, from, { x: 0, y: 0, z: 0, w: 1 }, delta, .005, 1, true)) clear = false;
    });
    return clear;
  };
  const vehicleMoving = (vehicle: VehiclePhysics, limit: number) => {
    const body = vehicles.bodyFor(vehicle.id)!;
    const linear = body.linvel(), angular = body.angvel();
    return Math.hypot(linear.x, linear.y, linear.z) > limit || Math.hypot(angular.x, angular.y, angular.z) > 1;
  };

  const syncPosition = () => {
    const center = rigidBody.translation();
    position.set(center.x, center.y - CHARACTER_HALF_HEIGHT, center.z);
    avatar.object.position.copy(position);
  };

  const stepWorld = () => {
    vehicles.beforeStep(FIXED_STEP); resources.beforeStep(FIXED_STEP);
    world.step(); vehicles.afterStep(); resources.afterStep(FIXED_STEP);
    const safeFeet = resources.safePlayerFeet(CHARACTER_HEIGHT, CHARACTER_RADIUS);
    if (safeFeet) {
      placeFeet(safeFeet); velocity.set(0, 0, 0); verticalSpeed = 0;
      grounded = false; sprintEvidenceRemaining = 0;
    }
  };

  return {
    object: avatar.object,
    position,
    get grounded() { return grounded; },
    get sprinting() { return sprinting; },
    get drivingVehicle() { return driving?.disposed ? undefined : driving; },
    setStaticCollision(id, environment) {
      if (disposed) throw new Error('Player controller is disposed.');
      if (!id.trim()) throw new Error('Static collision identity is required.');
      const { vertices, indices } = environmentCollision(environment);
      if (!vertices.every(Number.isFinite) || !indices.every(index => index < vertices.length / 3)) {
        throw new Error('Static collision contains invalid geometry.');
      }
      const next = world.createCollider(RAPIER.ColliderDesc.trimesh(vertices, indices));
      try {
        let occupied = false;
        world.forEachCollider(other => {
          if (occupied || other.handle === next.handle || !other.isEnabled() || other.isSensor()) return;
          if (other.handle !== collider.handle && !other.parent()?.isDynamic()) return;
          // Query shapes directly: a new collider has not entered the broadphase yet.
          const contact = next.contactCollider(other, 0);
          if (contact && contact.distance < -.005) occupied = true;
        });
        if (occupied) throw new Error('Static collision is occupied by the player or a dynamic object. Move to a safe walkway first.');
      } catch (error) {
        world.removeCollider(next, true);
        throw error;
      }
      const previous = staticColliders.get(id);
      staticColliders.set(id, next);
      if (previous) world.removeCollider(previous, true);
      // Refresh spatial queries before a camera ray or the next character move.
      stepWorld(); syncPosition();
    },
    removeStaticCollision(id) {
      if (disposed) return false;
      const previous = staticColliders.get(id);
      if (!previous) return false;
      staticColliders.delete(id);
      world.removeCollider(previous, true);
      stepWorld(); syncPosition();
      return true;
    },
    addResource(options) { if (disposed) throw new Error('Player controller is disposed.'); return resources.add(options); },
    getResource(id) { return disposed ? undefined : resources.get(id); },
    fellResource(id, direction) { return resources.fell(id, direction); },
    collectResource(id) { return resources.collect(id); },
    restoreResource(id) { return resources.restore(id); },
    canRestoreResource(id) { return resources.canRestore(id); },
    removeResource(id) { return disposed ? false : resources.remove(id); },
    addVehicle(options) { if (disposed) throw new Error('Player controller is disposed.'); return vehicles.add(options); },
    getVehicle(id) { return disposed ? undefined : vehicles.get(id); },
    getVehicleState(id) { return disposed ? undefined : vehicles.get(id); },
    setVehicleInput(id, input) { const vehicle = vehicles.get(id); if (disposed || !vehicle) return false; vehicle.setInput(input); return true; },
    resetVehicle(id, at, rotation) {
      const vehicle = vehicles.get(id); if (disposed || !vehicle) return false;
      vehicle.reset(at, rotation);
      if (driving === vehicle) { vehicles.seatPosition(id, seat); placeFeet(seat); syncPosition(); }
      return true;
    },
    removeVehicle(id) {
      if (disposed) return false;
      if (driving?.id === id) { cancelDriving(beforeDrivingPosition); syncPosition(); }
      return vehicles.remove(id);
    },
    enterVehicle(id) {
      if (disposed) return { ok: false, reason: 'disposed' };
      if (driving) return { ok: false, reason: 'already-driving' };
      const vehicle = vehicles.get(id);
      if (!vehicle) return { ok: false, reason: 'not-found' };
      vehicles.seatPosition(id, seat);
      if (position.distanceTo(seat) > 3.5) return { ok: false, reason: 'too-far' };
      if (vehicleMoving(vehicle, .8)) return { ok: false, reason: 'moving' };
      if (new THREE.Vector3(0, 1, 0).applyQuaternion(vehicle.quaternion).y < .35) return { ok: false, reason: 'blocked' };
      if (!pathClear(position, seat, vehicle)) return { ok: false, reason: 'blocked' };
      beforeDrivingPosition.copy(position); savedAvatarVisible = avatar.object.visible;
      driving = vehicle; vehicle.setInput({ throttle: 0, steering: 0, brake: 1 });
      collider.setEnabled(false); avatar.object.visible = false; clearWalkingMotion(); placeFeet(seat); syncPosition();
      return { ok: true };
    },
    exitVehicle() {
      if (disposed) return { ok: false, reason: 'disposed' };
      if (!driving || driving.disposed) return { ok: false, reason: 'not-found' };
      const vehicle = driving;
      if (vehicleMoving(vehicle, 1)) return { ok: false, reason: 'moving' };
      const side = vehicle.config.width / 2 + CHARACTER_RADIUS + .35;
      const rear = vehicle.config.length / 2 + CHARACTER_RADIUS + .4;
      const candidates = [[side, 0], [-side, 0], [side, -.7], [-side, -.7], [0, -rear], [0, rear]];
      const from = vehicles.seatPosition(vehicle.id, seat)!;
      for (const [x, z] of candidates) {
        const point = new THREE.Vector3(x, 0, z).applyQuaternion(vehicle.quaternion).add(vehicle.position);
        const hit = world.castRayAndGetNormal(new RAPIER.Ray({ x: point.x, y: point.y + 2, z: point.z }, { x: 0, y: -1, z: 0 }), 4, true,
          RAPIER.QueryFilterFlags.EXCLUDE_SENSORS | RAPIER.QueryFilterFlags.EXCLUDE_DYNAMIC, undefined, collider, vehicles.bodyFor(vehicle.id));
        if (!hit || hit.normal.y < .7) continue;
        point.y += 2 - hit.timeOfImpact + CONTACT_OFFSET;
        if (Math.abs(point.y - vehicle.position.y) > .7) continue;
        const center = point.clone().add(new THREE.Vector3(0, CHARACTER_HALF_HEIGHT, 0));
        let blocked = false;
        world.forEachCollider(other => {
          if (blocked || !other.isEnabled() || other.isSensor() || other.handle === collider.handle) return;
          const contact = other.contactShape(capsuleShape, center, { x: 0, y: 0, z: 0, w: 1 }, .005);
          if (contact && contact.distance <= .005) blocked = true;
        });
        if (blocked || !pathClear(from, point, vehicle)) continue;
        cancelDriving(point); syncPosition(); return { ok: true };
      }
      return { ok: false, reason: 'no-safe-exit' };
    },
    update(dt, direction, running, jump) {
      sprinting = false;
      if (disposed || !Number.isFinite(dt) || dt <= 0) { sprintEvidenceRemaining = 0; return; }
      const elapsed = Math.min(dt, 0.1);
      if (driving?.disposed) { cancelDriving(beforeDrivingPosition); syncPosition(); }
      if (driving) {
        sprintEvidenceRemaining = 0; accumulator += elapsed;
        while (accumulator + 1e-9 >= FIXED_STEP) {
          stepWorld();
          vehicles.seatPosition(driving.id, seat); placeFeet(seat);
          accumulator = Math.max(0, accumulator - FIXED_STEP);
        }
        syncPosition(); avatarModel?.updateMotion(elapsed, { speed: 0, distance: 0, grounded: false, sprinting: false });
        return;
      }
      if (jump && !jumpWasPressed) jumpBuffer = 0.12;
      jumpWasPressed = jump;
      movement.set(direction.x, 0, direction.z);
      if (!Number.isFinite(movement.lengthSq())) movement.set(0, 0, 0);
      if (movement.lengthSq() > 1) movement.normalize();
      if (!running || movement.lengthSq() <= .001 || !grounded || jump) {
        sprintEvidenceRemaining = 0;
      }
      accumulator += elapsed;
      let horizontalDistance = 0;
      let physicsSteps = 0;
      let frameSprinting = false;

      while (accumulator + 1e-9 >= FIXED_STEP) {
        sprintEvidenceRemaining = Math.max(0, sprintEvidenceRemaining - FIXED_STEP);
        const canRun = running && movement.lengthSq() > .001;
        const speed = canRun ? RUN_SPEED : WALK_SPEED;
        targetVelocity.copy(movement).multiplyScalar(speed);
        // Exact exponential integration gives the same short, weighted start
        // and stop at any render rate, without reducing the sprint top speed.
        const response = movement.lengthSq() > .001 ? 14 : 20;
        const decay = Math.exp(-response * FIXED_STEP);
        displacement.copy(velocity).sub(targetVelocity).multiplyScalar((1 - decay) / response)
          .addScaledVector(targetVelocity, FIXED_STEP);
        velocity.lerp(targetVelocity, 1 - decay);
        if (velocity.lengthSq() < .000001 && movement.lengthSq() < .001) velocity.set(0, 0, 0);
        const wasGrounded = grounded;
        if (jumpBuffer > 0 && grounded) {
          verticalSpeed = JUMP_SPEED;
          grounded = false;
          jumpBuffer = 0;
        }
        jumpBuffer = Math.max(0, jumpBuffer - FIXED_STEP);
        verticalSpeed = Math.max(-35, verticalSpeed - GRAVITY * FIXED_STEP);
        controller.computeColliderMovement(collider, {
          x: displacement.x,
          y: verticalSpeed * FIXED_STEP,
          z: displacement.z,
        });
        const corrected = controller.computedMovement();
        const current = rigidBody.translation();
        rigidBody.setNextKinematicTranslation({
          x: current.x + corrected.x,
          y: current.y + corrected.y,
          z: current.z + corrected.z,
        });
        stepWorld();
        grounded = controller.computedGrounded();
        if (grounded && verticalSpeed < 0) verticalSpeed = 0;
        // Cancel upward velocity if a ceiling stops the capsule.
        if (verticalSpeed > 0 && corrected.y < verticalSpeed * FIXED_STEP * 0.5) verticalSpeed = 0;
        const stepDistance = Math.hypot(corrected.x, corrected.z);
        const actualSprint = canRun && (wasGrounded || grounded) && stepDistance > .0005;
        frameSprinting ||= actualSprint;
        if (actualSprint) sprintEvidenceRemaining = SPRINT_EVIDENCE_SECONDS;
        horizontalDistance += stepDistance;
        physicsSteps++;
        accumulator = Math.max(0, accumulator - FIXED_STEP);
      }
      // Carry measured sprint motion briefly across collision corrections and
      // render frames between physics ticks so animation and footsteps agree.
      // Releasing input clears the evidence without waiting for a physics tick.
      if (!running || movement.lengthSq() <= .001 || !grounded || jump) {
        sprintEvidenceRemaining = 0;
      }
      sprinting = sprintEvidenceRemaining > 1e-9;
      syncPosition();

      let turnRate = 0;
      if (movement.lengthSq() > 0.001) {
        const heading = Math.atan2(movement.x, movement.z);
        const delta = THREE.MathUtils.euclideanModulo(heading - avatar.object.rotation.y + Math.PI, Math.PI * 2) - Math.PI;
        const turn = delta * (1 - Math.exp(-(running ? 12 : 8) * elapsed));
        avatar.object.rotation.y += turn;
        turnRate = turn / elapsed;
      }

      if (avatarModel) {
        // Retain measured velocity on render frames between physics ticks, but
        // advance foot phase only by distance actually travelled this frame.
        if (physicsSteps) animationSpeed = horizontalDistance / (physicsSteps * FIXED_STEP);
        avatarModel.updateMotion(elapsed, { speed: animationSpeed, distance: horizontalDistance, grounded,
          sprinting: sprinting && (frameSprinting || !physicsSteps), turnRate });
      } else if (fallbackAvatar) {
        const moving = grounded && horizontalDistance > 0.0005;
        animationWeight = THREE.MathUtils.damp(animationWeight, moving ? 1 : 0, 14, elapsed);
        animationPhase += horizontalDistance * 5;
        const stride = Math.sin(animationPhase) * (sprinting ? 0.65 : 0.45) * animationWeight;
        fallbackAvatar.limbs[0].rotation.x = stride;
        fallbackAvatar.limbs[1].rotation.x = -stride * 0.8;
        fallbackAvatar.limbs[2].rotation.x = -stride;
        fallbackAvatar.limbs[3].rotation.x = stride * 0.8;
        fallbackAvatar.body.position.y = Math.abs(Math.sin(animationPhase * 2)) * 0.025 * animationWeight;
      }
    },
    teleport(feet) {
      if (disposed) return;
      if (!feet.toArray().every(Number.isFinite)) return;
      if (driving) cancelDriving(feet);
      const translation = { x: feet.x, y: feet.y + CHARACTER_HALF_HEIGHT, z: feet.z };
      rigidBody.setTranslation(translation, true);
      rigidBody.setNextKinematicTranslation(translation);
      stepWorld();
      verticalSpeed = 0;
      velocity.set(0, 0, 0);
      animationSpeed = 0;
      grounded = false;
      sprinting = false;
      sprintEvidenceRemaining = 0;
      accumulator = 0;
      jumpBuffer = 0;
      syncPosition();
    },
    constrainCamera(target, desired) {
      constrainedCamera.copy(desired);
      if (disposed) return constrainedCamera;
      cameraDirection.subVectors(desired, target);
      const distance = cameraDirection.length();
      if (distance < 0.001) return constrainedCamera;
      cameraDirection.divideScalar(distance);
      const ray = new RAPIER.Ray(target, cameraDirection);
      const hit = world.castRay(ray, distance, true, undefined, undefined, collider, driving ? vehicles.bodyFor(driving.id) : undefined);
      if (hit) {
        const cameraDistance = Math.min(distance, Math.max(0.35, hit.timeOfImpact - 0.18));
        constrainedCamera.copy(target).addScaledVector(cameraDirection, cameraDistance);
      }
      return constrainedCamera;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      sprinting = false;
      sprintEvidenceRemaining = 0;
      resources.dispose(); vehicles.dispose(); driving = undefined;
      staticColliders.clear();
      world.removeCharacterController(controller);
      world.free();
      avatar.object.removeFromParent();
      if (avatarModel) { avatarModel.dispose(); return; }
      const geometries = new Set<THREE.BufferGeometry>();
      const materials = new Set<THREE.Material>();
      avatar.object.traverse((part) => {
        if (!(part instanceof THREE.Mesh)) return;
        geometries.add(part.geometry);
        for (const material of Array.isArray(part.material) ? part.material : [part.material]) materials.add(material);
      });
      for (const geometry of geometries) geometry.dispose();
      for (const material of materials) material.dispose();
    },
  };
}
