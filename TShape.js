import * as THREE from 'three';

export default class TShape extends THREE.Group {
  constructor(material) {
    super();
    this.name = "TShape";
    this.material = material;
    this.isSelected = false;
    const positions = [
      [0, 0, 0],  // Center
      [1, 0, 0],  // Right
      [-1, 0, 0], // Left
      [0, 0, -1]   // Top
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
      edges.raycast = () => {};
      
      // Add the edges as a child of the box so that they follow its transform
      box.add(edges);
      
      // Add the box (with its edges) to the TShape group
      this.add(box);
    });
  }

  getOccupiedCells() {
    const cells = [];
    // For each child (box) of the group, determine its world position.
    this.children.forEach(child => {
      const worldPos = new THREE.Vector3();
      child.getWorldPosition(worldPos);
      // Because our shapes snap by one, round the world coordinates.
      const gridX = Math.round(worldPos.x);
      const gridY = Math.round(worldPos.y);
      const gridZ = Math.round(worldPos.z);
      cells.push({ x: gridX, y: gridY, z: gridZ });
    });
    return cells;
  }


  // Method to handle selection and toggle transform modes
  onSelect() {
    //TODO
  }

  
  // Optional: You could add a deselection method if needed.
  onDeselect() {

  }

  onHoverEnter() {
    this.traverse(child => {
      if (child instanceof THREE.Mesh) {
        // If the material supports an emissive property, use it for the hover effect.
        if (child.material && 'emissive' in child.material) {
          child.material.emissive.set(0x555555);
        }
      }
    });
  }

  /**
   * Call this method to remove the hover effect from the TShape.
   * For example, this can be triggered when the pointer leaves the object.
   */
  onHoverExit() {
    this.traverse(child => {
      if (child instanceof THREE.Mesh) {
        if (child.material && 'emissive' in child.material) {
          // Reset the emissive color (assuming the original emissive is black).
          child.material.emissive.set(0x000000);
        }
      }
    });
  }

  // ------------------ Selection Highlight Methods ------------------

  /**
   * Call this method when the TShape is selected to highlight it.
   * In this example, we set the emissive color to yellow.
   */
  highlightSelected() {
    this.traverse(child => {
      if (child instanceof THREE.Mesh) {
        if (child.material && 'emissive' in child.material) {
          child.material.emissive.set(0xffff00); // Yellow highlight
        }
      }
    });
  }

  /**
   * Call this method when the TShape is deselected to remove the highlight.
   * This resets the emissive color back to the original value (black).
   */
  removeHighlight() {
    this.traverse(child => {
      if (child instanceof THREE.Mesh) {
        if (child.material && 'emissive' in child.material) {
          child.material.emissive.set(0x000000); // Reset emissive
        }
      }
    });
  }
}
