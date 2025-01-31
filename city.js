import * as THREE from 'three';
import GRAY_COLORS from './gray_scale_colors';

/**
 * CITYSCAPE GENERATOR
 * 
 * This function populates a Three.js scene with a randomly generated city
 * consisting of 3D buildings on a large ground plane. The city features:
 * - 100 unique randomly positioned and scaled buildings
 * - Varying gray color schemes for buildings
 * - A massive ground plane acting as the city foundation
 * 
 * @param {THREE.Scene} scene - The Three.js scene to populate with city elements
 */
const addCitySceen = (scene) => {
    // ========================================================================
    // BASE BUILDING TEMPLATE
    // ========================================================================
    // Create a base cube geometry that will be used for all buildings
    // We translate it vertically so when we scale buildings, they grow upward
    const boxGeometry = new THREE.BoxGeometry();
    // Shift geometry up by 0.5 units so bottom face sits at Y=0
    const boxMatrix = new THREE.Matrix4().makeTranslation(0, 0.5, 0);
    boxGeometry.applyMatrix4(boxMatrix);

    // Create base material that will be cloned for building variations
    const boxMaterial = new THREE.MeshBasicMaterial();
    boxMaterial.color = new THREE.Color('#397c8d'); // Base blue-gray color

    // ========================================================================
    // BUILDING GENERATION LOOP
    // ========================================================================
    // Create 100 unique building instances with random properties
    for (let i = 0; i < 100; i++) {
        // Clone material to create unique color instances without memory overhead
        const buildingMaterial = boxMaterial.clone();
        // Randomly select from predefined gray colors
        buildingMaterial.color = new THREE.Color(
            GRAY_COLORS[randomNumber(0, GRAY_COLORS.length - 1)]
        );

        // Create building mesh with cloned geometry to prevent shared references
        const building = new THREE.Mesh(boxGeometry.clone(), buildingMaterial);

        // ======================
        // POSITIONING
        // ======================
        // Random X/Z positions in a 800x800 unit area (-400 to +400)
        // Math breakdown:
        // - Math.random() * 200 → 0-199
        // - -100 → -100 to +99
        // - *4 → -400 to +396 (even distribution)
        building.position.x = Math.floor(Math.random() * 200 - 100) * 4;
        building.position.z = Math.floor(Math.random() * 200 - 100) * 4;

        // ======================
        // SCALING
        // ======================
        // Width (X) and Depth (Z): Between 10-60 units
        building.scale.x = Math.random() * 50 + 10;
        // Height (Y): Proportional to width with extra randomness
        // - Base height: 8 units minimum
        // - Multiplier: Up to 8x the width plus base 8
        building.scale.y = Math.random() * building.scale.x * 8 + 8;
        // Match depth to width for rectangular prism shape
        building.scale.z = building.scale.x;

        // Add completed building to scene
        scene.add(building);
    }

    // ========================================================================
    // GROUND PLANE CONSTRUCTION
    // ========================================================================
    // Create massive 2000x2000 unit ground plane (covers entire city area)
    const floorGeometry = new THREE.PlaneGeometry(2000, 2000, 20, 20);
    
    // Create floor material with slight color variation and overdraw enabled
    // to prevent rendering artifacts between plane segments
    const floorMaterial = new THREE.MeshBasicMaterial({
        color: 0x9db3b5,        // Light blue-gray color
        overdraw: true          // Fixes gap rendering issues in overlapping planes
    });

    // Create and position floor mesh
    const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
    // Rotate plane 90 degrees around X-axis to make it horizontal
    floorMesh.rotation.x = -90 * Math.PI / 180;  // Convert degrees to radians
    
    // Add floor to the scene
    scene.add(floorMesh);

    // ========================================================================
    // HELPER FUNCTIONS (assumed to exist elsewhere)
    // ========================================================================
    /**
     * Generates random integer between min-max (inclusive)
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     */
    // function randomNumber(min, max) {
    //     return Math.floor(Math.random() * (max - min + 1)) + min;
    // }
};

export { addCitySceen }