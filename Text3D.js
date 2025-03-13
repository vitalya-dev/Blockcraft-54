import * as THREE from 'three';

class Text3D extends THREE.Object3D {
    constructor(text, options = {}) {
        super();
        
        const defaults = {
            font: null,
            size: 100,
            color: 0x006699,
            lineColor: 0x006699,
            fillOpacity: 0.4,
            bevelEnabled: false,
            curveSegments: 12
        };

        const settings = { ...defaults, ...options };

        if (!settings.font) {
            console.error('Text3D: Font is required');
            return;
        }

        // Generate text shapes
        const shapes = settings.font.generateShapes(text, settings.size);
        const fillGeometry = new THREE.ShapeGeometry(shapes);
        
        // Calculate center offset
        fillGeometry.computeBoundingBox();
        const xMid = -0.5 * (fillGeometry.boundingBox.max.x - fillGeometry.boundingBox.min.x);
        fillGeometry.translate(xMid, 0, 0);

        // Create fill material
        const fillMaterial = new THREE.MeshBasicMaterial({
            color: settings.color,
            transparent: true,
            opacity: settings.fillOpacity,
            side: THREE.DoubleSide
        });

        // Create fill mesh
        const fillMesh = new THREE.Mesh(fillGeometry, fillMaterial);
        this.add(fillMesh);

        // Create line material
        const lineMaterial = new THREE.LineBasicMaterial({
            color: settings.lineColor,
            side: THREE.DoubleSide
        });

        // Collect all shapes including holes
        const allShapes = [];
        for (const shape of shapes) {
            allShapes.push(shape);
            if (shape.holes) {
                for (const hole of shape.holes) {
                    allShapes.push(hole);
                }
            }
        }

        // Create line geometries
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