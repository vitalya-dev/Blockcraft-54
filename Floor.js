class Floor extends DrawableObject {
    constructor(gl, id = 0, dimension = 10, lines = 10) {
        super(gl, id);
        
        this.dimension = dimension;  // Size of the grid (e.g., 10x10)
        this.lines = lines;          // Number of lines per axis
        this.wireframe = true;       // Toggle wireframe rendering

        this.generateGrid();
        this.initBuffers();
    }

    generateGrid() {
        const size = this.dimension / 2;  // Half dimension to center the grid
        const step = this.dimension / this.lines;

        let vertices = [];

        // Generate lines parallel to X-axis
        for (let i = -size; i <= size; i += step) {
            vertices.push(-size, 0, i, size, 0, i);
        }

        // Generate lines parallel to Z-axis
        for (let i = -size; i <= size; i += step) {
            vertices.push(i, 0, -size, i, 0, size);
        }

        this.vertices = new Float32Array(vertices);

        // Generate normals (all pointing upwards since it's a flat plane)
        let normals = [];
        for (let i = 0; i < this.vertices.length / 3; i++) {
            normals.push(0, 1, 0);  // Upward normal for all lines
        }
        this.normals = new Float32Array(normals);

        this.color = [0.5, 0.5, 0.5, 1.0]; // Default grid color (gray)
    }
}
