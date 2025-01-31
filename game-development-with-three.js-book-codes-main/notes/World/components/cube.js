import { BoxBufferGeometry, MeshBasicMaterial, Mesh } from 'three';

const createCube = () => {
  const geometry = new BoxBufferGeometry(2, 2, 2);
  const material = new MeshBasicMaterial({color: 0Xff0000});
  const cube = new Mesh(geometry, material);

  return cube;
}

export { createCube }