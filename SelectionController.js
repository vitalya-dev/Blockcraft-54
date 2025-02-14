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
    this.renderer.domElement.addEventListener('mouseup', this.onMouseUp.bind(this), false);
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

  // When the player clicks, check if a selectable TShape was clicked.
  onMouseDown(event) {
    event.preventDefault();
    console.log("[DEBUG] onMouseDown triggered:", event);

    const intersects = this.getIntersects(event, this.selectableObjects);
    console.log("[DEBUG] Intersects:", intersects);

    if (intersects.length > 0) {
      const intersect = intersects[0];
      console.log("[DEBUG] First intersect:", intersect);

      const selectable = this.findSelectable(intersect.object);
      console.log("[DEBUG] Selectable object found:", selectable);

      if (selectable) {
        this.selected = selectable;

        this.selected.highlight();
        // Determine the offset so that the object doesn’t snap abruptly.
        const planeIntersect = this.getPlaneIntersection(event);
        if (planeIntersect) {
          console.log("[DEBUG] Plane intersection:", planeIntersect);
          this.offset.copy(planeIntersect.point).sub(this.selected.position);
          console.log("[DEBUG] Computed offset:", this.offset);
        } else {
          console.log("[DEBUG] No plane intersection found.");
        }
        // Dispatch a change event after lifting the object.
        this.dispatchEvent({ type: 'change' });
      } else {
        console.log("[DEBUG] No selectable object found for the intersected object.");
      }
    } else {
      console.log("[DEBUG] No intersects found.");
    }
  }


  // While dragging, update the object's position so that it follows the mouse.
  // The new position is calculated with the provided snippet, then snapped to whole numbers.
  onMouseMove(event) {
    event.preventDefault();
    console.log("[DEBUG] onMouseMove triggered with event:", event);

    if (!this.selected) {
      console.log("[DEBUG] No object is currently selected. Exiting onMouseMove.");
      return;
    }

    const planeIntersect = this.getPlaneIntersection(event);
    if (planeIntersect) {
      console.log("[DEBUG] Plane intersection found:", planeIntersect);
      
      const newPosition = new THREE.Vector3();
      // Using provided snippet:
      newPosition.copy(planeIntersect.point).add(planeIntersect.face.normal);
      console.log("[DEBUG] Position after adding face normal:", newPosition);

      // Adjust by the initial offset.
      newPosition.sub(this.offset);
      console.log("[DEBUG] Position after subtracting offset:", newPosition);

      // Snap to the nearest whole unit.
      newPosition.x = Math.round(newPosition.x);
      newPosition.y = Math.round(newPosition.y);
      newPosition.z = Math.round(newPosition.z);
      console.log("[DEBUG] Position after snapping to grid:", newPosition);

      // Update selected object's position.
      this.selected.position.copy(newPosition);
      console.log("[DEBUG] Selected object's new position:", this.selected.position);

      // Dispatch a change event after moving the object.
      this.dispatchEvent({ type: 'change' });
    } else {
      console.log("[DEBUG] No plane intersection found in onMouseMove.");
    }
  }


  // On mouse up, finalize the placement.
  onMouseUp(event) {
    event.preventDefault();
    if (this.selected) {
      const planeIntersect = this.getPlaneIntersection(event);
      if (planeIntersect) {
        const newPosition = new THREE.Vector3();
        newPosition.copy(planeIntersect.point).add(planeIntersect.face.normal);
        newPosition.sub(this.offset);
        newPosition.x = Math.round(newPosition.x);
        newPosition.y = Math.round(newPosition.y);
        newPosition.z = Math.round(newPosition.z);
        this.selected.position.copy(newPosition);
      }

      this.selected.removeHighlight();
      // Dispatch a change event after finalizing the object's position.
      this.dispatchEvent({ type: 'change' });

      // Release the selected object.
      this.selected = null;
    }
  }
}

export default SelectionController;
