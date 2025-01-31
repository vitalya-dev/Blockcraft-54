import * as THREE from 'three';
import { addCitySceen } from './city';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xd7f0f7);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);

// Seens
addCitySceen(scene);

// Render
const renderer = new THREE.WebGL1Renderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement)

// camera.position.y = 400;
camera.position.y = 400;
camera.position.z = 400;
camera.rotation.x = -45 * Math.PI / 180; // Tilt the camera to 45deg

const animate = () => {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();

