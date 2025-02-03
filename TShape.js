import * as THREE from 'three';

export default class TShape extends THREE.Group {
  constructor(material) {
    super();
    this.name = "TShape";
    this.material = material;
    const positions = [
      [0, 0, 0],  // Center
      [1, 0, 0],  // Right
      [-1, 0, 0], // Left
      [0, 1, 0]   // Top
    ];
    
    positions.forEach(pos => {
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const box = new THREE.Mesh(geometry, material);
      box.position.set(...pos);
      box.name = "Tshape Box"
      this.add(box);
    });
  }
}