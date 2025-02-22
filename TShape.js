import * as THREE from 'three';

// All position sets for the TShape
const POSITION_SETS = {
  center: [
    [0, 0, 0],   // Center
    [1, 0, 0],   // Right
    [-1, 0, 0],  // Left
    [0, 0, -1]   // Top
  ],
  top: [
    [0, 0, 1],   // Center
    [1, 0, 1],   // Right
    [-1, 0, 1],  // Left
    [0, 0, 0]    // Top at base level
  ],
  left: [
    [1, 0, 0],   // Center relative to left pivot
    [2, 0, 0],   // Right
    [0, 0, 0],   // Left (pivot)
    [1, 0, -1]   // Top
  ],
  right: [
    [-1, 0, 0],  // Center relative to right pivot
    [0, 0, 0],   // Right (pivot)
    [-2, 0, 0],  // Left
    [-1, 0, -1]  // Top
  ]
};

export default class TShape extends THREE.Group {
  constructor(material) {
    super();
    this.name = "TShape";
    this.material = material;
    this.castShadow = true;  // Enable shadow casting for the entire group
    this.receiveShadow = true;  // Enable shadow receiving
    // Use the 'center' set as the initial positions for the boxes.
    POSITION_SETS.center.forEach(pos => {
      this.add(this.createBoxWithEdges(pos, material));
    });
  }

  /**
   * Creates a box mesh with edge lines at the given position.
   */
  createBoxWithEdges(pos, material) {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const box = new THREE.Mesh(geometry, material);
    box.position.set(...pos);
    box.name = "Tshape Box";
    box.tshape = this;
    box.castShadow = true;  // Enable shadow casting for each box
    box.receiveShadow = true;  // Enable shadow receiving
    // Create and add edges to the box.
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(geometry),
      new THREE.LineBasicMaterial({ color: 0x000000 })
    );
    edges.tshape = this;
    edges.raycast = () => {};
    box.add(edges);
    
    return box;
  }

  /**
   * Updates block positions by selecting a position set based on the blocks' rounded y values.
   */
  updateBlockPositions() {
    // Ensure all transformations are updated.
    this.updateMatrixWorld(true);

    // Helper: get the rounded y value for the child at the given index.
    const getRoundedY = index => {
      const pos = new THREE.Vector3();
      this.children[index].getWorldPosition(pos);
      return Math.round(pos.y);
    };

    const centerY = getRoundedY(0);
    const topY    = getRoundedY(3);
    const rightY  = getRoundedY(1);
    const leftY   = getRoundedY(2);

    // Select the appropriate position set.
    let positions;
    if (topY < centerY) {
      positions = POSITION_SETS.top;
    } else if (leftY < centerY) {
      positions = POSITION_SETS.left;
    } else if (rightY < centerY) {
      positions = POSITION_SETS.right;
    } else {
      positions = POSITION_SETS.center;
    }

    // Update each child's local position.
    this.children.forEach((child, i) => {
      child.position.set(...positions[i]);
    });

    // Update matrices again to apply the changes.
    this.updateMatrixWorld(true);
  }

  getOccupiedCells() {
    return this.children.map(child => {
      const pos = new THREE.Vector3();
      child.getWorldPosition(pos);
      return {
        x: Math.round(pos.x),
        y: Math.round(pos.y),
        z: Math.round(pos.z)
      };
    });
  }

  /**
   * Helper to traverse the shape and set the emissive color.
   */
  setEmissiveColor(color) {
    this.traverse(child => {
      if (child instanceof THREE.Mesh && child.material && 'emissive' in child.material) {
        child.material.emissive.set(color);
      }
    });
  }

  onHoverEnter() {
    this.setEmissiveColor(0x555555);
  }

  onHoverExit() {
    this.setEmissiveColor(0x000000);
  }

  highlight() {
    this.setEmissiveColor(0xffff00);
  }

  removeHighlight() {
    this.setEmissiveColor(0x000000);
  }
}
