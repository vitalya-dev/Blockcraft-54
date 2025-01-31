import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);

const renderer = new THREE.WebGL1Renderer(); // CanvasRenderer is deprecate
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

// CODE HERE ...
const geometry = new THREE.BufferGeometry();
// create a simple square shape. We duplicate the top left and bottom right
// vertices because each vertex needs to appear once per triangle.
const vertices = new Float32Array( [
	-1.0, 1.0,  0,
	 -1.0, -1.0,  0,
	 1.0,  -1.0,  1,
] );

// itemSize = 3 because there are 3 values (components) per vertex
geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
const material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
const mesh = new THREE.Mesh( geometry, material );
scene.add(mesh);

camera.position.set(0, 0, 5);
camera.lookAt(mesh.position);

const animate = () => {
  requestAnimationFrame(animate);

  renderer.render(scene, camera);

}

animate();
