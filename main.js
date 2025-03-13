import * as THREE from 'three';
import TShape from './TShape.js';
import SelectionController from './SelectionController.js';
import tshapesData from './tshapes_data.js';  // Changed from .json to .js
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { Text3D } from './Text3D.js';

// Configuration constants
const CONFIG = {
  CAMERA: {
    FOV: 45, // Add this
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
      POSITION: new THREE.Vector3(0, 20, 4),
      SHADOW: {
        CAMERA: {
          LEFT: -40,
          RIGHT: 40,
          TOP: 40,
          BOTTOM: -40,
          NEAR: 0.5,
          FAR: 50
        }
      }
    },
    DIRECTIONAL2: {
      COLOR: 0xffffff,
      INTENSITY: 0.8,
      POSITION: new THREE.Vector3(-4, 25, 0)
    },
    SHADOW_PLANE: {
      SIZE: 40,
      MATERIAL: {
        COLOR: 0x000000,
        OPACITY: 0.2
      }
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


    // Load font through the class
    const text = new Text3D("Async Text", {
        fontURL: 'public/fonts/helvetiker_regular.typeface.json',
        size: 1,
        lineColor: 0x00ff00
    });      
    text.position.set(0, 0, 0);
    this.scene.add(text);
    this.render();
  }

  createCamera() {
    const aspect = window.innerWidth / window.innerHeight;
    const camera = new THREE.PerspectiveCamera(
      45, // Field of View (FOV) in degrees
      aspect,
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
    // Ambient light
    const ambientLight = new THREE.AmbientLight(
      CONFIG.LIGHTING.AMBIENT.COLOR,
      CONFIG.LIGHTING.AMBIENT.INTENSITY
    );
    this.scene.add(ambientLight);

    // Main directional light (shadow casting)
    const mainLight = new THREE.DirectionalLight(
      CONFIG.LIGHTING.DIRECTIONAL.COLOR,
      CONFIG.LIGHTING.DIRECTIONAL.INTENSITY
    );
    mainLight.position.copy(CONFIG.LIGHTING.DIRECTIONAL.POSITION);
    mainLight.castShadow = true;
    
    // Shadow camera setup
    mainLight.shadow.camera.left = CONFIG.LIGHTING.DIRECTIONAL.SHADOW.CAMERA.LEFT;
    mainLight.shadow.camera.right = CONFIG.LIGHTING.DIRECTIONAL.SHADOW.CAMERA.RIGHT;
    mainLight.shadow.camera.top = CONFIG.LIGHTING.DIRECTIONAL.SHADOW.CAMERA.TOP;
    mainLight.shadow.camera.bottom = CONFIG.LIGHTING.DIRECTIONAL.SHADOW.CAMERA.BOTTOM;
    mainLight.shadow.camera.near = CONFIG.LIGHTING.DIRECTIONAL.SHADOW.CAMERA.NEAR;
    mainLight.shadow.camera.far = CONFIG.LIGHTING.DIRECTIONAL.SHADOW.CAMERA.FAR;
    this.scene.add(mainLight);

    // Secondary directional light (fill light)
    const fillLight = new THREE.DirectionalLight(
      CONFIG.LIGHTING.DIRECTIONAL2.COLOR,
      CONFIG.LIGHTING.DIRECTIONAL2.INTENSITY
    );
    fillLight.position.copy(CONFIG.LIGHTING.DIRECTIONAL2.POSITION);
    this.scene.add(fillLight);

    // Shadow-receiving plane
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(
        CONFIG.LIGHTING.SHADOW_PLANE.SIZE,
        CONFIG.LIGHTING.SHADOW_PLANE.SIZE
      ),
      new THREE.ShadowMaterial({
        color: CONFIG.LIGHTING.SHADOW_PLANE.MATERIAL.COLOR,
        opacity: CONFIG.LIGHTING.SHADOW_PLANE.MATERIAL.OPACITY
      })
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
    this.camera.aspect = aspect;
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