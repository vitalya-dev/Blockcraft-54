import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);

const renderer = new THREE.WebGL1Renderer(); // CanvasRenderer is deprecate
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

// CODE HERE ...
const geometry = new THREE.BoxGeometry();
const texture = new THREE.TextureLoader().load('./images.jpeg');
const material = new THREE.MeshBasicMaterial({color: 0xfd59d7}); //new THREE.MeshPhongMaterial({color: 0x90abed, map: texture ,transparent: true, opacity: 1})
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// const light = new THREE.PointLight(0xFFFF00);
// light.position.set(10, 0, 25);
// scene.add(light);

mesh.position.z = -20;
camera.position.z = -5;
// camera.lookAt(mesh.position);

const animate = () => {
  requestAnimationFrame(animate);

  renderer.render(scene, camera);

}

animate();
