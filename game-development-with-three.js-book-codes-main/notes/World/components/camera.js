import { PerspectiveCamera } from 'three'

const createCamera = () => {
  const camera = new PerspectiveCamera(35, 1, 0.1, 100);

  camera.position.z = 10;

  return camera;
}

export { createCamera };