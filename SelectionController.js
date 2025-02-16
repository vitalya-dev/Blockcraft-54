import * as THREE from 'three';

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
    this.offset = new THREE.Vector3();

    // Create an invisible ground plane for raycasting.
    // (This plane must be large enough to cover the grid area.)
    this.groundPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    // Rotate so the plane is horizontal (parallel to XZ).
    this.groundPlane.rotation.x = -Math.PI / 2;
    this.scene.add(this.groundPlane);

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

    // Right mouse button rotates the selected object around its y-axis.
    if (event.button === 2) { // RMB
      if (this.selected) {
        const angleStep = Math.PI / 2; // 90° in radians.
        // Snap to the nearest multiple of 90°.
        this.selected.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), -angleStep);
        //this.selected.rotation.y = Math.round(this.selected.rotation.y / angleStep) * angleStep;
        this.dispatchEvent({ type: 'change' });
      }
      return; // Skip further processing for RMB.
    }

    // For left mouse button (LMB): toggle selection.
    const intersects = this.getIntersects(event, this.selectableObjects);
    const selectableUnderMouse = intersects.length > 0 ? this.findSelectable(intersects[0].object) : null;

    if (!this.selected) {
      // No object selected – try to select one.
      if (selectableUnderMouse) {
        this.selected = selectableUnderMouse;
        this.selected.highlight();
        const planeIntersect = this.getPlaneIntersection(event);
        if (planeIntersect) {
          // Calculate offset to avoid snapping.
          this.offset.set(
            planeIntersect.point.x - this.selected.position.x,
            0,
            planeIntersect.point.z - this.selected.position.z
          );
        }
        this.dispatchEvent({ type: 'change' });
      }
    } else {
      // An object is already selected.
      if (selectableUnderMouse === this.selected) {
        // Clicking the same object releases the selection.
        this.selected.removeHighlight();
        this.selected = null;
        this.dispatchEvent({ type: 'change' });
      } else if (selectableUnderMouse && selectableUnderMouse !== this.selected) {
        // Clicking a different selectable: switch selection.
        this.selected.removeHighlight();
        this.selected = selectableUnderMouse;
        this.selected.highlight();
        const planeIntersect = this.getPlaneIntersection(event);
        if (planeIntersect) {
          this.offset.copy(planeIntersect.point).sub(this.selected.position);
        }
        this.dispatchEvent({ type: 'change' });
      } else {
        // Clicked on empty space – release the current selection.
        this.selected.removeHighlight();
        this.selected = null;
        this.dispatchEvent({ type: 'change' });
      }
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

      // Adjust for the offset computed on mouse down.
      //newPosition.sub(this.offset);

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

    this.dispatchEvent({ type: 'change' });
  }
}

export default SelectionController;
