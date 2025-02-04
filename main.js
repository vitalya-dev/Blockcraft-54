import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import TShape from './TShape.js';
import TransformControls from './TransformControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.set(0, 0, 20);
camera.lookAt(0, 0, 0);

// Create multiple T-Shapes
const tShapes = [];
const positions = [
  { x: -8, z: 0 }, { x: 0, z: 0 }, { x: 8, z: 0 },
  { x: -4, z: 8 }, { x: 4, z: 8 }
];

positions.forEach(pos => {
  const material = new THREE.MeshToonMaterial({
    color: 0x8B4513,
    emissive: 0x000000
  });
  const tShape = new TShape(material);
  tShape.position.set(pos.x, 0, pos.z);
  scene.add(tShape);
  tShapes.push(tShape);
});

// Add after tShapes array declaration
const transformControls = new TransformControls();
scene.add(transformControls);
transformControls.visible = false;

// Lighting
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xeeeeee);
document.body.appendChild(renderer.domElement);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let lastHoveredMaterial = null;

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.screenSpacePanning = true;
controls.maxPolarAngle = Math.PI/2;
controls.target.set(0, 0, 0);

// Grid Helper
const gridHelper = new THREE.GridHelper(40, 40);
scene.add(gridHelper);

// Dragging variables
let selectedObject = null;
let offset = new THREE.Vector3();
const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

function onMouseDown(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  // First check for transform controls interaction
  if (transformControls.visible) {
    const gizmoIntersects = raycaster.intersectObjects(transformControls.children, true);
    if (gizmoIntersects.length > 0) {
      const intersect = gizmoIntersects[0];
      if (transformControls.handleMouseDown(intersect)) {
        controls.enabled = false;
        selectedObject = null; // Prevent object dragging
        return; // Exit early to avoid object selection
      }
    }
  }

  // Then check for object selection
  const intersects = raycaster.intersectObjects(tShapes, true);
  if (intersects.length > 0) {
    selectedObject = intersects[0].object.parent;
    controls.enabled = false;
    transformControls.attach(selectedObject);

    // Calculate initial drag offset
    const intersectionPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(groundPlane, intersectionPoint);
    offset.copy(selectedObject.position).sub(intersectionPoint);
  } else {
    transformControls.detach();
  }
}

function onMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Handle rotation first
  if (transformControls.rotateActive) {
    transformControls.handleMouseMove(event, camera);
    return; // Skip other interactions
  }

  if (selectedObject) {
    // Handle dragging
    raycaster.setFromCamera(mouse, camera);
    const newIntersection = new THREE.Vector3();
    
    if (raycaster.ray.intersectPlane(groundPlane, newIntersection)) {
      const newPosition = newIntersection.add(offset);
      
      // Snap to grid
      const gridSize = 1;
      newPosition.x = Math.round(newPosition.x / gridSize) * gridSize;
      newPosition.z = Math.round(newPosition.z / gridSize) * gridSize;
      
      selectedObject.position.copy(newPosition);
    }
  } else {
    // Handle hover effect
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(tShapes, true);
    handleIntersection(intersects);
  }
}

function onMouseUp() {
  controls.enabled = true;
  selectedObject = null;
  transformControls.handleMouseUp();
}

// Update event listeners
renderer.domElement.addEventListener('mousedown', onMouseDown);
renderer.domElement.addEventListener('mousemove', onMouseMove);
renderer.domElement.addEventListener('mouseup', onMouseUp);

// Keep your existing hover handling function
function handleIntersection(intersects) {
  if (intersects.length > 0) {
    const material = intersects[0].object.material;
    if (material !== lastHoveredMaterial) {
      if (lastHoveredMaterial) lastHoveredMaterial.emissive.setHex(0x000000);
      material.emissive.setHex(0x444444);
      lastHoveredMaterial = material;
    }
  } else {
    if (lastHoveredMaterial) {
      lastHoveredMaterial.emissive.setHex(0x000000);
      lastHoveredMaterial = null;
    }
  }
}

// Animation Loop
const animate = () => {
  requestAnimationFrame(animate);
  controls.update();
  if (transformControls.targetObject) {
    transformControls.position.copy(transformControls.targetObject.position);
    transformControls.rotation.copy(transformControls.targetObject.rotation);
    transformControls.updateMatrixWorld();
  }
  renderer.render(scene, camera);
};

animate();

// Window Resize Handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});