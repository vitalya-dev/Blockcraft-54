class Cube extends DrawableObject {
    constructor(gl, id = 0) {
        super(gl, id);

        this.vertices = new Float32Array([
            -1.0, 1.0, -1.0,
            1.0, 1.0, 1.0,
            1.0, 1.0, -1.0,
            1.0, 1.0, 1.0,
            -1.0, -1.0, 1.0,
            1.0, -1.0, 1.0,
            -1.0, 1.0, 1.0,
            -1.0, -1.0, -1.0,
            -1.0, -1.0, 1.0,
            1.0, -1.0, -1.0,
            -1.0, -1.0, 1.0,
            -1.0, -1.0, -1.0,
            1.0, 1.0, -1.0,
            1.0, -1.0, 1.0,
            1.0, -1.0, -1.0,
            -1.0, 1.0, -1.0,
            1.0, -1.0, -1.0,
            -1.0, -1.0, -1.0,
            -1.0, 1.0, -1.0,
            -1.0, 1.0, 1.0,
            1.0, 1.0, 1.0,
            1.0, 1.0, 1.0,
            -1.0, 1.0, 1.0,
            -1.0, -1.0, 1.0,
            -1.0, 1.0, 1.0,
            -1.0, 1.0, -1.0,
            -1.0, -1.0, -1.0,
            1.0, -1.0, -1.0,
            1.0, -1.0, 1.0,
            -1.0, -1.0, 1.0,
            1.0, 1.0, -1.0,
            1.0, 1.0, 1.0,
            1.0, -1.0, 1.0,
            -1.0, 1.0, -1.0,
            1.0, 1.0, -1.0,
            1.0, -1.0, -1.0
        ]);

        this.normals = new Float32Array([
            -0.0, 1.0, -0.0,
            -0.0, 1.0, -0.0,
            -0.0, 1.0, -0.0,
            -0.0, -0.0, 1.0,
            -0.0, -0.0, 1.0,
            -0.0, -0.0, 1.0,
            -1.0, -0.0, -0.0,
            -1.0, -0.0, -0.0,
            -1.0, -0.0, -0.0,
            -0.0, -1.0, -0.0,
            -0.0, -1.0, -0.0,
            -0.0, -1.0, -0.0,
            1.0, -0.0, -0.0,
            1.0, -0.0, -0.0,
            1.0, -0.0, -0.0,
            -0.0, -0.0, -1.0,
            -0.0, -0.0, -1.0,
            -0.0, -0.0, -1.0,
            -0.0, 1.0, -0.0,
            -0.0, 1.0, -0.0,
            -0.0, 1.0, -0.0,
            -0.0, -0.0, 1.0,
            -0.0, -0.0, 1.0,
            -0.0, -0.0, 1.0,
            -1.0, -0.0, -0.0,
            -1.0, -0.0, -0.0,
            -1.0, -0.0, -0.0,
            -0.0, -1.0, -0.0,
            -0.0, -1.0, -0.0,
            -0.0, -1.0, -0.0,
            1.0, -0.0, -0.0,
            1.0, -0.0, -0.0,
            1.0, -0.0, -0.0,
            -0.0, -0.0, -1.0,
            -0.0, -0.0, -1.0,
            -0.0, -0.0, -1.0
        ]);

        this.color = [132.0 / 256, 36.0 / 256, 12.0 / 256, 1.0];
        this.initBuffers();
    }
}