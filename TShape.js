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
    if (transformControls.object === this) {
      // Toggle the transform mode if this object is already selected.
      this.toggleTransformMode(transformControls);
    } else {
      // Deselect previously selected TShape if there is one.
      if (transformControls.object && typeof transformControls.object.onDeselect === 'function') {
        transformControls.object.onDeselect(transformControls);
      }
      // Attach this TShape to the transform controls in translate mode.
      transformControls.attach(this);
      transformControls.setMode('translate');
      transformControls.showY = false;
      console.log("Selected", this.name, "in translate mode");
      // Apply the selection highlight.
      this.highlightSelected();
      this.isSelected = true;
    }
  }

    // Helper method to toggle transform modes.
  toggleTransformMode(transformControls) {
    if (transformControls.mode === 'translate') {
      transformControls.setMode('rotate');
      transformControls.showY = true; // Show Y-axis for rotation if needed
      console.log(`Toggled to rotate mode for ${this.name}`);
    } else {
      transformControls.setMode('translate');
      transformControls.showY = false;
      console.log(`Toggled to translate mode for ${this.name}`);
    }
  }
  
  // Optional: You could add a deselection method if needed.
  onDeselect(transformControls) {
    if (transformControls.object === this) {
      transformControls.detach();
      console.log("Deselected", this.name);
      this.removeHighlight();
      this.isSelected = false;
    }
  }

  onHoverEnter() {
    if (this.isSelected) return;
    this.traverse(child => {
      if (child instanceof THREE.Mesh) {
        // If the material supports an emissive property, use it for the hover effect.
        if (child.material && 'emissive' in child.material) {
          child.material.emissive.set(0x555555);
        } else if (child.material && child.material.color) {
          // Fallback: Change the color slightly.
          //child.material.color.set(0xaaaaaa);
        }
      }
    });
  }

  /**
   * Call this method to remove the hover effect from the TShape.
   * For example, this can be triggered when the pointer leaves the object.
   */
  onHoverExit() {
    if (this.isSelected) return;
    this.traverse(child => {
      if (child instanceof THREE.Mesh) {
        if (child.material && 'emissive' in child.material) {
          // Reset the emissive color (assuming the original emissive is black).
          child.material.emissive.set(0x000000);
        } else if (child.material && child.material.color) {
          // Reset the color (assuming the original color is white).
          //child.material.color.set(0xffffff);
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
    console.log("highlightSelected");
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
    console.log("removeHighlight");
    this.traverse(child => {
      if (child instanceof THREE.Mesh) {
        if (child.material && 'emissive' in child.material) {
          child.material.emissive.set(0x000000); // Reset emissive
        }
      }
    });
  }
}
