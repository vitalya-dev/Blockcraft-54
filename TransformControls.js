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
    // Create properly oriented rings for each axis
    this.createAxisRing('x', 0xff0000); // Red X-axis ring (YZ plane)
    this.createAxisRing('y', 0x00ff00); // Green Y-axis ring (XZ plane)
    this.createAxisRing('z', 0x0000ff); // Blue Z-axis ring (XY plane)
  }

  createAxisRing(axis, color) {
    const ringGeometry = new THREE.CircleGeometry(this.axisSize, 32);
    
    // Orient the geometry based on axis
    switch(axis) {
      case 'x':
        // Rotate to YZ plane (perpendicular to X-axis)
        ringGeometry.rotateY(Math.PI/2);
        break;
      case 'y':
        // Rotate to XZ plane (perpendicular to Y-axis)
        ringGeometry.rotateX(Math.PI/2);
        break;
      case 'z':
        break;
      // Z-axis remains in XY plane by default
    }

    // Visible ring
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: color,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5
    });
    
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.userData.axis = axis;
    
    // Invisible picker geometry
    const pickerGeometry = new THREE.RingGeometry(
      this.axisSize - 0.1, 
      this.axisSize + 0.1, 
      32
    );
    const pickerMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.0
    });
    
    // Apply same orientation to picker
    pickerGeometry.copy(ringGeometry);
    const picker = new THREE.Mesh(pickerGeometry, pickerMaterial);
    picker.userData.axis = axis;
    
    this.add(ring);
    this.add(picker);
  }

  // Updated rotation handling with proper axis alignment
  handleMouseMove(event, camera) {
    if (!this.rotateActive || !this.targetObject) return;

    const sensitivity = 0.02;
    const deltaX = event.movementX * sensitivity;
    const deltaY = event.movementY * sensitivity;

    switch(this.selectedAxis) {
      case 'x':
        this.targetObject.rotateX(deltaY); // Local X-axis
        break;
      case 'y':
        this.targetObject.rotateY(deltaX); // Local Y-axis
        break;
      case 'z':
        this.targetObject.rotateZ(deltaY); // Local Z-axis
        break;
    }
  }

  // Keep other methods the same
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