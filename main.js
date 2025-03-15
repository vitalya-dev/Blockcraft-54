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
  TARGET_GRID: { // New target grid config
    SIZE: 6,
    DIVISIONS: 6,
    POSITION: new THREE.Vector3(9.5, 0.1, 4.5), // Align with "сюда..." text
    COLOR_CENTER: 0xCCCCCC, // Green center lines
    COLOR_GRID: 0xBBBBBB   // Darker grid lines
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
    this.setupUI();
    this.render();
  }

  setupUI() {
    this.createText3D(
      "Управление:\nЛКМ - выбрать блок\nПКМ - вращать блок горизонтально\nКолесо - вращать блок вертикально",
      new THREE.Vector3(-5.5, 0.1, -18), // Position in bottom-left corner
      {
        size: 1, // Smaller size
        lineHeight: 1.2 // Tighter line spacing
      }
    );
    this.createText3D("Перемести блок отсюда", new THREE.Vector3(-8.5, 0.1, 10));
    this.createText3D("сюда", new THREE.Vector3(9.5, 0.1, 10));
  }

  createText3D(text, position, options = {}) {
    const mergedOptions = {
      fontURL: 'public/fonts/Verdana_Regular.json',
      size: 1,
      color: 0x000000,
      lineColor: 0xBBBBBB,
      ...options
    };
    
    const text3D = new Text3D(text, mergedOptions);
    text3D.position.copy(position);
    text3D.rotation.x = -Math.PI / 2;
    this.scene.add(text3D);
    return text3D;
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
    //this.scene.add(gridHelper);

    const targetGrid = new THREE.GridHelper(
      CONFIG.TARGET_GRID.SIZE,
      CONFIG.TARGET_GRID.DIVISIONS,
      CONFIG.TARGET_GRID.COLOR_CENTER,
      CONFIG.TARGET_GRID.COLOR_GRID
    );
    targetGrid.position.copy(CONFIG.TARGET_GRID.POSITION);
    this.scene.add(targetGrid);
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
    this.selectionController.addEventListener('change', () => {
      this.render();
      if (this.checkWinCondition()) {
        this.handleWin();
      }
    });
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


  checkWinCondition() {
    // Target grid boundaries (adjust if needed)
    const targetBounds = {
      minX: 6.5,  // 9.5 - 3
      maxX: 12.5, // 9.5 + 3
      minZ: 1.5,  // 4.5 - 3
      maxZ: 7.5   // 4.5 + 3
    };

    for (const tShape of this.tShapes) {
      for (const block of tShape.children) { // Ensure TShape exposes 'blocks' array
        const worldPos = new THREE.Vector3();
        block.getWorldPosition(worldPos);
        console.log('Checking block at:', worldPos.x, worldPos.z);
        console.log('Against bounds:', targetBounds);
        if (
          worldPos.x < targetBounds.minX ||
          worldPos.x > targetBounds.maxX ||
          worldPos.z < targetBounds.minZ ||
          worldPos.z > targetBounds.maxZ
        ) {
          return false; // Block outside target
        }
      }
    }
    return true; // All blocks inside
  }

   handleWin() {
    console.log('Victory!');
    this.showWinMessage();
    this.selectionController.enabled = false; // Disable further movement
  }

  showWinMessage() {
    // Optional: Add small delay to prevent alert from appearing mid-interaction
    setTimeout(() => {
      alert("Win!!!");
    }, 100);
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