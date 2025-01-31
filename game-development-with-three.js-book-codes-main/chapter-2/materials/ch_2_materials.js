import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerHeight / window.innerWidth, 1, 1000);
camera.position.z = 10;

const geometry = new THREE.IcosahedronGeometry(1, 1);

const basicMaterial = new THREE.MeshBasicMaterial({color: '#0000FF'})
const basicMesh = new THREE.Mesh(geometry, basicMaterial);
basicMesh.position.x = -4;
basicMesh.position.y = 5;
scene.add(basicMesh);

const normalMaterial = new THREE.MeshNormalMaterial()
const normalMesh = new THREE.Mesh(geometry, normalMaterial);
normalMesh.position.x = -1;
normalMesh.position.y = 5;
scene.add(normalMesh);

const depthMaterial = new THREE.MeshDepthMaterial()
const depthlMesh = new THREE.Mesh(geometry, depthMaterial);
depthlMesh.position.x = 0;
depthlMesh.position.y = 0;
scene.add(depthlMesh);

const renderer = new THREE.WebGL1Renderer();
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const animate = () => {
    requestAnimationFrame(animate);

    renderer.render(scene, camera);
}

animate();