import * as THREE from 'three';

export default class TransformControls extends THREE.Group {
  constructor() {
    super();
    this.axisSize = 2;
    this.selectedAxis = null;
    this.rotateActive = false;
    this.targetObject = null;
    this.createGizmos();
  }

  createGizmos() {
    this.createAxisRing('x', 0xff0000); // Red X-axis ring (YZ plane)
    this.createAxisRing('y', 0x00ff00); // Green Y-axis ring (XZ plane)
    this.createAxisRing('z', 0x0000ff); // Blue Z-axis ring (XY plane)
  }

  createAxisRing(axis, color) {
    // Create a single ring geometry with thickness
    const ringGeometry = new THREE.RingGeometry(
      this.axisSize - 0.1,  // Inner radius
      this.axisSize + 0.1,  // Outer radius
      32                    // Segments
    );

    // Orient the geometry based on axis
    switch(axis) {
      case 'x':
        ringGeometry.rotateY(Math.PI/2); // YZ plane
        break;
      case 'y':
        ringGeometry.rotateX(Math.PI/2); // XZ plane
        break;
      // Z-axis remains in XY plane by default
    }

    const ringMaterial = new THREE.MeshBasicMaterial({
      color: color,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5
    });

    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.userData.axis = axis;
    this.add(ring);
  }

  // Keep the rest of the methods unchanged
  handleMouseMove(event, camera) {
    if (!this.rotateActive || !this.targetObject) return;

    const sensitivity = 0.02;
    const deltaX = event.movementX * sensitivity;
    const deltaY = event.movementY * sensitivity;

    switch(this.selectedAxis) {
      case 'x':
        this.targetObject.rotateX(deltaY);
        break;
      case 'y':
        this.targetObject.rotateY(deltaX);
        break;
      case 'z':
        this.targetObject.rotateZ(deltaY);
        break;
    }
  }

  attach(object) {
    this.targetObject = object;
    this.visible = true;
    this.position.copy(object.position);
    this.rotation.copy(object.rotation);
    this.updateMatrixWorld();
  }

  detach() {
    this.targetObject = null;
    this.visible = false;
  }

  handleMouseDown(intersect) {
    if (intersect && intersect.object.userData.axis) {
      this.selectedAxis = intersect.object.userData.axis;
      this.rotateActive = true;
      return true;
    }
    return false;
  }

  handleMouseUp() {
    this.rotateActive = false;
    this.selectedAxis = null;
  }
}