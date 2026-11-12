import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';

export interface TreePhysicsOptions {
  /** Full trunk height from its original ground pivot, in metres. */
  height: number;
  radius: number;
  cutHeight?: number;
  /** Green wood density, kg/m³. The convex trunk supplies mass and inertia. */
  density?: number;
}
export interface OrePhysicsOptions {
  /** Half dimensions of the visual rock. Its model pivot is at ground level. */
  halfExtents?: THREE.Vector3;
  quaternion?: THREE.Quaternion;
}
export type ResourcePhysicsOptions = {
  id: string;
  position: THREE.Vector3;
} & ({ kind: 'tree'; tree: TreePhysicsOptions; initialState?: 'standing' | 'stump' | 'fallen'; fallenPosition?: THREE.Vector3; fallenQuaternion?: THREE.Quaternion }
  | { kind: 'ore'; ore?: OrePhysicsOptions });
export type ResourcePhysicsState = 'standing' | 'hinged' | 'falling' | 'settled' | 'stump';
export interface ResourcePhysics {
  readonly id: string;
  readonly kind: 'tree' | 'ore';
  /** Original standing model ground pivot; read only. */
  readonly originalPosition: THREE.Vector3;
  /** Live model ground pivot. Apply this and quaternion to the original upper-tree mesh. */
  readonly position: THREE.Vector3;
  readonly quaternion: THREE.Quaternion;
  readonly state: ResourcePhysicsState;
  readonly mass: number;
  readonly speedMps: number;
  readonly angularSpeed: number;
  readonly sleeping: boolean;
  /** Actual upper-trunk support contact, excluding its stump and the player. */
  readonly groundContact: boolean;
  /** Centre-of-mass speed immediately before the latest new support contact, m/s. */
  readonly impactSpeed: number;
  /** World-space support point from the latest real collider contact. */
  readonly impactPoint: THREE.Vector3 | undefined;
  readonly disposed: boolean;
}
export interface ResourceActionResult {
  ok: boolean;
  reason?: 'not-found' | 'not-tree' | 'already-felled' | 'busy' | 'invalid-direction' | 'disposed';
}

/** Bounds simultaneous CCD/falling work; sleeping logs retain their ordinary solid bodies. */
export const MAX_ACTIVE_FALLING_TREES = 6;

const IDENTITY = { x: 0, y: 0, z: 0, w: 1 };
const ZERO = { x: 0, y: 0, z: 0 };
const UP = new THREE.Vector3(0, 1, 0);
const RELEASE_TILT = 24 * Math.PI / 180;

interface InternalResource extends ResourcePhysics {
  body: RAPIER.RigidBody;
  collider: RAPIER.Collider;
  stump?: RAPIER.RigidBody;
  joint?: RAPIER.ImpulseJoint;
  tree?: Required<TreePhysicsOptions>;
  centerHeight: number;
  originalQuaternion: THREE.Quaternion;
  quietTime: number;
  groundContact: boolean;
  impactSpeed: number;
  impactPoint: THREE.Vector3 | undefined;
  previousSpeed: number;
  descending: boolean;
  phase: ResourcePhysicsState;
  sync(): void;
}

const finiteVector = (value: THREE.Vector3) => value.toArray().every(component => Number.isFinite(component) && Math.abs(component) < 1e6);
const positive = (value: number, min: number, max: number) => Number.isFinite(value) && value >= min && value <= max;

/** Owns resource bodies/joints in the character/vehicle world. Never steps or frees the world. */
export function createResourcePhysicsSystem(world: RAPIER.World, playerCollider: RAPIER.Collider) {
  const resources = new Map<string, InternalResource>();
  const resourceColliderHandles = new Set<number>();
  const offset = new THREE.Vector3(), axis = new THREE.Vector3(), candidate = new THREE.Vector3();
  const center = new THREE.Vector3(), feet = new THREE.Vector3();
  let disposed = false;

  const releaseHinge = (resource: InternalResource) => {
    if (!resource.joint) return;
    world.removeImpulseJoint(resource.joint, true);
    resource.joint = undefined;
    resource.phase = 'falling';
  };
  const remove = (id: string) => {
    const resource = resources.get(id);
    if (!resource) return false;
    releaseHinge(resource);
    resourceColliderHandles.delete(resource.collider.handle);
    if (resource.stump) {
      for (let index = 0; index < resource.stump.numColliders(); index++) resourceColliderHandles.delete(resource.stump.collider(index).handle);
      world.removeRigidBody(resource.stump);
    }
    world.removeRigidBody(resource.body);
    resources.delete(id);
    return true;
  };
  const add = (options: ResourcePhysicsOptions): ResourcePhysics => {
    if (disposed) throw new Error('Resource physics system is disposed.');
    if (!options.id || resources.has(options.id)) throw new Error('Resource ID must be nonempty and unique.');
    if (!finiteVector(options.position)) throw new Error('Invalid resource position.');
    let tree: Required<TreePhysicsOptions> | undefined;
    let colliderDescription: RAPIER.ColliderDesc;
    let centerHeight = 0;
    let stump: RAPIER.RigidBody | undefined;
    const orientation = new THREE.Quaternion();
    if (options.kind === 'tree') {
      tree = { height: options.tree.height, radius: options.tree.radius,
        cutHeight: options.tree.cutHeight ?? .42, density: options.tree.density ?? 600 };
      if (!positive(tree.height, 1, 35) || !positive(tree.radius, .06, 1.5)
        || !positive(tree.cutHeight, .12, Math.min(1.2, tree.height / 3)) || !positive(tree.density, 200, 1200)) throw new Error('Invalid tree physics dimensions/density.');
      if (options.initialState === 'fallen' && (!options.fallenPosition || !finiteVector(options.fallenPosition)
        || !options.fallenQuaternion || !options.fallenQuaternion.toArray().every(Number.isFinite)
        || !Number.isFinite(options.fallenQuaternion.lengthSq()) || options.fallenQuaternion.lengthSq() < 1e-8)) throw new Error('Restoring a fallen tree requires a finite ground-pivot pose.');
      const upperHalf = (tree.height - tree.cutHeight) / 2;
      centerHeight = tree.cutHeight + upperHalf;
      // Twelve bark facets approximate the cylinder while allowing a resting
      // log to settle on a real face instead of rolling forever on a perfect arc.
      const trunkVertices: number[] = [];
      for (const y of [-upperHalf + .004, upperHalf - .004]) for (let index = 0; index < 12; index++) {
        const angle = index * Math.PI / 6;
        trunkVertices.push(Math.cos(angle) * tree.radius, y, Math.sin(angle) * tree.radius);
      }
      colliderDescription = RAPIER.ColliderDesc.convexHull(new Float32Array(trunkVertices))!
        .setDensity(tree.density).setFriction(.85).setRestitution(.025);
      stump = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(options.position.x, options.position.y + tree.cutHeight / 2, options.position.z));
      const stumpCollider = world.createCollider(RAPIER.ColliderDesc.cylinder(tree.cutHeight / 2, tree.radius).setFriction(.9), stump);
      resourceColliderHandles.add(stumpCollider.handle);
    } else {
      const half = options.ore?.halfExtents?.clone() ?? new THREE.Vector3(.65, .55, .6);
      if (!finiteVector(half) || ![half.x, half.y, half.z].every(value => positive(value, .05, 5))) throw new Error('Invalid ore physics dimensions.');
      if (options.ore?.quaternion) {
        orientation.copy(options.ore.quaternion);
        if (!orientation.toArray().every(Number.isFinite) || !Number.isFinite(orientation.lengthSq()) || orientation.lengthSq() < 1e-8) throw new Error('Invalid ore orientation.');
        orientation.normalize();
      }
      // Twelve vertices provide a tapered, solid convex rock instead of its oversized AABB.
      const vertices: number[] = [];
      for (const [height, width] of [[0, .72], [.8, 1], [2, .52]]) {
        for (const [x, z] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) vertices.push(x * half.x * width, height * half.y, z * half.z * width);
      }
      const hull = RAPIER.ColliderDesc.convexHull(new Float32Array(vertices));
      if (!hull) throw new Error('Invalid ore convex hull.');
      colliderDescription = hull.setFriction(.9).setRestitution(.02);
    }
    const originalPosition = options.position.clone(), position = originalPosition.clone(), quaternion = orientation.clone();
    const body = world.createRigidBody(RAPIER.RigidBodyDesc.fixed()
      .setTranslation(position.x, position.y + centerHeight, position.z).setRotation(orientation)
      .setGravityScale(9.81 / Math.max(.01, Math.abs(world.gravity.y)))
      .setCcdEnabled(true).setSoftCcdPrediction(.08)
      .setLinearDamping(.08).setAngularDamping(.12).setAdditionalSolverIterations(4));
    const collider = world.createCollider(colliderDescription, body);
    resourceColliderHandles.add(collider.handle);
    const resource: InternalResource = {
      id: options.id, kind: options.kind, originalPosition, position, quaternion, body, collider, stump, tree, centerHeight,
      originalQuaternion: orientation.clone(),
      phase: 'standing', quietTime: 0, groundContact: false, impactSpeed: 0, impactPoint: undefined, previousSpeed: 0, descending: false,
      get state() { return this.phase; },
      get disposed() { return resources.get(this.id) !== this; },
      get mass() { return this.disposed ? 0 : collider.mass(); },
      get speedMps() { if (this.disposed) return 0; const velocity = body.linvel(); return Math.hypot(velocity.x, velocity.y, velocity.z); },
      get angularSpeed() { if (this.disposed) return 0; const velocity = body.angvel(); return Math.hypot(velocity.x, velocity.y, velocity.z); },
      get sleeping() { return this.disposed || body.isSleeping(); },
      sync() {
        if (this.disposed) return;
        quaternion.copy(body.rotation());
        // Preserve the uncut visual's original ground pivot even after the upper body rotates.
        offset.set(0, this.centerHeight, 0).applyQuaternion(quaternion);
        position.copy(body.translation()).sub(offset);
      },
    };
    resources.set(options.id, resource);
    if (options.kind === 'tree' && options.initialState === 'stump') {
      body.setEnabled(false); resource.phase = 'stump';
    } else if (options.kind === 'tree' && options.initialState === 'fallen') {
      const rotation = options.fallenQuaternion!.clone().normalize();
      const at = options.fallenPosition!.clone().add(new THREE.Vector3(0, centerHeight, 0).applyQuaternion(rotation));
      body.setBodyType(RAPIER.RigidBodyType.Dynamic, false);
      body.setTranslation(at, false); body.setRotation(rotation, false); body.sleep();
      resource.phase = 'settled';
    }
    world.propagateModifiedBodyPositionsToColliders();
    resource.sync();
    return resource;
  };

  const fell = (id: string, direction: THREE.Vector3): ResourceActionResult => {
    if (disposed) return { ok: false, reason: 'disposed' };
    const resource = resources.get(id);
    if (!resource) return { ok: false, reason: 'not-found' };
    if (!resource.tree || !resource.stump) return { ok: false, reason: 'not-tree' };
    if (resource.phase !== 'standing') return { ok: false, reason: 'already-felled' };
    if (!finiteVector(direction) || Math.hypot(direction.x, direction.z) < .001) return { ok: false, reason: 'invalid-direction' };
    const active = [...resources.values()].filter(other => other.phase !== 'standing' && other.phase !== 'stump' && !other.body.isSleeping()).length;
    if (active >= MAX_ACTIVE_FALLING_TREES) return { ok: false, reason: 'busy' };
    axis.set(direction.z, 0, -direction.x).normalize(); // up × horizontal fall direction
    resource.body.setBodyType(RAPIER.RigidBodyType.Dynamic, true);
    const upperHalf = (resource.tree.height - resource.tree.cutHeight) / 2;
    const joint = world.createImpulseJoint(RAPIER.JointData.revolute(
      { x: 0, y: resource.tree.cutHeight / 2, z: 0 }, { x: 0, y: -upperHalf, z: 0 }, axis,
    ), resource.stump, resource.body, true);
    joint.setContactsEnabled(false);
    resource.joint = joint;
    resource.phase = 'hinged';
    resource.quietTime = 0; resource.groundContact = false; resource.impactSpeed = 0; resource.impactPoint = undefined;
    // The last blow supplies only the small initial angular velocity. Gravity and
    // the real hinge then control acceleration, collisions and the entire trajectory.
    resource.body.setAngvel(axis.clone().multiplyScalar(.18), true);
    const fallVelocity = new THREE.Vector3(direction.x, 0, direction.z).normalize().multiplyScalar(.18 * upperHalf);
    resource.body.setLinvel(fallVelocity, true);
    return { ok: true };
  };

  const canRestore = (id: string) => {
    const resource = resources.get(id);
    if (disposed || !resource) return false;
    const target = resource.originalPosition.clone().add(new THREE.Vector3(0, resource.centerHeight, 0));
    const shapes = [{ shape: resource.collider.shape, position: target, quaternion: resource.originalQuaternion }];
    if (resource.stump) shapes.push({ shape: resource.stump.collider(0).shape,
      position: resource.originalPosition.clone().add(new THREE.Vector3(0, resource.tree!.cutHeight / 2, 0)), quaternion: resource.originalQuaternion });
    let occupied = false;
    world.forEachCollider(other => {
      if (occupied || !other.isEnabled() || other.isSensor() || other.handle === resource.collider.handle
        || other.parent()?.handle === resource.stump?.handle || !other.parent() || other.parent()!.isFixed()) return;
      for (const shape of shapes) {
        const contact = other.contactShape(shape.shape, shape.position, shape.quaternion, .01);
        if (contact && contact.distance < .01) { occupied = true; break; }
      }
    });
    return !occupied;
  };
  const restore = (id: string) => {
    const resource = resources.get(id);
    if (disposed || !resource || resource.phase === 'standing' || !canRestore(id)) return false;
    const target = resource.originalPosition.clone().add(new THREE.Vector3(0, resource.centerHeight, 0));
    releaseHinge(resource);
    resource.body.setEnabled(true);
    resource.body.setBodyType(RAPIER.RigidBodyType.Fixed, true);
    resource.body.setTranslation(target, true); resource.body.setRotation(resource.originalQuaternion, true);
    resource.body.setLinvel(ZERO, true); resource.body.setAngvel(ZERO, true);
    resource.body.resetForces(true); resource.body.resetTorques(true);
    resource.phase = 'standing'; resource.quietTime = 0; resource.groundContact = false; resource.impactSpeed = 0; resource.impactPoint = undefined;
    world.propagateModifiedBodyPositionsToColliders(); resource.sync();
    return true;
  };

  return {
    add, remove, fell, restore, canRestore,
    collect(id: string) {
      const resource = resources.get(id);
      if (disposed || !resource || resource.phase !== 'settled') return false;
      releaseHinge(resource);
      // Retain the fixed stump and reusable original configuration; no active
      // dynamic body or upper collider survives collection.
      resource.body.setBodyType(RAPIER.RigidBodyType.Fixed, true);
      resource.body.setEnabled(false); resource.phase = 'stump'; resource.groundContact = false;
      world.propagateModifiedBodyPositionsToColliders();
      return true;
    },
    get: (id: string): ResourcePhysics | undefined => resources.get(id),
    beforeStep(_dt: number) {
      for (const resource of resources.values()) {
        if (resource.phase === 'standing' || resource.phase === 'stump') continue;
        resource.descending = resource.body.linvel().y < -.25;
        resource.previousSpeed = resource.speedMps;
        // The simple trunk hull omits bark and branch snags. Contact-only
        // damping approximates that rolling resistance; air motion stays free.
        const nearlyHorizontal = Math.abs(axis.copy(UP).applyQuaternion(resource.quaternion).y) < .5;
        resource.body.setAngularDamping(resource.groundContact && nearlyHorizontal ? 3 : .12);
      }
    },
    afterStep(dt: number) {
      for (const resource of resources.values()) {
        resource.sync();
        if (resource.phase === 'standing' || resource.phase === 'stump') continue;
        const tilt = Math.acos(THREE.MathUtils.clamp(UP.dot(axis.copy(UP).applyQuaternion(resource.quaternion)), -1, 1));
        if (resource.joint && tilt >= RELEASE_TILT) releaseHinge(resource);
        const hadContact = resource.groundContact;
        resource.groundContact = false;
        if (!resource.joint) world.contactPairsWith(resource.collider, other => {
          if (other.isSensor() || other.parent()?.handle === resource.stump?.handle || other.handle === playerCollider.handle) return;
          const contact = resource.collider.contactCollider(other, .015);
          if (contact && contact.distance < .015) {
            // Capture once on this contact transition; use the support surface,
            // not the player-nearest point along the log, for sound and dust.
            if (!hadContact && !resource.groundContact) resource.impactPoint = new THREE.Vector3().copy(contact.point2);
            resource.groundContact = true;
          }
        });
        if (resource.groundContact && !hadContact) resource.impactSpeed = resource.previousSpeed;
        // Sleep/stability is measured, never a fixed-duration fall animation.
        if (!resource.joint && resource.speedMps < .08 && resource.angularSpeed < .06) resource.quietTime += dt;
        else resource.quietTime = 0;
        if (!resource.joint) resource.phase = resource.body.isSleeping() || resource.quietTime > .75 ? 'settled' : 'falling';
      }
    },
    /**
     * Kinematic capsules cannot be pushed by dynamic logs. Recover an actual
     * penetration sideways onto checked nearby ground; this is escape protection,
     * not a damage system. All landing capsules are tested against every solid.
     */
    safePlayerFeet(height: number, radius: number): THREE.Vector3 | undefined {
      if (disposed || !playerCollider.isEnabled()) return;
      let overlapped = false;
      const escaping = new Set<number>();
      let escapeAngle = 0;
      for (const resource of resources.values()) {
        if (resource.phase === 'standing' || resource.phase === 'stump') continue;
        const contact = resource.collider.contactCollider(playerCollider, .035);
        if (contact && (contact.distance < -.045 || (contact.distance < .035 && resource.descending))) {
          if (!overlapped) {
            axis.copy(UP).applyQuaternion(resource.quaternion);
            escapeAngle = Math.atan2(axis.x, -axis.z); // nearest routes across, rather than along, the log
          }
          overlapped = true; escaping.add(resource.collider.handle);
        }
      }
      if (!overlapped) return;
      feet.copy(playerCollider.translation()); feet.y -= height / 2;
      const capsule = new RAPIER.Capsule(height / 2 - radius, radius);
      for (const distance of [.35, .65, 1, 1.4, 1.9, 2.5]) {
        for (let index = 0; index < 12; index++) {
          const angle = escapeAngle + index * Math.PI / 6;
          candidate.set(feet.x + Math.cos(angle) * distance, feet.y, feet.z + Math.sin(angle) * distance);
          const hit = world.castRayAndGetNormal(new RAPIER.Ray({ x: candidate.x, y: feet.y + .8, z: candidate.z }, { x: 0, y: -1, z: 0 }), 2.3, true,
            RAPIER.QueryFilterFlags.EXCLUDE_SENSORS | RAPIER.QueryFilterFlags.EXCLUDE_DYNAMIC,
            undefined, playerCollider, undefined, other => !resourceColliderHandles.has(other.handle));
          if (!hit || hit.normal.y < .71) continue;
          candidate.y = feet.y + .8 - hit.timeOfImpact + .02;
          if (Math.abs(candidate.y - feet.y) > .65) continue;
          center.copy(candidate); center.y += height / 2;
          let blocked = false;
          world.forEachCollider(other => {
            if (blocked || !other.isEnabled() || other.isSensor() || other.handle === playerCollider.handle) return;
            const contact = other.contactShape(capsule, center, IDENTITY, .01);
            if (contact && contact.distance < .005) blocked = true;
          });
          if (blocked) continue;
          center.copy(feet); center.y += height / 2;
          const delta = candidate.clone().sub(feet);
          const obstructed = world.castShape(center, IDENTITY, delta, capsule, .005, 1, true,
            RAPIER.QueryFilterFlags.EXCLUDE_SENSORS, undefined, playerCollider, undefined,
            other => !escaping.has(other.handle));
          if (!obstructed) return candidate.clone();
        }
      }
      return;
    },
    dispose() { if (disposed) return; for (const id of [...resources.keys()]) remove(id); disposed = true; },
  };
}
