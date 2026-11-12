import { Euler, MathUtils, PerspectiveCamera, Vector3 } from 'three';

export const eyeHeight = 1.64;

type Clearance = (from: Vector3, desired: Vector3) => Vector3;

export function createTourCamera(camera: PerspectiveCamera) {
  const pivot = new Vector3();
  const desired = new Vector3();
  const aim = new Vector3();
  const arm = new Vector3();
  const viewRotation = new Euler(0, 0, 0, 'YXZ');
  let distance = 0;

  return function follow(
    feet: Vector3, yaw: number, pitch: number, flying: boolean, firstPerson: boolean,
    dt: number, snap: boolean, clearance?: Clearance,
  ) {
    let showAvatar = false;
    if (!firstPerson) {
      const headingX = Math.sin(yaw);
      const headingZ = Math.cos(yaw);
      const offset = flying ? 3.35 : 2.83;
      const tilt = MathUtils.clamp(pitch, -1.18, .85);
      const horizontal = offset * Math.cos(tilt);
      pivot.copy(feet);
      pivot.y += 1.08;
      desired.set(
        pivot.x + horizontal * headingX + .32 * headingZ,
        Math.max(feet.y + .54, pivot.y + (flying ? .82 : .54) - offset * Math.sin(tilt)),
        pivot.z + horizontal * headingZ - .32 * headingX,
      );
      const available = pivot.distanceTo(clearance ? clearance(pivot, desired) : desired);
      showAvatar = available >= 1.12;
      // Pull in immediately at walls and ease back once the space opens up.
      if (snap || !distance || !showAvatar) distance = available;
      else distance = Math.min(available, MathUtils.damp(distance, available, 8, dt));
      if (showAvatar) {
        camera.position.copy(pivot).addScaledVector(arm.subVectors(desired, pivot).normalize(), distance);
        aim.set(
          pivot.x - .90 * headingX,
          pivot.y + (flying ? .10 : -.12) + 1.37 * Math.sin(tilt),
          pivot.z - .90 * headingZ,
        );
        camera.lookAt(aim);
      }
    }
    if (!showAvatar) {
      distance = 0;
      camera.position.copy(feet);
      camera.position.y += eyeHeight;
      camera.quaternion.setFromEuler(viewRotation.set(pitch, yaw, 0));
    }
    return showAvatar;
  };
}
