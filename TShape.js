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

  updateBlockPositions() {
    // Ensure all transformations are applied before getting world positions
    this.updateMatrixWorld(true);

    // Retrieve the four blocks by their indices:
    // children[0] = center, children[1] = right, children[2] = left, children[3] = top.
    const center = this.children[0];
    const right  = this.children[1];
    const left   = this.children[2];
    const top    = this.children[3];

    // Get world positions for each block.
    const centerWorldPos = new THREE.Vector3();
    const topWorldPos    = new THREE.Vector3();
    const leftWorldPos   = new THREE.Vector3();
    const rightWorldPos  = new THREE.Vector3();

    center.getWorldPosition(centerWorldPos);
    top.getWorldPosition(topWorldPos);
    left.getWorldPosition(leftWorldPos);
    right.getWorldPosition(rightWorldPos);

    // Round the y coordinates for comparison.
    const centerY = Math.round(centerWorldPos.y);
    const topY    = Math.round(topWorldPos.y);
    const leftY   = Math.round(leftWorldPos.y);
    const rightY  = Math.round(rightWorldPos.y);

    // Default orientation (pivot is center)
    const positions_1 = [
      [0, 0, 0],   // Center
      [1, 0, 0],   // Right
      [-1, 0, 0],  // Left
      [0, 0, -1]   // Top
    ];

    // Case when the top block is lower than the center.
    const positions_2 = [
      [0, 0, 1],   // Center
      [1, 0, 1],   // Right
      [-1, 0, 1],  // Left
      [0, 0, 0]    // Top (now at base level)
    ];

    // New case: left block as pivot.
    const positions_3 = [
      [1, 0, 0],   // Center relative to left pivot
      [2, 0, 0],   // Right
      [0, 0, 0],   // Left (pivot)
      [1, 0, -1]   // Top
    ];

    // New case: right block as pivot.
    const positions_4 = [
      [-1, 0, 0],  // Center relative to right pivot
      [0, 0, 0],   // Right (pivot)
      [-2, 0, 0],  // Left
      [-1, 0, -1]  // Top
    ];

    // Choose which position set to use based on the rounded y values.
    // The logic checks if any of the non-center blocks are lower than the center.
    let positions;
    if (topY < centerY) {
      positions = positions_2;
    } else if (leftY < centerY) {
      positions = positions_3;
    } else if (rightY < centerY) {
      positions = positions_4;
    } else {
      positions = positions_1;
    }

    // Update each child's local position.
    this.children.forEach((child, i) => {
      child.position.set(...positions[i]);
    });

    // Update matrices again to reflect new positions.
    this.updateMatrixWorld(true);
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
  highlight() {
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
