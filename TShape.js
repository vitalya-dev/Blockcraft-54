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

// Shared border texture
const BORDER_TEXTURE = (() => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  // White base with black border
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, 512, 512);
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 32;
  ctx.strokeRect(16, 16, 480, 480);
  
  return new THREE.CanvasTexture(canvas);
})();

export default class TShape extends THREE.Group {
  constructor(baseColor) {
    super();
    this.name = "TShape";
    this.castShadow = true;
    this.receiveShadow = true;

    // Create shared material with base color
    this.material = new THREE.MeshPhongMaterial({
      color: baseColor,
      map: BORDER_TEXTURE,
      emissive: 0x000000,
      specular: 0x111111,
      shininess: 30
    });

    POSITION_SETS.center.forEach(pos => {
      this.add(this.createBox(pos));
    });
  }

  createBox(pos) {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const box = new THREE.Mesh(geometry, this.material);
    box.position.set(...pos);
    box.name = "Tshape Box";
    box.tshape = this;
    box.castShadow = true;
    box.receiveShadow = true;
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
      return Math.round(pos.y * 2) / 2;
    };

    const centerY = getRoundedY(0);
    const topY = getRoundedY(3);
    const rightY = getRoundedY(1);
    const leftY = getRoundedY(2);

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
      child.updateMatrixWorld(true);
      child.getWorldPosition(pos);
      return {
        x: Math.round(pos.x),
        y: parseFloat(pos.y.toFixed(1)),
        z: Math.round(pos.z)
      };
    });
  }

  collidesWith(otherTShape) {
    // Ensure that both shapes have updated their positions
    this.updateMatrixWorld(true);
    otherTShape.updateMatrixWorld(true);

    const myCells = this.getOccupiedCells();
    const otherCells = otherTShape.getOccupiedCells();

    // Check if any cell in this shape overlaps with a cell in the other shape
    for (let i = 0; i < myCells.length; i++) {
      for (let j = 0; j < otherCells.length; j++) {
        if (
          myCells[i].x === otherCells[j].x &&
          myCells[i].y === otherCells[j].y &&
          myCells[i].z === otherCells[j].z
        ) {
          return true;
        }
      }
    }
    return false;
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
    this.setEmissiveColor(0xCCCC00);
  }

  removeHighlight() {
    this.setEmissiveColor(0x000000);
  }
}
