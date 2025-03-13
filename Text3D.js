import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';

class Text3D extends THREE.Object3D {
    // Static cache for loaded fonts
    static loadedFonts = new Map();
    static loader = new FontLoader();

    // New static method for font loading
    static async loadFont(url) {
        if (this.loadedFonts.has(url)) {
            return this.loadedFonts.get(url);
        }

        return new Promise((resolve, reject) => {
            this.loader.load(url, font => {
                this.loadedFonts.set(url, font);
                resolve(font);
            }, undefined, reject);
        });
    }

    // Updated constructor with async initialization
    constructor(text, options = {}) {
        super();
        
        const defaults = {
            font: null,
            fontURL: null,
            size: 100,
            color: 0x006699,
            lineColor: 0x006699,
            fillOpacity: 0.4
        };

        const settings = { ...defaults, ...options };

        if (!settings.font && !settings.fontURL) {
            console.error('Text3D: Either font or fontURL must be provided');
            return;
        }

        // If font is provided directly, use it
        if (settings.font) {
            this._createTextGeometry(text, settings);
        }
        // If fontURL is provided, load font first
        else {
            Text3D.loadFont(settings.fontURL)
                .then(font => {
                    settings.font = font;
                    this._createTextGeometry(text, settings);
                })
                .catch(error => {
                    console.error('Text3D: Error loading font:', error);
                });
        }
    }

    // Private method to handle geometry creation
    _createTextGeometry(text, settings) {
        // Remove any existing children
        this.clear();

        // Original geometry creation logic from previous implementation
        const shapes = settings.font.generateShapes(text, settings.size);
        const fillGeometry = new THREE.ShapeGeometry(shapes);
        
        // Centering calculation
        fillGeometry.computeBoundingBox();
        const xMid = -0.5 * (fillGeometry.boundingBox.max.x - fillGeometry.boundingBox.min.x);
        fillGeometry.translate(xMid, 0, 0);

        // Create fill mesh
        const fillMaterial = new THREE.MeshBasicMaterial({
            color: settings.color,
            transparent: true,
            opacity: settings.fillOpacity,
            side: THREE.DoubleSide
        });
        const fillMesh = new THREE.Mesh(fillGeometry, fillMaterial);
        this.add(fillMesh);

        // Create outline
        const lineMaterial = new THREE.LineBasicMaterial({
            color: settings.lineColor,
            side: THREE.DoubleSide
        });

        const allShapes = [];
        for (const shape of shapes) {
            allShapes.push(shape);
            if (shape.holes) {
                allShapes.push(...shape.holes);
            }
        }

        for (const shape of allShapes) {
            const points = shape.getPoints();
            const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
            lineGeometry.translate(xMid, 0, 0);
            const line = new THREE.Line(lineGeometry, lineMaterial);
            this.add(line);
        }
    }
}

export { Text3D };