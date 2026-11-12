import { Quaternion, Vector2, Vector3 } from 'three';

type Orientation = { x: number; y: number; z: number; w: number };
type InputSource = {
  handedness: XRHandedness;
  gamepad?: Pick<Gamepad, 'axes' | 'mapping'> | null;
};

const vertical = new Vector3(0, 1, 0);
const stickDeadZone = .18;

function activeStick(sources: Iterable<InputSource>, stick: Vector2) {
  stick.set(0, 0);
  for (const source of sources) {
    const gamepad = source.gamepad;
    if (!gamepad || gamepad.axes.length < 2) continue;
    // xr-standard reserves axes 0/1 for the touchpad and 2/3 for the
    // primary thumbstick. Extra device-specific axes may follow.
    const first = gamepad.mapping === 'xr-standard' && gamepad.axes.length >= 4 ? 2 : 0;
    const x = gamepad.axes[first], y = gamepad.axes[first + 1];
    if (!Number.isFinite(x) || !Number.isFinite(y) || Math.hypot(x, y) < stickDeadZone) continue;
    if (source.handedness === 'left') return stick.set(x, y);
    if (stick.lengthSq() === 0) stick.set(x, y);
  }
  return stick;
}

export function createXrLocomotion() {
  const poseRotation = new Quaternion();
  const forward = new Vector3();
  const right = new Vector3();
  const stick = new Vector2();

  return (orientation: Orientation, rigYaw: number, sources: Iterable<InputSource>, movement: Vector3) => {
    const { x, y, z, w } = orientation;
    poseRotation.set(x, y, z, w);
    // The native viewer pose is in tracking space. Rendering also applies the
    // rig's heading, which is absent from Three's unparented XR ArrayCamera.
    forward.set(0, 0, -1).applyQuaternion(poseRotation).applyAxisAngle(vertical, rigYaw);
    forward.y = 0;
    if (forward.lengthSq() < .0001) forward.set(-Math.sin(rigYaw), 0, -Math.cos(rigYaw));
    forward.normalize();
    right.crossVectors(forward, vertical);
    activeStick(sources, stick);
    return movement.copy(right).multiplyScalar(stick.x).addScaledVector(forward, -stick.y).clampLength(0, 1);
  };
}
