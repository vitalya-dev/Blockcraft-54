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
    this.mapControls.enableRotate = false; // Customize as needed.
    // Forward map controls changes to a common "change" event.
    this.mapControls.addEventListener('change', () => this.dispatchEvent({ type: 'change' }));

    // Bind event listeners.
    this.renderer.domElement.addEventListener('mousedown', this.onMouseDown.bind(this), false);
    this.renderer.domElement.addEventListener('mousemove', this.onMouseMove.bind(this), false);
    this.renderer.domElement.addEventListener('wheel', this.onWheel.bind(this), false);
    this.renderer.domElement.addEventListener('contextmenu', (e) => e.preventDefault(), false);
  }

  // Helper: update mouse coordinates and raycaster, then return intersections with provided objects.
  getIntersects(event, objects) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);
    return this.raycaster.intersectObjects(objects, true);
  }

  // Helper: get intersection with the ground plane.
  getPlaneIntersection(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObject(this.groundPlane);
    return intersects.length > 0 ? intersects[0] : null;
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

  // Toggle selection on mouse down.
  onMouseDown(event) {
    event.preventDefault();
    this.mapControls.enabled = false;

    // Right mouse button rotates the selected object around its y-axis.
    if (event.button === 2) { // RMB
      if (this.selected) {
        const angleStep = Math.PI / 2; // 90° in radians.
        // Snap to the nearest multiple of 90°.
        this.selected.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), -angleStep);
        //this.selected.rotation.y = Math.round(this.selected.rotation.y / angleStep) * angleStep;
        this.dispatchEvent({ type: 'change' });
      }
    } else {
       // Left mouse button (LMB) handling:
      if (!this.selected) {
        // No object selected – try to select one.
        const intersects = this.getIntersects(event, this.selectableObjects);
        const selectableUnderMouse = intersects.length > 0 ? this.findSelectable(intersects[0].object) : null;
        if (selectableUnderMouse) {
          this.selected = selectableUnderMouse;
          this.selected.highlight();
          this.dispatchEvent({ type: 'change' });
        }
      } else {
        // An object is already selected – "place" it.
        // Use a similar approach as onMouseMove to compute its new position.
        const objectsToTest = [
          this.groundPlane,
          ...this.selectableObjects.filter(obj => obj !== this.selected)
        ];
        const intersects = this.getIntersects(event, objectsToTest);
        if (intersects.length > 0) {
          const intersect = intersects[0];
          const newPosition = intersect.point.clone();

          // If the intersected face exists, add its normal (transformed to world space)
          // to the intersection point.
          if (intersect.face) {
            const worldNormal = intersect.face.normal.clone().transformDirection(intersect.object.matrixWorld);
            newPosition.add(worldNormal);
          }

          // Optional: Snap to whole-number positions.
          newPosition.x = Math.round(newPosition.x);
          newPosition.y = Math.round(newPosition.y);
          newPosition.z = Math.round(newPosition.z);
          this.selected.position.copy(newPosition);
        }
        // Deselect the object after placing it.
        this.selected.removeHighlight();
        this.selected = null;

        this.dispatchEvent({ type: 'change' });
      }
    }
    if (!this.selected) {
      this.mapControls.enabled = true;
    }
  }

    // While moving the mouse, if an object is selected, update its position.
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
        newPosition.add(worldNormal);
      }


      // Optional: Snap to whole-number positions.
      newPosition.x = Math.round(newPosition.x);
      newPosition.y = Math.round(newPosition.y);
      newPosition.z = Math.round(newPosition.z);

      this.selected.position.copy(newPosition);
      this.dispatchEvent({ type: 'change' });
    }
  }



    // Listen for wheel events to rotate the selected object around its x-axis.
  // Rotates in 90° increments.
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
}

export default SelectionController;
