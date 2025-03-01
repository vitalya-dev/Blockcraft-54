import * as THREE from 'three';

import { MapControls } from 'three/addons/controls/MapControls.js'; // Import MapControls

class SelectionController extends THREE.EventDispatcher {
  /**
   * @param {THREE.Camera} camera - The scene camera.
   * @param {THREE.Scene} scene - The Three.js scene.
   * @param {THREE.WebGLRenderer} renderer - The renderer.
   * @param {Array<THREE.Object3D>} selectableObjects - The TShape objects that can be selected.
   */
  constructor(camera, scene, renderer, selectableObjects) {
    super();
    this.camera = camera;
    this.scene = scene;
    this.renderer = renderer;
    this.selectableObjects = selectableObjects;
    this.selected = null;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.offset = new THREE.Vector3(); // Initialize offset

    // Create an invisible ground plane for raycasting.
    // (This plane must be large enough to cover the grid area.)
    this.groundPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    // Rotate so the plane is horizontal (parallel to XZ).
    this.groundPlane.rotation.x = -Math.PI / 2;
    this.scene.add(this.groundPlane);

    // Instantiate MapControls inside SelectionController.
    this.mapControls = new MapControls(camera, renderer.domElement);
    this.mapControls.enableRotate = true; // Customize as needed.
    this.mapControls.maxPolarAngle = THREE.MathUtils.degToRad(35);
    this.mapControls.minAzimuthAngle = THREE.MathUtils.degToRad(-45);
    this.mapControls.maxAzimuthAngle = THREE.MathUtils.degToRad(45);
    // Forward map controls changes to a common "change" event.
    this.mapControls.addEventListener('change', () => this.dispatchEvent({ type: 'change' }));

    // Bind event listeners.
    this.renderer.domElement.addEventListener('mousedown', this.onMouseDown.bind(this), false);
    this.renderer.domElement.addEventListener('mousemove', this.onMouseMove.bind(this), false);
    this.renderer.domElement.addEventListener('wheel', this.onWheel.bind(this), false);
    this.renderer.domElement.addEventListener('contextmenu', (e) => e.preventDefault(), false);
  }

  onMouseDown(event) {
    event.preventDefault();
    this.mapControls.enabled = false;

    switch (event.button) {
      case 0: // Left Mouse Button
        if (!this.selected) {
          this.handleObjectSelection(event);
        } else {
          this.handleObjectPlacement();
        }
        break;

      case 2: // Right Mouse Button
        this.handleObjectRotation();
        break;

      default:
        // Optional: handle other buttons
        break;
    }

    this.updateControlsState();
    this.dispatchEvent({ type: 'change' });
  }

  onMouseMove(event) {
    event.preventDefault();
    if (!this.selected) return;

    // Exclude the selected object from the intersection test.
    const objectsToTest = [
      this.groundPlane,
      ...this.selectableObjects.filter(obj => obj !== this.selected)
    ];

    // Get intersections from the mouse ray.
    const intersects = this.getIntersects(event, objectsToTest);
    if (intersects.length > 0) {
      const intersect = intersects[0];
      const newPosition = intersect.point.clone();

      // Use the intersected face's normal (transformed to world space)
      // to lift the object. (For the ground plane, this normal is usually (0,1,0).)
      if (intersect.face) {
        const worldNormal = intersect.face.normal.clone().transformDirection(intersect.object.matrixWorld);
        const minUpwardAngle = 0.9; // ~25 degrees from vertical (0.9 = cos(25°))
        // Only proceed if surface is mostly upward-facing
        if (worldNormal.y < minUpwardAngle) return;
        const halfHeight = 0.5; // TShape height = 1 unit, pivot at center
        newPosition.add(worldNormal.multiplyScalar(halfHeight)); // Add halfHeight offset
      }
      // Optional: Snap to whole-number positions.
      newPosition.x = Math.round(newPosition.x);
      //newPosition.y = Math.round(newPosition.y);
      newPosition.z = Math.round(newPosition.z);

      this.selected.position.copy(newPosition);
      this.dispatchEvent({ type: 'change' });
    }
  }

  onWheel(event) {
    event.preventDefault();
    if (!this.selected) return;

    const angleStep = Math.PI / 2; // 90° in radians.
    // Determine direction: scroll up (negative deltaY) rotates one way, down (positive) the other.
    const delta = event.deltaY > 0 ? 1 : -1;
    
    // Update rotation along x-axis.
    this.selected.rotation.x += delta * angleStep;
    
    // Snap to the nearest multiple of 90°.
    this.selected.rotation.x = Math.round(this.selected.rotation.x / angleStep) * angleStep;
    this.selected.updateBlockPositions();
    this.dispatchEvent({ type: 'change' });
  }


  getIntersects(event, objects) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);
    return this.raycaster.intersectObjects(objects, true);
  }

  // Helper: given an object from a raycast, see if it is (or is a child of) one of our selectable TShapes.
  findSelectable(object) {
    for (let selectable of this.selectableObjects) {
      if (
        object === selectable ||
        selectable.children.includes(object) ||
        object.parent === selectable
      ) {
        return selectable;
      }
    }
    return null;
  }

  // Helper methods
  handleObjectSelection(event) {
    const intersects = this.getIntersects(event, this.selectableObjects);
    const selectedObject = intersects.length > 0 
      ? this.findSelectable(intersects[0].object)
      : null;

    if (selectedObject) {
      this.selected = selectedObject;
      this.selected.highlight();
    }
  }

  handleObjectPlacement() {
    if (!this.hasCollisions()) {
      this.selected.removeHighlight();
      this.selected = null;
    }
  }

  handleObjectRotation() {
    if (!this.selected) return;
    
    const angleStep = Math.PI / 2;
    this.selected.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), -angleStep);
  }

  hasCollisions() {
    return this.selectableObjects.some(shape => 
      shape !== this.selected && this.selected.collidesWith(shape)
    );
  }

  updateControlsState() {
    this.mapControls.enabled = !this.selected;
  }

}

export default SelectionController;
