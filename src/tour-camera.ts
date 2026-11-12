import { Euler, type PerspectiveCamera, type Vector3 } from 'three';

export const eyeHeight = 1.64;

export function createTourCamera(camera: PerspectiveCamera) {
  const rotation = new Euler(0, 0, 0, 'YXZ');
  return (feet: Vector3, yaw: number, pitch: number) => {
    camera.position.copy(feet);
    camera.position.y += eyeHeight;
    camera.quaternion.setFromEuler(rotation.set(pitch, yaw, 0));
  };
}
