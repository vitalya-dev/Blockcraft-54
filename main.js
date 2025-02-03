import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import TShape from './TShape.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.set(0, 10, 10);
camera.lookAt(0, 0, 0);

// Wood-colored toon material
const material = new THREE.MeshToonMaterial({
  color: 0x8B4513, // Classic saddle brown wood color
});

  // 0xA0522D (sienna)

  // 0xDEB887 (burlywood)

  // 0xD2B48C (tan)

  // 0xCD853F (peru)


// Add lighting for toon shading
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);


const tShape = new TShape(material);
scene.add(tShape);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xeeeeee); // Light background to enhance contrast
document.body.appendChild(renderer.domElement);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let currentTarget = new THREE.Vector3(); // Store original center


const controls = new OrbitControls(camera, renderer.domElement);
controls.screenSpacePanning = true; // More intuitive panning
controls.maxPolarAngle = Math.PI/2; // Prevent looking under the puzzle
controls.target.copy(tShape.position); // Initial target
currentTarget.copy(controls.target);
// controls.enableDamping = true; // Smooth camera movement
// controls.dampingFactor = 0.05;
// controls.minDistance = 5; // Minimum zoom
// controls.maxDistance = 20; // Maximum zoom
// controls.enablePan = true; // Allow camera panning

const gridHelper = new THREE.GridHelper(1000, 1000);
scene.add(gridHelper);


// Click handler
function onClick(event) {
    // Calculate mouse position in normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the picking ray
    raycaster.setFromCamera(mouse, camera);

    // Find intersected objects (assuming TShape creates meshes)
    const intersects = raycaster.intersectObjects(tShape.children, true);

    if (intersects.length > 0) {
        // const distance = controls.getDistance();
        //  // Calculate direction vector
        // const direction = new THREE.Vector3()
        //     .subVectors(camera.position, controls.target)
        //     .normalize();

        tShape.material.emissive.setHex(0x333333);
        setTimeout(() => {
          tShape.material.emissive.setHex(0x000000);
        }, 200);
        controls.target.copy(tShape.getWorldPosition(new THREE.Vector3()));

        //camera.position.copy(controls.target).add(direction.multiplyScalar(distance));
        // const selectedObject = intersects[0].object;
        
        // // Focus on the clicked TShape piece
        // controls.target.copy(selectedObject.getWorldPosition(new THREE.Vector3()));
        // currentTarget.copy(controls.target);
        
        // // Optional: Add visual feedback
        // selectedObject.material.emissive.setHex(0x333333);
        // setTimeout(() => {
        //     selectedObject.material.emissive.setHex(0x000000);
        // }, 200);
    }
}

renderer.domElement.addEventListener('click', onClick, false);


// Simplified animation loop without rotation
const animate = () => {
    requestAnimationFrame(animate);
    controls.update(); // Required when damping is enabled
    renderer.render(scene, camera);
};

animate();