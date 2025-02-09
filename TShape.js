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

  // Method to handle selection and toggle transform modes
  onSelect(transformControls) {
    // If this TShape is already attached to the gizmo, toggle modes.
    if (transformControls.object === this) {
      if (transformControls.mode === 'translate') {
        transformControls.setMode('rotate');
        transformControls.showY = true; // Show Y-axis for rotation if needed
        console.log("Toggled to rotate mode for", this.name);
      } else {
        transformControls.setMode('translate');
        transformControls.showY = false;
        console.log("Toggled to translate mode for", this.name);
      }
    } else {
      // Attach this TShape to the transform controls in translate mode.
      transformControls.attach(this);
      transformControls.setMode('translate');
      transformControls.showY = false;
      console.log("Selected", this.name, "in translate mode");
    }
  }
  
  // Optional: You could add a deselection method if needed.
  onDeselect(transformControls) {
    if (transformControls.object === this) {
      transformControls.detach();
      console.log("Deselected", this.name);
    }
  }
}
