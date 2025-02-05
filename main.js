import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';

import TShape from './TShape.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.set(0, 0, 20);
camera.lookAt(0, 0, 0);


// Lighting
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xeeeeee);
document.body.appendChild(renderer.domElement);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.screenSpacePanning = true;
controls.maxPolarAngle = Math.PI/2;
controls.target.set(0, 0, 0);
controls.addEventListener( 'change', render );

// Grid Helper
const gridHelper = new THREE.GridHelper(40, 40);
scene.add(gridHelper);

// Create multiple T-Shapes
// Create multiple T-Shapes
const tShapes = [
  { x: -8, z: 0 }, { x: 0, z: 0 }, { x: 8, z: 0 },
  { x: -4, z: 8 }, { x: 4, z: 8 }
].map(pos => {
  const material = new THREE.MeshToonMaterial({
    color: 0x8B4513,
    emissive: 0x000000
  });
  const tShape = new TShape(material);
  tShape.position.set(pos.x, 0, pos.z);
  scene.add(tShape);
  return tShape;
});

// Setup Transform Controls
const transformControls = new TransformControls(camera, renderer.domElement);

// When dragging an object with TransformControls, disable OrbitControls
transformControls.addEventListener('dragging-changed', (event) => {
  controls.enabled = !event.value;
});

let selectedObject = tShapes[0];
transformControls.attach(selectedObject);
transformControls.addEventListener( 'change', render );

const gizmo = transformControls.getHelper();
scene.add( gizmo );

transformControls.setTranslationSnap( 1 );
transformControls.setRotationSnap( THREE.MathUtils.degToRad( 90 ) );

// Animation Loop

function render() {

  renderer.render( scene, camera );

}
