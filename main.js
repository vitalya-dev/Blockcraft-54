import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import TShape from './TShape.js';

// Configuration constants
const CONFIG = {
  CAMERA: {
    FOV: 75,
    POSITION: new THREE.Vector3(0, 0, 20),
    NEAR: 0.1,
    FAR: 1000
  },
  RENDERER: {
    CLEAR_COLOR: 0xeeeeee,
    ANTIALIAS: true
  },
  LIGHTING: {
    DIRECTIONAL: {
      COLOR: 0xffffff,
      INTENSITY: 0.8,
      POSITION: new THREE.Vector3(5, 5, 5)
    }
  },
  GRID: {
    SIZE: 40,
    DIVISIONS: 40
  },
  T_SHAPES: {
    MATERIAL: {
      COLOR: 0x8B4513,
      EMISSIVE: 0x000000
    },
    POSITIONS: [
      { x: -8, z: 0 }, { x: 0, z: 0 }, { x: 8, z: 0 },
      { x: -4, z: 8 }, { x: 4, z: 8 }
    ]
  },
  CONTROLS: {
    TRANSFORM: {
      TRANSLATION_SNAP: 1,
      ROTATION_SNAP: 90 // Degrees
    }
  }
};

class SceneManager {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = this.createCamera();
    this.renderer = this.createRenderer();
    this.orbitControls = null;
    this.transformControls = null;
    this.tShapes = [];
    
    this.init();
  }

  init() {
    this.setupLighting();
    this.setupGrid();
    this.createTShapes();
    this.setupControls();
    this.setupEventListeners();
    this.render();
  }

  createCamera() {
    const camera = new THREE.PerspectiveCamera(
      CONFIG.CAMERA.FOV,
      window.innerWidth / window.innerHeight,
      CONFIG.CAMERA.NEAR,
      CONFIG.CAMERA.FAR
    );
    camera.position.copy(CONFIG.CAMERA.POSITION);
    camera.lookAt(0, 0, 0);
    return camera;
  }

  createRenderer() {
    const renderer = new THREE.WebGLRenderer({ 
      antialias: CONFIG.RENDERER.ANTIALIAS 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(CONFIG.RENDERER.CLEAR_COLOR);
    document.body.appendChild(renderer.domElement);
    return renderer;
  }

  setupLighting() {
    const light = new THREE.DirectionalLight(
      CONFIG.LIGHTING.DIRECTIONAL.COLOR,
      CONFIG.LIGHTING.DIRECTIONAL.INTENSITY
    );
    light.position.copy(CONFIG.LIGHTING.DIRECTIONAL.POSITION);
    this.scene.add(light);
  }

  setupGrid() {
    const gridHelper = new THREE.GridHelper(
      CONFIG.GRID.SIZE,
      CONFIG.GRID.DIVISIONS
    );
    this.scene.add(gridHelper);
  }

  createTShapes() {
    const material = new THREE.MeshToonMaterial({
      color: CONFIG.T_SHAPES.MATERIAL.COLOR,
      emissive: CONFIG.T_SHAPES.MATERIAL.EMISSIVE
    });

    this.tShapes = CONFIG.T_SHAPES.POSITIONS.map(pos => {
      const tShape = new TShape(material);
      tShape.position.set(pos.x, 0, pos.z);
      this.scene.add(tShape);
      return tShape;
    });
  }

  setupControls() {
    // Orbit Controls
    this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
    this.orbitControls.screenSpacePanning = true;
    this.orbitControls.maxPolarAngle = Math.PI / 2;
    this.orbitControls.target.set(0, 0, 0);
    this.orbitControls.addEventListener('change', () => this.render());

    // Transform Controls
    this.transformControls = new TransformControls(this.camera, this.renderer.domElement);
    this.transformControls.setTranslationSnap(CONFIG.CONTROLS.TRANSFORM.TRANSLATION_SNAP);
    this.transformControls.setRotationSnap(THREE.MathUtils.degToRad(
      CONFIG.CONTROLS.TRANSFORM.ROTATION_SNAP
    ));
    
    this.transformControls.addEventListener('dragging-changed', (event) => {
      this.orbitControls.enabled = !event.value;
    });
    
    this.transformControls.addEventListener('change', () => this.render());
    this.scene.add(this.transformControls.getHelper());
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.onWindowResize());
    this.renderer.domElement.addEventListener('click', (event) => this.onDocumentMouseClick(event));
  }

  onDocumentMouseClick(event) {
    // Calculate normalized mouse coordinates
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / this.renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = - (event.clientY / this.renderer.domElement.clientHeight) * 2 + 1;

    // Set up raycaster
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);

    // Get all child meshes of TShapes
    const intersects = raycaster.intersectObjects(this.tShapes, true);

    let selectedObject = null;
    if (intersects.length > 0) {
      selectedObject = intersects[0].object.parent;
    }

    // Attach or detach transform controls
    if (selectedObject) {
      this.transformControls.attach(selectedObject);
    } 
    this.render();
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.render();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}

// Initialize the application
new SceneManager();