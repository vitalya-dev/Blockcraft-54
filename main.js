import * as THREE from 'three';
import TShape from './TShape.js';
import SelectionController from './SelectionController.js';
import tshapesData from './tshapes_data.js';  // Changed from .json to .js

// Configuration constants
const CONFIG = {
  CAMERA: {
    POSITION: new THREE.Vector3(0, 20, 0),
    NEAR: 0.1,
    FAR: 1000
  },
  RENDERER: {
    CLEAR_COLOR: 0xffffff,
    ANTIALIAS: true
  },
  LIGHTING: {
    AMBIENT: {
      COLOR: 0xffffff,
      INTENSITY: 0.2
    },
    DIRECTIONAL: {
      COLOR: 0xffffff,
      INTENSITY: 1.2,
      POSITION: new THREE.Vector3(0, 20, 4)
    },
    DIRECTIONAL2: {
      COLOR: 0xffffff,
      INTENSITY: 1.2,
      POSITION: new THREE.Vector3(-4, 25, 0)
    }
  },
  GRID: {
    SIZE: 40,
    DIVISIONS: 40
  },
  T_SHAPES: {
    MATERIAL: {
      COLOR: 0xffffff,
    }
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
    const frustumSize = 18; // Adjust this value to change the zoom level
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
      antialias: CONFIG.RENDERER.ANTIALIAS,
       powerPreference: "high-performance" // Better line rendering 
    });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(CONFIG.RENDERER.CLEAR_COLOR);
    document.body.appendChild(renderer.domElement);
    return renderer;
  }

  setupLighting() {
    var ambientLight = new THREE.AmbientLight( 'white', 0.5 );
    this.scene.add( ambientLight );
    // Remove all lights except shadow-casting light
    const mainLight = new THREE.DirectionalLight(0xffffff, .5);
    mainLight.position.set(0, 1, 0);
    mainLight.castShadow = true;
    // Keep shadow camera settings
    this.scene.add(mainLight);

    // Keep shadow plane
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200),
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
    this.tShapes = [];

    tshapesData.forEach(data => {      
      const tShape = new TShape(CONFIG.T_SHAPES.MATERIAL.COLOR);
      
      // Set position from JSON
      tShape.position.set(
        data.pos.x,
        data.pos.y,
        data.pos.z
      );

      // Set rotation from JSON
      const rotation = new THREE.Euler(
        data.rotation.x,
        data.rotation.y,
        data.rotation.z,
        data.rotation.order
      );
      tShape.rotation.copy(rotation);
      tShape.updateBlockPositions();

      this.scene.add(tShape);
      this.tShapes.push(tShape);
    });
  }

  setupControls() {
    this.selectionController = new SelectionController(this.camera, this.scene, this.renderer, this.tShapes);
    this.selectionController.addEventListener('change', () => this.render());
  }

  setupEventListeners() {
    window.addEventListener('keydown', (event) => {
      if (event.key === 'd' || event.key === 'D') {
        const serialized = this.serializeTShapes();
        // Format with 2-space indentation for both console and clipboard
        const formattedData = JSON.stringify(serialized, null, 2);
        console.log(formattedData);
        
        // Copy formatted version to clipboard
        navigator.clipboard.writeText(formattedData)
          .then(() => console.log('Formatted data copied to clipboard!'))
          .catch(err => console.error('Failed to copy data:', err));
      }
    });
  }


  serializeTShapes() {
    return this.tShapes.map(tshape => ({
      pos: {
        x: tshape.position.x,
        y: tshape.position.y,
        z: tshape.position.z
      },
      rotation: {
        x: tshape.rotation.x,
        y: tshape.rotation.y,
        z: tshape.rotation.z,
        order: tshape.rotation.order
      }
    }));
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