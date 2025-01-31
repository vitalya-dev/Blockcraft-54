import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);

const renderer = new THREE.WebGL1Renderer(); // CanvasRenderer is deprecate
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true});
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

camera.position.set(0, 0, -3);
camera.lookAt(mesh.position);

const clock = new THREE.Clock();

let dir = 1;
const animate = () => {
  requestAnimationFrame(animate);

	const delta = clock.getDelta();

  mesh.rotation.x += delta * 0.5;
  mesh.rotation.y += delta * 2;
  mesh.position.x += dir * delta;

	if(mesh.position.x > 2) {
    dir = -1;
  } else if(mesh.position.x < -2) {
    dir = 1;
  }

  renderer.render(scene, camera);
}

animate();
