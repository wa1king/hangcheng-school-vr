import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';

export interface VehicleInput { throttle: number; steering: number; brake: number; handbrake?: boolean }
export interface VehicleWheelConfig {
  /** Suspension attachment in the model's bottom-pivot frame, +Y up, +Z front. */
  connection: { x: number; y: number; z: number };
  radius?: number; steered?: boolean; powered?: boolean;
}
export interface VehicleConfig {
  length: number; width: number; height: number; wheelBase: number; trackWidth: number; wheelRadius: number;
  mass: number; maxForwardSpeed: number; maxReverseSpeed: number;
  engineForce: number; brakeForce: number; maxSteeringAngle: number;
  suspensionRestLength: number; suspensionStiffness: number; suspensionCompression: number;
  suspensionRelaxation: number; suspensionMaxTravel: number;
  seatPosition: { x: number; y: number; z: number };
  wheels?: readonly VehicleWheelConfig[];
}
export interface VehicleOptions {
  id: string; position: THREE.Vector3;
  quaternion?: THREE.Quaternion; rotation?: THREE.Quaternion | number;
  config?: Partial<VehicleConfig>;
}
export interface VehicleWheelState {
  position: THREE.Vector3; quaternion: THREE.Quaternion; rotation: number; steering: number; suspensionLength: number;
  radius: number; grounded: boolean;
}
export interface VehiclePhysics {
  readonly id: string; readonly config: Readonly<VehicleConfig>;
  /** Live model-bottom pivot and orientation. Read only; reset is the explicit recovery operation. */
  readonly position: THREE.Vector3; readonly quaternion: THREE.Quaternion;
  readonly speedMps: number; readonly speedKph: number; readonly speed: number;
  readonly steering: number; readonly wheels: readonly VehicleWheelState[];
  readonly disposed: boolean;
  setInput(input: Partial<VehicleInput>): void;
  park(): void;
  reset(position?: THREE.Vector3, quaternion?: THREE.Quaternion): void;
  dispose(): void;
}
export interface VehicleActionResult { ok: boolean; reason?: 'not-found' | 'already-driving' | 'too-far' | 'moving' | 'blocked' | 'no-safe-exit' | 'disposed' }

export const DEFAULT_VEHICLE_CONFIG: Readonly<VehicleConfig> = {
  length: 4.5, width: 1.9, height: 1.25, wheelBase: 2.65, trackWidth: 1.58, wheelRadius: .34,
  mass: 1250, maxForwardSpeed: 25, maxReverseSpeed: 7, engineForce: 9000, brakeForce: 22000,
  maxSteeringAngle: .5, suspensionRestLength: .25, suspensionStiffness: 35,
  suspensionCompression: 4.4, suspensionRelaxation: 5.2, suspensionMaxTravel: .20,
  seatPosition: { x: .32, y: .32, z: .12 },
};

interface InternalVehicle extends VehiclePhysics {
  body: RAPIER.RigidBody; raycast: RAPIER.DynamicRayCastVehicleController;
  preStep(dt: number): void; sync(): void;
}
const ZERO = { x: 0, y: 0, z: 0 };
const IDENTITY = { x: 0, y: 0, z: 0, w: 1 };
const clamp = (value: number | undefined, low: number, high: number) => Number.isFinite(value) ? Math.min(high, Math.max(low, value!)) : 0;

function configuration(partial: Partial<VehicleConfig> = {}): VehicleConfig {
  const config = { ...DEFAULT_VEHICLE_CONFIG, ...partial, seatPosition: { ...(partial.seatPosition ?? DEFAULT_VEHICLE_CONFIG.seatPosition) } };
  for (const [key, value] of Object.entries(config)) {
    if (key === 'wheels' || key === 'seatPosition') continue;
    if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0 || value > 1e7) throw new Error(`Invalid vehicle configuration: ${key}`);
  }
  if (config.wheelBase >= config.length || config.trackWidth > config.width || config.wheelRadius >= config.height) throw new Error('Wheel geometry must fit the vehicle dimensions.');
  const vector = (value: { x: number; y: number; z: number }) => ['x', 'y', 'z'].every(key => {
    const component = value?.[key as 'x' | 'y' | 'z']; return typeof component === 'number' && Number.isFinite(component) && Math.abs(component) <= 1e6;
  });
  if (!vector(config.seatPosition)) throw new Error('Invalid seat position.');
  if (config.wheels && (config.wheels.length !== 4 || config.wheels.some(wheel => !vector(wheel.connection) || (wheel.radius !== undefined && (!Number.isFinite(wheel.radius) || wheel.radius <= 0 || wheel.radius >= config.height))))) throw new Error('Vehicle needs four finite suspension attachments.');
  return config;
}

/** Owns only vehicle bodies/controllers in the player's existing world. Never steps or frees that world. */
export function createVehiclePhysicsSystem(world: RAPIER.World, playerCollider: RAPIER.Collider) {
  const vehicles = new Map<string, InternalVehicle>();
  let disposed = false;
  const remove = (id: string) => {
    const vehicle = vehicles.get(id);
    if (!vehicle) return false;
    vehicles.delete(id);
    world.removeVehicleController(vehicle.raycast);
    world.removeRigidBody(vehicle.body);
    return true;
  };
  const add = (options: VehicleOptions): VehiclePhysics => {
    if (disposed) throw new Error('Vehicle system is disposed.');
    if (!options.id || vehicles.has(options.id)) throw new Error('Vehicle ID must be nonempty and unique.');
    if (!options.position.toArray().every(value => Number.isFinite(value) && Math.abs(value) <= 1e6)) throw new Error('Invalid vehicle spawn.');
    const config = configuration(options.config);
    const spawn = options.position.clone();
    const orientation = options.quaternion?.clone() ?? (typeof options.rotation === 'number'
      ? new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), options.rotation)
      : options.rotation?.clone() ?? new THREE.Quaternion());
    if (!orientation.toArray().every(Number.isFinite) || !Number.isFinite(orientation.lengthSq()) || orientation.lengthSq() < 1e-8) throw new Error('Invalid vehicle orientation.');
    orientation.normalize();
    // Walking intentionally uses gravity 18; the same world's dynamic car uses Earth gravity.
    const body = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(spawn.x, spawn.y, spawn.z)
      .setRotation(orientation).setGravityScale(9.81 / Math.max(.01, Math.abs(world.gravity.y)))
      .setCcdEnabled(true).setSoftCcdPrediction(.15).setLinearDamping(.035).setAngularDamping(.8)
      .setAdditionalMassProperties(config.mass, { x: 0, y: config.height * .33, z: 0 }, {
        x: config.mass * (config.height ** 2 + config.length ** 2) / 12,
        y: config.mass * (config.width ** 2 + config.length ** 2) / 12,
        z: config.mass * (config.width ** 2 + config.height ** 2) / 12,
      }, IDENTITY));
    // A compound physical shell includes the cabin and bumpers, without a box down to road level.
    world.createCollider(RAPIER.ColliderDesc.cuboid(config.width * .49, config.height * .20, config.length * .49)
      .setTranslation(0, config.height * .46, 0).setMass(0).setFriction(.35).setRestitution(.05), body);
    world.createCollider(RAPIER.ColliderDesc.cuboid(config.width * .40, config.height * .20, config.length * .22)
      .setTranslation(0, config.height * .80, -.10).setMass(0).setFriction(.35).setRestitution(.05), body);
    const raycast = world.createVehicleController(body);
    raycast.indexUpAxis = 1;
    raycast.setIndexForwardAxis = 2; // Rapier 0.21 exposes this exact setter name.
    // Rapier stiffness is normalized by chassis mass. Offset the attachment by
    // the static four-wheel compression so the visual bottom pivot rests near the road.
    const connectionHeight = config.wheelRadius + config.suspensionRestLength - 9.81 / (4 * config.suspensionStiffness);
    const wheelConfigs: readonly VehicleWheelConfig[] = config.wheels ?? [1, -1, 1, -1].map((side, index) => ({
      connection: { x: side * config.trackWidth / 2, y: connectionHeight, z: (index < 2 ? 1 : -1) * config.wheelBase / 2 },
      steered: index < 2, powered: index >= 2,
    }));
    for (const [index, wheel] of wheelConfigs.entries()) {
      raycast.addWheel(wheel.connection, { x: 0, y: -1, z: 0 }, { x: -1, y: 0, z: 0 }, config.suspensionRestLength, wheel.radius ?? config.wheelRadius);
      raycast.setWheelSuspensionStiffness(index, config.suspensionStiffness);
      raycast.setWheelSuspensionCompression(index, config.suspensionCompression);
      raycast.setWheelSuspensionRelaxation(index, config.suspensionRelaxation);
      raycast.setWheelMaxSuspensionTravel(index, config.suspensionMaxTravel);
      raycast.setWheelMaxSuspensionForce(index, config.mass * 9.81 * 2);
      raycast.setWheelFrictionSlip(index, 2.2);
      raycast.setWheelSideFrictionStiffness(index, 1);
    }
    const position = spawn.clone(), quaternion = orientation.clone();
    const forward = new THREE.Vector3(), force = new THREE.Vector3(), direction = new THREE.Vector3();
    const wheelSteer = new THREE.Quaternion(), wheelRoll = new THREE.Quaternion();
    const wheels = wheelConfigs.map(wheel => ({ position: new THREE.Vector3(), quaternion: new THREE.Quaternion(), rotation: 0, steering: 0,
      suspensionLength: config.suspensionRestLength, radius: wheel.radius ?? config.wheelRadius, grounded: false }));
    let input: VehicleInput = { throttle: 0, steering: 0, brake: 1, handbrake: true };
    let speed = 0, steering = 0;
    const vehicle: InternalVehicle = {
      id: options.id, config, position, quaternion, wheels, body, raycast,
      get disposed() { return vehicles.get(options.id) !== vehicle; },
      get speedMps() { return speed; }, get speedKph() { return speed * 3.6; }, get speed() { return speed; },
      get steering() { return steering; },
      setInput(value) {
        if (this.disposed) return;
        input = { throttle: clamp(value.throttle, -1, 1), steering: clamp(value.steering, -1, 1),
          brake: clamp(value.brake, 0, 1), handbrake: !!value.handbrake };
        if (input.throttle || input.steering) body.wakeUp();
      },
      park() { input = { throttle: 0, steering: 0, brake: 1, handbrake: true }; },
      reset(at = spawn, rotation = orientation) {
        if (this.disposed || !at.toArray().every(value => Number.isFinite(value) && Math.abs(value) <= 1e6)
          || !rotation.toArray().every(Number.isFinite) || !Number.isFinite(rotation.lengthSq()) || rotation.lengthSq() < 1e-8) return;
        body.setTranslation(at, true); body.setRotation(rotation.clone().normalize(), true);
        body.setLinvel(ZERO, true); body.setAngvel(ZERO, true); body.resetForces(true); body.resetTorques(true);
        steering = 0; this.park(); world.propagateModifiedBodyPositionsToColliders(); this.sync();
      },
      preStep(dt) {
        const velocity = body.linvel();
        quaternion.copy(body.rotation());
        forward.set(0, 0, 1).applyQuaternion(quaternion);
        speed = forward.dot(new THREE.Vector3(velocity.x, velocity.y, velocity.z));
        const desiredSteering = input.steering * config.maxSteeringAngle / (1 + Math.abs(speed) / 16);
        steering += THREE.MathUtils.clamp(desiredSteering - steering, -2.6 * dt, 2.6 * dt);
        const changingDirection = input.throttle * speed < -.4;
        const limitReached = input.throttle > 0 ? speed >= config.maxForwardSpeed : speed <= -config.maxReverseSpeed;
        const powered = wheelConfigs.filter((wheel, index) => wheel.powered ?? index >= 2).length || 1;
        const throttle = changingDirection || limitReached || input.brake > .05 || input.handbrake ? 0 : input.throttle;
        for (let index = 0; index < 4; index++) {
          const wheel = wheelConfigs[index];
          raycast.setWheelSteering(index, (wheel.steered ?? index < 2) ? steering : 0);
          raycast.setWheelEngineForce(index, (wheel.powered ?? index >= 2) ? throttle * config.engineForce / powered : 0);
          const brake = Math.max(input.brake, changingDirection ? .8 : 0, input.handbrake && index >= 2 ? 1 : 0);
          raycast.setWheelBrake(index, (config.brakeForce * brake / 4 + (Math.abs(throttle) < .01 ? 75 : 0)) * dt);
        }
        // Aerodynamic drag is an ordinary force, not a translation or speed clamp.
        body.resetForces(false);
        force.set(velocity.x, velocity.y, velocity.z).multiplyScalar(-.4 * Math.hypot(velocity.x, velocity.z));
        force.y = 0; body.addForce(force, false);
        raycast.updateVehicle(dt, RAPIER.QueryFilterFlags.EXCLUDE_SENSORS, undefined,
          collider => collider.handle !== playerCollider.handle && collider.parent()?.handle !== body.handle);
      },
      sync() {
        position.copy(body.translation()); quaternion.copy(body.rotation());
        forward.set(0, 0, 1).applyQuaternion(quaternion);
        const velocity = body.linvel(); speed = forward.dot(new THREE.Vector3(velocity.x, velocity.y, velocity.z));
        for (let index = 0; index < 4; index++) {
          const wheel = wheels[index];
          wheel.suspensionLength = raycast.wheelSuspensionLength(index) ?? config.suspensionRestLength;
          wheel.rotation = raycast.wheelRotation(index) ?? 0;
          wheel.steering = raycast.wheelSteering(index) ?? 0;
          wheel.grounded = raycast.wheelIsInContact(index);
          direction.set(0, -1, 0).applyQuaternion(quaternion);
          wheel.position.copy(wheelConfigs[index].connection).applyQuaternion(quaternion).add(position).addScaledVector(direction, wheel.suspensionLength);
          wheelSteer.setFromAxisAngle(new THREE.Vector3(0, 1, 0), wheel.steering);
          wheelRoll.setFromAxisAngle(new THREE.Vector3(1, 0, 0), wheel.rotation);
          wheel.quaternion.copy(quaternion).multiply(wheelSteer).multiply(wheelRoll);
        }
      },
      dispose() { if (!this.disposed) remove(options.id); },
    };
    vehicles.set(options.id, vehicle); vehicle.sync();
    return vehicle;
  };
  return {
    add, remove, get: (id: string): VehiclePhysics | undefined => vehicles.get(id),
    bodyFor: (id: string) => vehicles.get(id)?.body,
    beforeStep(dt: number) { for (const vehicle of vehicles.values()) vehicle.preStep(dt); },
    afterStep() { for (const vehicle of vehicles.values()) vehicle.sync(); },
    seatPosition(id: string, target: THREE.Vector3) {
      const vehicle = vehicles.get(id);
      return vehicle ? target.copy(vehicle.config.seatPosition).applyQuaternion(vehicle.quaternion).add(vehicle.position) : undefined;
    },
    dispose() { if (disposed) return; for (const id of [...vehicles.keys()]) remove(id); disposed = true; },
  };
}
