import * as THREE from 'three';
import { Projector } from 'three/examples/jsm/renderers/Projector';
import { addCitySceen } from '../chapter-2/city_scene/city';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xd7f0f7);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);

// Seens
addCitySceen(scene);

const KeyboardControls = (object, options) => {
    this.object = object;
    options = options || {};
    this.domElement = options.domElement || document;
    this.moveSpeed = options.moveSpeed || 1;
  
    this.domElement.addEventListener('keydown', this.onKeyDown.bind(this), false);
    this.domElement.addEventListener('keyup', this.onKeyUp.bind(this), false);
  }
  
KeyboardControls.prototype = {
  update: () => {
    if (this.moveForward) this.object.translateZ(-this.moveSpeed);
    if (this.moveBackward) this.object.translateZ(this.moveSpeed);
    if (this.moveLeft) this.object.translateX(-this.moveSpeed);
    if (this.moveRight) this.object.translateX(this.moveSpeed);
  },
  onKeyDown: (event) => {
    switch (event.keyCode) {
      case 38: /* up */
      case 87: /* W */ this.moveForward = true; break;
      
      case 37: /* left */
      case 65: /* A */ this.moveLeft = true; break;

      case 40: /* down */
      case 83: /* S */ this.moveBackward = true; break;

      case 39: /* right */
      case 68: /* D */ this.moveRight = true; break;
    }
  },
  onKeyUp: (event) => {
    switch (event.keyCode) {
      case 38: /* up */
      case 87: /* W */ this.moveForward = true; break;
      
      case 37: /* left */
      case 65: /* A */ this.moveLeft = true; break;

      case 40: /* down */
      case 83: /* S */ this.moveBackward = true; break;

      case 39: /* right */
      case 68: /* D */ this.moveRight = true; break;
    }
  }
}

// Render
const renderer = new THREE.WebGL1Renderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement)

const projector = new Projector();
renderer.domElement.addEventListener('mousedown', (event) => {
  const vector = new THREE.Vector3(
    renderer.devicePixelRatio * (event.pageX - renderer.domElement.offsetLeft) /
    renderer.domElement.width * 2 - 1,
    -renderer.devicePixelRatio * (event.pageY - renderer.domElement.offsetLeft) /
    renderer.domElement.height * 2 + 1,
    0
  );

  projector.unprojectVector(vector, camera);

  const rayCaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());

  const intersects = rayCaster.intersectObjects(scene.children);
  if(intersects.length) {
    // intersects[0] describes the clicked object
  }
}, false);

// camera.position.y = 400;
camera.position.y = 400;
camera.position.z = 400;
camera.rotation.x = -45 * Math.PI / 180; // Tilt the camera to 45deg

const animate = () => {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();

