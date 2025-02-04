import * as THREE from 'three';

export default class TransformControls extends THREE.Group {
  constructor() {
    super();
    this.axisSize = 2;
    this.selectedAxis = null;
    this.rotateActive = false;
    this.targetObject = null;
    this.accumulatedDelta = 0; // Track accumulated rotation delta for snapping
    this.createGizmos();
  }

  createGizmos() {
    this.createAxisRing('x', 0xff0000);
    this.createAxisRing('y', 0x00ff00);
    this.createAxisRing('z', 0x0000ff);
  }

  createAxisRing(axis, color) {
    const ringGeometry = new THREE.RingGeometry(
      this.axisSize - 0.1,
      this.axisSize + 0.1,
      32
    );

    switch(axis) {
      case 'x':
        ringGeometry.rotateY(Math.PI/2);
        break;
      case 'y':
        ringGeometry.rotateX(Math.PI/2);
        break;
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

  handleMouseMove(event, camera) {
    if (!this.rotateActive || !this.targetObject) return;

    const sensitivity = 0.02;
    const snapThreshold = Math.PI/4; // 45 degrees threshold for snapping
    const snapStep = Math.PI/2;      // Snap in 90-degree increments

    let deltaAngle = 0;

    // Determine delta based on selected axis
    switch(this.selectedAxis) {
      case 'x':
        deltaAngle = event.movementY * sensitivity;
        break;
      case 'y':
        deltaAngle = event.movementX * sensitivity;
        break;
      case 'z':
        deltaAngle = event.movementY * sensitivity;
        break;
      default:
        return;
    }

    this.accumulatedDelta += deltaAngle;

    let steps = 0;

    // Apply positive snap if accumulated delta exceeds threshold
    while (this.accumulatedDelta >= snapThreshold) {
      steps += 1;
      this.accumulatedDelta -= snapStep;
    }

    // Apply negative snap if accumulated delta is below negative threshold
    while (this.accumulatedDelta <= -snapThreshold) {
      steps -= 1;
      this.accumulatedDelta += snapStep;
    }

    // If steps are needed, apply the snapped rotation
    if (steps !== 0) {
      const rotationAmount = steps * snapStep;
      switch(this.selectedAxis) {
        case 'x':
          this.targetObject.rotateX(rotationAmount);
          break;
        case 'y':
          this.targetObject.rotateY(rotationAmount);
          break;
        case 'z':
          this.targetObject.rotateZ(rotationAmount);
          break;
      }
    }
  }

  // The rest of the methods remain unchanged
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
      this.accumulatedDelta = 0; // Reset accumulated delta on mouse down
      return true;
    }
    return false;
  }

  handleMouseUp() {
    this.rotateActive = false;
    this.selectedAxis = null;
  }
}