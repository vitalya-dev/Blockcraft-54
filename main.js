import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import TShape from './TShape.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.set(0, 15, 20);
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

// Event Handlers
// Define a function named `handleIntersection` that takes a parameter `intersects`
function handleIntersection(intersects) {
  // Check if the `intersects` array has any elements (i.e., if there are intersections)
  if (intersects.length > 0) {
    // Retrieve the material of the first intersected object from the `intersects` array
    const material = intersects[0].object.material;
    // Check if the current material is different from the previously hovered material (`lastHoveredMaterial`)
    if (material !== lastHoveredMaterial) {
      // If there was a previously hovered material, reset its emissive color to black (0x000000)
      if (lastHoveredMaterial) {
        lastHoveredMaterial.emissive.setHex(0x000000);
      }
      // Set the emissive color of the current material to a grayish color (0x444444)
      material.emissive.setHex(0x444444);
      // Update the `lastHoveredMaterial` to the current material for future reference
      lastHoveredMaterial = material;
    }
  } else {
    // If there are no intersections (i.e., the user is not hovering over any object)
    // Check if there was a previously hovered material
    if (lastHoveredMaterial) {
      // Reset the emissive color of the previously hovered material to black (0x000000)
      lastHoveredMaterial.emissive.setHex(0x000000);
      // Clear the reference to the previously hovered material by setting it to null
      lastHoveredMaterial = null;
    }
  }
}

function onClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(tShapes, true);

  if (intersects.length > 0) {
    const material = intersects[0].object.material;
    const tShape = intersects[0].object.parent;
    
    material.emissive.setHex(0x666666);
    setTimeout(() => {
      if (material !== lastHoveredMaterial) {
        material.emissive.setHex(0x000000);
      }
    }, 200);

    controls.target.copy(tShape.getWorldPosition(new THREE.Vector3()));
  }
}

function onMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(tShapes, true);
  
  handleIntersection(intersects);
}

renderer.domElement.addEventListener('click', onClick);
renderer.domElement.addEventListener('mousemove', onMouseMove);

// Animation Loop
const animate = () => {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
};

animate();

// Window Resize Handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});