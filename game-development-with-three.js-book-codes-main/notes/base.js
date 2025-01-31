import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);

const renderer = new THREE.WebGL1Renderer(); // CanvasRenderer is deprecate
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

// CODE HERE ...


const animate = () => {
  requestAnimationFrame(animate);

  renderer.render(scene, camera);
}

animate();
