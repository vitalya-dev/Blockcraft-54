import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);

const geometry = new THREE.IcosahedronGeometry(200, 1);
const material = new THREE.MeshBasicMaterial({color: 0xffffff, wireframe: true, wireframeLinewidth: 2});
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

const renderer = new THREE.WebGL1Renderer(); // CanvasRenderer is deprecate
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const animate = () => {
    requestAnimationFrame(animate);

    mesh.rotation.x = Date.now() * 0.00005;
    mesh.rotation.y = Date.now() * 0.0001;

    renderer.render(scene, camera);
}

animate();