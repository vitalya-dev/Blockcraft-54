import * as THREE from 'three';
import TShape from './TShape.js';
import SelectionController from './SelectionController.js';

// Configuration constants
const CONFIG = {
  CAMERA: {
    POSITION: new THREE.Vector3(0, 25, 0),
    NEAR: 0.1,
    FAR: 1000
  },
  RENDERER: {
    CLEAR_COLOR: 0xeeeeee,
    ANTIALIAS: true
  },
  LIGHTING: {
    AMBIENT: {
      COLOR: 0xffffff,
      INTENSITY: 0.3
    },
    DIRECTIONAL: {
      COLOR: 0xffffff,
      INTENSITY: 1.2,
      POSITION: new THREE.Vector3(0, 20, 4)
    },
    DIRECTIONAL2: {
      COLOR: 0xffffff,
      INTENSITY: 0.4,
      POSITION: new THREE.Vector3(-5, 25, 0)
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
    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 20; // Adjust this value to change the zoom level
    const camera = new THREE.OrthographicCamera(
      (frustumSize * aspect) / -2,  // left
      (frustumSize * aspect) / 2,   // right
      frustumSize / 2,              // top
      frustumSize / -2,             // bottom
      CONFIG.CAMERA.NEAR,
      CONFIG.CAMERA.FAR
    );
    camera.position.copy(CONFIG.CAMERA.POSITION);
    camera.lookAt(new THREE.Vector3(camera.position.x, 0, camera.position.z));
    return camera;
  }

  createRenderer() {
    const renderer = new THREE.WebGLRenderer({ 
      antialias: CONFIG.RENDERER.ANTIALIAS 
    });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(CONFIG.RENDERER.CLEAR_COLOR);
    document.body.appendChild(renderer.domElement);
    return renderer;
  }

  setupLighting() {
    // Ambient light to soften shadows
    const ambientLight = new THREE.AmbientLight(
      CONFIG.LIGHTING.AMBIENT.COLOR,
      CONFIG.LIGHTING.AMBIENT.INTENSITY
    );
    this.scene.add(ambientLight);

    // Main directional light
    const mainLight = new THREE.DirectionalLight(
      CONFIG.LIGHTING.DIRECTIONAL.COLOR,
      CONFIG.LIGHTING.DIRECTIONAL.INTENSITY
    );
    mainLight.position.copy(CONFIG.LIGHTING.DIRECTIONAL.POSITION);
    mainLight.castShadow = true;
    // Configure shadow camera frustum
    mainLight.shadow.camera.left = -40;
    mainLight.shadow.camera.right = 40;
    mainLight.shadow.camera.top = 40;
    mainLight.shadow.camera.bottom = -40;
    mainLight.shadow.camera.near = 0.1;
    mainLight.shadow.camera.far = 100;

    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    this.scene.add(mainLight);

    // Secondary directional light for fill
    // const fillLight = new THREE.DirectionalLight(
    //   CONFIG.LIGHTING.DIRECTIONAL2.COLOR,
    //   CONFIG.LIGHTING.DIRECTIONAL2.INTENSITY
    // );
    // fillLight.castShadow = true;
    // fillLight.position.copy(CONFIG.LIGHTING.DIRECTIONAL2.POSITION);
    // fillLight.shadow.camera.left = -40;
    // fillLight.shadow.camera.right = 40;
    // fillLight.shadow.camera.top = 40;
    // fillLight.shadow.camera.bottom = -40;
    // fillLight.shadow.camera.near = 0.1;
    // fillLight.shadow.camera.far = 100;

    // fillLight.shadow.mapSize.width = 2048;
    // fillLight.shadow.mapSize.height = 2048;
    // this.scene.add(fillLight);

    // Shadow-catching plane
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 40),
      new THREE.ShadowMaterial({ color: 0x000000, opacity: 0.2 })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.receiveShadow = true;
    this.scene.add(shadowPlane);
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
    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 50; // Same value used in createCamera
    this.camera.left = (-frustumSize * aspect) / 2;
    this.camera.right = (frustumSize * aspect) / 2;
    this.camera.top = frustumSize / 2;
    this.camera.bottom = -frustumSize / 2;
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