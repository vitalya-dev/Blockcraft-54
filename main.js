import * as THREE from 'three';
import TShape from './TShape.js';
import SelectionController from './SelectionController.js';

// Configuration constants
const CONFIG = {
  CAMERA: {
    FOV: 75,
    POSITION: new THREE.Vector3(0, 40, 10),
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
      {x: 18, z: 18},
    ]
  },
};

class SceneManager {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = this.createCamera();
    this.renderer = this.createRenderer();
    this.selectionController = null;
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
    gridHelper.position.set(0.5, 0, 0.5);
    this.scene.add(gridHelper);
  }

  createTShapes() {
    // Number of TShapes to stack
    const numShapes = 5;
    // Approximate height of each TShape
    const shapeHeight = 1;
    // Use the x and z from the config's first position as our base position
    const basePosition = CONFIG.T_SHAPES.POSITIONS[0];

    this.tShapes = [];

    for (let i = 0; i < numShapes; i++) {
      const material = new THREE.MeshToonMaterial({
        color: CONFIG.T_SHAPES.MATERIAL.COLOR,
        emissive: CONFIG.T_SHAPES.MATERIAL.EMISSIVE
      });
      const tShape = new TShape(material);
      // Stack by increasing the y coordinate
      tShape.position.set(
        basePosition.x,
        i * shapeHeight, // Each new TShape is placed 5 units higher than the previous one
        basePosition.z
      );
      this.scene.add(tShape);
      this.tShapes.push(tShape);
    }
  }

  setupControls() {
    this.selectionController = new SelectionController(this.camera, this.scene, this.renderer, this.tShapes);
    this.selectionController.addEventListener('change', () => this.render());
  }

  setupEventListeners() {

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