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
      // Create the box mesh
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const box = new THREE.Mesh(geometry, material);
      box.position.set(...pos);
      box.name = "Tshape Box";
      box.tshape = this;
      
      // Create edges geometry for the box
      const edgesGeometry = new THREE.EdgesGeometry(geometry);
      const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
      const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
      edges.tshape = this;
      
      // Add the edges as a child of the box so that they follow its transform
      box.add(edges);
      
      // Add the box (with its edges) to the TShape group
      this.add(box);
    });
  }
}
